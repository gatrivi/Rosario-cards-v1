/**
 * Portable export/import for image renames, tags, and verse→image assignments.
 * Stored only in localStorage on device — use export to bring edits back to dev.
 */

const REGISTRY_OVERRIDES_KEY = 'rosario_image_registry_overrides';
const ASSIGNMENTS_KEY = 'rosario_image_assignments';
const REJECTED_KEY = 'rosario_rejected_images';
const EXPORT_VERSION = 2;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || '') ?? fallback;
  } catch (_) {
    return fallback;
  }
}

export function exportArtConfig() {
  return {
    v: EXPORT_VERSION,
    app: 'rosario-cards',
    exportedAt: new Date().toISOString(),
    registryOverrides: readJson(REGISTRY_OVERRIDES_KEY, {}),
    verseAssignments: readJson(ASSIGNMENTS_KEY, {}),
    // Pool images the owner rejected in /assets — removing art, not pinning it.
    rejectedImages: readJson(REJECTED_KEY, []),
  };
}

export function importArtConfig(payload, { merge = true } = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('JSON inválido');
  }
  const registry = payload.registryOverrides || {};
  const assignments = payload.verseAssignments || {};
  const incomingRejected = Array.isArray(payload.rejectedImages) ? payload.rejectedImages : [];
  const rejected = new Set(merge ? readJson(REJECTED_KEY, []) : []);
  incomingRejected.forEach((id) => rejected.add(id));

  if (merge) {
    localStorage.setItem(
      REGISTRY_OVERRIDES_KEY,
      JSON.stringify({ ...readJson(REGISTRY_OVERRIDES_KEY, {}), ...registry })
    );
    localStorage.setItem(
      ASSIGNMENTS_KEY,
      JSON.stringify({ ...readJson(ASSIGNMENTS_KEY, {}), ...assignments })
    );
  } else {
    localStorage.setItem(REGISTRY_OVERRIDES_KEY, JSON.stringify(registry));
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  }
  localStorage.setItem(REJECTED_KEY, JSON.stringify([...rejected]));

  return {
    registryCount: Object.keys(registry).length,
    assignmentCount: Object.keys(assignments).length,
    rejectedCount: rejected.size,
  };
}

export function downloadArtConfigJson() {
  const blob = new Blob([JSON.stringify(exportArtConfig(), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rosario-art-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
