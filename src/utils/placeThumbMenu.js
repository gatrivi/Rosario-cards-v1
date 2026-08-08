/**
 * Fixed submenu coords so Devotions shelf overflow:auto does not crop Faustina/Vías menus.
 */
export function placeThumbMenu(anchorEl) {
  if (!anchorEl || typeof window === 'undefined') return null;
  const r = anchorEl.getBoundingClientRect();
  const openUp = r.top > 140;
  return {
    position: 'fixed',
    left: r.left + r.width / 2,
    top: openUp ? r.top - 6 : r.bottom + 6,
    transform: openUp ? 'translate(-50%, -100%)' : 'translateX(-50%)',
    zIndex: 13000,
  };
}
