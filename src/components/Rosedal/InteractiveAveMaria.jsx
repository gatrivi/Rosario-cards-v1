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
  const [riquezaVisual, setRiquezaVisual] = useState(0.3);
  const [flash, setFlash] = useState(false);

  const { rosasInCurrentMaceton, addRosas } = useAveMariaStats();

  const decenasCompletas = Math.floor(rosasInCurrentMaceton / 10);
  const aveMariasActuales = rosasInCurrentMaceton % 10;

  const handleTapPantalla = (e) => {
    // If the tap started on a button or the footer, don't trigger prayer
    if (e.target.closest('button') || e.target.closest('.footer-controls')) {
      return;
    }

    if (progreso >= VERSOS_AVE_MARIA.length) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 100);

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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      onRosaCompletada(riquezaVisual); 
      
      setTimeout(() => {
        setProgreso(0);
        setRiquezaVisual(0.3); // Reiniciar para la siguiente
      }, 1200);
    }
  };

  return (
    <div 
      onPointerDown={handleTapPantalla}
      style={{ 
        // CONTENEDOR MAESTRO: Bloqueado a las dimensiones de la ventana
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        maxWidth: '600px', 
        height: '100%', 
        maxHeight: '100%', 
        margin: '0 auto', 
        backgroundColor: '#0A0A0A',
        boxSizing: 'border-box',
        overflow: 'hidden', // ESTO MATA EL SCROLL
        borderRadius: '12px',
        touchAction: 'none',
        position: 'relative',
        userSelect: 'none', // Previene selección de texto accidental
        WebkitUserSelect: 'none',
        cursor: 'pointer'
      }}
    >
      
      {/* Visual Feedback Overlay */}
      {flash && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(212, 175, 55, 0.2)',
          zIndex: 100,
          pointerEvents: 'none'
        }} />
      )}

      {/* ZONA 1: ENCABEZADO (Altura Fija Automática) */}
      <div style={{ 
        flex: '0 0 auto', // No crece, no se encoge
        padding: '20px 15px', 
        textAlign: 'center', 
        color: '#aaa', 
        fontSize: '1.1rem', 
        borderBottom: '1px solid #222' 
      }}>
        <span>Misterio de Hoy • Decena {decenasCompletas + 1}</span><br/>
        <strong style={{ color: '#d4af37', fontSize: '1.3rem' }}>Ave María {aveMariasActuales + 1} / 10</strong>
      </div>

      {/* ZONA 2: LA ROSA (Crece para llenar la mitad superior del espacio libre) */}
      <div 
        style={{ 
          flex: '1 1 50%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div style={{
          // Tamaño dinámico: Usa un % del alto de la pantalla, topeando para que no sea inmenso
          fontSize: 'min(22vh, 140px)', 
          filter: `saturate(${riquezaVisual * 100}%) drop-shadow(0 0 ${riquezaVisual * 20}px ${misterioColor})`,
          transition: 'all 0.5s ease',
          transform: `scale(${0.6 + ((progreso / 10) * 0.5)})`,
          opacity: Math.max(0.3, progreso / 10)
        }}>
          🌹
        </div>
        <div style={{ fontSize: '1rem', color: '#888', marginTop: '15px', fontWeight: 'bold' }}>
          {progreso === 10 ? '¡Rosa Plantada!' : `Progreso: ${progreso} / 10`}
        </div>
      </div>

      {/* ZONA 3: EL TELEPROMPTER (Crece para llenar la mitad inferior del espacio libre) */}
      <div 
        style={{ 
          flex: '1 1 50%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          position: 'relative',
          WebkitTapHighlightColor: 'transparent',
          padding: '0 25px'
        }}
      >
        {/* Usamos 'clamp' para asegurar que el texto sea legible pero nunca rompa el layout */}
        <div style={{ position: 'absolute', top: '10%', width: 'calc(100% - 50px)', textAlign: 'center', color: '#555', fontSize: 'clamp(1.1rem, 2.8vh, 1.3rem)', opacity: 0.5 }}>
          {progreso > 0 && progreso < 11 ? VERSOS_AVE_MARIA[progreso - 1] : ''}
        </div>

        <div style={{ textAlign: 'center', color: '#f5e6a0', fontWeight: 'bold', fontSize: 'clamp(1.4rem, 4vh, 2rem)', zIndex: 10 }}>
          {progreso < 10 ? VERSOS_AVE_MARIA[progreso] : 'Amén.'}
        </div>

        <div style={{ position: 'absolute', bottom: '10%', width: 'calc(100% - 50px)', textAlign: 'center', color: '#555', fontSize: 'clamp(1.1rem, 2.8vh, 1.3rem)', opacity: 0.5 }}>
          {progreso < 9 ? VERSOS_AVE_MARIA[progreso + 1] : ''}
        </div>
      </div>

      {/* ZONA 4: TAP INDICATOR */}
      <div style={{ 
        textAlign: 'center', 
        padding: '10px', 
        color: '#666', 
        fontSize: '0.9rem', 
        fontStyle: 'italic',
        backgroundColor: 'rgba(212, 175, 55, 0.05)'
      }}>
        👆 Toca cualquier parte para rezar
      </div>

      {/* ZONA 5: MINI-BARRA "PASEO DEL PERRO" (Altura Fija Automática) */}
      <div className="footer-controls" style={{ 
        flex: '0 0 auto', // No crece, no se encoge
        padding: '20px', 
        backgroundColor: '#111', 
        borderTop: '1px solid #222',
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 101 // Asegurar que esté por encima del overlay de flash
      }}>
        <span style={{ color: '#888', fontSize: '1rem' }}>Carga rápida:</span>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); addRosas(1); }} 
            style={{...quickBtnStyle, fontSize: '1rem', padding: '10px 20px'}}
          >
            +1
          </button>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); addRosas(10); }} 
            style={{...quickBtnStyle, fontSize: '1rem', padding: '10px 20px'}}
          >
            +10
          </button>
        </div>
      </div>

    </div>
  );
}
