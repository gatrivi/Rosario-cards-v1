import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { getPrayerData } from './RoseView';
import {
  getPrayerVariants,
  getVariantStorageKey,
} from '../../data/prayerVariants';
import PrayerRecorder from '../common/PrayerRecorder';
import OptionalPrayerSheet from '../common/OptionalPrayerSheet';
import PrayForOrbs from '../common/PrayForOrbs';
import OfferingLight from '../common/OfferingLight';
import { loadPrayForIntentions } from '../../utils/prayForStore';
import {
  getBookletStepContext,
  stepContextToVitralVars,
  makeBookletRoseFingerprint,
} from '../../utils/bookletProgress';
import { playBookletTransitionSound, playOfferingChime } from '../../utils/bookletSounds';
import { getPrayerImageCandidates, resolvePrayerImage } from '../../utils/prayerImages';
import './BookletView.css';

const TRANSITION_PHASE = {
  READY: 'ready',
  LEAVING: 'leaving',
  LINGER: 'linger',
  ARRIVING: 'arriving',
  ENTERING: 'entering',
};

export const BOOKLET_TIMING = {
  textOut: 220,
  linger: 280,
  imageBeforeText: 480,
  textIn: 300,
  stepGlow: 380,
};

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function VitralImage({ candidates, onReady }) {
  const [index, setIndex] = useState(0);
  const imgRef = useRef(null);
  const src = candidates[index] ?? candidates[candidates.length - 1];

  const notifyReady = useCallback(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) notifyReady();
  }, [src, notifyReady]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      className="booklet-vitral__img"
      onLoad={notifyReady}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
        else notifyReady();
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
  const [displayIndex, setDisplayIndex] = useState(safeIndex);
  const [transitionPhase, setTransitionPhase] = useState(TRANSITION_PHASE.READY);
  const transitionPhaseRef = useRef(TRANSITION_PHASE.READY);
  const transitionTimersRef = useRef([]);
  const imageReadyRef = useRef(true);
  const afterImageReadyRef = useRef(null);
  const activePrayer = secuencia[displayIndex];
  const isTransitioning = transitionPhase !== TRANSITION_PHASE.READY;

  const variants = activePrayer?.variants;
  const [variantId, setVariantId] = useState(() => {
    if (!activePrayer?.variants?.length) return null;
    try {
      const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
      if (saved && activePrayer.variants.some((v) => v.id === saved)) return saved;
    } catch (_) { /* ignore */ }
    return activePrayer.variants[0].id;
  });
  const [stepGlow, setStepGlow] = useState(false);
  const [offeringLight, setOfferingLight] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [orbHost, setOrbHost] = useState(null);
  const prevIndexRef = useRef(safeIndex);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    setOrbHost(document.getElementById('booklet-top-orbs'));
  }, []);

  const setPhase = useCallback((phase) => {
    transitionPhaseRef.current = phase;
    setTransitionPhase(phase);
  }, []);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((id) => clearTimeout(id));
    transitionTimersRef.current = [];
  }, []);

  const scheduleTransition = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    transitionTimersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  useEffect(() => {
    clearTransitionTimers();
    setPhase(TRANSITION_PHASE.READY);
    setDisplayIndex(safeIndex);
  }, [misterioActual, clearTransitionTimers, setPhase]);

  useEffect(() => {
    if (transitionPhaseRef.current === TRANSITION_PHASE.READY && displayIndex !== safeIndex) {
      setDisplayIndex(safeIndex);
    }
  }, [safeIndex, displayIndex]);

  const beginTextEnter = useCallback(() => {
    setPhase(TRANSITION_PHASE.ENTERING);
    scheduleTransition(() => setPhase(TRANSITION_PHASE.READY), BOOKLET_TIMING.textIn);
  }, [scheduleTransition, setPhase]);

  const beginArrivingHold = useCallback(() => {
    imageReadyRef.current = false;
    afterImageReadyRef.current = () => {
      scheduleTransition(beginTextEnter, BOOKLET_TIMING.imageBeforeText);
    };
    scheduleTransition(() => {
      if (!afterImageReadyRef.current) return;
      imageReadyRef.current = true;
      const run = afterImageReadyRef.current;
      afterImageReadyRef.current = null;
      run();
    }, 900);
  }, [beginTextEnter, scheduleTransition]);

  const handleImageReady = useCallback(() => {
    imageReadyRef.current = true;
    if (
      transitionPhaseRef.current === TRANSITION_PHASE.ARRIVING &&
      afterImageReadyRef.current
    ) {
      const run = afterImageReadyRef.current;
      afterImageReadyRef.current = null;
      run();
    }
  }, []);

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

  const canGoBack = displayIndex > 0;
  const canGoForward = displayIndex < total - 1;

  const navigateTo = useCallback(
    (newIndex) => {
      if (newIndex < 0 || newIndex >= total || newIndex === displayIndex) return;
      if (transitionPhaseRef.current !== TRANSITION_PHASE.READY) return;

      const oldIndex = displayIndex;
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

      const finishSwap = () => {
        setDisplayIndex(newIndex);
        onUpdateProgreso(newIndex);
        playBookletTransitionSound({
          prayerId: entering?.id,
          stepContext: enteringCtx,
          soundEnabled,
        });
        setStepGlow(true);
        scheduleTransition(() => setStepGlow(false), BOOKLET_TIMING.stepGlow);
        setPhase(TRANSITION_PHASE.ARRIVING);
        beginArrivingHold();
        scheduleTransition(() => {
          if (!afterImageReadyRef.current) return;
          imageReadyRef.current = true;
          handleImageReady();
        }, 48);
      };

      if (newIndex > oldIndex) {
        setOfferingLight(true);
        playOfferingChime(soundEnabled);
        scheduleTransition(() => setOfferingLight(false), 900);
      }

      if (prefersReducedMotion()) {
        setDisplayIndex(newIndex);
        onUpdateProgreso(newIndex);
        playBookletTransitionSound({
          prayerId: entering?.id,
          stepContext: enteringCtx,
          soundEnabled,
        });
        setPhase(TRANSITION_PHASE.READY);
        return;
      }

      setPhase(TRANSITION_PHASE.LEAVING);
      scheduleTransition(() => {
        setPhase(TRANSITION_PHASE.LINGER);
        scheduleTransition(finishSwap, BOOKLET_TIMING.linger);
      }, BOOKLET_TIMING.textOut);
    },
    [
      displayIndex,
      secuencia,
      total,
      onUpdateProgreso,
      onAveMariaComplete,
      onAveMariaUndo,
      soundEnabled,
      scheduleTransition,
      setPhase,
      beginArrivingHold,
      beginTextEnter,
      handleImageReady,
    ]
  );

  const goPrev = useCallback(() => {
    if (canGoBack) navigateTo(displayIndex - 1);
  }, [canGoBack, navigateTo, displayIndex]);

  const goNext = useCallback(() => {
    if (canGoForward) navigateTo(displayIndex + 1);
  }, [canGoForward, navigateTo, displayIndex]);

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
    () => getBookletStepContext(secuencia, displayIndex, total),
    [secuencia, displayIndex, total]
  );

  const chromePhaseClass =
    transitionPhase === TRANSITION_PHASE.LEAVING
      ? ' booklet-prayer-chrome--leaving'
      : transitionPhase === TRANSITION_PHASE.LINGER ||
          transitionPhase === TRANSITION_PHASE.ARRIVING
        ? ' booklet-prayer-chrome--hidden'
        : transitionPhase === TRANSITION_PHASE.ENTERING
          ? ' booklet-prayer-chrome--entering'
          : '';

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
        className={`booklet-vitral${vitralKindClass}${stepGlow ? ' booklet-vitral--step' : ''}`}
        aria-hidden="true"
      >
        <VitralImage
          key={`${activePrayer.id}-${activePrayer.img}`}
          candidates={activePrayer.imgCandidates || [activePrayer.img]}
          onReady={handleImageReady}
        />
        <div className="booklet-vitral__shade" />
        <div className="booklet-vitral__glare" />
      </div>

      {(transitionPhase === TRANSITION_PHASE.LINGER ||
        transitionPhase === TRANSITION_PHASE.ARRIVING) && (
        <p className="booklet-transition-hint" aria-live="polite">
          {transitionPhase === TRANSITION_PHASE.LINGER
            ? 'Un momento con la imagen…'
            : 'Preparando la siguiente oración…'}
        </p>
      )}

      <div className={`booklet-prayer-chrome${chromePhaseClass}`}>
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
                disabled={isTransitioning}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="booklet-progress">
            <button
              type="button"
              className="booklet-optional-btn"
              onClick={() => setOptionalOpen(true)}
              title="Oraciones opcionales (Ángel, San Benito)"
              aria-label="Oraciones opcionales"
            >
              ✦
            </button>
            {displayIndex + 1} / {total}
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
          <PrayerRecorder
            prayerId={activePrayer.id}
            prayerTitle={activePrayer.title}
            mystery={misterioActual}
            sequenceIndex={displayIndex}
            simpleMode={simpleMode}
            placement="title"
            isLeftHanded={isLeftHanded}
          >
            <h1
              className={`booklet-title${isAveMaria ? ' booklet-title--ave' : ''}${stepContext.kind === 'mystery' ? ' booklet-title--mystery' : ''}`}
              style={{ fontSize: simpleMode ? '1.75rem' : '1.35rem' }}
            >
              {activePrayer.title}
            </h1>
          </PrayerRecorder>
          {variants && (
            <button
              type="button"
              className="booklet-variant-turn"
              onClick={cycleVariant}
              aria-label={`Cambiar versión del ${activePrayer.title}`}
              disabled={isTransitioning}
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
            if (isTransitioning) return;
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
      </div>

      {orbHost &&
        createPortal(
          <PrayForOrbs
            simpleMode={simpleMode}
            offeringPulse={stepGlow}
            variant="header"
            soundEnabled={soundEnabled}
          />,
          orbHost
        )}

      <OfferingLight
        active={offeringLight}
        count={Math.max(loadPrayForIntentions().length, 1)}
      />

      {optionalOpen && <OptionalPrayerSheet onClose={() => setOptionalOpen(false)} />}

      <footer className={`booklet-footer ${turnSide}${simpleMode ? ' booklet-footer--large' : ''}`}>
        <button
          type="button"
          className="booklet-turn booklet-turn--back"
          onClick={goPrev}
          disabled={!canGoBack || isTransitioning}
          aria-label="Oración anterior"
        >
          ‹ anterior
        </button>
        <span className="booklet-turn-ornament" aria-hidden="true">✦</span>
        <button
          type="button"
          className="booklet-turn booklet-turn--forward"
          onClick={goNext}
          disabled={!canGoForward || isTransitioning}
          aria-label="Siguiente oración"
        >
          siguiente ›
        </button>
      </footer>
    </div>
  );
}
