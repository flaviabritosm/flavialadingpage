import { WHATSAPP_CTA_URL } from '../constants/cta.ts';
import {
  OPTIMIZED_LOGO_WEBP_URL,
  OPTIMIZED_SECTION07_POSTER_URL,
  OPTIMIZED_SECTION07_VIDEO_URL,
} from '../utils/mediaAssets.ts';

export const SECTION07_VIDEO_SRC =
  '/assets/aistudio/Woman_adjusting_head_in_loop_4ad8ff71_1080p_6c4245f4.mp4';

export const SECTION07_OPTIMIZED_VIDEO_SRC = OPTIMIZED_SECTION07_VIDEO_URL;

export const SECTION07_POSTER_SRC =
  '/assets/aistudio/section07-cta-poster.jpg';

export const SECTION07_OPTIMIZED_POSTER_SRC = OPTIMIZED_SECTION07_POSTER_URL;

export const FOOTER_LOGO_URL =
  '/assets/aistudio/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.png';

export const FOOTER_OPTIMIZED_LOGO_URL = OPTIMIZED_LOGO_WEBP_URL;

export const FOOTER_INSTAGRAM_URL = 'https://www.instagram.com/flaviabritosm/';

export const SECTION07_PALETTE = {
  ctaBg: '#FAF7EE',
  upperBridgeBg: '#FFF9F4',
  hotPink: '#FB0C72',
  hotPinkHover: '#D90761',
  pastelPink: '#F2BED6',
  aquaMint: '#A5DCD1',
  graphiteFooterBg: '#111113',
  inkBlack: '#000000',
} as const;

export const SECTION07_COPY = {
  eyebrow: 'SUA IDENTIDADE MERECE UMA DIREÇÃO PRÓPRIA.',
  headlineBeforeHighlight: 'Sua marca não precisa e ',
  headlineHighlight: 'NÃO DEVE',
  headlineMiddle: ' parecer com todas as outras para ser ',
  headlineScript: 'escolhida.',
  headlineFull:
    'Sua marca não precisa e NÃO DEVE parecer com todas as outras para ser escolhida.',
  paragraph:
    'Vamos descobrir o que diferencia seu negócio e transformar isso em uma estratégia que mude a percepção da sua audiência.',
  ctaLabel: 'Quero estruturar minha marca',
  commercialInfo:
    'Gestão estratégica de conteúdo com contrato mínimo de 6 meses e proposta personalizada. Serviços avulsos são orçados separadamente.',
  brandDescription:
    'Flavia Brito · Head de Conteúdo. Posicionamento, estratégia e gestão de conteúdo para marcas criativas e alternativas.',
  bottomCredit: 'Flavia Brito · Estratégia, Posicionamento e Conteúdo',
  backToTopLabel: 'Voltar ao início',
} as const;

export const FOOTER_NAV_LINKS = [
  { label: 'Início', href: '#hero' },
  { label: 'Problema', href: '#stats' },
  { label: 'Solução', href: '#loop' },
  { label: 'Entregas', href: '#stats-2' },
  { label: 'Trabalhos selecionados', href: '#reelmark' },
  { label: 'Processo', href: '#processo' },
] as const;

export const FOOTER_CONTACT_ITEMS = [
  {
    label: 'flaviabritoconsultora@gmail.com',
    href: 'mailto:flaviabritoconsultora@gmail.com',
    external: false,
  },
  {
    label: '+55 85 9 9419-8966',
    href: WHATSAPP_CTA_URL,
    external: true,
  },
  {
    label: 'Serviços avulsos separados',
    href: '#stats-2',
    external: false,
  },
] as const;

export const VIDEO_INTRINSIC_WIDTH = 1920;
export const VIDEO_INTRINSIC_HEIGHT = 1080;
export const VIDEO_INTRINSIC_RATIO = VIDEO_INTRINSIC_WIDTH / VIDEO_INTRINSIC_HEIGHT;

/**
 * Exact bounding window (in percentage of the 1920x1080 original MP4)
 * containing Flavia Brito, her pink hair, black jacket, hand, and burgundy color card,
 * with a clean 0.4% breathing margin so rounded studio frame edges never clip.
 */
export const VIDEO_SUBJECT_BOUNDS = {
  xStartPct: 54.6,
  xEndPct: 95.1,
  yStartPct: 6.8,
  yEndPct: 93.2,
} as const;

export interface MobileSubjectFraming {
  readonly aspectRatio: number;
  readonly mediaWidthPct: number;
  readonly mediaHeightPct: number;
  readonly mediaLeftPct: number;
  readonly mediaTopPct: number;
  readonly preservesIntrinsicRatio: boolean;
}

export function computeMobileSubjectFraming(): MobileSubjectFraming {
  const widthFrac =
    (VIDEO_SUBJECT_BOUNDS.xEndPct - VIDEO_SUBJECT_BOUNDS.xStartPct) / 100;
  const heightFrac =
    (VIDEO_SUBJECT_BOUNDS.yEndPct - VIDEO_SUBJECT_BOUNDS.yStartPct) / 100;

  // Box aspect ratio (width_box / height_box) matching the subject sub-rectangle in 16:9 pixels
  const aspectRatio = (widthFrac * VIDEO_INTRINSIC_RATIO) / heightFrac;

  // Video dimensions relative to the mobile stage box so scaleX === scaleY (zero distortion)
  const mediaWidthPct = 100 / widthFrac;
  const mediaHeightPct = 100 / heightFrac;

  // Position offsets relative to the mobile stage box
  const mediaLeftPct = -(VIDEO_SUBJECT_BOUNDS.xStartPct / 100) * mediaWidthPct;
  const mediaTopPct = -(VIDEO_SUBJECT_BOUNDS.yStartPct / 100) * mediaHeightPct;

  const renderedRatio = (mediaWidthPct * aspectRatio) / mediaHeightPct;
  const preservesIntrinsicRatio =
    Math.abs(renderedRatio - VIDEO_INTRINSIC_RATIO) < 0.001;

  return {
    aspectRatio: Number(aspectRatio.toFixed(4)),
    mediaWidthPct: Number(mediaWidthPct.toFixed(3)),
    mediaHeightPct: Number(mediaHeightPct.toFixed(3)),
    mediaLeftPct: Number(mediaLeftPct.toFixed(3)),
    mediaTopPct: Number(mediaTopPct.toFixed(3)),
    preservesIntrinsicRatio,
  };
}
