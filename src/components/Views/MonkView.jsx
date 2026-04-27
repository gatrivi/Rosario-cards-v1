import React from 'react';
import { NIVELES } from '../../data/LevelConfig';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import TutorialOverlay from '../common/TutorialOverlay';
import antonyImg from '../../data/assets/img/st-anthony-of-padua-icon-402.jpg'; 

export default function MonkView() {
  const { nivelActual, cambiarNivel } = useAveMariaStats();

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: '20px',
      backgroundColor: '#0A0A0A', color: '#fff', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
        <TutorialOverlay 
          title="El Monje Interior" 
          imageSrc={antonyImg}
          text="«La paciencia es la raíz de todas las rosas.» — selecciona tu ritmo de devoción diaria. Cada nivel representa un compromiso más profundo con la oración incesante.&#10;&#10;Como un monje en su celda, elige la carga que tu alma pueda llevar con alegría y constancia."
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
        <h2 style={{ color: '#D4AF37', margin: '0 0 10px', fontSize: '1.5rem', letterSpacing: '1px' }}>Carácter del Monje</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>Define tu intensidad diaria</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '15px',
        paddingBottom: '40px'
      }}>
        {NIVELES.map((n) => {
          const isSelected = nivelActual.id === n.id;
          const totalRosaries = Object.values(n.rutinaDiaria).reduce((a, b) => a + b, 0) / 7;
          
          return (
            <div 
              key={n.id}
              onClick={() => cambiarNivel(n.id)}
              style={{
                background: isSelected ? 'rgba(212, 175, 55, 0.1)' : '#111',
                border: isSelected ? '2px solid #D4AF37' : '1px solid #222',
                borderRadius: '16px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: isSelected ? '0 8px 25px rgba(212, 175, 55, 0.15)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ 
                fontSize: '2rem', marginBottom: '10px',
                filter: isSelected ? 'drop-shadow(0 0 8px #D4AF37)' : 'none' 
              }}>
                {isSelected ? '🧘' : '👤'}
              </div>
              <h3 style={{ 
                fontSize: '1rem', color: isSelected ? '#D4AF37' : '#eee', 
                margin: '0 0 5px', fontWeight: 'bold' 
              }}>
                {n.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 10px', lineHeight: '1.3' }}>
                {n.description}
              </p>
              <div style={{ 
                fontSize: '0.7rem', color: '#D4AF37', 
                background: 'rgba(212, 175, 55, 0.05)', padding: '4px 8px', borderRadius: '10px' 
              }}>
                avg. {totalRosaries.toFixed(1)}/día
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
