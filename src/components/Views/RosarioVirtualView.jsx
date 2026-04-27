import React, { useState, useCallback, useMemo } from 'react';
import VirtualRosaryPhysics from '../RosarioNube/VirtualRosaryPhysics';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { getSequenceData } from './RoseView';

export default function RosarioVirtualView({ currentPrayerIndex, misterioActual, onUpdateProgreso, soundEnabled, isLeftHanded }) {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const secuencia = useMemo(() => getSequenceData(misterioActual), [misterioActual]);

  const handleNodeClick = useCallback((index) => {
    // When a bead is clicked in the physics view, update the global prayer index
    if (typeof index === 'number') {
      setSelectedPrayer(index);
      onUpdateProgreso(index);
    }
  }, [onUpdateProgreso]);

  const handleLinkClick = useCallback((linkData) => {
    // Links in this view are currently just visual or for future expansions
  }, []);

  // The focused prayer text based on global index
  const activePrayer = secuencia[currentPrayerIndex];

  // Dynamic Background
  const bgImage = activePrayer?.img || '/gallery-images/cathedral-painting.jpg';

  return (
    <div style={{ 
      height: '100%', position: 'relative', backgroundColor: '#050505', overflow: 'hidden',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 0.8s ease-in-out'
    }}>
      
      {/* Physics Engine Container - Higher Z-index to float in front, but captures events */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 40,
        opacity: selectedPrayer !== null ? 0.25 : 0.6, // Drop opacity when a bead is selected
        transition: 'opacity 1s ease-in-out',
        pointerEvents: 'auto' // Capture drags
      }}>
        <VirtualRosaryPhysics 
          onNodeClick={handleNodeClick} 
          onLinkClick={handleLinkClick}
          activePrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          soundEnabled={soundEnabled}
          isLeftHanded={isLeftHanded}
        />
      </div>

      {/* Floating Subtitle (Prayer Card) - Glassmorphism & Lower Z-index */}
      <div 
        key={currentPrayerIndex}
        style={{
          position: 'absolute', bottom: '110px', 
          zIndex: 30, // Floats behind the rosary but is readable due to rosary transparency
          [isLeftHanded ? 'left' : 'right']: '20px',
          width: '85%', maxWidth: '400px',
          background: 'rgba(0, 0, 0, 0.4)', // Glassmorphism base
          backdropFilter: 'blur(8px)', // Glassmorphism blur
          borderRadius: '24px', padding: '24px', border: '1px solid rgba(212, 175, 55, 0.2)',
          textAlign: isLeftHanded ? 'left' : 'right', 
          pointerEvents: 'none', 
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'subtitle-entry 0.8s cubic-bezier(0.23, 1, 0.32, 1) both'
        }}
      >
        <div style={{ 
          color: '#D4AF37', fontSize: '0.7rem', textTransform: 'uppercase', 
          marginBottom: '10px', letterSpacing: '3px', fontWeight: 'bold',
          opacity: 0.8, textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
        }}>
          {activePrayer?.title || 'Meditación'}
        </div>
        
        <div style={{ 
          color: '#F0F0F0', fontSize: '1.15rem', lineHeight: '1.6', 
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {activePrayer?.versos?.[0] || 'Toca una cuenta para comenzar...'}
        </div>

        {activePrayer?.versos?.length > 1 && (
          <div style={{ 
            color: '#888', fontSize: '0.9rem', marginTop: '10px', 
            opacity: 0.6, fontFamily: "'Playfair Display', serif" 
          }}>
            {activePrayer.versos[1]}...
          </div>
        )}

        <div style={{
          marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '4px'
        }}>
          {activePrayer?.versos?.map((_, i) => (
            <div key={i} style={{ 
              width: i === 0 ? '12px' : '4px', height: '4px', 
              borderRadius: '2px', background: i === 0 ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)' 
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes subtitle-entry {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Hint */}
      <div style={{
        position: 'absolute', top: '20px', width: '100%', textAlign: 'center',
        padding: '0 20px', opacity: 0.6, pointerEvents: 'none'
      }}>
        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
          Desliza para mover el rosario. Toca una cuenta para rezar.
        </p>
      </div>

    </div>
  );
}
