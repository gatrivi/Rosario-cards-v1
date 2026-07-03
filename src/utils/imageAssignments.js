import { imagePath } from '../data/imageRegistry';
import { touchLocalArtConfig } from './artConfigSync';

const STORAGE_KEY = 'rosario_image_assignments';

/** @returns {Record<string, string>} keys like "LL:12" → registry id or URL */
export function loadAssignments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

export function assignmentKey(prayerId, verseIndex) {
  return `${prayerId}:${verseIndex}`;
}

export function saveAssignment(prayerId, verseIndex, value) {
  const all = loadAssignments();
  const key = assignmentKey(prayerId, verseIndex);
  if (!value) delete all[key];
  else all[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    touchLocalArtConfig();
  } catch (_) { /* quota */ }
}

export function clearAssignment(prayerId, verseIndex) {
  saveAssignment(prayerId, verseIndex, null);
}

/** Resolve stored value (registry id or raw path) to a usable img src. */
export function resolveAssignmentValue(value) {
  if (!value) return null;
  if (value.startsWith('/') || value.startsWith('http')) return value;
  return imagePath(value) || null;
}

export function getAssignedPath(prayerId, verseIndex) {
  const raw = loadAssignments()[assignmentKey(prayerId, verseIndex)];
  return resolveAssignmentValue(raw);
}

export function getAssignedRegistryId(prayerId, verseIndex) {
  const raw = loadAssignments()[assignmentKey(prayerId, verseIndex)];
  if (!raw || raw.startsWith('/') || raw.startsWith('http')) return null;
  return raw;
}
