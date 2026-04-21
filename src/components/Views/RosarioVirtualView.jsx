import React, { useState } from 'react';
import VirtualRosaryPhysics from '../RosarioNube/VirtualRosaryPhysics';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import { getSequenceData } from '../Views/RezoEnFocoView';

export default function RosarioVirtualView({ currentPrayerIndex, misterioActual, onUpdateProgreso, soundEnabled }) {
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const secuencia = getSequenceData(misterioActual);

  const handleNodeClick = (index) => {
    // When a bead is clicked in the physics view, update the global prayer index
    if (typeof index === 'number') {
      onUpdateProgreso(index);
    }
  };

  const handleLinkClick = (linkData) => {
    // Links in this view are currently just visual or for future expansions
  };

  // The focused prayer text based on global index
  const activePrayer = secuencia[currentPrayerIndex];

  return (
    <div style={{ height: '100%', position: 'relative', backgroundColor: '#050505', overflow: 'hidden' }}>
      
      {/* Physics Engine Container */}
      <VirtualRosaryPhysics 
        onNodeClick={handleNodeClick} 
        onLinkClick={handleLinkClick}
        activePrayerIndex={currentPrayerIndex}
        misterioActual={misterioActual}
        soundEnabled={soundEnabled}
      />

      {/* Floating Subtitle (Karaoke-lite) */}
      <div 
        key={currentPrayerIndex}
        style={{
          position: 'absolute', bottom: '110px', left: '30px', right: '30px',
          background: 'rgba(15, 15, 15, 0.85)', backdropFilter: 'blur(12px)',
          borderRadius: '20px', padding: '20px', border: '1px solid rgba(212, 175, 55, 0.3)',
          textAlign: 'center', pointerEvents: 'none', transition: 'all 0.5s',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          animation: 'subtitle-entry 0.7s cubic-bezier(0.23, 1, 0.32, 1) both'
        }}
      >
        <div style={{ 
          color: '#D4AF37', fontSize: '0.75rem', textTransform: 'uppercase', 
          marginBottom: '8px', letterSpacing: '2px', fontWeight: 'bold',
          textShadow: '0 0 10px rgba(212, 175, 55, 0.4)'
        }}>
          {activePrayer?.title || 'Meditación'}
        </div>
        <div style={{ 
          color: '#E0E0E0', fontSize: '1.1rem', lineHeight: '1.5', 
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic'
        }}>
          {activePrayer?.text?.split('\n')[0] || 'Toca una cuenta para comenzar...'}
        </div>
        {activePrayer?.text?.split('\n').length > 1 && (
          <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '8px', opacity: 0.6 }}>
            •••
          </div>
        )}
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
