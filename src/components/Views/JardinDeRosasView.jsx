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

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#D4AF37', margin: '0 0 8px' }}>Tu Jardín de Rosas</h2>
        <p style={{ color: '#888', margin: '0 0 12px', fontSize: '0.85rem' }}>
          🌹 {totalAveMarias} Ave Marías · {totalMacetones} rosarios completos
        </p>

        {/* Level selector */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', 
          background: '#111', padding: '8px', borderRadius: '8px', border: '1px solid #222', 
          maxWidth: '300px', margin: '0 auto' 
        }}>
          <span style={{ fontSize: '0.8rem', color: '#999' }}>Camino:</span>
          <select 
            value={nivelActual.id} 
            onChange={(e) => cambiarNivel(parseInt(e.target.value, 10))}
            style={{ 
              background: '#0a0a0a', color: '#D4AF37', border: '1px solid #333', 
              padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer'
            }}
          >
            {NIVELES.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Today's Goal  */}
      <div style={{
        margin: '0 auto 24px', maxWidth: '300px', textAlign: 'center',
        background: '#111', borderRadius: '8px', padding: '16px',
        border: '1px solid #222'
      }}>
        <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px', fontWeight: 'bold' }}>
          Macetones de Hoy: {macetonesHoy} / {objetivoMacetonesHoy}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {Array.from({ length: Math.max(objetivoMacetonesHoy, macetonesHoy) }).map((_, i) => {
            const isCompleted = i < macetonesHoy;
            return (
              <div key={i} style={{
                width: '40px', height: '40px', borderRadius: '4px',
                border: isCompleted ? '1px solid #D4AF37' : '1px dashed #444',
                background: isCompleted ? '#2a0a0a' : '#0a0a0a',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: isCompleted ? '0 0 10px rgba(212,175,55,0.2)' : 'none'
              }}>
                {isCompleted ? (
                   <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 2px #D4AF37)' }}>🪴</span>
                ) : (
                   <span style={{ fontSize: '1rem', opacity: 0.1 }}>🪴</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Current partial maceton progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#777', marginBottom: '6px' }}>
          <span>Progreso de actual</span>
          <span>{rosasInCurrentMaceton}/{ROSAS_PER_MACETON}</span>
        </div>
        <div style={{ height: '3px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${(rosasInCurrentMaceton / ROSAS_PER_MACETON) * 100}%`,
            height: '100%', background: 'linear-gradient(90deg, #B9B9C3, #D4AF37)',
            borderRadius: '2px', transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Rose Garden Grid */}
      {roses.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
          gap: '8px', maxWidth: '500px', margin: '0 auto',
          padding: '16px', background: '#111', borderRadius: '12px',
          border: '1px solid #1a1a1a'
        }}>
          {roses.map((rose, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: '#0d0d0d', borderRadius: '6px', padding: '4px',
              border: '1px solid #1a1a1a',
              transition: 'border-color 0.3s',
            }}>
              <RoseDrawing
                progress={1}
                warmthProfile={rose.warmthProfile || []}
                wiggleProfile={rose.wiggleProfile || []}
                enrichment={enrichment}
                size={45}
                compact={true}
              />
            </div>
          ))}
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
