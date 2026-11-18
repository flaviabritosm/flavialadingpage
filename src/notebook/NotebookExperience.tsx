import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  COVER_DATA,
  NotebookViewState,
  PageSide,
  SPREADS_DATA,
  SPREAD_SCROLL_ANCHORS,
  computeCameraPose,
  computeSpreadKinematics,
  getMobileFocusSide,
  getMobileFocusX,
} from './types.ts';
import { LoadedEditorialAssets, loadEditorialAssets } from './textures.ts';
import { NotebookRig, buildNotebookRig } from './meshBuilder.ts';

declare global {
  interface Window {
    gsap?: {
      to: (target: object, vars: Record<string, unknown>) => { kill: () => void };
      timeline: (vars?: Record<string, unknown>) => unknown;
    };
    ScrollTrigger?: {
      create: (vars: Record<string, unknown>) => {
        start: number;
        end: number;
        kill: (revert?: boolean) => void;
      };
      refresh: (safe?: boolean) => void;
    };
  }
}

export default function NotebookExperience() {
  const sectionHostRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);

  const [viewState, setViewState] = useState<NotebookViewState>('open');
  const [activeSpread, setActiveSpread] = useState<number>(0);
  const [scrollClosed, setScrollClosed] = useState<boolean>(true);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Live simulation state shared cleanly with Three.js render-on-demand loop
  const simRef = useRef({
    viewState: 'open' as NotebookViewState,
    openProgress: 0, // 0 = closed presentation, 1 = open editorial spread
    coverTurn: 0, // 0 = cover shut, 1 = cover hinged open 180 deg
    targetScrollProgress: 0,
    currentScrollProgress: 0,
    mobileSide: 'left' as PageSide,
    manualMobileSide: null as PageSide | null,
    width: 1200,
    height: 760,
    needsRender: true,
    rafId: 0 as number,
    timerId: 0 as number,
    animStartTime: 0,
    animDuration: 1500,
    closeStartScroll: 0,
    isSoftwareGl: false,
  });

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rig: NotebookRig;
    assets: LoadedEditorialAssets;
    pmrem: THREE.PMREMGenerator;
    envRT: THREE.WebGLRenderTarget;
  } | null>(null);

  const triggerRef = useRef<{
    start: number;
    end: number;
    kill: (revert?: boolean) => void;
  } | null>(null);

  const requestRenderRef = useRef<() => void>(() => {});

  // Attach ScrollTrigger pin on mount so mouse scroll smoothly opens cover, flips all 5 spreads, and closes cover
  const attachScrollTrigger = useCallback(() => {
    const sec = document.getElementById('loop');
    const ST = window.ScrollTrigger;
    if (!sec || !ST) return false;

    if (triggerRef.current) {
      triggerRef.current.kill(true);
      triggerRef.current = null;
    }

    const mob = window.innerWidth <= 767;
    const trig = ST.create({
      id: 'loop-notebook',
      trigger: sec,
      start: 'top top',
      end: mob ? '+=880%' : '+=680%',
      pin: true,
      scrub: mob ? 0.75 : 0.8,
      anticipatePin: 1,
      refreshPriority: 2,
      invalidateOnRefresh: true,
      onUpdate: (self: { progress: number }) => {
        simRef.current.manualMobileSide = null;
        simRef.current.targetScrollProgress = self.progress;
        requestRenderRef.current();
      },
    });
    triggerRef.current = trig;
    (ST as { sort?: () => void }).sort?.();
    ST.refresh();
    return true;
  }, []);

  useEffect(() => {
    if (reducedMotion || webglUnavailable) return;
    let pollId = 0;
    let cancelled = false;
    const ensureTrigger = () => {
      if (cancelled) return;
      if (!attachScrollTrigger()) {
        pollId = window.setTimeout(ensureTrigger, 120);
      }
    };
    ensureTrigger();
    return () => {
      cancelled = true;
      if (pollId) clearTimeout(pollId);
    };
  }, [attachScrollTrigger, reducedMotion, webglUnavailable]);

  // Keep viewState mirrored inside simRef
  useEffect(() => {
    simRef.current.viewState = viewState;
    requestRenderRef.current();
  }, [viewState]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
    };
  }, []);

  // Initialize Three.js Studio Scene (skip heavy WebGL loop if reducedMotion is preferred)
  useEffect(() => {
    if (reducedMotion) return;
    const host = canvasHostRef.current;
    if (!host) return;

    let disposed = false;
    // Probe software WebGL rasterizer up front so only ONE WebGL context is created
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        const rendererStr = dbg
          ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
          : String(gl.getParameter(gl.RENDERER));
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch {
      isSoftwareGl = false;
    }
    simRef.current.isSoftwareGl = isSoftwareGl;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: isSoftwareGl ? 'default' : 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const w = Math.max(300, host.clientWidth || window.innerWidth);
    const h = Math.max(320, host.clientHeight || window.innerHeight);
    simRef.current.width = w;
    simRef.current.height = h;
    renderer.setSize(w, h);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio IBL Environment calibrated for metallic wire-o rings (paper uses envMapIntensity=0.0)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    envScene.dispose();

    // Calibrated Warm/Cool Editorial Studio Lighting preserving rich paper & ink contrast without highlight blowout
    const hemi = new THREE.HemisphereLight(0xfffaf6, 0xddd0c8, 0.44);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 0.62);
    keyLight.position.set(3.2, 6.2, 3.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3.4;
    keyLight.shadow.camera.right = 3.4;
    keyLight.shadow.camera.top = 3.4;
    keyLight.shadow.camera.bottom = -3.4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffeaf3, 0.12);
    rimLight.position.set(-3.5, 4.0, -3.2);
    scene.add(rimLight);

    // Subtle real shadow receiver floor (when GPU shadow maps active)
    const floorGeo = new THREE.PlaneGeometry(18, 14);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.106;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const camera = new THREE.PerspectiveCamera(w <= 767 ? 38 : 34, w / h, 0.1, 40);
    const initAssets: LoadedEditorialAssets = {
      flaviaPhoto: null,
      laMaisonPhoto: null,
      logoMark: null,
      campaignPhoto1: null,
      campaignPhoto2: null,
      monogramLogo: null,
      igFeedPhoto: null,
      coverElements: {
        washiXadrez: null,
        clipeRosa: null,
        codigoBarras: null,
        coracao: null,
        coroa: null,
        estrelaPrata: null,
        etiquetaIdentidade: null,
        etiquetaSubtitulo: null,
        flor: null,
        fotoNuvens: null,
        nomeFlavia: null,
        papelMetalizado: null,
        papelRosaForte: null,
        papelRosaPastel: null,
        papelVerdeAgua: null,
        tituloCreativeProcess: null,
      },
    };
    const maxAniso = isSoftwareGl ? 1 : Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const rig = buildNotebookRig(maxAniso, initAssets, isSoftwareGl);
    scene.add(rig.root);

    threeRef.current = {
      renderer,
      scene,
      camera,
      rig,
      assets: initAssets,
      pmrem,
      envRT,
    };

    const camTarget = new THREE.Vector3();
    let lastUiSpread = 0;
    let lastScrollClosed = true;

    const renderStep = () => {
      if (disposed || !threeRef.current) return;
      const sim = simRef.current;
      sim.rafId = 0;

      // 1. Progress open / close hinge transitions inside this unified loop
      if (sim.viewState === 'opening') {
        const raw = Math.min(1, (performance.now() - sim.animStartTime) / sim.animDuration);
        const ease = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
        sim.openProgress = ease;
        const coverRaw = Math.max(0, Math.min(1, (raw - 0.10) / 0.86));
        sim.coverTurn =
          coverRaw < 0.5 ? 2 * coverRaw * coverRaw : 1 - Math.pow(-2 * coverRaw + 2, 2) / 2;

        if (raw >= 1) {
          const openAnchor = SPREAD_SCROLL_ANCHORS[0];
          sim.openProgress = 1;
          sim.coverTurn = 1;
          sim.targetScrollProgress = openAnchor;
          sim.currentScrollProgress = openAnchor;
          sim.viewState = 'open';
          setViewState('open');
          setScrollClosed(false);
          lastScrollClosed = false;
          setActiveSpread(0);
          attachScrollTrigger();
        }
      } else if (sim.viewState === 'closing') {
        const raw = Math.min(1, (performance.now() - sim.animStartTime) / sim.animDuration);
        const ease = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        sim.targetScrollProgress = sim.closeStartScroll * (1 - ease);
        sim.currentScrollProgress = sim.closeStartScroll * (1 - ease);
        sim.coverTurn = 1 - ease;
        sim.openProgress = 1 - ease;

        if (raw >= 1) {
          sim.targetScrollProgress = 0;
          sim.currentScrollProgress = 0;
          sim.coverTurn = 0;
          sim.openProgress = 0;
          sim.viewState = 'closed';
          setViewState('closed');
          setScrollClosed(false);
          lastScrollClosed = false;
          setActiveSpread(0);
        }
      }

      // 2. Smooth damping strictly for scroll-scrubbing
      const sDiff = sim.targetScrollProgress - sim.currentScrollProgress;
      if (Math.abs(sDiff) > 0.00025) {
        sim.currentScrollProgress += sDiff * (isSoftwareGl ? 0.35 : 0.16);
      } else {
        sim.currentScrollProgress = sim.targetScrollProgress;
      }

      const isOpenActive = sim.viewState === 'open';
      const kin = computeSpreadKinematics(sim.currentScrollProgress);

      // When open, mouse scroll drives opening from top and page turns smoothly through Spread 04
      const openT = isOpenActive ? kin.openFactor : sim.openProgress;
      const coverT = isOpenActive ? kin.coverTurn : sim.coverTurn;
      rig.updateCoverTurn(coverT);

      // Subtle sculptural presentation angle when closed that settles square when open
      rig.root.position.y = 0;
      rig.root.rotation.y = (1 - openT) * 0.24;
      rig.root.rotation.x = (1 - openT) * 0.03;

      for (let i = 0; i < 3; i++) {
        rig.updateSheetTurn(i, kin.sheetTurns[i]);
      }
      rig.updateStacks(kin.leftStackRatio, kin.rightStackRatio, coverT, kin.sheetTurns);

      // Strictly scroll-coordinated internal spread animations across active & turning spreads
      if (isOpenActive) {
        const sIdx = kin.activeSpread;
        rig.updateSpreadAnimTexture(sIdx, kin.spreadAnim[sIdx], threeRef.current.assets);
        for (let i = 0; i < 3; i++) {
          if (kin.sheetTurns[i] > 0.005 && kin.sheetTurns[i] < 0.995) {
            rig.updateSpreadAnimTexture(i, kin.spreadAnim[i], threeRef.current.assets);
            rig.updateSpreadAnimTexture(i + 1, kin.spreadAnim[i + 1], threeRef.current.assets);
          }
        }
        const nowClosedByScroll = kin.openFactor < 0.08;
        if (nowClosedByScroll !== lastScrollClosed) {
          lastScrollClosed = nowClosedByScroll;
          setScrollClosed(nowClosedByScroll);
        }
      }

      // Sync spread telemetry attribute only when discrete spread changes
      if (kin.activeSpread !== lastUiSpread) {
        lastUiSpread = kin.activeSpread;
        setActiveSpread(kin.activeSpread);
      }

      const autoMob = getMobileFocusSide(sim.currentScrollProgress);
      const effectiveMobSide = sim.manualMobileSide ?? autoMob.side;
      sim.mobileSide = effectiveMobSide;
      const mobileFocusX =
        sim.width <= 767
          ? sim.manualMobileSide
            ? sim.manualMobileSide === 'left'
              ? -1.075
              : 1.075
            : getMobileFocusX(sim.currentScrollProgress)
          : undefined;

      // Camera pose update (zero autonomous pointer hover tilt)
      const pose = computeCameraPose({
        width: sim.width,
        height: sim.height,
        openProgress: openT,
        mobileSide: effectiveMobSide,
        mobileFocusX,
      });

      if (Math.abs(camera.fov - pose.fov) > 0.05) {
        camera.fov = pose.fov;
        camera.updateProjectionMatrix();
      }
      camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
      camTarget.set(pose.target[0], pose.target[1], pose.target[2]);
      camera.lookAt(camTarget);

      renderer.render(scene, camera);

      const remainingDiff = Math.abs(sim.targetScrollProgress - sim.currentScrollProgress);
      const keepAnimating =
        sim.viewState === 'opening' ||
        sim.viewState === 'closing' ||
        remainingDiff > 0.00025;

      if (keepAnimating && !disposed) {
        if (isSoftwareGl) {
          if (!sim.timerId) {
            sim.timerId = window.setTimeout(() => {
              sim.timerId = 0;
              if (!disposed && !sim.rafId) {
                sim.rafId = requestAnimationFrame(renderStep);
              }
            }, 48);
          }
        } else {
          sim.rafId = requestAnimationFrame(renderStep);
        }
      }
    };

    const requestRender = () => {
      if (disposed) return;
      const sim = simRef.current;
      if (!sim.rafId && !sim.timerId) {
        sim.rafId = requestAnimationFrame(renderStep);
      }
    };
    requestRenderRef.current = requestRender;

    // ResizeObserver keeps aspect & canvas crisp on orientation/split changes
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || disposed) return;
      const nw = Math.max(300, Math.round(rect.width));
      const nh = Math.max(320, Math.round(rect.height));
      simRef.current.width = nw;
      simRef.current.height = nh;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      requestRender();
    });
    ro.observe(host);

    // Defer notebook photo & sticker loading slightly so Hero video/first paint has zero contention
    let assetsStarted = false;
    let idleTimerId = 0;
    const startAssetLoad = () => {
      if (assetsStarted || disposed) return;
      assetsStarted = true;
      assetIo.disconnect();
      if (idleTimerId) {
        clearTimeout(idleTimerId);
        idleTimerId = 0;
      }
      loadEditorialAssets().then((loaded) => {
        if (disposed || !threeRef.current) return;
        threeRef.current.assets = loaded;
        rig.repaintAllStatic(loaded);
        requestRender();
      });
    };

    const assetIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startAssetLoad();
        }
      },
      { rootMargin: '1600px 0px' }
    );
    assetIo.observe(host);
    idleTimerId = window.setTimeout(startAssetLoad, 450);

    // Initial render
    requestRender();

    return () => {
      disposed = true;
      assetIo.disconnect();
      if (idleTimerId) clearTimeout(idleTimerId);
      ro.disconnect();
      if (simRef.current.rafId) {
        cancelAnimationFrame(simRef.current.rafId);
        simRef.current.rafId = 0;
      }
      if (simRef.current.timerId) {
        clearTimeout(simRef.current.timerId);
        simRef.current.timerId = 0;
      }
      if (triggerRef.current) {
        triggerRef.current.kill(true);
        triggerRef.current = null;
      }
      floorGeo.dispose();
      floorMat.dispose();
      rig.disposables.forEach((d) => d.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      threeRef.current = null;
    };
  }, [reducedMotion]);

  const handleOpenNotebook = useCallback(() => {
    if (reducedMotion || webglUnavailable) {
      setViewState('open');
      setActiveSpread(0);
      return;
    }

    // If user closed the notebook via mouse scroll at the edges, jump scroll back to Spread 01
    if (simRef.current.viewState === 'open') {
      const trig = triggerRef.current;
      if (trig && trig.end > trig.start) {
        const anchor = SPREAD_SCROLL_ANCHORS[0];
        const y = Math.round(trig.start + (trig.end - trig.start) * anchor);
        window.scrollTo({ top: y, behavior: simRef.current.isSoftwareGl ? 'auto' : 'smooth' });
        simRef.current.targetScrollProgress = anchor;
        setScrollClosed(false);
        requestRenderRef.current();
      }
      return;
    }

    if (simRef.current.viewState !== 'closed') return;

    // Snap section cleanly to top of viewport immediately so ScrollTrigger pin aligns with 0 offset
    const sec = document.getElementById('loop');
    if (sec) {
      const top = Math.round(sec.getBoundingClientRect().top + window.scrollY);
      if (Math.abs(window.scrollY - top) > 2) {
        window.scrollTo({ top, behavior: 'auto' });
      }
    }

    simRef.current.viewState = 'opening';
    simRef.current.targetScrollProgress = 0;
    simRef.current.currentScrollProgress = 0;
    simRef.current.manualMobileSide = 'left';
    simRef.current.animStartTime = performance.now();
    simRef.current.animDuration = simRef.current.isSoftwareGl ? 650 : 1550;
    setViewState('opening');
    setScrollClosed(false);
    requestRenderRef.current();
  }, [reducedMotion, webglUnavailable]);

  const handleCloseNotebook = useCallback(() => {
    if (simRef.current.viewState !== 'open') return;

    if (reducedMotion || webglUnavailable) {
      setViewState('closed');
      return;
    }

    // Unpin ScrollTrigger cleanly first and keep user at #loop top
    const sec = document.getElementById('loop');
    if (triggerRef.current) {
      triggerRef.current.kill(true);
      triggerRef.current = null;
      window.ScrollTrigger?.refresh();
    }
    if (sec) {
      const top = Math.round(sec.getBoundingClientRect().top + window.scrollY);
      window.scrollTo({ top, behavior: 'auto' });
    }

    simRef.current.viewState = 'closing';
    simRef.current.closeStartScroll = simRef.current.currentScrollProgress;
    simRef.current.animStartTime = performance.now();
    simRef.current.animDuration = simRef.current.isSoftwareGl ? 450 : 900;
    setViewState('closing');
    requestRenderRef.current();
  }, [reducedMotion, webglUnavailable]);

  // Fallback accessible interactive scrapbook view (for reduced-motion or WebGL-unavailable only)
  if (reducedMotion || webglUnavailable) {
    const cur = SPREADS_DATA[activeSpread];
    return (
      <div className="nb-fallback" ref={sectionHostRef}>
        <div className="nb-fallback-card">
          <div className="nb-fallback-header">
            <span className="nb-fallback-eyebrow">{COVER_DATA.brand} · {COVER_DATA.subtitle}</span>
            {viewState === 'open' && (
              <button
                type="button"
                className="nb-ctrl-btn"
                onClick={handleCloseNotebook}
              >
                <X size={16} /> Fechar caderno
              </button>
            )}
          </div>

          {viewState !== 'open' ? (
            <div className="nb-fallback-cover">
              <p className="nb-fallback-brand">{COVER_DATA.brand}</p>
              <h2 className="nb-fallback-title">{COVER_DATA.title}</h2>
              <p className="nb-fallback-sub">{COVER_DATA.subtitle}</p>
              <button
                type="button"
                className="nb-open-btn"
                onClick={handleOpenNotebook}
              >
                <BookOpen size={18} />
                <span>ABRIR CADERNO</span>
              </button>
            </div>
          ) : (
            <div className="nb-fallback-spread">
              <div className="nb-fallback-page">
                <span className="nb-fallback-eyebrow">{cur.eyebrow}</span>
                <h3 className="nb-fallback-page-title">{cur.title}</h3>
                {cur.leftCopy.map((line, idx) => (
                  <p key={idx} className="nb-fallback-copy">{line}</p>
                ))}
              </div>
              <div className="nb-fallback-page nb-fallback-page--right">
                {cur.rightCopy.map((line, idx) => (
                  <p key={idx} className="nb-fallback-copy">{line}</p>
                ))}
              </div>
              <div className="nb-fallback-nav">
                <button
                  type="button"
                  className="nb-ctrl-btn"
                  disabled={activeSpread === 0}
                  onClick={() => setActiveSpread((s) => Math.max(0, s - 1))}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="nb-page-counter">0{activeSpread + 1} / 04</span>
                <button
                  type="button"
                  className="nb-ctrl-btn"
                  disabled={activeSpread === 3}
                  onClick={() => setActiveSpread((s) => Math.min(3, s + 1))}
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sectionHostRef}
      className="nb-stage"
      data-view-state={scrollClosed ? 'closed' : viewState}
      data-spread={activeSpread + 1}
    >
      {/* WebGL Studio Canvas (Isolated Empty Container; scroll opens/flips/closes smoothly) */}
      <div
        ref={canvasHostRef}
        className="nb-canvas-host"
        data-testid="notebook-canvas-host"
        aria-hidden="true"
        onClick={() => {
          if (simRef.current.currentScrollProgress < 0.08 && triggerRef.current) {
            const trig = triggerRef.current;
            if (trig.end > trig.start) {
              const y = Math.round(trig.start + (trig.end - trig.start) * SPREAD_SCROLL_ANCHORS[0]);
              window.scrollTo({ top: y, behavior: simRef.current.isSoftwareGl ? 'auto' : 'smooth' });
            }
          }
        }}
      />

      {/* Semantic Accessible Copy Mirror for Screen Readers */}
      <div className="sr-only" aria-label="Conteúdo completo do Caderno de Direção">
        <h2>{COVER_DATA.brand} — {COVER_DATA.title} — {COVER_DATA.subtitle}</h2>
        {SPREADS_DATA.map((spread) => (
          <article key={spread.id}>
            <h3>{spread.eyebrow} — {spread.title}</h3>
            {spread.leftCopy.map((p, i) => (
              <p key={`l-${i}`}>{p}</p>
            ))}
            {spread.rightCopy.map((p, i) => (
              <p key={`r-${i}`}>{p}</p>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
