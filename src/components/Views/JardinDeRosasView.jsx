import React from 'react';

export default function JardinDeRosasView() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px' }}>
       {/* Aquí SÍ permitimos scroll interno (overflowY: 'auto') porque el jardín puede tener muchos macetones */}
      <h2 style={{ color: '#D4AF37', textAlign: 'center' }}>Tu Camino</h2>
      <p style={{ textAlign: 'center', color: '#888' }}>Progreso de los macetones de hoy...</p>
    </div>
  );
}
