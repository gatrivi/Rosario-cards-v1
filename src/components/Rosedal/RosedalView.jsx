import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import Maceton from './Maceton'; 

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

const btnStyle = {
  padding: '10px 20px',
  margin: '5px',
  background: '#d4af37',
  color: '#000',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default function RosedalView() {
  const { 
    totalAveMarias, 
    logAveMaria, 
    logCompleteRosary,
    totalMacetones, 
    rosasInCurrentMaceton,
    ROSAS_PER_MACETON
  } = useAveMariaStats();

  // Calcular nivel actual basado en el total de rosarios (macetones)
  const currentLevel = LEVELS.slice().reverse().find(lvl => totalMacetones >= lvl.reqTotal) || LEVELS[0];
  const nextLevel = LEVELS.find(lvl => lvl.id === currentLevel.id + 1);

  return (
    <div className="rosedal-container" style={{
      padding: '20px',
      color: '#fff',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      fontFamily: 'serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#d4af37' }}>El Rosedal Espiritual</h1>
      
      {/* Sección de Botones de Prueba (Eliminar después) */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={logAveMaria} style={btnStyle}>+ Rezar Ave María (1 rosa)</button>
        <button onClick={logCompleteRosary} style={btnStyle}>+ Completar Rosario (50 rosas)</button>
      </div>

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

      {/* VISUALIZACIÓN DEL ROSEDAL */}
      <div style={{
        background: '#333',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Tus Rosas Plantadas</h2>
        
        {/* Renderizar todos los macetones completos */}
        {Array.from({ length: totalMacetones }).map((_, index) => (
          <Maceton key={`full-${index}`} count={ROSAS_PER_MACETON} maxRosas={ROSAS_PER_MACETON} />
        ))}
        
        {/* Renderizar el macetón en progreso (siempre visible) */}
        <Maceton key="in-progress" count={rosasInCurrentMaceton} maxRosas={ROSAS_PER_MACETON} />
      </div>

    </div>
  );
}
