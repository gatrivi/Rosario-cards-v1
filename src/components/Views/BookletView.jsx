import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { getPrayerData } from './RoseView';
import {
  getPrayerVariants,
  getVariantStorageKey,
} from '../../data/prayerVariants';
import PrayerRecorder from '../common/PrayerRecorder';
import PrayForOrbs from '../common/PrayForOrbs';
import {
  getBookletStepContext,
  stepContextToVitralVars,
  makeBookletRoseFingerprint,
} from '../../utils/bookletProgress';
import { playBookletTransitionSound } from '../../utils/bookletSounds';
import { getPrayerImageCandidates, resolvePrayerImage } from '../../utils/prayerImages';
import './BookletView.css';

function VitralImage({ candidates }) {
  const [index, setIndex] = useState(0);
  const src = candidates[index] ?? candidates[candidates.length - 1];

  return (
    <img
      src={src}
      alt=""
      className="booklet-vitral__img"
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}

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

function buildSequence(mysteryType) {
  const keys = RosarioPrayerBook[SEQ_MAP[mysteryType]] || RosarioPrayerBook.RGo;
  return keys
    .map((id) => {
      const data = getPrayerData(id, mysteryType);
      if (!data) return null;
      const imgCandidates = getPrayerImageCandidates(data, mysteryType);
      return {
        id,
        title: data.title,
        text: data.text,
        img: resolvePrayerImage(data, mysteryType),
        imgCandidates,
        variants: getPrayerVariants(id),
      };
    })
    .filter(Boolean);
}

function splitIntoBursts(text) {
  if (!text) return [];

  if (text.includes('\n')) {
    return text.split('\n').map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return { type: 'spacer' };
      return { type: 'verse', text: trimmed };
    });
  }

  return text
    .split(/(?<=[.,;:!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((verse) => ({ type: 'verse', text: verse }));
}

function renderVerseLines(text) {
  return splitIntoBursts(text).map((item, i) => {
    if (item.type === 'spacer') {
      return <div key={`sp-${i}`} className="booklet-verse-spacer" aria-hidden="true" />;
    }
    return (
      <p key={`ln-${i}`} className="booklet-verse">
        {item.text}
      </p>
    );
  });
}

/** Position within a consecutive run of Ave Marías (opening chain or decade). */
export function getAveMariaRunInfo(sequence, index) {
  if (!sequence[index] || sequence[index].id !== 'A') return null;

  let start = index;
  while (start > 0 && sequence[start - 1]?.id === 'A') start -= 1;

  let end = index;
  while (end < sequence.length - 1 && sequence[end + 1]?.id === 'A') end += 1;

  return {
    position: index - start + 1,
    total: end - start + 1,
    step: index - start,
  };
}

export default function BookletView({
  currentPrayerIndex,
  misterioActual,
  onUpdateProgreso,
  onMysteryChange,
  isLeftHanded = false,
  simpleMode = false,
  soundEnabled = true,
  onAveMariaComplete,
  onAveMariaUndo,
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
  const [stepPulse, setStepPulse] = useState(false);
  const prevIndexRef = useRef(safeIndex);
  const isFirstRenderRef = useRef(true);

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

  const navigateTo = useCallback(
    (newIndex) => {
      if (newIndex < 0 || newIndex >= total || newIndex === safeIndex) return;

      const oldIndex = safeIndex;
      const leaving = secuencia[oldIndex];
      const entering = secuencia[newIndex];
      const enteringCtx = getBookletStepContext(secuencia, newIndex, total);

      if (newIndex > oldIndex) {
        if (leaving?.id === 'A') {
          const fp = makeBookletRoseFingerprint(
            getAveMariaRunInfo(secuencia, oldIndex),
            getBookletStepContext(secuencia, oldIndex, total).mysteryDecade
          );
          onAveMariaComplete?.(fp);
        }
      } else if (newIndex < oldIndex && secuencia[newIndex]?.id === 'A') {
        onAveMariaUndo?.();
      }

      playBookletTransitionSound({
        prayerId: entering?.id,
        stepContext: enteringCtx,
        soundEnabled,
      });

      setStepPulse(true);
      setTimeout(() => setStepPulse(false), 520);
      onUpdateProgreso(newIndex);
    },
    [safeIndex, secuencia, total, onUpdateProgreso, onAveMariaComplete, onAveMariaUndo, soundEnabled]
  );

  const goPrev = useCallback(() => {
    if (canGoBack) navigateTo(safeIndex - 1);
  }, [canGoBack, navigateTo, safeIndex]);

  const goNext = useCallback(() => {
    if (canGoForward) navigateTo(safeIndex + 1);
  }, [canGoForward, navigateTo, safeIndex]);

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

  const stepContext = useMemo(
    () => getBookletStepContext(secuencia, safeIndex, total),
    [secuencia, safeIndex, total]
  );

  const aveRunInfo = stepContext.aveRun;
  const isAveMaria = activePrayer?.id === 'A' && aveRunInfo;

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevIndexRef.current = safeIndex;
      return undefined;
    }
    prevIndexRef.current = safeIndex;
    return undefined;
  }, [safeIndex]);

  if (!activePrayer) {
    return (
      <div className="booklet-view booklet-view--empty">
        <p>No se encontraron oraciones para este misterio.</p>
      </div>
    );
  }

  const activeVariantLabel = variants?.find((v) => v.id === variantId)?.label;
  const turnSide = isLeftHanded ? 'booklet-footer--left' : 'booklet-footer--right';

  const vitralStyle = stepContextToVitralVars(stepContext);
  const vitralKindClass = isAveMaria
    ? ' booklet-vitral--ave'
    : stepContext.kind === 'mystery'
      ? ' booklet-vitral--mystery'
      : ' booklet-vitral--prayer';

  return (
    <div className="booklet-view" style={vitralStyle}>
      {/* Stained glass / vitral background */}
      <div
        className={`booklet-vitral${vitralKindClass}${stepPulse ? ' booklet-vitral--pulse' : ''}`}
        aria-hidden="true"
      >
        <VitralImage
          key={`${activePrayer.id}-${activePrayer.img}`}
          candidates={activePrayer.imgCandidates || [activePrayer.img]}
        />
        <div className="booklet-vitral__shade" />
        <div className="booklet-vitral__glare" />
      </div>

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
          {isAveMaria && (
            <span className="booklet-ave-count">
              {' '}
              · {aveRunInfo.position} de {aveRunInfo.total}
            </span>
          )}
          {stepContext.kind === 'mystery' && stepContext.mysteryDecade && (
            <span className="booklet-ave-count">
              {' '}
              · misterio {stepContext.mysteryDecade} de 5
            </span>
          )}
        </p>
        <h1
          className={`booklet-title${isAveMaria ? ' booklet-title--ave' : ''}${stepContext.kind === 'mystery' ? ' booklet-title--mystery' : ''}`}
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
        className="booklet-glass-panel"
        style={{ fontSize: simpleMode ? '1.35rem' : '1.08rem' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width * 0.62) goNext();
          else if (x < rect.width * 0.38) goPrev();
        }}
      >
        <div
          className={`booklet-glass-inner stained-glass-overlay booklet-glass-inner--progress${isAveMaria ? ' booklet-glass-inner--ave' : ''}`}
          style={{
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.22), inset 0 0 ${24 + (stepContext.localStep || 0) * 5}px rgba(212, 175, 55, ${0.04 + (parseFloat(vitralStyle['--ave-glare']) || 0.06) * 0.35})`,
          }}
        >
          {renderVerseLines(displayText)}
        </div>
      </article>

      <PrayForOrbs simpleMode={simpleMode} offeringPulse={stepPulse} />

      <div className="booklet-footer-tools">
        <PrayerRecorder
          prayerId={activePrayer.id}
          prayerTitle={activePrayer.title}
          mystery={misterioActual}
          sequenceIndex={safeIndex}
          simpleMode={simpleMode}
          placement="footer"
        />
      </div>

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
