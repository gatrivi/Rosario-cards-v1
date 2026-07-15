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

export function truncateShareText(text, maxChars = 720) {
  const normalized = `${text || ''}`.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 1).trim()}…`;
}

export function resolveShareBackgroundUrl(rawUrl) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  if (typeof window !== 'undefined' && rawUrl.startsWith('/')) {
    return `${window.location.origin}${rawUrl}`;
  }
  return rawUrl;
}

export function buildShareCardPayload({
  misterioActual,
  prayerTitle,
  prayerText,
  backgroundUrl,
  progressLabel,
}) {
  const devotion = getBookletDevotionLabel(misterioActual);
  return {
    devotionTitle: devotion.title,
    devotionSubtitle: devotion.subtitle,
    prayerTitle: prayerTitle || '',
    prayerText: truncateShareText(prayerText),
    backgroundUrl: resolveShareBackgroundUrl(backgroundUrl),
    progressLabel: progressLabel || '',
    brandLine: 'Rosario Cards',
  };
}

export function getOutlineStepThumb(step, mysteryType, index) {
  if (step?.img) return step.img;
  if (step?.imgCandidates?.length) {
    return pickPrayerImage(step.imgCandidates, index);
  }
  return null;
}

export function preloadShareImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
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
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare?.({ files: [file] });

  if (canShareFiles) {
    try {
      // Files + text (link inside text). Some UAs drop a separate `url` when files are present.
      await navigator.share({ files: [file], title, text: shareText });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'preview';
    }
  }

  // Fallback: share clickable link+text, then offer PNG download.
  if (typeof navigator !== 'undefined' && navigator.share && (shareText || url)) {
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
