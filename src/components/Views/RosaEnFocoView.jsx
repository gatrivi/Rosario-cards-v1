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

export default function RosaEnFocoView({ 
  misterioColor = "#8B0000", 
  externalIsCargando = null, 
  onComplete = null,
  simpleMode = false
}) {
  // Estado de carga continua: 0 (inicio) a 1000 (fin)
  const [carga, setCarga] = useState(0);
  const [internalIsCargando, setInternalIsCargando] = useState(false);
  const timerRef = useRef(null);

  const isCargando = externalIsCargando !== null ? externalIsCargando : internalIsCargando;

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
      // Simple Mode: 4x más rápido (3 segundos) para evitar fatiga.
      const tick = simpleMode ? 10 : 2.5;

      timerRef.current = setInterval(() => {
        setCarga(prev => {
          if (prev >= 1000) {
            clearInterval(timerRef.current);
            return 1000;
          }
          // Haptic feedback sutil cada 25% de un verso para dar sensación de "textura"
          if (Math.floor(prev) % 25 === 0 && navigator.vibrate) {
            navigator.vibrate(5);
          }
          return prev + tick; 
        });
      }, 30);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current); // Limpieza al desmontar
  }, [isCargando, carga, simpleMode]);

  // Cuando se llega al final de la oración
  useEffect(() => {
    if (carga >= 1000) {
      if (externalIsCargando === null) setInternalIsCargando(false);
      
      // Vibración de éxito (Doble latido)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      // Llamar al callback de completado
      if (onComplete) onComplete();
      
      // Reiniciamos después de 1.5 segundos para disfrutar la rosa completa
      setTimeout(() => setCarga(0), 1500);
    }
  }, [carga, externalIsCargando, onComplete]);

  // Manejadores de eventos táctiles/mouse (solo si no es externo)
  const iniciarCarga = (e) => {
    if (externalIsCargando !== null) return;
    e.preventDefault(); 
    if (carga < 1000) setInternalIsCargando(true);
  };

  const detenerCarga = () => {
    if (externalIsCargando !== null) return;
    setInternalIsCargando(false);
  };

  return (
    <div 
      // EVENTOS UNIFICADOS (Solo si no es controlado externamente)
      onPointerDown={externalIsCargando === null ? iniciarCarga : null}
      onPointerUp={externalIsCargando === null ? detenerCarga : null}
      onPointerLeave={externalIsCargando === null ? detenerCarga : null}
      onContextMenu={(e) => e.preventDefault()}

      
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
           width: '240px', height: '240px', borderRadius: '50%',
           background: `conic-gradient(${misterioColor} ${progresoVisual * 360}deg, transparent 0)`,
           opacity: isCargando ? 0.3 : 0.1, 
           transition: 'opacity 0.3s ease, transform 0.3s ease',
           transform: isCargando ? 'scale(1.1)' : 'scale(1)',
           filter: isCargando ? 'blur(2px)' : 'none'
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
        <div style={{ position: 'absolute', top: '10%', width: '100%', textAlign: 'center', color: '#444', fontSize: simpleMode ? '1.5rem' : 'clamp(1rem, 2.5vh, 1.2rem)', opacity: 0.5, transition: 'opacity 0.3s' }}>
          {versoActualIndex > 0 && carga < 1000 ? VERSOS_AVE_MARIA[versoActualIndex - 1] : ''}
        </div>

        {/* Verso Actual */}
        <div style={{ textAlign: 'center', color: isCargando ? '#D4AF37' : '#888', fontWeight: 'bold', fontSize: simpleMode ? '2.1rem' : 'clamp(1.2rem, 3.5vh, 1.6rem)', zIndex: 10, transition: 'color 0.3s' }}>
          {carga >= 1000 ? 'Amén.' : VERSOS_AVE_MARIA[versoActualIndex]}
        </div>

        {/* Verso Siguiente */}
        <div style={{ position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center', color: '#444', fontSize: simpleMode ? '1.5rem' : 'clamp(1rem, 2.5vh, 1.2rem)', opacity: 0.5, transition: 'opacity 0.3s' }}>
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
