import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALL_PORTFOLIO_ASSETS,
  FLAVIA_BRITO_ASSETS,
  LA_MAISON_ASSETS,
  PORTFOLIO_OPENING_COPY,
  PROJECT_FLAVIA_BRITO_COPY,
  PROJECT_LA_MAISON_COPY,
} from './backstageData.ts';
import {
  ALL_SPREAD_SPECS,
  computePhotocardTransform,
  FLAVIA_BRITO_SPREAD_SPECS,
  LA_MAISON_SPREAD_SPECS,
  SpreadLayoutKind,
} from './photocardSpread.ts';

function getAsset(id: string) {
  const found = ALL_PORTFOLIO_ASSETS.find((a) => a.id === id);
  assert.ok(found, `Missing asset: ${id}`);
  return found;
}

describe('Section 05 Arquivo Criativo — Official Copy & Asset Integrity', () => {
  it('preserves exact verbatim Portuguese editorial copy across opening and both projects', () => {
    assert.equal(PORTFOLIO_OPENING_COPY.eyebrow, 'PORTFÓLIO / PROJETOS AUTORAIS');
    assert.equal(
      `${PORTFOLIO_OPENING_COPY.headlinePrefix} ${PORTFOLIO_OPENING_COPY.headlineAccent} ${PORTFOLIO_OPENING_COPY.headlineSuffix}`,
      'Ideias são ótimas. Melhor ainda é saber o que fazer com elas.'
    );
    assert.equal(
      PORTFOLIO_OPENING_COPY.supportText,
      'Conheça dois projetos que mostram como transformo identidade, repertório e objetivos em decisões estratégicas e criativas.'
    );

    assert.equal(PROJECT_LA_MAISON_COPY.heading, 'PROJETO 01 — LA MAISON SHOP');
    assert.equal(
      PROJECT_LA_MAISON_COPY.categoryLine,
      'Categoria: Estratégia de conteúdo · Campanhas · Comunidade'
    );
    assert.equal(
      PROJECT_LA_MAISON_COPY.natureLine,
      'Natureza: Marca própria / Projeto autoral'
    );
    assert.equal(
      PROJECT_LA_MAISON_COPY.highlight,
      'Do universo dos fãs para campanhas com propósito.'
    );
    assert.equal(PROJECT_LA_MAISON_COPY.paragraphs.length, 2);
    assert.equal(
      PROJECT_LA_MAISON_COPY.roleLine,
      'Minha atuação: Posicionamento, estratégia, lançamentos, direção criativa e comunidade.'
    );

    assert.equal(PROJECT_FLAVIA_BRITO_COPY.heading, 'PROJETO 02 — FLAVIA BRITO');
    assert.equal(
      PROJECT_FLAVIA_BRITO_COPY.categoryLine,
      'Categoria: Branding · Posicionamento · Estratégia editorial'
    );
    assert.equal(
      PROJECT_FLAVIA_BRITO_COPY.natureLine,
      'Natureza: Marca pessoal / Projeto autoral em desenvolvimento'
    );
    assert.equal(
      PROJECT_FLAVIA_BRITO_COPY.highlight,
      'Construir uma marca também exige olhar para a própria.'
    );
    assert.equal(PROJECT_FLAVIA_BRITO_COPY.paragraphs.length, 2);
    assert.equal(
      PROJECT_FLAVIA_BRITO_COPY.roleLine,
      'Minha atuação: Posicionamento, identidade visual, planejamento, copywriting e criação de conteúdo.'
    );
  });

  it('includes all 15 unique original user-uploaded files and verifies every file on disk', () => {
    assert.equal(LA_MAISON_ASSETS.length, 6);
    assert.equal(FLAVIA_BRITO_ASSETS.length, 9);
    assert.equal(ALL_PORTFOLIO_ASSETS.length, 15);
    assert.equal(LA_MAISON_SPREAD_SPECS.length, 6);
    assert.equal(FLAVIA_BRITO_SPREAD_SPECS.length, 9);
    assert.equal(ALL_SPREAD_SPECS.length, 15);

    const uniquePaths = new Set(ALL_PORTFOLIO_ASSETS.map((a) => a.src));
    assert.equal(uniquePaths.size, 15);

    for (const asset of ALL_PORTFOLIO_ASSETS) {
      assert.ok(asset.src.startsWith('/assets/aistudio/'));
      assert.ok(asset.width > 0 && asset.height > 0);
      const diskPath = path.resolve(process.cwd(), 'public', asset.src.slice(1));
      assert.ok(fs.existsSync(diskPath), `Missing image file on disk: ${diskPath}`);
    }
  });
});

describe('Section 05 Arquivo Criativo — Photocard Spread Choreography', () => {
  const cases: readonly {
    label: string;
    specs: readonly (typeof ALL_SPREAD_SPECS)[number][];
    layout: SpreadLayoutKind;
    stageW: number;
    stageH: number;
  }[] = [
    {
      label: 'La Maison Desktop',
      specs: LA_MAISON_SPREAD_SPECS,
      layout: 'desktop',
      stageW: 700,
      stageH: 740,
    },
    {
      label: 'La Maison Mobile',
      specs: LA_MAISON_SPREAD_SPECS,
      layout: 'mobile',
      stageW: 350,
      stageH: 760,
    },
    {
      label: 'Flavia Brito Desktop',
      specs: FLAVIA_BRITO_SPREAD_SPECS,
      layout: 'desktop',
      stageW: 700,
      stageH: 880,
    },
    {
      label: 'Flavia Brito Mobile',
      specs: FLAVIA_BRITO_SPREAD_SPECS,
      layout: 'mobile',
      stageW: 350,
      stageH: 1120,
    },
  ];

  for (const c of cases) {
    it(`starts grouped, spreads smoothly without leaving stage bounds, and stays reversible (${c.label})`, () => {
      const startFrames = c.specs.map((spec) =>
        computePhotocardTransform(spec, getAsset(spec.assetId), 0, c.layout, c.stageW, c.stageH)
      );
      const midFrames = c.specs.map((spec) =>
        computePhotocardTransform(spec, getAsset(spec.assetId), 0.5, c.layout, c.stageW, c.stageH)
      );
      const endFrames = c.specs.map((spec) =>
        computePhotocardTransform(spec, getAsset(spec.assetId), 1, c.layout, c.stageW, c.stageH)
      );

      // Measure mean pairwise center distance: initial grouped cluster vs final spread
      const meanPairwiseDist = (frames: typeof startFrames) => {
        let sum = 0;
        let count = 0;
        for (let i = 0; i < frames.length; i++) {
          for (let j = i + 1; j < frames.length; j++) {
            sum += Math.hypot(
              frames[i].centerX - frames[j].centerX,
              frames[i].centerY - frames[j].centerY
            );
            count++;
          }
        }
        return sum / count;
      };

      const d0 = meanPairwiseDist(startFrames);
      const dMid = meanPairwiseDist(midFrames);
      const d1 = meanPairwiseDist(endFrames);

      assert.ok(dMid > d0, `${c.label}: expected cards to spread at mid-scroll (${dMid.toFixed(1)} <= ${d0.toFixed(1)})`);
      assert.ok(d1 > dMid, `${c.label}: expected cards to reach open final distribution (${d1.toFixed(1)} <= ${dMid.toFixed(1)})`);
      assert.ok(d1 > d0 * 2.2, `${c.label}: spread expansion ratio too small (${(d1 / d0).toFixed(2)}x)`);

      // Verify all start and end frames remain cleanly inside stage boundaries (zero text overlap / clipping)
      for (const f of [...startFrames, ...endFrames]) {
        assert.ok(f.bounds.left >= 0, `${c.label} ${f.assetId}: left=${f.bounds.left.toFixed(1)} < 0`);
        assert.ok(f.bounds.top >= 0, `${c.label} ${f.assetId}: top=${f.bounds.top.toFixed(1)} < 0`);
        assert.ok(f.bounds.right <= c.stageW + 1, `${c.label} ${f.assetId}: right=${f.bounds.right.toFixed(1)} > ${c.stageW}`);
        assert.ok(f.bounds.bottom <= c.stageH + 1, `${c.label} ${f.assetId}: bottom=${f.bounds.bottom.toFixed(1)} > ${c.stageH}`);
        assert.ok(f.widthPx >= 75, `${c.label} ${f.assetId}: photocard too tiny (${f.widthPx}px)`);
      }

      // Deterministic scroll reversibility
      const reversedMid = c.specs.map((spec) =>
        computePhotocardTransform(spec, getAsset(spec.assetId), 0.5, c.layout, c.stageW, c.stageH)
      );
      assert.deepEqual(reversedMid, midFrames);
    });
  }
});
