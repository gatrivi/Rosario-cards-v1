/**
 * Rejected image ids — the owner's "this picture is wrong" list.
 *
 * The shipped catalog (`imageLibraryCatalog.json`) is classified from filenames,
 * so some tags are guesses. Rather than editing hundreds of files by hand, the
 * owner rejects the bad ones once in `/assets` and they drop out of every
 * candidate chain — permanently, across all prayers and all devices via
 * `artConfigSync`.
 *
 * Distinct from `imageAssignments` (which pins art TO a prayer) and from
 * `saveOverride` (which re-tags it) — this removes art FROM selection entirely.
 * Same localStorage + cloud-sync conventions.
 */
import { touchLocalArtConfig } from './artConfigSync';

const STORAGE_KEY = 'rosario_rejected_images';

/** @returns {string[]} rejected pool image ids */
export function loadRejectedImages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch (_) {
    return [];
  }
}

function persist(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
    touchLocalArtConfig();
  } catch (_) { /* quota */ }
}

export function isImageRejected(id) {
  return loadRejectedImages().includes(id);
}

export function rejectImage(id) {
  if (!id) return;
  const ids = loadRejectedImages();
  if (ids.includes(id)) return;
  persist([...ids, id]);
}

export function unrejectImage(id) {
  persist(loadRejectedImages().filter((x) => x !== id));
}

export function clearRejectedImages() {
  persist([]);
}

/** Payload slice for jsonblob / Firebase. */
export function packRejectedImages() {
  return { rejectedImages: loadRejectedImages() };
}

export function applyPackedRejectedImages(packed) {
  const list = packed?.rejectedImages;
  if (!Array.isArray(list)) return;
  persist(list);
}
