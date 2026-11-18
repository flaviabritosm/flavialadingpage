import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROCESS_STEPS_COPY } from './processData.ts';
import {
  STEP_INDIVIDUAL_DURATION_MS,
  activateIndividualSteps,
  computeDesktopCardReveal,
  computeIndividualCardReveal,
  createInitialProcessStates,
  getProcessViewportMode,
  markStepCompleted,
  ProcessCardRevealPose,
  ProcessStepActivationState,
} from './processMotion.ts';
import { ProcessStepIllustration } from './ProcessIllustrations.tsx';

function applyCardPose(card: HTMLElement, pose: ProcessCardRevealPose) {
  card.style.opacity = String(pose.opacity);
  card.style.translate = `0px ${pose.translateYPx}px`;
  card.style.scale = String(pose.scale);
  card.setAttribute('data-proc-reveal', pose.localProgress.toFixed(2));
}

function clearCardPose(card: HTMLElement) {
  card.style.removeProperty('opacity');
  card.style.removeProperty('translate');
  card.style.removeProperty('scale');
  card.removeAttribute('data-proc-reveal');
}

export default function ProcessIllustrationsManager() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [states, setStates] = useState<readonly ProcessStepActivationState[]>(() =>
    createInitialProcessStates(
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    )
  );
  const [mountSlots, setMountSlots] = useState<readonly (HTMLElement | null)[]>([]);

  const statesRef = useRef(states);
  statesRef.current = states;

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const slots = PROCESS_STEPS_COPY.map((_, idx) =>
      document.querySelector<HTMLElement>(`#processo [data-proc-illo="${idx}"]`)
    );
    setMountSlots(slots);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) {
        setStates(createInitialProcessStates(true));
      }
    };
    mq.addEventListener('change', onMotionChange);
    return () => mq.removeEventListener('change', onMotionChange);
  }, []);

  useEffect(() => {
    const gridEl = document.querySelector<HTMLElement>('#processo .proc-grid');
    const cardEls = Array.from(
      document.querySelectorAll<HTMLElement>('#processo .proc-step')
    );
    if (!gridEl || cardEls.length === 0) return;

    if (reducedMotion) {
      setStates(createInitialProcessStates(true));
      cardEls.forEach((card) => clearCardPose(card));
      return;
    }

    let disposed = false;
    let pollId = 0;
    const activeTriggers: Array<{ kill: (revert?: boolean) => void }> = [];
    let currentMode = getProcessViewportMode(window.innerWidth);

    const triggerIllustrationsForIndices = (indices: readonly number[]) => {
      const toActivate = indices.filter(
        (idx) => statesRef.current[idx]?.state === 'waiting'
      );
      if (toActivate.length === 0) return;

      setStates((prev) => {
        const next = activateIndividualSteps(prev, toActivate, false);
        next.forEach((entry, idx) => {
          const prevEntry = prev[idx];
          if (entry.state === 'active' && (!prevEntry || prevEntry.state === 'waiting')) {
            const totalMs =
              entry.delayMs + (STEP_INDIVIDUAL_DURATION_MS[idx] ?? 1000) + 80;
            const tId = window.setTimeout(() => {
              setStates((latest) => markStepCompleted(latest, idx));
            }, totalMs);
            timersRef.current.push(tId);
          }
        });
        return next;
      });
    };

    const killTriggers = () => {
      while (activeTriggers.length > 0) {
        activeTriggers.pop()?.kill(true);
      }
    };

    const bindScrollTriggers = () => {
      if (disposed) return false;
      const ST = window.ScrollTrigger;
      if (!ST) return false;

      killTriggers();
      currentMode = getProcessViewportMode(window.innerWidth);

      if (currentMode === 'desktop-sequence') {
        const syncDesktopProgress = (sectionProgress: number) => {
          const readyIllustrations: number[] = [];
          cardEls.forEach((card, idx) => {
            const pose = computeDesktopCardReveal(sectionProgress, idx, false);
            applyCardPose(card, pose);
            if (pose.shouldTriggerIllustration) {
              readyIllustrations.push(idx);
            }
          });
          if (readyIllustrations.length > 0) {
            triggerIllustrationsForIndices(readyIllustrations);
          }
        };

        const trig = ST.create({
          id: 'processo-cards-desktop',
          trigger: gridEl,
          start: 'top 95%',
          end: 'top 38%',
          scrub: 0.55,
          refreshPriority: 0,
          invalidateOnRefresh: true,
          onUpdate: (self: { progress: number }) => syncDesktopProgress(self.progress),
          onRefresh: (self: { progress: number }) => syncDesktopProgress(self.progress),
        });
        activeTriggers.push(trig);
        const initialDesktopProgress = (trig as { progress?: number }).progress;
        syncDesktopProgress(typeof initialDesktopProgress === 'number' ? initialDesktopProgress : 0);
      } else {
        const isTwoColTablet = window.innerWidth > 600;
        cardEls.forEach((card, idx) => {
          const isSecondInTabletRow = isTwoColTablet && idx % 2 === 1;
          const startStr = isSecondInTabletRow ? 'top 88%' : 'top 93%';
          const endStr = isSecondInTabletRow ? 'top 60%' : 'top 65%';

          const syncCardProgress = (p: number) => {
            const pose = computeIndividualCardReveal(p, false);
            applyCardPose(card, pose);
            if (pose.shouldTriggerIllustration) {
              triggerIllustrationsForIndices([idx]);
            }
          };

          const trig = ST.create({
            id: `processo-card-${idx}`,
            trigger: card,
            start: startStr,
            end: endStr,
            scrub: 0.5,
            refreshPriority: 0,
            invalidateOnRefresh: true,
            onUpdate: (self: { progress: number }) => syncCardProgress(self.progress),
            onRefresh: (self: { progress: number }) => syncCardProgress(self.progress),
          });
          activeTriggers.push(trig);
          const initialCardProgress = (trig as { progress?: number }).progress;
          syncCardProgress(typeof initialCardProgress === 'number' ? initialCardProgress : 0);
        });
      }

      (ST as unknown as { sort?: () => void }).sort?.();
      ST.refresh();
      return true;
    };

    const ensure = () => {
      if (!bindScrollTriggers()) {
        pollId = window.setTimeout(ensure, 120);
      }
    };
    ensure();

    const onResize = () => {
      const nextMode = getProcessViewportMode(window.innerWidth);
      if (nextMode !== currentMode) {
        bindScrollTriggers();
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      if (pollId) clearTimeout(pollId);
      killTriggers();
      cardEls.forEach((card) => clearCardPose(card));
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [reducedMotion]);

  if (mountSlots.length === 0) return null;

  return (
    <>
      {PROCESS_STEPS_COPY.map((step, idx) => {
        const targetSlot = mountSlots[idx];
        if (!targetSlot) return null;
        return createPortal(
          <ProcessStepIllustration
            key={step.id}
            stepId={step.id}
            activation={states[idx] ?? { state: 'waiting', delayMs: 0 }}
          />,
          targetSlot
        );
      })}
    </>
  );
}
