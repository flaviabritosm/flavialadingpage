export type TearModeId =
  | 'vertical-split'
  | 'lateral-peel'
  | 'diagonal-rip'
  | 'horizontal-split'
  | 'broad-peel';

export interface DeliverableService {
  readonly id: 'diagnostico' | 'estrategia' | 'copy' | 'gestao' | 'identidade';
  readonly tearMode: TearModeId;
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
  readonly editorialNote: string;
  readonly surfaceBg: string;
  readonly surfaceText: 'dark' | 'light';
  readonly accentHex: string;
}

export const DELIVERABLES_HEADING = {
  eyebrow: 'ENTREGAS',
  lead: 'Estratégia na prática.',
  accent: 'Sem papo de guru.',
} as const;

export const DELIVERABLES_SERVICES: readonly DeliverableService[] = [
  {
    id: 'diagnostico',
    tearMode: 'vertical-split',
    kicker: 'Investigação & Essência',
    title: 'Diagnóstico e posicionamento',
    description:
      'Investigação da marca, pesquisa de público, personas, diferenciais, proposta de valor e definição da personalidade de comunicação.',
    editorialNote: 'mapeamento de identidade',
    surfaceBg: '#F2BED6',
    surfaceText: 'dark',
    accentHex: '#FB0C72',
  },
  {
    id: 'estrategia',
    tearMode: 'lateral-peel',
    kicker: 'Direção & Sistema Editorial',
    title: 'Estratégia editorial',
    description:
      'Planejamento de conteúdo alinhado aos objetivos do negócio, com calendário editorial e direcionamento para as plataformas digitais.',
    editorialNote: 'estrutura de publicação',
    surfaceBg: '#A5DCD1',
    surfaceText: 'dark',
    accentHex: '#000000',
  },
  {
    id: 'copy',
    tearMode: 'diagonal-rip',
    kicker: 'Narrativa & Direção de Arte',
    title: 'Copy e direção criativa',
    description:
      'Legendas, roteiros, campanhas, lançamentos, direção criativa e produção de peças visuais conforme o escopo contratado.',
    editorialNote: 'conceito em campanha',
    surfaceBg: '#FB0C72',
    surfaceText: 'light',
    accentHex: '#FFF9F4',
  },
  {
    id: 'gestao',
    tearMode: 'horizontal-split',
    kicker: 'Acompanhamento & Rotina',
    title: 'Gestão e otimização',
    description:
      'Agendamento, publicação, acompanhamento de indicadores e ajustes estratégicos a partir do desempenho dos conteúdos.',
    editorialNote: 'evolução contínua',
    surfaceBg: '#FFF9F4',
    surfaceText: 'dark',
    accentHex: '#FB0C72',
  },
  {
    id: 'identidade',
    tearMode: 'broad-peel',
    kicker: 'Linguagem & Sistema Visual',
    title: 'Identidade visual',
    description:
      'Desenvolvimento de paleta, tipografia, logotipo e guia de marca.',
    editorialNote: 'código estético próprio',
    surfaceBg: '#F7ECE3',
    surfaceText: 'dark',
    accentHex: '#FB0C72',
  },
] as const;

export const BRAND_PALETTE_SWATCHES = [
  { name: 'Rosa Forte', hex: '#FB0C72', darkText: false },
  { name: 'Off-White', hex: '#FFF9F4', darkText: true },
  { name: 'Verde-Água', hex: '#A5DCD1', darkText: true },
  { name: 'Rosa Pastel', hex: '#F2BED6', darkText: true },
  { name: 'Preto Editorial', hex: '#000000', darkText: false },
] as const;

export const SECTION_ASSETS = {
  portrait: '/assets/aistudio/batom_-_facecard_3062a7f2.jpeg',
  monogram: '/assets/aistudio/Untitled__10__0be95eeb.png',
  paperHotPink: '/assets/aistudio/papel_rosa_forte_86a6817f.png',
  paperPastelPink: '/assets/aistudio/papel_rosa_pastel_2547e942.png',
  paperAqua: '/assets/aistudio/papel_verde_agua_97928523.png',
  washiCheckered: '/assets/aistudio/washi_xadrez_ea85bb04.png',
  paperFoil: '/assets/aistudio/papel_metalizado_f13b4af1.png',
} as const;
