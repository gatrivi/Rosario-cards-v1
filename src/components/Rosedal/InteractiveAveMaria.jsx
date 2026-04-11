import React, { useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';

const VERSOS_AVE_MARIA = [
  "Dios te salve, María;",
  "llena eres de gracia;",
  "el Señor es contigo;",
  "bendita tú eres entre todas las mujeres,",
  "y bendito es el fruto de tu vientre, Jesús.",
  "Santa María, Madre de Dios,",
  "ruega por nosotros pecadores,",
  "ahora",
  "y en la hora de nuestra muerte.",
  "Amén."
];

// Estilo sutil para que no parezcan "botones de app" invasivos
const quickBtnStyle = {
  background: '#222',
  color: '#aaa',
  border: '1px solid #333',
  borderRadius: '20px', // Bordes redondeados tipo "píldora"
  padding: '8px 15px',
  fontSize: '0.8em',
  touchAction: 'manipulation',
  cursor: 'pointer'
};

export default function InteractiveAveMaria({ onRosaCompletada, misterioColor = "#8B0000" }) {
  const [progreso, setProgreso] = useState(0);
  const [ultimoToque, setUltimoToque] = useState(Date.now());
  const [riquezaVisual, setRiquezaVisual] = useState(0.3); // Inicia pálida (30% saturación)

  const handleTapPantalla = () => {
    if (progreso >= VERSOS_AVE_MARIA.length) return;

    const ahora = Date.now();
    const tiempoPasado = ahora - ultimoToque;
    setUltimoToque(ahora);

    // Lógica de "Riqueza": Si pasaron más de 2 segundos (2000ms), sumamos riqueza a la rosa
    if (progreso > 0) { // No evaluamos el primer tap
      if (tiempoPasado > 2000) {
        setRiquezaVisual(prev => Math.min(1, prev + 0.15)); // Sube saturación
      } else if (tiempoPasado < 1000) {
        setRiquezaVisual(prev => Math.max(0.2, prev - 0.05)); // Baja saturación si va muy rápido
      }
    }

    const nuevoProgreso = progreso + 1;
    setProgreso(nuevoProgreso);

    if (nuevoProgreso === VERSOS_AVE_MARIA.length) {
      // Haptic Feedback suave al completar la flor (Plantada)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Pasamos la riqueza final al contexto para guardarla en el Rosedal
      onRosaCompletada(riquezaVisual); 
      
      setTimeout(() => {
        setProgreso(0);
        setRiquezaVisual(0.3); // Reiniciar para la siguiente
      }, 1200);
    }
  };

  return (
    // El contenedor ocupa el 100% del alto disponible, ideal para móvil
    <div 
      onClick={handleTapPantalla}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '70vh', // Ocupa buena parte de la pantalla
        justifyContent: 'space-between',
        padding: '20px',
        cursor: 'pointer',
        userSelect: 'none', // Evita que el texto se seleccione por accidente al tocar rápido
        WebkitTapHighlightColor: 'transparent' // Quita el destello azul en móviles al tocar
      }}
    >
      
      {/* ZONA SUPERIOR: LA ROSA VIVA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          fontSize: '7em',
          // Aquí aplicamos el color del misterio y la riqueza basada en el tiempo
          filter: `saturate(${riquezaVisual * 100}%) drop-shadow(0 0 ${riquezaVisual * 20}px ${misterioColor})`,
          transition: 'all 0.5s ease',
          transform: `scale(${0.5 + ((progreso / 10) * 0.6)})`,
          opacity: Math.max(0.2, progreso / 10)
        }}>
          🌹
        </div>
        <div style={{ fontSize: '0.8em', color: '#555', marginTop: '10px' }}>
          {progreso === 10 ? '¡Rosa Plantada!' : `${progreso} / 10`}
        </div>
      </div>

      {/* ZONA INFERIOR: EL TELEPROMPTER */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        
        {/* Verso Anterior (Difuminado arriba) */}
        <div style={{ 
          fontSize: '1em', color: '#444', textAlign: 'center', opacity: 0.5,
          position: 'absolute', top: 0, width: '100%', transition: 'all 0.3s'
        }}>
          {progreso > 0 && progreso < 11 ? VERSOS_AVE_MARIA[progreso - 1] : ''}
        </div>

        {/* Verso Actual (El Foco) */}
        <div style={{ 
          fontSize: '1.4em', color: '#d4af37', textAlign: 'center', fontWeight: 'bold',
          transition: 'all 0.3s'
        }}>
          {progreso < 10 ? VERSOS_AVE_MARIA[progreso] : 'Amén.'}
        </div>

        {/* Verso Siguiente (Difuminado abajo) */}
        <div style={{ 
          fontSize: '1em', color: '#444', textAlign: 'center', opacity: 0.5,
          position: 'absolute', bottom: 0, width: '100%', transition: 'all 0.3s'
        }}>
          {progreso < 9 ? VERSOS_AVE_MARIA[progreso + 1] : ''}
        </div>

      </div>

      {/* Indicador sutil de interacción */}
      <div style={{ textAlign: 'center', color: '#333', fontSize: '0.8em', paddingBottom: '10px' }}>
        Toca en cualquier parte para avanzar
      </div>

    </div>
  );
}
