import React from 'react';

// Propiedades: 
// count: Número de rosas a mostrar en este macetón (máx 50)
// maxRosas: Capacidad total del macetón (50 por defecto)
export default function Maceton({ count, maxRosas = 50 }) {
  
  // Creamos un array con la longitud correcta de rosas
  const rosasArray = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="maceton" style={{
      border: '3px solid #8b4513', // Color marrón terracota para el macetón
      borderRadius: '10px 10px 2px 2px',
      padding: '10px',
      margin: '10px',
      width: '220px', // Un tamaño fijo para que la grilla se vea bien
      background: '#fff', // Fondo blanco para que resalten las rosas
      display: 'inline-block',
      verticalAlign: 'top',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.3)'
    }}>
      {/* Grilla de rosas con CSS Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)', // 5 columnas (una decena por columna)
        gap: '2px',
        fontSize: '1.2em', // Tamaño del emoji
        lineHeight: '1',
        textAlign: 'center'
      }}>
        {rosasArray.map(index => (
          <span key={index} role="img" aria-label="rosa">🌹</span>
        ))}
        {/* Espacios vacíos para mantener la grilla si no está lleno */}
        {count < maxRosas && Array.from({ length: maxRosas - count }).map((_, i) => (
          <span key={`empty-${i}`} style={{ opacity: 0.1 }}>🌹</span>
        ))}
      </div>
      
      {/* Indicador de progreso del macetón */}
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        fontSize: '0.8em',
        color: '#555',
        borderTop: '1px solid #ccc',
        paddingTop: '5px'
      }}>
        {count} / {maxRosas} Rosas
      </div>
    </div>
  );
}
