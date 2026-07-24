import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { devLog } from '../../utils/devotionsDebug';
import GuideAudioMark from './GuideAudioMark';
import './DevotionsShelf.css';

/** @deprecated Prefer descriptor cards via `journeys` / `briefs`. Kept for older tests. */
export function ShelfItem({ label, children, soon = false, hasAudio = false }) {
  return (
    <div
      className={`devotions-shelf__item${soon ? ' devotions-shelf__item--soon' : ''}${
        hasAudio ? ' devotions-shelf__item--audio' : ''
      }`}
    >
      <div className="guide-audio-mark__host">
        {children}
        {hasAudio ? <GuideAudioMark /> : null}
      </div>
      <span className="devotions-shelf__item-label">{label}</span>
    </div>
  );
}

function JourneyCard({ item, expanded, onExpand }) {
  const hasChoices = Array.isArray(item.choices) && item.choices.length > 0;
  return (
    <div className={`devotion-card devotion-card--journey${item.active ? ' devotion-card--active' : ''}`}>
      <button
        type="button"
        className="devotion-card__hit"
        aria-label={item.label}
        aria-expanded={hasChoices ? expanded : undefined}
        onClick={() => {
          if (hasChoices) onExpand(item.id);
          else item.onSelect?.();
        }}
      >
        <span className="devotion-card__art-wrap">
          {item.image ? (
            <img className="devotion-card__art" src={item.image} alt="" draggable={false} />
          ) : (
            <span className="devotion-card__art devotion-card__art--empty" />
          )}
          {item.hasAudio ? <GuideAudioMark /> : null}
        </span>
        <span className="devotion-card__body">
          <span className="devotion-card__title">{item.label}</span>
          {item.meta ? <span className="devotion-card__meta">{item.meta}</span> : null}
          {item.active ? <span className="devotion-card__current">Actual</span> : null}
        </span>
      </button>
      {hasChoices && expanded ? (
        <div className="devotion-card__choices" role="group" aria-label={`Elegir ${item.label}`}>
          {item.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`devotion-card__choice${c.active ? ' devotion-card__choice--active' : ''}`}
              onClick={() => c.onSelect?.()}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BriefCard({ item }) {
  return (
    <button
      type="button"
      className={`devotion-card devotion-card--brief${item.active ? ' devotion-card--active' : ''}`}
      aria-label={item.label}
      onClick={() => item.onSelect?.()}
    >
      <span className="devotion-card__art-wrap devotion-card__art-wrap--brief">
        {item.image ? (
          <img className="devotion-card__art" src={item.image} alt="" draggable={false} />
        ) : (
          <span className="devotion-card__art devotion-card__art--empty" />
        )}
      </span>
      <span className="devotion-card__title">{item.label}</span>
      {item.meta ? <span className="devotion-card__meta">{item.meta}</span> : null}
    </button>
  );
}

/**
 * Biblioteca de devociones — bottom sheet (see .docs/libro/devotions-surfaces-redesign.md).
 * `externalToggle`: Libro bottom-nav owns ✦; listens for `rosario-devotions-toggle`.
 */
export default function DevotionsShelf({
  misterioActual,
  active = false,
  journeys = [],
  briefs = [],
  /** @deprecated legacy children rows */
  recorridos,
  breves,
  proximas,
  variant = 'pill',
  open: openProp,
  onOpenChange,
  externalToggle = false,
  onReturnToRosary,
  returnLabel = 'Volver al Rosario',
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openInternal;

  const setShelfOpen = useCallback(
    (next) => {
      const apply = (current) => {
        const value = typeof next === 'function' ? next(current) : next;
        devLog('shelf-toggle', { open: value, misterio: misterioActual });
        onOpenChange?.(value);
        if (!value) setExpandedId(null);
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
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (lastMysteryRef.current !== misterioActual) {
      lastMysteryRef.current = misterioActual;
      setShelfOpen(false);
    }
  }, [misterioActual, setShelfOpen]);

  useEffect(() => {
    if (!externalToggle) return undefined;
    const onToggle = () => setShelfOpen((wasOpen) => !wasOpen);
    window.addEventListener('rosario-devotions-toggle', onToggle);
    return () => window.removeEventListener('rosario-devotions-toggle', onToggle);
  }, [externalToggle, setShelfOpen]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('rosario-devotions-state', { detail: { open, active } })
    );
  }, [open, active]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setShelfOpen(false);
    };
    document.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus?.();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, setShelfOpen]);

  const useDescriptors = journeys.length > 0 || briefs.length > 0;

  const panel = open ? (
    <div className="devotions-shelf__layer" role="presentation">
      <button
        type="button"
        className="devotions-shelf__backdrop"
        aria-label="Cerrar devociones"
        onClick={() => setShelfOpen(false)}
      />
      <div
        ref={panelRef}
        className="devotions-shelf__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Devociones"
      >
        <header className="devotions-shelf__header">
          <p className="devotions-shelf__eyebrow">El Libro</p>
          <div className="devotions-shelf__header-row">
            <div>
              <h2 className="devotions-shelf__title">Devociones</h2>
              <p className="devotions-shelf__subtitle">Elegí un recorrido o una oración breve</p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              className="devotions-shelf__close"
              aria-label="Cerrar"
              onClick={() => setShelfOpen(false)}
            >
              ×
            </button>
          </div>
        </header>

        <div className="devotions-shelf__body">
          {useDescriptors ? (
            <>
              <p className="devotions-shelf__heading">Recorridos</p>
              <div className="devotions-shelf__grid devotions-shelf__grid--journeys">
                {journeys.map((item) => (
                  <JourneyCard
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
                  />
                ))}
              </div>
              <p className="devotions-shelf__heading">Oraciones breves</p>
              <div className="devotions-shelf__grid devotions-shelf__grid--briefs">
                {briefs.map((item) => (
                  <BriefCard key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="devotions-shelf__heading">Recorridos</p>
              <div className="devotions-shelf__row">{recorridos}</div>
              <p className="devotions-shelf__heading">Oraciones breves</p>
              <div className="devotions-shelf__row">{breves}</div>
              {proximas ? (
                <>
                  <p className="devotions-shelf__heading">Próximas</p>
                  <div className="devotions-shelf__row">{proximas}</div>
                </>
              ) : null}
            </>
          )}
        </div>

        {onReturnToRosary ? (
          <footer className="devotions-shelf__footer">
            <button
              type="button"
              className="devotions-shelf__return"
              onClick={() => {
                setShelfOpen(false);
                onReturnToRosary();
              }}
            >
              {returnLabel}
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  ) : null;

  const rootClass = `devotions-shelf${variant === 'footer' ? ' devotions-shelf--footer' : ''}${
    externalToggle ? ' devotions-shelf--nav-host' : ''
  }`;

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
