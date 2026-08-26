const DEFAULT_VERSION = '0.3.82';

function isRosaPath(win) {
  return Boolean(win?.location?.pathname === '/rosa');
}

/**
 * Enforce one interaction contract for Rosa on mouse, pen and touch:
 * pointer movement only reaches React while that pointer is pressed.
 *
 * RoseView already handles pointer movement and touch capture. This guard
 * removes the desktop-only hover path and captures every pointer type so a
 * drag remains continuous if it briefly leaves the text.
 */
export function installRosaPointerContract(doc = document, win = window) {
  if (!doc?.addEventListener) return () => {};

  const activePointers = new Set();

  const handlePointerDown = (event) => {
    if (!isRosaPath(win)) return;
    activePointers.add(event.pointerId);

    const target = event.target;
    if (target?.setPointerCapture) {
      try {
        target.setPointerCapture(event.pointerId);
      } catch (_) {
        // Pointer capture is not implemented by every browser/test DOM.
      }
    }
  };

  const handlePointerMove = (event) => {
    if (!isRosaPath(win)) return;
    if (!activePointers.has(event.pointerId)) {
      event.stopPropagation();
    }
  };

  const clearPointer = (event) => {
    activePointers.delete(event.pointerId);
  };

  doc.addEventListener('pointerdown', handlePointerDown, true);
  doc.addEventListener('pointermove', handlePointerMove, true);
  doc.addEventListener('pointerup', clearPointer, true);
  doc.addEventListener('pointercancel', clearPointer, true);

  return () => {
    doc.removeEventListener('pointerdown', handlePointerDown, true);
    doc.removeEventListener('pointermove', handlePointerMove, true);
    doc.removeEventListener('pointerup', clearPointer, true);
    doc.removeEventListener('pointercancel', clearPointer, true);
    activePointers.clear();
  };
}

/**
 * Temporary compatibility bridge while older AppShell code still owns its own
 * version constant. Keeps the visible badge truthful to the bundle/SW version.
 */
export function reconcileVisibleAppVersion(version = DEFAULT_VERSION, doc = document) {
  if (!doc?.documentElement) return () => {};

  const apply = () => {
    doc.documentElement.dataset.appVersion = version;
    doc.querySelectorAll('.app-version-badge').forEach((badge) => {
      const label = `v${version}`;
      if (badge.textContent !== label) badge.textContent = label;
      const aria = `Versión ${version}. Ver novedades`;
      if (badge.getAttribute('aria-label') !== aria) badge.setAttribute('aria-label', aria);
    });
  };

  apply();

  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(apply);
  observer.observe(doc.documentElement, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export { DEFAULT_VERSION as ROSARIO_RUNTIME_VERSION };
