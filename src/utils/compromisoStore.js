/**
 * Local “compromiso” for Rezá por Argentina.
 * Un Rosario = cinco décenas (one classic mystery set), not one section.
 */

import { isClosingPrayersUnlocked } from './rosarySequenceUtils';

export const COMPROMISO_STORAGE_KEY = 'rosario_compromiso_argentina_v1';
export const COMPROMISO_CAMPAIGN_ID = 'argentina-final-2026';
export const COMPROMISO_HEADLINE = 'Rezá por Argentina';
export const COMPROMISO_BODY =
  'Me comprometo a un Rosario completo: cinco misterios (décenas).';

/** Banner / deep-link until after the Mundial window. */
export const COMPROMISO_EXPIRES_AT = '2026-08-01T00:00:00-03:00';

const CLASSIC_MYSTERIES = new Set(['gozosos', 'dolorosos', 'gloriosos', 'luminosos']);

function isClassicMystery(id) {
  return CLASSIC_MYSTERIES.has(id);
}

export function isCompromisoCampaignActive(now = new Date()) {
  return now.getTime() < new Date(COMPROMISO_EXPIRES_AT).getTime();
}

export function getCompromisoAppUrl() {
  if (typeof window === 'undefined') return 'https://rosario.gatrivi.com/?compromiso=1';
  const url = new URL(window.location.href);
  url.searchParams.set('compromiso', '1');
  url.searchParams.delete('sync');
  url.searchParams.delete('paso');
  return url.toString();
}

export function getCompromisoShareText({ fulfilled = false } = {}) {
  if (fulfilled) {
    return 'Ya recé un Rosario completo por Argentina.';
  }
  return `${COMPROMISO_HEADLINE}\n${COMPROMISO_BODY}`;
}

function readRaw() {
  try {
    const raw = localStorage.getItem(COMPROMISO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRaw(data) {
  try {
    localStorage.setItem(COMPROMISO_STORAGE_KEY, JSON.stringify(data));
  } catch (_) {
    /* ignore quota */
  }
  return data;
}

export function loadCompromiso() {
  return readRaw();
}

export function hasActiveCompromiso() {
  const c = loadCompromiso();
  return Boolean(c && c.status === 'active' && c.campaignId === COMPROMISO_CAMPAIGN_ID);
}

export function hasFulfilledCompromiso() {
  const c = loadCompromiso();
  return Boolean(c && c.status === 'fulfilled' && c.campaignId === COMPROMISO_CAMPAIGN_ID);
}

/**
 * Start (or restart) a commitment for today's classic mystery.
 */
export function saveCompromiso({ mysteryId }) {
  const data = {
    campaignId: COMPROMISO_CAMPAIGN_ID,
    headline: COMPROMISO_HEADLINE,
    mysteryId,
    status: 'active',
    createdAt: new Date().toISOString(),
    fulfilledAt: null,
    maxDecadeReached: 0,
  };
  return writeRaw(data);
}

export function markCompromisoFulfilled(mysteryId) {
  const prev = loadCompromiso();
  if (!prev || prev.status !== 'active') return prev;
  return writeRaw({
    ...prev,
    status: 'fulfilled',
    fulfilledAt: new Date().toISOString(),
    fulfilledMysteryId: mysteryId || prev.mysteryId,
  });
}

/** Track highest mystery decade seen while praying (1–5). */
export function noteCompromisoDecade(decade) {
  const prev = loadCompromiso();
  if (!prev || prev.status !== 'active') return prev;
  if (!decade || decade < 1) return prev;
  const maxDecadeReached = Math.max(prev.maxDecadeReached || 0, decade);
  if (maxDecadeReached === prev.maxDecadeReached) return prev;
  return writeRaw({ ...prev, maxDecadeReached });
}

/**
 * Full Rosario = visited all 5 décenas AND reached closing unlock.
 * One section / decade alone must not fulfill.
 */
export function isFullRosarioComplete(sequence, prayerIndex, mysteryId, maxDecadeReached = 0) {
  if (!isClassicMystery(mysteryId)) return false;
  if (!sequence?.length || prayerIndex == null || prayerIndex < 0) return false;
  if (maxDecadeReached < 5) return false;
  return isClosingPrayersUnlocked(sequence, prayerIndex);
}

/**
 * Note decade progress; if full rosary reached, mark fulfilled.
 * @returns {object|null} updated compromiso when newly fulfilled
 */
export function tryFulfillCompromiso(sequence, prayerIndex, mysteryId, mysteryDecade = null) {
  if (!hasActiveCompromiso()) return null;
  if (mysteryDecade) noteCompromisoDecade(mysteryDecade);
  const current = loadCompromiso();
  if (!isFullRosarioComplete(sequence, prayerIndex, mysteryId, current?.maxDecadeReached || 0)) {
    return null;
  }
  return markCompromisoFulfilled(mysteryId);
}
