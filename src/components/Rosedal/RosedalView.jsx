import React, { useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import Maceton from './Maceton'; 
import InteractiveAveMaria from './InteractiveAveMaria';

// Definición de los 12 niveles (para referencia, basados en total de rosarios)
const LEVELS = [
  { id: 1, name: "La Semilla", reqTotal: 1 },
  { id: 2, name: "El Buscador", reqTotal: 3 },
  { id: 3, name: "Fiel Diario", reqTotal: 7 },
  { id: 4, name: "Ferviente", reqTotal: 14 },
  { id: 5, name: "Devoto", reqTotal: 21 },
  { id: 6, name: "Rosario Completo", reqTotal: 28 },
  { id: 7, name: "El Asceta", reqTotal: 104 }, // Aprox 24 por semana por un mes
  { id: 8, name: "Guerrero Espiritual", reqTotal: 240 }, // Aprox 8 diarios por un mes
  { id: 9, name: "Intercesor", reqTotal: 500 },
  { id: 10, name: "Contemplativo", reqTotal: 1000 },
  { id: 11, name: "Místico", reqTotal: 2500 },
  { id: 12, name: "Padre Pío", reqTotal: 5000 }
];

// Helper para los estilos de los botones
const btnStyle = (tipo) => ({
  padding: '12px 15px',
  borderRadius: '8px',
  border: 'none',
  background: tipo === 'plantar' ? '#2a4d2a' : '#4d2a2a', // Verde oscurito para sumar, rojizo para restar
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.9em',
  touchAction: 'manipulation'
});

// Componente para agregar a la vista principal del Rosedal
function RosedalControls({ onAdd, onRemove }) {
  return (
    <div style={{
      background: '#222', 
      padding: '15px', 
      borderRadius: '12px',
      border: '1px solid #444',
      marginTop: '20px',
      textAlign: 'center'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#ccc' }}>Ajuste Rápido Manual</h4>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {/* Botones de Podar (Restar) */}
        <button onClick={() => onRemove(1)} style={btnStyle('podar')}>- 1 Rosa</button>
        
        {/* Botones de Plantar (Sumar) */}
        <button onClick={() => onAdd(1)} style={btnStyle('plantar')}>+ 1 Rosa</button>
        <button onClick={() => onAdd(10)} style={btnStyle('plantar')}>+ 1 Decena</button>
        <button onClick={() => onAdd(50)} style={btnStyle('plantar')}>+ 1 Rosario</button>
      </div>
    </div>
  );
}

export default function RosedalView() {
  const { 
    totalAveMarias, 
    dailyAveMarias,
    logAveMaria, 
    addRosas,
    removeRosas,
    totalMacetones, 
    rosasInCurrentMaceton,
    ROSAS_PER_MACETON
  } = useAveMariaStats();

  const [objetivoRosarios, setObjetivoRosarios] = useState(1); // Por defecto 1 rosario

  // Calcular nivel actual basado en el total de rosarios (macetones)
  const currentLevel = LEVELS.slice().reverse().find(lvl => totalMacetones >= lvl.reqTotal) || LEVELS[0];
  const nextLevel = LEVELS.find(lvl => lvl.id === currentLevel.id + 1);

  // Calcula cuántos maceteros necesitamos basados en el objetivo
  const maceterosData = Array.from({ length: objetivoRosarios }).map((_, index) => {
    // Calculamos cuántas rosas van en ESTE macetero específico (capacidad 50)
    const rosasEnEsteMaceton = Math.max(0, Math.min(50, dailyAveMarias - (index * 50)));
    return { id: index, rosas: rosasEnEsteMaceton };
  });

  const handleRosaCompletada = () => {
    logAveMaria(); 
  };

  return (
    <div className="rosedal-container" style={{
      padding: '20px',
      color: '#fff',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      fontFamily: 'serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#d4af37' }}>El Rosedal Espiritual</h1>

      {/* Resumen Global */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p style={{ fontSize: '1.2em' }}>
          Has plantado un total de <span style={{ fontSize: '2em', color: '#d4af37', fontWeight: 'bold' }}>{totalAveMarias}</span> rosas en tu Rosedal.
        </p>
        <p style={{ fontSize: '1em', color: '#aaa' }}>
          Eso equivale a {totalMacetones} rosarios completos y {rosasInCurrentMaceton} Ave Marías adicionales.
        </p>
      </div>

      {/* Sección de Niveles */}
      <div style={{
        background: '#222',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #d4af37',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#d4af37' }}>Tu Camino de Oración: Nivel {currentLevel.id}</h3>
        <p style={{ fontSize: '1.5em', fontStyle: 'italic', margin: '10px 0' }}>"{currentLevel.name}"</p>
        {nextLevel && (
          <p style={{ fontSize: '0.9em', color: '#aaa' }}>
            Próximo Nivel: "{nextLevel.name}" ({totalMacetones} / {nextLevel.reqTotal} Macetones)
          </p>
        )}
      </div>

      {/* Selector de Objetivo Diario */}
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
                cursor: 'pointer'
              }}
            >
              {num} {num === 1 ? 'Rosario' : 'Rosarios'}
            </button>
          ))}
        </div>
        <p style={{ color: '#aaa', marginTop: '10px', fontSize: '0.9em' }}>
          Objetivo: {objetivoRosarios * ROSAS_PER_MACETON} Ave Marías
        </p>
      </div>

      {/* Los Maceteros (El progreso visual del día) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        {maceterosData.map(maceton => (
          <div key={maceton.id} style={{ textAlign: 'center' }}>
            {/* Reutilizamos el componente Maceton, pasando las rosas actuales y el máximo de 50 */}
            <Maceton count={maceton.rosas} maxRosas={ROSAS_PER_MACETON} />
            <div style={{ marginTop: '5px', color: maceton.rosas === ROSAS_PER_MACETON ? '#d4af37' : '#aaa' }}>
              {maceton.rosas === ROSAS_PER_MACETON ? '¡Completado!' : 'En progreso...'}
            </div>
          </div>
        ))}
      </div>

      {/* Rosedal Controls (Ajuste Rápido Manual) */}
      <RosedalControls onAdd={addRosas} onRemove={removeRosas} />

      {/* La Zona de Oración Activa */}
      <div style={{ borderTop: '1px solid #444', paddingTop: '30px', marginTop: '30px' }}>
        <h3 style={{ textAlign: 'center', color: '#d4af37' }}>Oración en Curso</h3>
        <InteractiveAveMaria onRosaCompletada={handleRosaCompletada} />
      </div>

    </div>
  );
}
