import React from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import InteractiveAveMaria from './InteractiveAveMaria';

export default function RosedalView() {
  // Desestructuramos los datos del contexto/hook
  const { 
    nivelActual, 
    objetivoMacetonesHoy, 
    dailyAveMarias, 
    logAveMaria,
    ROSAS_PER_MACETON
  } = useAveMariaStats();
  
  const macetonesCompletados = Math.floor(dailyAveMarias / ROSAS_PER_MACETON);

  const handleRosaCompletada = () => {
    logAveMaria(); 
  };

  return (
    <div style={{ backgroundColor: '#0A0A0A', color: '#fff', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      
      {/* EL COMPROMISO DEL DÍA */}
      <div style={{ textAlign: 'center', marginBottom: '30px', flex: '0 0 auto' }}>
        <h2 style={{ color: '#d4af37', margin: '0 0 5px 0' }}>Camino: {nivelActual.name}</h2>
        <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
          Tu regla para hoy exige <strong style={{color: '#fff'}}>{objetivoMacetonesHoy} Rosarios</strong> 
          ({Math.round(objetivoMacetonesHoy / 3)} horas).
        </p>
      </div>

      {/* EL PROGRESO VISUAL (Los Maceteros Pequeños) */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '5px', 
        marginBottom: '20px',
        padding: '15px',
        background: '#111',
        borderRadius: '10px',
        border: '1px solid #222',
        flex: '0 0 auto'
      }}>
        {/* Renderizamos un "mini-macetero" por cada rosario del objetivo de hoy */}
        {Array.from({ length: objetivoMacetonesHoy }).map((_, i) => {
          let estado = 'vacio';
          if (i < macetonesCompletados) estado = 'lleno';
          else if (i === macetonesCompletados) estado = 'progreso';

          return (
            <div key={i} style={{
              width: '20px', height: '20px', borderRadius: '3px',
              // Visualización rápida: Dorado si completó, Borde dorado si está en curso, Gris si falta
              background: estado === 'lleno' ? '#d4af37' : 'transparent',
              border: estado === 'vacio' ? '1px solid #333' : '1px solid #d4af37',
              opacity: estado === 'vacio' ? 0.3 : 1
            }} />
          );
        })}
      </div>

      {/* COMPONENTE DE ORACIÓN QUE OCUPA EL RESTO DE LA PANTALLA */}
      <div style={{ flex: '1 1 auto', minHeight: 0 }}>
         {/* Aquí metemos el FitScreenAveMaria que encaja perfecto */}
         <InteractiveAveMaria onRosaCompletada={handleRosaCompletada} />
      </div>

    </div>
  );
}
