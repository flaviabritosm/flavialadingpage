import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COVER_DATA,
  SPREADS_DATA,
  SPREAD_SCROLL_ANCHORS,
  computeCameraPose,
  computeSpreadKinematics,
  getMobileFocusSide,
  getMobileFocusX,
} from './types.ts';

test('verbatim copy integrity across cover and all 4 spreads', () => {
  assert.equal(COVER_DATA.brand, 'FLAVIA BRITO');
  assert.equal(COVER_DATA.title, 'THE CREATIVE PROCESS');
  assert.equal(COVER_DATA.subtitle, 'planejamento estratégico');

  assert.equal(SPREADS_DATA.length, 4);
  assert.match(SPREADS_DATA[0].leftCopy.join(' '), /Antes de pensar no tema do próximo post, precisamos/);
  assert.match(SPREADS_DATA[0].leftCopy.join(' '), /entender a fundo sua marca\./);
  assert.deepEqual(SPREADS_DATA[0].rightCopy, [
    'Quem ela é?',
    'Por que existe?',
    'O que a torna diferente?',
  ]);

  assert.deepEqual(SPREADS_DATA[1].leftCopy, ['Meu trabalho começa nessas respostas.']);
  assert.deepEqual(SPREADS_DATA[1].rightCopy, [
    '↗ Entender a história por trás da marca',
    '↗ Descobrir o que ela tem de único',
    '↗ Encontrar o motivo pelo qual alguém deveria escolhê-la',
  ]);

  assert.match(
    SPREADS_DATA[2].leftCopy.join(' '),
    /posicionamento próprio e uma estratégia de conteúdo que conecta a identidade da marca ao público que ela deseja alcançar\./
  );

  assert.match(
    SPREADS_DATA[3].leftCopy.join(' '),
    /Depois, transformo essa direção em planejamento, campanhas, publicações e decisões orientadas por indicadores\./
  );
});

test('scroll progress stays open on Spread 04 at end and closes only when scrolling back to start', () => {
  const s0 = computeSpreadKinematics(0);
  assert.equal(s0.activeSpread, 0);
  assert.equal(s0.coverTurn, 0);
  assert.equal(s0.openFactor, 0);
  assert.deepEqual(s0.sheetTurns, [0, 0, 0]);
  assert.equal(s0.leftStackRatio, 0);
  assert.equal(s0.rightStackRatio, 1);

  for (let i = 0; i < SPREAD_SCROLL_ANCHORS.length; i++) {
    const k = computeSpreadKinematics(SPREAD_SCROLL_ANCHORS[i]);
    assert.equal(k.activeSpread, i);
    assert.equal(k.coverTurn, 1);
    assert.equal(k.openFactor, 1);
    assert.ok(Math.abs(k.leftStackRatio + k.rightStackRatio - 1) < 1e-9);
    for (const turn of k.sheetTurns) {
      assert.ok(turn >= 0 && turn <= 1);
    }
  }

  // Reaching end of pages keeps notebook open on Spread 04 to continue seamlessly to next section
  const sEnd = computeSpreadKinematics(1);
  assert.equal(sEnd.activeSpread, 3);
  assert.equal(sEnd.coverTurn, 1);
  assert.equal(sEnd.openFactor, 1);
  assert.deepEqual(sEnd.sheetTurns, [1, 1, 1]);
  assert.equal(sEnd.leftStackRatio, 1);
  assert.equal(sEnd.rightStackRatio, 0);

  // Scrolling back up toward start cleanly flips back and closes cover
  const sBack = computeSpreadKinematics(0.01);
  assert.equal(sBack.coverTurn, 0);
  assert.deepEqual(sBack.sheetTurns, [0, 0, 0]);
});

test('mobile focus switches cleanly between left and right single pages across all 4 spreads', () => {
  const s1Left = getMobileFocusSide(0.13);
  const s1Right = getMobileFocusSide(0.22);
  assert.deepEqual(s1Left, { spreadIndex: 0, side: 'left' });
  assert.deepEqual(s1Right, { spreadIndex: 0, side: 'right' });

  const s4Left = getMobileFocusSide(0.90);
  const s4Right = getMobileFocusSide(0.98);
  assert.deepEqual(s4Left, { spreadIndex: 3, side: 'left' });
  assert.deepEqual(s4Right, { spreadIndex: 3, side: 'right' });

  assert.equal(getMobileFocusX(0.13), -1.075);
  assert.equal(getMobileFocusX(0.22), 1.075);
  assert.equal(getMobileFocusX(0.90), -1.075);
  assert.equal(getMobileFocusX(0.98), 1.075);
});

test('camera pose frames closed book, open desktop spread, and mobile single page cleanly', () => {
  const closedDesktop = computeCameraPose({
    width: 1440,
    height: 900,
    openProgress: 0,
    mobileSide: 'left',
  });
  assert.ok(closedDesktop.target[0] > 0.5, 'Closed book target should center closed cover');

  const openDesktop = computeCameraPose({
    width: 1440,
    height: 900,
    openProgress: 1,
    mobileSide: 'left',
  });
  assert.equal(openDesktop.target[0], 0, 'Open desktop spread centers on spine');

  const openMobileLeft = computeCameraPose({
    width: 390,
    height: 844,
    openProgress: 1,
    mobileSide: 'left',
  });
  const openMobileRight = computeCameraPose({
    width: 390,
    height: 844,
    openProgress: 1,
    mobileSide: 'right',
  });
  assert.ok(openMobileLeft.target[0] < -0.5, 'Mobile left focus frames left page');
  assert.ok(openMobileRight.target[0] > 0.5, 'Mobile right focus frames right page');
});
