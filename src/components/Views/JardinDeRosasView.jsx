import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import RoseDrawing from './RoseDrawing';

export default function JardinDeRosasView() {
  const {
    totalAveMarias, dailyAveMarias, totalMacetones,
    rosasInCurrentMaceton, ROSAS_PER_MACETON,
    getRoseData, nivelActual, objetivoMacetonesHoy
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
      backgroundColor: '#0A0A0A', color: '#fff'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#D4AF37', margin: '0 0 8px' }}>Tu Jardín de Rosas</h2>
        <p style={{ color: '#888', margin: '0 0 4px', fontSize: '0.85rem' }}>
          🌹 {totalAveMarias} Ave Marías · {totalMacetones} rosarios completos
        </p>
        <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>
          Camino: {nivelActual.name} · Hoy: {macetonesHoy}/{objetivoMacetonesHoy} rosarios
        </p>
      </div>

      {/* Current progress bar */}
      <div style={{
        margin: '0 auto 24px', maxWidth: '300px',
        background: '#111', borderRadius: '8px', padding: '10px 14px',
        border: '1px solid #222'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#777', marginBottom: '6px' }}>
          <span>Rosario actual</span>
          <span>{rosasInCurrentMaceton}/{ROSAS_PER_MACETON}</span>
        </div>
        <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
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
                size={40}
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
