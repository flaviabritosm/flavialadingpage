import { Fragment } from 'react';

type AccentType = 'acute' | 'tilde' | 'circumflex' | 'cedilla';

interface CharSpec {
  base: string;
  accent?: AccentType;
}

const ACCENT_MAP: Record<string, CharSpec> = {
  Á: { base: 'A', accent: 'acute' },
  É: { base: 'E', accent: 'acute' },
  Í: { base: 'I', accent: 'acute' },
  Ó: { base: 'O', accent: 'acute' },
  Ú: { base: 'U', accent: 'acute' },
  Ã: { base: 'A', accent: 'tilde' },
  Õ: { base: 'O', accent: 'tilde' },
  Â: { base: 'A', accent: 'circumflex' },
  Ê: { base: 'E', accent: 'circumflex' },
  Ô: { base: 'O', accent: 'circumflex' },
  Ç: { base: 'C', accent: 'cedilla' },
};

function renderAccentMark(accent: AccentType) {
  switch (accent) {
    case 'acute':
      return (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-[32%] -top-[0.18em] w-[0.21em] h-[0.105em] bg-current -skew-x-[26deg]"
        />
      );
    case 'tilde':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 10"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[0.21em] w-[0.44em] h-[0.16em]"
          fill="none"
        >
          <path
            d="M2 7C5.5 1.5 9.5 1.5 12 5C14.5 8.5 18.5 8.5 22 3"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="square"
          />
        </svg>
      );
    case 'circumflex':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 10"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[0.21em] w-[0.36em] h-[0.15em]"
          fill="none"
        >
          <path
            d="M2 8.5L10 2L18 8.5"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      );
    case 'cedilla':
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute left-1/2 -translate-x-[45%] -bottom-[0.16em] w-[0.22em] h-[0.19em]"
          fill="none"
        >
          <path
            d="M6 1V6.5C6 8.5 4.5 9.5 2.5 9.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="square"
          />
        </svg>
      );
  }
}

/**
 * Renders uppercase Portuguese copy in PODIUM Sharp with uniform geometric
 * diacritic marks so accented letters match the exact weight and height of
 * unaccented PODIUM glyphs.
 */
export function PodiumText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const tokens = text.split(/(\s+)/);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {tokens.map((token, tIdx) => {
          if (/^\s+$/.test(token)) {
            return <Fragment key={tIdx}>{token}</Fragment>;
          }
          const upper = token.toUpperCase();
          const hasAccented = Array.from(upper).some((ch) => ch in ACCENT_MAP);
          if (!hasAccented) {
            return <Fragment key={tIdx}>{upper}</Fragment>;
          }
          return (
            <span key={tIdx} className="whitespace-nowrap">
              {Array.from(upper).map((ch, cIdx) => {
                const spec = ACCENT_MAP[ch];
                if (!spec || !spec.accent) {
                  return <Fragment key={cIdx}>{ch}</Fragment>;
                }
                return (
                  <span key={cIdx} className="relative inline-block leading-[0.76]">
                    <span>{spec.base}</span>
                    {renderAccentMark(spec.accent)}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
}
