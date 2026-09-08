import { isDivineMercyMode } from './bookletSequence';
import { ANGELUS_ID, MAGNIFICAT_ID } from '../data/marianDevotionsData';
import { SAGRADO_CORAZON_ADORACION_ID } from '../data/sagradoCorazonAdoracionData';
import { formatLitanyLine } from './litanyHelpers';
import { pickPrayerImage } from './prayerImages';

const MYSTERY_SUBTITLES = {
  gozosos: 'Misterios Gozosos',
  dolorosos: 'Misterios Dolorosos',
  gloriosos: 'Misterios Gloriosos',
  luminosos: 'Misterios Luminosos',
};

/** Devotion label for share cards and outline chrome. */
export function getBookletDevotionLabel(misterioActual) {
  const isMercy = isDivineMercyMode(misterioActual);
  if (misterioActual === ANGELUS_ID) {
    return { title: 'Ángelus', subtitle: 'Oración de la Encarnación' };
  }
  if (misterioActual === MAGNIFICAT_ID) {
    return { title: 'Magnificat', subtitle: 'Cántico de María' };
  }
  if (misterioActual === 'divinamisericordia_novena') {
    return { title: 'Novena de la Divina Misericordia', subtitle: null };
  }
  if (isMercy) {
    return { title: 'Corona de la Divina Misericordia', subtitle: null };
  }
  if (misterioActual === 'sangrepreciosa_litany') {
    return { title: 'Letanía de la Preciosísima Sangre', subtitle: 'Julio — Mes de la Sangre de Cristo' };
  }
  if (misterioActual === 'sangrepreciosa_chaplet') {
    return { title: 'Corona de la Preciosísima Sangre', subtitle: 'Siete Derramamientos' };
  }
  if (misterioActual === 'sangrepreciosa_ofrendas') {
    return { title: 'Siete Ofrendas de la Sangre de Cristo', subtitle: 'Julio — Mes de la Sangre' };
  }
  if (misterioActual === 'viacrucis') {
    return { title: 'Vía Crucis', subtitle: '14 estaciones' };
  }
  if (misterioActual === 'viacrucis_rosario') {
    return { title: 'Vía Crucis · Rosario', subtitle: '14 décadas · ~140 Ave Marías' };
  }
  if (misterioActual === 'vialucis') {
    return { title: 'Vía Lucis', subtitle: '14 estaciones' };
  }
  if (misterioActual === SAGRADO_CORAZON_ADORACION_ID) {
    return { title: 'Adoración Eucarística', subtitle: 'Sagrado Corazón de Jesús' };
  }
  return {
    title: 'Santo Rosario',
    subtitle: MYSTERY_SUBTITLES[misterioActual] || 'Misterios del Rosario',
  };
}

export function formatBookletShareProgress({
  displayIndex,
  total,
  isSagradoCorazon,
  misterioActual,
  novenaDay,
  activePrayerId,
  isLitany,
  litanyVerseIndex,
  litanyVerseTotal,
  isPerVersePrayer,
  prayerVerseIndex,
  prayerVerseTotal,
  stepContext,
  isMercy,
  isAveMaria,
  aveRunInfo,
  mercyRunInfo,
  tripletRunInfo,
  isMercyDecade,
  isMercyPassion,
  isHolyGod,
}) {
  const base = isSagradoCorazon
    ? `Paso ${displayIndex + 1} de ${total}`
    : `${displayIndex + 1} / ${total}`;

  const extras = [];
  if (misterioActual === 'divinamisericordia_novena' && activePrayerId === 'NOVENA_DAY_INTENTION') {
    extras.push(`Día ${novenaDay} de 9`);
  }
  if (isLitany && litanyVerseTotal > 0) {
    extras.push(`letanía ${litanyVerseIndex + 1} / ${litanyVerseTotal}`);
  }
  if (isPerVersePrayer && prayerVerseTotal > 0) {
    extras.push(`verso ${prayerVerseIndex + 1} / ${prayerVerseTotal}`);
  }
  if (isAveMaria && aveRunInfo) {
    extras.push(`${aveRunInfo.position} de ${aveRunInfo.total}`);
  }
  if (isMercyPassion && mercyRunInfo) {
    extras.push(`${mercyRunInfo.position} de ${mercyRunInfo.total}`);
  }
  if (isHolyGod && tripletRunInfo) {
    extras.push(`${tripletRunInfo.position} de ${tripletRunInfo.total}`);
  }
  if (stepContext?.kind === 'mystery' && stepContext.mysteryDecade) {
    extras.push(`misterio ${stepContext.mysteryDecade} de 5`);
  }
  if (isMercyDecade && stepContext?.mysteryDecade) {
    extras.push(`década ${stepContext.mysteryDecade} de 5`);
  }

  if (!extras.length) return base;
  return `${base} · ${extras.join(' · ')}`;
}

/**
 * Collapse whitespace but KEEP paragraph / verse line breaks so prayers
 * (Padre Nuestro, Ave María, …) don't render as a wall of text on the card.
 */
export function truncateShareText(text, maxChars = 720) {
  const normalized = `${text || ''}`
    .replace(/\r\n/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (normalized.length <= maxChars) return normalized;
  const sliced = normalized.slice(0, maxChars - 1).trim();
  // Prefer cutting at a line/word boundary so we don't split mid-word.
  const boundary = Math.max(sliced.lastIndexOf('\n'), sliced.lastIndexOf(' '));
  if (boundary > maxChars * 0.6) return `${sliced.slice(0, boundary).trim()}…`;
  return `${sliced}…`;
}

export function resolveShareBackgroundUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  if (typeof window !== 'undefined' && rawUrl.startsWith('/')) {
    return `${window.location.origin}${rawUrl}`;
  }
  // Relative asset path (e.g. "gallery-images/…") — resolve against origin
  // so the card <img> and the preload probe hit the same absolute URL.
  if (typeof window !== 'undefined' && !rawUrl.startsWith('blob:')) {
    return `${window.location.origin}/${rawUrl.replace(/^\/+/, '')}`;
  }
  return rawUrl;
}

/** Fallback art so the card never renders as a flat dark rectangle. */
export const SHARE_FALLBACK_ART = '/logo.png';

export function resolveShareBackgroundUrlWithFallback(rawUrl, fallback = SHARE_FALLBACK_ART) {
  return resolveShareBackgroundUrl(rawUrl) || resolveShareBackgroundUrl(fallback);
}

/**
 * Deep link back to the exact prayer step. AppShell syncs
 * `?misterio=&paso=` (& `dia=` for the novena) into the URL, so the
 * current href already encodes the step — keep it, stripping only
 * volatile params. Falls back to an explicitly built link.
 */
export function buildShareDeepLink({ misterioActual, displayIndex, novenaDay } = {}) {
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('sync');
      if (misterioActual) url.searchParams.set('misterio', misterioActual);
      if (Number.isInteger(displayIndex) && displayIndex >= 0) {
        url.searchParams.set('paso', String(displayIndex));
      }
      if (misterioActual === 'divinamisericordia_novena' && novenaDay) {
        url.searchParams.set('dia', String(novenaDay));
      }
      return url.toString();
    } catch (_) {
      /* fall through to origin fallback */
    }
  }
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://rosario.gatrivi.com';
  const params = new URLSearchParams();
  if (misterioActual) params.set('misterio', misterioActual);
  if (Number.isInteger(displayIndex) && displayIndex >= 0) params.set('paso', String(displayIndex));
  const qs = params.toString();
  return qs ? `${base}/?${qs}` : `${base}/`;
}

/** Short host line printed ON the PNG (the pixels aren't clickable). */
export function getShareUrlLine(url) {
  try {
    const parsed = new URL(url);
    return parsed.host + (parsed.pathname !== '/' ? parsed.pathname : '');
  } catch (_) {
    return 'rosario.gatrivi.com';
  }
}

export function buildShareCardPayload({
  misterioActual,
  prayerTitle,
  prayerText,
  backgroundUrl,
  progressLabel,
  shareUrl,
}) {
  const devotion = getBookletDevotionLabel(misterioActual);
  return {
    devotionTitle: devotion.title,
    devotionSubtitle: devotion.subtitle,
    prayerTitle: prayerTitle || '',
    prayerText: truncateShareText(prayerText),
    backgroundUrl: resolveShareBackgroundUrlWithFallback(backgroundUrl),
    progressLabel: progressLabel || '',
    brandLine: 'Rosario Cards',
    urlLine: shareUrl ? getShareUrlLine(shareUrl) : 'rosario.gatrivi.com',
  };
}

export function getOutlineStepThumb(step, mysteryType, index) {
  if (step?.img) return step.img;
  if (step?.imgCandidates?.length) {
    return pickPrayerImage(step.imgCandidates, index);
  }
  return null;
}

export function preloadShareImage(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), timeoutMs);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
  });
}

/**
 * Wait until every <img> inside the card is decoded so html2canvas
 * doesn't capture a blank background. Never rejects; resolves false
 * on timeout so sharing can still proceed with whatever rendered.
 */
export async function waitForCardImages(cardElement, timeoutMs = 8000) {
  try {
    if (!cardElement) return false;
    const imgs = Array.from(cardElement.querySelectorAll('img'));
    if (!imgs.length) return true;
    const deadline = Date.now() + timeoutMs;
    const pending = imgs.filter((img) => !(img.complete && img.naturalWidth > 0));
    if (!pending.length) return true;
    await Promise.all(
      pending.map(
        (img) =>
          new Promise((resolve) => {
            const timer = setTimeout(resolve, Math.max(0, deadline - Date.now()));
            img.onload = () => {
              clearTimeout(timer);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timer);
              resolve();
            };
            // Re-kick decoding for cached-but-not-decoded images.
            if (img.complete && img.naturalWidth > 0) {
              clearTimeout(timer);
              resolve();
            }
          })
      )
    );
    try {
      await Promise.all(
        pending
          .filter((img) => img.decode && img.naturalWidth > 0)
          .map((img) => img.decode().catch(() => {}))
      );
    } catch (_) {
      /* decode is best-effort */
    }
    return imgs.every((img) => img.complete && img.naturalWidth > 0);
  } catch (_) {
    return false;
  }
}

export async function waitForShareReady(cardElement, backgroundUrl, timeoutMs = 8000) {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);
    }
  } catch (_) {
    /* fonts are best-effort */
  }
  await preloadShareImage(backgroundUrl, timeoutMs);
  // Let React commit the portal + the <img> start decoding.
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  return waitForCardImages(cardElement, timeoutMs);
}

export async function captureShareCardPng(cardElement) {
  if (!cardElement) throw new Error('Share card element missing');
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(cardElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#0d0a1a',
    logging: false,
    imageTimeout: 15000,
    windowWidth: Math.max(cardElement.scrollWidth, 540),
    windowHeight: Math.max(cardElement.scrollHeight, 720),
    // The capture host sits off-screen with opacity 0 so it never
    // flashes on screen; force the clone visible for html2canvas,
    // which can otherwise snapshot `visibility: hidden` as blank.
    onclone: (doc) => {
      try {
        const hosts = doc.querySelectorAll('.booklet-share-capture-host');
        hosts.forEach((host) => {
          host.style.visibility = 'visible';
          host.style.opacity = '1';
          host.style.zIndex = '99999';
        });
      } catch (_) {
        /* best-effort */
      }
    },
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('No se pudo generar la imagen'));
      },
      'image/png',
      0.92
    );
  });
}

/**
 * Share PNG via Web Share API, else download, else return blob for preview.
 * URL drawn on the PNG is not clickable — always put the real link in `text` (and `url` when supported).
 * @returns {'shared'|'downloaded'|'preview'}
 */
export async function deliverSharePng(blob, { filename, title, text, url }) {
  const file = new File([blob], filename, { type: 'image/png' });
  const shareText = [text, url].filter(Boolean).join('\n\n');
  const hasShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const canShareFiles = hasShare
    ? (() => {
        try {
          // Some browsers (older canShare) throw or omit the API yet
          // still accept files — treat "unknown" as try-it.
          if (typeof navigator.canShare !== 'function') return true;
          return navigator.canShare({ files: [file] });
        } catch (_) {
          return false;
        }
      })()
    : false;

  if (canShareFiles) {
    try {
      // Files + text (link inside text). Some UAs drop a separate `url` when files are present.
      await navigator.share({ files: [file], title, text: shareText });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'preview';
      // e.g. NotSupportedError for files on this UA — fall through to link share.
    }
  }

  // Fallback: share clickable link+text, then offer PNG download.
  if (hasShare && (shareText || url)) {
    try {
      const payload = { title: title || 'Rosario Cards', text: shareText || text };
      if (url) payload.url = url;
      await navigator.share(payload);
    } catch (err) {
      if (err?.name === 'AbortError') return 'preview';
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      return 'downloaded';
    } catch (_) {
      /* fall through to preview */
    }
  }

  return 'preview';
}

export function makeShareFilename(prayerTitle) {
  const slug = `${prayerTitle || 'oracion'}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .toLowerCase();
  return `rosario-cards-${slug || 'libro'}.png`;
}

export function buildSharePrayerText({
  displayText,
  isLitany,
  litanyVerse,
}) {
  if (isLitany && litanyVerse) {
    return formatLitanyLine(litanyVerse);
  }
  return displayText || '';
}
