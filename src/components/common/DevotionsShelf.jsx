import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { devLog } from '../../utils/devotionsDebug';
import './DevotionsShelf.css';

/** Captioned slot for a devotion thumb inside the shelf panel. */
export function ShelfItem({ label, children, soon = false }) {
  return (
    <div
      className={`devotions-shelf__item${soon ? ' devotions-shelf__item--soon' : ''}`}
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
 * Collapses devotion thumbnails into one control + tooltip panel.
 * Panel is portaled to document.body so AppShell chrome cannot steal clicks.
 *
 * `externalToggle`: Libro bottom-nav owns the ✦ button; this host only
 * renders the floating tooltip and listens for `rosario-devotions-toggle`.
 */
export default function DevotionsShelf({
  misterioActual,
  active = false,
  recorridos,
  breves,
  proximas,
  variant = 'pill',
  open: openProp,
  onOpenChange,
  externalToggle = false,
  onReturnToRosary,
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openInternal;

  const setShelfOpen = useCallback(
    (next) => {
      const apply = (current) => {
        const value = typeof next === 'function' ? next(current) : next;
        devLog('shelf-toggle', { open: value, misterio: misterioActual });
        onOpenChange?.(value);
        return value;
      };
      if (!controlled) {
        setOpenInternal((prev) => apply(prev));
        return;
      }
      apply(open);
    },
    [controlled, misterioActual, onOpenChange, open]
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

  useEffect(() => {
    if (!externalToggle) return undefined;
    const onToggle = () => {
      setShelfOpen((wasOpen) => !wasOpen);
    };
    window.addEventListener('rosario-devotions-toggle', onToggle);
    return () => window.removeEventListener('rosario-devotions-toggle', onToggle);
  }, [externalToggle, setShelfOpen]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('rosario-devotions-state', {
        detail: { open, active },
      })
    );
  }, [open, active]);

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return undefined;
    }

    const place = () => {
      if (externalToggle) {
        // Smart tooltip above bottom nav (Libro).
        setPanelStyle({
          position: 'fixed',
          left: '50%',
          bottom: 'calc(var(--app-above-nav, 70px) + 10px)',
          transform: 'translateX(-50%)',
        });
        return;
      }
      if (!rootRef.current) {
        setPanelStyle(null);
        return;
      }
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
  }, [open, externalToggle]);

  useEffect(() => {
    if (!open) return undefined;
    let remove = () => {};
    const id = requestAnimationFrame(() => {
      const close = (e) => {
        const t = e.target;
        if (t?.closest?.('[data-devotions-toggle]')) return;
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

  const rootClass = `devotions-shelf${variant === 'footer' ? ' devotions-shelf--footer' : ''}${
    externalToggle ? ' devotions-shelf--nav-host' : ''
  }`;

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
      {proximas ? (
        <>
          <p className="devotions-shelf__heading">Próximas</p>
          <div className="devotions-shelf__row">{proximas}</div>
        </>
      ) : null}
      {onReturnToRosary ? (
        <button
          type="button"
          className="devotions-shelf__return"
          onClick={() => {
            setShelfOpen(false);
            onReturnToRosary();
          }}
        >
          Volver al Rosario
        </button>
      ) : null}
    </div>
  );

  return (
    <div className={rootClass} ref={rootRef}>
      {panel && createPortal(panel, document.body)}
      {!externalToggle && (
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
      )}
    </div>
  );
}
