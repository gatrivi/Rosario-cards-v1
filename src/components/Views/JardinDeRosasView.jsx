import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import RoseDrawing from './RoseDrawing';
import { NIVELES } from '../../data/LevelConfig';
import TutorialOverlay from '../common/TutorialOverlay';
import franciscoImg from '../../data/assets/img/francisco_de_asis_2.jpg';

export default function JardinDeRosasView() {
  const {
    totalAveMarias, dailyAveMarias, ROSAS_PER_MACETON,
    getRoseData, nivelActual, objetivoMacetonesHoy, cambiarNivel
  } = useAveMariaStats();

  const roses = getRoseData();
  const enrichment = Math.min(1, Math.log10(totalAveMarias + 1) / 7.8);

  // Group roses into macetones (pots of 50)
  const pots = [];
  for (let i = 0; i < roses.length; i += ROSAS_PER_MACETON) {
    pots.push(roses.slice(i, i + ROSAS_PER_MACETON));
  }
  // Add current in-progress pot if there are ungrouped roses
  if (pots.length === 0 && totalAveMarias > 0) {
    pots.push([]); // empty pot placeholder
  }

  const macetonesHoy = Math.floor(dailyAveMarias / ROSAS_PER_MACETON);

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px',
      backgroundColor: '#0A0A0A', color: '#fff', position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 5, right: 5 }}>
        <TutorialOverlay 
          title="El Jardín de Rosas" 
          imageSrc={franciscoImg}
          text="San Francisco decía que el que trabaja con las manos es un labrador, pero el que trabaja con las manos, la mente y el corazón es un artista.&#10;&#10;Cada Ave María que contemplas crea una rosa única, una 'huella dactilar' de tu oración.&#10;&#10;Elige arriba el nivel de disciplina que quieres llevar y cultiva tu jardín cada día llenando los macetones de tu compromiso diario."
        />
      </div>

      {/* COMPACT HEADER */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '10px', 
        marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #222' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h2 style={{ color: '#D4AF37', margin: '0 0 4px', fontSize: '1.2rem' }}>Jardín de Rosas</h2>
             <p style={{ color: '#eee', margin: 0, fontSize: '0.85rem' }}>
               🌹 {totalAveMarias} rosas históricas
             </p>
          </div>
          <select 
            value={nivelActual.id} 
            onChange={(e) => cambiarNivel(parseInt(e.target.value, 10))}
            style={{ 
              background: '#111', color: '#D4AF37', border: '1px solid #333', 
              padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
            }}
          >
            {NIVELES.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>

        {/* COMPACT TODAY'S GOAL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
          <span style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 'bold' }}>Hoy: {macetonesHoy}/{objetivoMacetonesHoy}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: Math.max(objetivoMacetonesHoy, macetonesHoy) }).map((_, i) => (
              <span key={i} style={{ 
                fontSize: i < macetonesHoy ? '1rem' : '0.8rem', 
                opacity: i < macetonesHoy ? 1 : 0.2,
                filter: i < macetonesHoy ? 'drop-shadow(0 0 2px #D4AF37)' : 'none'
              }}>🪴</span>
            ))}
          </div>
        </div>
      </div>

      {/* Rose Garden Grid */}
      {pots.length > 0 ? (
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '30px', 
          maxWidth: '650px', margin: '0 auto', paddingBottom: '60px' 
        }}>
          {pots.reverse().map((pot, reversedPotIndex) => {
            const potIndex = pots.length - 1 - reversedPotIndex;
            const isLatest = reversedPotIndex === 0;
            
            // For the latest pot, always show all 50 cells (ghosts for empty ones)
            const displayRoses = isLatest 
              ? [...pot, ...Array(ROSAS_PER_MACETON - pot.length).fill(null)]
              : pot;

            return (
              <div key={potIndex} style={{
                background: 'radial-gradient(circle at 50% -20%, #1a1a1a 0%, #080808 80%)',
                borderRadius: '16px', padding: '20px',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(212, 175, 55, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Pot "Lip" or Top Border */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px', 
                  background: 'linear-gradient(90deg, transparent, #D4AF3744, transparent)' 
                }} />

                <h3 style={{ 
                  color: '#D4AF37', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', 
                  marginTop: 0, marginBottom: '20px', fontSize: '1.1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  <span>Macetón {potIndex + 1}</span>
                  <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal', letterSpacing: '1px' }}>
                    {pot.length === ROSAS_PER_MACETON ? 'SANTIFICADO ✓' : `${pot.length} / ${ROSAS_PER_MACETON}`}
                  </span>
                </h3>

                <div style={{
                  display: 'grid',
                  gap: '8px',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))',
                }}>
                  {displayRoses.map((rose, i) => (
                    <div key={i} title={rose ? `Rosa ${i+1}` : "Espacio sagrado"} style={{
                      aspectRatio: '1/1',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      background: rose ? 'rgba(15, 15, 15, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '8px',
                      border: rose ? '1px solid rgba(212, 175, 55, 0.1)' : '1px dashed rgba(255,255,255,0.03)',
                      boxShadow: rose ? '0 2px 8px rgba(0,0,0,0.4)' : 'inset 0 0 10px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                      {rose ? (
                        <RoseDrawing
                          progress={1}
                          warmthProfile={rose.warmthProfile || []}
                          wiggleProfile={rose.wiggleProfile || []}
                          enrichment={enrichment}
                          seed={rose.timestamp}
                          size={32}
                          compact={true}
                        />
                      ) : (
                        <span style={{ fontSize: '0.7rem', opacity: 0.1, color: '#D4AF37' }}>🌹</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#444', marginTop: '40px', fontSize: '0.9rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🌱</p>
          <p>Tu jardín espera sus primeras rosas.</p>
          <p style={{ fontSize: '0.75rem', color: '#333' }}>Reza un Ave María para plantar la primera.</p>
        </div>
      )}
    </div>
  );
}
