import React, { useEffect, useState } from 'react';
import { OPTIMIZED_PORTRAIT_WEBP_URL, warmImageAssets } from '../utils/mediaAssets.ts';

export interface EditorialPortraitConfig {
  readonly src: string;
  readonly alt: string;
  readonly objectPosition: string;
}

/**
 * Centralized portrait configuration.
 * To swap in a different portrait photography later, update ONLY `src` (and optional `objectPosition`)
 * right here—layout proportions, clip masks, animations, and typography remain untouched.
 */
export const DEFAULT_EDITORIAL_PORTRAIT: EditorialPortraitConfig = {
  src: '/assets/aistudio/batom_-_facecard_3062a7f2.jpeg',
  alt: 'Flavia Brito aplicando batom em retrato editorial na seção de entregas estratégicas',
  objectPosition: '50% 35%',
};

interface EditorialPortraitProps {
  config?: EditorialPortraitConfig;
  className?: string;
  imgClassName?: string;
  frameRef?: React.Ref<HTMLDivElement>;
  maskRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

export function EditorialPortrait({
  config = DEFAULT_EDITORIAL_PORTRAIT,
  className = '',
  imgClassName = '',
  frameRef,
  maskRef,
  children,
}: EditorialPortraitProps) {
  const isDefaultPortrait = config.src === DEFAULT_EDITORIAL_PORTRAIT.src;
  const preferredSrc = isDefaultPortrait ? OPTIMIZED_PORTRAIT_WEBP_URL : config.src;
  const [currentSrc, setCurrentSrc] = useState(preferredSrc);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
    setImgError(false);
    warmImageAssets([preferredSrc]);
  }, [preferredSrc]);

  const handleError = () => {
    if (currentSrc !== config.src) {
      setCurrentSrc(config.src);
    } else {
      setImgError(true);
    }
  };

  return (
    <div
      ref={frameRef}
      data-testid="editorial-portrait"
      className={`relative overflow-hidden bg-transparent ${className}`}
    >
      <div
        ref={maskRef}
        className="w-full h-full will-change-[clip-path]"
      >
        <div
          data-portrait-inner="true"
          className="w-full h-full will-change-transform"
        >
          {!imgError ? (
            <img
              src={currentSrc}
              alt={config.alt}
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="sync"
              onError={handleError}
              style={{ objectPosition: config.objectPosition }}
              className={`w-full h-full object-cover select-none block ${imgClassName}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#F5EDE4] to-[#EBD8CE] text-black">
              <span className="font-display uppercase tracking-tight text-2xl">
                Editorial Portrait
              </span>
              <span className="mt-2 font-ui text-xs uppercase tracking-[0.14em] text-black/60">
                Direção Criativa · Posicionamento
              </span>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
