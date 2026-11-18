import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DELIVERABLES_HEADING,
  DELIVERABLES_SERVICES,
  DeliverableService,
} from './deliverablesData.ts';
import { EditorialPortrait } from './EditorialPortrait.tsx';
import { PHOTO_TORN_ASSETS } from './paperAssets.ts';
import {
  buildTornHorizonPath,
  computePortraitTearGeometry,
  computeTearGeometry,
  LayoutKind,
} from './paperTearMath.ts';
import {
  PaperMaterialDefs,
  PaperTearOverlay,
  TearRevealedArtwork,
} from './TearCompositions.tsx';

function getLayoutKind(width: number): LayoutKind {
  return width < 768 ? 'mobile' : 'desktop';
}

interface TearRegionProps {
  service: DeliverableService;
  index: number;
  layout: LayoutKind;
  reducedMotion: boolean;
}

const PaperTearRegion: React.FC<TearRegionProps> = ({
  service,
  index,
  layout,
  reducedMotion,
}) => {
  const regionRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(() => (reducedMotion ? 1 : 0));
  const lastBucketRef = useRef<number>(reducedMotion ? 120 : -1);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      lastBucketRef.current = 120;
      return;
    }

    const el = regionRef.current;
    if (!el) return;

    let disposed = false;
    let pollId = 0;
    let trig: { kill: (revert?: boolean) => void; progress?: number } | null = null;

    const syncFromProgress = (p: number) => {
      const bucket = Math.round(p * 120);
      if (bucket !== lastBucketRef.current) {
        lastBucketRef.current = bucket;
        setProgress(p);
      }
    };

    const bind = () => {
      if (disposed) return false;
      const ST = window.ScrollTrigger;
      if (!ST) return false;

      trig = ST.create({
        id: `rasgando-tear-${service.id}`,
        trigger: el,
        start: layout === 'mobile' ? 'top 90%' : 'top 88%',
        end: layout === 'mobile' ? 'top 36%' : 'top 32%',
        scrub: true,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: (self: { progress: number }) => syncFromProgress(self.progress),
        onRefresh: (self: { progress: number }) => syncFromProgress(self.progress),
      });

      if (trig && typeof trig.progress === 'number') {
        syncFromProgress(trig.progress);
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
  }, [service.id, layout, reducedMotion]);

  const geometry = useMemo(
    () => computeTearGeometry(service.tearMode, progress, layout),
    [service.tearMode, progress, layout]
  );

  // Lateral, diagonal, horizontal, and broad corner peel tears break full-bleed across the paper poster width
  const isFullBleed =
    service.tearMode === 'lateral-peel' ||
    service.tearMode === 'diagonal-rip' ||
    service.tearMode === 'horizontal-split' ||
    service.tearMode === 'broad-peel';

  return (
    <article
      ref={regionRef}
      data-testid={`tear-region-${service.id}`}
      data-tear-index={index}
      data-tear-mode={service.tearMode}
      data-tear-progress={progress.toFixed(2)}
      aria-label={service.title}
      className={`relative w-full min-h-[560px] sm:min-h-[620px] md:min-h-[660px] lg:min-h-[700px] flex items-stretch overflow-hidden ${
        isFullBleed ? '' : 'max-w-[1440px] mx-auto px-0 sm:px-4 lg:px-8'
      }`}
    >
      {/* Revealed underlying editorial composition inside exact torn cavity */}
      <div
        className="relative z-10 w-full flex items-stretch"
        style={{ clipPath: geometry.revealClipPolygon }}
      >
        <TearRevealedArtwork
          service={service}
          geometry={geometry}
          svgUid={service.id}
        />
      </div>

      {/* Physical matte #FFF9F4 top paper layer with uneven pulp fibers & outward curled fold flap */}
      <PaperTearOverlay geometry={geometry} svgUid={service.id} />
    </article>
  );
};

export default function DeliverablesEditorial() {
  const [layout, setLayout] = useState<LayoutKind>(() =>
    typeof window !== 'undefined' ? getLayoutKind(window.innerWidth) : 'desktop'
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const onResize = () => setLayout(getLayoutKind(window.innerWidth));
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(mq.matches);

    window.addEventListener('resize', onResize, { passive: true });
    mq.addEventListener('change', onMotionChange);
    return () => {
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', onMotionChange);
    };
  }, []);

  const portraitFrameRef = useRef<HTMLDivElement | null>(null);
  const [portraitProgress, setPortraitProgress] = useState<number>(() =>
    reducedMotion ? 1 : 0
  );
  const lastPortraitBucketRef = useRef<number>(reducedMotion ? 120 : -1);

  useEffect(() => {
    if (reducedMotion) {
      setPortraitProgress(1);
      lastPortraitBucketRef.current = 120;
      return;
    }

    const el = portraitFrameRef.current;
    if (!el) return;

    let disposed = false;
    let pollId = 0;
    let trig: { kill: (revert?: boolean) => void; progress?: number } | null = null;

    const syncPortrait = (p: number) => {
      const bucket = Math.round(p * 120);
      if (bucket !== lastPortraitBucketRef.current) {
        lastPortraitBucketRef.current = bucket;
        setPortraitProgress(p);
      }
    };

    const bind = () => {
      if (disposed) return false;
      const ST = window.ScrollTrigger;
      if (!ST) return false;

      trig = ST.create({
        id: 'rasgando-portrait',
        trigger: el,
        start: layout === 'mobile' ? 'top 95%' : 'top 94%',
        end: layout === 'mobile' ? 'top 42%' : 'top 38%',
        scrub: true,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onUpdate: (self: { progress: number }) => syncPortrait(self.progress),
        onRefresh: (self: { progress: number }) => syncPortrait(self.progress),
      });

      if (trig && typeof trig.progress === 'number') {
        syncPortrait(trig.progress);
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
  }, [layout, reducedMotion]);

  const portraitGeometry = useMemo(
    () => computePortraitTearGeometry(portraitProgress, layout),
    [portraitProgress, layout]
  );

  const horizonPaths = useMemo(
    () => ({
      pastel: buildTornHorizonPath(1440, 140, 22, 12, 2.4, 84),
      aqua: buildTornHorizonPath(1440, 140, 48, 11, 5.1, 84),
      pink: buildTornHorizonPath(1440, 140, 76, 10, 8.7, 84),
      cream: buildTornHorizonPath(1440, 140, 104, 9, 13.3, 84),
    }),
    []
  );

  return (
    <div
      data-section="rasgando-superficie"
      className="relative w-full bg-[#FFF9F4] text-black overflow-x-clip"
    >
      <PaperMaterialDefs />

      {/* Unified matte cotton paper tooth spanning entire #FFF9F4 poster */}
      <div
        aria-hidden="true"
        className="cotton-paper-tooth pointer-events-none select-none absolute inset-0 z-30 mix-blend-multiply opacity-[0.16]"
      />

      {/* ================================================================
          OPENING: Asymmetric Editorial Poster Spread + Torn Paper Portrait Reveal
         ================================================================ */}
      <header className="relative z-10 max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 pt-16 sm:pt-24 lg:pt-28 pb-5 sm:pb-7 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Typographic Poster Statement */}
          <div className="lg:col-span-7">
            <h2 className="font-display font-normal uppercase text-[clamp(3rem,6.6vw,6.25rem)] leading-[0.91] tracking-[-0.028em] text-balance">
              <span className="block text-black">{DELIVERABLES_HEADING.lead}</span>
              <span className="block text-[#FB0C72]">{DELIVERABLES_HEADING.accent}</span>
            </h2>
          </div>

          {/* Unaltered Portrait revealed organically through a scroll-driven torn #FFF9F4 cavity */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div
              ref={portraitFrameRef}
              data-testid="portrait-tear-region"
              data-tear-progress={portraitProgress.toFixed(2)}
              className="relative w-full max-w-[390px] sm:max-w-[460px] lg:max-w-[500px] aspect-[3/4] overflow-hidden"
            >
              {/* Fixed photo clipped cleanly inside organic 4-sided torn cavity (zero straight edges, zero zoom/pan) */}
              <div
                className="relative z-10 w-full h-full"
                style={{
                  clipPath: portraitGeometry.revealClipPolygon,
                  opacity: portraitGeometry.contentOpacity,
                }}
              >
                <EditorialPortrait className="w-full h-full" />
              </div>

              {/* Matte #FFF9F4 torn paper overlay matching Section 04's exact photographic deckle seams */}
              <PaperTearOverlay geometry={portraitGeometry} svgUid="portrait" />
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================
          CONTINUOUS POSTER FIELD: 5 Scroll-Driven Paper Tears
          Mix of inset asymmetric rips & edge-to-edge full-bleed poster tears
         ================================================================ */}
      <div className="relative z-10 w-full space-y-2 sm:space-y-3 lg:space-y-4">
        {DELIVERABLES_SERVICES.map((service, idx) => (
          <PaperTearRegion
            key={service.id}
            service={service}
            index={idx}
            layout={layout}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* ================================================================
          PANORAMIC MULTI-LAYER CLOSING: Stacked torn paper strata into Section 05
         ================================================================ */}
      <div
        aria-hidden="true"
        className="relative z-10 w-full mt-3 sm:mt-4 overflow-hidden"
      >
        <div className="relative w-full h-[92px] sm:h-[128px]">
          <svg
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
            className="w-full h-full block"
            style={{ filter: 'drop-shadow(0 -1.5px 2px rgba(28, 13, 20, 0.11))' }}
          >
            <path d={horizonPaths.pastel} fill="#F2BED6" />
            <path d={horizonPaths.aqua} fill="#A5DCD1" />
            <path d={horizonPaths.pink} fill="#FB0C72" fillOpacity="0.94" />
            <path d={horizonPaths.cream} fill="#FFF9F4" />
          </svg>
          {/* Matte cotton paper tooth unifying closing horizon strata */}
          <div
            aria-hidden="true"
            className="cotton-paper-tooth pointer-events-none select-none absolute inset-0 mix-blend-multiply opacity-[0.18]"
          />
          {/* Real studio-photographed torn cotton rim meeting Section 05 cleanly */}
          <img
            src={PHOTO_TORN_ASSETS.horizontalSubtle}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="pointer-events-none select-none absolute left-0 bottom-[-14px] w-full h-[58px] sm:h-[72px] object-cover object-bottom max-w-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 42%, black 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 42%, black 100%)',
              transform: 'scaleY(-1)',
              filter: 'url(#photo-torn-key) drop-shadow(0 -1px 2px rgba(24,10,16,0.10))',
            }}
          />
        </div>
      </div>
    </div>
  );
}
