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
          position: 'absolute', bottom: '100px', left: '20px', right: '20px',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          borderRadius: '15px', padding: '15px', border: '1px solid #333',
          textAlign: 'center', pointerEvents: 'none', transition: 'all 0.4s',
          animation: 'subtitle-entry 0.6s cubic-bezier(0.23, 1, 0.32, 1) both'
        }}
      >
        <div style={{ color: '#D4AF37', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '5px' }}>
          {activePrayer?.title || 'Meditación'}
        </div>
        <div style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.4', fontWeight: 'serif' }}>
          {activePrayer?.text?.split('\n')[0] || 'Toca una cuenta para comenzar...'}
        </div>
        {activePrayer?.text?.split('\n').length > 1 && (
          <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '5px' }}>
            ...
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
