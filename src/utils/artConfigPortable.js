/**
 * Portable export/import for image renames, tags, and verse→image assignments.
 * Stored only in localStorage on device — use export to bring edits back to dev.
 */

const REGISTRY_OVERRIDES_KEY = 'rosario_image_registry_overrides';
const ASSIGNMENTS_KEY = 'rosario_image_assignments';
const EXPORT_VERSION = 1;

export function exportArtConfig() {
  let registryOverrides = {};
  let verseAssignments = {};
  try {
    registryOverrides = JSON.parse(localStorage.getItem(REGISTRY_OVERRIDES_KEY) || '{}');
  } catch (_) { /* ignore */ }
  try {
    verseAssignments = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || '{}');
  } catch (_) { /* ignore */ }
  return {
    v: EXPORT_VERSION,
    app: 'rosario-cards',
    exportedAt: new Date().toISOString(),
    registryOverrides,
    verseAssignments,
  };
}

export function importArtConfig(payload, { merge = true } = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('JSON inválido');
  }
  const registry = payload.registryOverrides || {};
  const assignments = payload.verseAssignments || {};

  if (merge) {
    let prevRegistry = {};
    let prevAssignments = {};
    try {
      prevRegistry = JSON.parse(localStorage.getItem(REGISTRY_OVERRIDES_KEY) || '{}');
    } catch (_) { /* ignore */ }
    try {
      prevAssignments = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || '{}');
    } catch (_) { /* ignore */ }
    localStorage.setItem(
      REGISTRY_OVERRIDES_KEY,
      JSON.stringify({ ...prevRegistry, ...registry })
    );
    localStorage.setItem(
      ASSIGNMENTS_KEY,
      JSON.stringify({ ...prevAssignments, ...assignments })
    );
  } else {
    localStorage.setItem(REGISTRY_OVERRIDES_KEY, JSON.stringify(registry));
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  }

  return {
    registryCount: Object.keys(registry).length,
    assignmentCount: Object.keys(assignments).length,
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
