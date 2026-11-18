export type NotebookViewState = 'closed' | 'opening' | 'open' | 'closing';

export type PageSide = 'left' | 'right';

export interface SpreadCopy {
  id: number;
  eyebrow: string;
  title: string;
  leftCopy: string[];
  rightCopy: string[];
  highlights: string[];
}

export const COVER_DATA = {
  brand: 'FLAVIA BRITO',
  title: 'THE CREATIVE PROCESS',
  subtitle: 'planejamento estratégico',
  edition: 'EDIÇÃO AUTORAL · POSICIONAMENTO & CONTEÚDO',
} as const;

export const SPREADS_DATA: readonly SpreadCopy[] = [
  {
    id: 1,
    eyebrow: '01 · O PONTO DE PARTIDA',
    title: 'START HERE',
    leftCopy: [
      'Antes de pensar no tema do próximo post, precisamos:',
      'entender a fundo sua marca.',
    ],
    rightCopy: [
      'Quem ela é?',
      'Por que existe?',
      'O que a torna diferente?',
    ],
    highlights: ['entender a fundo sua marca', 'Quem ela é?', 'Por que existe?', 'O que a torna diferente?'],
  },
  {
    id: 2,
    eyebrow: '02 · A INVESTIGAÇÃO',
    title: 'BRIEFING & VERDADE',
    leftCopy: [
      'Meu trabalho começa nessas respostas.',
    ],
    rightCopy: [
      '↗ Entender a história por trás da marca',
      '↗ Descobrir o que ela tem de único',
      '↗ Encontrar o motivo pelo qual alguém deveria escolhê-la',
    ],
    highlights: [
      'Meu trabalho começa nessas respostas.',
      'Entender a história por trás da marca',
      'Descobrir o que ela tem de único',
      'Encontrar o motivo pelo qual alguém deveria escolhê-la',
    ],
  },
  {
    id: 3,
    eyebrow: '03 · POSICIONAMENTO E ESTRATÉGIA',
    title: 'CONEXÃO ESTRATÉGICA',
    leftCopy: [
      'A partir delas, desenvolvo um posicionamento próprio e uma estratégia de conteúdo que conecta a identidade da marca ao público que ela deseja alcançar.',
    ],
    rightCopy: [
      'MARCA → POSICIONAMENTO → PÚBLICO',
    ],
    highlights: ['posicionamento próprio', 'estratégia de conteúdo'],
  },
  {
    id: 4,
    eyebrow: '04 · ESTRATÉGIA EM AÇÃO',
    title: 'EXECUÇÃO INTENCIONAL',
    leftCopy: [
      'Depois, transformo essa direção em planejamento, campanhas, publicações e decisões orientadas por indicadores.',
    ],
    rightCopy: [
      'Planejamento',
      'Campanhas',
      'Publicações',
      'Indicadores',
    ],
    highlights: ['planejamento', 'campanhas', 'publicações', 'decisões orientadas por indicadores'],
  },
] as const;

export interface SpreadKinematics {
  /** Index of currently dominant spread (0..3) */
  activeSpread: number;
  /** Turn progress for the 3 interior paper sheets (0 = resting right, 1 = flipped left) */
  sheetTurns: [number, number, number];
  /** Hardcover hinge turn progress (0 = closed, 1 = open 180 deg) */
  coverTurn: number;
  /** Overall open presentation factor (0 = closed 3/4 view, 1 = open editorial view) */
  openFactor: number;
  /** Internal scrapbook micro-animation progress for each spread (0..1) */
  spreadAnim: [number, number, number, number];
  /** Stack thickness ratio on left vs right [0..1] */
  leftStackRatio: number;
  rightStackRatio: number;
  /** Normalized scroll progress [0..1] */
  progress: number;
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const SPREAD_SCROLL_ANCHORS: readonly number[] = [0.17, 0.43, 0.69, 0.94];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Maps normalized scroll progress [0..1] into deterministic cover hinge opening,
 * 3 slow interior sheet flips across 4 spreads, internal animations, and stack ratios.
 * Cover stays open on Spread 04 when advancing to Section 04, and only closes when
 * scrolling back up toward the top of the section (progress -> 0).
 */
export function computeSpreadKinematics(rawProgress: number): SpreadKinematics {
  const p = clamp01(rawProgress);

  // Brief closed-cover presentation at start (0..0.02), smooth hinge open (0.02..0.11).
  // Remains open through p = 1.0 when advancing to the next section; closes only when scrolling back to top.
  const coverTurn = smoothstep01((p - 0.02) / 0.09);
  const openFactor = coverTurn;

  // Deliberate, slower spread-to-spread page turns across the 4 spreads (0.25..0.88)
  const t1 = smoothstep01((p - 0.25) / 0.12);
  const t2 = smoothstep01((p - 0.51) / 0.12);
  const t3 = smoothstep01((p - 0.77) / 0.11);

  const sheetTurns: [number, number, number] = [t1, t2, t3];

  // Scroll-coordinated internal animations across each active spread window
  const s1 = clamp01((p - 0.08) / 0.06);
  const s2 = clamp01((p - 0.31) / 0.07);
  const s3 = clamp01((p - 0.57) / 0.07);
  const s4 = clamp01((p - 0.82) / 0.07);

  const spreadAnim: [number, number, number, number] = [s1, s2, s3, s4];

  let activeSpread = 0;
  if (t3 >= 0.5) activeSpread = 3;
  else if (t2 >= 0.5) activeSpread = 2;
  else if (t1 >= 0.5) activeSpread = 1;

  const flippedCount = t1 + t2 + t3;
  const leftStackRatio = flippedCount / 3;
  const rightStackRatio = 1 - leftStackRatio;

  return {
    activeSpread,
    sheetTurns,
    coverTurn,
    openFactor,
    spreadAnim,
    leftStackRatio,
    rightStackRatio,
    progress: p,
  };
}

/**
 * Computes mobile single-page focus (left vs right page) across all 4 spreads during scroll.
 */
export function getMobileFocusSide(progress: number): { spreadIndex: number; side: PageSide } {
  const k = computeSpreadKinematics(progress);
  const idx = k.activeSpread;

  const windows: [number, number][] = [
    [0.11, 0.25],
    [0.37, 0.51],
    [0.63, 0.77],
    [0.88, 1.0],
  ];
  const [start, end] = windows[idx];
  const mid = (start + end) * 0.5;
  return {
    spreadIndex: idx,
    side: progress >= mid ? 'right' : 'left',
  };
}

/**
 * Computes smooth continuous horizontal camera focus on mobile so visitors read ONE full page
 * at a time (Left x = -1.075 -> pan -> Right x = +1.075 -> follow page flip -> next Left page).
 */
export function getMobileFocusX(rawProgress: number): number {
  const p = clamp01(rawProgress);
  const leftX = -1.075;
  const rightX = 1.075;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Spread 1: Left [0..0.155], Pan [0.155..0.205], Right [0.205..0.25], Sheet0 flip [0.25..0.37]
  if (p < 0.25) {
    return lerp(leftX, rightX, smoothstep01((p - 0.155) / 0.05));
  }
  if (p < 0.37) {
    return lerp(rightX, leftX, smoothstep01((p - 0.25) / 0.12));
  }
  // Spread 2: Left [0.37..0.415], Pan [0.415..0.465], Right [0.465..0.51], Sheet1 flip [0.51..0.63]
  if (p < 0.51) {
    return lerp(leftX, rightX, smoothstep01((p - 0.415) / 0.05));
  }
  if (p < 0.63) {
    return lerp(rightX, leftX, smoothstep01((p - 0.51) / 0.12));
  }
  // Spread 3: Left [0.63..0.675], Pan [0.675..0.725], Right [0.725..0.77], Sheet2 flip [0.77..0.88]
  if (p < 0.77) {
    return lerp(leftX, rightX, smoothstep01((p - 0.675) / 0.05));
  }
  if (p < 0.88) {
    return lerp(rightX, leftX, smoothstep01((p - 0.77) / 0.11));
  }
  // Spread 4: Left [0.88..0.92], Pan [0.92..0.96], Right [0.96..1.00]
  return lerp(leftX, rightX, smoothstep01((p - 0.92) / 0.04));
}

/**
 * Computes target studio camera pose based on viewport aspect ratio, open progress,
 * and mobile single-page focus. Desktop and Tablet keep full double-spread framing.
 */
export function computeCameraPose(params: {
  width: number;
  height: number;
  openProgress: number; // 0 = closed presentation, 1 = open editorial view
  mobileSide: PageSide;
  mobileFocusX?: number;
  pointerX?: number;
  pointerY?: number;
}): CameraPose {
  const { width, height, openProgress, mobileSide, mobileFocusX, pointerX = 0, pointerY = 0 } = params;
  const aspect = Math.max(0.45, width / Math.max(1, height));
  const isMobile = width <= 767;
  const isTablet = width > 767 && width <= 1023;
  const openT = smoothstep01(openProgress);

  // Subtle ambient parallax only when closed
  const parallaxScale = isMobile ? 0 : (1 - openT * 0.65);
  const px = pointerX * 0.14 * parallaxScale;
  const py = pointerY * 0.08 * parallaxScale;

  // Closed camera: 3/4 angled editorial presentation centered cleanly
  const closedDistScale = isMobile ? 1.50 : isTablet ? 1.16 : 1.07;
  const closedPos: [number, number, number] = [
    0.26 + px,
    3.48 * closedDistScale + py,
    3.48 * closedDistScale,
  ];
  const closedTarget: [number, number, number] = [
    1.02,
    -0.06,
    0.08,
  ];

  // Open camera:
  // Desktop & Tablet remain unchanged: sees BOTH pages centered cleanly around spine x = 0.
  // Mobile zooms cleanly onto ONE single page at a time (no double-page squeeze).
  let openPos: [number, number, number];
  let openTarget: [number, number, number];

  if (isMobile) {
    const focusX = mobileFocusX ?? (mobileSide === 'left' ? -1.075 : 1.075);
    const dist = Math.max(4.0, 2.75 / aspect);
    openPos = [focusX, dist * 1.12, dist * 0.36];
    openTarget = [focusX, 0.0, -0.16];
  } else {
    // Fit 4.40 units width cleanly inside horizontal frustum at FOV 34 deg with navbar/controls clearance
    const baseDist = isTablet ? 6.15 : aspect < 1.35 ? 6.25 : 5.65;
    openPos = [px * 0.45, baseDist * 0.94 + py * 0.3, baseDist * 0.33];
    openTarget = [0, -0.02, 0.01];
  }

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return {
    position: [
      lerp(closedPos[0], openPos[0], openT),
      lerp(closedPos[1], openPos[1], openT),
      lerp(closedPos[2], openPos[2], openT),
    ],
    target: [
      lerp(closedTarget[0], openTarget[0], openT),
      lerp(closedTarget[1], openTarget[1], openT),
      lerp(closedTarget[2], openTarget[2], openT),
    ],
    fov: isMobile ? 38 : 34,
  };
}
