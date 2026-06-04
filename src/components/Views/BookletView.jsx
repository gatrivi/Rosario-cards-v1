import React, { useMemo, useEffect, useCallback, useState } from 'react';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { getPrayerData } from './RoseView';
import {
  getPrayerVariants,
  getVariantStorageKey,
} from '../../data/prayerVariants';
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
        variants: getPrayerVariants(id),
      };
    })
    .filter(Boolean);
}

function renderVerseLines(text) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') {
      return <div key={`sp-${i}`} className="booklet-verse-spacer" aria-hidden="true" />;
    }
    return (
      <p key={`ln-${i}`} className="booklet-verse">
        {line}
      </p>
    );
  });
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

  const variants = activePrayer?.variants;
  const [variantId, setVariantId] = useState(() => {
    if (!activePrayer?.variants?.length) return null;
    try {
      const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
      if (saved && activePrayer.variants.some((v) => v.id === saved)) return saved;
    } catch (_) { /* ignore */ }
    return activePrayer.variants[0].id;
  });

  useEffect(() => {
    if (!activePrayer?.variants?.length) {
      setVariantId(null);
      return;
    }
    try {
      const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
      if (saved && activePrayer.variants.some((v) => v.id === saved)) {
        setVariantId(saved);
        return;
      }
    } catch (_) { /* ignore */ }
    setVariantId(activePrayer.variants[0].id);
  }, [activePrayer?.id, activePrayer?.variants]);

  const displayText = useMemo(() => {
    if (!activePrayer) return '';
    if (variants && variantId) {
      const chosen = variants.find((v) => v.id === variantId);
      if (chosen) return chosen.text;
    }
    return activePrayer.text;
  }, [activePrayer, variants, variantId]);

  const cycleVariant = useCallback(() => {
    if (!variants?.length) return;
    const idx = variants.findIndex((v) => v.id === variantId);
    const next = variants[(idx + 1) % variants.length];
    setVariantId(next.id);
    try {
      localStorage.setItem(getVariantStorageKey(activePrayer.id), next.id);
    } catch (_) { /* ignore */ }
  }, [variants, variantId, activePrayer?.id]);

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

  const activeVariantLabel = variants?.find((v) => v.id === variantId)?.label;
  const turnSide = isLeftHanded ? 'booklet-footer--left' : 'booklet-footer--right';

  return (
    <div
      className="booklet-view"
      style={{
        backgroundImage: `linear-gradient(rgba(8,8,8,0.84), rgba(8,8,8,0.93)), url(${activePrayer.img})`,
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
        {variants && (
          <button
            type="button"
            className="booklet-variant-turn"
            onClick={cycleVariant}
            aria-label={`Cambiar versión del ${activePrayer.title}`}
          >
            ◇ {activeVariantLabel}
            <span className="booklet-variant-turn__hint"> · tocar para otra versión</span>
          </button>
        )}
      </header>

      <article
        className="booklet-text"
        style={{ fontSize: simpleMode ? '1.35rem' : '1.08rem' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width * 0.62) goNext();
          else if (x < rect.width * 0.38) goPrev();
        }}
      >
        {renderVerseLines(displayText)}
      </article>

      <footer className={`booklet-footer ${turnSide}${simpleMode ? ' booklet-footer--large' : ''}`}>
        <button
          type="button"
          className="booklet-turn booklet-turn--back"
          onClick={goPrev}
          disabled={!canGoBack}
          aria-label="Oración anterior"
        >
          ‹ anterior
        </button>
        <span className="booklet-turn-ornament" aria-hidden="true">✦</span>
        <button
          type="button"
          className="booklet-turn booklet-turn--forward"
          onClick={goNext}
          disabled={!canGoForward}
          aria-label="Siguiente oración"
        >
          siguiente ›
        </button>
      </footer>
    </div>
  );
}
