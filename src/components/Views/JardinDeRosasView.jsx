import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import RoseDrawing from './RoseDrawing';
import { NIVELES } from '../../data/LevelConfig';
import TutorialOverlay from '../common/TutorialOverlay';
import franciscoImg from '../../data/assets/img/francisco_de_asis_2.jpg';

export default function JardinDeRosasView() {
  const {
    totalAveMarias, dailyAveMarias, totalMacetones,
    rosasInCurrentMaceton, ROSAS_PER_MACETON,
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
          display: 'flex', flexDirection: 'column', gap: '20px', 
          maxWidth: '500px', margin: '0 auto', paddingBottom: '40px' 
        }}>
          {pots.reverse().map((pot, reversedPotIndex) => {
            const potIndex = pots.length - 1 - reversedPotIndex;
            return (
              <div key={potIndex} style={{
                background: '#111', borderRadius: '12px', padding: '16px',
                border: '1px solid #1a1a1a'
              }}>
                <h3 style={{ 
                  color: '#D4AF37', borderBottom: '1px solid #222', paddingBottom: '8px', 
                  marginTop: 0, marginBottom: '16px', fontSize: '1rem',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span>Macetón {potIndex + 1}</span>
                  <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>
                    {pot.length === ROSAS_PER_MACETON ? 'Completado ✓' : `${pot.length}/${ROSAS_PER_MACETON}`}
                  </span>
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(35px, 1fr))',
                  gap: '6px'
                }}>
                  {pot.map((rose, i) => (
                    <div key={i} title={`Rosa ${i+1}`} style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      background: '#0d0d0d', borderRadius: '4px', padding: '2px',
                      border: '1px solid #1a1a1a',
                      transition: 'border-color 0.3s',
                    }}>
                      <RoseDrawing
                        progress={1}
                        warmthProfile={rose.warmthProfile || []}
                        wiggleProfile={rose.wiggleProfile || []}
                        enrichment={enrichment}
                        seed={rose.timestamp}
                        size={30}
                        compact={true}
                      />
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
