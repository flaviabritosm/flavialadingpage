import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Award, Crown, X } from 'lucide-react';
import { WHATSAPP_CTA_URL } from './constants/cta.ts';
import {
  OPTIMIZED_HEADER_TORN_URL,
  OPTIMIZED_HERO_POSTER_URL,
  OPTIMIZED_HERO_VIDEO_URL,
  OPTIMIZED_LOGO_WEBP_URL,
} from './utils/mediaAssets.ts';

const HERO_VIDEO_URL = '/assets/aistudio/Woman_with_pink_hair_blinking_61872965_073e362a.mp4';
const HEADER_LOGO_URL = '/assets/aistudio/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.png';

const NAV_LINKS = [
  { label: 'Problema', href: '#stats' },
  { label: 'Solução', href: '#loop' },
  { label: 'Entregas', href: '#stats-2' },
  { label: 'Projetos', href: '#reelmark' },
  { label: 'Processo', href: '#processo' },
];

const MARQUEE_WORDS = [
  'Identidade',
  'Posicionamento',
  'Estratégia',
  'Conteúdo',
] as const;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [marqueeActive, setMarqueeActive] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const marqueeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    const vidEl = videoRef.current;
    if (!heroEl || !vidEl) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          vidEl.play().catch(() => {});
        } else if (!vidEl.paused) {
          vidEl.pause();
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(heroEl);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const marqueeEl = marqueeRef.current;
    if (!marqueeEl) return;
    const io = new IntersectionObserver(
      (entries) => {
        setMarqueeActive(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(marqueeEl);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Fixed Torn Paper Header — K-Pop Girly Editorial */}
      <header className="fixed top-0 left-0 right-0 z-40 select-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-full -mt-[8px] h-[44px] sm:h-[48px] overflow-x-clip z-[5]"
        >
          <img
            src={OPTIMIZED_HEADER_TORN_URL}
            alt=""
            aria-hidden="true"
            width={1440}
            height={84}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="w-full min-w-[900px] max-w-none h-full object-fill object-top select-none block"
            style={{
              filter: 'drop-shadow(0 3px 5px rgba(24, 10, 16, 0.10))',
            }}
          />
        </div>

        <div className="relative z-10 bg-[#FFF9F4] text-black">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 py-1.5 lg:py-2">
            <a
              href="#hero"
              aria-label="Flavia Brito — Início"
              className="inline-flex items-center shrink-0 min-h-[40px]"
            >
              <picture>
                <source srcSet={OPTIMIZED_LOGO_WEBP_URL} type="image/webp" />
                <img
                  src={HEADER_LOGO_URL}
                  alt="Flavia Brito"
                  width={2132}
                  height={738}
                  decoding="async"
                  fetchPriority="high"
                  className="h-8 sm:h-9 w-auto object-contain block"
                />
              </picture>
            </a>

            <nav
              aria-label="Navegação principal"
              className="hidden md:flex items-center gap-6 lg:gap-8"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-ui text-[12.5px] font-semibold text-black/80 tracking-[0.05em] uppercase hover:text-[#FB0C72] transition-colors duration-[160ms] ease-editorial whitespace-nowrap py-1.5"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <a
              href={WHATSAPP_CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 bg-transparent border border-black rounded-[8px] px-4 py-2 font-ui text-[12px] font-bold tracking-[0.04em] uppercase text-black hover:bg-[#FB0C72] hover:-translate-y-0.5 transition-all duration-[260ms] ease-editorial whitespace-nowrap shrink-0"
            >
              <span>Estruturar Marca</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </a>

            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="md:hidden min-w-[44px] min-h-[44px] flex flex-col justify-center items-end p-2 -mr-2 space-y-1.5 cursor-pointer"
            >
              <div className="w-6 h-0.5 bg-black" />
              <div className="w-6 h-0.5 bg-black" />
              <div className="w-4 h-0.5 bg-[#FB0C72]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-50 md:hidden bg-[#FFF9F4] text-black flex flex-col transition-all duration-[260ms] ease-editorial ${
          menuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-black/15">
          <a
            href="#hero"
            aria-label="Flavia Brito — Início"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center shrink-0 min-h-[44px]"
          >
            <picture>
              <source srcSet={OPTIMIZED_LOGO_WEBP_URL} type="image/webp" />
              <img
                src={HEADER_LOGO_URL}
                alt="Flavia Brito"
                width={2132}
                height={738}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-10 w-auto object-contain block"
              />
            </picture>
          </a>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="min-w-[44px] min-h-[44px] grid place-items-center -mr-2 text-black cursor-pointer"
          >
            <X className="w-7 h-7" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display font-normal uppercase text-4xl sm:text-5xl text-black hover:text-[#FB0C72] tracking-[-0.02em] leading-[0.95] transition-all duration-[260ms] ease-editorial"
                style={{
                  transitionDelay: menuOpen ? `${i * 50 + 60}ms` : '0ms',
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(14px)',
                }}
              >
                {link.label}
              </a>
          ))}

          <a
            href={WHATSAPP_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-4 inline-flex items-center gap-2 bg-[#FB0C72] hover:bg-[#D90761] border border-black rounded-[8px] shadow-[4px_4px_0_rgba(0,0,0,0.85)] px-6 py-3.5 font-ui text-[13px] font-bold tracking-[0.04em] uppercase text-black transition-all duration-[260ms] ease-editorial whitespace-nowrap"
            style={{
              transitionDelay: menuOpen
                ? `${NAV_LINKS.length * 50 + 60}ms`
                : '0ms',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(14px)',
            }}
          >
            <span>Estruturar Marca</span>
            <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* HERO SECTION — Reskinned to K-Pop Girly Editorial Design System */}
      <section
        ref={heroRef}
        id="hero"
        className="relative w-full min-h-[640px] md:min-h-[560px] md:h-[580px] lg:h-[640px] xl:h-[min(90vh,790px)] overflow-hidden bg-[#FBF7EF] text-black flex flex-col"
      >
        {/* Background Looping Video — enlarged & balanced center-right beside the copy */}
        <video
          ref={videoRef}
          poster={OPTIMIZED_HERO_POSTER_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="
            absolute inset-0 w-full h-full object-cover object-[58%_center]
            md:inset-auto md:top-[22px] md:right-[-6%] lg:right-[-2%] xl:right-[2%]
            md:w-auto md:max-w-none md:h-[104%] lg:h-[105%] md:object-contain md:object-right-bottom
            md:[mask-image:linear-gradient(to_right,transparent_0%,black_10%)]
            md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%)]
          "
        >
          <source src={OPTIMIZED_HERO_VIDEO_URL} type="video/mp4" />
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Hero Content — balanced width aligned with header grid */}
        <div className="relative z-10 flex-1 w-full max-w-[1260px] mx-auto flex flex-col justify-center px-5 sm:px-8 lg:px-10 pt-20 sm:pt-24 pb-10 sm:pb-12">
          <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-[360px] lg:max-w-[440px] xl:max-w-[530px]">
            {/* Eyebrow Tag — Sticker Editorial Pill (DM Sans UI) */}
            <div className="inline-flex items-center gap-2.5 bg-[#FFF9F4] text-black border border-black rounded-[8px] px-3.5 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.85)] mb-4 lg:mb-5 animate-fade-up">
              <Crown className="w-4 h-4 text-[#FB0C72] shrink-0" strokeWidth={2} />
              <span className="font-ui font-bold text-[11.5px] tracking-[0.05em] uppercase leading-tight">
                FLAVIA BRITO | HEAD DE CONTEÚDO
              </span>
            </div>

            {/* Main Heading — First sentence in Anton display font, second sentence in Caveat handwritten font */}
            <h1 className="max-w-[330px] sm:max-w-none animate-fade-up-delay-1">
              <span className="block font-display font-normal uppercase text-black leading-[0.98] tracking-[-0.02em] text-[clamp(2.25rem,8.8vw,3.1rem)] md:text-[clamp(2.55rem,3.6vw,3.85rem)]">
                Sua marca tem um diferencial?
              </span>
              <span className="mt-2 block max-w-[235px] sm:max-w-none font-handwritten font-bold normal-case text-[#D90761] leading-[0.96] tracking-[-0.015em] text-[clamp(1.85rem,7.2vw,2.65rem)] md:text-[clamp(2.2rem,3.1vw,3.25rem)] -rotate-1 origin-left">
                Seu conteúdo{' '}
                <span className="underline decoration-black decoration-[2.5px] underline-offset-[4px]">
                  PRECISA
                </span>{' '}
                deixar isso óbvio.
              </span>
            </h1>

            {/* Subtext — DM Sans (editorial paper backing on mobile only so dark jacket/icon never reduces contrast) */}
            <p className="mt-4 lg:mt-5 text-black/85 text-[14.5px] sm:text-[15.5px] xl:text-[17px] font-body font-medium leading-[1.52] sm:leading-[1.56] max-w-[330px] sm:max-w-[390px] xl:max-w-[485px] bg-[#FFF9F4]/92 md:bg-transparent border border-black md:border-0 rounded-[8px] md:rounded-none px-3.5 py-2.5 md:p-0 shadow-[3px_3px_0_rgba(0,0,0,0.85)] md:shadow-none animate-fade-up-delay-2">
              Eu construo posicionamento, estratégia e gestão de conteúdo para marcas
              criativas e alternativas que querem ser reconhecidas pelo que oferecem
              de melhor e de diferente.
            </p>

            {/* CTA Row — Primary Button (#FB0C72 / #000 text / #000 sticker shadow) */}
            <div className="mt-6 lg:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4 animate-fade-up-delay-3">
              <a
                href={WHATSAPP_CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 bg-[#FB0C72] hover:bg-[#D90761] text-black font-ui font-bold px-5.5 py-3.5 rounded-[8px] border border-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] text-[12.5px] tracking-[0.04em] uppercase hover:-translate-y-0.5 transition-all duration-[260ms] ease-editorial min-h-[44px]"
              >
                <span>Quero estruturar minha marca</span>
                <ArrowUpRight
                  className="w-4 h-4 transition-transform duration-[160ms] ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </a>

              <div className="hidden xl:inline-flex items-center gap-2.5 bg-[#FFF9F4] text-black border border-black rounded-[8px] px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                <Award className="w-4 h-4 text-[#FB0C72] shrink-0" strokeWidth={1.75} />
                <div className="font-ui text-[11px] font-semibold tracking-[0.04em] uppercase leading-tight">
                  <div>Posicionamento</div>
                  <div className="text-black/70">&amp; Conteúdo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Editorial Marquee Strip — Anton + Hot Pink / Aqua Mint sparkles */}
      <section
        ref={marqueeRef}
        id="brand-marquee"
        aria-label="Pilares da marca: Identidade, Posicionamento, Estratégia, Conteúdo"
        className="relative w-full overflow-hidden bg-black text-[#FFF9F4] border-y border-black py-4 sm:py-5 select-none"
      >
        <div
          className={`flex w-max animate-marquee hover:[animation-play-state:paused] ${
            marqueeActive ? '' : 'animate-marquee-paused'
          }`}
        >
          {[0, 1].map((dupIndex) => (
            <div
              key={dupIndex}
              aria-hidden={dupIndex === 1}
              className="flex shrink-0 items-center gap-6 sm:gap-9 lg:gap-12 pr-6 sm:pr-9 lg:pr-12"
            >
              {[0, 1, 2].map((repeatIndex) =>
                MARQUEE_WORDS.map((word, wIndex) => (
                  <div
                    key={`${dupIndex}-${repeatIndex}-${word}`}
                    className="flex shrink-0 items-center gap-6 sm:gap-9 lg:gap-12"
                  >
                    <span
                      className={`font-display font-normal text-xl sm:text-2xl lg:text-[26px] leading-none tracking-[0.01em] uppercase ${
                        wIndex % 2 === 1 ? 'text-[#F2BED6]' : 'text-[#FFF9F4]'
                      }`}
                    >
                      {word}
                    </span>
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      className={`shrink-0 ${
                        wIndex % 2 === 0 ? 'text-[#FB0C72]' : 'text-[#A5DCD1]'
                      }`}
                    >
                      <path
                        d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
