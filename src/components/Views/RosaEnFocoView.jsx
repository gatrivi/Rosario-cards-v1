import React, { useState, useEffect, useRef, useMemo } from 'react';
import RoseDrawing from './RoseDrawing';
import SacredText from './SacredText';

const VERSOS_AVE_MARIA = [
  "Dios te salve, María;",
  "llena eres de gracia;",
  "el Señor es contigo;",
  "bendita tú eres entre todas las mujeres,",
  "y bendito es el fruto de tu vientre, Jesús.",
  "Santa María, Madre de Dios,",
  "ruega por nosotros pecadores,",
  "ahora",
  "y en la hora de nuestra muerte.",
  "Amén."
];

export default function RosaEnFocoView({ 
  misterioColor = "#D4AF37", 
  externalIsCargando = null,
  externalCarga = null,
  onComplete = null,
  simpleMode = false,
  seed = 123
}) {
  const [carga, setCarga] = useState(0);
  const [internalIsCargando, setInternalIsCargando] = useState(false);
  const [warmthTick, setWarmthTick] = useState(0);
  const timerRef = useRef(null);

  // Refs for SacredText
  const wordSpanRefs = useRef([]);
  const charReachedAtRef = useRef([]);
  const charDwellRef = useRef([]);

  const isCargando = externalIsCargando !== null ? externalIsCargando : internalIsCargando;
  const effectiveCarga = externalCarga != null ? Math.max(carga, externalCarga) : carga;
  const versoActualIndex = Math.min(Math.floor(effectiveCarga / 100), 9);
  const progresoVisual = effectiveCarga / 1000;

  const currentVerseText = VERSOS_AVE_MARIA[versoActualIndex];
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
  const charProgressIndex = Math.floor((effectiveCarga % 100) / 100 * totalChars);

  useEffect(() => {
    // Reset refs when verse changes
    charReachedAtRef.current = [];
    charDwellRef.current = [];
  }, [versoActualIndex]);

  useEffect(() => {
    if (isCargando && carga < 1000) {
      const tick = simpleMode ? 10 : 2.5;
      timerRef.current = setInterval(() => {
        setWarmthTick(t => t + 1);
        setCarga(prev => {
          if (prev >= 1000) {
            clearInterval(timerRef.current);
            return 1000;
          }
          if (Math.floor(prev) % 25 === 0 && navigator.vibrate) {
            navigator.vibrate(5);
          }
          return prev + tick; 
        });
      }, 30);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCargando, carga, simpleMode]);

  useEffect(() => {
    // Sync charReachedAtRef
    if (charProgressIndex >= 0) {
      const now = Date.now();
      for (let i = 0; i <= charProgressIndex; i++) {
        if (!charReachedAtRef.current[i]) charReachedAtRef.current[i] = now;
      }
    }
  }, [charProgressIndex]);

  useEffect(() => {
    if (carga >= 1000) {
      if (externalIsCargando === null) setInternalIsCargando(false);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      if (onComplete) onComplete();
      setTimeout(() => setCarga(0), 1500);
    }
  }, [carga, externalIsCargando, onComplete]);

  const iniciarCarga = (e) => {
    if (externalIsCargando !== null) return;
    e.preventDefault(); 
    if (carga < 1000) setInternalIsCargando(true);
  };

  const detenerCarga = () => {
    if (externalIsCargando !== null) return;
    setInternalIsCargando(false);
  };

  return (
    <div 
      onPointerDown={externalIsCargando === null ? iniciarCarga : null}
      onPointerUp={externalIsCargando === null ? detenerCarga : null}
      onPointerLeave={externalIsCargando === null ? detenerCarga : null}
      onContextMenu={(e) => e.preventDefault()}
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', flex: '0 0 auto', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Ave María • Mística Rosa
      </div>

      <div style={{ flex: '1 1 50%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{
           position: 'absolute',
           width: '280px', height: '280px', borderRadius: '50%',
           background: `radial-gradient(circle, ${misterioColor}22 0%, transparent 70%)`,
           opacity: isCargando ? 0.6 : 0.2, 
           transform: `scale(${1 + progresoVisual * 0.2})`,
           transition: 'opacity 0.5s ease, transform 0.5s ease',
           filter: 'blur(10px)'
        }} />

        <RoseDrawing 
          progress={progresoVisual}
          size={200}
          enrichment={progresoVisual}
          liveWarmth={isCargando ? 0.8 : 0.2}
          seed={seed}
        />
      </div>

      <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '0', width: '100%', textAlign: 'center', color: '#444', fontSize: simpleMode ? '1.5rem' : '1.1rem', opacity: 0.3, transition: 'opacity 0.3s' }}>
          {versoActualIndex > 0 && carga < 1000 ? VERSOS_AVE_MARIA[versoActualIndex - 1] : ''}
        </div>
        <div style={{ 
          zIndex: 10, 
          transition: 'transform 0.4s ease',
          transform: isCargando ? 'scale(1.02)' : 'scale(1)',
          filter: isCargando ? 'drop-shadow(0 0 15px rgba(212,175,55,0.2))' : 'none',
          color: '#D4AF37',
          fontSize: simpleMode ? '2.5rem' : 'clamp(1.4rem, 4vh, 2rem)', 
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          textShadow: '0 2px 15px rgba(0,0,0,0.9)',
          textAlign: 'center'
        }}>
          <SacredText 
            words={words}
            wordCharOffsets={wordCharOffsets}
            charProgressIndex={charProgressIndex}
            isVersoComplete={false} 
            isPrayerComplete={carga >= 1000}
            charReachedAtRef={charReachedAtRef}
            charDwellRef={charDwellRef}
            wordSpanRefs={wordSpanRefs}
            warmthTick={warmthTick}
            simpleMode={simpleMode}
          />
        </div>

        <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center', color: '#444', fontSize: simpleMode ? '1.5rem' : '1.1rem', opacity: 0.3, transition: 'opacity 0.3s' }}>
          {versoActualIndex < 9 ? VERSOS_AVE_MARIA[versoActualIndex + 1] : ''}
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#333', fontSize: '0.7rem', flex: '0 0 auto', paddingBottom: '10px', opacity: isCargando ? 0 : 0.5, transition: 'opacity 1s', letterSpacing: '1px' }}>
        {simpleMode ? 'MANTÉN PARA REZAR' : 'Mantenimiento del verso...'}
      </div>
    </div>
  );
}
