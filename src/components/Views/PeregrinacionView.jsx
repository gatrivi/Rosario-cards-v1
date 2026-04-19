import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { PEREGRINACIONES, getPeregrinacionActual } from '../../data/LevelConfig';
import TutorialOverlay from '../common/TutorialOverlay';
import santaMariaImg from '../../data/assets/img/Theotokos.jpg';

export default function PeregrinacionView() {
  const { totalAveMarias } = useAveMariaStats();
  const { actual, next } = getPeregrinacionActual(totalAveMarias);

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px',
      backgroundColor: '#0A0A0A', color: '#E0E0E0', position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 5, right: 5 }}>
        <TutorialOverlay 
          title="El Camino" 
          imageSrc={santaMariaImg}
          text="«Quien reza se salva, quien no reza se condena.» — San Alfonso María de Ligorio&#10;&#10;Cada rosario que completas es un paso en tu peregrinación espiritual. Las devociones marianas son rutas seguras al cielo. Aquí podrás ver cómo tus rosas pavimentan rutas históricas, desde tu parroquia local, hasta el gran camino a Jerusalén."
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#D4AF37', margin: '0 0 8px' }}>El Camino</h2>
        <p style={{ color: '#888', margin: '0 0 4px', fontSize: '0.85rem' }}>
          Tus rosas pavimentan tu peregrinación.
        </p>
      </div>

      {next ? (
        <div style={{
          background: '#111', borderRadius: '12px', padding: '20px',
          border: '1px solid #222', marginBottom: '30px'
        }}>
          <h3 style={{ color: '#fff', margin: '0 0 5px' }}>Siguiente Destino: {next.name}</h3>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 15px' }}>{next.description}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#aaa', marginBottom: '8px' }}>
            <span>{totalAveMarias} rosas</span>
            <span>Meta: {next.reqAveMarias}</span>
          </div>
          <div style={{ height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, ((totalAveMarias - actual.reqAveMarias) / (next.reqAveMarias - actual.reqAveMarias)) * 100))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8C2832, #D4AF37)',
              borderRadius: '4px'
            }} />
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #2a0a0a)', borderRadius: '12px', padding: '20px',
          border: '1px solid #D4AF37', marginBottom: '30px', textAlign: 'center'
        }}>
          <h3 style={{ color: '#D4AF37', margin: '0 0 10px' }}>¡Llegaste a la Meta!</h3>
          <p style={{ color: '#ccc', margin: 0 }}>Has completado todas las peregrinaciones.</p>
        </div>
      )}

      <div>
        <h4 style={{ color: '#888', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '30px' }}>
          Mapa del Sendero
        </h4>
        <div style={{ position: 'relative', paddingLeft: '20px', paddingBottom: '50px' }}>
          {/* Base Trail Line */}
          <div style={{ position: 'absolute', left: '35px', top: '15px', bottom: '15px', width: '4px', background: '#222', borderRadius: '2px' }} />
          
          {/* Active Trail Line (Progress) */}
          <div style={{ 
             position: 'absolute', left: '35px', top: '15px', width: '4px', background: '#D4AF37', borderRadius: '2px',
             height: next ? `${(PEREGRINACIONES.findIndex(p => p.id === next.id) / PEREGRINACIONES.length) * 100}%` : '100%',
             transition: 'height 1s ease-in-out'
          }} />

          {PEREGRINACIONES.map((p, i) => {
            const isCompleted = totalAveMarias >= p.reqAveMarias;
            const isCurrent = next && next.id === p.id;
            
            // Calculate progress specifically for the current segment to position the monjita correctly
            let segmentProgress = 0;
            if (isCurrent) {
               const prevReq = i === 0 ? 0 : PEREGRINACIONES[i-1].reqAveMarias;
               segmentProgress = Math.max(0, Math.min(1, (totalAveMarias - prevReq) / (p.reqAveMarias - prevReq)));
            }
            
            return (
              <div key={p.id} style={{ 
                display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative',
                marginBottom: '40px', opacity: isCompleted || isCurrent ? 1 : 0.4
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '17px', flexShrink: 0,
                  background: isCompleted ? '#2a0a0a' : (isCurrent ? '#111' : '#0a0a0a'),
                  border: isCompleted ? '2px solid #D4AF37' : (isCurrent ? '2px solid #8C2832' : '2px solid #333'),
                  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2,
                  boxShadow: isCurrent ? '0 0 15px rgba(140, 40, 50, 0.4)' : 'none'
                }}>
                  {isCompleted ? '⛪' : (isCurrent ? '📍' : '🔒')}
                </div>
                
                {/* ─── THE MONJITA (Advancing Character) ─── */}
                {isCurrent && (
                  <div style={{
                    position: 'absolute', left: '-5px', 
                    top: `${segmentProgress * 100}%`,
                    transform: 'translateY(-50%)',
                    fontSize: '1.8rem', zIndex: 10,
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
                    transition: 'top 1s ease-out'
                  }}>
                    🧎‍♀️
                  </div>
                )}

                <div style={{ paddingTop: '5px' }}>
                  <div style={{ fontWeight: 'bold', color: isCompleted ? '#D4AF37' : '#fff', fontSize: '1.05rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>{p.description}</div>
                  <div style={{ fontSize: '0.75rem', color: '#D4AF37', marginTop: '6px', fontWeight: 'bold' }}>
                    {p.reqAveMarias} rosas
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
