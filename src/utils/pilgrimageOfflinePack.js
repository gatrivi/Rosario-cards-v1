import { buildSequence } from './bookletSequence';
import { getDefaultMystery } from '../components/utils/getDefaultMystery';
import { getVoicePrefs } from './voicePrefs';
import { resolveBundledVoiceUrl } from '../data/bundledVoiceMap';
import {
  getLitanyVerseImageCandidates,
} from './prayerImages';
import {
  getPrayerVerseCount,
  getPrayerVerseImageCandidates,
} from './prayerVerseImages';

export const PILGRIMAGE_OFFLINE_CACHE = 'rosario-pilgrimage-pack-v1';
export const PILGRIMAGE_OFFLINE_STATUS_KEY = 'rosario_pilgrimage_offline_pack_v1';

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.jpg',
  '/logo.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

function normalizeSameOriginUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return null;

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rosario.gatrivi.com';
    const parsed = new URL(raw, origin);
    if (parsed.origin !== origin) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch (_) {
    return null;
  }
}

function addUrl(set, raw) {
  const normalized = normalizeSameOriginUrl(raw);
  if (normalized) set.add(normalized);
}

function addRuntimeShellAssets(set) {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach((node) => {
    addUrl(set, node.src || node.href);
  });

  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    performance.getEntriesByType('resource').forEach((entry) => {
      const url = normalizeSameOriginUrl(entry?.name);
      if (!url) return;
      if (
        url.includes('/static/js/') ||
        url.includes('/static/css/') ||
        url.includes('/static/media/')
      ) {
        set.add(url);
      }
    });
  }
}

export function collectPilgrimageOfflineUrls({
  mystery = 'gozosos',
  voiceLang = 'es',
  includeRuntimeAssets = true,
} = {}) {
  const urls = new Set(SHELL_URLS);
  let sequence = [];

  try {
    sequence = buildSequence(mystery) || [];
  } catch (_) {
    sequence = [];
  }

  sequence.forEach((step) => {
    addUrl(urls, step?.img);
    (step?.imgCandidates || []).forEach((url) => addUrl(urls, url));

    if (Array.isArray(step?.verses)) {
      step.verses.forEach((verse, index) => {
        getLitanyVerseImageCandidates(verse, step, index).forEach((url) => addUrl(urls, url));
      });
    }

    const verseCount = getPrayerVerseCount(step?.id);
    for (let verseIndex = 0; verseIndex < verseCount; verseIndex += 1) {
      getPrayerVerseImageCandidates(step.id, verseIndex, step, mystery)
        .forEach((url) => addUrl(urls, url));
    }

    addUrl(urls, resolveBundledVoiceUrl(step?.id, voiceLang));
  });

  if (includeRuntimeAssets) addRuntimeShellAssets(urls);
  return Array.from(urls);
}

function writeStatus(status) {
  try {
    localStorage.setItem(PILGRIMAGE_OFFLINE_STATUS_KEY, JSON.stringify(status));
  } catch (_) {
    /* localStorage unavailable */
  }
}

export function getPilgrimageOfflineStatus() {
  try {
    const raw = localStorage.getItem(PILGRIMAGE_OFFLINE_STATUS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}

async function cacheOne(cache, url) {
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (!response?.ok) throw new Error(`HTTP ${response?.status || 0}`);
    await cache.put(url, response.clone());
    return true;
  } catch (_) {
    try {
      const existing = await caches.match(url);
      if (!existing) return false;
      await cache.put(url, existing.clone());
      return true;
    } catch (_) {
      return false;
    }
  }
}

export async function preparePilgrimageOfflinePack({
  mystery = getDefaultMystery(),
  voiceLang = getVoicePrefs().voiceLang || 'es',
  onProgress,
} = {}) {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('Este navegador no ofrece almacenamiento offline.');
  }

  const urls = collectPilgrimageOfflineUrls({ mystery, voiceLang, includeRuntimeAssets: true });
  const cache = await caches.open(PILGRIMAGE_OFFLINE_CACHE);
  const failures = [];
  let completed = 0;

  for (const url of urls) {
    const ok = await cacheOne(cache, url);
    if (!ok) failures.push(url);
    completed += 1;
    onProgress?.({ completed, total: urls.length, url, ok });
  }

  try {
    await navigator.storage?.persist?.();
  } catch (_) {
    /* best effort: persistence support varies by browser */
  }

  const status = {
    state: failures.length === 0 ? 'ready' : 'partial',
    mystery,
    voiceLang,
    completed: urls.length - failures.length,
    total: urls.length,
    failures: failures.length,
    preparedAt: new Date().toISOString(),
  };
  writeStatus(status);
  return status;
}
