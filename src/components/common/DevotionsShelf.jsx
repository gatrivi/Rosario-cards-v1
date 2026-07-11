import React, { useCallback, useEffect, useRef, useState } from 'react';
import { devLog } from '../../utils/devotionsDebug';
import './DevotionsShelf.css';

/** Captioned slot for a devotion thumb inside the shelf panel. */
export function ShelfItem({ label, children }) {
  return (
    <div className="devotions-shelf__item">
      {children}
      <span className="devotions-shelf__item-label">{label}</span>
    </div>
  );
}

/**
 * Collapses the loose devotion thumbnails into one 44px pill.
 * Tapping opens a dark-glass panel with two labeled rows:
 * long/multi-step devotions ("Devociones") and one-off prayers
 * ("Oraciones breves"). Thumbs themselves are passed in unchanged.
 */
export default function DevotionsShelf({
  misterioActual,
  active = false,
  recorridos,
  breves,
  variant = 'pill',
  open: openProp,
  onOpenChange,
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openInternal;

  const setShelfOpen = useCallback(
    (next) => {
      devLog('shelf-toggle', { open: next, misterio: misterioActual });
      if (!controlled) setOpenInternal(next);
      onOpenChange?.(next);
    },
    [controlled, misterioActual, onOpenChange]
  );
  const rootRef = useRef(null);
  const lastMysteryRef = useRef(misterioActual);

  // Close when a devotion is actually picked (mystery changed).
  useEffect(() => {
    if (lastMysteryRef.current !== misterioActual) {
      devLog('shelf-close-mystery-change', {
        from: lastMysteryRef.current,
        to: misterioActual,
      });
      lastMysteryRef.current = misterioActual;
      setShelfOpen(false);
    }
  }, [misterioActual, setShelfOpen]);

  useEffect(() => {
    if (!open) return undefined;
    // pointerup (not down): avoids racing the toggle's own touchstart on mobile
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setShelfOpen(false);
    };
    document.addEventListener('pointerup', close);
    return () => document.removeEventListener('pointerup', close);
  }, [open, setShelfOpen]);

  const rootClass = `devotions-shelf${variant === 'footer' ? ' devotions-shelf--footer' : ''}`;

  return (
    <div className={rootClass} ref={rootRef}>
      {open && (
        <div
          className="devotions-shelf__panel"
          role="menu"
          aria-label="Devociones y oraciones breves"
        >
          <p className="devotions-shelf__heading">Devociones</p>
          <div className="devotions-shelf__row">{recorridos}</div>
          <p className="devotions-shelf__heading">Oraciones breves</p>
          <div className="devotions-shelf__row">{breves}</div>
        </div>
      )}
      <button
        type="button"
        className={`devotions-shelf__toggle${active ? ' devotions-shelf__toggle--active' : ''}`}
        aria-expanded={open}
        aria-label="Devociones y oraciones breves"
        onPointerUp={(e) => e.stopPropagation()}
        onClick={() => setShelfOpen(!open)}
      >
        <span aria-hidden="true">✦</span>
        {variant === 'footer' ? 'Devoc.' : 'Devociones'}
      </button>
    </div>
  );
}
