import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import RosaryAdapter from '../RosarioNube/RosaryAdapter';
import SacredDust from '../common/SacredDust';
import VitralBackground from '../common/VitralBackground';
import BookletPrayerPanel from './BookletPrayerPanel';
import { buildSequence } from '../../utils/bookletSequence';
import { resolveDisplayText, loadSavedVariantId } from '../../utils/bookletDisplayText';
import {
  pickPrayerImage,
  getLitanyVerseImageCandidates,
  resolveLitanyVerseImage,
} from '../../utils/prayerImages';
import { getLitanyVerse, isLitanyPrayer } from '../../utils/litanyHelpers';
import { getBookletStepContext, stepContextToVitralVars, makeBookletRoseFingerprint } from '../../utils/bookletProgress';
import { getAveMariaRunInfo } from './BookletView';
import { getMysteryColors } from '../RosarioNube/utils/mysteryColors';
import './BookletView.css';
import './RosarioVirtualView.css';

export default function RosarioVirtualView({
  currentPrayerIndex,
  misterioActual,
  onUpdateProgreso,
  soundEnabled,
  isLeftHanded,
  simpleMode = false,
  onShowStats,
  onShowRosedal,
  onToggleSimpleMode,
  onAveMariaComplete,
}) {
  const [litanyVerseIndex, setLitanyVerseIndex] = useState(0);
  const [guided, setGuided] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isCargando, setIsCargando] = useState(false);
  const [cargaOracion, setCargaOracion] = useState(0);
  const [showBloom, setShowBloom] = useState(false);
  const timerRef = useRef(null);

  const mysteryColors = useMemo(() => getMysteryColors(misterioActual), [misterioActual]);
  const accentColor = mysteryColors.highlight;
  const secuencia = useMemo(() => buildSequence(misterioActual), [misterioActual]);
  const total = secuencia.length;
  const safeIndex = Math.min(
    Math.max(currentPrayerIndex, 0),
    Math.max(total - 1, 0)
  );

  const activePrayer = secuencia[safeIndex];
  const isLitany = isLitanyPrayer(activePrayer);
  const litanyVerse = isLitany ? getLitanyVerse(litanyVerseIndex) : null;
  const litanyVerseTotal = activePrayer?.verses?.length || 0;

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
  const displayText = useMemo(
    () => resolveDisplayText(activePrayer, variantId),
    [activePrayer, variantId]
  );

  const vitralCandidates = useMemo(() => {
    if (!activePrayer) return ['/gallery-images/cathedral.jpg'];
    if (isLitany && litanyVerse) {
      const all = getLitanyVerseImageCandidates(litanyVerse, activePrayer);
      const picked = resolveLitanyVerseImage(litanyVerse, activePrayer, litanyVerseIndex);
      return [picked, ...all.filter((u) => u !== picked)];
    }
    const all = activePrayer.imgCandidates?.length
      ? activePrayer.imgCandidates
      : [activePrayer.img];
    const picked = pickPrayerImage(all, safeIndex);
    return [picked, ...all.filter((u) => u !== picked)];
  }, [activePrayer, safeIndex, isLitany, litanyVerse, litanyVerseIndex]);

  useEffect(() => {
    console.log('📿 RosarioVirtualView mount/update', {
      misterioActual,
      currentPrayerIndex,
      safeIndex,
      total,
      prayerId: activePrayer?.id,
      title: activePrayer?.title,
    });
  }, [misterioActual, currentPrayerIndex, safeIndex, total, activePrayer?.id, activePrayer?.title]);

  useEffect(() => {
    const preview = displayText ? `${displayText.slice(0, 48)}…` : '(empty)';
    console.log('📖 Rosario prayer panel', {
      variant: 'rosary',
      prayerId: activePrayer?.id,
      displayTextLen: displayText?.length ?? 0,
      preview,
      variantId,
      isLitany,
      litanyVerseIndex,
      willRenderPanel: Boolean(activePrayer),
    });
    if (!displayText?.length && activePrayer) {
      console.warn('⚠️ Rosario displayText empty for', activePrayer.id, activePrayer.title);
    }
  }, [activePrayer, displayText, variantId, isLitany, litanyVerseIndex]);

  useEffect(() => {
    console.log('🖼️ Rosario vitral', {
      kind: vitralKind,
      candidate: vitralCandidates[0],
      candidateCount: vitralCandidates.length,
    });
  }, [vitralKind, vitralCandidates]);

  useEffect(() => {
    setLitanyVerseIndex(0);
  }, [currentPrayerIndex]);

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
    if (currentPrayerIndex < secuencia.length - 1) {
      if (prayer?.id === 'A') {
        const fp = makeBookletRoseFingerprint(
          getAveMariaRunInfo(secuencia, currentPrayerIndex),
          getBookletStepContext(secuencia, currentPrayerIndex, total).mysteryDecade
        );
        onAveMariaComplete?.(fp);
      }
      setShowBloom(true);
      setTimeout(() => setShowBloom(false), 1200);
      onUpdateProgreso(currentPrayerIndex + 1);
      setCargaOracion(100);
    }
  }, [currentPrayerIndex, litanyVerseIndex, litanyVerseTotal, secuencia, total, onUpdateProgreso, onAveMariaComplete]);

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
      window.dispatchEvent(
        new CustomEvent('contentExhausted', { detail: { prayerIndex: currentPrayerIndex } })
      );
    };

    const onContentExhausted = (event) => {
      const { prayerIndex } = event.detail || {};
      if (prayerIndex === currentPrayerIndex) handleAdvance();
    };

    const onHeartBead = () => {
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
  }, [currentPrayerIndex, litanyVerseIndex, litanyVerseTotal, secuencia, handleAdvance, onUpdateProgreso]);

  const handleRetreat = useCallback(() => {
    setShowHint(false);
    if (isLitany && litanyVerseIndex > 0) {
      setLitanyVerseIndex((v) => v - 1);
      return;
    }
    if (currentPrayerIndex > 0) {
      onUpdateProgreso(currentPrayerIndex - 1);
    }
  }, [currentPrayerIndex, litanyVerseIndex, isLitany, onUpdateProgreso]);

  const handleEmptyPointerMove = useCallback(() => {
    if (!guided) return;
    setIsCargando(false);
    setCargaOracion(0);
  }, [guided]);

  const revealPrayer = useCallback((index) => {
    console.log('✨ Rosario revealPrayer', { index, prayerId: secuencia[index]?.id });
    setShowHint(false);
    setLitanyVerseIndex(0);
    setCargaOracion(100);
    setIsCargando(false);
    onUpdateProgreso(index);
  }, [onUpdateProgreso]);

  const handleNodeClick = useCallback((index) => {
    revealPrayer(index);
  }, [revealPrayer]);

  const handleBeadHoldStart = useCallback((index) => {
    console.log('🙏 Rosario bead hold start', { index, prayerId: secuencia[index]?.id });
    revealPrayer(index);
  }, [revealPrayer, secuencia]);

  const handleBeadHoldEnd = useCallback(() => {}, []);

  return (
    <div
      className={`rosary-view-root${simpleMode ? ' rosary-view-root--simple' : ''}`}
      style={{ ...vitralStyle, '--rosary-accent': accentColor }}
    >
      <VitralBackground
        key={`${activePrayer?.id}-${litanyVerseIndex}-${vitralCandidates[0]}`}
        candidates={vitralCandidates}
        kind={vitralKind}
        variant="rosary"
        stepGlow={showBloom}
      />

      <SacredDust isCargando={isCargando} />

      <div className={`rosary-bloom${showBloom ? ' rosary-bloom--active' : ' rosary-bloom--idle'}`} />

      {activePrayer && (
        <div className="rosary-prayer-layer-wrap">
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
          />
        </div>
      )}

      <div className="rosary-canvas-layer">
        <RosaryAdapter
          onNodeClick={handleNodeClick}
          onBeadHoldStart={handleBeadHoldStart}
          onBeadHoldEnd={handleBeadHoldEnd}
          onAdvance={handleAdvance}
          onRetreat={handleRetreat}
          onSwipeAdvance={handleAdvance}
          onSwipeRetreat={handleRetreat}
          onEmptyPointerDown={() => {
            if (!guided) return;
            setIsCargando(true);
          }}
          onEmptyPointerUp={() => setIsCargando(false)}
          onEmptyPointerMove={handleEmptyPointerMove}
          activePrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          soundEnabled={soundEnabled}
          guided={guided}
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
      </div>

      <div className={`rosary-chrome ${isLeftHanded ? 'rosary-chrome--left' : 'rosary-chrome--right'}`}>
        <div className="rosary-chrome__row">
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
          <button type="button" className="glass-chrome-btn" onClick={onShowStats}>
            📊
          </button>
          <button
            type="button"
            className={`glass-chrome-btn${guided ? ' glass-chrome-btn--active' : ' glass-chrome-btn--muted'}`}
            onClick={() => setGuided((g) => !g)}
          >
            {guided ? 'Guiado' : 'Libre'}
          </button>
        </div>
        <span className="rosary-chrome__version">v0.3.35 — El Cosmos Resonante</span>
      </div>

      {showHint && guided && (
        <div className="rosary-hint">
          <div className="rosary-hint__title">Modo Guiado</div>
          Mantén presionado para rezar • Desliza ← → para avanzar
          <br />
          <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>Dibuja ✝ para reunir las cuentas</span>
        </div>
      )}
    </div>
  );
}
