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

  const { rosasInCurrentMaceton, addRosas } = useAveMariaStats();

  const decenasCompletas = Math.floor(rosasInCurrentMaceton / 10);
  const aveMariasActuales = rosasInCurrentMaceton % 10;

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
    <div style={{ 
      // CONTENEDOR MAESTRO: Bloqueado a las dimensiones de la ventana
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      maxWidth: '600px', 
      height: '100vh', 
      maxHeight: '900px', 
      margin: '0 auto', 
      backgroundColor: '#0A0A0A',
      boxSizing: 'border-box',
      overflow: 'hidden', // ESTO MATA EL SCROLL
      borderRadius: '12px'
    }}>
      
      {/* ZONA 1: ENCABEZADO (Altura Fija Automática) */}
      <div style={{ 
        flex: '0 0 auto', // No crece, no se encoge
        padding: '15px', 
        textAlign: 'center', 
        color: '#888', 
        fontSize: '0.9rem', 
        borderBottom: '1px solid #222' 
      }}>
        <span>Misterio de Hoy • Decena {decenasCompletas + 1}</span><br/>
        <span style={{ color: '#d4af37' }}>Ave María {aveMariasActuales + 1} / 10</span>
      </div>

      {/* ZONA 2: LA ROSA (Crece para llenar la mitad superior del espacio libre) */}
      <div 
        onClick={handleTapPantalla} 
        style={{ 
          flex: '1 1 50%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div style={{
          // Tamaño dinámico: Usa un % del alto de la pantalla, topeando para que no sea inmenso
          fontSize: 'min(20vh, 120px)', 
          filter: `saturate(${riquezaVisual * 100}%) drop-shadow(0 0 ${riquezaVisual * 20}px ${misterioColor})`,
          transition: 'all 0.5s ease',
          transform: `scale(${0.5 + ((progreso / 10) * 0.6)})`,
          opacity: Math.max(0.2, progreso / 10)
        }}>
          🌹
        </div>
        <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '10px' }}>
          {progreso === 10 ? '¡Rosa Plantada!' : `${progreso} / 10`}
        </div>
      </div>

      {/* ZONA 3: EL TELEPROMPTER (Crece para llenar la mitad inferior del espacio libre) */}
      <div 
        onClick={handleTapPantalla}
        style={{ 
          flex: '1 1 50%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          padding: '0 20px'
        }}
      >
        {/* Usamos 'clamp' para asegurar que el texto sea legible pero nunca rompa el layout */}
        <div style={{ position: 'absolute', top: '10%', width: 'calc(100% - 40px)', textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2.5vh, 1.2rem)', opacity: 0.5 }}>
          {progreso > 0 && progreso < 11 ? VERSOS_AVE_MARIA[progreso - 1] : ''}
        </div>

        <div style={{ textAlign: 'center', color: '#d4af37', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3.5vh, 1.6rem)', zIndex: 10 }}>
          {progreso < 10 ? VERSOS_AVE_MARIA[progreso] : 'Amén.'}
        </div>

        <div style={{ position: 'absolute', bottom: '10%', width: 'calc(100% - 40px)', textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2.5vh, 1.2rem)', opacity: 0.5 }}>
          {progreso < 9 ? VERSOS_AVE_MARIA[progreso + 1] : ''}
        </div>
      </div>

      {/* ZONA 4: MINI-BARRA "PASEO DEL PERRO" (Altura Fija Automática) */}
      <div style={{ 
        flex: '0 0 auto', // No crece, no se encoge
        padding: '15px 20px', 
        backgroundColor: '#111', 
        borderTop: '1px solid #222',
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#666', fontSize: '0.8rem' }}>Carga manual:</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => addRosas(1)} style={quickBtnStyle}>+1 Ave María</button>
          <button onClick={() => addRosas(10)} style={quickBtnStyle}>+1 Decena</button>
        </div>
      </div>

    </div>
  );
}
