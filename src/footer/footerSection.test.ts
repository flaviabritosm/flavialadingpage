import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  FOOTER_CONTACT_ITEMS,
  FOOTER_INSTAGRAM_URL,
  FOOTER_LOGO_URL,
  FOOTER_NAV_LINKS,
  SECTION07_COPY,
  SECTION07_PALETTE,
  SECTION07_POSTER_SRC,
  SECTION07_VIDEO_SRC,
  VIDEO_INTRINSIC_RATIO,
  computeMobileSubjectFraming,
} from './footerSectionModel.ts';
import { WHATSAPP_CTA_URL } from '../constants/cta.ts';

test('Section 07 preserves exact verbatim official Portuguese copy', () => {
  assert.equal(SECTION07_COPY.eyebrow, 'SUA IDENTIDADE MERECE UMA DIREÇÃO PRÓPRIA.');
  assert.equal(
    `${SECTION07_COPY.headlineBeforeHighlight}${SECTION07_COPY.headlineHighlight}${SECTION07_COPY.headlineMiddle}${SECTION07_COPY.headlineScript}`,
    'Sua marca não precisa e NÃO DEVE parecer com todas as outras para ser escolhida.'
  );
  assert.equal(SECTION07_COPY.headlineHighlight, 'NÃO DEVE');
  assert.equal(SECTION07_COPY.headlineScript, 'escolhida.');
  assert.equal(
    SECTION07_COPY.paragraph,
    'Vamos descobrir o que diferencia seu negócio e transformar isso em uma estratégia que mude a percepção da sua audiência.'
  );
  assert.equal(SECTION07_COPY.ctaLabel, 'Quero estruturar minha marca');
  assert.equal(
    SECTION07_COPY.commercialInfo,
    'Gestão estratégica de conteúdo com contrato mínimo de 6 meses e proposta personalizada. Serviços avulsos são orçados separadamente.'
  );
  assert.equal(
    SECTION07_COPY.brandDescription,
    'Flavia Brito · Head de Conteúdo. Posicionamento, estratégia e gestão de conteúdo para marcas criativas e alternativas.'
  );
  assert.equal(
    SECTION07_COPY.bottomCredit,
    'Flavia Brito · Estratégia, Posicionamento e Conteúdo'
  );
});

test('Section 07 original MP4 video, extracted poster, and original brand logo exist on disk', () => {
  const videoPath = join(process.cwd(), 'public', SECTION07_VIDEO_SRC);
  const posterPath = join(process.cwd(), 'public', SECTION07_POSTER_SRC);
  const logoPath = join(process.cwd(), 'public', FOOTER_LOGO_URL);

  assert.ok(existsSync(videoPath), `Missing original MP4 video: ${videoPath}`);
  assert.ok(existsSync(posterPath), `Missing extracted poster frame: ${posterPath}`);
  assert.ok(existsSync(logoPath), `Missing original logo: ${logoPath}`);
});

test('Mobile subject framing preserves 16:9 aspect ratio with zero distortion and frames right-hand subject cleanly', () => {
  const framing = computeMobileSubjectFraming();

  assert.equal(framing.preservesIntrinsicRatio, true);
  assert.ok(framing.aspectRatio > 0.7 && framing.aspectRatio < 0.95);
  assert.ok(framing.mediaWidthPct > 200);
  assert.ok(framing.mediaHeightPct > 100);
  assert.ok(framing.mediaLeftPct < -100);
  assert.ok(framing.mediaTopPct < 0);

  const checkRatio = (framing.mediaWidthPct * framing.aspectRatio) / framing.mediaHeightPct;
  assert.ok(Math.abs(checkRatio - VIDEO_INTRINSIC_RATIO) < 0.002);
});

test('Footer preserves official brand palette, real section anchors, email, and WhatsApp CTA URL', () => {
  assert.equal(SECTION07_PALETTE.hotPink, '#FB0C72');
  assert.equal(SECTION07_PALETTE.upperBridgeBg, '#FFF9F4');
  assert.equal(SECTION07_PALETTE.aquaMint, '#A5DCD1');
  assert.equal(SECTION07_PALETTE.pastelPink, '#F2BED6');
  assert.equal(SECTION07_PALETTE.graphiteFooterBg, '#111113');

  assert.deepEqual(
    FOOTER_NAV_LINKS.map((l) => l.href),
    ['#hero', '#stats', '#loop', '#stats-2', '#reelmark', '#processo']
  );

  assert.equal(FOOTER_INSTAGRAM_URL, 'https://www.instagram.com/flaviabritosm/');
  assert.ok(
    FOOTER_CONTACT_ITEMS.some(
      (item) => item.href === 'mailto:flaviabritoconsultora@gmail.com'
    )
  );
  assert.ok(
    FOOTER_CONTACT_ITEMS.some(
      (item) =>
        item.label === '+55 85 9 9419-8966' && item.href === WHATSAPP_CTA_URL
    )
  );
  assert.ok(
    !FOOTER_CONTACT_ITEMS.some((item) =>
      item.label.includes('Contrato mínimo')
    )
  );
  assert.ok(WHATSAPP_CTA_URL.startsWith('https://api.whatsapp.com/send/?phone=558594198966'));
});
