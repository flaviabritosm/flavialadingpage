import React from 'react';
import {
  BRAND_PALETTE_SWATCHES,
  DeliverableService,
  SECTION_ASSETS,
} from './deliverablesData.ts';
import { PHOTO_TORN_ASSETS } from './paperAssets.ts';
import type { TearGeometryState } from './paperTearMath.ts';
import { toOptimizedWebp } from '../utils/mediaAssets.ts';

interface PaperTearFrameProps {
  service: DeliverableService;
  geometry: TearGeometryState;
  svgUid: string;
}

/**
 * Shared SVG filter & matte cotton tooth definitions rendered once in Section 04.
 * Converts pitch-black studio paper edge backgrounds cleanly to alpha transparency
 * while matching the cotton body seamlessly to #FFF9F4 with genuine tactile tooth.
 */
export const PaperMaterialDefs: React.FC = () => (
  <svg
    aria-hidden="true"
    width="0"
    height="0"
    className="absolute pointer-events-none overflow-hidden"
  >
    <defs>
      {/* Luminance-to-alpha keyer for studio-photographed black-backed torn cotton paper */}
      <filter id="photo-torn-key" colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="
            0.26 0    0    0 0.785
            0    0.26 0    0 0.762
            0    0    0.26 0 0.742
            1.65 1.65 1.65 0 -0.48
          "
        />
      </filter>
    </defs>
  </svg>
);

/**
 * Subtle physical uncoated paper texture layer laid lightly over colored surfaces
 * so solid ink layers (#F2BED6, #A5DCD1, #FB0C72, #FFF9F4) read as matte printed paper.
 */
const MattePaperGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.24 }) => (
  <div
    aria-hidden="true"
    className="cotton-paper-tooth pointer-events-none select-none absolute inset-0 mix-blend-multiply"
    style={{ opacity }}
  />
);

const VERTICAL_INNER_FEATHER: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 34%, black 56%, black 100%)',
  maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 34%, black 56%, black 100%)',
};

const HORIZ_SUBTLE_FEATHER: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 28%, black 48%, black 100%)',
  maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 28%, black 48%, black 100%)',
};

const VERTICAL_ENDS_FEATHER: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
  maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
};

const HORIZ_ENDS_FEATHER: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 94%, black 100%)',
  maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 94%, black 100%)',
};

/**
 * Physical top poster layer (#FFF9F4) combining:
 * 1) High-density SVG displacement cutout with whisper-soft directional contact shadow (zero thick vector strokes)
 * 2) Studio-photographed hand-torn cellulose edge bevels feathered seamlessly into #FFF9F4
 */
export const PaperTearOverlay: React.FC<{
  geometry: TearGeometryState;
  svgUid: string;
}> = ({ geometry, svgUid }) => {
  const flapGradId = `curl-grad-${svgUid}`;
  const { seamAnchors, mode, openness } = geometry;

  // Fade photographic fiber strips cleanly when tear is tightly shut (< 0.04)
  const edgeAlpha = Math.min(1, openness * 4.5);
  const vertSpanTop = `${(seamAnchors.topPct - 1.5).toFixed(2)}%`;
  const vertSpanHeight = `${(seamAnchors.botPct - seamAnchors.topPct + 3).toFixed(2)}%`;
  const insetSpanLeft = `${Math.max(0, seamAnchors.leftPct - 1.5).toFixed(2)}%`;
  const insetSpanWidth = `${Math.min(102, seamAnchors.rightPct - seamAnchors.leftPct + 3).toFixed(2)}%`;

  return (
    <div
      className="pointer-events-none select-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer A: Continuous off-white cotton poster base with high-density cutout */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id={flapGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EBE2D8" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#F8F1EA" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#FFF9F4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Continuous #FFF9F4 sheet with organic micro-fibrous cutout & GPU contact shadow */}
        <path
          d={`M -20 -20 H 1020 V 1020 H -20 Z ${geometry.holePath}`}
          fillRule="evenodd"
          fill="#FFF9F4"
          style={{
            filter: `drop-shadow(0 1.6px 2.4px rgba(34, 17, 24, ${geometry.depthShadowOpacity}))`,
          }}
        />

        {/* Subtle matte curl highlight strictly outward on #FFF9F4 top sheet where paper lifts */}
        {geometry.foldOpacity > 0.05 ? (
          <path
            d={geometry.foldFlapPath}
            fill={`url(#${flapGradId})`}
            opacity={geometry.foldOpacity * 0.72}
          />
        ) : null}
      </svg>

      {/* Layer B: Studio-photographed hand-torn cellulose edge bevels synchronized 1:1 with scroll */}
      {edgeAlpha > 0.02 ? (
        <div className="absolute inset-0" style={{ opacity: edgeAlpha }}>
          {mode === 'vertical-split' || mode === 'portrait-reveal' ? (
            <>
              {/* Left frayed vertical tear bounded cleanly to tear span */}
              <div
                className="absolute"
                style={{
                  top: vertSpanTop,
                  height: vertSpanHeight,
                  left: `calc(${seamAnchors.leftPct.toFixed(2)}% - 84px)`,
                  width: '112px',
                  ...VERTICAL_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.verticalDeckle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-right max-w-none"
                  style={{
                    ...VERTICAL_INNER_FEATHER,
                    filter: 'url(#photo-torn-key) drop-shadow(1px 1px 1.5px rgba(24,10,16,0.10))',
                  }}
                />
              </div>
              {/* Right frayed vertical tear mirrored asymmetrically */}
              <div
                className="absolute"
                style={{
                  top: vertSpanTop,
                  height: vertSpanHeight,
                  left: `calc(${seamAnchors.rightPct.toFixed(2)}% - 28px)`,
                  width: '112px',
                  ...VERTICAL_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.verticalDeckle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-right max-w-none"
                  style={{
                    ...VERTICAL_INNER_FEATHER,
                    transform: 'scaleX(-1) scaleY(-1)',
                    filter: 'url(#photo-torn-key) drop-shadow(-1px 1px 1.5px rgba(24,10,16,0.10))',
                  }}
                />
              </div>
              {/* Subtle torn top & bottom horizontal pulp bevels matching curved ends */}
              <div
                className="absolute"
                style={{
                  top: `calc(${seamAnchors.topPct.toFixed(2)}% - 42px)`,
                  left: insetSpanLeft,
                  width: insetSpanWidth,
                  height: '74px',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.horizontalSubtle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-bottom max-w-none"
                  style={{
                    ...HORIZ_SUBTLE_FEATHER,
                    filter: 'url(#photo-torn-key) drop-shadow(0 1px 1.5px rgba(24,10,16,0.09))',
                  }}
                />
              </div>
              <div
                className="absolute"
                style={{
                  top: `calc(${seamAnchors.botPct.toFixed(2)}% - 34px)`,
                  left: insetSpanLeft,
                  width: insetSpanWidth,
                  height: '74px',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                  maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.horizontalSubtle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-bottom max-w-none"
                  style={{
                    ...HORIZ_SUBTLE_FEATHER,
                    transform: 'scaleY(-1) scaleX(-1)',
                    filter: 'url(#photo-torn-key) drop-shadow(0 -1px 1.5px rgba(24,10,16,0.08))',
                  }}
                />
              </div>
            </>
          ) : null}

          {mode === 'lateral-peel' ? (
            <>
              {/* Top horizontal subtle torn seam clipped cleanly at left tear boundary */}
              <div
                className="absolute"
                style={{
                  top: `calc(${seamAnchors.topPct.toFixed(2)}% - 44px)`,
                  left: insetSpanLeft,
                  width: insetSpanWidth,
                  height: '78px',
                  ...HORIZ_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.horizontalSubtle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-bottom max-w-none"
                  style={{
                    ...HORIZ_SUBTLE_FEATHER,
                    filter: 'url(#photo-torn-key) drop-shadow(0 1.5px 1.5px rgba(24,10,16,0.11))',
                  }}
                />
              </div>
              {/* Bottom horizontal subtle torn seam */}
              <div
                className="absolute"
                style={{
                  top: `calc(${seamAnchors.botPct.toFixed(2)}% - 34px)`,
                  left: insetSpanLeft,
                  width: insetSpanWidth,
                  height: '78px',
                  ...HORIZ_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.horizontalSubtle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-bottom max-w-none"
                  style={{
                    ...HORIZ_SUBTLE_FEATHER,
                    transform: 'scaleY(-1) scaleX(-1)',
                    filter: 'url(#photo-torn-key) drop-shadow(0 -1px 1.5px rgba(24,10,16,0.08))',
                  }}
                />
              </div>
              {/* Left vertical frayed peel edge bounded cleanly to tear height */}
              <div
                className="absolute"
                style={{
                  top: vertSpanTop,
                  height: vertSpanHeight,
                  left: `calc(${seamAnchors.leftPct.toFixed(2)}% - 84px)`,
                  width: '112px',
                  ...VERTICAL_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.verticalDeckle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-right max-w-none"
                  style={{
                    ...VERTICAL_INNER_FEATHER,
                    transform: 'scaleY(-1)',
                    filter: 'url(#photo-torn-key) drop-shadow(1.5px 1px 2px rgba(24,10,16,0.12))',
                  }}
                />
              </div>
            </>
          ) : null}

          {mode === 'diagonal-rip' ? (
            <div
              className="absolute inset-y-0"
              style={{
                left: '-6%',
                width: '112%',
                transform: `rotate(${seamAnchors.angleDeg.toFixed(2)}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Top diagonal torn paper bevel */}
              <img
                src={PHOTO_TORN_ASSETS.horizontalSubtle}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute left-0 w-full h-[84px] sm:h-[96px] object-cover object-bottom max-w-none"
                style={{
                  ...HORIZ_SUBTLE_FEATHER,
                  top: `calc(${seamAnchors.topPct.toFixed(2)}% - 48px)`,
                  transform: 'scaleX(-1)',
                  filter: 'url(#photo-torn-key) drop-shadow(0 1.5px 2px rgba(24,10,16,0.13))',
                }}
              />
              {/* Bottom diagonal torn paper bevel */}
              <img
                src={PHOTO_TORN_ASSETS.horizontalSubtle}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute left-0 w-full h-[84px] sm:h-[96px] object-cover object-bottom max-w-none"
                style={{
                  ...HORIZ_SUBTLE_FEATHER,
                  top: `calc(${seamAnchors.botPct.toFixed(2)}% - 38px)`,
                  transform: 'scaleY(-1)',
                  filter: 'url(#photo-torn-key) drop-shadow(0 -1px 1.5px rgba(24,10,16,0.09))',
                }}
              />
            </div>
          ) : null}

          {mode === 'horizontal-split' ? (
            <>
              <img
                src={PHOTO_TORN_ASSETS.horizontalSubtle}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute left-0 w-full h-[82px] sm:h-[94px] object-cover object-bottom max-w-none"
                style={{
                  ...HORIZ_SUBTLE_FEATHER,
                  top: `calc(${seamAnchors.topPct.toFixed(2)}% - 48px)`,
                  transform: 'scaleX(-1)',
                  filter: 'url(#photo-torn-key) drop-shadow(0 1.5px 2px rgba(24,10,16,0.11))',
                }}
              />
              <img
                src={PHOTO_TORN_ASSETS.horizontalSubtle}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute left-0 w-full h-[82px] sm:h-[94px] object-cover object-bottom max-w-none"
                style={{
                  ...HORIZ_SUBTLE_FEATHER,
                  top: `calc(${seamAnchors.botPct.toFixed(2)}% - 38px)`,
                  transform: 'scaleY(-1)',
                  filter: 'url(#photo-torn-key) drop-shadow(0 -1px 1.5px rgba(24,10,16,0.09))',
                }}
              />
            </>
          ) : null}

          {mode === 'broad-peel' ? (
            <>
              <div
                className="absolute"
                style={{
                  top: `calc(${seamAnchors.topPct.toFixed(2)}% - 46px)`,
                  left: insetSpanLeft,
                  width: insetSpanWidth,
                  height: '80px',
                  ...HORIZ_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.horizontalSubtle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-bottom max-w-none"
                  style={{
                    ...HORIZ_SUBTLE_FEATHER,
                    filter: 'url(#photo-torn-key) drop-shadow(0 1.5px 2px rgba(24,10,16,0.11))',
                  }}
                />
              </div>
              <div
                className="absolute"
                style={{
                  top: `calc(${seamAnchors.botPct.toFixed(2)}% - 36px)`,
                  left: insetSpanLeft,
                  width: insetSpanWidth,
                  height: '80px',
                  ...HORIZ_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.horizontalSubtle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-bottom max-w-none"
                  style={{
                    ...HORIZ_SUBTLE_FEATHER,
                    transform: 'scaleY(-1) scaleX(-1)',
                    filter: 'url(#photo-torn-key) drop-shadow(0 -1px 1.5px rgba(24,10,16,0.08))',
                  }}
                />
              </div>
              <div
                className="absolute"
                style={{
                  top: vertSpanTop,
                  height: vertSpanHeight,
                  left: `calc(${seamAnchors.leftPct.toFixed(2)}% - 84px)`,
                  width: '112px',
                  ...VERTICAL_ENDS_FEATHER,
                }}
              >
                <img
                  src={PHOTO_TORN_ASSETS.verticalDeckle}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-right max-w-none"
                  style={{
                    ...VERTICAL_INNER_FEATHER,
                    filter: 'url(#photo-torn-key) drop-shadow(1.5px 1px 2px rgba(24,10,16,0.12))',
                  }}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

/**
 * Renders the unique editorial composition exposed inside each torn region.
 * Preserves exact verbatim copy, typography, and layout while giving every colored paper layer
 * genuine uncoated cotton paper grain.
 */
export const TearRevealedArtwork: React.FC<PaperTearFrameProps> = ({
  service,
  geometry,
}) => {
  const liftStyle: React.CSSProperties = {
    opacity: geometry.contentOpacity,
    transform: `translate3d(0, ${geometry.contentLiftPx}px, 0)`,
    pointerEvents: geometry.openness > 0.45 ? 'auto' : 'none',
  };

  if (service.id === 'diagnostico') {
    return (
      <div
        className="relative w-full h-full bg-[#F2BED6] text-black flex items-center justify-center px-10 py-20 sm:px-20 sm:py-24 md:px-28 md:py-28"
        style={liftStyle}
      >
        <MattePaperGrain opacity={0.22} />

        {/* Real scanned torn pastel paper fragment */}
        <picture>
          <source srcSet={toOptimizedWebp(SECTION_ASSETS.paperPastelPink)} type="image/webp" />
          <img
            src={SECTION_ASSETS.paperPastelPink}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-10 top-6 w-56 sm:w-72 opacity-45 mix-blend-multiply rotate-6"
          />
        </picture>

        {/* Concentric radial investigation diagram */}
        <svg
          viewBox="0 0 600 420"
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 w-full h-full opacity-35"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="445" cy="210" r="158" fill="none" stroke="#000000" strokeWidth="1.1" strokeDasharray="5 5" />
          <circle cx="445" cy="210" r="106" fill="none" stroke="#FB0C72" strokeWidth="1.4" />
          <circle cx="445" cy="210" r="46" fill="#FFF9F4" fillOpacity="0.65" stroke="#000000" strokeWidth="1.2" />
          <line x1="255" y1="210" x2="590" y2="210" stroke="#000000" strokeWidth="0.8" strokeOpacity="0.45" />
          <line x1="445" y1="32" x2="445" y2="388" stroke="#000000" strokeWidth="0.8" strokeOpacity="0.45" />
        </svg>

        <div className="relative z-10 w-full max-w-[1140px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-9 space-y-5 sm:space-y-6">
            <span className="font-handwritten font-bold text-3xl sm:text-[34px] md:text-[38px] text-[#B80552] leading-none block">
              {service.editorialNote}
            </span>
            <h3 className="font-display font-normal uppercase text-[clamp(2.35rem,5.2vw,4.35rem)] leading-[0.93] tracking-[-0.02em] text-black text-balance">
              {service.title}
            </h3>
            <p className="font-body text-[17px] sm:text-[20px] md:text-[22px] font-medium leading-[1.58] text-black/90 max-w-[48ch]">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (service.id === 'estrategia') {
    return (
      <div
        className="relative w-full h-full bg-[#A5DCD1] text-black flex items-center justify-center px-9 py-20 sm:px-16 sm:py-24 lg:px-20 lg:py-24 xl:px-24 xl:py-28"
        style={liftStyle}
      >
        <MattePaperGrain opacity={0.22} />

        {/* Subtle editorial grid rule background (pure typographic layout — no calendar icon) */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 opacity-22"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.16) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
          }}
        />

        {/* Real torn aqua paper scrap + gingham washi detail tucked asymmetrically */}
        <picture>
          <source srcSet={toOptimizedWebp(SECTION_ASSETS.washiCheckered)} type="image/webp" />
          <img
            src={SECTION_ASSETS.washiCheckered}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="pointer-events-none select-none hidden sm:block absolute left-10 top-6 w-40 opacity-85 -rotate-6"
          />
        </picture>
        <picture>
          <source srcSet={toOptimizedWebp(SECTION_ASSETS.paperAqua)} type="image/webp" />
          <img
            src={SECTION_ASSETS.paperAqua}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="pointer-events-none select-none absolute -bottom-8 right-4 w-64 opacity-45 mix-blend-multiply rotate-3"
          />
        </picture>

        <div className="relative z-10 w-full max-w-[1260px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-9 xl:gap-12 items-center">
          {/* Quadro editorial estilo Trello (Topo, Meio e Base de Funil) */}
          <div className="lg:col-span-8 xl:col-span-7 order-2 lg:order-1 min-w-0">
            <div
              aria-label="Quadro editorial semanal organizado por etapas de funil"
              className="relative rounded-xl bg-[#7E61C2] p-2.5 sm:p-3 xl:p-3.5 border border-black/15 shadow-[0_10px_26px_rgba(16,24,32,0.14)] overflow-hidden"
            >
              <MattePaperGrain opacity={0.12} />
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 xl:gap-3 items-stretch">
                {/* Coluna 1: Segunda - Feira */}
                <div className="min-w-0 bg-white rounded-lg p-2.5 xl:p-3 text-[#172B4D] shadow-[0_1px_3px_rgba(9,30,66,0.16)] flex flex-col">
                  <div className="flex items-center justify-between gap-1.5 mb-2 px-0.5">
                    <span className="font-body text-[12px] xl:text-[13px] font-bold tracking-tight text-[#172B4D] truncate">
                      Segunda - Feira
                    </span>
                    <span className="font-ui text-[11px] font-semibold text-[#626F86] shrink-0">
                      1 ···
                    </span>
                  </div>
                  <div className="min-w-0 bg-[#DC87FC] rounded-md px-2.5 py-2.5 xl:px-3 xl:py-3 font-body text-[12px] xl:text-[13px] leading-[1.4] font-medium text-[#1F122B] shadow-[0_1px_2px_rgba(0,0,0,0.08)] flex-1 break-words [overflow-wrap:break-word]">
                    Linha Editorial - TOPO DE FUNIL - Informativo com dicas de estratégia e repertório.
                  </div>
                </div>

                {/* Coluna 2: Terça - Feira */}
                <div className="min-w-0 bg-white rounded-lg p-2.5 xl:p-3 text-[#172B4D] shadow-[0_1px_3px_rgba(9,30,66,0.16)] flex flex-col">
                  <div className="flex items-center justify-between gap-1.5 mb-2 px-0.5">
                    <span className="font-body text-[12px] xl:text-[13px] font-bold tracking-tight text-[#172B4D] truncate">
                      Terça - Feira
                    </span>
                    <span className="font-ui text-[11px] font-semibold text-[#626F86] shrink-0">
                      1 ···
                    </span>
                  </div>
                  <div className="min-w-0 bg-[#6EC9E2] rounded-md px-2.5 py-2.5 xl:px-3 xl:py-3 font-body text-[12px] xl:text-[13px] leading-[1.4] font-medium text-[#0B2530] shadow-[0_1px_2px_rgba(0,0,0,0.08)] flex-1 break-words [overflow-wrap:break-word]">
                    Linha Editorial - MEIO DE FUNIL - Bastidores, experiências reais e trajetória.
                  </div>
                </div>

                {/* Coluna 3: Sexta - Feira */}
                <div className="min-w-0 bg-white rounded-lg p-2.5 xl:p-3 text-[#172B4D] shadow-[0_1px_3px_rgba(9,30,66,0.16)] flex flex-col">
                  <div className="flex items-center justify-between gap-1.5 mb-2 px-0.5">
                    <span className="font-body text-[12px] xl:text-[13px] font-bold tracking-tight text-[#172B4D] truncate">
                      Sexta - Feira
                    </span>
                    <span className="font-ui text-[11px] font-semibold text-[#626F86] shrink-0">
                      1 ···
                    </span>
                  </div>
                  <div className="min-w-0 bg-[#ED71B8] rounded-md px-2.5 py-2.5 xl:px-3 xl:py-3 font-body text-[12px] xl:text-[13px] leading-[1.4] font-medium text-[#2A091A] shadow-[0_1px_2px_rgba(0,0,0,0.08)] flex-1 break-words [overflow-wrap:break-word]">
                    Linha Editorial - BASE DE FUNIL - Apresentação de serviços, processos e entrega.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 xl:col-span-5 order-1 lg:order-2 space-y-5 min-w-0">
            <h3 className="font-display font-normal uppercase text-[clamp(2.25rem,4.4vw,4.15rem)] leading-[0.94] tracking-[-0.02em] text-black text-balance">
              {service.title}
            </h3>
            <p className="font-body text-[17px] sm:text-[19px] xl:text-[21px] font-medium leading-[1.58] text-black/90 max-w-[44ch]">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (service.id === 'copy') {
    return (
      <div
        className="relative w-full h-full bg-[#FB0C72] text-[#FFF9F4] flex items-center justify-center px-9 py-22 sm:px-18 sm:py-26 md:px-24 md:py-28"
        style={liftStyle}
      >
        <MattePaperGrain opacity={0.18} />

        {/* High-fashion / album sleeve registration corner ticks */}
        <svg
          viewBox="0 0 800 420"
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 w-full h-full opacity-40"
          preserveAspectRatio="none"
        >
          <path d="M 42 54 H 90 M 42 54 V 102" stroke="#FFF9F4" strokeWidth="1.6" fill="none" />
          <path d="M 758 366 H 710 M 758 366 V 318" stroke="#FFF9F4" strokeWidth="1.6" fill="none" />
          <line x1="42" y1="366" x2="260" y2="366" stroke="#000000" strokeWidth="2" strokeOpacity="0.35" />
        </svg>

        <div className="relative z-10 w-full max-w-[1160px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <h3 className="font-display font-normal uppercase text-[clamp(2.45rem,5.4vw,4.5rem)] leading-[0.91] tracking-[-0.02em] text-[#FFF9F4] text-balance">
              {service.title}
            </h3>
            {/* Hand-cut matte cream paper slip with soft contact shadow & subtle fiber grain */}
            <div className="relative max-w-[50ch] -rotate-[0.6deg]">
              <div
                className="relative bg-[#FFF9F4] text-black px-6 py-5 sm:px-8 sm:py-6 overflow-hidden"
                style={{
                  boxShadow: '0 3px 10px rgba(24, 6, 14, 0.22), 0 1px 2px rgba(24, 6, 14, 0.14)',
                }}
              >
                <MattePaperGrain opacity={0.18} />
                <p className="relative z-10 font-body text-[17px] sm:text-[19.5px] md:text-[21px] font-medium leading-[1.58]">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-3 md:items-end md:text-right">
            <p className="font-display uppercase text-[1.9rem] sm:text-[2.45rem] md:text-[2.85rem] leading-[0.96] tracking-tight text-black">
              Roteiro.
              <br />
              Legenda.
              <br />
              Lançamento.
              <br />
              <span className="text-[#FFF9F4]">Peça visual.</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (service.id === 'gestao') {
    return (
      <div
        className="relative w-full h-full bg-[#FFF9F4] text-black flex items-center justify-center px-10 py-22 sm:px-18 sm:py-24 md:px-24 md:py-28"
        style={{
          ...liftStyle,
          backgroundImage:
            'radial-gradient(circle at 82% 28%, rgba(242,190,214,0.45), transparent 46%), radial-gradient(circle at 18% 76%, rgba(165,220,209,0.40), transparent 44%)',
        }}
      >
        <MattePaperGrain opacity={0.22} />

        <div className="relative z-10 w-full max-w-[1160px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-7 space-y-5">
            <span className="font-handwritten font-bold text-3xl sm:text-[34px] md:text-[36px] text-[#FB0C72] leading-none block">
              {service.editorialNote}
            </span>
            <h3 className="font-display font-normal uppercase text-[clamp(2.35rem,5vw,4.2rem)] leading-[0.94] tracking-[-0.02em] text-black text-balance">
              {service.title}
            </h3>
            <p className="font-body text-[17px] sm:text-[19.5px] md:text-[21px] font-medium leading-[1.58] text-black/90 max-w-[46ch]">
              {service.description}
            </p>
          </div>

          <div className="md:col-span-5 border-t border-b border-black/25 py-6 sm:py-7 space-y-5">
            <div className="flex items-center justify-between font-ui text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-black/65">
              <span>Leitura de desempenho</span>
              <span>Ajuste de rota</span>
            </div>
            <svg viewBox="0 0 320 96" className="w-full h-auto" aria-hidden="true">
              <line x1="8" y1="78" x2="312" y2="78" stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
              <line x1="8" y1="48" x2="312" y2="48" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="4 4" />
              <path
                d="M 12 72 C 74 70, 112 52, 166 44 C 218 36, 254 20, 306 14"
                fill="none"
                stroke="#FB0C72"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="72" r="4" fill="#000000" />
              <circle cx="166" cy="44" r="4.5" fill="#A5DCD1" stroke="#000000" strokeWidth="1.5" />
              <circle cx="306" cy="14" r="5" fill="#FB0C72" stroke="#000000" strokeWidth="1.5" />
            </svg>
            <div className="flex items-center justify-between font-ui text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.08em] text-black">
              <span>Publicação</span>
              <span className="text-[#FB0C72]">→ Otimização</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Identidade visual — Broad Layer Peel-Off showcasing brand code & original unmodified monogram
  return (
    <div
      className="relative w-full h-full bg-[#F6EAE0] text-black flex items-center justify-center px-11 py-22 sm:px-18 sm:py-24 md:px-24 md:py-28"
      style={liftStyle}
    >
      <MattePaperGrain opacity={0.22} />

      <div className="relative z-10 w-full max-w-[1160px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="md:col-span-7 space-y-5">
          <span className="font-handwritten font-bold text-3xl sm:text-[34px] md:text-[36px] text-[#FB0C72] leading-none block">
            {service.editorialNote}
          </span>
          <h3 className="font-display font-normal uppercase text-[clamp(2.35rem,5vw,4.2rem)] leading-[0.94] tracking-[-0.02em] text-black text-balance">
            {service.title}
          </h3>
          <p className="font-body text-[17px] sm:text-[19.5px] md:text-[21px] font-medium leading-[1.58] text-black/90 max-w-[44ch]">
            {service.description}
          </p>

          <div className="pt-3">
            <span className="font-ui text-[11px] font-bold tracking-[0.16em] uppercase text-black/60 block mb-2.5">
              Paleta do sistema
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {BRAND_PALETTE_SWATCHES.map((sw) => (
                <div key={sw.hex} className="flex items-center gap-2 bg-[#FFF9F4] border border-black/25 px-2.5 py-1.5">
                  <span
                    className="w-4.5 h-4.5 sm:w-5 sm:h-5 border border-black/60 shrink-0"
                    style={{ backgroundColor: sw.hex }}
                    aria-hidden="true"
                  />
                  <span className="font-ui text-[11px] font-bold tracking-wider text-black">
                    {sw.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-[#FFF9F4] border border-black/25 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-black/15 pb-5">
            <div>
              <span className="font-ui text-[11px] font-bold tracking-[0.16em] uppercase text-black/55 block">
                Monograma
              </span>
              <span className="font-handwritten font-bold text-2xl sm:text-[26px] text-black">
                marca &amp; assinatura
              </span>
            </div>
            <picture className="shrink-0">
              <source srcSet={toOptimizedWebp(SECTION_ASSETS.monogram)} type="image/webp" />
              <img
                src={SECTION_ASSETS.monogram}
                alt="Monograma original Flavia Brito"
                loading="lazy"
                decoding="async"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
            </picture>
          </div>

          <div className="space-y-2">
            <span className="font-ui text-[11px] font-bold tracking-[0.16em] uppercase text-black/55 block">
              Tipografia
            </span>
            <p className="font-display uppercase text-2xl sm:text-3xl leading-none text-black">
              Anton · Display
            </p>
            <p className="font-handwritten font-bold text-2xl sm:text-3xl leading-none text-[#FB0C72]">
              Caveat · Marginalia
            </p>
            <p className="font-body text-[15px] sm:text-base font-medium text-black/75">
              DM Sans · Leitura &amp; Sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
