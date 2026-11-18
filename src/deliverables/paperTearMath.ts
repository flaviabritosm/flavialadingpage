import type { TearModeId } from './deliverablesData.ts';

export type LayoutKind = 'desktop' | 'mobile';

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface TearSeamAnchors {
  /** Normalized 0..100 percentages matching tear opening bounds for 1:1 photo strip alignment */
  readonly leftPct: number;
  readonly rightPct: number;
  readonly topPct: number;
  readonly botPct: number;
  readonly angleDeg: number;
}

export type TearGeometryMode = TearModeId | 'portrait-reveal';

export interface TearGeometryState {
  readonly mode: TearGeometryMode;
  readonly progress: number;
  readonly openness: number;
  /** SVG path (`M ... Z` inside 0..1000 x 0..1000 viewBox) of the torn window opening */
  readonly holePath: string;
  /** High-frequency subtle pulp contour path */
  readonly pulpRimPath: string;
  /** CSS clip-path applied onto revealed HTML surface matching the exact torn cavity */
  readonly revealClipPolygon: string;
  /** SVG path for subtle outward paper curl highlight along primary tear seam */
  readonly foldFlapPath: string;
  /** Folded flap fill opacity */
  readonly foldOpacity: number;
  /** Soft contact shadow opacity beneath overlapping sheet */
  readonly depthShadowOpacity: number;
  /** Micro elevation & parallax offset (px) applied to inner revealed content as it surfaces */
  readonly contentLiftPx: number;
  readonly contentOpacity: number;
  /** Live edge percentages so photographic torn-edge overlays move in exact lockstep with scroll */
  readonly seamAnchors: TearSeamAnchors;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Deterministic multi-scale organic paper fiber noise in [-1, 1].
 * Combines slow macro curvature with subtle medium fiber shifts; fine cellulose tufts
 * are resolved organically at render time with real photographic torn paper edges and SVG displacement.
 */
export function fiberNoise(u: number, seed: number): number {
  const f1 = Math.sin(u * 6.8 + seed * 2.13) * 0.62;
  const f2 = Math.sin(u * 17.4 + seed * 5.71 + 0.8) * 0.42;
  const f3 = Math.sin(u * 41.2 + seed * 11.4 + 1.9) * 0.24;
  const f4 = Math.cos(u * 89.6 + seed * 19.3) * 0.14;
  const f5 = Math.sin(u * 173.1 + seed * 29.1) * 0.08;
  return Math.max(-1, Math.min(1, (f1 + f2 + f3 + f4 + f5) / 1.35));
}

function formatPt(p: Point2D): string {
  return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}

function pointsToSvgPath(pts: readonly Point2D[]): string {
  if (pts.length === 0) return '';
  let d = `M ${formatPt(pts[0])}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${formatPt(pts[i])}`;
  }
  return `${d} Z`;
}

function pointsToCssPolygon(pts: readonly Point2D[]): string {
  if (pts.length === 0) return 'polygon(0% 0%, 0% 0%, 0% 0%)';
  // Downsample gently if very dense so CSS clip-path evaluates crisply & fast
  const stride = pts.length > 140 ? 2 : 1;
  const coords: string[] = [];
  for (let i = 0; i < pts.length; i += stride) {
    const p = pts[i];
    coords.push(
      `${(Math.max(0, Math.min(1000, p.x)) / 10).toFixed(2)}% ${(
        Math.max(0, Math.min(1000, p.y)) / 10
      ).toFixed(2)}%`
    );
  }
  return `polygon(${coords.join(', ')})`;
}

/**
 * Builds a subtle outward curled highlight lip along an actual edge rim slice,
 * strictly resting outward on top of the #FFF9F4 sheet.
 */
function buildOutwardFlapFromRim(
  rimSlice: readonly Point2D[],
  outwardDir: Point2D,
  depth: number,
  seed: number
): Point2D[] {
  if (rimSlice.length < 3 || depth <= 1) {
    return [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  }
  const dirLen = Math.hypot(outwardDir.x, outwardDir.y) || 1;
  const nx = outwardDir.x / dirLen;
  const ny = outwardDir.y / dirLen;

  const basePts: Point2D[] = [];
  const curledPts: Point2D[] = [];

  for (let i = 0; i < rimSlice.length; i++) {
    const u = i / (rimSlice.length - 1);
    const taper = Math.sin(u * Math.PI);
    const curl = depth * (0.1 + 0.9 * taper) + fiberNoise(u * 3.8, seed) * 2.5;
    const pt = rimSlice[i];
    basePts.push(pt);
    curledPts.push({
      x: Math.max(-10, Math.min(1010, pt.x + nx * curl)),
      y: Math.max(-10, Math.min(1010, pt.y + ny * curl)),
    });
  }

  return [...basePts, ...curledPts.reverse()];
}

/**
 * Generates an organic high-density horizontally torn horizon path (no coarse triangles)
 * for panoramic layered paper closing transitions.
 */
export function buildTornHorizonPath(
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  seed: number,
  samples = 180
): string {
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const x = u * width;
    const macro = Math.sin(u * Math.PI * 2.1 + seed) * (amplitude * 0.55);
    const micro = fiberNoise(u * 4.2, seed + 1.7) * (amplitude * 0.85);
    const y = Math.max(4, Math.min(height - 4, baseY + macro + micro));
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push(`L ${width} ${height} L 0 ${height} Z`);
  return pts.join(' ');
}

/**
 * Computes scroll-driven high-density torn paper geometry + live photo seam anchors
 * for all 5 distinct tear mechanisms, preserving exact scroll timing, direction, and reversibility.
 */
export function computeTearGeometry(
  mode: TearModeId,
  rawProgress: number,
  layout: LayoutKind = 'desktop'
): TearGeometryState {
  const progress = clamp01(rawProgress);
  const openness = smoothstep(0.01, 0.88, progress);
  const foldEnvelope = Math.sin(clamp01(openness) * Math.PI) * 0.5 + openness * 0.3;
  const isMobile = layout === 'mobile';
  const minSlit = isMobile ? 16 : 12;

  let holePts: Point2D[] = [];
  let pulpPts: Point2D[] = [];
  let flapPts: Point2D[] = [];
  let seamAnchors: TearSeamAnchors = {
    leftPct: 50,
    rightPct: 50,
    topPct: 50,
    botPct: 50,
    angleDeg: 0,
  };

  if (mode === 'vertical-split') {
    const cx = 500;
    const cy = 500;
    const topY = isMobile ? 20 : 24;
    const botY = isMobile ? 980 : 976;
    const halfW = lerp(minSlit, isMobile ? 456 : 440, openness);
    const steps = 68;
    const capSteps = 28;

    const leftWall: Point2D[] = [];
    const rightWall: Point2D[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const y = lerp(topY, botY, u);
      const bow = 0.78 + 0.22 * Math.sin(u * Math.PI);
      const nL = fiberNoise(u * 3.1, 1.4) * (isMobile ? 7 : 10);
      const nR = fiberNoise(u * 3.1, 7.9) * (isMobile ? 7 : 10);
      leftWall.push({ x: Math.max(14, cx - halfW * bow + nL), y });
      rightWall.push({ x: Math.min(986, cx + halfW * bow + nR), y });
    }
    const topRim: Point2D[] = [];
    for (let i = 1; i < capSteps; i++) {
      const u = i / capSteps;
      const x = lerp(leftWall[0].x, rightWall[0].x, u);
      const arch = Math.sin(u * Math.PI) * (isMobile ? -10 : -14) * openness;
      const nT = fiberNoise(u * 3.6, 5.4) * (isMobile ? 5 : 7);
      topRim.push({ x, y: Math.max(10, topY + arch + nT) });
    }
    const botRim: Point2D[] = [];
    for (let i = 1; i < capSteps; i++) {
      const u = i / capSteps;
      const x = lerp(rightWall[steps].x, leftWall[steps].x, u);
      const arch = Math.sin(u * Math.PI) * (isMobile ? 10 : 14) * openness;
      const nB = fiberNoise(u * 3.6, 9.8) * (isMobile ? 5 : 7);
      botRim.push({ x, y: Math.min(990, botY + arch + nB) });
    }
    holePts = [...leftWall, ...botRim.reverse(), ...rightWall.reverse(), ...topRim.reverse()];
    pulpPts = holePts.map((p, idx) => ({
      x: cx + (p.x - cx) * (1.008 + 0.004 * Math.abs(fiberNoise(idx * 0.12, 2.3))),
      y: cy + (p.y - cy) * 1.006,
    }));
    const rightStart = leftWall.length + botRim.length + 8;
    const rightEnd = rightStart + Math.max(12, rightWall.length - 16);
    const rightSlice = holePts.slice(rightStart, rightEnd);
    flapPts = buildOutwardFlapFromRim(
      rightSlice,
      { x: 1, y: 0 },
      lerp(2, isMobile ? 14 : 22, foldEnvelope),
      11.2
    );
    seamAnchors = {
      leftPct: (cx - halfW) / 10,
      rightPct: (cx + halfW) / 10,
      topPct: topY / 10,
      botPct: botY / 10,
      angleDeg: 0,
    };
  } else if (mode === 'lateral-peel') {
    const rightBleed = 1014;
    const topY = lerp(160, isMobile ? 20 : 24, openness);
    const botY = lerp(820, isMobile ? 980 : 976, openness);
    const leftEdge = lerp(976, isMobile ? 28 : 44, openness);
    const steps = 64;

    const leftTornEdge: Point2D[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const y = lerp(topY, botY, u);
      const curveOffset = Math.sin(u * Math.PI) * -14 * openness;
      const noise = fiberNoise(u * 3.4, 4.1) * (isMobile ? 7 : 11);
      leftTornEdge.push({
        x: Math.max(12, leftEdge + curveOffset + noise),
        y,
      });
    }
    const topTornEdge: Point2D[] = [];
    for (let i = 1; i <= 42; i++) {
      const u = i / 42;
      const x = lerp(leftTornEdge[0].x, rightBleed, u);
      const noise = fiberNoise(u * 2.8, 12.6) * 7;
      topTornEdge.push({ x, y: Math.max(8, topY + noise) });
    }
    const botTornEdge: Point2D[] = [];
    for (let i = 42; i >= 1; i--) {
      const u = i / 42;
      const x = lerp(leftTornEdge[steps].x, rightBleed, u);
      const noise = fiberNoise(u * 2.8, 19.2) * 7;
      botTornEdge.push({ x, y: Math.min(992, botY + noise) });
    }

    holePts = [...topTornEdge, ...botTornEdge, ...leftTornEdge.reverse()];
    pulpPts = holePts.map((p) => ({
      x: p.x > 1000 ? p.x : Math.max(0, p.x - 4),
      y: p.y + (p.y < 500 ? -4 : 4),
    }));
    flapPts = buildOutwardFlapFromRim(
      leftTornEdge.slice(6, steps - 6),
      { x: -1, y: -0.04 },
      lerp(4, isMobile ? 14 : 24, foldEnvelope),
      21.5
    );
    seamAnchors = {
      leftPct: leftEdge / 10,
      rightPct: 100,
      topPct: topY / 10,
      botPct: botY / 10,
      angleDeg: 0,
    };
  } else if (mode === 'diagonal-rip') {
    const halfGap = lerp(minSlit, isMobile ? 452 : 440, openness);
    const slope = isMobile ? -40 : -72;
    const steps = 84;

    const topSeam: Point2D[] = [];
    const botSeam: Point2D[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = lerp(-14, 1014, u);
      const centerLine = 500 + (u - 0.5) * slope;
      const nTop = fiberNoise(u * 4.2, 6.2) * (isMobile ? 8 : 10);
      const nBot = fiberNoise(u * 4.2, 15.8) * (isMobile ? 8 : 10);
      topSeam.push({ x, y: Math.max(8, centerLine - halfGap + nTop) });
      botSeam.push({ x, y: Math.min(992, centerLine + halfGap + nBot) });
    }

    holePts = [...topSeam, ...botSeam.reverse()];
    pulpPts = holePts.map((p) => ({
      x: p.x,
      y: Math.max(0, Math.min(1000, p.y + (p.y < 500 ? -4 : 4))),
    }));
    flapPts = buildOutwardFlapFromRim(
      topSeam.slice(12, steps - 12),
      { x: 0.08, y: -1 },
      lerp(3, isMobile ? 14 : 22, foldEnvelope),
      33.1
    );
    const angleDeg = (Math.atan2(slope, 1000) * 180) / Math.PI;
    seamAnchors = {
      leftPct: 0,
      rightPct: 100,
      topPct: (500 - halfGap) / 10,
      botPct: (500 + halfGap) / 10,
      angleDeg,
    };
  } else if (mode === 'horizontal-split') {
    const halfGap = lerp(minSlit, isMobile ? 464 : 458, openness);
    const steps = 84;
    const topSeam: Point2D[] = [];
    const botSeam: Point2D[] = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = lerp(-14, 1014, u);
      const nTop = fiberNoise(u * 4.6, 8.9) * (isMobile ? 7 : 10);
      const nBot = fiberNoise(u * 4.6, 14.3) * (isMobile ? 7 : 10);
      const gentleArch = Math.sin(u * Math.PI) * 14 * openness;
      topSeam.push({ x, y: Math.max(12, 500 - halfGap - gentleArch + nTop) });
      botSeam.push({ x, y: Math.min(988, 500 + halfGap + gentleArch + nBot) });
    }

    holePts = [...topSeam, ...botSeam.reverse()];
    pulpPts = holePts.map((p) => ({
      x: p.x,
      y: Math.max(0, Math.min(1000, p.y + (p.y < 500 ? -4 : 4))),
    }));
    flapPts = buildOutwardFlapFromRim(
      botSeam.slice(14, steps - 14),
      { x: 0, y: 1 },
      lerp(3, isMobile ? 12 : 20, foldEnvelope),
      44.7
    );
    seamAnchors = {
      leftPct: 0,
      rightPct: 100,
      topPct: (500 - halfGap) / 10,
      botPct: (500 + halfGap) / 10,
      angleDeg: 0,
    };
  } else {
    // broad-peel
    const leftEdge = lerp(950, isMobile ? 22 : 42, openness);
    const topEdge = lerp(920, isMobile ? 20 : 24, openness);
    const steps = 56;

    const topRim: Point2D[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = lerp(leftEdge, 1014, u);
      const arch = Math.sin(u * Math.PI * 0.5) * -12 * openness;
      topRim.push({
        x: Math.max(8, x),
        y: Math.max(10, topEdge + arch + fiberNoise(u * 3.4, 22.1) * 8),
      });
    }
    const rightCorner: Point2D = { x: 1014, y: 974 };
    const botRim: Point2D[] = [];
    for (let i = steps; i >= 0; i--) {
      const u = i / steps;
      const x = lerp(leftEdge, 1014, u);
      botRim.push({
        x: Math.max(8, x),
        y: Math.min(988, 976 + fiberNoise(u * 3.4, 28.4) * 8),
      });
    }
    const leftRim: Point2D[] = [];
    for (let i = steps - 1; i >= 1; i--) {
      const u = i / steps;
      const y = lerp(topRim[0].y, botRim[botRim.length - 1].y, u);
      leftRim.push({
        x: Math.max(10, leftEdge + fiberNoise(u * 3.2, 31.7) * 9),
        y,
      });
    }

    holePts = [...topRim, rightCorner, ...botRim, ...leftRim];
    pulpPts = holePts.map((p) => ({
      x: p.x > 1000 ? p.x : Math.max(0, p.x - 4),
      y: p.y < 500 ? Math.max(0, p.y - 4) : Math.min(1000, p.y + 4),
    }));
    flapPts = buildOutwardFlapFromRim(
      topRim.slice(0, Math.floor(steps * 0.65)),
      { x: -0.35, y: -0.94 },
      lerp(4, isMobile ? 14 : 24, foldEnvelope),
      55.8
    );
    seamAnchors = {
      leftPct: leftEdge / 10,
      rightPct: 100,
      topPct: topEdge / 10,
      botPct: 97.6,
      angleDeg: 0,
    };
  }

  const contentReveal = smoothstep(0.12, 0.58, openness);

  return {
    mode,
    progress,
    openness,
    holePath: pointsToSvgPath(holePts),
    pulpRimPath: pointsToSvgPath(pulpPts),
    revealClipPolygon: pointsToCssPolygon(holePts),
    foldFlapPath: pointsToSvgPath(flapPts),
    foldOpacity: Number((clamp01(openness * 1.2) * (1 - openness * 0.35)).toFixed(3)),
    depthShadowOpacity: Number((0.06 + openness * 0.08).toFixed(3)),
    contentLiftPx: Number(((1 - contentReveal) * 22).toFixed(2)),
    contentOpacity: Number((0.12 + contentReveal * 0.88).toFixed(3)),
    seamAnchors,
  };
}

/**
 * Computes an organic 4-sided torn cotton paper reveal for the Section 04 portrait.
 * All four edges are sculpted with multi-scale paper fiber noise (zero straight lines),
 * expanding smoothly from an initial center slit to a full portrait aperture on scroll.
 */
export function computePortraitTearGeometry(
  rawProgress: number,
  layout: LayoutKind = 'desktop'
): TearGeometryState {
  const progress = clamp01(rawProgress);
  const openness = smoothstep(0.0, 0.86, progress);
  const foldEnvelope = Math.sin(clamp01(openness) * Math.PI) * 0.55 + openness * 0.3;
  const isMobile = layout === 'mobile';

  const cx = 500;
  const cy = 490;
  const halfW = lerp(14, isMobile ? 452 : 444, openness);
  const topY = lerp(240, isMobile ? 24 : 28, openness);
  const botY = lerp(740, isMobile ? 974 : 972, openness);

  const vertSteps = 56;
  const capSteps = 32;

  const leftWall: Point2D[] = [];
  const rightWall: Point2D[] = [];
  for (let i = 0; i <= vertSteps; i++) {
    const u = i / vertSteps;
    const y = lerp(topY, botY, u);
    const bow = 0.88 + 0.12 * Math.sin(u * Math.PI);
    const nL = fiberNoise(u * 3.4, 3.3) * (isMobile ? 9 : 11);
    const nR = fiberNoise(u * 3.4, 8.7) * (isMobile ? 9 : 11);
    leftWall.push({ x: Math.max(18, cx - halfW * bow + nL), y });
    rightWall.push({ x: Math.min(982, cx + halfW * bow + nR), y });
  }

  const topRim: Point2D[] = [];
  for (let i = 1; i < capSteps; i++) {
    const u = i / capSteps;
    const x = lerp(leftWall[0].x, rightWall[0].x, u);
    const arch = Math.sin(u * Math.PI) * -12 * openness;
    const nT = fiberNoise(u * 3.8, 11.4) * (isMobile ? 7 : 9);
    topRim.push({ x, y: Math.max(14, topY + arch + nT) });
  }

  const botRim: Point2D[] = [];
  for (let i = 1; i < capSteps; i++) {
    const u = i / capSteps;
    const x = lerp(rightWall[vertSteps].x, leftWall[vertSteps].x, u);
    const arch = Math.sin(u * Math.PI) * 12 * openness;
    const nB = fiberNoise(u * 3.8, 17.6) * (isMobile ? 7 : 9);
    botRim.push({ x, y: Math.min(986, botY + arch + nB) });
  }

  const holePts = [...leftWall, ...botRim.reverse(), ...rightWall.reverse(), ...topRim.reverse()];
  const pulpPts = holePts.map((p, idx) => ({
    x: cx + (p.x - cx) * (1.008 + 0.004 * Math.abs(fiberNoise(idx * 0.14, 4.1))),
    y: cy + (p.y - cy) * 1.007,
  }));

  const rightStart = leftWall.length + botRim.length + 6;
  const rightEnd = rightStart + Math.max(10, rightWall.length - 12);
  const flapPts = buildOutwardFlapFromRim(
    holePts.slice(rightStart, rightEnd),
    { x: 1, y: 0 },
    lerp(2, isMobile ? 12 : 18, foldEnvelope),
    24.5
  );

  const contentReveal = smoothstep(0.06, 0.45, openness);

  return {
    mode: 'portrait-reveal',
    progress,
    openness,
    holePath: pointsToSvgPath(holePts),
    pulpRimPath: pointsToSvgPath(pulpPts),
    revealClipPolygon: pointsToCssPolygon(holePts),
    foldFlapPath: pointsToSvgPath(flapPts),
    foldOpacity: Number((clamp01(openness * 1.2) * (1 - openness * 0.35)).toFixed(3)),
    depthShadowOpacity: Number((0.07 + openness * 0.08).toFixed(3)),
    contentLiftPx: 0,
    contentOpacity: Number((0.18 + contentReveal * 0.82).toFixed(3)),
    seamAnchors: {
      leftPct: (cx - halfW) / 10,
      rightPct: (cx + halfW) / 10,
      topPct: topY / 10,
      botPct: botY / 10,
      angleDeg: 0,
    },
  };
}
