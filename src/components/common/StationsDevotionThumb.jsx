import React, { useState, useRef, useEffect } from 'react';
import MercyWindowThumb from './MercyWindowThumb';
import { imagePath as registryImage } from '../../data/imageRegistry';
import './FaustinaMercyThumb.css';

/** Vía Crucis / Vía Lucis — one thumb, small menu (like Faustina). */
export default function StationsDevotionThumb({
  misterioActual,
  onMysteryChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isCrucis = misterioActual === 'viacrucis';
  const isLucis = misterioActual === 'vialucis';
  const active = isCrucis || isLucis;
  const img = registryImage('vitreauxCruz') || registryImage('crux');

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const pick = (mode) => {
    onMysteryChange?.(mode);
    setOpen(false);
  };

  return (
    <div className="faustina-mercy-thumb" ref={rootRef}>
      <MercyWindowThumb
        active={active}
        disabled={disabled}
        img={img}
        title="Estaciones — Vía Crucis y Vía Lucis"
        badge={isLucis ? '☀' : '✝'}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="faustina-mercy-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className={`faustina-mercy-menu__item${isCrucis ? ' faustina-mercy-menu__item--active' : ''}`}
            onClick={() => pick('viacrucis')}
          >
            Vía Crucis
          </button>
          <button
            type="button"
            role="menuitem"
            className={`faustina-mercy-menu__item${isLucis ? ' faustina-mercy-menu__item--active' : ''}`}
            onClick={() => pick('vialucis')}
          >
            Vía Lucis
          </button>
        </div>
      )}
    </div>
  );
}
