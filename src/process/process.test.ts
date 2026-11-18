import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PROCESS_BRAND_PALETTE,
  PROCESS_HEADER_COPY,
  PROCESS_STEPS_COPY,
} from './processData.ts';
import {
  DESKTOP_ROW_MIN_WIDTH,
  DESKTOP_STEP_STAGGER_MS,
  STEP_INDIVIDUAL_DURATION_MS,
  activateDesktopSequence,
  activateIndividualSteps,
  computeDesktopCardReveal,
  computeIndividualCardReveal,
  computeStepActivationDelay,
  createInitialProcessStates,
  getProcessViewportMode,
  markStepCompleted,
} from './processMotion.ts';

test('Section 06 preserves verbatim Portuguese copy and brand-only palette', () => {
  assert.equal(PROCESS_HEADER_COPY.eyebrow, 'PROCESSO');
  assert.equal(
    `${PROCESS_HEADER_COPY.headlineLead}${PROCESS_HEADER_COPY.headlineAccent}`,
    'Criatividade sem organização vira bagunça.'
  );
  assert.equal(PROCESS_STEPS_COPY.length, 5);

  assert.equal(PROCESS_STEPS_COPY[0].title, '01. Primeiro, vamos conversar.');
  assert.equal(
    PROCESS_STEPS_COPY[0].description,
    'Conheço seu negócio, entendo suas necessidades e apresento como meu trabalho pode contribuir para seus objetivos.'
  );

  assert.equal(PROCESS_STEPS_COPY[1].title, '02. Depois, conheço sua marca de verdade.');
  assert.equal(
    PROCESS_STEPS_COPY[1].description,
    'Através de briefing e onboarding, investigo sua identidade, seu público e o cenário atual da comunicação.'
  );

  assert.equal(PROCESS_STEPS_COPY[2].title, '03. Construímos a direção.');
  assert.equal(
    PROCESS_STEPS_COPY[2].description,
    'Desenvolvo a estratégia e organizo o calendário editorial, apresentado para sua aprovação.'
  );

  assert.equal(PROCESS_STEPS_COPY[3].title, '04. Tiramos o planejamento do papel.');
  assert.equal(
    PROCESS_STEPS_COPY[3].description,
    'Conduzo a criação, as aprovações e a publicação dos conteúdos, com até duas rodadas de ajustes por peça ou projeto.'
  );

  assert.equal(PROCESS_STEPS_COPY[4].title, '05. Acompanhamos e ajustamos a rota.');
  assert.equal(
    PROCESS_STEPS_COPY[4].description,
    'Analiso os indicadores das redes sociais e utilizo informações compartilhadas sobre o negócio para orientar as próximas decisões.'
  );

  assert.deepEqual(Object.values(PROCESS_BRAND_PALETTE), [
    '#FB0C72',
    '#F2BED6',
    '#A5DCD1',
    '#FFF9F4',
    '#000000',
  ]);
});

test('Desktop scroll reveal brings cards 01..05 in gradually as user scrolls and settles at p=1', () => {
  const startPoses = [0, 1, 2, 3, 4].map((i) => computeDesktopCardReveal(0, i));
  assert.ok(startPoses.every((p) => p.opacity === 0 && p.translateYPx === 28));

  // At 25% scroll progress: Card 01 is clearly appearing while Card 05 has not started yet
  const quarter = [0, 1, 2, 3, 4].map((i) => computeDesktopCardReveal(0.25, i));
  assert.ok(quarter[0].opacity > quarter[1].opacity);
  assert.ok(quarter[1].opacity > 0);
  assert.equal(quarter[4].opacity, 0);
  assert.equal(quarter[0].shouldTriggerIllustration, true);
  assert.equal(quarter[4].shouldTriggerIllustration, false);

  // At 65% scroll progress: Cards 01 & 02 settled, Card 03 nearly done, Card 04 rising, Card 05 starting
  const mid = [0, 1, 2, 3, 4].map((i) => computeDesktopCardReveal(0.65, i));
  assert.equal(mid[0].opacity, 1);
  assert.equal(mid[1].opacity, 1);
  assert.ok(mid[2].opacity > mid[3].opacity);
  assert.ok(mid[3].opacity > mid[4].opacity);
  assert.ok(mid[4].opacity > 0);

  // At 100% scroll progress: all 5 cards settled identically at full opacity and zero offset
  const endPoses = [0, 1, 2, 3, 4].map((i) => computeDesktopCardReveal(1, i));
  assert.ok(endPoses.every((p) => p.opacity === 1 && p.translateYPx === 0 && p.scale === 1));
});

test('Mobile individual card scroll reveal stays monotonic, reversible, and triggers illustration near mid-reveal', () => {
  const start = computeIndividualCardReveal(0);
  const mid = computeIndividualCardReveal(0.5);
  const end = computeIndividualCardReveal(1);

  assert.equal(start.opacity, 0);
  assert.equal(start.shouldTriggerIllustration, false);
  assert.ok(mid.opacity > 0.5 && mid.opacity < 1);
  assert.equal(mid.shouldTriggerIllustration, true);
  assert.equal(end.opacity, 1);
  assert.equal(end.translateYPx, 0);
  assert.equal(end.scale, 1);

  assert.deepEqual(computeIndividualCardReveal(0.5), mid);
  assert.deepEqual(computeIndividualCardReveal(0), start);
});

test('Desktop triggers steps 1..5 in subtle 240ms sequence and never retriggers completed steps', () => {
  assert.equal(getProcessViewportMode(1440), 'desktop-sequence');
  assert.equal(getProcessViewportMode(DESKTOP_ROW_MIN_WIDTH), 'desktop-sequence');
  assert.equal(getProcessViewportMode(1080), 'individual-scroll');
  assert.equal(getProcessViewportMode(390), 'individual-scroll');

  const initial = createInitialProcessStates(false);
  assert.ok(initial.every((s) => s.state === 'waiting'));

  const activated = activateDesktopSequence(initial, false);
  activated.forEach((s, idx) => {
    assert.equal(s.state, 'active');
    assert.equal(s.delayMs, idx * DESKTOP_STEP_STAGGER_MS);
  });

  // Step durations stay between 700ms and 1100ms
  STEP_INDIVIDUAL_DURATION_MS.forEach((dur) => {
    assert.ok(dur >= 700 && dur <= 1100, `Duration ${dur} outside reference range`);
  });

  // Completing step 0 locks it in 'done' and subsequent triggers do not overwrite or reset it
  const afterComplete = markStepCompleted(activated, 0);
  assert.equal(afterComplete[0].state, 'done');
  const retriggered = activateDesktopSequence(afterComplete, false);
  assert.equal(retriggered[0].state, 'done');
});

test('Mobile activates each card individually as it enters viewport without triggering unseen cards', () => {
  const initial = createInitialProcessStates(false);

  // Only Card 01 enters viewport first on mobile
  const step1Visible = activateIndividualSteps(initial, [0], false);
  assert.equal(step1Visible[0].state, 'active');
  assert.equal(step1Visible[0].delayMs, 0);
  assert.equal(step1Visible[1].state, 'waiting');
  assert.equal(step1Visible[2].state, 'waiting');
  assert.equal(step1Visible[3].state, 'waiting');
  assert.equal(step1Visible[4].state, 'waiting');

  // Later Card 02 enters viewport
  const step2Visible = activateIndividualSteps(step1Visible, [1], false);
  assert.equal(step2Visible[1].state, 'active');
  assert.equal(step2Visible[1].delayMs, 0);
  assert.equal(step2Visible[2].state, 'waiting');

  // Re-observing Card 01 does not replay or change Card 01
  const done1 = markStepCompleted(step2Visible, 0);
  const reobserved = activateIndividualSteps(done1, [0], false);
  assert.equal(reobserved[0].state, 'done');
  assert.equal(computeStepActivationDelay(2, 'individual-scroll', 0), 0);
});

test('Reduced motion opens all 5 illustrations and cards directly in their settled final state', () => {
  const reduced = createInitialProcessStates(true);
  reduced.forEach((s) => {
    assert.equal(s.state, 'reduced');
    assert.equal(s.delayMs, 0);
  });
  const cardReduced = computeDesktopCardReveal(0, 4, true);
  assert.equal(cardReduced.opacity, 1);
  assert.equal(cardReduced.translateYPx, 0);
  assert.equal(cardReduced.shouldTriggerIllustration, true);
});

test('index.html retains all verbatim Section 06 copy and empty illustration mount slots', () => {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  assert.ok(html.includes('<span class="proc-badge">PROCESSO</span>'));
  assert.ok(html.includes('Criatividade sem organização vira <span class="hw-accent">bagunça.</span>'));
  for (const step of PROCESS_STEPS_COPY) {
    assert.ok(html.includes(step.title), `Missing title: ${step.title}`);
    assert.ok(html.includes(step.description), `Missing description: ${step.description}`);
  }
  for (let i = 0; i < 5; i += 1) {
    assert.ok(html.includes(`data-proc-illo="${i}"`), `Missing mount slot ${i}`);
  }
});
