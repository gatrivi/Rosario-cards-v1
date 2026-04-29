import React, { useState, useCallback, useMemo, useEffect } from 'react';
import VirtualRosaryPhysics from '../RosarioNube/VirtualRosaryPhysics';
import { getSequenceData } from './RoseView';

export default function RosarioVirtualView({ currentPrayerIndex, misterioActual, onUpdateProgreso, soundEnabled, isLeftHanded }) {
  const [versoIndex, setVersoIndex] = useState(0);
  const [guided, setGuided] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const secuencia = useMemo(() => getSequenceData(misterioActual), [misterioActual]);

  useEffect(() => {
    setVersoIndex(0);
  }, [currentPrayerIndex]);

  // Hide hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdvance = useCallback(() => {
    setShowHint(false);
    const activePrayer = secuencia[currentPrayerIndex];
    if (activePrayer?.versos && versoIndex < activePrayer.versos.length - 1) {
      setVersoIndex(prev => prev + 1);
    } else if (currentPrayerIndex < secuencia.length - 1) {
      onUpdateProgreso(currentPrayerIndex + 1);
    }
  }, [currentPrayerIndex, versoIndex, secuencia, onUpdateProgreso]);

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

  const activePrayer = secuencia[currentPrayerIndex];
  const bgImage = activePrayer?.img || '/gallery-images/cathedral-painting.jpg';
  const hasNextVerso = activePrayer?.versos && versoIndex < activePrayer.versos.length - 1;
  const hasPrev = versoIndex > 0 || currentPrayerIndex > 0;
  const hasNext = hasNextVerso || currentPrayerIndex < secuencia.length - 1;

  return (
    <div style={{
      height: '100%', position: 'relative', backgroundColor: '#050505', overflow: 'hidden',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 0.8s ease-in-out'
    }}>

      {/* Physics Engine */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 10,
        opacity: guided ? 0.55 : 0.75,
        transition: 'opacity 0.5s ease'
      }}>
        <VirtualRosaryPhysics
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onAdvance={handleAdvance}
          onRetreat={handleRetreat}
          activePrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          soundEnabled={soundEnabled}
          isLeftHanded={isLeftHanded}
          guided={guided}
        />
      </div>

      {/* Prayer Card */}
      <div
        key={currentPrayerIndex + '-' + versoIndex}
        style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '520px',
          background: 'rgba(10, 10, 12, 0.75)',
          backdropFilter: 'blur(16px) saturate(150%)',
          borderRadius: '20px',
          padding: '22px',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          zIndex: 20,
          animation: 'cardEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) both',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header row: title + mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{
            color: '#D4AF37', fontSize: '0.7rem', textTransform: 'uppercase',
            letterSpacing: '3px', fontWeight: 'bold', opacity: 0.9
          }}>
            {activePrayer?.title || 'Meditación'} · {currentPrayerIndex + 1}/{secuencia.length}
          </span>
          <button
            onClick={() => setGuided(g => !g)}
            style={{
              background: guided ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: guided ? '#D4AF37' : '#888',
              borderRadius: '12px',
              padding: '4px 10px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {guided ? 'Guiado' : 'Libre'}
          </button>
        </div>

        {/* Prayer text */}
        <div style={{
          color: '#F0F0F0',
          fontSize: 'clamp(1.1rem, 2.8vh, 1.4rem)',
          lineHeight: 1.55,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          textShadow: '0 2px 6px rgba(0,0,0,0.6)',
          whiteSpace: 'pre-line',
          minHeight: '80px',
          textAlign: 'center'
        }}>
          {activePrayer?.versos?.[versoIndex] || 'Toca para comenzar...'}
        </div>

        {/* Verse dots */}
        {activePrayer?.versos?.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '14px', flexWrap: 'wrap'
          }}>
            {activePrayer.versos.map((_, i) => (
              <button
                key={i}
                onClick={() => setVersoIndex(i)}
                style={{
                  width: i === versoIndex ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === versoIndex ? '#D4AF37' : 'rgba(212, 175, 55, 0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
              />
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          gap: '10px'
        }}>
          <button
            onClick={handleRetreat}
            disabled={!hasPrev}
            style={{
              flex: 1,
              padding: '10px',
              background: hasPrev ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: hasPrev ? '#ccc' : '#444',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              cursor: hasPrev ? 'pointer' : 'default',
              transition: 'all 0.2s',
              opacity: hasPrev ? 1 : 0.4
            }}
          >
            ← Anterior
          </button>

          <button
            onClick={handleAdvance}
            disabled={!hasNext}
            style={{
              flex: 2,
              padding: '10px',
              background: hasNext ? 'rgba(212, 175, 55, 0.9)' : 'rgba(212,175,55,0.2)',
              border: 'none',
              borderRadius: '12px',
              color: hasNext ? '#000' : '#666',
              fontWeight: '900',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: hasNext ? 'pointer' : 'default',
              transition: 'all 0.2s',
              boxShadow: hasNext ? '0 4px 16px rgba(212,175,55,0.3)' : 'none'
            }}
          >
            {hasNextVerso ? 'Siguiente Verso →' : hasNext ? 'Siguiente Oración →' : 'Completado ✓'}
          </button>
        </div>
      </div>

      {/* Hint overlay */}
      {showHint && guided && (
        <div style={{
          position: 'absolute',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(212,175,55,0.2)',
          color: '#ccc',
          fontSize: '0.85rem',
          textAlign: 'center',
          animation: 'fadeOut 0.5s ease 7s forwards',
          pointerEvents: 'none'
        }}>
          <div style={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Modo Guiado
          </div>
          Toca en cualquier lugar o desliza ← → para avanzar<br />
          <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>Cambia a "Libre" para jugar con las cuentas</span>
        </div>
      )}

      <style>{`
        @keyframes cardEntry {
          from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
