import React, { useMemo, useEffect, useCallback } from 'react';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { getPrayerData } from './RoseView';
import './BookletView.css';

const MYSTERY_OPTIONS = [
  { id: 'gozosos', label: 'Gozosos' },
  { id: 'dolorosos', label: 'Dolorosos' },
  { id: 'gloriosos', label: 'Gloriosos' },
  { id: 'luminosos', label: 'Luminosos' },
];

const SEQ_MAP = {
  gozosos: 'RGo',
  dolorosos: 'RDo',
  gloriosos: 'RGl',
  luminosos: 'RL',
};

function selectPrayerImage(prayer) {
  if (!prayer) return '/gallery-images/cathedral-painting.jpg';
  const isDark =
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('theme') !== 'light';
  const img = isDark && prayer.imgmo ? prayer.imgmo : prayer.img;
  if (Array.isArray(img)) return img[0] || '/gallery-images/cathedral-painting.jpg';
  return img || '/gallery-images/cathedral-painting.jpg';
}

function buildSequence(mysteryType) {
  const keys = RosarioPrayerBook[SEQ_MAP[mysteryType]] || RosarioPrayerBook.RGo;
  return keys
    .map((id) => {
      const data = getPrayerData(id, mysteryType);
      if (!data) return null;
      return {
        id,
        title: data.title,
        text: data.text,
        img: selectPrayerImage(data),
      };
    })
    .filter(Boolean);
}

export default function BookletView({
  currentPrayerIndex,
  misterioActual,
  onUpdateProgreso,
  onMysteryChange,
  isLeftHanded = false,
  simpleMode = false,
}) {
  const secuencia = useMemo(
    () => buildSequence(misterioActual),
    [misterioActual]
  );

  const total = secuencia.length;
  const safeIndex = Math.min(
    Math.max(currentPrayerIndex, 0),
    Math.max(total - 1, 0)
  );
  const activePrayer = secuencia[safeIndex];
  const canGoBack = safeIndex > 0;
  const canGoForward = safeIndex < total - 1;

  const goTo = useCallback(
    (index) => {
      if (index < 0 || index >= total) return;
      onUpdateProgreso(index);
    },
    [onUpdateProgreso, total]
  );

  const goPrev = useCallback(() => {
    if (canGoBack) goTo(safeIndex - 1);
  }, [canGoBack, goTo, safeIndex]);

  const goNext = useCallback(() => {
    if (canGoForward) goTo(safeIndex + 1);
  }, [canGoForward, goTo, safeIndex]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  if (!activePrayer) {
    return (
      <div className="booklet-view booklet-view--empty">
        <p>No se encontraron oraciones para este misterio.</p>
      </div>
    );
  }

  const navOrder = isLeftHanded
    ? ['next', 'content', 'prev']
    : ['prev', 'content', 'next'];

  return (
    <div
      className="booklet-view"
      style={{
        backgroundImage: `linear-gradient(rgba(8,8,8,0.82), rgba(8,8,8,0.92)), url(${activePrayer.img})`,
      }}
    >
      <header className="booklet-header">
        <div className="booklet-mystery-row">
          {MYSTERY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`booklet-mystery-pill${
                misterioActual === opt.id ? ' booklet-mystery-pill--active' : ''
              }`}
              onClick={() => onMysteryChange?.(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="booklet-progress">
          {safeIndex + 1} / {total}
        </p>
        <h1
          className="booklet-title"
          style={{ fontSize: simpleMode ? '1.75rem' : '1.35rem' }}
        >
          {activePrayer.title}
        </h1>
      </header>

      <article
        className="booklet-text"
        style={{ fontSize: simpleMode ? '1.35rem' : '1.05rem' }}
      >
        {activePrayer.text.split('\n').map((line, i) => (
          <p key={`${activePrayer.id}-${i}`} className="booklet-line">
            {line}
          </p>
        ))}
      </article>

      <footer className="booklet-footer">
        {navOrder.map((slot) => {
          if (slot === 'prev') {
            return (
              <button
                key="prev"
                type="button"
                className="booklet-nav-btn"
                onClick={goPrev}
                disabled={!canGoBack}
                aria-label="Oración anterior"
              >
                ← Anterior
              </button>
            );
          }
          if (slot === 'next') {
            return (
              <button
                key="next"
                type="button"
                className="booklet-nav-btn booklet-nav-btn--primary"
                onClick={goNext}
                disabled={!canGoForward}
                aria-label="Siguiente oración"
              >
                Siguiente →
              </button>
            );
          }
          return (
            <span key="content" className="booklet-hint">
              Toca Siguiente para avanzar
            </span>
          );
        })}
      </footer>
    </div>
  );
}
