import React, { useState } from 'react';

// Los 10 versos del Ave María
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

// Sub-componente para visualizar cómo se llena la rosa
function VisualizadorRosa({ progreso, total }) {
  // Calculamos la opacidad basada en el progreso (0.0 a 1.0)
  const opacidad = progreso / total;
  
  return (
    <div style={{
      fontSize: '8em',
      filter: progreso === total ? 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.8))' : 'none',
      transition: 'all 0.5s ease',
      transform: `scale(${0.5 + (opacidad * 0.5)})`, // Crece a medida que se reza
      opacity: Math.max(0.1, opacidad) // Siempre un poco visible (0.1) como guía
    }}>
      🌹
    </div>
  );
}

export default function InteractiveAveMaria({ onRosaCompletada }) {
  // Rastrea cuántos versos se han "leído" (pasado el mouse)
  const [progresoRosa, setProgresoRosa] = useState(0); 

  const handleMouseEnter = (index) => {
    // Solo permitimos avanzar si pasa el mouse por el SIGUIENTE verso correcto
    if (index === progresoRosa) {
      const nuevoProgreso = progresoRosa + 1;
      setProgresoRosa(nuevoProgreso);

      // Si llegó al final (10 versos)
      if (nuevoProgreso === VERSOS_AVE_MARIA.length) {
        onRosaCompletada(); 
        
        // Reiniciamos la oración después de un pequeño retraso
        setTimeout(() => {
          setProgresoRosa(0);
        }, 1200);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'center', padding: '20px', flexWrap: 'wrap' }}>
      
      {/* Columna Izquierda: El Texto Interactivo */}
      <div style={{ flex: 1, fontSize: '1.2em', lineHeight: '1.8', minWidth: '300px' }}>
        {VERSOS_AVE_MARIA.map((verso, index) => (
          <div 
            key={index}
            onMouseEnter={() => handleMouseEnter(index)}
            // Para dispositivos táctiles
            onTouchStart={() => handleMouseEnter(index)}
            style={{
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'default',
              color: index < progresoRosa ? '#d4af37' : '#555',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              backgroundColor: index === progresoRosa ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              marginBottom: '5px'
            }}
          >
            {verso}
          </div>
        ))}
      </div>

      {/* Columna Derecha: La Rosa Dibujándose */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        height: '250px',
        minWidth: '200px'
      }}>
        <VisualizadorRosa progreso={progresoRosa} total={VERSOS_AVE_MARIA.length} />
        <p style={{ color: '#aaa', marginTop: '15px' }}>
          {progresoRosa === 10 ? '¡Rosa completada!' : `Trazos: ${progresoRosa} / 10`}
        </p>
      </div>

    </div>
  );
}
