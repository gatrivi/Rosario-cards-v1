import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import VirtualRosaryPhysics from '../RosarioNube/VirtualRosaryPhysics';
import { getSequenceData } from './RoseView';
import RosaEnFocoView from './RosaEnFocoView';
import SacredDrawing from './SacredDrawing';
import SacredText from './SacredText';
import SacredDust from '../common/SacredDust';
import { SYMBOL_MAP } from '../../data/SacredSymbols';

export default function RosarioVirtualView({ 
  currentPrayerIndex, 
  misterioActual, 
  onUpdateProgreso, 
  soundEnabled, 
  isLeftHanded, 
  simpleMode = false,
  onShowStats,
  onShowRosedal,
  onToggleSimpleMode
}) {
  const [versoIndex, setVersoIndex] = useState(0);
  const [guided, setGuided] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [isCargando, setIsCargando] = useState(false);
  const [cargaOracion, setCargaOracion] = useState(0);
  const [warmthTick, setWarmthTick] = useState(0);
  const [showBloom, setShowBloom] = useState(false);
  const secuencia = useMemo(() => getSequenceData(misterioActual), [misterioActual]);

  const wordSpanRefs = useRef([]);
  const charReachedAtRef = useRef([]);
  const charDwellRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    setVersoIndex(0);
    setCargaOracion(0);
  }, [currentPrayerIndex]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdvance = useCallback(() => {
    setShowHint(false);
    const activePrayer = secuencia[currentPrayerIndex];
    if (activePrayer?.versos && versoIndex < activePrayer.versos.length - 1) {
      setVersoIndex(prev => prev + 1);
      setCargaOracion(0);
    } else if (currentPrayerIndex < secuencia.length - 1) {
      // TRIGGER BLOOM on full prayer completion
      setShowBloom(true);
      setTimeout(() => setShowBloom(false), 1200);
      onUpdateProgreso(currentPrayerIndex + 1);
    }
  }, [currentPrayerIndex, versoIndex, secuencia, onUpdateProgreso]);

  const activePrayer = secuencia[currentPrayerIndex];
  const isAveMaria = activePrayer?.id === 'A';
  const bgImage = activePrayer?.img || '/gallery-images/cathedral-painting.jpg';

  // Logic for non-AveMaria charging
  useEffect(() => {
    if (!isAveMaria && isCargando && cargaOracion < 100) {
      timerRef.current = setInterval(() => {
        setWarmthTick(t => t + 1);
        setCargaOracion(prev => {
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
  }, [isAveMaria, isCargando, cargaOracion]);

  useEffect(() => {
    if (!isAveMaria && cargaOracion >= 100) {
      if (navigator.vibrate) navigator.vibrate(20);
      handleAdvance();
    }
  }, [isAveMaria, cargaOracion, handleAdvance]);

  const currentVerseText = activePrayer?.versos?.[versoIndex] || '';
  const words = useMemo(() => currentVerseText.split(/\s+/).filter(w => w.length > 0), [currentVerseText]);
  const wordCharOffsets = useMemo(() => {
    let off = 0;
    return words.map(w => {
      const res = off;
      off += w.length;
      return res;
    });
  }, [words]);
  const totalChars = wordCharOffsets.length > 0 ? wordCharOffsets[wordCharOffsets.length - 1] + words[words.length - 1].length : 0;
  const charProgressIndex = Math.floor(cargaOracion / 100 * totalChars);

  useEffect(() => {
    if (charProgressIndex >= 0) {
      const now = Date.now();
      for (let i = 0; i <= charProgressIndex; i++) {
        if (!charReachedAtRef.current[i]) charReachedAtRef.current[i] = now;
      }
    }
  }, [charProgressIndex]);

  useEffect(() => {
    charReachedAtRef.current = [];
    charDwellRef.current = [];
  }, [versoIndex, currentPrayerIndex]);

  const handleRetreat = useCallback(() => {
    setShowHint(false);
    if (versoIndex > 0) {
      setVersoIndex(prev => prev - 1);
    } else if (currentPrayerIndex > 0) {
      onUpdateProgreso(currentPrayerIndex - 1);
    }
  }, [currentPrayerIndex, versoIndex, onUpdateProgreso]);

  const handleNodeClick = useCallback((index) => {
    onUpdateProgreso(index);
  }, [onUpdateProgreso]);

  const handleLinkClick = useCallback(() => {}, []);

  // Determine Symbol
  const prayerId = activePrayer?.id;
  let symbolKey = SYMBOL_MAP[prayerId] || 'cross';
  if (prayerId && prayerId.startsWith('M')) {
    const mPrefix = misterioActual.endsWith('os') ? misterioActual.slice(0, -2) : misterioActual;
    const mNum = prayerId.slice(2);
    symbolKey = `${mPrefix}_${mNum}`;
  }

  return (
    <div style={{
      height: '100%', position: 'relative', backgroundColor: '#050505', overflow: 'hidden',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 0.8s ease-in-out'
    }}>

      {/* ── Layer 1: Ambient Depth ── */}
      <SacredDust isCargando={isCargando} />

      {/* ── Layer 1.5: Bloom Effect ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: `radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 75%)`,
        opacity: showBloom ? 1 : 0,
        transition: showBloom ? 'none' : 'opacity 1s ease-out',
        pointerEvents: 'none',
        zIndex: 15
      }} />

      {/* ── Layer 2: Moment Layer (Rosa / Prayer Text) ── */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        {isAveMaria ? (
          <RosaEnFocoView 
            misterioColor="#D4AF37" 
            externalIsCargando={isCargando}
            onComplete={handleAdvance}
            simpleMode={simpleMode}
            seed={currentPrayerIndex}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
            <div style={{ 
              opacity: 0.7, 
              transform: isCargando ? 'scale(1.25)' : 'scale(1.2)',
              transition: 'transform 0.4s ease'
            }}>
              <SacredDrawing 
                symbolKey={symbolKey} 
                progress={cargaOracion / 100} 
                size={simpleMode ? 140 : 100}
                decadeIndex={currentPrayerIndex % 10}
                liveWarmth={isCargando ? 0.8 : 0.2}
              />
            </div>
            
            <div style={{
              zIndex: 10, 
              transition: 'transform 0.4s ease',
              transform: isCargando ? 'scale(1.02)' : 'scale(1)',
              filter: isCargando ? 'drop-shadow(0 0 15px rgba(212,175,55,0.2))' : 'none',
              maxWidth: '90%',
              color: '#D4AF37',
              fontSize: simpleMode ? 'clamp(1.8rem, 5vh, 2.8rem)' : 'clamp(1.3rem, 3.5vh, 1.8rem)',
              lineHeight: 1.6,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              textShadow: '0 2px 15px rgba(0,0,0,0.9)',
            }}>
              <SacredText 
                words={words}
                wordCharOffsets={wordCharOffsets}
                charProgressIndex={charProgressIndex}
                isVersoComplete={cargaOracion >= 100}
                isPrayerComplete={false}
                charReachedAtRef={charReachedAtRef}
                charDwellRef={charDwellRef}
                wordSpanRefs={wordSpanRefs}
                warmthTick={warmthTick}
                simpleMode={simpleMode}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Layer 3: Rosary — forefront, fully interactive */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 20
      }}>
        <VirtualRosaryPhysics
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onAdvance={simpleMode ? handleAdvance : (!isAveMaria ? handleAdvance : null)}
          onRetreat={handleRetreat}
          onSwipeAdvance={handleAdvance}
          onSwipeRetreat={handleRetreat}
          onEmptyPointerDown={() => setIsCargando(true)}
          onEmptyPointerUp={() => setIsCargando(false)}
          activePrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          soundEnabled={soundEnabled}
          isLeftHanded={isLeftHanded}
          guided={guided}
        />
      </div>


      {/* ── Floating chrome: title, verse indicator, mode toggle (z-index above rosary) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        <span style={{
          color: '#D4AF37', fontSize: '0.6rem', textTransform: 'uppercase',
          letterSpacing: '2px', fontWeight: 'bold', opacity: 0.8,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)'
        }}>
          {activePrayer?.title || 'Meditación'}
        </span>
        <span style={{ color: 'rgba(212,175,55,0.35)', fontSize: '0.55rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          {currentPrayerIndex + 1}/{secuencia.length}
        </span>
        {activePrayer?.versos?.length > 1 && (
          <span style={{ color: 'rgba(212,175,55,0.3)', fontSize: '0.5rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {versoIndex + 1}/{activePrayer.versos.length}
          </span>
        )}
      </div>

      {/* Mode toggle & Version - moved to bottom for accessibility */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: isLeftHanded ? 'auto' : '12px',
        left: isLeftHanded ? '12px' : 'auto',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLeftHanded ? 'flex-start' : 'flex-end',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <button
            onClick={onToggleSimpleMode}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: simpleMode ? '#D4AF37' : '#555',
              borderRadius: '10px',
              padding: '4px 8px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
            title="Modo Simple"
          >
            👵
          </button>
          <button
            onClick={onShowRosedal}
            style={{
              background: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#D4AF37',
              borderRadius: '10px',
              padding: '4px 8px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            🌹
          </button>
          <button
            onClick={onShowStats}
            style={{
              background: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#D4AF37',
              borderRadius: '10px',
              padding: '4px 8px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            📊
          </button>
          <button
            onClick={() => setGuided(g => !g)}
            style={{
              background: guided ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: guided ? '#D4AF37' : '#555',
              borderRadius: '10px',
              padding: '4px 10px',
              fontSize: '0.6rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)'
            }}
          >
            {guided ? 'Guiado' : 'Libre'}
          </button>
        </div>
        <span style={{ 
          fontSize: '0.45rem', 
          color: 'rgba(212, 175, 55, 0.4)', 
          letterSpacing: '1px',
          fontWeight: 'bold'
        }}>
          v0.3.10 — La Rosa Trascendente
        </span>
      </div>

      {/* Hint overlay */}
      {showHint && guided && (
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(212,175,55,0.15)',
          color: '#ccc',
          fontSize: '0.85rem',
          textAlign: 'center',
          animation: 'fadeOut 0.5s ease 7s forwards',
          pointerEvents: 'none'
        }}>
          <div style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Modo Guiado
          </div>
          Mantén presionado para rezar • Desliza ← → para avanzar<br />
          <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>Dibuja ✝ para reunir las cuentas</span>
        </div>
      )}

      <style>{`
        @keyframes textFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
