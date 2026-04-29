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

  return (
    <div style={{
      height: '100%', position: 'relative', backgroundColor: '#050505', overflow: 'hidden',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 0.8s ease-in-out'
    }}>

      {/* ── Layer 1: Background image (implicit, set on parent) */}

      {/* ── Layer 2: Prayer text — middle z-index, visible through and around the rosary */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div
          key={currentPrayerIndex + '-' + versoIndex}
          style={{
            color: 'rgba(240, 240, 240, 0.55)',
            fontSize: 'clamp(1.3rem, 3.2vh, 1.9rem)',
            lineHeight: 1.65,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: '85%',
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            padding: '30px',
            animation: 'textFade 0.6s cubic-bezier(0.23, 1, 0.32, 1) both'
          }}
        >
          {activePrayer?.versos?.[versoIndex] || 'Toca para comenzar...'}
        </div>
      </div>

      {/* ── Layer 3: Rosary — forefront, fully interactive */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 20
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

      {/* Mode toggle */}
      <button
        onClick={() => setGuided(g => !g)}
        style={{
          position: 'absolute',
          top: '12px',
          right: isLeftHanded ? 'auto' : '12px',
          left: isLeftHanded ? '12px' : 'auto',
          zIndex: 25,
          pointerEvents: 'auto',
          background: guided ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,175,55,0.2)',
          color: guided ? '#D4AF37' : '#555',
          borderRadius: '10px',
          padding: '3px 8px',
          fontSize: '0.55rem',
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
          Toca en cualquier lugar o desliza ← → para avanzar<br />
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
