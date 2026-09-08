import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import RosaryAdapter from '../RosarioNube/RosaryAdapter';
import RosaryPrayerTransition from './RosaryPrayerTransition';
import SacredDust from '../common/SacredDust';
import VitralBackground from '../common/VitralBackground';
import BookletPrayerPanel from './BookletPrayerPanel';
import { buildSequence } from '../../utils/bookletSequence';
import { resolveDisplayText, loadSavedVariantId } from '../../utils/bookletDisplayText';
import {
  pickPrayerImage,
  getLitanyVerseImageCandidates,
  resolveLitanyVerseImage,
  getPrayerImageCandidates,
} from '../../utils/prayerImages';
import { isTextHeavyImagePath } from '../../data/imageRegistry';
import { getLitanyVerse, isLitanyPrayer } from '../../utils/litanyHelpers';
import {
  getPrayerVerseCount,
  getPrayerVerseText,
  getPrayerVerseImageCandidates,
  resolvePrayerVerseImage,
} from '../../utils/prayerVerseImages';
import { supportsPerVerseImages } from '../../data/prayerVerseCatalog';
import LitanyEntrance from '../Litany/LitanyEntrance';
import { getBookletStepContext, stepContextToVitralVars, makeBookletRoseFingerprint } from '../../utils/bookletProgress';
import { getAveMariaRunInfo } from '../../utils/aveMariaRunInfo';
import { canStartLitany, isClosingPrayersUnlocked } from '../../utils/rosarySequenceUtils';
import { getMysteryColors } from '../RosarioNube/utils/mysteryColors';
import { usePrayerVoiceAutoplay } from '../../hooks/usePrayerVoiceAutoplay';
import { RELEASE_NOTES } from '../../data/releaseNotes';
import './BookletView.css';
import './RosarioVirtualView.css';

export default function RosarioVirtualView({
  currentPrayerIndex,
  misterioActual,
  onUpdateProgreso,
  soundEnabled,
  isLeftHanded,
  simpleMode = false,
  litanyEntranceEnabled = true,
  perVersePrayerImages = false,
  onShowRosedal,
  onToggleSimpleMode,
  onAveMariaComplete,
  onAveMariaUndo,
}) {
  const [litanyVerseIndex, setLitanyVerseIndex] = useState(0);
  const [prayerVerseIndex, setPrayerVerseIndex] = useState(0);
  const [showLitanyEntrance, setShowLitanyEntrance] = useState(false);
  const litanyEntranceShownRef = useRef(false);
  const [guided, setGuided] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [isCargando, setIsCargando] = useState(false);
  const [cargaOracion, setCargaOracion] = useState(0);
  const timerRef = useRef(null);
  const [readyArtworkKey, setReadyArtworkKey] = useState(null);

  const mysteryColors = useMemo(() => getMysteryColors(misterioActual), [misterioActual]);
  const accentColor = mysteryColors.highlight;
  const secuencia = useMemo(() => buildSequence(misterioActual), [misterioActual]);
  const total = secuencia.length;
  const safeIndex = Math.min(
    Math.max(currentPrayerIndex, 0),
    Math.max(total - 1, 0)
  );

  const activePrayer = secuencia[safeIndex];

  usePrayerVoiceAutoplay({
    enabled: false,
    mystery: misterioActual,
    sequenceIndex: safeIndex,
    prayerId: activePrayer?.id,
  });

  const isLitany = isLitanyPrayer(activePrayer);
  const isPerVersePrayer = perVersePrayerImages && supportsPerVerseImages(activePrayer?.id);
  const prayerVerseTotal = isPerVersePrayer ? getPrayerVerseCount(activePrayer.id) : 0;
  const litanyVerse = isLitany ? getLitanyVerse(litanyVerseIndex, activePrayer) : null;
  const litanyVerseTotal = activePrayer?.verses?.length || 0;
  const hasInnerVerses = isLitany || isPerVersePrayer;
  const innerVerseIndex = isLitany ? litanyVerseIndex : prayerVerseIndex;

  const stepContext = useMemo(
    () => getBookletStepContext(secuencia, safeIndex, total),
    [secuencia, safeIndex, total]
  );
  const vitralStyle = useMemo(() => stepContextToVitralVars(stepContext), [stepContext]);
  const aveRunInfo = stepContext.aveRun;
  const isAveMaria = activePrayer?.id === 'A' && aveRunInfo;
  const vitralKind = isAveMaria
    ? 'ave'
    : stepContext.kind === 'mystery'
      ? 'mystery'
      : 'prayer';

  const variantId = useMemo(
    () => (activePrayer ? loadSavedVariantId(activePrayer) : null),
    [activePrayer]
  );
  const displayText = useMemo(() => {
    if (isPerVersePrayer) {
      return getPrayerVerseText(activePrayer.id, prayerVerseIndex) || '';
    }
    return resolveDisplayText(activePrayer, variantId);
  }, [activePrayer, variantId, isPerVersePrayer, prayerVerseIndex]);

  const vitralCandidates = useMemo(() => {
    if (!activePrayer) return ['/gallery-images/cathedral.jpg'];
    const scrub = (list) => (list || []).filter((u) => u && !isTextHeavyImagePath(u));
    if (isLitany && litanyVerse) {
      const all = scrub(getLitanyVerseImageCandidates(litanyVerse, activePrayer, litanyVerseIndex));
      const picked = scrub([resolveLitanyVerseImage(litanyVerse, activePrayer, litanyVerseIndex)])[0]
        || all[0];
      return [picked, ...all.filter((u) => u !== picked)].filter(Boolean);
    }
    if (isPerVersePrayer) {
      const all = scrub(
        getPrayerVerseImageCandidates(
          activePrayer.id,
          prayerVerseIndex,
          activePrayer,
          misterioActual
        )
      );
      const picked = scrub([
        resolvePrayerVerseImage(
          activePrayer.id,
          prayerVerseIndex,
          activePrayer,
          misterioActual
        ),
      ])[0] || all[0];
      return [picked, ...all.filter((u) => u !== picked)].filter(Boolean);
    }
    const raw = activePrayer.imgCandidates?.length
      ? activePrayer.imgCandidates
      : getPrayerImageCandidates(activePrayer, misterioActual);
    const all = scrub(raw);
    const safe = all.length ? all : getPrayerImageCandidates(activePrayer, misterioActual);
    const picked = pickPrayerImage(safe, safeIndex);
    return [picked, ...safe.filter((u) => u !== picked)].filter(Boolean);
  }, [
    activePrayer,
    safeIndex,
    isLitany,
    litanyVerse,
    litanyVerseIndex,
    isPerVersePrayer,
    prayerVerseIndex,
    misterioActual,
  ]);

  useEffect(() => {
    litanyEntranceShownRef.current = false;
  }, [misterioActual]);

  useEffect(() => {
    setLitanyVerseIndex(0);
    setPrayerVerseIndex(0);
    if (activePrayer?.id === 'LL' && litanyEntranceEnabled && !litanyEntranceShownRef.current) {
      setShowLitanyEntrance(true);
      litanyEntranceShownRef.current = true;
    } else {
      setShowLitanyEntrance(false);
    }
  }, [currentPrayerIndex, activePrayer?.id, litanyEntranceEnabled]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdvance = useCallback(() => {
    setShowHint(false);
    const prayer = secuencia[currentPrayerIndex];
    if (isLitanyPrayer(prayer) && litanyVerseIndex < litanyVerseTotal - 1) {
      setLitanyVerseIndex((v) => v + 1);
      setCargaOracion(100);
      return;
    }
    if (perVersePrayerImages && supportsPerVerseImages(prayer?.id) && prayerVerseIndex < getPrayerVerseCount(prayer.id) - 1) {
      setPrayerVerseIndex((v) => v + 1);
      setCargaOracion(100);
      return;
    }
    if (currentPrayerIndex < secuencia.length - 1) {
      if (prayer?.id === 'A') {
        const fp = makeBookletRoseFingerprint(
          getAveMariaRunInfo(secuencia, currentPrayerIndex),
          getBookletStepContext(secuencia, currentPrayerIndex, total).mysteryDecade
        );
        onAveMariaComplete?.(fp);
      }
      onUpdateProgreso(currentPrayerIndex + 1);
      setCargaOracion(100);
    }
  }, [currentPrayerIndex, litanyVerseIndex, litanyVerseTotal, prayerVerseIndex, perVersePrayerImages, secuencia, total, onUpdateProgreso, onAveMariaComplete]);

  useEffect(() => {
    if (isCargando && cargaOracion < 100) {
      timerRef.current = setInterval(() => {
        setCargaOracion((prev) => {
          if (prev >= 100) {
            clearInterval(timerRef.current);
            return 100;
          }
          return prev + 2.5;
        });
      }, 30);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCargando, cargaOracion]);

  useEffect(() => {
    if (guided) return;
    setIsCargando(false);
  }, [guided]);

  useEffect(() => {
    if (guided && isCargando && cargaOracion >= 100) {
      setIsCargando(false);
      if (navigator.vibrate) navigator.vibrate(20);
      handleAdvance();
    }
  }, [guided, isCargando, cargaOracion, handleAdvance]);

  useEffect(() => {
    const onRepeatTouch = (event) => {
      const { prayerIndex } = event.detail || {};
      if (prayerIndex !== currentPrayerIndex) return;
      setShowHint(false);
      const prayer = secuencia[currentPrayerIndex];
      if (isLitanyPrayer(prayer) && litanyVerseIndex < litanyVerseTotal - 1) {
        setLitanyVerseIndex((v) => v + 1);
        setCargaOracion(100);
        return;
      }
      if (perVersePrayerImages && supportsPerVerseImages(prayer?.id) && prayerVerseIndex < getPrayerVerseCount(prayer.id) - 1) {
        setPrayerVerseIndex((v) => v + 1);
        setCargaOracion(100);
        return;
      }
      // One progression owner: complete this step once, including chain prayers.
      window.dispatchEvent(
        new CustomEvent('contentExhausted', { detail: { prayerIndex: currentPrayerIndex } })
      );
    };

    const onContentExhausted = (event) => {
      const { prayerIndex } = event.detail || {};
      if (prayerIndex === currentPrayerIndex) handleAdvance();
    };

    const onHeartBead = () => {
      if (!canStartLitany(secuencia, currentPrayerIndex)) return;
      const litanyIdx = secuencia.findIndex((p) => p?.id === 'LL');
      if (litanyIdx >= 0) {
        onUpdateProgreso(litanyIdx);
        setLitanyVerseIndex(0);
        setCargaOracion(100);
      }
    };

    window.addEventListener('beadRepeatTouch', onRepeatTouch);
    window.addEventListener('contentExhausted', onContentExhausted);
    window.addEventListener('heartBeadPressed', onHeartBead);
    return () => {
      window.removeEventListener('beadRepeatTouch', onRepeatTouch);
      window.removeEventListener('contentExhausted', onContentExhausted);
      window.removeEventListener('heartBeadPressed', onHeartBead);
    };
  }, [currentPrayerIndex, litanyVerseIndex, litanyVerseTotal, prayerVerseIndex, perVersePrayerImages, secuencia, handleAdvance, onUpdateProgreso]);

  const handleRetreat = useCallback(() => {
    setShowHint(false);
    if (isLitany && litanyVerseIndex > 0) {
      setLitanyVerseIndex((v) => v - 1);
      return;
    }
    if (isPerVersePrayer && prayerVerseIndex > 0) {
      setPrayerVerseIndex((v) => v - 1);
      return;
    }
    if (currentPrayerIndex > 0) {
      const prevIdx = currentPrayerIndex - 1;
      if (secuencia[currentPrayerIndex]?.id === 'A' && secuencia[prevIdx]?.id !== 'A') {
        onAveMariaUndo?.();
      }
      onUpdateProgreso(prevIdx);
    }
  }, [currentPrayerIndex, litanyVerseIndex, prayerVerseIndex, isLitany, isPerVersePrayer, secuencia, onUpdateProgreso, onAveMariaUndo]);

  const handleEmptyPointerMove = useCallback(() => {
    if (!guided) return;
    setIsCargando(false);
    setCargaOracion(0);
  }, [guided]);

  const revealPrayer = useCallback((index) => {
    if (index < 0 || index >= secuencia.length) return;
    const targetId = secuencia[index]?.id;
    if ((targetId === 'LL' || targetId === 'S') && !isClosingPrayersUnlocked(secuencia, currentPrayerIndex)) {
      return;
    }
    if (targetId === 'LL' && index > currentPrayerIndex && !canStartLitany(secuencia, currentPrayerIndex)) {
      return;
    }
    setShowHint(false);
    setLitanyVerseIndex(0);
    setPrayerVerseIndex(0);
    setCargaOracion(100);
    setIsCargando(false);
    onUpdateProgreso(index);
  }, [secuencia, currentPrayerIndex, onUpdateProgreso]);

  const handleNodeClick = useCallback((index) => {
    revealPrayer(index);
  }, [revealPrayer]);

  const handleBeadHoldStart = useCallback((index) => {
    revealPrayer(index);
  }, [revealPrayer]);

  const handleBeadHoldEnd = useCallback(() => {}, []);

  return (
    <div
      className={`rosary-view-root${simpleMode ? ' rosary-view-root--simple' : ''}`}
      style={{ ...vitralStyle, '--rosary-accent': accentColor }}
    >
      <VitralBackground
        candidates={vitralCandidates}
        kind={vitralKind}
        variant="rosary"
        crossfade
        onReady={setReadyArtworkKey}
      />

      <SacredDust isCargando={isCargando} />

      {activePrayer && (
        <RosaryPrayerTransition
          stepKey={`${safeIndex}-${hasInnerVerses ? innerVerseIndex : ''}`}
          artworkReady={readyArtworkKey === JSON.stringify(vitralCandidates)}
        >
          <BookletPrayerPanel
            displayText={displayText}
            simpleMode={simpleMode}
            isAveMaria={Boolean(isAveMaria)}
            isLitany={isLitany}
            litanyVerse={litanyVerse}
            litanyVerseIndex={litanyVerseIndex}
            litanyVerseTotal={litanyVerseTotal}
            litanySections={activePrayer.sections}
            misterioActual={misterioActual}
            stepContext={stepContext}
            variant="rosary"
            onTapNav={(dir) => (dir === 'next' ? handleAdvance() : handleRetreat())}
            isTransitioning={false}
          />
        </RosaryPrayerTransition>
      )}

      <div className="rosary-canvas-layer">
        <RosaryAdapter
          sequence={secuencia}
          onNodeClick={handleNodeClick}
          onBeadHoldStart={handleBeadHoldStart}
          onBeadHoldEnd={handleBeadHoldEnd}
          onAdvance={handleAdvance}
          onRetreat={handleRetreat}
          onSwipeAdvance={handleAdvance}
          onSwipeRetreat={handleRetreat}
          onEmptyPointerDown={() => {
            if (!guided) return;
            setCargaOracion(0);
            setIsCargando(true);
          }}
          onEmptyPointerUp={() => setIsCargando(false)}
          onEmptyPointerMove={handleEmptyPointerMove}
          activePrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          soundEnabled={soundEnabled}
          guided={guided}
          isInLitany={isLitany}
        />
      </div>

      <div className="rosary-title-bar">
        <span className="rosary-title-bar__label" style={{ color: accentColor }}>
          {activePrayer?.title || 'Meditación'}
        </span>
        <span className="rosary-title-bar__step" style={{ color: `${accentColor}59` }}>
          {safeIndex + 1}/{secuencia.length}
        </span>
        {isLitany && litanyVerseTotal > 0 && (
          <span className="rosary-title-bar__step" style={{ color: 'rgba(212,175,55,0.3)' }}>
            {litanyVerseIndex + 1}/{litanyVerseTotal}
          </span>
        )}
        {isPerVersePrayer && prayerVerseTotal > 0 && (
          <span className="rosary-title-bar__step" style={{ color: 'rgba(212,175,55,0.3)' }}>
            v{prayerVerseIndex + 1}/{prayerVerseTotal}
          </span>
        )}
      </div>

      {showLitanyEntrance && litanyEntranceEnabled && (
        <LitanyEntrance
          currentMystery={misterioActual}
          onComplete={() => setShowLitanyEntrance(false)}
        />
      )}

      <div className={`rosary-chrome ${isLeftHanded ? 'rosary-chrome--left' : 'rosary-chrome--right'}`}>
        <div className="rosary-chrome__row">
          <button
            type="button"
            className="glass-chrome-btn"
            aria-label="Acomodar rosario"
            title="Acomodar rosario"
            onClick={() => {
              localStorage.setItem('rosaryZoom', '1');
              window.dispatchEvent(new CustomEvent('rosaryZoomChange', { detail: { zoom: 1 } }));
              window.dispatchEvent(new CustomEvent('resetRosaryPosition', { detail: { x: 0, y: 0 } }));
              window.dispatchEvent(new Event('resetRosaryLayout'));
            }}
          >
            ↺
          </button>
          <button
            type="button"
            className={`glass-chrome-btn${simpleMode ? ' glass-chrome-btn--active' : ' glass-chrome-btn--muted'}`}
            onClick={onToggleSimpleMode}
            title="Modo Simple"
          >
            👵
          </button>
          <button type="button" className="glass-chrome-btn" onClick={onShowRosedal}>
            🌹
          </button>
          <button
            type="button"
            className={`glass-chrome-btn${guided ? ' glass-chrome-btn--active' : ' glass-chrome-btn--muted'}`}
            onClick={() => setGuided((g) => !g)}
          >
            {guided ? 'Guiado' : 'Libre'}
          </button>
        </div>
        <span className="rosary-chrome__version">v{RELEASE_NOTES.version}</span>
      </div>

      {showHint && guided && (
        <div className="rosary-hint">
          <div className="rosary-hint__title">Rosario = cuentas</div>
          Mantén presionado para rezar • Desliza ← → para avanzar
          <br />
          <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
            Libro = texto · Rosa = meditación · ↺ para acomodar las cuentas
          </span>
        </div>
      )}
    </div>
  );
}
