import React, { useEffect, useRef, useState } from 'react';
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
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const lastMysteryRef = useRef(misterioActual);

  // Close when a devotion is actually picked (mystery changed).
  useEffect(() => {
    if (lastMysteryRef.current !== misterioActual) {
      lastMysteryRef.current = misterioActual;
      setOpen(false);
    }
  }, [misterioActual]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div className="devotions-shelf" ref={rootRef}>
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
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">✦</span> Devociones
      </button>
    </div>
  );
}
