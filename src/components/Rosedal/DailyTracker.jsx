import React, { useState } from 'react';
import InteractiveAveMaria from './InteractiveAveMaria';
import Maceton from './Maceton'; 
import { useAveMariaStats } from '../../hooks/useAveMariaStats';

export default function DailyTracker() {
  const [objetivoRosarios, setObjetivoRosarios] = useState(1); // Por defecto 1 rosario
  const [rosasHoy, setRosasHoy] = useState(0);
  const { logAveMaria } = useAveMariaStats();

  // Calcula cuántos maceteros necesitamos basados en el objetivo
  const maceterosData = Array.from({ length: objetivoRosarios }).map((_, index) => {
    // Calculamos cuántas rosas van en ESTE macetero específico (capacidad 50)
    const rosasEnEsteMaceton = Math.max(0, Math.min(50, rosasHoy - (index * 50)));
    return { id: index, rosas: rosasEnEsteMaceton };
  });

  const handleRosaCompletada = () => {
    setRosasHoy(prev => prev + 1);
    logAveMaria(); 
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'serif' }}>
      
      <h1 style={{ textAlign: 'center', color: '#d4af37', marginBottom: '20px' }}>Planificador Diario</h1>

      {/* Selector de Objetivo */}
      <div style={{ marginBottom: '30px', textAlign: 'center', background: '#222', padding: '15px', borderRadius: '8px' }}>
        <h2>¿Cuánto deseas rezar hoy?</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 4, 8].map(num => (
            <button 
              key={num}
              onClick={() => setObjetivoRosarios(num)}
              style={{
                padding: '10px 20px',
                background: objetivoRosarios === num ? '#d4af37' : '#333',
                color: objetivoRosarios === num ? '#000' : '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '100px'
              }}
            >
              {num} {num === 1 ? 'Rosario' : 'Rosarios'}
            </button>
          ))}
        </div>
        <p style={{ color: '#aaa', marginTop: '10px', fontSize: '0.9em' }}>
          Objetivo: {objetivoRosarios * 50} Ave Marías
        </p>
      </div>

      {/* Los Maceteros (El progreso visual del día) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        {maceterosData.map(maceton => (
          <div key={maceton.id} style={{ textAlign: 'center' }}>
            <Maceton count={maceton.rosas} maxRosas={50} />
            <div style={{ marginTop: '5px', color: maceton.rosas === 50 ? '#d4af37' : '#aaa' }}>
              {maceton.rosas === 50 ? '¡Completado!' : 'En progreso...'}
            </div>
          </div>
        ))}
      </div>

      {/* La Zona de Oración Activa */}
      <div style={{ borderTop: '1px solid #444', paddingTop: '30px' }}>
        <h3 style={{ textAlign: 'center', color: '#d4af37' }}>Oración en Curso</h3>
        <InteractiveAveMaria onRosaCompletada={handleRosaCompletada} />
      </div>

    </div>
  );
}
