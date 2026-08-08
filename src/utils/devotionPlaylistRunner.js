/**
 * Session runner for Cola → Liber AUTO handoff.
 * Queue + cursor live in sessionStorage (survives BookletView remount).
 */

import { expandPlaylistRuns, recordDevotionPlayed } from './devotionPlaylist';

export const RUN_KEY = 'rosario_devotion_playlist_run';

export const EVT_START = 'rosario-playlist-start';
export const EVT_SET_AUTO = 'rosario-playlist-set-auto';
export const EVT_DONE = 'rosario-playlist-devotion-done';
export const EVT_IDLE = 'rosario-playlist-idle';

/** @typedef {{ runs: string[], cursor: number }} PlaylistRun */

/** @returns {PlaylistRun|null} */
export function loadRun() {
  try {
    const raw = sessionStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.runs) || !parsed.runs.length) return null;
    const cursor = Math.max(0, Number(parsed.cursor) || 0);
    return { runs: parsed.runs.map(String), cursor };
  } catch {
    return null;
  }
}

/** @param {PlaylistRun|null} run */
export function saveRun(run) {
  if (!run || !run.runs?.length) {
    sessionStorage.removeItem(RUN_KEY);
    return;
  }
  sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
}

export function clearRun() {
  sessionStorage.removeItem(RUN_KEY);
}

export function isPlaylistActive() {
  const run = loadRun();
  return Boolean(run && run.cursor < run.runs.length);
}

function dispatchStart(mysteryId) {
  window.dispatchEvent(
    new CustomEvent(EVT_START, { detail: { mysteryId, auto: true } })
  );
}

/**
 * Expand items, store run, navigate to Liber, start first (or current) mystery.
 * @param {Array<{ id: string, repeats?: number }>} items
 * @param {(path: string) => void} navigate
 */
export function startPlaylist(items, navigate) {
  const runs = expandPlaylistRuns(items);
  if (!runs.length) {
    clearRun();
    window.dispatchEvent(new CustomEvent(EVT_IDLE, { detail: { reason: 'empty' } }));
    return;
  }
  saveRun({ runs, cursor: 0 });
  if (typeof navigate === 'function') navigate('/libro');
  // Allow Libro mount / mystery apply before AUTO request.
  queueMicrotask(() => dispatchStart(runs[0]));
}

/** Advance after Liber finishes one devotion (AUTO end). */
export function advanceAfterDevotionDone(mysteryId) {
  const run = loadRun();
  if (!run || run.cursor >= run.runs.length) {
    clearRun();
    window.dispatchEvent(new CustomEvent(EVT_IDLE, { detail: { reason: 'no-run' } }));
    return;
  }
  if (mysteryId) recordDevotionPlayed(mysteryId);
  const nextCursor = run.cursor + 1;
  if (nextCursor >= run.runs.length) {
    clearRun();
    window.dispatchEvent(new CustomEvent(EVT_IDLE, { detail: { reason: 'complete' } }));
    return;
  }
  saveRun({ runs: run.runs, cursor: nextCursor });
  dispatchStart(run.runs[nextCursor]);
}

/** Stop playlist without finishing remaining items. */
export function stopPlaylist() {
  clearRun();
  window.dispatchEvent(new CustomEvent(EVT_IDLE, { detail: { reason: 'stopped' } }));
}

let listening = false;

/** Idempotent global listeners (AppShell mount). */
export function ensurePlaylistRunnerListening() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener(EVT_DONE, (e) => {
    advanceAfterDevotionDone(e?.detail?.mysteryId);
  });
}
