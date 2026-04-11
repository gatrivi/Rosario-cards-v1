import React from 'react';
import { useRosaryStats } from '../hooks/useRosaryStats'; // Ajustada la ruta

// Definición de los niveles (Basados en el objetivo semanal para normalizar el cálculo)
const LEVELS = [
  { id: 1, name: "La Semilla", reqWeekly: 1, reqDaily: 0 },
  { id: 2, name: "El Buscador", reqWeekly: 3, reqDaily: 0 },
  { id: 3, name: "Fiel Diario", reqWeekly: 7, reqDaily: 1 },
  { id: 4, name: "Ferviente", reqWeekly: 14, reqDaily: 2 },
  { id: 5, name: "Devoto", reqWeekly: 21, reqDaily: 3 },
  { id: 6, name: "Rosario Completo", reqWeekly: 28, reqDaily: 4 },
  { id: 7, name: "El Asceta", reqWeekly: 24, reqDaily: 3.4 }, // Tu nivel específico con sesiones largas
  { id: 8, name: "Guerrero Espiritual", reqWeekly: 56, reqDaily: 8 },
  { id: 9, name: "Intercesor", reqWeekly: 84, reqDaily: 12 },
  { id: 10, name: "Contemplativo", reqWeekly: 112, reqDaily: 16 },
  { id: 11, name: "Místico", reqWeekly: 168, reqDaily: 24 },
  { id: 12, name: "Padre Pío", reqWeekly: 238, reqDaily: 34 }
];

export default function StatsView() {
  const { stats, logRosary } = useRosaryStats();

  // Calcular nivel actual basado en los rosarios de la última semana
  const currentLevel = LEVELS.slice().reverse().find(lvl => stats.thisWeek >= lvl.reqWeekly) || LEVELS[0];
  
  // Calcular progreso para el siguiente nivel
  const nextLevel = LEVELS.find(lvl => lvl.id === currentLevel.id + 1);
  const progressPercent = nextLevel 
    ? Math.min(100, Math.round((stats.thisWeek / nextLevel.reqWeekly) * 100))
    : 100;

  return (
    <div className="stats-container" style={{ padding: '20px', color: '#fff', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h2>Estadísticas de Oración</h2>
      
      {/* Botón rápido para testear/registrar (esto debería ir también en la vista final del Rosario) */}
      <button 
        onClick={logRosary}
        style={{ padding: '10px 20px', marginBottom: '20px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        + Registrar un Rosario completado
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Hoy</h3>
          <p style={{ fontSize: '2em', margin: 0 }}>{stats.today}</p>
        </div>
        <div style={{ background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Esta Semana</h3>
          <p style={{ fontSize: '2em', margin: 0 }}>{stats.thisWeek}</p>
        </div>
        <div style={{ background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Este Mes</h3>
          <p style={{ fontSize: '2em', margin: 0 }}>{stats.thisMonth}</p>
        </div>
        <div style={{ background: '#333', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Histórico</h3>
          <p style={{ fontSize: '2em', margin: 0 }}>{stats.total}</p>
        </div>
      </div>

      <div style={{ background: '#222', padding: '20px', borderRadius: '8px', border: '1px solid #d4af37' }}>
        <h3 style={{ color: '#d4af37', margin: '0 0 10px 0' }}>Nivel Actual: {currentLevel.id} - {currentLevel.name}</h3>
        <p style={{ fontSize: '0.9em', color: '#aaa' }}>
          Objetivo semanal del nivel: {currentLevel.reqWeekly} rosarios. (Llevas {stats.thisWeek})
        </p>
        
        {nextLevel && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8em' }}>
              <span>Progreso hacia Nivel {nextLevel.id}: {nextLevel.name}</span>
              <span>{stats.thisWeek} / {nextLevel.reqWeekly}</span>
            </div>
            <div style={{ width: '100%', background: '#444', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, background: '#d4af37', height: '100%', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        )}
        {currentLevel.id === 12 && (
          <p style={{ color: '#d4af37', marginTop: '15px', fontStyle: 'italic' }}>
            "Reza, espera y no te preocupes." Has alcanzado la devoción del Padre Pío.
          </p>
        )}
      </div>
    </div>
  );
}
