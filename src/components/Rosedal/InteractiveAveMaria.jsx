import React, { useState } from 'react';

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

export default function InteractiveAveMaria({ onRosaCompletada }) {
  const [progresoRosa, setProgresoRosa] = useState(0); 
  const [lastTapTime, setLastTapTime] = useState(null);
  const [tiemposVersos, setTiemposVersos] = useState([]);

  // Renombramos la función para que sea genérica (sirve para click y para hover)
  const handleInteraction = (index) => {
    // Solo avanzamos si toca el verso que toca leer (evita saltos accidentales)
    if (index === progresoRosa) {
      const now = Date.now();
      
      // Si es el primer verso, le damos un tiempo "saludable" por defecto
      // o tomamos el tiempo desde que cargó el componente (pero puede ser mucho)
      const tiempoTardado = lastTapTime ? (now - lastTapTime) : 2500;
      
      const nuevosTiempos = [...tiemposVersos, tiempoTardado];
      setTiemposVersos(nuevosTiempos);
      setLastTapTime(now);

      const nuevoProgreso = progresoRosa + 1;
      setProgresoRosa(nuevoProgreso);

      if (nuevoProgreso === VERSOS_AVE_MARIA.length) {
        // Se planta la rosa, enviando el array de tiempos
        onRosaCompletada(nuevosTiempos); 
        
        // Un respiro de un segundo antes de reiniciar para la siguiente Ave María
        setTimeout(() => {
          setProgresoRosa(0);
          setLastTapTime(null);
          setTiemposVersos([]);
        }, 1000);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '15px' }}>
      
      {/* La Rosa en la parte superior, bien visible en móvil */}
      <div style={{ 
        height: '150px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '6em',
          filter: progresoRosa === 10 ? 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.8))' : 'none',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Efecto de rebote suave
          transform: `scale(${0.4 + ((progresoRosa / 10) * 0.6)})`, 
          opacity: Math.max(0.15, progresoRosa / 10),
          cursor: 'default' // Evita que parezca un botón clickeable
        }}>
          🌹
        </div>
      </div>

      {/* Lista de versos táctiles */}
      <div style={{ fontSize: '1.2em', lineHeight: '1.6' }}>
        {VERSOS_AVE_MARIA.map((verso, index) => (
          <div 
            key={index}
            // AQUÍ ESTÁ LA MAGIA RESPONSIVA:
            onMouseEnter={() => handleInteraction(index)} // Se activa al pasar el mouse (Desktop)
            onClick={() => handleInteraction(index)}      // Se activa al tocar la pantalla (Mobile)
            
            style={{
              padding: '12px 10px', 
              marginBottom: '4px',
              borderRadius: '8px',
              color: index < progresoRosa ? '#d4af37' : '#666', // Dorado si ya se leyó
              backgroundColor: index === progresoRosa ? 'rgba(212, 175, 55, 0.15)' : 'transparent', // Resalta el que toca leer
              borderLeft: index === progresoRosa ? '4px solid #d4af37' : '4px solid transparent', // Guía visual fuerte
              transition: 'all 0.2s ease',
              touchAction: 'manipulation', // Optimiza la respuesta táctil
              cursor: index === progresoRosa ? 'pointer' : 'default' // Muestra la manito del mouse solo en el verso que toca leer
            }}
          >
            {verso}
          </div>
        ))}
      </div>
    </div>
  );
}
