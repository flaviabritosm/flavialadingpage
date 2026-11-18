export type ProjectId = 'la-maison' | 'flavia-brito';

export interface PortfolioAsset {
  readonly id: string;
  readonly project: ProjectId;
  readonly title: string;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly priority?: 'primary' | 'secondary';
  readonly isStaticReel?: boolean;
}

export interface ProjectEditorialCopy {
  readonly id: ProjectId;
  readonly heading: string;
  readonly categoryLine: string;
  readonly natureLine: string;
  readonly highlight: string;
  readonly paragraphs: readonly string[];
  readonly roleLine: string;
}

export const PORTFOLIO_OPENING_COPY = {
  eyebrow: 'PORTFÓLIO / PROJETOS AUTORAIS',
  headlinePrefix: 'Ideias são',
  headlineAccent: 'ótimas.',
  headlineSuffix: 'Melhor ainda é saber o que fazer com elas.',
  supportText:
    'Conheça dois projetos que mostram como transformo identidade, repertório e objetivos em decisões estratégicas e criativas.',
} as const;

export const PROJECT_LA_MAISON_COPY: ProjectEditorialCopy = {
  id: 'la-maison',
  heading: 'PROJETO 01 — LA MAISON SHOP',
  categoryLine: 'Categoria: Estratégia de conteúdo · Campanhas · Comunidade',
  natureLine: 'Natureza: Marca própria / Projeto autoral',
  highlight: 'Do universo dos fãs para campanhas com propósito.',
  paragraphs: [
    'Na La Maison Shop, desenvolvo coleções especiais para shows de K-pop no Brasil, criando campanhas que aproveitam o contexto dos eventos, os interesses da comunidade e períodos específicos de compra.',
    'Da ideia do produto à divulgação, cada ação é pensada para fazer sentido para aquele público.',
  ],
  roleLine:
    'Minha atuação: Posicionamento, estratégia, lançamentos, direção criativa e comunidade.',
};

export const PROJECT_FLAVIA_BRITO_COPY: ProjectEditorialCopy = {
  id: 'flavia-brito',
  heading: 'PROJETO 02 — FLAVIA BRITO',
  categoryLine: 'Categoria: Branding · Posicionamento · Estratégia editorial',
  natureLine: 'Natureza: Marca pessoal / Projeto autoral em desenvolvimento',
  highlight: 'Construir uma marca também exige olhar para a própria.',
  paragraphs: [
    'Meu posicionamento profissional nasceu de um processo de investigação, definição de identidade, planejamento editorial e direção criativa.',
    'Os conteúdos já publicados são os primeiros desdobramentos de uma estratégia desenvolvida para comunicar minha atuação com personalidade e consistência.',
  ],
  roleLine:
    'Minha atuação: Posicionamento, identidade visual, planejamento, copywriting e criação de conteúdo.',
};

export const LA_MAISON_ASSETS: readonly PortfolioAsset[] = [
  {
    id: 'lm-logo',
    project: 'la-maison',
    title: 'Logotipo Oficial — La Maison Shop',
    src: '/assets/aistudio/Logotipo_Oficial_-_La_Maison_fa4e0d9b.png',
    alt: 'Logotipo oficial da La Maison Shop com lightstick roxo dentro de uma casa estilizada e tipografia em pixel art.',
    width: 1000,
    height: 1000,
    priority: 'secondary',
  },
  {
    id: 'lm-taemin-poster',
    project: 'la-maison',
    title: 'Campanha Taemin — World Tour LiMiNaL in Brasil',
    src: '/assets/aistudio/Arte_principal_de_uma_campanha_de_show_-_LA_MAISON_2cfa4ba3.png',
    alt: 'Arte principal da campanha Nova Coleção 2026-27 Taemin World Tour LiMiNaL in Brasil da La Maison Shop.',
    width: 1080,
    height: 1350,
    priority: 'primary',
  },
  {
    id: 'lm-taemin-shirt',
    project: 'la-maison',
    title: 'Camiseta Azul — Coleção LiMiNaL',
    src: '/assets/aistudio/foto_detalhada_de_produto_-_1_-_LA_MAISON_b246acd2.jpeg',
    alt: 'Foto detalhada da camiseta azul real 2026-27 Taemin World Tour LiMiNaL in Brasil no estúdio.',
    width: 1512,
    height: 1512,
    priority: 'secondary',
  },
  {
    id: 'lm-collection-backstage',
    project: 'la-maison',
    title: 'Coleção de Produtos — Produção La Maison Shop',
    src: '/assets/aistudio/Foto_de_uma_cole__o_de_produtos_-_LA_MAISON_e62be919.jpeg',
    alt: 'Bastidores da bancada de produção com camisetas embaladas e encartes da coleção LiMiNaL.',
    width: 900,
    height: 1600,
    priority: 'secondary',
  },
  {
    id: 'lm-baekhyun-shirts',
    project: 'la-maison',
    title: 'Produtos — Linha Baekhyun',
    src: '/assets/aistudio/foto_detalhada_de_produto_-_2_-_LA_MAISON_4ab68811.jpeg',
    alt: 'Quatro camisetas pretas dobradas da linha Baekhyun: BAM, Hello World, Baekhyun e Delight BBH.',
    width: 900,
    height: 1600,
    priority: 'secondary',
  },
  {
    id: 'lm-uau-campaign',
    project: 'la-maison',
    title: 'Campanha UAU Collection — Brasil',
    src: '/assets/aistudio/ARTE_DE_DIVULGA__O_-_LA_MAISON_586a099b.jpeg',
    alt: 'Arte de divulgação da UAU Collection da La Maison Shop com ecobags e camisetas estampadas.',
    width: 1280,
    height: 1600,
    priority: 'primary',
  },
];

export const FLAVIA_BRITO_ASSETS: readonly PortfolioAsset[] = [
  {
    id: 'fb-logo',
    project: 'flavia-brito',
    title: 'Logotipo Oficial — Flavia Brito',
    src: '/assets/aistudio/Logo_-_Flavia_Brito_5a215915.png',
    alt: 'Logotipo oficial Flavia Brito combinando tipografia serifada preta e caligrafia pink.',
    width: 2132,
    height: 738,
    priority: 'secondary',
  },
  {
    id: 'fb-portrait',
    project: 'flavia-brito',
    title: 'Fotografia Profissional — Flavia Brito',
    src: '/assets/aistudio/Fotografia_profissional_-_FLAVIA_BRITO_1d1be4ba.png',
    alt: 'Retrato editorial de Flavia Brito em poltrona verde-menta com óculos escuros, moletom branco, notebook e papéis cor-de-rosa.',
    width: 1122,
    height: 1402,
    priority: 'primary',
  },
  {
    id: 'fb-brand-guide',
    project: 'flavia-brito',
    title: 'Guia de Marca — Flavia Brito',
    src: '/assets/aistudio/guia_de_marca_-_FLAVIA_BRITO_da47d2e7.png',
    alt: 'Prancha Guia de Marca de Flavia Brito com colagem editorial, foto com gato preto e pilares Criatividade, Autenticidade e Liberdade.',
    width: 1526,
    height: 852,
    priority: 'primary',
  },
  {
    id: 'fb-monogram',
    project: 'flavia-brito',
    title: 'Monograma — Flavia Brito',
    src: '/assets/aistudio/monograma_-_flavia_brito_0be95eeb.png',
    alt: 'Monograma FB unindo letra F serifada em pink vibrante e B em pincel preto com brilho.',
    width: 505,
    height: 512,
    priority: 'secondary',
  },
  {
    id: 'fb-palette',
    project: 'flavia-brito',
    title: 'Paleta com Monograma — Flavia Brito',
    src: '/assets/aistudio/paleta_com_monograma_-_FLAVIA_BRITO_f0a63dcb.png',
    alt: 'Estudo cromático em quatro quadrantes com aplicações do monograma em rosa claro, verde menta, creme e pink vibrante.',
    width: 1547,
    height: 762,
    priority: 'secondary',
  },
  {
    id: 'fb-typography',
    project: 'flavia-brito',
    title: 'Fontes e Tipografia — Flavia Brito',
    src: '/assets/aistudio/fontes__tipografia__-_FLAVIA_BRITO_868f6943.png',
    alt: 'Espécime tipográfico com Hemgjord Lettering, Shrikhand, Betm Rounded, Breathing e Times New Roman MT Condensed.',
    width: 1072,
    height: 646,
    priority: 'secondary',
  },
  {
    id: 'fb-textures',
    project: 'flavia-brito',
    title: 'Texturas e Elementos — Flavia Brito',
    src: '/assets/aistudio/texturas_e_elementos_-_FLAVIA_BRITO_ec1634cb.png',
    alt: 'Quadro de texturas com papéis rasgados, glitter roxo, lantejoulas, adesivos de gato em meio-tom, fita e manuscrito.',
    width: 1525,
    height: 701,
    priority: 'secondary',
  },
  {
    id: 'fb-carousel-cover',
    project: 'flavia-brito',
    title: 'Capa de Carrossel — Flavia Brito',
    src: '/assets/aistudio/capa_de_carrossel_-_1_-_FLAVIA_BRITO_910dfe08.png',
    alt: 'Capa de carrossel com Flavia Brito e a chamada Tudo que você precisa saber antes de me contratar.',
    width: 1080,
    height: 1350,
    priority: 'primary',
  },
  {
    id: 'fb-reel-cover',
    project: 'flavia-brito',
    title: 'Capa de Reel — Flavia Brito',
    src: '/assets/aistudio/capa_de_reel_-_FLAVIA_BRITO_e5cd0004.png',
    alt: 'Capa estática de reel com o título Como eu criei uma comunidade que coloca dinheiro no meu bolso.',
    width: 1080,
    height: 1920,
    priority: 'primary',
    isStaticReel: true,
  },
];

export const ALL_PORTFOLIO_ASSETS: readonly PortfolioAsset[] = [
  ...LA_MAISON_ASSETS,
  ...FLAVIA_BRITO_ASSETS,
];
