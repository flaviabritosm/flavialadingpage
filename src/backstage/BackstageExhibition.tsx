import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_PORTFOLIO_ASSETS,
  FLAVIA_BRITO_ASSETS,
  LA_MAISON_ASSETS,
  PORTFOLIO_OPENING_COPY,
  PortfolioAsset,
  PROJECT_FLAVIA_BRITO_COPY,
  PROJECT_LA_MAISON_COPY,
  ProjectEditorialCopy,
} from './backstageData.ts';
import {
  computePhotocardTransform,
  FLAVIA_BRITO_SPREAD_SPECS,
  LA_MAISON_SPREAD_SPECS,
  PhotocardSpec,
  SpreadLayoutKind,
} from './photocardSpread.ts';

import { toOptimizedWebp, warmImageAssets } from '../utils/mediaAssets.ts';

function getAssetById(id: string): PortfolioAsset {
  const found = ALL_PORTFOLIO_ASSETS.find((a) => a.id === id);
  if (!found) {
    throw new Error(`Missing portfolio asset: ${id}`);
  }
  return found;
}

function applyFrameToCardEl(
  el: HTMLElement,
  frame: ReturnType<typeof computePhotocardTransform>,
  progress: number
) {
  el.style.width = `${frame.widthPx}px`;
  el.style.height = `${frame.heightPx}px`;
  el.style.padding = `${frame.rimPx}px`;
  el.style.zIndex = String(frame.zIndex);
  el.style.transform = `translate3d(${frame.translateX.toFixed(1)}px, ${frame.translateY.toFixed(1)}px, 0) rotate(${frame.rotateDeg}deg) scale(${frame.scale})`;
  el.dataset.spreadProgress = progress.toFixed(2);
}

interface PhysicalPhotocardProps {
  asset: PortfolioAsset;
  spec: PhotocardSpec;
  initialProgress: number;
  layout: SpreadLayoutKind;
  stageWidth: number;
  stageHeight: number;
  cardRef: (el: HTMLDivElement | null) => void;
}

/**
 * Physical printed matte photocard with thin warm off-white paper rim,
 * calibrated ambient/contact shadows, subtle corner tilt, and zero cropping/overlays.
 */
const PhysicalPhotocard: React.FC<PhysicalPhotocardProps> = React.memo(
  ({ asset, spec, initialProgress, layout, stageWidth, stageHeight, cardRef }) => {
    const optimizedSrc = useMemo(() => toOptimizedWebp(asset.src), [asset.src]);
    const [imgSrc, setImgSrc] = useState(optimizedSrc);
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
      setImgSrc(optimizedSrc);
      setImgFailed(false);
    }, [optimizedSrc]);

    const frame = useMemo(
      () =>
        computePhotocardTransform(
          spec,
          asset,
          initialProgress,
          layout,
          stageWidth,
          stageHeight
        ),
      [spec, asset, initialProgress, layout, stageWidth, stageHeight]
    );

    const handleError = () => {
      if (imgSrc !== asset.src) {
        setImgSrc(asset.src);
      } else {
        setImgFailed(true);
      }
    };

    return (
      <div
        ref={cardRef}
        data-testid={`photocard-${asset.id}`}
        data-spread-progress={initialProgress.toFixed(2)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${frame.widthPx}px`,
          height: `${frame.heightPx}px`,
          padding: `${frame.rimPx}px`,
          zIndex: frame.zIndex,
          transformOrigin: 'center center',
          transform: `translate3d(${frame.translateX.toFixed(1)}px, ${frame.translateY.toFixed(1)}px, 0) rotate(${frame.rotateDeg}deg) scale(${frame.scale})`,
          willChange: 'transform',
        }}
        className="photocard-matte select-none pointer-events-auto"
      >
        <div className="relative w-full h-full overflow-hidden bg-[#F7F1E9] rounded-[1px]">
          {!imgFailed ? (
            <img
              src={imgSrc}
              alt={asset.alt}
              width={asset.width}
              height={asset.height}
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="sync"
              fetchPriority={asset.priority === 'primary' ? 'high' : 'auto'}
              onError={handleError}
              className="w-full h-full object-contain block pointer-events-none select-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-3 text-center bg-[#F6EAE0] text-black/80">
              <span className="font-ui text-[11px] font-semibold leading-snug">
                {asset.title}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

interface ProjectPhotocardShowcaseProps {
  copy: ProjectEditorialCopy;
  assets: readonly PortfolioAsset[];
  specs: readonly PhotocardSpec[];
  layout: SpreadLayoutKind;
  reducedMotion: boolean;
  stageMinHeightDesktop: number;
  stageHeightMobile: number;
}

const ProjectPhotocardShowcase: React.FC<ProjectPhotocardShowcaseProps> = ({
  copy,
  specs,
  layout,
  reducedMotion,
  stageMinHeightDesktop,
  stageHeightMobile,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardElsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const progressRef = useRef<number>(reducedMotion ? 1 : 0);

  const [stageSize, setStageSize] = useState<{ width: number; height: number }>(
    () =>
      layout === 'mobile'
        ? { width: 350, height: stageHeightMobile }
        : { width: 690, height: stageMinHeightDesktop }
  );
  const stageSizeRef = useRef(stageSize);
  stageSizeRef.current = stageSize;

  const applyAllCardTransforms = (rawProgress: number, activeLayout: SpreadLayoutKind) => {
    const clamped = Math.max(0, Math.min(1, rawProgress));
    progressRef.current = clamped;
    const { width, height } = stageSizeRef.current;

    if (stageRef.current) {
      stageRef.current.dataset.stageProgress = clamped.toFixed(2);
    }

    for (const spec of specs) {
      const cardEl = cardElsRef.current[spec.assetId];
      if (!cardEl) continue;
      const frame = computePhotocardTransform(
        spec,
        getAssetById(spec.assetId),
        clamped,
        activeLayout,
        width,
        height
      );
      applyFrameToCardEl(cardEl, frame, clamped);
    }
  };

  // Measure live stage container dimensions cleanly across resizes/breakpoints
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        setStageSize((prev) =>
          Math.abs(prev.width - rect.width) > 0.5 ||
          Math.abs(prev.height - rect.height) > 0.5
            ? { width: rect.width, height: rect.height }
            : prev
        );
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout, stageMinHeightDesktop, stageHeightMobile]);

  useEffect(() => {
    applyAllCardTransforms(reducedMotion ? 1 : progressRef.current, layout);
  }, [stageSize.width, stageSize.height, layout, reducedMotion]);

  // Synchronize spreading animation strictly with natural scroll progress via GSAP ScrollTrigger (zero React re-renders!)
  useEffect(() => {
    if (reducedMotion) {
      applyAllCardTransforms(1, layout);
      return;
    }

    const triggerEl = stageRef.current;
    if (!triggerEl) return;

    let disposed = false;
    let pollId = 0;
    let trig: { kill: (revert?: boolean) => void; progress?: number } | null =
      null;

    const bind = () => {
      if (disposed) return false;
      const ST = window.ScrollTrigger;
      if (!ST) return false;

      trig = ST.create({
        id: `arquivo-photocards-${copy.id}-${layout}`,
        trigger: triggerEl,
        start: layout === 'mobile' ? 'top 80%' : 'top 76%',
        end: layout === 'mobile' ? 'bottom 88%' : 'bottom 84%',
        scrub: 1.15,
        invalidateOnRefresh: true,
        onUpdate: (self: { progress: number }) =>
          applyAllCardTransforms(self.progress, layout),
        onRefresh: (self: { progress: number }) =>
          applyAllCardTransforms(self.progress, layout),
      });

      if (trig && typeof trig.progress === 'number') {
        applyAllCardTransforms(trig.progress, layout);
      }
      (ST as unknown as { sort?: () => void }).sort?.();
      ST.refresh();
      return true;
    };

    const ensure = () => {
      if (!bind()) {
        pollId = window.setTimeout(ensure, 120);
      }
    };
    ensure();

    return () => {
      disposed = true;
      if (pollId) clearTimeout(pollId);
      if (trig) trig.kill(true);
    };
  }, [copy.id, layout, reducedMotion]);

  const stageHeight =
    layout === 'mobile' ? stageHeightMobile : stageMinHeightDesktop;

  return (
    <article
      ref={containerRef}
      data-testid={`portfolio-project-${copy.id}`}
      aria-label={copy.heading}
      className="relative w-full py-14 sm:py-18 lg:py-24"
    >
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Copy column (~42% on Desktop, 100% first on Mobile): always visible, never fades or clips */}
        <div
          data-testid={`project-copy-${copy.id}`}
          className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col gap-5 sm:gap-6 min-w-0"
        >
          <div className="space-y-2.5 border-b border-black/14 pb-5">
            <h3 className="font-ui text-[12px] sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#FB0C72]">
              {copy.heading}
            </h3>
            <p className="font-body text-[14px] sm:text-[15px] font-medium text-black/72 leading-[1.45]">
              {copy.categoryLine}
            </p>
            <p className="font-body text-[14px] sm:text-[15px] font-medium text-black/72 leading-[1.45]">
              {copy.natureLine}
            </p>
          </div>

          <p className="font-display font-normal uppercase text-[clamp(2rem,3.6vw,3.1rem)] leading-[0.98] tracking-[-0.02em] text-black text-balance">
            {copy.highlight}
          </p>

          <div className="space-y-4 font-body text-[16px] sm:text-[17.5px] leading-[1.64] text-black/88 max-w-[46ch]">
            {copy.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="pt-4 border-t border-black/14">
            <p className="font-body text-[15px] sm:text-[16px] font-semibold leading-[1.55] text-black max-w-[44ch]">
              {copy.roleLine}
            </p>
          </div>
        </div>

        {/* Photocard spread field (~58% on Desktop, vertical composition below copy on Mobile) */}
        <div className="lg:col-span-7 min-w-0">
          <div
            ref={stageRef}
            data-testid={`photocard-stage-${copy.id}`}
            data-stage-progress={(reducedMotion ? 1 : 0).toFixed(2)}
            aria-label={`Composição de photocards — ${copy.heading}`}
            className="relative w-full"
            style={{
              height: `${stageHeight}px`,
            }}
          >
            {specs.map((spec) => {
              const asset = getAssetById(spec.assetId);
              return (
                <PhysicalPhotocard
                  key={spec.assetId}
                  asset={asset}
                  spec={spec}
                  initialProgress={reducedMotion ? 1 : 0}
                  layout={layout}
                  stageWidth={stageSize.width}
                  stageHeight={stageSize.height}
                  cardRef={(el) => {
                    cardElsRef.current[spec.assetId] = el;
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
};

export default function BackstageExhibition() {
  const [layout, setLayout] = useState<SpreadLayoutKind>(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024
      ? 'mobile'
      : 'desktop'
  );

  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const onResize = () => {
      setLayout(window.innerWidth < 1024 ? 'mobile' : 'desktop');
    };
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(mq.matches);

    window.addEventListener('resize', onResize, { passive: true });
    mq.addEventListener('change', onMotionChange);
    return () => {
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', onMotionChange);
    };
  }, []);

  const sectionRootRef = useRef<HTMLDivElement | null>(null);

  // Warm & decode all 15 portfolio WebP images (~970 KB total) right after Hero paint
  // or immediately when the visitor nears Section 05 so cards never render blank during scroll.
  useEffect(() => {
    const orderedUrls = [
      ...ALL_PORTFOLIO_ASSETS.filter((a) => a.priority === 'primary').map((a) =>
        toOptimizedWebp(a.src)
      ),
      ...ALL_PORTFOLIO_ASSETS.filter((a) => a.priority !== 'primary').map((a) =>
        toOptimizedWebp(a.src)
      ),
    ];

    const warmNow = () => {
      warmImageAssets(orderedUrls);
    };

    const el = sectionRootRef.current;
    const io =
      el && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                warmNow();
                io?.disconnect();
              }
            },
            { rootMargin: '2500px 0px' }
          )
        : null;
    if (io && el) io.observe(el);

    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | null = null;
    let timerId: number | null = null;

    if (typeof w.requestIdleCallback === 'function') {
      idleId = w.requestIdleCallback(warmNow, { timeout: 450 });
    } else {
      timerId = window.setTimeout(warmNow, 180);
    }

    return () => {
      io?.disconnect();
      if (idleId !== null && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRootRef}
      data-section="arquivo-criativo"
      className="relative w-full bg-[#FFF9F4] text-black overflow-x-clip"
    >
      {/* Subtle Flavia Brito editorial grid whisper in the archival paper background */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0, 0, 0, 0.7) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* MOMENT 1: ABERTURA EDITORIAL */}
      <header className="relative z-10 max-w-[1060px] mx-auto px-5 sm:px-8 lg:px-12 pt-20 sm:pt-28 lg:pt-32 pb-10 sm:pb-16 text-center">
        <p className="font-ui text-[12px] sm:text-[13px] font-bold tracking-[0.18em] uppercase text-[#FB0C72] mb-5 sm:mb-6">
          {PORTFOLIO_OPENING_COPY.eyebrow}
        </p>

        <h2 className="font-display font-normal uppercase text-[clamp(2.55rem,6vw,5.25rem)] leading-[0.95] tracking-[-0.025em] text-black text-balance mx-auto">
          {PORTFOLIO_OPENING_COPY.headlinePrefix}{' '}
          <span className="font-handwritten font-bold normal-case text-[#FB0C72] text-[clamp(3.1rem,7.2vw,6.25rem)] leading-[0.88] inline-block -rotate-1 px-0.5">
            {PORTFOLIO_OPENING_COPY.headlineAccent}
          </span>{' '}
          {PORTFOLIO_OPENING_COPY.headlineSuffix}
        </h2>

        <p className="mt-6 sm:mt-8 font-body text-[17px] sm:text-[20px] font-medium leading-[1.6] text-black/80 max-w-[54ch] mx-auto">
          {PORTFOLIO_OPENING_COPY.supportText}
        </p>
      </header>

      {/* MOMENT 2: PROJETO 01 — LA MAISON SHOP */}
      <div className="relative z-10 border-t border-black/10">
        <ProjectPhotocardShowcase
          copy={PROJECT_LA_MAISON_COPY}
          assets={LA_MAISON_ASSETS}
          specs={LA_MAISON_SPREAD_SPECS}
          layout={layout}
          reducedMotion={reducedMotion}
          stageMinHeightDesktop={740}
          stageHeightMobile={760}
        />
      </div>

      {/* MOMENT 3: PROJETO 02 — FLAVIA BRITO */}
      <div className="relative z-10 border-t border-black/12">
        <ProjectPhotocardShowcase
          copy={PROJECT_FLAVIA_BRITO_COPY}
          assets={FLAVIA_BRITO_ASSETS}
          specs={FLAVIA_BRITO_SPREAD_SPECS}
          layout={layout}
          reducedMotion={reducedMotion}
          stageMinHeightDesktop={880}
          stageHeightMobile={1120}
        />
      </div>

      {/* MOMENT 4: CLEAN EDITORIAL BREATHING ROOM FLOWING NATURALLY INTO SECTION 06 */}
      <div aria-hidden="true" className="relative z-10 h-10 sm:h-16 lg:h-20" />
    </div>
  );
}
