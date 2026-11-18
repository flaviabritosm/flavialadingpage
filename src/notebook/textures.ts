import * as THREE from 'three';
import { COVER_DATA, PageSide } from './types.ts';
import { toOptimizedWebp } from '../utils/mediaAssets.ts';

export const PAGE_TEX_W = 1024;
export const PAGE_TEX_H = 1434;

export const RING_NORMALIZED_Z: readonly number[] = [
  0.09, 0.1925, 0.295, 0.3975, 0.5, 0.6025, 0.705, 0.8075, 0.91,
];

export interface CoverElementAssets {
  washiXadrez: HTMLImageElement | null;
  clipeRosa: HTMLImageElement | null;
  codigoBarras: HTMLImageElement | null;
  coracao: HTMLImageElement | null;
  coroa: HTMLImageElement | null;
  estrelaPrata: HTMLImageElement | null;
  etiquetaIdentidade: HTMLImageElement | null;
  etiquetaSubtitulo: HTMLImageElement | null;
  flor: HTMLImageElement | null;
  fotoNuvens: HTMLImageElement | null;
  nomeFlavia: HTMLImageElement | null;
  papelMetalizado: HTMLImageElement | null;
  papelRosaForte: HTMLImageElement | null;
  papelRosaPastel: HTMLImageElement | null;
  papelVerdeAgua: HTMLImageElement | null;
  tituloCreativeProcess: HTMLImageElement | null;
}

export interface LoadedEditorialAssets {
  flaviaPhoto: HTMLImageElement | null;
  laMaisonPhoto: HTMLImageElement | null;
  logoMark: HTMLImageElement | null;
  campaignPhoto1: HTMLImageElement | null;
  campaignPhoto2: HTMLImageElement | null;
  monogramLogo: HTMLImageElement | null;
  igFeedPhoto: HTMLImageElement | null;
  coverElements: CoverElementAssets;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  const optimized = toOptimizedWebp(src);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let triedFallback = optimized === src;
    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
      } catch {
        // Proceed with loaded image even if decode() rejects
      }
      resolve(img);
    };
    img.onerror = () => {
      if (!triedFallback) {
        triedFallback = true;
        img.src = src;
      } else {
        resolve(null);
      }
    };
    img.src = optimized;
  });
}

export async function loadEditorialAssets(): Promise<LoadedEditorialAssets> {
  try {
    if (typeof document !== 'undefined' && document.fonts) {
      await Promise.allSettled([
        document.fonts.ready,
        document.fonts.load('400 72px Anton'),
        document.fonts.load('700 44px Caveat'),
        document.fonts.load('400 36px "DM Sans"'),
        document.fonts.load('700 36px "DM Sans"'),
      ]);
    }
  } catch {
    // Font loader best-effort
  }

  const [
    flaviaPhoto,
    laMaisonPhoto,
    logoMark,
    campaignPhoto1,
    campaignPhoto2,
    monogramLogo,
    igFeedPhoto,
    washiXadrez,
    clipeRosa,
    codigoBarras,
    coracao,
    coroa,
    estrelaPrata,
    etiquetaIdentidade,
    etiquetaSubtitulo,
    flor,
    fotoNuvens,
    nomeFlavia,
    papelMetalizado,
    papelRosaForte,
    papelRosaPastel,
    papelVerdeAgua,
    tituloCreativeProcess,
  ] = await Promise.all([
    loadImage('/assets/cases/flavia_brito.jpg'),
    loadImage('/assets/cases/la_maison_shop.jpg'),
    loadImage('/assets/aistudio/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.png'),
    loadImage('/assets/aistudio/image_457f65d6.png'),
    loadImage('/assets/aistudio/image_3d8a6460.png'),
    loadImage('/assets/aistudio/Untitled__10__0be95eeb.png'),
    loadImage('/assets/aistudio/image_1a42809f.png'),
    loadImage('/assets/aistudio/washi_xadrez_ea85bb04.png'),
    loadImage('/assets/aistudio/clipe_rosa_084f2607.png'),
    loadImage('/assets/aistudio/codigo_barras_574d6e2f.png'),
    loadImage('/assets/aistudio/coracao_1a745fd7.png'),
    loadImage('/assets/aistudio/coroa_cdb645bb.png'),
    loadImage('/assets/aistudio/estrela_prata_e8e2dd8c.png'),
    loadImage('/assets/aistudio/etiqueta_identidade_530323f1.png'),
    loadImage('/assets/aistudio/etiqueta_subtitulo_adf0c33d.png'),
    loadImage('/assets/aistudio/flor_49a15df8.png'),
    loadImage('/assets/aistudio/foto_nuvens_20f62b87.png'),
    loadImage('/assets/aistudio/nome_flavia_ded8f140.png'),
    loadImage('/assets/aistudio/papel_metalizado_f13b4af1.png'),
    loadImage('/assets/aistudio/papel_rosa_forte_86a6817f.png'),
    loadImage('/assets/aistudio/papel_rosa_pastel_2547e942.png'),
    loadImage('/assets/aistudio/papel_verde_agua_97928523.png'),
    loadImage('/assets/aistudio/titulo_creative_process_94575525.png'),
  ]);

  return {
    flaviaPhoto,
    laMaisonPhoto,
    logoMark,
    campaignPhoto1,
    campaignPhoto2,
    monogramLogo,
    igFeedPhoto,
    coverElements: {
      washiXadrez,
      clipeRosa,
      codigoBarras,
      coracao,
      coroa,
      estrelaPrata,
      etiquetaIdentidade,
      etiquetaSubtitulo,
      flor,
      fotoNuvens,
      nomeFlavia,
      papelMetalizado,
      papelRosaForte,
      papelRosaPastel,
      papelVerdeAgua,
      tituloCreativeProcess,
    },
  };
}

/** Procedural tangent-space normal map for cotton scrapbook paper / cardstock */
export function createGrainNormalMap(strength = 10, size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const fiber = Math.sin(x * 0.45 + y * 0.15) * 0.4 + (rand() - 0.5) * 1.4;
      const dx = clampByte(128 + fiber * strength);
      const dy = clampByte(128 + (rand() - 0.5) * strength);
      data[i] = dx;
      data[i + 1] = dy;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 4);
  tex.needsUpdate = true;
  return tex;
}

export function createPageEdgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#F6ECE2';
  ctx.fillRect(0, 0, 64, 256);

  for (let y = 0; y < 256; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(120, 95, 78, 0.22)' : 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(0, y, 64, 1.3);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 1);
  tex.needsUpdate = true;
  return tex;
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

const cachedPaperGrainMap = new Map<string, HTMLCanvasElement>();

function drawSeededPaperGrain(ctx: CanvasRenderingContext2D, w: number, h: number, baseHex: string, tint = 0.03) {
  const cacheKey = `${w}x${h}:${baseHex}:${tint}`;
  const cached = cachedPaperGrainMap.get(cacheKey);
  if (cached) {
    ctx.drawImage(cached, 0, 0);
    return;
  }

  const off = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const targetCtx = off ? (off.width = w, off.height = h, off.getContext('2d')!) : ctx;

  targetCtx.fillStyle = baseHex;
  targetCtx.fillRect(0, 0, w, h);

  // Warm studio gradient across paper
  const grad = targetCtx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, 'rgba(255,255,255,0.18)');
  grad.addColorStop(0.55, 'rgba(255,249,244,0)');
  grad.addColorStop(1, 'rgba(180,150,130,0.06)');
  targetCtx.fillStyle = grad;
  targetCtx.fillRect(0, 0, w, h);

  // Subtle speckle paper fibers
  let s = 4219;
  const rnd = () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 1600; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 0.6 + rnd() * 1.4;
    targetCtx.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${tint * 1.6})` : `rgba(80,55,45,${tint})`;
    targetCtx.fillRect(x, y, r, r);
  }

  if (off) {
    cachedPaperGrainMap.set(cacheKey, off);
    ctx.drawImage(off, 0, 0);
  }
}

function drawSubtleDotOrGrid(ctx: CanvasRenderingContext2D, w: number, h: number, style: 'grid' | 'dots' | 'ruled') {
  ctx.save();
  if (style === 'grid') {
    ctx.strokeStyle = 'rgba(0,0,0,0.042)';
    ctx.lineWidth = 1;
    const step = 48;
    for (let x = step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else if (style === 'dots') {
    ctx.fillStyle = 'rgba(0,0,0,0.11)';
    const step = 42;
    for (let x = 56; x < w - 36; x += step) {
      for (let y = 56; y < h - 36; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.strokeStyle = 'rgba(0,0,0,0.065)';
    ctx.lineWidth = 1.2;
    for (let y = 140; y < h - 80; y += 54) {
      ctx.beginPath();
      ctx.moveTo(64, y);
      ctx.lineTo(w - 64, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPunchedSpineMargin(ctx: CanvasRenderingContext2D, w: number, h: number, side: PageSide | 'cover', bgUnderlay = '#2E282A') {
  const spineAtLeft = side === 'right' || side === 'cover';
  // Match exact physical X where the 3D Wire-O ellipse (rx=0.136, ry=0.106, y=-0.018) pierces the cover (+0.040) vs inner pages (-0.030)
  const marginPx = side === 'cover' ? 39 : 40;
  const centerX = spineAtLeft ? marginPx : w - marginPx;
  const dy = side === 'cover' ? 10.3 : 10.5;
  const holeRadius = side === 'cover' ? 8.6 : 8.0;

  // Spine gutter shadow
  ctx.save();
  const gutterGrad = spineAtLeft
    ? ctx.createLinearGradient(0, 0, 120, 0)
    : ctx.createLinearGradient(w, 0, w - 120, 0);
  gutterGrad.addColorStop(0, 'rgba(0,0,0,0.14)');
  gutterGrad.addColorStop(0.35, 'rgba(0,0,0,0.05)');
  gutterGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(spineAtLeft ? 0 : w - 120, 0, 120, h);

  // Punched double-hole slots matching the 9 twin-wire coils
  for (const nz of RING_NORMALIZED_Z) {
    // Cover overlay spans COVER_H - 0.06 = 2.92 while rings sit on PAGE_H = 2.86
    const effectiveNz = side === 'cover' ? (nz - 0.5) * (2.86 / 2.92) + 0.5 : nz;
    const cy = effectiveNz * h;
    for (const offsetY of [-dy, dy]) {
      // Rim shadow
      ctx.beginPath();
      ctx.arc(centerX, cy + offsetY + 1.4, holeRadius + 1.0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.fill();

      // Punched dark hole
      ctx.beginPath();
      ctx.arc(centerX, cy + offsetY, holeRadius, 0, Math.PI * 2);
      ctx.fillStyle = bgUnderlay;
      ctx.fill();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(0,0,0,0.38)';
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawTornPaperRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  opts?: { rotation?: number; shadow?: boolean; stickerShadow?: boolean; border?: boolean; deckle?: number }
) {
  const rot = opts?.rotation ?? 0;
  const deckle = opts?.deckle ?? 4;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);

  const tracePath = () => {
    const hw = w / 2;
    const hh = h / 2;
    ctx.beginPath();
    ctx.moveTo(-hw, -hh);
    const stepsX = Math.max(8, Math.round(w / 24));
    for (let i = 1; i <= stepsX; i++) {
      const px = -hw + (w * i) / stepsX;
      const py = -hh + Math.sin(i * 2.7 + x) * deckle;
      ctx.lineTo(px, py);
    }
    const stepsY = Math.max(6, Math.round(h / 24));
    for (let i = 1; i <= stepsY; i++) {
      const px = hw + Math.cos(i * 3.1 + y) * deckle;
      const py = -hh + (h * i) / stepsY;
      ctx.lineTo(px, py);
    }
    for (let i = stepsX - 1; i >= 0; i--) {
      const px = -hw + (w * i) / stepsX;
      const py = hh + Math.sin(i * 2.3 + y) * deckle;
      ctx.lineTo(px, py);
    }
    for (let i = stepsY - 1; i >= 0; i--) {
      const px = -hw + Math.cos(i * 2.9 + x) * deckle;
      const py = -hh + (h * i) / stepsY;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  if (opts?.shadow !== false) {
    if (opts?.stickerShadow !== false && opts?.border) {
      ctx.save();
      ctx.translate(7, 8);
      tracePath();
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(5, 7);
      tracePath();
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fill();
      ctx.restore();
    }
  }

  tracePath();
  ctx.fillStyle = fill;
  ctx.fill();

  if (opts?.border) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }
  ctx.restore();
}

function drawWashiTape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: 'pink' | 'mint' | 'cream' | 'hotpink',
  angle = -0.06,
  alpha = 0.94
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const bg =
    color === 'hotpink'
      ? '#FB0C72'
      : color === 'pink'
        ? '#F2BED6'
        : color === 'mint'
          ? '#A5DCD1'
          : '#FFF3DF';

  ctx.beginPath();
  const hw = w / 2;
  const hh = h / 2;
  ctx.moveTo(-hw, -hh);
  ctx.lineTo(hw, -hh);
  for (let i = 0; i <= 5; i++) {
    ctx.lineTo(hw + (i % 2 === 0 ? 5 : -2), -hh + (h * i) / 5);
  }
  ctx.lineTo(hw, hh);
  ctx.lineTo(-hw, hh);
  for (let i = 5; i >= 0; i--) {
    ctx.lineTo(-hw + (i % 2 === 0 ? -5 : 2), -hh + (h * i) / 5);
  }
  ctx.closePath();

  // Subtle shadow under tape
  ctx.save();
  ctx.translate(2, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = bg;
  ctx.fill();

  // Diagonal washi stripe texture clipped inside tape
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = color === 'hotpink' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 4;
  for (let sx = -hw - h; sx < hw + h; sx += 14) {
    ctx.beginPath();
    ctx.moveTo(sx, -hh - 2);
    ctx.lineTo(sx + h, hh + 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  ctx.restore();
}

function drawCoverCroppedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const ir = img.naturalWidth / Math.max(1, img.naturalHeight);
  const dr = dw / Math.max(1, dh);
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (ir > dr) {
    sw = img.naturalHeight * dr;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / dr;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawPolaroidPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number,
  cy: number,
  w: number,
  h: number,
  angle: number,
  caption: string,
  tapeColor: 'pink' | 'mint' | 'hotpink' = 'mint'
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.fillStyle = '#000000';
  ctx.fillRect(-w / 2 + 8, -h / 2 + 9, w, h);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  const pad = 16;
  const imgW = w - pad * 2;
  const imgH = h - pad - 66;
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-imgW / 2, -h / 2 + pad, imgW, imgH);
    ctx.clip();
    drawCoverCroppedImage(ctx, img, -imgW / 2, -h / 2 + pad, imgW, imgH);
    ctx.restore();
  } else {
    const grad = ctx.createLinearGradient(-imgW / 2, -h / 2, imgW / 2, h / 2);
    grad.addColorStop(0, '#F2BED6');
    grad.addColorStop(1, '#A5DCD1');
    ctx.fillStyle = grad;
    ctx.fillRect(-imgW / 2, -h / 2 + pad, imgW, imgH);
  }
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(-imgW / 2, -h / 2 + pad, imgW, imgH);

  ctx.fillStyle = '#000000';
  ctx.font = '700 36px "Caveat", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(caption, 0, h / 2 - 26);

  ctx.restore();
  drawWashiTape(ctx, cx, cy - h / 2 + 2, 118, 30, tapeColor, angle - 0.08, 0.94);
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r * 0.2, -r * 0.2, r, 0);
  ctx.quadraticCurveTo(r * 0.2, r * 0.2, 0, r);
  ctx.quadraticCurveTo(-r * 0.2, r * 0.2, -r, 0);
  ctx.quadraticCurveTo(-r * 0.2, -r * 0.2, 0, -r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHandUnderline(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  progress: number,
  color = '#FB0C72',
  lineWidth = 7
) {
  if (progress <= 0.01) return;
  const curX = x1 + (x2 - x1) * Math.min(1, progress);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y + 2);
  ctx.quadraticCurveTo((x1 + curX) * 0.5, y - 5, curX, y + 1);
  ctx.stroke();
  ctx.restore();
}

function drawHandCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  progress: number,
  color = '#FB0C72'
) {
  if (progress <= 0.01) return;
  const p = Math.min(1, progress);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const steps = Math.max(4, Math.floor(42 * p));
  for (let i = 0; i <= steps; i++) {
    const a = -0.3 + (i / 42) * Math.PI * 2.15;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawHandArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  progress: number,
  color = '#000000'
) {
  if (progress <= 0.02) return;
  const p = Math.min(1, progress);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const segs = 28;
  const maxSeg = Math.max(1, Math.floor(segs * p));
  ctx.beginPath();
  let lastX = x1;
  let lastY = y1;
  let prevX = x1;
  let prevY = y1;
  for (let i = 0; i <= maxSeg; i++) {
    const t = i / segs;
    const inv = 1 - t;
    const px = inv * inv * x1 + 2 * inv * t * cx + t * t * x2;
    const py = inv * inv * y1 + 2 * inv * t * cy + t * t * y2;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
    prevX = lastX;
    prevY = lastY;
    lastX = px;
    lastY = py;
  }
  ctx.stroke();

  if (p > 0.72) {
    const angle = Math.atan2(lastY - prevY, lastX - prevX);
    const headSize = 16;
    ctx.beginPath();
    ctx.moveTo(lastX - Math.cos(angle - 0.55) * headSize, lastY - Math.sin(angle - 0.55) * headSize);
    ctx.lineTo(lastX, lastY);
    ctx.lineTo(lastX - Math.cos(angle + 0.55) * headSize, lastY - Math.sin(angle + 0.55) * headSize);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCutoutPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bg: string,
  fg = '#000000',
  font = '400 32px "Anton", sans-serif',
  rot = -0.02
) {
  ctx.save();
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const w = metrics.width + 46;
  const h = 60;
  ctx.translate(x, y);
  ctx.rotate(rot);

  ctx.fillStyle = '#000000';
  ctx.fillRect(7, 7, w, h);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(0, 0, w, h);

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  ctx.restore();
}

function isImgReady(img: HTMLImageElement | null | undefined): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

function drawCollageAsset(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null | undefined,
  cx: number,
  cy: number,
  w: number,
  h: number,
  opts?: {
    angle?: number;
    alpha?: number;
    shadowBlur?: number;
    shadowOx?: number;
    shadowOy?: number;
    shadowColor?: string;
  }
): void {
  if (!isImgReady(img)) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (opts?.angle) ctx.rotate(opts.angle);
  if (opts?.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts?.shadowBlur) {
    ctx.shadowColor = opts.shadowColor ?? 'rgba(38, 6, 20, 0.28)';
    ctx.shadowBlur = opts.shadowBlur;
    ctx.shadowOffsetX = opts.shadowOx ?? 4;
    ctx.shadowOffsetY = opts.shadowOy ?? 7;
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawHandDrawnStarLoop(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  // 5-point continuous sketchy star loop matching the reference doodle beside "Process"
  const pts: Array<[number, number]> = [];
  const order = [0, 2, 4, 1, 3, 0];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5 + 0.14;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  order.forEach((idx, i) => {
    const [px, py] = pts[idx];
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.restore();
}

function buildUnifiedHeroPaperCanvas(
  nomeImg: HTMLImageElement | null,
  titleImg: HTMLImageElement | null
): HTMLCanvasElement {
  const cw = 790;
  const ch = 890;
  const off = document.createElement('canvas');
  off.width = cw;
  off.height = ch;
  const octx = off.getContext('2d')!;

  if (isImgReady(titleImg)) {
    // Draw one continuous warm-cotton torn paper silhouette matching titulo_creative_process paper tone
    const paperFill = '#EEDCD4';
    drawTornPaperRect(octx, 38, 44, cw - 86, ch - 102, paperFill, {
      rotation: -0.055,
      border: false,
      deckle: 6,
    });

    // Subtle paper grain inside unified torn silhouette
    octx.save();
    octx.globalAlpha = 0.032;
    let s = 7331;
    const rnd = () => {
      s = (s * 48271) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < 1200; i++) {
      octx.fillStyle = rnd() > 0.5 ? '#FFFFFF' : '#4A3830';
      octx.fillRect(50 + rnd() * (cw - 108), 58 + rnd() * (ch - 130), 2, 2);
    }
    octx.restore();

    // Feather ONLY the top edge of titulo_creative_process onto an offscreen canvas so zero horizontal ridge shows above "The"
    const tW = 730;
    const tH = Math.round((titleImg.naturalHeight / titleImg.naturalWidth) * tW);
    const titleClip = document.createElement('canvas');
    titleClip.width = tW;
    titleClip.height = tH;
    const tctx = titleClip.getContext('2d')!;
    tctx.drawImage(titleImg, 0, 0, tW, tH);
    tctx.globalCompositeOperation = 'destination-in';
    const tFade = tctx.createLinearGradient(0, 0, 0, tH);
    tFade.addColorStop(0, 'rgba(0,0,0,0)');
    tFade.addColorStop(0.14, 'rgba(0,0,0,1)');
    tFade.addColorStop(1, 'rgba(0,0,0,1)');
    tctx.fillStyle = tFade;
    tctx.fillRect(0, 0, tW, tH);

    octx.drawImage(titleClip, (cw - tW) / 2, ch - tH - 12, tW, tH);

    // Mask out both top & bottom edges of nomeImg so enlarged "FLAVIA BRITO" + pink underline integrates cleanly on the sheet
    if (isImgReady(nomeImg)) {
      const nW = 585;
      const nH = Math.round((nomeImg.naturalHeight / nomeImg.naturalWidth) * nW);
      const nameClip = document.createElement('canvas');
      nameClip.width = nW;
      nameClip.height = nH;
      const nctx = nameClip.getContext('2d')!;
      nctx.drawImage(nomeImg, 0, 0, nW, nH);
      nctx.globalCompositeOperation = 'destination-in';
      const fade = nctx.createLinearGradient(0, 0, 0, nH);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(0.22, 'rgba(0,0,0,1)');
      fade.addColorStop(0.74, 'rgba(0,0,0,1)');
      fade.addColorStop(0.92, 'rgba(0,0,0,0)');
      nctx.fillStyle = fade;
      nctx.fillRect(0, 0, nW, nH);

      octx.save();
      octx.translate(cw * 0.515, 206);
      octx.rotate(-0.01);
      octx.drawImage(nameClip, -nW / 2, -nH / 2, nW, nH);
      octx.restore();
    }
  } else {
    drawTornPaperRect(octx, 35, 45, cw - 70, ch - 90, '#FFF9F4', {
      rotation: -0.04,
      border: false,
      deckle: 5,
    });
    octx.fillStyle = '#24201E';
    octx.font = '700 26px "DM Sans", sans-serif';
    octx.textAlign = 'center';
    octx.fillText(COVER_DATA.brand, cw * 0.5, 125);
    octx.font = '700 108px Georgia, serif';
    octx.fillText('The', cw * 0.48, 300);
    octx.fillText('Creative', cw * 0.5, 415);
    octx.fillStyle = '#FB0C72';
    octx.font = '700 110px "Caveat", cursive';
    octx.fillText('Process', cw * 0.52, 540);
  }

  return off;
}

/** Satin + foil + acrylic surface roughness map matched to the cover collage zones */
export function createCoverMaterialRoughnessMap(): THREE.CanvasTexture {
  const rw = 256;
  const rh = 358;
  const c = document.createElement('canvas');
  c.width = rw;
  c.height = rh;
  const rctx = c.getContext('2d')!;

  // Base hot-pink textured cover board satin-matte cardstock (~0.70 roughness -> byte ~178)
  rctx.fillStyle = 'rgb(178, 178, 178)';
  rctx.fillRect(0, 0, rw, rh);

  // Subtle fiber mottling across cover
  let seed = 9187;
  const rnd = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 900; i++) {
    const x = rnd() * rw;
    const y = rnd() * rh;
    const v = 166 + Math.round(rnd() * 32);
    rctx.fillStyle = `rgb(${v},${v},${v})`;
    rctx.fillRect(x, y, 2, 2);
  }

  // Torn paper collages & center sheet: matte cotton paper (~0.84 roughness -> byte ~214)
  rctx.fillStyle = 'rgb(214, 214, 214)';
  rctx.fillRect(42, 82, 168, 192);

  // Crumpled metallic foil bottom-left: reflective highlights (~0.24 -> byte ~62)
  rctx.fillStyle = 'rgb(64, 64, 64)';
  rctx.fillRect(18, 232, 128, 118);

  // Silver metallic star top-center-right (~0.20 -> byte ~52)
  rctx.fillStyle = 'rgb(52, 52, 52)';
  rctx.beginPath();
  rctx.arc(Math.round(704 * (rw / PAGE_TEX_W)), Math.round(126 * (rh / PAGE_TEX_H)), 14, 0, Math.PI * 2);
  rctx.fill();

  // Pink glossy acrylic binder clip top-right (~0.18 -> byte ~46)
  rctx.fillStyle = 'rgb(46, 46, 46)';
  rctx.beginPath();
  rctx.arc(Math.round(866 * (rw / PAGE_TEX_W)), Math.round(284 * (rh / PAGE_TEX_H)), 22, 0, Math.PI * 2);
  rctx.fill();

  // Glossy cloud Polaroid photo print (~0.34 -> byte ~86)
  rctx.save();
  rctx.translate(Math.round(792 * (rw / PAGE_TEX_W)), Math.round(472 * (rh / PAGE_TEX_H)));
  rctx.rotate(0.22);
  rctx.fillStyle = 'rgb(86, 86, 86)';
  rctx.fillRect(-36, -38, 72, 76);
  rctx.restore();

  // Vinyl die-cut hibiscus flower sticker bottom-left (~0.36 -> byte ~92)
  rctx.fillStyle = 'rgb(92, 92, 92)';
  rctx.beginPath();
  rctx.arc(Math.round(244 * (rw / PAGE_TEX_W)), Math.round(1268 * (rh / PAGE_TEX_H)), 34, 0, Math.PI * 2);
  rctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Paints the hot-pink hardcover front exterior matching Imagem 01 + 16 collage PNGs */
export function drawHardcoverFrontTexture(
  canvas: HTMLCanvasElement,
  assets: LoadedEditorialAssets
): void {
  const w = PAGE_TEX_W;
  const h = PAGE_TEX_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const ce = assets.coverElements;

  // 1. Saturated Hot-Pink Textured Hardcover Base (#FB0C72)
  drawSeededPaperGrain(ctx, w, h, '#FB0C72', 0.048);

  // Subtle physical studio satin falloff across the textured hardcover surface
  const baseSheen = ctx.createLinearGradient(0, 0, w, h);
  baseSheen.addColorStop(0, 'rgba(255, 195, 220, 0.14)');
  baseSheen.addColorStop(0.5, 'rgba(251, 12, 114, 0)');
  baseSheen.addColorStop(1, 'rgba(135, 0, 56, 0.14)');
  ctx.fillStyle = baseSheen;
  ctx.fillRect(0, 0, w, h);

  // 2. Background Layered Torn Papers (bleeding flush off cover edges just like Imagem 01)
  // Top-center-left vertical pastel-pink torn paper strip bleeding off top edge
  drawCollageAsset(ctx, ce.papelRosaPastel, 412, 72, 580, 420, {
    angle: Math.PI / 2 - 0.12,
    shadowBlur: 12,
    shadowOx: 4,
    shadowOy: 5,
    shadowColor: 'rgba(85, 6, 40, 0.28)',
  });

  // Top-center-right hot-pink overlapping torn paper rim bleeding off top edge
  drawCollageAsset(ctx, ce.papelRosaForte, 622, 62, 430, 235, {
    angle: Math.PI / 2 + 0.06,
    shadowBlur: 10,
    shadowOx: -3,
    shadowOy: 4,
    shadowColor: 'rgba(72, 4, 34, 0.25)',
  });

  // Bottom-center-right mint torn paper corner flush at bottom edge
  drawCollageAsset(ctx, ce.papelVerdeAgua, 690, 1368, 520, 290, {
    angle: -0.04,
    shadowBlur: 12,
    shadowOx: 3,
    shadowOy: 6,
    shadowColor: 'rgba(70, 5, 32, 0.24)',
  });

  // Lower-right large pastel-pink torn paper panel flush to right & bottom border
  drawCollageAsset(ctx, ce.papelRosaPastel, 938, 1152, 850, 760, {
    angle: -0.96,
    shadowBlur: 16,
    shadowOx: -5,
    shadowOy: 7,
    shadowColor: 'rgba(78, 5, 36, 0.26)',
  });

  // Bottom-left crumpled metallic pink foil paper flush near bottom & spine
  drawCollageAsset(ctx, ce.papelMetalizado, 315, 1272, 625, 445, {
    angle: -0.04,
    shadowBlur: 14,
    shadowOx: 4,
    shadowOy: 7,
    shadowColor: 'rgba(65, 4, 28, 0.34)',
  });

  // 3. Polaroid Cloud Photo + Small Left Pastel Tab (tucked behind hero sheet)
  ctx.save();
  ctx.translate(152, 545);
  ctx.rotate(-0.18);
  ctx.shadowColor = 'rgba(55, 6, 28, 0.26)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#F7DFD3';
  ctx.fillRect(-62, -22, 124, 44);
  ctx.restore();

  // Polaroid print with cream instant-film frame tucked cleanly to upper-right of hero sheet
  ctx.save();
  ctx.translate(792, 472);
  ctx.rotate(0.22);
  ctx.shadowColor = 'rgba(42, 4, 20, 0.32)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 9;
  ctx.fillStyle = '#FAF4F0';
  ctx.fillRect(-174, -204, 348, 412);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-174, -204, 348, 412);
  if (isImgReady(ce.fotoNuvens)) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-146, -174, 292, 292);
    ctx.clip();
    ctx.rotate(-0.14);
    ctx.drawImage(ce.fotoNuvens, -176, -202, 352, 368);
    ctx.restore();
  } else {
    const skyGrad = ctx.createLinearGradient(0, -174, 0, 118);
    skyGrad.addColorStop(0, '#7292C2');
    skyGrad.addColorStop(1, '#F2BED6');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-146, -174, 292, 292);
  }
  ctx.restore();

  // 4. Unified Centerpiece Hero Torn Paper ("FLAVIA BRITO" + "The Creative Process")
  const heroPaper = buildUnifiedHeroPaperCanvas(ce.nomeFlavia, ce.tituloCreativeProcess);
  ctx.save();
  ctx.translate(468, 636);
  ctx.rotate(-0.025);
  ctx.shadowColor = 'rgba(40, 4, 20, 0.34)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 7;
  ctx.shadowOffsetY = 12;
  ctx.drawImage(heroPaper, -heroPaper.width / 2, -heroPaper.height / 2);
  ctx.restore();

  // 5. Checkered Washi Tape, Updated Subtitle Ribbon & Translucent Pink Binder Clip
  // (Green "IDENTIDADE ESTRATÉGIA CONTEÚDO" label removed per Print 2)
  // Pink checkered washi tape holding top torn edge above FLAVIA BRITO
  drawCollageAsset(ctx, ce.washiXadrez, 442, 240, 270, 90, {
    angle: -0.14,
    alpha: 0.94,
    shadowBlur: 10,
    shadowOx: 3,
    shadowOy: 5,
    shadowColor: 'rgba(40, 4, 20, 0.22)',
  });

  // Beige subtitle ribbon ("planejamento estratégico" per Print 4) overlapping bottom edge below "Process"
  ctx.save();
  ctx.translate(590, 1018);
  ctx.rotate(-0.03);
  const rw = 510;
  const rh = 104;
  ctx.shadowColor = 'rgba(40, 4, 20, 0.28)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 8;
  const ribGrad = ctx.createLinearGradient(-rw / 2, 0, rw / 2, 0);
  ribGrad.addColorStop(0, '#F5D3B3');
  ribGrad.addColorStop(0.5, '#F8DEC4');
  ribGrad.addColorStop(1, '#F1C9A5');
  ctx.fillStyle = ribGrad;
  ctx.beginPath();
  ctx.moveTo(-rw / 2 + 4, -rh / 2);
  ctx.lineTo(rw / 2 - 4, -rh / 2 + 2);
  ctx.lineTo(rw / 2 + 3, 0);
  ctx.lineTo(rw / 2 - 5, rh / 2);
  ctx.lineTo(-rw / 2 + 2, rh / 2 - 2);
  ctx.lineTo(-rw / 2 - 4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#1E1A18';
  ctx.font = '700 46px "Caveat", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('planejamento estratégico', 0, 2);
  ctx.restore();

  // Translucent hot-pink binder clip gripping upper-right of Polaroid (clear of hero sheet corner)
  drawCollageAsset(ctx, ce.clipeRosa, 866, 284, 174, 184, {
    angle: 0.22,
    shadowBlur: 16,
    shadowOx: 7,
    shadowOy: 11,
    shadowColor: 'rgba(32, 4, 18, 0.38)',
  });

  // 6. Metallic Star, Crown, Doodle Star, Flower Sticker, Heart & Barcode "VOL. 01"
  drawCollageAsset(ctx, ce.estrelaPrata, 704, 126, 112, 122, {
    angle: -0.08,
    shadowBlur: 14,
    shadowOx: 5,
    shadowOy: 8,
    shadowColor: 'rgba(35, 3, 18, 0.42)',
  });

  // Enlarged drawn pink crown nestled cleanly beside FLAVIA BRITO & "The" (Print 3)
  drawCollageAsset(ctx, ce.coroa, 248, 488, 118, 104, {
    angle: -0.11,
    shadowBlur: 0,
  });

  // Hand-drawn coral/pink 5-point star doodle to the right of "Process"
  drawHandDrawnStarLoop(ctx, 790, 740, 28, '#F24D64');

  // Die-cut hibiscus flower sticker bottom-left near lower wire-o rings
  drawCollageAsset(ctx, ce.flor, 244, 1268, 312, 298, {
    angle: 0.04,
    shadowBlur: 16,
    shadowOx: 5,
    shadowOy: 8,
    shadowColor: 'rgba(42, 4, 20, 0.34)',
  });

  // Drawn hot-pink heart on right pastel paper above barcode
  drawCollageAsset(ctx, ce.coracao, 885, 956, 96, 118, {
    angle: 0.02,
    shadowBlur: 0,
  });

  // Crisp tilted pale-pink "VOL. 01" barcode sticker bottom-right
  ctx.save();
  ctx.translate(866, 1134);
  ctx.rotate(-0.08);
  ctx.shadowColor = 'rgba(45, 5, 22, 0.28)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FCE6EE';
  ctx.fillRect(-114, -68, 228, 136);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-114, -68, 228, 136);
  if (isImgReady(ce.codigoBarras)) {
    ctx.rotate(0.06);
    ctx.drawImage(ce.codigoBarras, -104, -58, 208, 122);
  }
  ctx.restore();

  // 7. Physical Punched Wire-O Spine Holes along Left Edge
  drawPunchedSpineMargin(ctx, w, h, 'cover', '#231D1F');
}

export function drawHardcoverFrontBoardTexture(canvas: HTMLCanvasElement): void {
  const w = 512;
  const h = 716;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  drawSeededPaperGrain(ctx, w, h, '#FB0C72', 0.045);
}

export function drawHardcoverBackTexture(canvas: HTMLCanvasElement): void {
  const w = 512;
  const h = 716;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  drawSeededPaperGrain(ctx, w, h, '#FB0C72', 0.045);
}

/**
 * Renders any of the 10 interior scrapbook page faces (`spreadIndex: 0..4`, `side: 'left' | 'right'`)
 * with progressive internal animation (`anim: 0..1`).
 */
export function drawSpreadPageTexture(
  canvas: HTMLCanvasElement,
  spreadIndex: number,
  side: PageSide,
  anim: number,
  assets: LoadedEditorialAssets
): void {
  const w = PAGE_TEX_W;
  const h = PAGE_TEX_H;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Base cream cotton paper
  drawSeededPaperGrain(ctx, w, h, '#FFF9F4', 0.025);

  const marginLeft = side === 'right' ? 112 : 68;
  const marginRight = side === 'left' ? w - 112 : w - 68;
  const contentW = marginRight - marginLeft;
  const cx = (marginLeft + marginRight) / 2;

  // Paper pattern per spread
  if (spreadIndex === 0) drawSubtleDotOrGrid(ctx, w, h, 'dots');
  else if (spreadIndex === 1) drawSubtleDotOrGrid(ctx, w, h, 'grid');
  else if (spreadIndex === 2) drawSubtleDotOrGrid(ctx, w, h, 'dots');
  else drawSubtleDotOrGrid(ctx, w, h, 'ruled');

  // Spread eyebrow stamp (crisp high-contrast ink — Print 2)
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '700 25px "DM Sans", sans-serif';
  ctx.textAlign = side === 'left' ? 'left' : 'right';
  const eyebrowText = side === 'left' ? `CADERNO DE DIREÇÃO · 0${spreadIndex + 1}` : `FLAVIA BRITO · PÁG. 0${spreadIndex + 1}`;
  ctx.fillText(eyebrowText, side === 'left' ? marginLeft : marginRight, 76);
  ctx.restore();

  if (spreadIndex === 0 && side === 'left') {
    paintSpread1Left(ctx, w, h, marginLeft, contentW, anim);
  } else if (spreadIndex === 0 && side === 'right') {
    paintSpread1Right(ctx, w, h, marginLeft, contentW, cx, anim);
  } else if (spreadIndex === 1 && side === 'left') {
    paintSpread2Left(ctx, w, h, marginLeft, contentW, cx, anim);
  } else if (spreadIndex === 1 && side === 'right') {
    paintSpread2Right(ctx, w, h, marginLeft, contentW, cx, anim);
  } else if (spreadIndex === 2 && side === 'left') {
    paintSpread3Left(ctx, w, h, marginLeft, contentW, anim, assets);
  } else if (spreadIndex === 2 && side === 'right') {
    paintSpread3Right(ctx, w, h, marginLeft, contentW, cx, anim);
  } else if (spreadIndex === 3 && side === 'left') {
    paintSpread4Left(ctx, w, h, marginLeft, contentW, anim, assets);
  } else if (spreadIndex === 3 && side === 'right') {
    paintSpread4Right(ctx, w, h, marginLeft, contentW, cx, anim, assets);
  }

  // Punched spine holes & gutter depth
  drawPunchedSpineMargin(ctx, w, h, side, '#241F21');
}

/* ------------------------------------------------------------------
   SPREAD 01 — O PONTO DE PARTIDA
   ------------------------------------------------------------------ */
function paintSpread1Left(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  anim: number
) {
  // Scaled up proportionally to fill full vertical page cleanly (Print 5)
  // 1. Torn pink paper slip with START HERE cutout
  drawTornPaperRect(ctx, marginLeft, 120, 495, 148, '#F2BED6', { rotation: -0.024, border: true, stickerShadow: true });
  ctx.save();
  ctx.translate(marginLeft + 247, 194);
  ctx.rotate(-0.024);
  ctx.fillStyle = '#000000';
  ctx.font = '400 88px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('START HERE', 0, 2);
  ctx.restore();
  drawWashiTape(ctx, marginLeft + 445, 122, 142, 32, 'mint', 0.14, 0.94);

  // 2. First line of copy on crisp larger white sticker strip
  drawTornPaperRect(ctx, marginLeft - 4, 316, contentW - 6, 206, '#FFFFFF', { rotation: 0.006, border: true, stickerShadow: true, deckle: 3 });
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '700 46px "DM Sans", sans-serif';
  ctx.textAlign = 'left';
  const lines = wrapTextLines(ctx, 'Antes de pensar no tema do próximo post, precisamos:', contentW - 56);
  lines.forEach((line, idx) => {
    ctx.fillText(line, marginLeft + 24, 396 + idx * 62);
  });
  ctx.restore();

  // 3. Multi-layered physical collage cutout scaled down to bottom margin: "ENTENDER A FUNDO SUA MARCA."
  drawTornPaperRect(ctx, marginLeft + 20, 590, contentW - 22, 740, '#F2BED6', {
    rotation: 0.022,
    border: true,
    stickerShadow: false,
    deckle: 6,
  });
  drawTornPaperRect(ctx, marginLeft + 4, 574, contentW - 20, 735, '#A5DCD1', {
    rotation: -0.012,
    border: true,
    stickerShadow: true,
    deckle: 6,
  });
  drawWashiTape(ctx, marginLeft + 145, 572, 164, 34, 'hotpink', -0.09, 0.95);
  drawWashiTape(ctx, marginLeft + contentW - 105, 1300, 144, 32, 'cream', 0.12, 0.94);

  // Big bold editorial display inside tall card
  ctx.save();
  ctx.translate(marginLeft + (contentW - 20) / 2, 920);
  ctx.rotate(-0.012);
  ctx.textAlign = 'left';
  const bx = -(contentW - 20) / 2 + 44;

  ctx.fillStyle = '#000000';
  ctx.font = '400 116px "Anton", sans-serif';
  ctx.fillText('ENTENDER', bx, -135);
  ctx.fillText('A FUNDO', bx, -8);

  ctx.font = '400 118px "Anton", sans-serif';
  const marcaW = Math.max(460, ctx.measureText('SUA MARCA.').width + 54);

  ctx.fillStyle = '#000000';
  ctx.fillRect(bx - 12 + 7, 36 + 7, marcaW, 146);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bx - 12, 36, marcaW, 146);
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(bx - 12, 36, marcaW, 146);

  ctx.fillStyle = '#FB0C72';
  ctx.fillText('SUA MARCA.', bx + 12, 152);
  ctx.restore();

  drawHandUnderline(ctx, marginLeft + 46, 1172, marginLeft + 580, Math.max(0.22, anim), '#000000', 8);
  drawSparkle(ctx, marginLeft + contentW - 86, 668, 30 * (0.55 + 0.45 * anim), '#FB0C72');
}

function paintSpread1Right(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  cx: number,
  anim: number
) {
  drawCutoutPill(ctx, marginLeft, 130, 'BRIEFING CRIATIVO · PERGUNTAS', '#F2BED6', '#000000', '400 32px "Anton", sans-serif', -0.015);

  drawTornPaperRect(ctx, marginLeft + 10, 245, contentW - 36, 250, '#FFFFFF', { rotation: -0.015, border: true, stickerShadow: true });
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '700 24px "DM Sans", sans-serif';
  ctx.fillText('01 · IDENTIDADE', marginLeft + 48, 294);
  ctx.font = '400 72px "Anton", sans-serif';
  const qText = 'QUEM ELA É?';
  const qTextX = marginLeft + 88;
  const qTextY = 418;
  const qTextW = ctx.measureText(qText).width;
  ctx.fillText(qText, qTextX, qTextY);
  ctx.restore();

  drawHandCircle(
    ctx,
    qTextX + qTextW * 0.5,
    380,
    Math.max(210, qTextW * 0.68 + 18),
    74,
    1.0,
    '#FB0C72'
  );

  drawTornPaperRect(ctx, marginLeft + 20, 565, contentW - 30, 215, '#F2BED6', { rotation: 0.016, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + contentW - 110, 566, 130, 30, 'mint', -0.1, 0.94);
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '700 24px "DM Sans", sans-serif';
  ctx.fillText('02 · PROPÓSITO', marginLeft + 54, 618);
  ctx.font = '700 56px "DM Sans", sans-serif';
  ctx.fillText('Por que existe?', marginLeft + 54, 706);
  ctx.restore();
  drawHandUnderline(ctx, marginLeft + 54, 732, marginLeft + 465, Math.max(0.25, (anim - 0.1) * 2), '#FB0C72', 8);

  drawTornPaperRect(ctx, marginLeft + 8, 875, contentW - 20, 240, '#A5DCD1', { rotation: -0.012, border: true, stickerShadow: true });
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '700 24px "DM Sans", sans-serif';
  ctx.fillText('03 · DIFERENCIAL', marginLeft + 44, 926);
  ctx.font = '400 60px "Anton", sans-serif';
  ctx.fillText('O QUE A TORNA', marginLeft + 44, 1008);
  ctx.fillStyle = '#FB0C72';
  ctx.fillText('DIFERENTE?', marginLeft + 44, 1078);
  ctx.restore();

  drawHandArrow(ctx, cx + 180, 505, cx + 235, 535, cx + 190, 570, Math.max(0.25, (anim - 0.05) * 2), '#000000');
  drawHandArrow(ctx, marginLeft + 90, 790, marginLeft + 60, 840, marginLeft + 110, 880, Math.max(0.25, (anim - 0.25) * 2), '#000000');

  ctx.save();
  ctx.fillStyle = '#FB0C72';
  ctx.font = '700 40px "Caveat", cursive';
  ctx.fillText('investigar antes de criar!', marginLeft + 30, 1220);
  ctx.restore();
}

/* ------------------------------------------------------------------
   SPREAD 02 — A INVESTIGAÇÃO
   ------------------------------------------------------------------ */
function paintSpread2Left(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  cx: number,
  anim: number
) {
  // Print 7: Remove "VERDADE", keep ONLY "A INVESTIGAÇÃO"
  drawCutoutPill(ctx, marginLeft, 130, 'A INVESTIGAÇÃO', '#A5DCD1', '#000000', '400 34px "Anton", sans-serif', -0.015);

  drawTornPaperRect(ctx, marginLeft + 10, 270, contentW - 20, 595, '#F2BED6', {
    rotation: 0.016,
    border: true,
    stickerShadow: true,
    deckle: 6,
  });
  drawWashiTape(ctx, cx, 274, 195, 36, 'mint', -0.04, 0.94);

  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '400 88px "Anton", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MEU TRABALHO', marginLeft + 56, 428);
  ctx.fillText('COMEÇA', marginLeft + 56, 530);
  ctx.fillStyle = '#FB0C72';
  ctx.fillText('NESSAS', marginLeft + 56, 632);
  ctx.fillStyle = '#000000';
  ctx.fillText('RESPOSTAS.', marginLeft + 56, 734);
  ctx.restore();

  drawHandUnderline(ctx, marginLeft + 56, 762, marginLeft + 480, Math.max(0.28, anim), '#FB0C72', 9);
  drawSparkle(ctx, marginLeft + contentW - 78, 360, 26 * (0.6 + 0.4 * anim), '#FB0C72');

  // Print 6: Enlarged bottom handwritten callout with clean period (no sideways arrow)
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '700 62px "Caveat", cursive';
  ctx.fillText('cada resposta revela uma direção.', marginLeft + 24, 1035);
  ctx.restore();
  drawHandUnderline(ctx, marginLeft + 24, 1058, marginLeft + contentW - 110, Math.max(0.25, anim), '#FB0C72', 7);
}

function paintSpread2Right(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  _cx: number,
  anim: number
) {
  drawCutoutPill(ctx, marginLeft + 8, 130, 'DIAGNÓSTICO DE MARCA', '#000000', '#FFF9F4', '400 32px "Anton", sans-serif', 0.012);

  // Print 8: Taller card with larger, high-contrast text filling the whole white slip
  drawTornPaperRect(ctx, marginLeft + 26, 285, contentW - 42, 920, '#A5DCD1', {
    rotation: 0.022,
    border: true,
    stickerShadow: false,
    deckle: 5,
  });

  drawTornPaperRect(ctx, marginLeft + 10, 265, contentW - 38, 915, '#FFFFFF', {
    rotation: -0.014,
    border: true,
    stickerShadow: true,
    deckle: 4,
  });
  drawWashiTape(ctx, marginLeft + 145, 270, 158, 34, 'hotpink', 0.14, 0.95);
  drawWashiTape(ctx, marginLeft + contentW - 110, 1165, 140, 32, 'pink', -0.08, 0.94);

  ctx.save();
  ctx.translate(marginLeft + 62, 368);
  ctx.rotate(-0.014);
  ctx.fillStyle = '#000000';
  ctx.font = '800 34px "DM Sans", sans-serif';
  ctx.fillText('NOTAS DE DIAGNÓSTICO', 0, 0);

  const notes = [
    '↗ Entender a história por trás da marca',
    '↗ Descobrir o que ela tem de único',
    '↗ Encontrar o motivo pelo qual alguém deveria escolhê-la',
  ];

  ctx.font = '700 58px "Caveat", cursive';
  const maxNoteW = contentW - 148;
  let curY = 128;
  notes.forEach((note) => {
    const wrapped = wrapTextLines(ctx, note, maxNoteW);
    wrapped.forEach((line, li) => {
      if (li === 0 && line.startsWith('↗')) {
        ctx.fillStyle = '#FB0C72';
        ctx.fillText('↗', 0, curY);
        ctx.fillStyle = '#000000';
        ctx.fillText(line.slice(1).trimStart(), 44, curY);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillText(line, 44, curY);
      }
      curY += 68;
    });
    curY += 68;
  });
  ctx.restore();

  drawHandUnderline(ctx, marginLeft + 64, 392, marginLeft + 520, Math.max(0.28, anim), '#FB0C72', 8);
  drawSparkle(ctx, marginLeft + contentW - 86, 355, 24 * (0.6 + 0.4 * anim), '#FB0C72');
}

/* ------------------------------------------------------------------
   SPREAD 03 — POSICIONAMENTO E ESTRATÉGIA
   ------------------------------------------------------------------ */
function paintSpread3Left(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  anim: number,
  assets: LoadedEditorialAssets
) {
  // Copy sticker sheet with complete multi-line animated highlighter sweep (Print 9)
  drawTornPaperRect(ctx, marginLeft - 8, 130, contentW - 4, 480, '#FFFFFF', { rotation: -0.008, border: true, stickerShadow: true, deckle: 3 });
  drawWashiTape(ctx, marginLeft + contentW - 120, 132, 132, 28, 'pink', -0.07, 0.94);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '700 38px "DM Sans", sans-serif';
  const copy =
    'A partir delas, desenvolvo um posicionamento próprio e uma estratégia de conteúdo que conecta a identidade da marca ao público que ela deseja alcançar.';
  const lines = wrapTextLines(ctx, copy, contentW - 58);

  // Measure exact character span for "posicionamento próprio e uma estratégia de conteúdo"
  const phrasePink = 'posicionamento próprio';
  const phraseMintFull = 'e uma estratégia de conteúdo';
  const sweepProg = Math.max(0.45, Math.min(1, anim * 1.45));

  const drawSubHighlight = (lineText: string, lineX: number, lineY: number, sub: string, color: string, prog: number) => {
    const idx = lineText.indexOf(sub);
    if (idx === -1 || prog <= 0) return;
    const preW = ctx.measureText(lineText.slice(0, idx)).width;
    const subW = ctx.measureText(sub).width;
    ctx.fillStyle = color;
    ctx.fillRect(lineX + preW - 6, lineY - 35, (subW + 12) * prog, 47);
  };

  lines.forEach((line, idx) => {
    const lx = marginLeft + 24;
    const y = 212 + idx * 58;

    // 1. Highlight "posicionamento próprio" in pastel pink
    drawSubHighlight(line, lx, y, phrasePink, '#F2BED6', Math.min(1, sweepProg * 1.6));

    // 2. Highlight "e uma estratégia de conteúdo" in mint across line wraps cleanly
    const pMint = Math.max(0, Math.min(1, (sweepProg - 0.15) * 1.25));
    const idxFull = line.indexOf(phraseMintFull);
    if (idxFull !== -1) {
      drawSubHighlight(line, lx, y, phraseMintFull, '#A5DCD1', pMint);
    } else {
      // Split across wrapped lines: e.g. "... e uma estratégia de" on this line + "conteúdo ..." on next line
      const tokens = phraseMintFull.split(' ');
      for (let split = tokens.length - 1; split >= 1; split--) {
        const partA = tokens.slice(0, split).join(' ');
        const partB = tokens.slice(split).join(' ');
        if (line.includes(partA) && lines[idx + 1]?.includes(partB)) {
          const pA = Math.min(1, pMint * 1.45);
          drawSubHighlight(line, lx, y, partA, '#A5DCD1', pA);
        } else if (line.startsWith(partB) && lines[idx - 1]?.includes(partA)) {
          const pB = Math.max(0, Math.min(1, (pMint - 0.45) * 1.9));
          drawSubHighlight(line, lx, y, partB, '#A5DCD1', pB);
        }
      }
      // Single-word check if "conteúdo" wrapped individually onto next line
      if (line.includes('conteúdo') && !line.includes('estratégia')) {
        const pWord = Math.max(0, Math.min(1, (pMint - 0.35) * 1.6));
        drawSubHighlight(line, lx, y, 'conteúdo', '#A5DCD1', pWord);
      }
      if (line.includes('e uma estratégia de') && !line.includes('conteúdo')) {
        drawSubHighlight(line, lx, y, 'e uma estratégia de', '#A5DCD1', Math.min(1, pMint * 1.45));
      }
    }

    ctx.fillStyle = '#000000';
    ctx.fillText(line, lx, y);
  });
  ctx.restore();

  // Print 10 & 12: Expanded Visual Identity Summary Card (Colors + Typography + Monogram Logo from Image 11)
  // Polaroid removed cleanly to give generous space to this brand identity board
  const cardX = marginLeft;
  const cardY = 665;
  const cardW = contentW - 14;
  const cardH = 620;
  drawTornPaperRect(ctx, cardX, cardY, cardW, cardH, '#FFF9F4', { rotation: -0.012, border: true, stickerShadow: true, deckle: 4 });
  drawWashiTape(ctx, cardX + cardW - 130, cardY + 6, 140, 30, 'mint', 0.08, 0.94);

  ctx.save();
  ctx.translate(cardX + 40, cardY + 62);
  ctx.rotate(-0.012);

  // Header: IDENTIDADE VISUAL (Print 10)
  ctx.fillStyle = '#000000';
  ctx.font = '800 30px "DM Sans", sans-serif';
  ctx.fillText('IDENTIDADE VISUAL', 0, 12);

  // 1. CORES (4 crisp swatches + hex labels)
  ctx.font = '700 18px "DM Sans", sans-serif';
  ctx.fillStyle = '#555555';
  ctx.fillText('CORES', 0, 56);

  const swatches = [
    { col: '#FB0C72', label: '#FB0C72' },
    { col: '#F2BED6', label: '#F2BED6' },
    { col: '#A5DCD1', label: '#A5DCD1' },
    { col: '#000000', label: '#000000' },
  ];
  const swW = Math.floor((cardW - 125) / 4);
  swatches.forEach((sw, i) => {
    const sx = i * (swW + 14);
    ctx.fillStyle = sw.col;
    ctx.fillRect(sx, 72, swW, 118);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.strokeRect(sx, 72, swW, 118);

    ctx.fillStyle = '#000000';
    ctx.font = '700 17px "DM Sans", sans-serif';
    ctx.fillText(sw.label, sx + 4, 214);
  });

  // 2. Bottom Split: TIPOGRAFIA (left) + MONOGRAMA LOGO Image 11 (right)
  const botY = 252;
  const colGap = 24;
  const typoW = Math.floor((cardW - 86 - colGap) * 0.56);
  const logoW = cardW - 86 - colGap - typoW;
  const boxH = 266;

  // TIPOGRAFIA Box
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, botY, typoW, boxH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(0, botY, typoW, boxH);

  ctx.fillStyle = '#555555';
  ctx.font = '700 18px "DM Sans", sans-serif';
  ctx.fillText('TIPOGRAFIA', 22, botY + 34);

  // Anton specimen
  ctx.fillStyle = '#000000';
  ctx.font = '400 44px "Anton", sans-serif';
  ctx.fillText('Aa Bb', 22, botY + 92);
  ctx.font = '700 17px "DM Sans", sans-serif';
  ctx.fillStyle = '#FB0C72';
  ctx.fillText('ANTON · DISPLAY', 140, botY + 84);

  // DM Sans specimen
  ctx.fillStyle = '#000000';
  ctx.font = '700 36px "DM Sans", sans-serif';
  ctx.fillText('Aa Bb', 22, botY + 158);
  ctx.font = '700 17px "DM Sans", sans-serif';
  ctx.fillStyle = '#444444';
  ctx.fillText('DM SANS · TEXTO', 140, botY + 152);

  // Caveat specimen
  ctx.fillStyle = '#000000';
  ctx.font = '700 42px "Caveat", cursive';
  ctx.fillText('Aa Bb', 22, botY + 224);
  ctx.font = '700 17px "DM Sans", sans-serif';
  ctx.fillStyle = '#444444';
  ctx.fillText('CAVEAT · NOTAS', 140, botY + 216);

  // MONOGRAMA Box (Image 11 cleanly aspect-fitted inside white frame)
  const lx = typoW + colGap;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(lx, botY, logoW, boxH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(lx, botY, logoW, boxH);

  ctx.fillStyle = '#555555';
  ctx.font = '700 18px "DM Sans", sans-serif';
  ctx.fillText('MONOGRAMA', lx + 20, botY + 34);

  const monoImg = assets.monogramLogo;
  if (isImgReady(monoImg)) {
    const availW = logoW - 36;
    const availH = boxH - 60;
    const ratio = monoImg.naturalWidth / Math.max(1, monoImg.naturalHeight);
    let drawW = availW;
    let drawH = drawW / ratio;
    if (drawH > availH) {
      drawH = availH;
      drawW = drawH * ratio;
    }
    const drawX = lx + (logoW - drawW) / 2;
    const drawY = botY + 46 + (availH - drawH) / 2;
    ctx.drawImage(monoImg, drawX, drawY, drawW, drawH);
  } else {
    // Crisp fallback monogram matching Image 11 proportions if network fails
    ctx.save();
    ctx.fillStyle = '#FB0C72';
    ctx.font = '700 132px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('F', lx + logoW * 0.42, botY + 198);
    ctx.fillStyle = '#000000';
    ctx.font = '700 118px "Caveat", cursive';
    ctx.fillText('B', lx + logoW * 0.58, botY + 212);
    ctx.restore();
  }
  ctx.restore();
}

function paintSpread3Right(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  cx: number,
  anim: number
) {
  // Print 13: ONLY "MARCA", "POSICIONAMENTO", "PÚBLICO" bold & centered proportionally; remove extra text & logo
  // Cutout 1: MARCA
  drawTornPaperRect(ctx, marginLeft + 25, 145, contentW - 90, 265, '#FFFFFF', { rotation: -0.022, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + 115, 148, 134, 30, 'hotpink', 0.1, 0.94);
  ctx.save();
  ctx.translate(marginLeft + 25 + (contentW - 90) / 2, 282);
  ctx.rotate(-0.022);
  ctx.fillStyle = '#000000';
  ctx.font = '400 132px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MARCA', 0, 4);
  ctx.restore();

  // Hand-drawn curved arrow 1 -> 2
  drawHandArrow(ctx, cx + 185, 424, cx + 245, 495, cx + 145, 558, Math.max(0.25, anim * 1.9), '#FB0C72');

  // Cutout 2: POSICIONAMENTO
  drawTornPaperRect(ctx, marginLeft + 45, 565, contentW - 55, 275, '#F2BED6', { rotation: 0.016, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + contentW - 95, 568, 136, 30, 'mint', -0.08, 0.94);
  ctx.save();
  ctx.translate(marginLeft + 45 + (contentW - 55) / 2, 706);
  ctx.rotate(0.016);
  ctx.fillStyle = '#000000';
  ctx.font = '400 92px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POSICIONAMENTO', 0, 4);
  ctx.restore();

  // Hand-drawn curved arrow 2 -> 3
  drawHandArrow(ctx, marginLeft + 165, 855, marginLeft + 90, 930, marginLeft + 205, 992, Math.max(0.25, (anim - 0.15) * 1.8), '#000000');

  // Cutout 3: PÚBLICO
  drawTornPaperRect(ctx, marginLeft + 15, 1002, contentW - 75, 265, '#A5DCD1', { rotation: -0.014, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + 135, 1005, 130, 28, 'cream', -0.06, 0.94);
  ctx.save();
  ctx.translate(marginLeft + 15 + (contentW - 75) / 2, 1138);
  ctx.rotate(-0.014);
  ctx.fillStyle = '#000000';
  ctx.font = '400 132px "Anton", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PÚBLICO', 0, 4);
  ctx.restore();
}

/* ------------------------------------------------------------------
   SPREAD 04 — ESTRATÉGIA EM AÇÃO (Prints 14 & 15)
   Left Page: Copy + Checklist raised closer to copy + PLANEJAMENTO & CAMPANHAS at bottom
   Right Page: PUBLICAÇÕES (Instagram Feed) + INDICADORES (Chart) spaciously displayed
   ------------------------------------------------------------------ */
function paintSpread4Left(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  anim: number,
  assets: LoadedEditorialAssets
) {
  drawCutoutPill(ctx, marginLeft, 114, 'DA DIREÇÃO À EXECUÇÃO', '#A5DCD1', '#000000', '400 32px "Anton", sans-serif', -0.015);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = '700 35px "DM Sans", sans-serif';
  const copy =
    'Depois, transformo essa direção em planejamento, campanhas, publicações e decisões orientadas por indicadores.';
  const lines = wrapTextLines(ctx, copy, contentW - 16);
  lines.forEach((line, idx) => {
    ctx.fillText(line, marginLeft, 224 + idx * 46);
  });
  ctx.restore();

  drawHandUnderline(ctx, marginLeft, 388, marginLeft + 520, Math.max(0.25, anim), '#FB0C72', 7);

  // Print 14: Checklist moved up right under the underline with balanced breathing room
  drawTornPaperRect(ctx, marginLeft + 8, 424, contentW - 20, 382, '#FFFFFF', { rotation: 0.012, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + 135, 428, 145, 28, 'hotpink', -0.05, 0.94);

  const items = [
    { label: '01 · PLANEJAMENTO', note: 'calendário editorial' },
    { label: '02 · CAMPANHAS', note: 'ações e lançamentos' },
    { label: '03 · PUBLICAÇÕES', note: 'consistência que sustenta a marca' },
    { label: '04 · INDICADORES', note: 'identificar o que funciona e replicar' },
  ];
  ctx.save();
  items.forEach((item, idx) => {
    const y = 492 + idx * 82;
    const itemProg = Math.min(1, Math.max(0, (anim - idx * 0.14) * 2.4));
    ctx.fillStyle = itemProg > 0.2 ? '#FB0C72' : '#F2BED6';
    ctx.fillRect(marginLeft + 44, y - 20, 22, 22);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(marginLeft + 44, y - 20, 22, 22);

    ctx.fillStyle = '#000000';
    ctx.font = '400 30px "Anton", sans-serif';
    ctx.fillText(item.label, marginLeft + 82, y);
    ctx.font = '700 31px "Caveat", cursive';
    ctx.fillStyle = '#FB0C72';
    ctx.fillText(item.note, marginLeft + 82, y + 29);
  });
  ctx.restore();

  // Print 15 moved cleanly into the bottom half of Spread 04 Left: PLANEJAMENTO + CAMPANHAS
  const halfW = (contentW - 28) / 2;
  const botCardY = 836;
  const botCardH = 486;

  // Piece 1: PLANEJAMENTO (Print 1 — Clean & Highly Readable Funnel Labels)
  drawTornPaperRect(ctx, marginLeft, botCardY, halfW, botCardH, '#FFF9F4', { rotation: -0.015, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + halfW / 2, botCardY + 4, 122, 28, 'mint', -0.04, 0.94);
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = '400 40px "Anton", sans-serif';
  ctx.fillText('PLANEJAMENTO', marginLeft + 24, botCardY + 72);

  // Purple header bar: "LINHAS DE FUNIL"
  ctx.fillStyle = '#8953D1';
  ctx.fillRect(marginLeft + 24, botCardY + 94, halfW - 48, 46);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(marginLeft + 24, botCardY + 94, halfW - 48, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LINHAS DE FUNIL', marginLeft + halfW / 2, botCardY + 118);

  // 3 clear colored labels: "segunda - topo", "terça - meio", "sexta - base"
  const funnelPills = [
    { label: 'SEGUNDA - TOPO', bg: '#D49BFF' },
    { label: 'TERÇA - MEIO', bg: '#A5DCD1' },
    { label: 'SEXTA - BASE', bg: '#F2BED6' },
  ];
  const pillW = halfW - 48;
  const pillH = 82;
  const pillGap = 18;
  funnelPills.forEach((pill, idx) => {
    const px = marginLeft + 24;
    const py = botCardY + 162 + idx * (pillH + pillGap);

    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 5, py + 5, pillW, pillH);

    ctx.fillStyle = pill.bg;
    ctx.fillRect(px, py, pillW, pillH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.6;
    ctx.strokeRect(px, py, pillW, pillH);

    ctx.fillStyle = '#000000';
    ctx.font = '400 34px "Anton", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pill.label, px + pillW / 2, py + pillH / 2 + 2);
  });
  ctx.restore();

  // Piece 2: CAMPANHAS (Print 2 — "LANÇAMENTOS - PROJETOS", no bottom text)
  const rx = marginLeft + halfW + 28;
  ctx.save();
  drawTornPaperRect(ctx, rx, botCardY + 10, halfW, botCardH - 10, '#FB0C72', { rotation: 0.018, border: true, stickerShadow: true });
  drawWashiTape(ctx, rx + halfW / 2, botCardY + 14, 122, 28, 'cream', 0.06, 0.94);
  ctx.fillStyle = '#FFF9F4';
  ctx.font = '400 40px "Anton", sans-serif';
  ctx.fillText('CAMPANHAS', rx + 26, botCardY + 80);

  ctx.fillStyle = '#000000';
  ctx.font = '700 21px "DM Sans", sans-serif';
  ctx.fillText('LANÇAMENTOS - PROJETOS', rx + 26, botCardY + 114);

  // Collage Photo A (centered generously in lower card area)
  ctx.save();
  ctx.translate(rx + 126, botCardY + 286);
  ctx.rotate(-0.075);
  ctx.fillStyle = '#000000';
  ctx.fillRect(-88, -112, 184, 228);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-92, -116, 184, 228);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(-92, -116, 184, 228);
  if (assets.campaignPhoto1 && assets.campaignPhoto1.complete && assets.campaignPhoto1.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-82, -106, 164, 196);
    ctx.clip();
    drawCoverCroppedImage(ctx, assets.campaignPhoto1, -82, -106, 164, 196);
    ctx.restore();
  } else {
    ctx.fillStyle = '#F2BED6';
    ctx.fillRect(-82, -106, 164, 196);
  }
  ctx.strokeRect(-82, -106, 164, 196);
  ctx.restore();
  drawWashiTape(ctx, rx + 98, botCardY + 170, 88, 24, 'mint', -0.22, 0.94);

  // Collage Photo B
  ctx.save();
  ctx.translate(rx + halfW - 118, botCardY + 306);
  ctx.rotate(0.065);
  ctx.fillStyle = '#000000';
  ctx.fillRect(-94, -110, 196, 218);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-98, -114, 196, 218);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(-98, -114, 196, 218);
  if (assets.campaignPhoto2 && assets.campaignPhoto2.complete && assets.campaignPhoto2.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-88, -104, 176, 188);
    ctx.clip();
    drawCoverCroppedImage(ctx, assets.campaignPhoto2, -88, -104, 176, 188);
    ctx.restore();
  } else {
    ctx.fillStyle = '#A5DCD1';
    ctx.fillRect(-88, -104, 176, 188);
  }
  ctx.strokeRect(-88, -104, 176, 188);
  ctx.restore();
  drawWashiTape(ctx, rx + halfW - 86, botCardY + 190, 90, 24, 'pink', 0.24, 0.94);
  ctx.restore();
}

function paintSpread4Right(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  marginLeft: number,
  contentW: number,
  _cx: number,
  anim: number,
  assets: LoadedEditorialAssets
) {
  // Piece 3: PUBLICAÇÕES (Print 1 & Image 4 — crisp Instagram feed hero, zero washed-out blowout)
  const cardW = contentW - 16;
  ctx.save();
  drawTornPaperRect(ctx, marginLeft + 8, 114, cardW, 712, '#FFFFFF', { rotation: -0.01, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + 130, 118, 140, 30, 'pink', -0.09, 0.94);
  ctx.fillStyle = '#000000';
  ctx.font = '400 44px "Anton", sans-serif';
  ctx.fillText('PUBLICAÇÕES', marginLeft + 36, 190);

  // Center Image 4 (assets.igFeedPhoto) prominently with crisp ink legibility
  const feedImg = assets.igFeedPhoto;
  const maxBoxW = cardW - 64;
  const maxBoxH = 602;
  let frameW = 430;
  let frameH = 602;
  if (isImgReady(feedImg)) {
    const ratio = feedImg.naturalWidth / Math.max(1, feedImg.naturalHeight);
    frameH = maxBoxH;
    frameW = Math.min(maxBoxW, Math.round(frameH * ratio));
  }
  const frameX = marginLeft + 8 + Math.round((cardW - frameW) / 2);
  const frameY = 204;

  ctx.fillStyle = '#000000';
  ctx.fillRect(frameX + 8, frameY + 8, frameW, frameH);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(frameX, frameY, frameW, frameH);

  if (isImgReady(feedImg)) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'contrast(1.12) saturate(1.06)';
    ctx.drawImage(feedImg, frameX, frameY, frameW, frameH);
    ctx.restore();
  }
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.8;
  ctx.strokeRect(frameX, frameY, frameW, frameH);
  ctx.restore();

  // Piece 4: INDICADORES (zero fake numbers, period punctuation)
  ctx.save();
  drawTornPaperRect(ctx, marginLeft + 8, 858, cardW, 444, '#A5DCD1', { rotation: 0.012, border: true, stickerShadow: true });
  drawWashiTape(ctx, marginLeft + cardW - 120, 861, 140, 30, 'hotpink', 0.1, 0.94);
  ctx.fillStyle = '#000000';
  ctx.font = '400 44px "Anton", sans-serif';
  ctx.fillText('INDICADORES', marginLeft + 36, 936);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(marginLeft + 36, 962, cardW - 72, 246);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.6;
  ctx.strokeRect(marginLeft + 36, 962, cardW - 72, 246);

  const barScale = 0.55 + 0.45 * anim;
  const barHeights = [66, 94, 84, 128, 146, 174];
  const barStep = Math.floor((cardW - 160) / barHeights.length);
  barHeights.forEach((rawBh, idx) => {
    const bh = rawBh * barScale;
    const bx = marginLeft + 74 + idx * barStep;
    const by = 1184 - bh;
    ctx.fillStyle = idx === 5 ? '#FB0C72' : idx % 2 === 1 ? '#A5DCD1' : '#F2BED6';
    ctx.fillRect(bx, by, 68, bh);
    ctx.strokeRect(bx, by, 68, bh);
  });

  // Rising trend polyline above bars
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  barHeights.forEach((rawBh, idx) => {
    const bh = rawBh * barScale;
    const px = marginLeft + 108 + idx * barStep;
    const py = 1158 - bh;
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = '700 40px "Caveat", cursive';
  ctx.fillText('leitura orientada para os próximos passos.', marginLeft + 36, 1266);
  ctx.restore();
}
