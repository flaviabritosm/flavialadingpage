export const OPTIMIZED_HERO_VIDEO_URL = '/assets/optimized/hero-loop.mp4';
export const OPTIMIZED_HERO_POSTER_URL = '/assets/optimized/hero-poster.webp';
export const OPTIMIZED_LOGO_WEBP_URL = '/assets/optimized/logo-flavia-brito.webp';
export const OPTIMIZED_PORTRAIT_WEBP_URL = '/assets/optimized/batom-facecard.webp';
export const OPTIMIZED_SECTION07_VIDEO_URL = '/assets/optimized/section07-cta.mp4';
export const OPTIMIZED_SECTION07_POSTER_URL = '/assets/optimized/section07-cta-poster.webp';
export const OPTIMIZED_TORN_SUBTLE_H_URL = '/assets/optimized/torn-paper-subtle-h.webp';
export const OPTIMIZED_TORN_DECKLE_V_URL = '/assets/optimized/torn-paper-deckle-v.webp';

const ORIGINAL_ASSET_PATTERN = /^\/assets\/(?:aistudio|cases)\/(.+)\.(?:png|jpe?g)$/i;

const EXPLICIT_WEBP_OVERRIDES: Record<string, string> = {
  '/assets/aistudio/batom_-_facecard_3062a7f2.jpeg': OPTIMIZED_PORTRAIT_WEBP_URL,
};

/**
 * Maps any original `/assets/aistudio/*` or `/assets/cases/*` raster image
 * to its lightweight pre-encoded WebP twin under `/assets/optimized/`.
 */
export function toOptimizedWebp(originalSrc: string): string {
  if (EXPLICIT_WEBP_OVERRIDES[originalSrc]) {
    return EXPLICIT_WEBP_OVERRIDES[originalSrc];
  }
  const match = ORIGINAL_ASSET_PATTERN.exec(originalSrc);
  if (!match) return originalSrc;
  return `/assets/optimized/${match[1]}.webp`;
}

const warmedAssetUrls = new Set<string>();

/**
 * Prefetches and asynchronously decodes image assets into browser memory
 * before the user scrolls to their section, avoiding blank card placeholders.
 */
export function warmImageAssets(urls: readonly string[]): number {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return 0;
  }

  let queued = 0;
  for (const url of urls) {
    if (!url || warmedAssetUrls.has(url)) continue;
    warmedAssetUrls.add(url);
    queued += 1;

    const img = new Image();
    img.decoding = 'sync';
    img.referrerPolicy = 'no-referrer';
    img.src = url;
    if (typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
  }
  return queued;
}
