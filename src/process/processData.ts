export type ProcessStepId = 'conversa' | 'investigacao' | 'direcao' | 'execucao' | 'acompanhamento';

export interface ProcessStepCopy {
  readonly id: ProcessStepId;
  readonly index: number;
  readonly num: string;
  readonly title: string;
  readonly description: string;
}

export const PROCESS_BRAND_PALETTE = {
  hotPink: '#FB0C72',
  pastelPink: '#F2BED6',
  aquaMint: '#A5DCD1',
  offWhite: '#FFF9F4',
  inkBlack: '#000000',
} as const;

export const PROCESS_HEADER_COPY = {
  eyebrow: 'PROCESSO',
  headlineLead: 'Criatividade sem organização vira ',
  headlineAccent: 'bagunça.',
} as const;

export const PROCESS_STEPS_COPY: readonly ProcessStepCopy[] = [
  {
    id: 'conversa',
    index: 0,
    num: '01',
    title: '01. Primeiro, vamos conversar.',
    description:
      'Conheço seu negócio, entendo suas necessidades e apresento como meu trabalho pode contribuir para seus objetivos.',
  },
  {
    id: 'investigacao',
    index: 1,
    num: '02',
    title: '02. Depois, conheço sua marca de verdade.',
    description:
      'Através de briefing e onboarding, investigo sua identidade, seu público e o cenário atual da comunicação.',
  },
  {
    id: 'direcao',
    index: 2,
    num: '03',
    title: '03. Construímos a direção.',
    description:
      'Desenvolvo a estratégia e organizo o calendário editorial, apresentado para sua aprovação.',
  },
  {
    id: 'execucao',
    index: 3,
    num: '04',
    title: '04. Tiramos o planejamento do papel.',
    description:
      'Conduzo a criação, as aprovações e a publicação dos conteúdos, com até duas rodadas de ajustes por peça ou projeto.',
  },
  {
    id: 'acompanhamento',
    index: 4,
    num: '05',
    title: '05. Acompanhamos e ajustamos a rota.',
    description:
      'Analiso os indicadores das redes sociais e utilizo informações compartilhadas sobre o negócio para orientar as próximas decisões.',
  },
] as const;
