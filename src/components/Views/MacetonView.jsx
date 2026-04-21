import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { PEREGRINACIONES, getPeregrinacionActual } from '../../data/LevelConfig';
import RoseDrawing from './RoseDrawing';

export default function MacetonView({ level, onBack, onSelectMaceton }) {
  const { totalAveMarias, ROSAS_PER_MACETON, getRoseData } = useAveMariaStats();
  
  // If no level passed, use the current active pilgrimage level
  const effectiveLevel = level || getPeregrinacionActual(totalAveMarias).actual;
  
  const roses = getRoseData();
  const enrichment = Math.min(1, Math.log10(totalAveMarias + 1) / 7.8);

  const totalNeeded = effectiveLevel.reqAveMarias;
  const potsInThisLevel = Math.ceil(totalNeeded / ROSAS_PER_MACETON);
  const completedAveMariasInThisLevel = Math.min(totalAveMarias, totalNeeded);
  const completedPots = Math.floor(completedAveMariasInThisLevel / ROSAS_PER_MACETON);
  const currentPotProgress = (completedAveMariasInThisLevel % ROSAS_PER_MACETON) / ROSAS_PER_MACETON;

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px',
      backgroundColor: '#0A0A0A', color: '#fff', display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={onBack}
          style={{ 
            background: '#111', border: '1px solid #333', color: '#fff', 
            borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer',
            fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          ←
        </button>
        <div>
          <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '1.1rem' }}>{effectiveLevel.name}</h2>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>
            {completedAveMariasInThisLevel} / {totalNeeded} rosas necesarias
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '6px', background: '#111', borderRadius: '3px', 
        marginBottom: '30px', overflow: 'hidden', border: '1px solid #222'
      }}>
        <div style={{ 
          width: `${(completedAveMariasInThisLevel / totalNeeded) * 100}%`, 
          height: '100%', background: 'linear-gradient(90deg, #8C2832, #D4AF37)',
          transition: 'width 1s ease'
        }} />
      </div>

      <p style={{ fontSize: '0.9rem', color: '#ccc', textAlign: 'center', marginBottom: '20px' }}>
        Elige un Macetón para cultivar tus rosas. <br/>
        Cada uno requiere un Rosario completo (50 Ave Marías).
      </p>

      {/* Pots Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
        gap: '15px', paddingBottom: '40px' 
      }}>
        {Array.from({ length: potsInThisLevel }).map((_, i) => {
          const isCompleted = i < completedPots;
          const isCurrent = i === completedPots;
          const isLocked = i > completedPots;

          return (
            <div 
              key={i} 
              onClick={isLocked ? null : onSelectMaceton}
              style={{
                background: isCompleted ? '#1a0a0a' : (isCurrent ? '#0d0d0d' : '#050505'),
                border: isCurrent ? '2px solid #D4AF37' : '1px solid #222',
                borderRadius: '12px', padding: '10px', textAlign: 'center',
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.3 : 1,
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: isCurrent ? '0 0 15px rgba(212,175,55,0.2)' : 'none'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                {isCompleted ? '🪴' : (isCurrent ? '🌱' : '🌑')}
              </div>
              <div style={{ fontSize: '0.6rem', color: isCurrent ? '#D4AF37' : '#666', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                Macetón {i + 1}
              </div>
              
              {isCurrent && (
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, 
                  height: '3px', background: '#333', borderRadius: '0 0 12px 12px', overflow: 'hidden' 
                }}>
                  <div style={{ 
                    width: `${currentPotProgress * 100}%`, height: '100%', background: '#D4AF37' 
                  }} />
                </div>
              )}
              
              {isCompleted && (
                <div style={{ position: 'absolute', top: -5, right: -5, fontSize: '0.8rem' }}>
                  ✅
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', padding: '10px', color: '#444', fontSize: '0.75rem' }}>
        "La paciencia es la raíz de todas las rosas."
      </div>
    </div>
  );
}
