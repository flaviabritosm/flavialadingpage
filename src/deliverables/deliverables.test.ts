import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_PALETTE_SWATCHES,
  DELIVERABLES_HEADING,
  DELIVERABLES_SERVICES,
  SECTION_ASSETS,
} from './deliverablesData.ts';
import {
  buildTornHorizonPath,
  computePortraitTearGeometry,
  computeTearGeometry,
  fiberNoise,
} from './paperTearMath.ts';

test('Section 04 preserves verbatim headline and exact 5 unnumbered service texts', () => {
  assert.equal(DELIVERABLES_HEADING.lead, 'Estratégia na prática.');
  assert.equal(DELIVERABLES_HEADING.accent, 'Sem papo de guru.');

  assert.equal(DELIVERABLES_SERVICES.length, 5);

  assert.equal(DELIVERABLES_SERVICES[0].title, 'Diagnóstico e posicionamento');
  assert.equal(
    DELIVERABLES_SERVICES[0].description,
    'Investigação da marca, pesquisa de público, personas, diferenciais, proposta de valor e definição da personalidade de comunicação.'
  );

  assert.equal(DELIVERABLES_SERVICES[1].title, 'Estratégia editorial');
  assert.equal(
    DELIVERABLES_SERVICES[1].description,
    'Planejamento de conteúdo alinhado aos objetivos do negócio, com calendário editorial e direcionamento para as plataformas digitais.'
  );

  assert.equal(DELIVERABLES_SERVICES[2].title, 'Copy e direção criativa');
  assert.equal(
    DELIVERABLES_SERVICES[2].description,
    'Legendas, roteiros, campanhas, lançamentos, direção criativa e produção de peças visuais conforme o escopo contratado.'
  );
  assert.equal(
    DELIVERABLES_SERVICES[2].description.includes('simples'),
    false,
    'Verbatim copy for Copy e direção criativa omits "simples"'
  );

  assert.equal(DELIVERABLES_SERVICES[3].title, 'Gestão e otimização');
  assert.equal(
    DELIVERABLES_SERVICES[3].description,
    'Agendamento, publicação, acompanhamento de indicadores e ajustes estratégicos a partir do desempenho dos conteúdos.'
  );

  assert.equal(DELIVERABLES_SERVICES[4].title, 'Identidade visual');
  assert.equal(
    DELIVERABLES_SERVICES[4].description,
    'Desenvolvimento de paleta, tipografia, logotipo e guia de marca.'
  );
  assert.equal(
    DELIVERABLES_SERVICES[4].description.includes('simples'),
    false,
    'Verbatim copy for Identidade visual omits "simples"'
  );

  // Zero numerical order labels / counters anywhere in service titles or kickers
  DELIVERABLES_SERVICES.forEach((svc) => {
    assert.equal(/\b0?[1-5]\b/.test(svc.title), false);
    assert.equal(/\d\s*\/\s*0?5/.test(svc.kicker), false);
    assert.equal('index' in svc, false);
  });

  // 5 unique tear modes, never repeating
  const uniqueModes = new Set(DELIVERABLES_SERVICES.map((s) => s.tearMode));
  assert.equal(uniqueModes.size, 5);

  // Authentic unaltered photo & monogram asset paths
  assert.equal(
    SECTION_ASSETS.portrait,
    '/assets/aistudio/batom_-_facecard_3062a7f2.jpeg'
  );
  assert.equal(SECTION_ASSETS.monogram, '/assets/aistudio/Untitled__10__0be95eeb.png');
  assert.equal(BRAND_PALETTE_SWATCHES.length, 5);
});

test('Organic fiberNoise stays bounded in [-1, 1] and is non-periodic zigzag-free', () => {
  const samples = Array.from({ length: 40 }, (_, i) => fiberNoise(i * 0.19, 3.7));
  samples.forEach((v) => {
    assert.ok(Number.isFinite(v));
    assert.ok(v >= -1.01 && v <= 1.01, `Noise sample out of bounds: ${v}`);
  });
  const distinct = new Set(samples.map((v) => v.toFixed(3)));
  assert.ok(distinct.size > 30, 'Paper fiber edge noise must avoid repeating regular zigzags');
});

test('All 5 tear modes progress monotonically from narrow closed slit (p=0) to open surface (p=1) and stay reversible', () => {
  const modes = DELIVERABLES_SERVICES.map((s) => s.tearMode);

  modes.forEach((mode) => {
    const closed = computeTearGeometry(mode, 0, 'desktop');
    const mid = computeTearGeometry(mode, 0.45, 'desktop');
    const open = computeTearGeometry(mode, 1, 'desktop');

    assert.equal(closed.openness, 0);
    assert.ok(mid.openness > 0.35 && mid.openness < 0.7);
    assert.equal(open.openness, 1);

    assert.ok(closed.contentOpacity < mid.contentOpacity);
    assert.ok(mid.contentOpacity < open.contentOpacity);
    assert.equal(open.contentLiftPx, 0);
    assert.equal(open.contentOpacity, 1);

    assert.ok(closed.holePath.startsWith('M ') && closed.holePath.endsWith(' Z'));
    assert.ok(open.holePath.startsWith('M ') && open.holePath.endsWith(' Z'));
    assert.ok(open.pulpRimPath.startsWith('M ') && open.pulpRimPath.endsWith(' Z'));
    assert.ok(open.foldFlapPath.startsWith('M ') && open.foldFlapPath.endsWith(' Z'));
    assert.ok(open.revealClipPolygon.startsWith('polygon('));
    assert.equal(open.holePath.includes('NaN'), false);

    // Exact scroll reversibility
    assert.deepEqual(computeTearGeometry(mode, 0.45, 'desktop'), mid);
    assert.deepEqual(computeTearGeometry(mode, 0, 'desktop'), closed);
  });
});

test('Mobile adaptation widens open vertical/horizontal safe clearance cleanly', () => {
  DELIVERABLES_SERVICES.forEach(({ tearMode }) => {
    const mobOpen = computeTearGeometry(tearMode, 1, 'mobile');
    assert.equal(mobOpen.openness, 1);
    assert.equal(mobOpen.contentOpacity, 1);
    assert.equal(mobOpen.holePath.includes('NaN'), false);
    assert.equal(mobOpen.revealClipPolygon.includes('NaN'), false);
  });
});

test('Full-bleed directional tears reach edge bounds cleanly and torn closing strata stay finite', () => {
  const diag = computeTearGeometry('diagonal-rip', 1, 'desktop');
  const horiz = computeTearGeometry('horizontal-split', 1, 'desktop');
  const lat = computeTearGeometry('lateral-peel', 1, 'desktop');

  assert.ok(diag.holePath.includes('1014.0'), 'Diagonal rip should bleed past right poster seam');
  assert.ok(horiz.holePath.includes('-14.0'), 'Horizontal split should bleed past left poster seam');
  assert.ok(lat.holePath.includes('1014.0'), 'Lateral peel should peel cleanly off right edge');

  const horizon = buildTornHorizonPath(1440, 140, 64, 12, 4.2, 48);
  assert.ok(horizon.startsWith('M 0.0 '));
  assert.ok(horizon.endsWith('L 1440 140 L 0 140 Z'));
  assert.equal(horizon.includes('NaN'), false);
});

test('Portrait tear geometry opens monotonically with organic 4-sided edges and stays reversible', () => {
  const closed = computePortraitTearGeometry(0, 'desktop');
  const mid = computePortraitTearGeometry(0.45, 'desktop');
  const open = computePortraitTearGeometry(1, 'desktop');
  const mobOpen = computePortraitTearGeometry(1, 'mobile');

  assert.equal(closed.mode, 'portrait-reveal');
  assert.equal(closed.openness, 0);
  assert.ok(mid.openness > 0.3 && mid.openness < 0.75);
  assert.equal(open.openness, 1);
  assert.equal(mobOpen.openness, 1);

  assert.ok(open.seamAnchors.leftPct < mid.seamAnchors.leftPct);
  assert.ok(open.seamAnchors.rightPct > mid.seamAnchors.rightPct);
  assert.ok(open.seamAnchors.topPct < mid.seamAnchors.topPct);
  assert.ok(open.seamAnchors.botPct > mid.seamAnchors.botPct);

  assert.equal(open.holePath.includes('NaN'), false);
  assert.equal(open.revealClipPolygon.includes('NaN'), false);
  assert.deepEqual(computePortraitTearGeometry(0.45, 'desktop'), mid);
  assert.deepEqual(computePortraitTearGeometry(0, 'desktop'), closed);
});
