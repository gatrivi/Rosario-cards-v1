import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { devLog } from '../../utils/devotionsDebug';
import './DevotionsShelf.css';

/** Captioned slot for a devotion thumb inside the shelf panel. */
export function ShelfItem({ label, children }) {
  return (
    <div
      className="devotions-shelf__item"
      onClick={(e) => {
        const btn = e.currentTarget.querySelector('button');
        if (btn && !btn.disabled && !btn.contains(e.target)) btn.click();
      }}
    >
      {children}
      <span className="devotions-shelf__item-label">{label}</span>
    </div>
  );
}

/**
 * Collapses the loose devotion thumbnails into one 44px pill.
 * Panel is portaled to document.body so AppShell chrome (z-index 100+)
 * cannot steal clicks from the open menu.
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
  const panelRef = useRef(null);
  const lastMysteryRef = useRef(misterioActual);
  const [panelStyle, setPanelStyle] = useState(null);

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

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPanelStyle(null);
      return undefined;
    }
    const place = () => {
      const rect = rootRef.current.getBoundingClientRect();
      setPanelStyle({
        position: 'fixed',
        left: Math.round(rect.left + rect.width / 2),
        bottom: Math.round(window.innerHeight - rect.top + 6),
        transform: 'translateX(-50%)',
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    // Deferred pointerdown: opening click must not instantly close;
    // portal panel is outside rootRef so check both refs.
    let remove = () => {};
    const id = requestAnimationFrame(() => {
      const close = (e) => {
        const t = e.target;
        if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
        setShelfOpen(false);
      };
      document.addEventListener('pointerdown', close);
      remove = () => document.removeEventListener('pointerdown', close);
    });
    return () => {
      cancelAnimationFrame(id);
      remove();
    };
  }, [open, setShelfOpen]);

  const rootClass = `devotions-shelf${variant === 'footer' ? ' devotions-shelf--footer' : ''}`;

  const panel = open && panelStyle && (
    <div
      ref={panelRef}
      className="devotions-shelf__panel devotions-shelf__panel--portal"
      role="menu"
      aria-label="Devociones y oraciones breves"
      style={panelStyle}
    >
      <p className="devotions-shelf__heading">Devociones</p>
      <div className="devotions-shelf__row">{recorridos}</div>
      <p className="devotions-shelf__heading">Oraciones breves</p>
      <div className="devotions-shelf__row">{breves}</div>
    </div>
  );

  return (
    <div className={rootClass} ref={rootRef}>
      {panel && createPortal(panel, document.body)}
      <button
        type="button"
        className={`devotions-shelf__toggle${active ? ' devotions-shelf__toggle--active' : ''}`}
        aria-expanded={open}
        aria-label="Devociones y oraciones breves"
        onClick={() => setShelfOpen(!open)}
      >
        <span aria-hidden="true">✦</span>
        {variant === 'footer' ? 'Devoc.' : 'Devociones'}
      </button>
    </div>
  );
}
