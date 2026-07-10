import React, { useState, useRef, useEffect } from 'react';
import MercyWindowThumb from './MercyWindowThumb';
import { faustinaThumb, DIVINE_MERCY_ID, DIVINE_MERCY_NOVENA_ID } from '../../data/divineMercyData';
import { devLog } from '../../utils/devotionsDebug';
import './FaustinaMercyThumb.css';

/**
 * Single Faustina stained-glass thumb — opens a picker for Corona vs Novena.
 */
export default function FaustinaMercyThumb({
  misterioActual,
  onMysteryChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isCorona = misterioActual === DIVINE_MERCY_ID;
  const isNovena = misterioActual === DIVINE_MERCY_NOVENA_ID;
  const active = isCorona || isNovena;

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const pick = (mode) => {
    devLog('faustina-pick', { mode, from: misterioActual });
    onMysteryChange?.(mode);
    setOpen(false);
  };

  return (
    <div className="faustina-mercy-thumb" ref={rootRef}>
      <MercyWindowThumb
        active={active}
        disabled={disabled}
        img={faustinaThumb}
        title="Divina Misericordia — Santa Faustina"
        badge={isNovena ? '9' : null}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="faustina-mercy-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className={`faustina-mercy-menu__item${isCorona ? ' faustina-mercy-menu__item--active' : ''}`}
            onClick={() => pick(DIVINE_MERCY_ID)}
          >
            Corona
          </button>
          <button
            type="button"
            role="menuitem"
            className={`faustina-mercy-menu__item${isNovena ? ' faustina-mercy-menu__item--active' : ''}`}
            onClick={() => pick(DIVINE_MERCY_NOVENA_ID)}
          >
            Novena <span className="faustina-mercy-menu__badge">9</span>
          </button>
        </div>
      )}
    </div>
  );
}
