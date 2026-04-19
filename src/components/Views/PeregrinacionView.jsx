import React, { useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { PEREGRINACIONES, getPeregrinacionActual } from '../../data/LevelConfig';
import TutorialOverlay from '../common/TutorialOverlay';
import santaMariaImg from '../../data/assets/img/Theotokos.jpg';

export default function PeregrinacionView() {
  const { totalAveMarias } = useAveMariaStats();
  const { actual, next } = getPeregrinacionActual(totalAveMarias);
  const [selectedPin, setSelectedPin] = useState(null);

  // Determine global progress across all peregrinaciones
  const totalSteps = PEREGRINACIONES.length;
  const currentStepIndex = next ? PEREGRINACIONES.findIndex(p => p.id === next.id) : totalSteps;

  return (
    <div style={{
      height: '100%', overflow: 'hidden', padding: '15px',
      backgroundColor: '#0A0A0A', color: '#E0E0E0', position: 'relative',
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ position: 'absolute', top: 5, right: 5, zIndex: 100 }}>
        <TutorialOverlay 
          title="El Camino" 
          imageSrc={santaMariaImg}
          text="«Quien reza se salva, quien no reza se condena.» — San Alfonso María de Ligorio&#10;&#10;Sigue tu progreso histórico. Cada nodo representa una meta de oración. Toca las iglesias para ver los detalles de tu destino."
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ color: '#D4AF37', margin: '0 0 4px', fontSize: '1.2rem' }}>El Camino</h2>
        <div style={{ fontSize: '0.8rem', color: '#888' }}>
          {totalAveMarias} rosas cultivadas
        </div>
      </div>

      {/* COMPACT PROGRESS SUMMARY */}
      <div style={{ 
        background: '#111', borderRadius: '8px', padding: '10px', 
        border: '1px solid #222', marginBottom: '15px', fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>
            {next ? `Hacia: ${next.name}` : '¡Peregrinación Completada!'}
          </span>
          <span style={{ color: '#666' }}>{next ? `${next.reqAveMarias} rosas` : ''}</span>
        </div>
        <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, ((totalAveMarias - actual.reqAveMarias) / (next ? (next.reqAveMarias - actual.reqAveMarias) : 1)) * 100))}%`,
            height: '100%', background: 'linear-gradient(90deg, #8C2832, #D4AF37)',
            borderRadius: '2px', transition: 'width 1s ease'
          }} />
        </div>
      </div>

      {/* SNAKE MAP AREA */}
      <div style={{ 
        flex: 1, position: 'relative', background: '#050505', 
        borderRadius: '12px', border: '1px solid #111', overflow: 'hidden',
        padding: '20px 10px'
      }}>
        {/* Serpentine Line SVG (visual only) */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.1 }}>
          <path 
            d="M 50,350 C 150,350 250,300 250,250 C 250,200 150,150 150,100 C 150,50 250,50 250,0" 
            fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="5,5" 
          />
        </svg>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gridTemplateRows: 'repeat(4, 1fr)',
          height: '100%', width: '100%', gap: '10px'
        }}>
          {PEREGRINACIONES.map((p, i) => {
            const isCompleted = totalAveMarias >= p.reqAveMarias;
            const isCurrent = next && next.id === p.id;
            
            // Grid positioning (serpentine logic for 3 columns)
            // Row 0: 0 1 2 (right)
            // Row 1: 5 4 3 (left)
            // Row 2: 6 7 8 (right)
            // Row 3: 11 10 9 (left)
            const row = Math.floor(i / 3);
            const colInRow = i % 3;
            const col = (row % 2 === 0) ? colInRow : (2 - colInRow);
            
            return (
              <div key={p.id} 
                onClick={() => setSelectedPin(p)}
                style={{
                  gridRow: 4 - row, gridColumn: col + 1,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  cursor: 'pointer', position: 'relative', transition: 'transform 0.2s',
                  zIndex: isCurrent ? 10 : 1
                }}
              >
                <div style={{
                  width: isCurrent ? '44px' : '36px',
                  height: isCurrent ? '44px' : '36px',
                  borderRadius: '22px',
                  background: isCompleted ? '#2a0a0a' : (isCurrent ? '#1a0a0a' : '#050505'),
                  border: isCompleted ? '2px solid #D4AF37' : (isCurrent ? '2.5px solid #8C2832' : '1px solid #222'),
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  boxShadow: isCurrent ? '0 0 15px rgba(212,175,55,0.4)' : 'none',
                  fontSize: isCurrent ? '1.4rem' : '1.1rem',
                  transition: 'all 0.3s'
                }}>
                  {isCompleted ? '⛪' : (isCurrent ? '📍' : '🔒')}
                  
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px black)',
                      animation: 'float 2s infinite ease-in-out'
                    }}>
                      🧎‍♀️
                    </div>
                  )}
                </div>
                <div style={{ 
                  fontSize: '0.6rem', color: isCurrent ? '#D4AF37' : '#666', 
                  marginTop: '4px', textAlign: 'center', fontWeight: isCurrent ? 'bold' : 'normal',
                  maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                }}>
                  {p.name}
                </div>

                {isCurrent && (
                  <div style={{
                    position: 'absolute', bottom: '-8px', width: '60%', height: '2px', 
                    background: '#8C2832', borderRadius: '1px'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* POPOVER DETAIL */}
      {selectedPin && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }} onClick={() => setSelectedPin(null)}>
          <div style={{
            background: '#111', border: '1px solid #D4AF37', borderRadius: '15px',
            padding: '20px', maxWidth: '300px', textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
              {totalAveMarias >= selectedPin.reqAveMarias ? '⛪' : '📍'}
            </div>
            <h3 style={{ color: '#D4AF37', margin: '0 0 10px' }}>{selectedPin.name}</h3>
            <p style={{ color: '#bbb', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 15px' }}>
              {selectedPin.description}
            </p>
            <div style={{ color: '#888', fontSize: '0.8rem', borderTop: '1px solid #222', paddingTop: '10px' }}>
              Meta: {selectedPin.reqAveMarias} rosas
            </div>
            <button 
              onClick={() => setSelectedPin(null)}
              style={{
                marginTop: '15px', padding: '8px 20px', background: 'transparent',
                border: '1px solid #444', color: '#fff', borderRadius: '20px', cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -8px); }
        }
      `}</style>
    </div>
  );
}
