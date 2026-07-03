/**
 * Runtime image library (uploads + optional public paths).
 * Merged into imageRegistry.listImages() for classification and assignment.
 */

import { touchLocalArtConfig } from './artConfigSync';

const LIBRARY_KEY = 'rosario_image_library';
export const IMAGE_LIBRARY_CHANGED_EVENT = 'rosario-image-library-changed';

export function loadImageLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function persist(library) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch (_) { /* quota */ }
  touchLocalArtConfig();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(IMAGE_LIBRARY_CHANGED_EVENT));
  }
}

export function upsertLibraryEntry(entry) {
  if (!entry?.id || !entry?.path) return null;
  const library = loadImageLibrary();
  library[entry.id] = {
    ...library[entry.id],
    ...entry,
    source: entry.source || 'upload',
    tags: entry.tags || library[entry.id]?.tags || [],
    name: entry.name || library[entry.id]?.name || entry.id,
  };
  persist(library);
  return library[entry.id];
}

export function updateLibraryEntry(id, patch) {
  const library = loadImageLibrary();
  if (!library[id]) return null;
  library[id] = { ...library[id], ...patch, id };
  persist(library);
  return library[id];
}

export function removeLibraryEntry(id) {
  const library = loadImageLibrary();
  delete library[id];
  persist(library);
}

/** Merge remote map of entries into local (remote wins per id). */
export function mergeLibraryFromRemote(remoteMap = {}) {
  const library = loadImageLibrary();
  let changed = false;
  Object.entries(remoteMap).forEach(([id, entry]) => {
    if (!entry?.path) return;
    library[id] = {
      ...(library[id] || {}),
      ...entry,
      id,
      source: entry.source || 'upload',
    };
    changed = true;
  });
  if (changed) persist(library);
  return library;
}

export function libraryAsMap() {
  return loadImageLibrary();
}
