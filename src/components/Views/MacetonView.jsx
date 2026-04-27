import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import RoseDrawing from './RoseDrawing';

export default function MacetonView({ onSelectMaceton }) {
  const { 
    dailyAveMarias, objetivoMacetonesHoy, ROSAS_PER_MACETON, getRoseData, totalAveMarias
  } = useAveMariaStats();

  const allRoses = getRoseData();
  const enrichment = Math.min(1, Math.log10(totalAveMarias + 1) / 7.8);

  // Filter roses for today? Actually, for simplicity and UX, we can just show 
  // the latest N roses that correspond to today's progress.
  const todayRoses = allRoses.slice(-dailyAveMarias);

  const pots = [];
  for (let i = 0; i < objetivoMacetonesHoy; i++) {
    const startIdx = i * ROSAS_PER_MACETON;
    const potContent = todayRoses.slice(startIdx, startIdx + ROSAS_PER_MACETON);
    // Fill with nulls to show ghost cells
    const displayPot = [...potContent, ...Array(ROSAS_PER_MACETON - potContent.length).fill(null)];
    pots.push({
      index: i,
      roses: displayPot,
      count: potContent.length,
      isCompleted: potContent.length === ROSAS_PER_MACETON,
      isActive: i === Math.floor(dailyAveMarias / ROSAS_PER_MACETON)
    });
  }

  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px',
      backgroundColor: '#0A0A0A', color: '#fff', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '10px' }}>
        <h2 style={{ color: '#D4AF37', margin: '0 0 5px', fontSize: '1.4rem', fontFamily: 'serif' }}>El Rosedal Diario</h2>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>
          Hoy: <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{Math.floor(dailyAveMarias / 50)} / {objetivoMacetonesHoy}</span> Rosarios cultivados
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isPortrait ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: isPortrait ? '500px' : 'none',
        margin: '0 auto',
        paddingBottom: '40px',
        width: '100%'
      }}>
        {pots.map((pot) => (
          <div 
            key={pot.index}
            onClick={pot.isCompleted ? null : onSelectMaceton}
            style={{
              background: 'radial-gradient(circle at 50% -20%, #1a1a1a 0%, #080808 80%)',
              borderRadius: '20px', padding: '20px',
              border: pot.isActive ? '2px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.1)',
              boxShadow: pot.isActive ? '0 0 30px rgba(212,175,55,0.15)' : '0 10px 30px rgba(0,0,0,0.5)',
              position: 'relative',
              cursor: pot.isCompleted ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: pot.isActive || pot.isCompleted ? 1 : 0.4
            }}
          >
            {/* Header / Info */}
            <h3 style={{
              color: '#D4AF37', margin: '0 0 15px', fontSize: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>Macetón {pot.index + 1}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#666' }}>
                {pot.isCompleted ? 'SANTIFICADO ✓' : `${pot.count} / 50`}
              </span>
            </h3>

            {/* Rose Grid (10x5) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '6px'
            }}>
              {pot.roses.map((rose, ri) => (
                <div key={ri} style={{
                  aspectRatio: '1/1', background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  border: rose ? 'none' : '1px dashed rgba(255,255,255,0.03)'
                }}>
                  {rose ? (
                    <RoseDrawing 
                      progress={1} 
                      size={24} 
                      compact={true} 
                      warmthProfile={rose.warmthProfile} 
                      wiggleProfile={rose.wiggleProfile}
                      enrichment={enrichment}
                    />
                  ) : (
                    <span style={{ fontSize: '0.6rem', opacity: 0.1 }}>🌹</span>
                  )}
                </div>
              ))}
            </div>
            
            {pot.isActive && (
              <div style={{ marginTop: '15px', textAlign: 'center', color: '#D4AF37', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                CONTINUAR CULTIVO
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
