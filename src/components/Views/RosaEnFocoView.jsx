import React, { useState, useEffect, useRef } from 'react';

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

export default function RosaEnFocoView({ misterioColor = "#8B0000" }) {
  // Estado de carga continua: 0 (inicio) a 1000 (fin)
  const [carga, setCarga] = useState(0);
  const [isCargando, setIsCargando] = useState(false);
  const timerRef = useRef(null);

  // Calcula el verso actual (0 a 9) basándose en la carga total
  // Usamos Math.min para que no pase de 9 al llegar a 1000
  const versoActualIndex = Math.min(Math.floor(carga / 100), 9);
  
  // Variables derivadas para la animación (0.0 a 1.0)
  const progresoVisual = carga / 1000;

  // Lógica de "Hold to Charge" (Mantener apretado)
  useEffect(() => {
    if (isCargando && carga < 1000) {
      // Cada 30ms sumamos un poco de carga. 
      // Matemáticas: (1000 puntos / 2.5 por tick) * 30ms = 12 segundos por Ave María.
      // Un ritmo excelente y meditativo.
      timerRef.current = setInterval(() => {
        setCarga(prev => {
          if (prev >= 1000) {
            clearInterval(timerRef.current);
            return 1000;
          }
          return prev + 2.5; 
        });
      }, 30);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current); // Limpieza al desmontar
  }, [isCargando, carga]);

  // Cuando se llega al final de la oración
  useEffect(() => {
    if (carga >= 1000) {
      setIsCargando(false); // Detenemos la carga
      
      // Vibración de éxito (Doble latido)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      // Aquí llamarías a tu contexto: onRosaCompletada();
      
      // Reiniciamos después de 1.5 segundos para disfrutar la rosa completa
      setTimeout(() => setCarga(0), 1500);
    }
  }, [carga]);

  // Manejadores de eventos táctiles/mouse
  const iniciarCarga = (e) => {
    // Evita comportamientos raros de click derecho o gestos largos del móvil
    e.preventDefault(); 
    if (carga < 1000) setIsCargando(true);
  };

  const detenerCarga = () => {
    setIsCargando(false);
  };

  return (
    <div 
      // EVENTOS UNIFICADOS (Mouse + Touch)
      onPointerDown={iniciarCarga}
      onPointerUp={detenerCarga}
      onPointerLeave={detenerCarga} // Por si el dedo/mouse sale de la pantalla mientras presiona
      onContextMenu={(e) => e.preventDefault()} // Evita que salga el menú del celular al mantener presionado
      
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px',
        cursor: 'pointer',
        userSelect: 'none', // VITAL: Evita seleccionar texto al mantener apretado
        WebkitUserSelect: 'none',
        touchAction: 'none' // VITAL: Evita que el navegador intente hacer scroll o zoom al tocar
      }}
    >
      {/* 1. ESTADO ACTUAL (El Macetón) */}
      <div style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', flex: '0 0 auto' }}>
        Misterio Doloroso • Macetón 1/50 🌹
      </div>

      {/* 2. LA ROSA VIVA (Centro visual) */}
      <div style={{ flex: '1 1 50%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        {/* Barra de progreso circular o halo detrás de la rosa */}
        <div style={{
           position: 'absolute',
           width: '200px', height: '200px', borderRadius: '50%',
           background: `conic-gradient(${misterioColor} ${progresoVisual * 360}deg, transparent 0)`,
           opacity: 0.15, transition: 'background 0.1s linear'
        }} />

        {/* El Emoji de la Rosa */}
        <div style={{
          fontSize: 'min(18vh, 100px)',
          // Si está cargando, brilla más. A medida que avanza, se satura.
          filter: `saturate(${20 + (progresoVisual * 80)}%) drop-shadow(0 0 ${isCargando ? 20 : 5}px ${misterioColor})`,
          transform: `scale(${0.6 + (progresoVisual * 0.4)}) ${isCargando ? 'scale(1.05)' : 'scale(1)'}`, // Crece y tiene un "latido" al presionar
          opacity: Math.max(0.3, progresoVisual),
          transition: 'transform 0.3s ease, filter 0.3s ease' // Suaviza cuando sueltas el dedo
        }}>
          🌹
        </div>
      </div>

      {/* 3. EL TELEPROMPTER DE VERSOS */}
      <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        
        {/* Verso Anterior */}
        <div style={{ position: 'absolute', top: '10%', width: '100%', textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2.5vh, 1.2rem)', opacity: 0.5, transition: 'opacity 0.3s' }}>
          {versoActualIndex > 0 && carga < 1000 ? VERSOS_AVE_MARIA[versoActualIndex - 1] : ''}
        </div>

        {/* Verso Actual */}
        <div style={{ textAlign: 'center', color: isCargando ? '#D4AF37' : '#888', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3.5vh, 1.6rem)', zIndex: 10, transition: 'color 0.3s' }}>
          {carga >= 1000 ? 'Amén.' : VERSOS_AVE_MARIA[versoActualIndex]}
        </div>

        {/* Verso Siguiente */}
        <div style={{ position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2.5vh, 1.2rem)', opacity: 0.5, transition: 'opacity 0.3s' }}>
          {versoActualIndex < 9 ? VERSOS_AVE_MARIA[versoActualIndex + 1] : ''}
        </div>

      </div>

      {/* Instrucción sutil */}
      <div style={{ textAlign: 'center', color: '#333', fontSize: '0.8rem', flex: '0 0 auto', paddingBottom: '10px', opacity: isCargando ? 0 : 1, transition: 'opacity 0.5s' }}>
        Mantén presionado para rezar
      </div>
    </div>
  );
}
