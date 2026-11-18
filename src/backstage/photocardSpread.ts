import type { PortfolioAsset, ProjectId } from './backstageData.ts';

export type SpreadLayoutKind = 'desktop' | 'mobile';

export interface PhotocardPose {
  /** Normalized center X inside photocard stage [0..1] */
  readonly cx: number;
  /** Normalized center Y inside photocard stage [0..1] */
  readonly cy: number;
  /** Card rotation in degrees */
  readonly rotDeg: number;
  /** Optical scale factor */
  readonly scale: number;
}

export interface PhotocardSpec {
  readonly assetId: string;
  readonly project: ProjectId;
  readonly zIndex: number;
  /** Paper border width in px (thin authentic matte photocard rim) */
  readonly rimPx: number;
  /** Progress window [start, end] within [0..1] for gentle staggered spread */
  readonly staggerWindow: readonly [number, number];
  readonly desktop: {
    readonly widthFrac: number;
    readonly initial: PhotocardPose;
    readonly final: PhotocardPose;
  };
  readonly mobile: {
    readonly widthFrac: number;
    readonly initial: PhotocardPose;
    readonly final: PhotocardPose;
  };
}

export interface PhotocardComputedFrame {
  readonly assetId: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly translateX: number;
  readonly translateY: number;
  readonly rotateDeg: number;
  readonly scale: number;
  readonly zIndex: number;
  readonly rimPx: number;
  /** Exact axis-aligned bounds inside stage coordinates (without rotation overhang margin) */
  readonly bounds: {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
  };
  /** Depth-calibrated contact + ambient shadow tier (0 = lowest on paper, 1 = slightly lifted) */
  readonly elevation: number;
}

export function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smooth cubic deceleration settling naturally like paper gliding to rest */
export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function computeCardProgress(
  rawProgress: number,
  window: readonly [number, number]
): number {
  const [start, end] = window;
  if (end <= start) return clamp01(rawProgress);
  const local = clamp01((rawProgress - start) / (end - start));
  return easeInOutCubic(local);
}

/**
 * Planned, deterministic, asymmetric photocard choreographies.
 * Initial pose: organic slightly messy stacked cluster near stage focal center.
 * Final pose: balanced open spread where every piece remains legible and unburied.
 */
export const LA_MAISON_SPREAD_SPECS: readonly PhotocardSpec[] = [
  {
    assetId: 'lm-taemin-poster',
    project: 'la-maison',
    zIndex: 6,
    rimPx: 7,
    staggerWindow: [0.0, 0.84],
    desktop: {
      widthFrac: 0.34,
      initial: { cx: 0.48, cy: 0.47, rotDeg: -6.5, scale: 0.91 },
      final: { cx: 0.2, cy: 0.35, rotDeg: -3.4, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.45,
      initial: { cx: 0.51, cy: 0.31, rotDeg: -5.2, scale: 0.92 },
      final: { cx: 0.7, cy: 0.21, rotDeg: 2.4, scale: 1.0 },
    },
  },
  {
    assetId: 'lm-uau-campaign',
    project: 'la-maison',
    zIndex: 5,
    rimPx: 7,
    staggerWindow: [0.06, 0.9],
    desktop: {
      widthFrac: 0.33,
      initial: { cx: 0.53, cy: 0.51, rotDeg: 5.8, scale: 0.9 },
      final: { cx: 0.78, cy: 0.29, rotDeg: 4.1, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.45,
      initial: { cx: 0.47, cy: 0.34, rotDeg: 4.8, scale: 0.91 },
      final: { cx: 0.72, cy: 0.54, rotDeg: 2.8, scale: 1.0 },
    },
  },
  {
    assetId: 'lm-logo',
    project: 'la-maison',
    zIndex: 7,
    rimPx: 6,
    staggerWindow: [0.02, 0.82],
    desktop: {
      widthFrac: 0.21,
      initial: { cx: 0.46, cy: 0.44, rotDeg: 8.5, scale: 0.94 },
      final: { cx: 0.49, cy: 0.14, rotDeg: -2.1, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.32,
      initial: { cx: 0.45, cy: 0.28, rotDeg: 6.4, scale: 0.94 },
      final: { cx: 0.26, cy: 0.14, rotDeg: -2.8, scale: 1.0 },
    },
  },
  {
    assetId: 'lm-taemin-shirt',
    project: 'la-maison',
    zIndex: 4,
    rimPx: 6,
    staggerWindow: [0.08, 0.94],
    desktop: {
      widthFrac: 0.27,
      initial: { cx: 0.52, cy: 0.48, rotDeg: -8.2, scale: 0.9 },
      final: { cx: 0.5, cy: 0.56, rotDeg: 2.6, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.42,
      initial: { cx: 0.54, cy: 0.33, rotDeg: -6.0, scale: 0.9 },
      final: { cx: 0.28, cy: 0.42, rotDeg: -3.0, scale: 1.0 },
    },
  },
  {
    assetId: 'lm-baekhyun-shirts',
    project: 'la-maison',
    zIndex: 3,
    rimPx: 6,
    staggerWindow: [0.1, 0.98],
    desktop: {
      widthFrac: 0.22,
      initial: { cx: 0.45, cy: 0.53, rotDeg: 7.4, scale: 0.89 },
      final: { cx: 0.2, cy: 0.78, rotDeg: 5.2, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.36,
      initial: { cx: 0.46, cy: 0.37, rotDeg: 5.5, scale: 0.89 },
      final: { cx: 0.27, cy: 0.74, rotDeg: 3.3, scale: 1.0 },
    },
  },
  {
    assetId: 'lm-collection-backstage',
    project: 'la-maison',
    zIndex: 4,
    rimPx: 6,
    staggerWindow: [0.12, 1.0],
    desktop: {
      widthFrac: 0.22,
      initial: { cx: 0.54, cy: 0.52, rotDeg: -4.4, scale: 0.89 },
      final: { cx: 0.81, cy: 0.74, rotDeg: -4.5, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.36,
      initial: { cx: 0.53, cy: 0.38, rotDeg: -4.1, scale: 0.89 },
      final: { cx: 0.73, cy: 0.81, rotDeg: -2.7, scale: 1.0 },
    },
  },
];

export const FLAVIA_BRITO_SPREAD_SPECS: readonly PhotocardSpec[] = [
  {
    assetId: 'fb-portrait',
    project: 'flavia-brito',
    zIndex: 8,
    rimPx: 7,
    staggerWindow: [0.0, 0.82],
    desktop: {
      widthFrac: 0.34,
      initial: { cx: 0.49, cy: 0.46, rotDeg: -5.4, scale: 0.91 },
      final: { cx: 0.21, cy: 0.41, rotDeg: -2.6, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.49,
      initial: { cx: 0.48, cy: 0.24, rotDeg: -4.5, scale: 0.92 },
      final: { cx: 0.32, cy: 0.24, rotDeg: -2.4, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-brand-guide',
    project: 'flavia-brito',
    zIndex: 7,
    rimPx: 7,
    staggerWindow: [0.04, 0.86],
    desktop: {
      widthFrac: 0.41,
      initial: { cx: 0.53, cy: 0.44, rotDeg: 4.8, scale: 0.88 },
      final: { cx: 0.76, cy: 0.14, rotDeg: 2.5, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.68,
      initial: { cx: 0.52, cy: 0.27, rotDeg: 4.0, scale: 0.88 },
      final: { cx: 0.55, cy: 0.43, rotDeg: 2.1, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-logo',
    project: 'flavia-brito',
    zIndex: 8,
    rimPx: 6,
    staggerWindow: [0.02, 0.8],
    desktop: {
      widthFrac: 0.28,
      initial: { cx: 0.46, cy: 0.42, rotDeg: 7.2, scale: 0.92 },
      final: { cx: 0.2, cy: 0.1, rotDeg: -3.0, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.45,
      initial: { cx: 0.46, cy: 0.21, rotDeg: 5.5, scale: 0.92 },
      final: { cx: 0.29, cy: 0.07, rotDeg: -2.4, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-monogram',
    project: 'flavia-brito',
    zIndex: 9,
    rimPx: 6,
    staggerWindow: [0.06, 0.84],
    desktop: {
      widthFrac: 0.16,
      initial: { cx: 0.51, cy: 0.43, rotDeg: -8.0, scale: 0.95 },
      final: { cx: 0.44, cy: 0.11, rotDeg: 4.8, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.25,
      initial: { cx: 0.54, cy: 0.22, rotDeg: -6.2, scale: 0.94 },
      final: { cx: 0.76, cy: 0.08, rotDeg: 4.2, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-palette',
    project: 'flavia-brito',
    zIndex: 5,
    rimPx: 6,
    staggerWindow: [0.08, 0.9],
    desktop: {
      widthFrac: 0.29,
      initial: { cx: 0.52, cy: 0.48, rotDeg: -6.6, scale: 0.88 },
      final: { cx: 0.52, cy: 0.34, rotDeg: 3.4, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.45,
      initial: { cx: 0.54, cy: 0.26, rotDeg: 4.6, scale: 0.89 },
      final: { cx: 0.73, cy: 0.2, rotDeg: 3.0, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-reel-cover',
    project: 'flavia-brito',
    zIndex: 7,
    rimPx: 7,
    staggerWindow: [0.1, 0.94],
    desktop: {
      widthFrac: 0.25,
      initial: { cx: 0.54, cy: 0.51, rotDeg: 6.2, scale: 0.9 },
      final: { cx: 0.84, cy: 0.54, rotDeg: -2.0, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.36,
      initial: { cx: 0.53, cy: 0.3, rotDeg: 5.0, scale: 0.9 },
      final: { cx: 0.74, cy: 0.85, rotDeg: 2.5, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-textures',
    project: 'flavia-brito',
    zIndex: 6,
    rimPx: 6,
    staggerWindow: [0.12, 0.94],
    desktop: {
      widthFrac: 0.3,
      initial: { cx: 0.48, cy: 0.52, rotDeg: 5.2, scale: 0.89 },
      final: { cx: 0.51, cy: 0.52, rotDeg: -3.2, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.51,
      initial: { cx: 0.47, cy: 0.29, rotDeg: -4.8, scale: 0.89 },
      final: { cx: 0.7, cy: 0.64, rotDeg: -2.6, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-typography',
    project: 'flavia-brito',
    zIndex: 6,
    rimPx: 6,
    staggerWindow: [0.14, 0.98],
    desktop: {
      widthFrac: 0.3,
      initial: { cx: 0.46, cy: 0.54, rotDeg: -7.5, scale: 0.88 },
      final: { cx: 0.21, cy: 0.77, rotDeg: 3.8, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.48,
      initial: { cx: 0.46, cy: 0.28, rotDeg: 4.4, scale: 0.89 },
      final: { cx: 0.29, cy: 0.58, rotDeg: 3.1, scale: 1.0 },
    },
  },
  {
    assetId: 'fb-carousel-cover',
    project: 'flavia-brito',
    zIndex: 8,
    rimPx: 7,
    staggerWindow: [0.15, 1.0],
    desktop: {
      widthFrac: 0.29,
      initial: { cx: 0.52, cy: 0.55, rotDeg: 5.5, scale: 0.91 },
      final: { cx: 0.55, cy: 0.8, rotDeg: 2.5, scale: 1.0 },
    },
    mobile: {
      widthFrac: 0.46,
      initial: { cx: 0.5, cy: 0.31, rotDeg: -3.9, scale: 0.91 },
      final: { cx: 0.29, cy: 0.83, rotDeg: -2.4, scale: 1.0 },
    },
  },
];

export const ALL_SPREAD_SPECS: readonly PhotocardSpec[] = [
  ...LA_MAISON_SPREAD_SPECS,
  ...FLAVIA_BRITO_SPREAD_SPECS,
];

/**
 * Computes exact GPU transform + bounding geometry for a physical photocard
 * inside a container of dimensions `(stageWidth, stageHeight)`.
 */
export function computePhotocardTransform(
  spec: PhotocardSpec,
  asset: PortfolioAsset,
  rawProgress: number,
  layout: SpreadLayoutKind,
  stageWidth: number,
  stageHeight: number
): PhotocardComputedFrame {
  const layoutConfig = layout === 'mobile' ? spec.mobile : spec.desktop;
  const p = computeCardProgress(rawProgress, spec.staggerWindow);

  const innerImgW = Math.max(48, Math.round(stageWidth * layoutConfig.widthFrac));
  const innerImgH = Math.round((innerImgW * asset.height) / asset.width);
  const widthPx = innerImgW + spec.rimPx * 2;
  const heightPx = innerImgH + spec.rimPx * 2;

  const cxNorm = lerp(layoutConfig.initial.cx, layoutConfig.final.cx, p);
  const cyNorm = lerp(layoutConfig.initial.cy, layoutConfig.final.cy, p);
  const rotDeg = lerp(layoutConfig.initial.rotDeg, layoutConfig.final.rotDeg, p);
  const scale = lerp(layoutConfig.initial.scale, layoutConfig.final.scale, p);

  const centerX = cxNorm * stageWidth;
  const centerY = cyNorm * stageHeight;

  const translateX = centerX - widthPx / 2;
  const translateY = centerY - heightPx / 2;

  return {
    assetId: spec.assetId,
    widthPx,
    heightPx,
    centerX,
    centerY,
    translateX,
    translateY,
    rotateDeg: Number(rotDeg.toFixed(2)),
    scale: Number(scale.toFixed(4)),
    zIndex: spec.zIndex,
    rimPx: spec.rimPx,
    bounds: {
      left: centerX - (widthPx * scale) / 2,
      top: centerY - (heightPx * scale) / 2,
      right: centerX + (widthPx * scale) / 2,
      bottom: centerY + (heightPx * scale) / 2,
    },
    elevation: clamp01((spec.zIndex - 3) / 6),
  };
}
