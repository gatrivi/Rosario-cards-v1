/**
 * Art config (image renames + verse assignments) — local timestamps + cloud merge.
 */

import { exportArtConfig, importArtConfig } from './artConfigPortable';

export const ART_CONFIG_CHANGED_EVENT = 'rosario-art-config-changed';
const UPDATED_AT_KEY = 'rosario_art_config_updated_at';

export function getLocalArtConfigUpdatedAt() {
  try {
    return parseInt(localStorage.getItem(UPDATED_AT_KEY) || '0', 10) || 0;
  } catch (_) {
    return 0;
  }
}

export function touchLocalArtConfig() {
  const at = Date.now();
  try {
    localStorage.setItem(UPDATED_AT_KEY, String(at));
  } catch (_) { /* ignore */ }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ART_CONFIG_CHANGED_EVENT));
  }
  return at;
}

/** Payload slice for jsonblob / Firebase. */
export function packArtConfigForCloud() {
  const packed = exportArtConfig();
  return {
    registryOverrides: packed.registryOverrides,
    verseAssignments: packed.verseAssignments,
    updatedAt: getLocalArtConfigUpdatedAt() || Date.now(),
  };
}

/**
 * Apply remote art config if newer than local (or force).
 * @returns {'applied'|'skipped'|'empty'}
 */
export function applyArtConfigFromCloud(artConfig, { force = false } = {}) {
  if (!artConfig || typeof artConfig !== 'object') return 'empty';
  const remoteAt = artConfig.updatedAt || 0;
  const localAt = getLocalArtConfigUpdatedAt();
  const hasData =
    Object.keys(artConfig.registryOverrides || {}).length > 0
    || Object.keys(artConfig.verseAssignments || {}).length > 0;
  if (!hasData) return 'empty';
  if (!force && remoteAt <= localAt && localAt > 0) return 'skipped';

  importArtConfig(
    {
      registryOverrides: artConfig.registryOverrides || {},
      verseAssignments: artConfig.verseAssignments || {},
    },
    { merge: true }
  );
  try {
    localStorage.setItem(UPDATED_AT_KEY, String(remoteAt || Date.now()));
  } catch (_) { /* ignore */ }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ART_CONFIG_CHANGED_EVENT));
  }
  return 'applied';
}
