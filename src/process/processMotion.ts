export const DESKTOP_ROW_MIN_WIDTH = 1081;
export const DESKTOP_STEP_STAGGER_MS = 240;
export const TABLET_BATCH_STAGGER_MS = 160;
export const STEP_INDIVIDUAL_DURATION_MS: readonly number[] = [
  900, // 01 Conversa
  1050, // 02 Investigação
  950, // 03 Direção
  1000, // 04 Execução
  1000, // 05 Acompanhamento
] as const;

export const CARD_REVEAL_WINDOWS: readonly { readonly start: number; readonly end: number }[] = [
  { start: 0.0, end: 0.34 },
  { start: 0.16, end: 0.5 },
  { start: 0.32, end: 0.66 },
  { start: 0.48, end: 0.82 },
  { start: 0.64, end: 0.98 },
] as const;

export type ProcessViewportMode = 'desktop-sequence' | 'individual-scroll';

export interface ProcessStepActivationState {
  readonly state: 'waiting' | 'active' | 'done' | 'reduced';
  readonly delayMs: number;
}

export interface ProcessCardRevealPose {
  readonly localProgress: number;
  readonly opacity: number;
  readonly translateYPx: number;
  readonly scale: number;
  readonly shouldTriggerIllustration: boolean;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

export function computeDesktopCardReveal(
  sectionProgress: number,
  cardIndex: number,
  reducedMotion = false
): ProcessCardRevealPose {
  if (reducedMotion) {
    return {
      localProgress: 1,
      opacity: 1,
      translateYPx: 0,
      scale: 1,
      shouldTriggerIllustration: true,
    };
  }

  const win = CARD_REVEAL_WINDOWS[Math.max(0, Math.min(4, cardIndex))];
  const span = Math.max(0.01, win.end - win.start);
  const raw = clamp01((clamp01(sectionProgress) - win.start) / span);
  const eased = easeOutCubic(raw);

  return {
    localProgress: raw,
    opacity: Number(eased.toFixed(4)),
    translateYPx: Number(((1 - eased) * 28).toFixed(2)),
    scale: Number((0.965 + eased * 0.035).toFixed(4)),
    shouldTriggerIllustration: raw >= 0.42,
  };
}

export function computeIndividualCardReveal(
  cardScrollProgress: number,
  reducedMotion = false
): ProcessCardRevealPose {
  if (reducedMotion) {
    return {
      localProgress: 1,
      opacity: 1,
      translateYPx: 0,
      scale: 1,
      shouldTriggerIllustration: true,
    };
  }

  const raw = clamp01(cardScrollProgress);
  const eased = easeOutCubic(raw);

  return {
    localProgress: raw,
    opacity: Number(eased.toFixed(4)),
    translateYPx: Number(((1 - eased) * 26).toFixed(2)),
    scale: Number((0.97 + eased * 0.03).toFixed(4)),
    shouldTriggerIllustration: raw >= 0.42,
  };
}

export function getProcessViewportMode(viewportWidth: number): ProcessViewportMode {
  return viewportWidth >= DESKTOP_ROW_MIN_WIDTH
    ? 'desktop-sequence'
    : 'individual-scroll';
}

export function computeStepActivationDelay(
  stepIndex: number,
  mode: ProcessViewportMode,
  batchOrderIndex = 0
): number {
  const clampedStep = Math.max(0, Math.min(4, stepIndex));
  if (mode === 'desktop-sequence') {
    return clampedStep * DESKTOP_STEP_STAGGER_MS;
  }
  return Math.max(0, batchOrderIndex) * TABLET_BATCH_STAGGER_MS;
}

export function createInitialProcessStates(
  reducedMotion: boolean
): readonly ProcessStepActivationState[] {
  return Array.from({ length: 5 }, () => ({
    state: reducedMotion ? 'reduced' : 'waiting',
    delayMs: 0,
  }));
}

export function activateDesktopSequence(
  current: readonly ProcessStepActivationState[],
  reducedMotion: boolean
): readonly ProcessStepActivationState[] {
  if (reducedMotion) {
    return createInitialProcessStates(true);
  }
  return current.map((entry, idx) => {
    if (entry.state === 'active' || entry.state === 'done' || entry.state === 'reduced') {
      return entry;
    }
    return {
      state: 'active',
      delayMs: computeStepActivationDelay(idx, 'desktop-sequence'),
    };
  });
}

export function activateIndividualSteps(
  current: readonly ProcessStepActivationState[],
  visibleStepIndices: readonly number[],
  reducedMotion: boolean
): readonly ProcessStepActivationState[] {
  if (reducedMotion) {
    return createInitialProcessStates(true);
  }
  if (visibleStepIndices.length === 0) return current;

  const sortedNew = [...visibleStepIndices]
    .filter((idx) => {
      const entry = current[idx];
      return Boolean(entry) && entry.state === 'waiting';
    })
    .sort((a, b) => a - b);

  if (sortedNew.length === 0) return current;

  const batchOrderMap = new Map<number, number>();
  sortedNew.forEach((stepIdx, batchIdx) => {
    batchOrderMap.set(stepIdx, batchIdx);
  });

  return current.map((entry, idx) => {
    const batchIdx = batchOrderMap.get(idx);
    if (batchIdx === undefined) return entry;
    return {
      state: 'active',
      delayMs: computeStepActivationDelay(idx, 'individual-scroll', batchIdx),
    };
  });
}

export function markStepCompleted(
  current: readonly ProcessStepActivationState[],
  stepIndex: number
): readonly ProcessStepActivationState[] {
  const entry = current[stepIndex];
  if (!entry || entry.state !== 'active') return current;
  return current.map((item, idx) =>
    idx === stepIndex ? { ...item, state: 'done' } : item
  );
}
