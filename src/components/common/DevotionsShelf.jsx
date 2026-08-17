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
 * Devotion picker. In Libro, the external bottom-nav toggle opens a full-screen
 * gallery so devotional artwork remains the primary UI instead of tiny thumbs.
 * The panel is portaled to document.body so AppShell chrome cannot steal clicks.
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
      // Controlled: always derive from latest prop via functional updater on parent.
      if (controlled) {
        if (typeof next === 'function') {
          onOpenChange?.((prev) => next(prev));
        } else {
          onOpenChange?.(next);
        }
        return;
      }
      setOpenInternal((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        onOpenChange?.(value);
        return value;
      });
    },
    [controlled, onOpenChange]
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
        setPanelStyle({
          position: 'fixed',
          inset: 0,
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
      // Use click (not pointerdown) so thumb onClick can run before outside-close.
      const close = (e) => {
        const t = e.target;
        if (t?.closest?.('[data-devotions-toggle]')) return;
        if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
        setShelfOpen(false);
      };
      document.addEventListener('click', close);
      remove = () => document.removeEventListener('click', close);
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
      className={`devotions-shelf__panel devotions-shelf__panel--portal${
        externalToggle ? ' devotions-shelf__panel--fullscreen' : ''
      }`}
      role={externalToggle ? 'dialog' : 'menu'}
      aria-modal={externalToggle ? 'true' : undefined}
      aria-label="Devociones y oraciones breves"
      style={panelStyle}
    >
      {externalToggle ? (
        <div className="devotions-shelf__topbar">
          <div className="devotions-shelf__topbar-copy">
            <strong>Devociones</strong>
            <span>Elegí una imagen para comenzar</span>
          </div>
          <div className="devotions-shelf__topbar-actions">
            {onReturnToRosary ? (
              <button
                type="button"
                className="devotions-shelf__return devotions-shelf__return--top"
                onClick={() => {
                  setShelfOpen(false);
                  onReturnToRosary();
                }}
              >
                Volver al Rosario
              </button>
            ) : null}
            <button
              type="button"
              className="devotions-shelf__close"
              onClick={() => setShelfOpen(false)}
              aria-label="Cerrar devociones"
              title="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <p className="devotions-shelf__heading">{externalToggle ? 'Recorridos' : 'Devociones'}</p>
      <div className="devotions-shelf__row">{recorridos}</div>
      <p className="devotions-shelf__heading">Oraciones breves</p>
      <div className="devotions-shelf__row">{breves}</div>
      {proximas ? (
        <>
          <p className="devotions-shelf__heading">Próximas</p>
          <div className="devotions-shelf__row">{proximas}</div>
        </>
      ) : null}
      {onReturnToRosary && !externalToggle ? (
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
