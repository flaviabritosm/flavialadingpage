import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Mail,
  Sparkles,
  X,
} from 'lucide-react';
import { PodiumText } from './PodiumText';
import {
  buildMailtoHref,
  getScopeLabel,
  validateProposalForm,
  type ProposalFormErrors,
  type ProposalFormValues,
  type ServiceScope,
} from '../utils/formValidation';
import laMaisonImg from '../assets/images/la_maison_shop_case_1794663555692.jpg';
import flaviaBrandingImg from '../assets/images/flavia_brito_branding_1794663555585.jpg';

const PROBLEM_SYMPTOMS = [
  {
    id: 'descontos',
    text: 'Precisa oferecer descontos constantemente para vender.',
  },
  {
    id: 'diferenciais',
    text: 'Produz conteúdo, mas não consegue demonstrar seus diferenciais.',
  },
  {
    id: 'direcao',
    text: 'Investe em marketing sem uma direção clara para a marca e se frustra com os resultados.',
  },
] as const;

const SOLUTION_STEPS = [
  {
    step: '01',
    title: 'Identidade',
    summary:
      'Investigação profunda da essência da marca: quem ela é, por que existe e o que sustenta seu diferencial.',
  },
  {
    step: '02',
    title: 'Posicionamento',
    summary:
      'Definição de espaço próprio no mercado para que o público reconheça o valor antes mesmo de olhar para o preço.',
  },
  {
    step: '03',
    title: 'Estratégia',
    summary:
      'Direção clara conectando identidade, objetivos comerciais, calendário editorial e plataformas certas.',
  },
  {
    step: '04',
    title: 'Conteúdo',
    summary:
      'Planejamento, campanhas, publicações e decisões contínuas orientadas por indicadores reais.',
  },
] as const;

const DELIVERABLES = [
  {
    num: '01',
    title: 'Diagnóstico e posicionamento',
    description:
      'Investigação da marca, pesquisa de público, personas, diferenciais, proposta de valor e definição da personalidade de comunicação.',
  },
  {
    num: '02',
    title: 'Estratégia editorial',
    description:
      'Planejamento de conteúdo alinhado aos objetivos do negócio, com calendário editorial e direcionamento para as plataformas digitais.',
  },
  {
    num: '03',
    title: 'Copy e direção criativa',
    description:
      'Legendas, roteiros, campanhas, lançamentos, direção criativa e produção de peças visuais simples conforme o escopo contratado.',
  },
  {
    num: '04',
    title: 'Gestão e otimização',
    description:
      'Agendamento, publicação, acompanhamento de indicadores e ajustes estratégicos a partir do desempenho dos conteúdos.',
  },
] as const;

interface CaseProject {
  id: string;
  number: string;
  title: string;
  category: string;
  nature: string;
  headline: string;
  paragraphs: string[];
  role: string;
  image: string;
  imageAlt: string;
  highlights: string[];
}

const SELECTED_PROJECTS: CaseProject[] = [
  {
    id: 'la-maison-shop',
    number: 'PROJETO 01',
    title: 'LA MAISON SHOP',
    category: 'Estratégia de conteúdo · Campanhas · Comunidade',
    nature: 'Marca própria / Projeto autoral',
    headline: 'Do universo dos fãs para campanhas com propósito.',
    paragraphs: [
      'Na La Maison Shop, desenvolvo coleções especiais para shows de K-pop no Brasil, criando campanhas que aproveitam o contexto dos eventos, os interesses da comunidade e períodos específicos de compra.',
      'Da ideia do produto à divulgação, cada ação é pensada para fazer sentido para aquele público.',
    ],
    role: 'Posicionamento, estratégia, lançamentos, direção criativa e comunidade.',
    image: laMaisonImg,
    imageAlt:
      'Coleção autoral La Maison Shop com embalagens, cards e fitas inspiradas em shows de K-pop',
    highlights: [
      'Coleções sazonais sincronizadas com o calendário de turnês e shows no Brasil',
      'Campanhas desenhadas a partir de códigos culturais e interesses reais dos fãs',
      'Integração entre criação de produto, narrativa de lançamento e comunidade',
    ],
  },
  {
    id: 'flavia-brito',
    number: 'PROJETO 02',
    title: 'FLAVIA BRITO',
    category: 'Branding · Posicionamento · Estratégia editorial',
    nature: 'Marca pessoal / Projeto autoral em desenvolvimento',
    headline: 'Construir uma marca também exige olhar para a própria.',
    paragraphs: [
      'Meu posicionamento profissional nasceu de um processo de investigação, definição de identidade, planejamento editorial e direção criativa.',
      'Os conteúdos já publicados são os primeiros desdobramentos de uma estratégia desenvolvida para comunicar minha atuação com personalidade e consistência.',
    ],
    role: 'Posicionamento, identidade visual, planejamento, copywriting e criação de conteúdo.',
    image: flaviaBrandingImg,
    imageAlt:
      'Mesa criativa com estudos tipográficos, papel creme e paleta de marca Flavia Brito',
    highlights: [
      'Investigação e tradução visual entre editorial clássico e personalidade autoral',
      'Arquitetura verbal para posicionar estratégia de conteúdo acima de métricas de vaidade',
      'Desdobramento editorial contínuo com voz própria e consistência visual',
    ],
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Primeiro, vamos conversar.',
    description:
      'Conheço seu negócio, entendo suas necessidades e apresento como meu trabalho pode contribuir para seus objetivos.',
  },
  {
    num: '02',
    title: 'Depois, conheço sua marca de verdade.',
    description:
      'Através de briefing e onboarding, investigo sua identidade, seu público e o cenário atual da comunicação.',
  },
  {
    num: '03',
    title: 'Construímos a direção.',
    description:
      'Desenvolvo a estratégia e organizo o calendário editorial, apresentado para sua aprovação.',
  },
  {
    num: '04',
    title: 'Tiramos o planejamento do papel.',
    description:
      'Conduzo a criação, as aprovações e a publicação dos conteúdos, com até duas rodadas de ajustes por peça ou projeto.',
  },
  {
    num: '05',
    title: 'Acompanhamos e ajustamos a rota.',
    description:
      'Analiso os indicadores das redes sociais e utilizo informações compartilhadas sobre o negócio para orientar as próximas decisões.',
  },
] as const;

export function LandingSections() {
  const [checkedSymptoms, setCheckedSymptoms] = useState<string[]>([]);
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<CaseProject | null>(
    null
  );
  const [imageFailures, setImageFailures] = useState<Record<string, boolean>>(
    {}
  );

  const [formValues, setFormValues] = useState<ProposalFormValues>({
    name: '',
    contact: '',
    brand: '',
    scope: 'gestao-estrategica',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<ProposalFormErrors>({});
  const [submittedValues, setSubmittedValues] =
    useState<ProposalFormValues | null>(null);

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedProject]);

  function toggleSymptom(id: string) {
    setCheckedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelectStandaloneScope() {
    setFormValues((prev) => ({ ...prev, scope: 'identidade-visual' }));
    setSubmittedValues(null);
    const target = document.getElementById('contato');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = validateProposalForm(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmittedValues(formValues);
  }

  return (
    <div className="relative bg-white text-[#151515] font-inter">
      {/* 02 — PROBLEMA */}
      <section
        id="problema"
        className="w-full bg-white border-b border-[#151515]/10 py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              <p className="text-xs tracking-[0.22em] uppercase text-[#151515]/55 mb-5">
                02 · Problema
              </p>
              <h2 className="font-podium uppercase text-[#151515] text-[clamp(2.1rem,3.8vw,3.4rem)] leading-[1.06] tracking-tight text-balance">
                <PodiumText text="Se o cliente só enxerga o preço, ele não entendeu o valor." />
              </h2>
              <div className="mt-7 space-y-4 text-base sm:text-lg text-[#151515]/80 leading-relaxed max-w-xl">
                <p>
                  Você publica, acompanha tendências, tenta aumentar os
                  seguidores e, mesmo assim, continua ouvindo que a concorrência
                  faz mais barato.
                </p>
                <p className="font-medium text-[#151515]">
                  Já adianto: postar mais não resolve se a sua marca ainda não
                  consegue comunicar o porquê deve ser escolhida.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#F7F4EC] border border-[#151515]/10 p-7 sm:p-10">
                <div className="flex items-baseline justify-between gap-4 pb-5 border-b border-[#151515]/12">
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-[#151515]">
                    Você reconhece esse cenário?
                  </h3>
                  <span className="text-xs font-mono tabular-nums text-[#151515]/60 whitespace-nowrap shrink-0">
                    {checkedSymptoms.length}/{PROBLEM_SYMPTOMS.length} marcados
                  </span>
                </div>

                <div className="divide-y divide-[#151515]/10">
                  {PROBLEM_SYMPTOMS.map((item) => {
                    const checked = checkedSymptoms.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSymptom(item.id)}
                        aria-pressed={checked}
                        className="w-full py-5 flex items-start gap-4 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F60C71]"
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors duration-200 ${
                            checked
                              ? 'bg-[#F60C71] border-[#F60C71] text-white'
                              : 'bg-white border-[#151515]/30 group-hover:border-[#151515]'
                          }`}
                        >
                          {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </span>
                        <span
                          className={`text-sm sm:text-base leading-relaxed transition-colors ${
                            checked
                              ? 'text-[#151515] font-medium'
                              : 'text-[#151515]/80 group-hover:text-[#151515]'
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-5 border-t border-[#151515]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-[#151515]/65 leading-relaxed">
                    {checkedSymptoms.length > 0
                      ? 'Se você marcou um ou mais pontos, o gargalo não é frequência — é posicionamento.'
                      : 'Marque os pontos que fazem parte da sua rotina hoje.'}
                  </p>
                  <a
                    href="#solucao"
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#151515] hover:text-[#F60C71] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Ver a solução</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — SOLUÇÃO */}
      <section
        id="solucao"
        className="w-full bg-[#F7F4EC] border-b border-[#151515]/10 py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.22em] uppercase text-[#151515]/55 mb-5">
              03 · Solução
            </p>
            <h2 className="font-podium uppercase text-[#151515] text-[clamp(2.1rem,3.9vw,3.55rem)] leading-[1.06] tracking-tight text-balance">
              <PodiumText text="Antes de pensar no tema do próximo post, precisamos entender a fundo sua marca." />
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2.5 text-lg sm:text-xl font-medium text-[#151515] leading-snug">
                <p>Quem ela é?</p>
                <p>Por que existe?</p>
                <p>O que a torna diferente?</p>
              </div>
              <p className="text-base font-semibold text-[#F60C71]">
                Meu trabalho começa nessas respostas.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-4 text-base sm:text-lg text-[#151515]/80 leading-relaxed">
              <p>
                A partir delas, desenvolvo um posicionamento próprio e uma
                estratégia de conteúdo que conecta a identidade da marca ao
                público que ela deseja alcançar.
              </p>
              <p>
                Depois, transformo essa direção em planejamento, campanhas,
                publicações e decisões orientadas por indicadores.
              </p>
            </div>
          </div>

          {/* Interactive 4-Pillar Sequence: Identidade -> Posicionamento -> Estratégia -> Conteúdo */}
          <div className="mt-14 bg-white border border-[#151515]/12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#151515]/10">
              {SOLUTION_STEPS.map((pillar, idx) => {
                const isActive = activePillarIndex === idx;
                return (
                  <button
                    key={pillar.step}
                    type="button"
                    onClick={() => setActivePillarIndex(idx)}
                    aria-pressed={isActive}
                    className={`p-6 sm:p-7 text-left transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#F60C71] ${
                      isActive
                        ? 'bg-[#151515] text-[#F7F4EC]'
                        : 'bg-white text-[#151515] hover:bg-[#F7F4EC]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span
                        className={`text-xs font-mono tabular-nums tracking-widest ${
                          isActive ? 'text-[#F60C71]' : 'text-[#151515]/45'
                        }`}
                      >
                        {pillar.step}
                      </span>
                      {idx < SOLUTION_STEPS.length - 1 && (
                        <ArrowRight
                          aria-hidden="true"
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#F60C71]' : 'text-[#151515]/30'
                          }`}
                        />
                      )}
                    </div>
                    <div className="font-podium uppercase text-2xl sm:text-[26px] tracking-wide leading-none">
                      <PodiumText text={pillar.title} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-6 sm:px-8 py-5 border-t border-[#151515]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="text-xs uppercase tracking-[0.2em] text-[#151515]/50 shrink-0">
                Identidade → Posicionamento → Estratégia → Conteúdo
              </div>
              <p className="text-sm sm:text-base text-[#151515]/85 leading-relaxed">
                {SOLUTION_STEPS[activePillarIndex].summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 — ENTREGAS */}
      <section
        id="entregas"
        className="w-full bg-[#151515] text-[#F7F4EC] py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl mb-14">
            <p className="text-xs tracking-[0.22em] uppercase text-[#F7F4EC]/55 mb-5">
              04 · Entregas
            </p>
            <h2 className="font-podium uppercase text-[#F7F4EC] text-[clamp(2.2rem,4vw,3.65rem)] leading-[1.06] tracking-tight text-balance">
              <PodiumText text="Estratégia na prática. Sem papo de guru." />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DELIVERABLES.map((item) => (
              <div
                key={item.num}
                className="border border-white/12 bg-white/[0.025] p-7 sm:p-9 flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-mono tabular-nums tracking-[0.2em] text-[#F60C71]">
                    {item.num}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#F7F4EC]/75 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            {/* 05. Identidade visual — serviço avulso */}
            <div className="md:col-span-2 border border-[#F60C71]/40 bg-[#1B1719] p-7 sm:p-9 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="text-xs font-mono tabular-nums tracking-[0.2em] text-[#F60C71] mb-3">
                  05 · SERVIÇO AVULSO
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-3">
                  Identidade visual — serviço avulso
                </h3>
                <p className="text-sm sm:text-base text-[#F7F4EC]/80 leading-relaxed">
                  Desenvolvimento de paleta, tipografia, logotipo simples e guia
                  de marca. Contratação separada da gestão de conteúdo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelectStandaloneScope}
                className="group inline-flex items-center justify-center gap-2.5 border border-[#F60C71] text-[#F7F4EC] hover:bg-[#F60C71] hover:text-white px-6 py-3.5 text-xs tracking-widest uppercase transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Orçar identidade avulsa</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 05 — TRABALHOS SELECIONADOS */}
      <section
        id="trabalhos"
        className="w-full bg-white border-b border-[#151515]/10 py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl mb-14">
            <p className="text-xs tracking-[0.22em] uppercase text-[#151515]/55 mb-5">
              PORTFÓLIO · PROJETOS AUTORAIS
            </p>
            <h2 className="font-podium uppercase text-[#151515] text-[clamp(2.1rem,3.9vw,3.55rem)] leading-[1.06] tracking-tight text-balance">
              <PodiumText text="Ideias são ótimas. Melhor ainda é saber o que fazer com elas." />
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#151515]/75 leading-relaxed max-w-2xl">
              Conheça dois projetos que mostram como transformo identidade,
              repertório e objetivos em decisões estratégicas e criativas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
            {SELECTED_PROJECTS.map((project) => {
              const imgFailed = Boolean(imageFailures[project.id]);
              return (
                <article
                  key={project.id}
                  className="flex flex-col border border-[#151515]/12 bg-[#F7F4EC]/55"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#151515] relative">
                    {!imgFailed ? (
                      <img
                        src={project.image}
                        alt={project.imageAlt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImageFailures((prev) => ({
                            ...prev,
                            [project.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#151515] to-[#2B1822] text-[#F7F4EC]">
                        <Sparkles className="w-8 h-8 text-[#F60C71] mb-3" />
                        <span className="font-podium uppercase text-2xl tracking-wider">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-7 sm:p-9 flex-1 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs uppercase tracking-wider text-[#151515]/55 mb-2">
                        <span className="font-semibold text-[#151515]">
                          {project.number}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.nature}</span>
                      </div>

                      <p className="text-xs tracking-wide text-[#F60C71] font-medium mb-4">
                        {project.category}
                      </p>

                      <h3 className="font-podium uppercase text-3xl sm:text-4xl text-[#151515] tracking-tight leading-none mb-3">
                        {project.title}
                      </h3>
                      <p className="text-lg font-semibold text-[#151515] leading-snug mb-4">
                        {project.headline}
                      </p>

                      <div className="space-y-3 text-sm sm:text-base text-[#151515]/80 leading-relaxed">
                        {project.paragraphs.map((p, idx) => (
                          <p key={idx}>{p}</p>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-[#151515]/12 flex flex-col gap-4">
                      <p className="text-xs sm:text-sm text-[#151515]/80 leading-relaxed">
                        <strong className="font-semibold text-[#151515]">
                          Minha atuação:{' '}
                        </strong>
                        {project.role}
                      </p>

                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#151515] hover:text-[#F60C71] transition-colors cursor-pointer"
                        >
                          <span>Explorar detalhes do projeto</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 06 — PROCESSO */}
      <section
        id="processo"
        className="w-full bg-[#F7F4EC] border-b border-[#151515]/10 py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <p className="text-xs tracking-[0.22em] uppercase text-[#151515]/55 mb-5">
                06 · Processo
              </p>
              <h2 className="font-podium uppercase text-[#151515] text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.06] tracking-tight text-balance">
                <PodiumText text="Criatividade sem organização vira bagunça." />
              </h2>
              <p className="mt-5 text-base text-[#151515]/75 leading-relaxed max-w-md">
                Um método claro de cinco etapas para transformar repertório e
                posicionamento em constância prática, aprovações ágeis e análise
                real de desempenho.
              </p>
            </div>

            <div className="lg:col-span-7 divide-y divide-[#151515]/12 border-y border-[#151515]/12">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="py-7 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline"
                >
                  <div className="sm:col-span-2 text-xs font-mono tabular-nums tracking-[0.2em] text-[#F60C71] font-semibold">
                    {step.num}
                  </div>
                  <div className="sm:col-span-10">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#151515] tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#151515]/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 07 — CTA FINAL */}
      <section
        id="contato"
        className="w-full bg-white py-20 sm:py-24 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              <p className="text-xs tracking-[0.22em] uppercase text-[#F60C71] font-semibold mb-5">
                SUA MARCA MERECE UMA DIREÇÃO PRÓPRIA
              </p>
              <h2 className="font-podium uppercase text-[#151515] text-[clamp(2.2rem,3.9vw,3.55rem)] leading-[1.06] tracking-tight text-balance">
                <PodiumText text="Sua marca não precisa e NÃO DEVE parecer com todas as outras para ser escolhida." />
              </h2>
              <p className="mt-6 text-base sm:text-lg text-[#151515]/80 leading-relaxed max-w-xl">
                Vamos descobrir o que torna seu negócio diferente e transformar
                isso em uma estratégia que mude a forma como o público enxerga
                sua marca.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#proposta-nome"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('proposta-nome')?.focus();
                  }}
                  className="group inline-flex items-center gap-2.5 bg-[#151515] hover:bg-black text-white font-inter px-7 py-4 text-xs tracking-widest uppercase transition-colors duration-200 whitespace-nowrap shrink-0"
                >
                  <span>Quero estruturar minha marca</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

              <p className="mt-6 text-xs sm:text-sm text-[#151515]/60 leading-relaxed max-w-md">
                Gestão estratégica de conteúdo com contrato mínimo de 6 meses e
                proposta personalizada. Serviços avulsos são orçados
                separadamente.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#F7F4EC] border border-[#151515]/12 p-7 sm:p-10">
                {submittedValues ? (
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#F60C71]">
                      <Check className="w-4 h-4" />
                      <span>Briefing pronto para envio</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-[#151515] tracking-tight">
                      Obrigada, {submittedValues.name.trim()}.
                    </h3>
                    <p className="text-sm sm:text-base text-[#151515]/80 leading-relaxed">
                      Sua solicitação para{' '}
                      <strong>
                        {submittedValues.brand.trim() || 'sua marca'}
                      </strong>{' '}
                      ({getScopeLabel(submittedValues.scope)}) foi preparada com
                      sucesso. Envie diretamente para o e-mail de atendimento
                      abaixo ou ajuste os dados se preferir.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <a
                        href={buildMailtoHref(submittedValues)}
                        className="inline-flex items-center gap-2 bg-[#151515] hover:bg-black text-white px-6 py-3.5 text-xs tracking-widest uppercase transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Enviar por e-mail agora</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setSubmittedValues(null)}
                        className="text-xs uppercase tracking-widest font-semibold text-[#151515]/70 hover:text-[#151515] px-2 py-2 cursor-pointer"
                      >
                        Editar informações
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleFormSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-[#151515] tracking-tight">
                        Solicite sua proposta personalizada
                      </h3>
                      <p className="text-xs sm:text-sm text-[#151515]/65 mt-1">
                        Preencha os campos abaixo para dar o primeiro passo da
                        nossa conversa.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="proposta-nome"
                          className="block text-xs font-medium uppercase tracking-wider text-[#151515]/75 mb-1.5"
                        >
                          Seu nome
                        </label>
                        <input
                          id="proposta-nome"
                          type="text"
                          value={formValues.name}
                          onChange={(e) => {
                            setFormValues((v) => ({ ...v, name: e.target.value }));
                            if (formErrors.name) {
                              setFormErrors((err) => ({
                                ...err,
                                name: undefined,
                              }));
                            }
                          }}
                          placeholder="Como podemos te chamar?"
                          className="w-full bg-white border border-[#151515]/20 focus:border-[#151515] px-3.5 py-2.5 text-sm text-[#151515] outline-none transition-colors"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-[#C81E4C]">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="proposta-contato"
                          className="block text-xs font-medium uppercase tracking-wider text-[#151515]/75 mb-1.5"
                        >
                          E-mail ou WhatsApp
                        </label>
                        <input
                          id="proposta-contato"
                          type="text"
                          value={formValues.contact}
                          onChange={(e) => {
                            setFormValues((v) => ({
                              ...v,
                              contact: e.target.value,
                            }));
                            if (formErrors.contact) {
                              setFormErrors((err) => ({
                                ...err,
                                contact: undefined,
                              }));
                            }
                          }}
                          placeholder="voce@suamarca.com.br"
                          className="w-full bg-white border border-[#151515]/20 focus:border-[#151515] px-3.5 py-2.5 text-sm text-[#151515] outline-none transition-colors"
                        />
                        {formErrors.contact && (
                          <p className="mt-1 text-xs text-[#C81E4C]">
                            {formErrors.contact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="proposta-marca"
                          className="block text-xs font-medium uppercase tracking-wider text-[#151515]/75 mb-1.5"
                        >
                          Marca ou @
                        </label>
                        <input
                          id="proposta-marca"
                          type="text"
                          value={formValues.brand}
                          onChange={(e) =>
                            setFormValues((v) => ({
                              ...v,
                              brand: e.target.value,
                            }))
                          }
                          placeholder="@suamarca"
                          className="w-full bg-white border border-[#151515]/20 focus:border-[#151515] px-3.5 py-2.5 text-sm text-[#151515] outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="proposta-escopo"
                          className="block text-xs font-medium uppercase tracking-wider text-[#151515]/75 mb-1.5"
                        >
                          Formato de interesse
                        </label>
                        <select
                          id="proposta-escopo"
                          value={formValues.scope}
                          onChange={(e) =>
                            setFormValues((v) => ({
                              ...v,
                              scope: e.target.value as ServiceScope,
                            }))
                          }
                          className="w-full bg-white border border-[#151515]/20 focus:border-[#151515] px-3.5 py-2.5 text-sm text-[#151515] outline-none transition-colors"
                        >
                          <option value="gestao-estrategica">
                            Gestão estratégica (6m+)
                          </option>
                          <option value="identidade-visual">
                            Identidade visual (avulso)
                          </option>
                          <option value="completo">
                            Gestão + Identidade visual
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="proposta-mensagem"
                        className="block text-xs font-medium uppercase tracking-wider text-[#151515]/75 mb-1.5"
                      >
                        Momento atual da sua marca
                      </label>
                      <textarea
                        id="proposta-mensagem"
                        rows={3}
                        value={formValues.message}
                        onChange={(e) => {
                          setFormValues((v) => ({
                            ...v,
                            message: e.target.value,
                          }));
                          if (formErrors.message) {
                            setFormErrors((err) => ({
                              ...err,
                              message: undefined,
                            }));
                          }
                        }}
                        placeholder="O que sua marca faz e qual é o principal desafio hoje?"
                        className="w-full bg-white border border-[#151515]/20 focus:border-[#151515] px-3.5 py-2.5 text-sm text-[#151515] outline-none transition-colors resize-none"
                      />
                      {formErrors.message && (
                        <p className="mt-1 text-xs text-[#C81E4C]">
                          {formErrors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#151515] hover:bg-black text-white px-6 py-3.5 text-xs tracking-widest uppercase transition-colors cursor-pointer"
                    >
                      <span>Quero estruturar minha marca</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-[#F7F4EC] text-[#151515] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#151515]/20 p-6 sm:p-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Fechar projeto"
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 text-[#151515]/70 hover:text-[#151515] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <p className="text-xs uppercase tracking-[0.2em] text-[#151515]/55 mb-2">
              {selectedProject.number} · {selectedProject.nature}
            </p>
            <h3
              id="case-modal-title"
              className="font-podium uppercase text-3xl sm:text-4xl text-[#151515] tracking-tight leading-none mb-2"
            >
              {selectedProject.title}
            </h3>
            <p className="text-xs text-[#F60C71] font-medium mb-6">
              {selectedProject.category}
            </p>

            <div className="aspect-[16/10] w-full overflow-hidden bg-[#151515] mb-6">
              <img
                src={selectedProject.image}
                alt={selectedProject.imageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-lg font-semibold text-[#151515] mb-3">
              {selectedProject.headline}
            </p>
            <div className="space-y-3 text-sm sm:text-base text-[#151515]/80 leading-relaxed mb-6">
              {selectedProject.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="border-t border-[#151515]/12 pt-5 mb-6">
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#151515]/55 mb-3">
                Desdobramentos estratégicos
              </h4>
              <ul className="space-y-2 text-sm text-[#151515]/85">
                {selectedProject.highlights.map((hl) => (
                  <li key={hl} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 w-2.5 h-[2px] bg-[#F60C71] shrink-0"
                    />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#151515]/12 pt-5">
              <p className="text-xs text-[#151515]/70 max-w-sm">
                <strong>Minha atuação:</strong> {selectedProject.role}
              </p>
              <a
                href="#contato"
                onClick={() => setSelectedProject(null)}
                className="inline-flex items-center gap-2 bg-[#151515] hover:bg-black text-white px-5 py-3 text-xs tracking-widest uppercase transition-colors"
              >
                <span>Quero estruturar minha marca</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
