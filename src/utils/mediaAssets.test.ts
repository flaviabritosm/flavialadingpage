import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  OPTIMIZED_HEADER_TORN_URL,
  OPTIMIZED_HERO_POSTER_URL,
  OPTIMIZED_HERO_VIDEO_URL,
  OPTIMIZED_LOGO_WEBP_URL,
  OPTIMIZED_PORTRAIT_WEBP_URL,
  OPTIMIZED_SECTION07_POSTER_URL,
  OPTIMIZED_SECTION07_VIDEO_URL,
  OPTIMIZED_TORN_DECKLE_V_URL,
  OPTIMIZED_TORN_SUBTLE_H_URL,
  toOptimizedWebp,
  warmImageAssets,
} from './mediaAssets.ts';
import { ALL_PORTFOLIO_ASSETS } from '../backstage/backstageData.ts';
import { SECTION_ASSETS } from '../deliverables/deliverablesData.ts';

const MAX_WEBP_BYTES = 150 * 1024;
const MAX_VIDEO_BYTES = 900 * 1024;

function publicPathForUrl(url: string): string {
  return path.join(process.cwd(), 'public', url.replace(/^\/+/, ''));
}

test('toOptimizedWebp maps local aistudio and cases raster assets and passes through other URLs', () => {
  assert.equal(
    toOptimizedWebp('/assets/cases/flavia_brito.jpg'),
    '/assets/optimized/flavia_brito.webp',
  );
  assert.equal(
    toOptimizedWebp('/assets/aistudio/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.png'),
    '/assets/optimized/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.webp',
  );
  assert.equal(
    toOptimizedWebp('/assets/aistudio/batom_-_facecard_3062a7f2.jpeg'),
    OPTIMIZED_PORTRAIT_WEBP_URL,
  );
  assert.equal(
    toOptimizedWebp('https://example.com/photo.png'),
    'https://example.com/photo.png',
  );
});

test('all explicit optimized constants exist under public/assets/optimized and meet strict byte budgets', () => {
  const imageUrls = [
    OPTIMIZED_HEADER_TORN_URL,
    OPTIMIZED_HERO_POSTER_URL,
    OPTIMIZED_LOGO_WEBP_URL,
    OPTIMIZED_PORTRAIT_WEBP_URL,
    OPTIMIZED_SECTION07_POSTER_URL,
    OPTIMIZED_TORN_SUBTLE_H_URL,
    OPTIMIZED_TORN_DECKLE_V_URL,
  ];

  for (const url of imageUrls) {
    const filePath = publicPathForUrl(url);
    assert.ok(fs.existsSync(filePath), `Missing optimized image: ${url}`);
    const { size } = fs.statSync(filePath);
    assert.ok(size > 0 && size <= MAX_WEBP_BYTES, `${url} size ${size} exceeds ${MAX_WEBP_BYTES} bytes`);
  }

  for (const videoUrl of [OPTIMIZED_HERO_VIDEO_URL, OPTIMIZED_SECTION07_VIDEO_URL]) {
    const filePath = publicPathForUrl(videoUrl);
    assert.ok(fs.existsSync(filePath), `Missing optimized video: ${videoUrl}`);
    const { size } = fs.statSync(filePath);
    assert.ok(size > 0 && size <= MAX_VIDEO_BYTES, `${videoUrl} size ${size} exceeds ${MAX_VIDEO_BYTES} bytes`);
  }
});

test('every portfolio, deliverable, and notebook image maps to an existing optimized WebP <= 150 KB', () => {
  const notebookSrcs = [
    '/assets/cases/flavia_brito.jpg',
    '/assets/cases/la_maison_shop.jpg',
    '/assets/aistudio/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.png',
    '/assets/aistudio/image_457f65d6.png',
    '/assets/aistudio/image_3d8a6460.png',
    '/assets/aistudio/Untitled__10__0be95eeb.png',
    '/assets/aistudio/image_1a42809f.png',
    '/assets/aistudio/washi_xadrez_ea85bb04.png',
    '/assets/aistudio/clipe_rosa_084f2607.png',
    '/assets/aistudio/codigo_barras_574d6e2f.png',
    '/assets/aistudio/coracao_1a745fd7.png',
    '/assets/aistudio/coroa_cdb645bb.png',
    '/assets/aistudio/estrela_prata_e8e2dd8c.png',
    '/assets/aistudio/etiqueta_identidade_530323f1.png',
    '/assets/aistudio/etiqueta_subtitulo_adf0c33d.png',
    '/assets/aistudio/flor_49a15df8.png',
    '/assets/aistudio/foto_nuvens_20f62b87.png',
    '/assets/aistudio/nome_flavia_ded8f140.png',
    '/assets/aistudio/papel_metalizado_f13b4af1.png',
    '/assets/aistudio/papel_rosa_forte_86a6817f.png',
    '/assets/aistudio/papel_rosa_pastel_2547e942.png',
    '/assets/aistudio/papel_verde_agua_97928523.png',
    '/assets/aistudio/titulo_creative_process_94575525.png',
  ];

  const allOriginals = [
    ...ALL_PORTFOLIO_ASSETS.map((a) => a.src),
    ...Object.values(SECTION_ASSETS),
    ...notebookSrcs,
  ];

  for (const originalSrc of allOriginals) {
    const optimizedUrl = toOptimizedWebp(originalSrc);
    assert.ok(
      optimizedUrl.startsWith('/assets/optimized/') && optimizedUrl.endsWith('.webp'),
      `Expected optimized WebP mapping for ${originalSrc}, got ${optimizedUrl}`,
    );
    const filePath = publicPathForUrl(optimizedUrl);
    assert.ok(fs.existsSync(filePath), `Missing optimized WebP for ${originalSrc} at ${optimizedUrl}`);
    const { size } = fs.statSync(filePath);
    assert.ok(size > 0 && size <= MAX_WEBP_BYTES, `${optimizedUrl} size ${size} exceeds ${MAX_WEBP_BYTES} bytes`);
  }
});

test('warmImageAssets safely no-ops in Node and deduplicates decode calls in browser environment', () => {
  assert.equal(warmImageAssets(['/assets/optimized/hero-poster.webp']), 0);

  const decoded: string[] = [];
  class MockImage {
    decoding = '';
    referrerPolicy = '';
    src = '';
    decode() {
      decoded.push(this.src);
      return Promise.resolve();
    }
  }

  (globalThis as Record<string, unknown>).window = globalThis;
  (globalThis as Record<string, unknown>).Image = MockImage;

  try {
    const queuedFirst = warmImageAssets([
      '/assets/optimized/ARTE_DE_DIVULGA__O_-_LA_MAISON_586a099b.webp',
      '/assets/optimized/Arte_principal_de_uma_campanha_de_show_-_LA_MAISON_2cfa4ba3.webp',
      '/assets/optimized/ARTE_DE_DIVULGA__O_-_LA_MAISON_586a099b.webp',
    ]);
    assert.equal(queuedFirst, 2);
    assert.equal(decoded.length, 2);

    const queuedRepeat = warmImageAssets([
      '/assets/optimized/ARTE_DE_DIVULGA__O_-_LA_MAISON_586a099b.webp',
    ]);
    assert.equal(queuedRepeat, 0);
    assert.equal(decoded.length, 2);
  } finally {
    delete (globalThis as Record<string, unknown>).Image;
    delete (globalThis as Record<string, unknown>).window;
  }
});
