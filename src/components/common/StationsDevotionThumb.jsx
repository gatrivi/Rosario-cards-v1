import React, { useState, useRef, useEffect, useCallback } from 'react';
import MercyWindowThumb from './MercyWindowThumb';
import { placeThumbMenu } from '../../utils/placeThumbMenu';
import { devLog } from '../../utils/devotionsDebug';
import './FaustinaMercyThumb.css';

/** Distinct from Precious Blood litany (vitreauxCruz) — dolor mystery vitral. */
const STATIONS_THUMB = '/gallery-images/misterios/modooscuro/misteriodolor0.jpg';
const STATIONS_THUMB_LUCIS = '/gallery-images/misterios/modooscuro/misterioLUZ0.webp';

/** Vía Crucis / Vía Lucis — one thumb, small menu (like Faustina). */
export default function StationsDevotionThumb({
  misterioActual,
  onMysteryChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const isCrucis = misterioActual === 'viacrucis';
  const isCrucisRosario = misterioActual === 'viacrucis_rosario';
  const isLucis = misterioActual === 'vialucis';
  const active = isCrucis || isCrucisRosario || isLucis;
  const img = isLucis ? STATIONS_THUMB_LUCIS : STATIONS_THUMB;

  const relocate = useCallback(() => {
    setMenuStyle(placeThumbMenu(rootRef.current));
  }, []);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }
    relocate();
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    window.addEventListener('resize', relocate);
    window.addEventListener('scroll', relocate, true);
    return () => {
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('resize', relocate);
      window.removeEventListener('scroll', relocate, true);
    };
  }, [open, relocate]);

  const pick = (mode) => {
    devLog('stations-pick', { mode, from: misterioActual });
    onMysteryChange?.(mode);
    setOpen(false);
  };

  return (
    <div className="faustina-mercy-thumb" ref={rootRef}>
      <MercyWindowThumb
        active={active}
        disabled={disabled}
        img={img}
        title="Estaciones — Vía Crucis, Rosario y Vía Lucis"
        badge={isLucis ? '☀' : isCrucisRosario ? '📿' : '✝'}
        onClick={() => setOpen((o) => !o)}
      />
      {open && menuStyle && (
        <div className="faustina-mercy-menu" role="menu" style={menuStyle}>
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
            className={`faustina-mercy-menu__item${isCrucisRosario ? ' faustina-mercy-menu__item--active' : ''}`}
            onClick={() => pick('viacrucis_rosario')}
          >
            Vía Crucis · Rosario
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
