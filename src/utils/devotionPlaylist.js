/**
 * Liber devotion playlist (Cola) — order, repeats, play stats.
 * Length signal = sequence step count from listDevotionVoiceLadder.
 */

import { BOOKLET_MYSTERY_IDS } from './bookletSequence';
import { listDevotionVoiceLadder, devotionVoiceLabel } from './voiceCoverage';
import { imagePath } from '../data/imageRegistry';
import { angelusThumbnail, magnificatThumbnail } from '../data/marianDevotionsData';
import { faustinaThumb, novenaThumbnail } from '../data/divineMercyData';
import {
  SAGRADO_CORAZON_ADORACION_ID,
  sagradoCorazonAdoracionThumbnail,
} from '../data/sagradoCorazonAdoracionData';

/** Vitral thumbs for Cola rows — mirrors Libro shelf / mystery pills. */
const DEVOTION_THUMBS = {
  gozosos: '/gallery-images/misterios/modooscuro/misteriogozo0.webp',
  dolorosos: '/gallery-images/misterios/modooscuro/misteriodolor0.jpg',
  gloriosos: '/gallery-images/misterios/modooscuro/misteriogloria0.jpg',
  luminosos: '/gallery-images/misterios/modooscuro/misterioLUZ0.webp',
  divinamisericordia: faustinaThumb,
  divinamisericordia_novena: novenaThumbnail,
  angelus: angelusThumbnail,
  magnificat: magnificatThumbnail,
  sangrepreciosa_litany: imagePath('vitreauxCruz'),
  sangrepreciosa_chaplet: imagePath('crux'),
  sangrepreciosa_ofrendas: imagePath('lamb'),
  viacrucis: '/gallery-images/misterios/modooscuro/misteriodolor0.jpg',
  vialucis: '/gallery-images/misterios/modooscuro/misterioLUZ0.webp',
  [SAGRADO_CORAZON_ADORACION_ID]: sagradoCorazonAdoracionThumbnail,
};

/** @param {string} id */
export function devotionPlaylistThumbnail(id) {
  return DEVOTION_THUMBS[id] || null;
}

export const PLAYLIST_KEY = 'rosario_devotion_playlist';
export const PLAY_STATS_KEY = 'rosario_devotion_play_stats';

const MAX_REPEATS = 9;

/** @typedef {{ id: string, repeats: number }} PlaylistItem */

/**
 * Default queue: all booklet devotion ids, shortest → longest, repeats 1.
 * @returns {PlaylistItem[]}
 */
export function getDefaultPlaylist() {
  return listDevotionVoiceLadder().map(({ id }) => ({ id, repeats: 1 }));
}

/**
 * @param {unknown} raw
 * @returns {PlaylistItem[]}
 */
export function normalizePlaylist(raw) {
  if (!Array.isArray(raw)) return getDefaultPlaylist();
  const allowed = new Set(BOOKLET_MYSTERY_IDS);
  const out = [];
  const seen = new Set();
  for (const row of raw) {
    const id = row && typeof row.id === 'string' ? row.id : null;
    if (!id || !allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    const repeats = Math.min(MAX_REPEATS, Math.max(1, Number(row.repeats) || 1));
    out.push({ id, repeats });
  }
  return out;
}

export function loadPlaylist() {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY);
    if (raw == null) return getDefaultPlaylist();
    return normalizePlaylist(JSON.parse(raw));
  } catch {
    return getDefaultPlaylist();
  }
}

/** @param {PlaylistItem[]} items */
export function savePlaylist(items) {
  const next = normalizePlaylist(items);
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(next));
  return next;
}

/**
 * Expand playlist into a flat run of mystery ids (repeats applied).
 * @param {PlaylistItem[]} items
 * @returns {string[]}
 */
export function expandPlaylistRuns(items) {
  const runs = [];
  for (const row of normalizePlaylist(items)) {
    for (let i = 0; i < row.repeats; i += 1) runs.push(row.id);
  }
  return runs;
}

/** @returns {Record<string, { count: number, lastAt: number }>} */
export function loadPlayStats() {
  try {
    const raw = localStorage.getItem(PLAY_STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out = {};
    for (const [id, v] of Object.entries(parsed)) {
      if (!v || typeof v !== 'object') continue;
      out[id] = {
        count: Math.max(0, Number(v.count) || 0),
        lastAt: Number(v.lastAt) || 0,
      };
    }
    return out;
  } catch {
    return {};
  }
}

function savePlayStats(stats) {
  localStorage.setItem(PLAY_STATS_KEY, JSON.stringify(stats));
}

/** @param {string} id */
export function recordDevotionPlayed(id) {
  if (!id || typeof id !== 'string') return loadPlayStats();
  const stats = loadPlayStats();
  const prev = stats[id] || { count: 0, lastAt: 0 };
  stats[id] = { count: prev.count + 1, lastAt: Date.now() };
  savePlayStats(stats);
  return stats;
}

/** @param {number} lastAt */
export function formatLastPlayed(lastAt) {
  const t = Number(lastAt) || 0;
  if (!t) return 'nunca';
  const ago = Date.now() - t;
  const min = Math.floor(ago / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `hace ${hr} h`;
  const days = Math.floor(hr / 24);
  if (days < 14) return `hace ${days} d`;
  return `hace ${Math.floor(days / 7)} sem`;
}

/** @param {number} count @returns {'never'|'low'|'mid'|'high'} */
export function playHeat(count) {
  const n = Number(count) || 0;
  if (n <= 0) return 'never';
  if (n <= 2) return 'low';
  if (n <= 8) return 'mid';
  return 'high';
}

export function stepCountFor(id) {
  return listDevotionVoiceLadder().find((r) => r.id === id)?.total || 0;
}

export { devotionVoiceLabel, MAX_REPEATS };
