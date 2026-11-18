import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowUpRight, Instagram, Mail } from 'lucide-react';
import { WHATSAPP_CTA_URL } from './constants/cta.ts';
import {
  FOOTER_CONTACT_ITEMS,
  FOOTER_INSTAGRAM_URL,
  FOOTER_LOGO_URL,
  FOOTER_NAV_LINKS,
  FOOTER_OPTIMIZED_LOGO_URL,
  SECTION07_COPY,
  SECTION07_OPTIMIZED_POSTER_SRC,
  SECTION07_OPTIMIZED_VIDEO_SRC,
  SECTION07_POSTER_SRC,
  SECTION07_VIDEO_SRC,
} from './footer/footerSectionModel.ts';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function useIsDesktopLg(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isDesktopLg = useIsDesktopLg();
  const [videoActivated, setVideoActivated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const loadIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVideoActivated(true);
          loadIo.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );
    loadIo.observe(el);

    const playIo = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        const video = videoRef.current;
        if (!video) return;

        if (visible) {
          if (video.paused) {
            video.play().catch(() => {});
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: '200px 0px' }
    );
    playIo.observe(el);

    return () => {
      loadIo.disconnect();
      playIo.disconnect();
    };
  }, [reducedMotion, isDesktopLg]);

  const fadeProps = (delay = 0) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: {
            duration: 0.48,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      ref={sectionRef}
      id="footer"
      aria-label="07 — Encerramento e Rodapé"
      className="relative w-full overflow-x-clip bg-[#FAF7EE] text-black font-body selection:bg-[#FB0C72]/20 selection:text-black"
    >
      {/* Ponte visual suave do off-white da Seção 06 (#FFF9F4) para o canvas do vídeo (#FAF7EE) */}
      <div
        aria-hidden="true"
        className="pointer-events-none h-10 lg:h-12 w-full bg-gradient-to-b from-[#FFF9F4] to-[#FAF7EE]"
      />

      {/* ÁREA PRINCIPAL — A ÚLTIMA PALAVRA */}
      <div className="relative mx-auto w-full max-w-[1440px] lg:min-h-[640px] xl:min-h-[750px] flex flex-col justify-center">
        {/* Camada de vídeo integrada no Desktop (montada apenas quando >= 1024px) */}
        {isDesktopLg ? (
          <div
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute inset-y-0 right-0 w-full overflow-hidden"
          >
            {reducedMotion || !videoActivated ? (
              <picture>
                <source srcSet={SECTION07_OPTIMIZED_POSTER_SRC} type="image/webp" />
                <img
                  src={SECTION07_POSTER_SRC}
                  alt="Flavia Brito em retrato editorial em estúdio"
                  width={1920}
                  height={1080}
                  loading="lazy"
                  decoding="async"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-auto max-w-none aspect-video select-none"
                />
              </picture>
            ) : (
              <video
                ref={videoRef}
                poster={SECTION07_OPTIMIZED_POSTER_SRC}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-auto max-w-none aspect-video select-none"
              >
                <source src={SECTION07_OPTIMIZED_VIDEO_SRC} type="video/mp4" />
                <source src={SECTION07_VIDEO_SRC} type="video/mp4" />
              </video>
            )}

            {/* Transição sutil na borda esquerda do vídeo sem tocar a região da profissional */}
            <div className="absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-[#FAF7EE] via-[#FAF7EE]/95 to-transparent" />
          </div>
        ) : null}

        {/* Coluna de Copy + CTA */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-4 pb-6 lg:py-16">
          <div className="w-full lg:max-w-[450px] xl:max-w-[555px] flex flex-col items-start">
            <motion.p
              {...fadeProps(0)}
              className="font-ui text-[12px] font-bold uppercase tracking-[0.1em] text-black/75 mb-4"
            >
              {SECTION07_COPY.eyebrow}
            </motion.p>

            <motion.h2
              {...fadeProps(0.08)}
              className="font-display font-normal uppercase text-black text-[clamp(2.25rem,8.4vw,3.35rem)] lg:text-[clamp(2.85rem,4.05vw,4.15rem)] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]"
            >
              <span className="lg:block">Sua marca não precisa</span>
              <span className="lg:block">
                {' '}
                e <span className="text-[#FB0C72]">{SECTION07_COPY.headlineHighlight}</span>{' '}
                parecer
              </span>
              <span className="lg:block"> com todas as outras</span>
              <span className="lg:block">
                {' '}
                para ser{' '}
                <span className="inline-block font-handwritten font-semibold normal-case text-[#FB0C72] text-[1.16em] tracking-[-0.01em] leading-[0.88] -rotate-1">
                  {SECTION07_COPY.headlineScript}
                </span>
              </span>
            </motion.h2>

            <motion.p
              {...fadeProps(0.16)}
              className="mt-5 text-[15.5px] sm:text-[16.5px] leading-[1.6] text-black/78 max-w-[46ch] font-body"
            >
              {SECTION07_COPY.paragraph}
            </motion.p>

            <motion.div
              {...fadeProps(0.24)}
              className="mt-7 w-full sm:w-auto flex flex-col items-start gap-3.5"
            >
              <a
                href={WHATSAPP_CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 bg-[#FB0C72] hover:bg-[#D90761] active:translate-y-0 text-black border border-black shadow-[4px_4px_0_rgba(0,0,0,0.88)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.92)] px-6 py-3.5 rounded-[8px] font-ui text-[13px] font-bold tracking-[0.04em] uppercase hover:-translate-y-0.5 transition-all duration-[200ms] ease-editorial whitespace-nowrap min-h-[48px] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
              >
                <span>{SECTION07_COPY.ctaLabel}</span>
                <ArrowUpRight
                  className="w-4 h-4 shrink-0 transition-transform duration-[160ms] ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.1}
                  aria-hidden="true"
                />
              </a>

              <p className="text-[13px] leading-[1.55] text-black/72 max-w-[44ch] font-body">
                {SECTION07_COPY.commercialInfo}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bloco de Vídeo no Mobile & Tablet (< 1024px) — montado apenas quando < 1024px */}
        {!isDesktopLg ? (
          <div className="lg:hidden px-5 sm:px-8 pt-2 pb-12">
            <div className="relative w-full max-w-[420px] mx-auto aspect-[5/6] overflow-hidden rounded-[12px] bg-[#FAF7EE]">
              {reducedMotion || !videoActivated ? (
                <picture>
                  <source srcSet={SECTION07_OPTIMIZED_POSTER_SRC} type="image/webp" />
                  <img
                    src={SECTION07_POSTER_SRC}
                    alt="Flavia Brito em retrato editorial em estúdio"
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="absolute w-[246.914%] h-[115.741%] left-[-134.815%] top-[-7.87%] max-w-none select-none"
                  />
                </picture>
              ) : (
                <video
                  ref={videoRef}
                  poster={SECTION07_OPTIMIZED_POSTER_SRC}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  aria-label="Flavia Brito em retrato editorial em estúdio"
                  className="absolute w-[246.914%] h-[115.741%] left-[-134.815%] top-[-7.87%] max-w-none select-none"
                >
                  <source src={SECTION07_OPTIMIZED_VIDEO_SRC} type="video/mp4" />
                  <source src={SECTION07_VIDEO_SRC} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* RODAPÉ INTEGRADO — GRAFITE ESCURO */}
      <footer className="bg-[#111113] text-[#FFF9F4] border-t border-black/15">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-12 pb-8 md:pt-14 md:pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
            {/* Área 01 — Marca */}
            <div className="md:col-span-5">
              <a
                href="#hero"
                aria-label="Flavia Brito — Voltar ao início"
                className="inline-flex items-center bg-[#FFF9F4] border border-black rounded-[6px] px-3.5 py-2 mb-4 focus-visible:outline-2 focus-visible:outline-[#FB0C72] focus-visible:outline-offset-2"
              >
                <picture>
                  <source srcSet={FOOTER_OPTIMIZED_LOGO_URL} type="image/webp" />
                  <img
                    src={FOOTER_LOGO_URL}
                    alt="Flavia Brito"
                    width={2132}
                    height={738}
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-auto object-contain block"
                  />
                </picture>
              </a>
              <p className="text-[15px] leading-[1.6] max-w-sm text-[#FFF9F4]/80 font-body">
                {SECTION07_COPY.brandDescription}
              </p>
            </div>

            {/* Área 02 — Navegação */}
            <nav
              aria-label="Navegação do rodapé"
              className="md:col-span-3"
            >
              <h3 className="font-ui text-xs uppercase tracking-[0.08em] text-[#A5DCD1] font-bold mb-4">
                Navegação
              </h3>
              <ul className="font-ui text-[14px] space-y-2.5">
                {FOOTER_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[#FFF9F4]/82 hover:text-[#F2BED6] transition-colors duration-[160ms] inline-flex items-center min-h-[32px]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Área 03 — Contato & Informações comerciais */}
            <div className="md:col-span-4">
              <h3 className="font-ui text-xs uppercase tracking-[0.08em] text-[#F2BED6] font-bold mb-4">
                Contato
              </h3>
              <ul className="font-ui text-[14px] space-y-2.5">
                {FOOTER_CONTACT_ITEMS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="text-[#FFF9F4]/82 hover:text-[#F2BED6] transition-colors duration-[160ms] break-all sm:break-words inline-flex items-center min-h-[32px]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Linha horizontal discreta + Faixa inferior */}
          <div className="mt-10 pt-6 border-t border-[#FFF9F4]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <p className="font-ui text-xs uppercase tracking-[0.06em] text-[#FFF9F4]/72">
              {SECTION07_COPY.bottomCredit}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <a
                href="#hero"
                className="font-ui text-xs uppercase tracking-[0.06em] text-[#FFF9F4]/82 hover:text-[#A5DCD1] transition-colors duration-[160ms] inline-flex items-center gap-1.5 min-h-[44px]"
              >
                <span>{SECTION07_COPY.backToTopLabel}</span>
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </a>

              <div className="flex items-center gap-1">
                <a
                  href="mailto:flaviabritoconsultora@gmail.com"
                  aria-label="Enviar e-mail para Flavia Brito"
                  className="min-w-[44px] min-h-[44px] grid place-items-center text-[#FFF9F4]/82 hover:text-[#FB0C72] transition-colors duration-[160ms]"
                >
                  <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
                </a>
                <a
                  href={FOOTER_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Flavia Brito"
                  className="min-w-[44px] min-h-[44px] grid place-items-center text-[#FFF9F4]/82 hover:text-[#A5DCD1] transition-colors duration-[160ms]"
                >
                  <Instagram size={18} strokeWidth={1.75} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
