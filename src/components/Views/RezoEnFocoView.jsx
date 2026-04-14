import React, { useState, useEffect, useRef } from 'react';

// Simulamos la estructura que vendría de tu JSON
const REZOS_DATA = {
  'padre_nuestro': { icono: '✝️', color: '#B8860B', versos: ["Padre nuestro, que estás en el cielo,", "santificado sea tu Nombre;", "venga a nosotros tu reino;", "hágase tu voluntad en la tierra como en el cielo.", "Danos hoy nuestro pan de cada día;", "perdona nuestras ofensas,", "como también nosotros perdonamos a los que nos ofenden;", "no nos dejes caer en la tentación,", "y líbranos del mal.", "Amén."] },
  'ave_maria': { icono: '🌹', color: '#8B0000', versos: ["Dios te salve, María;", "llena eres de gracia;", "el Señor es contigo;", "bendita tú eres entre todas las mujeres,", "y bendito es el fruto de tu vientre, Jesús.", "Santa María, Madre de Dios,", "ruega por nosotros pecadores,", "ahora", "y en la hora de nuestra muerte.", "Amén."] },
  'gloria': { icono: '🌟', color: '#FFD700', versos: ["Gloria al Padre,", "y al Hijo,", "y al Espíritu Santo.", "Como era en el principio,", "ahora y siempre,", "por los siglos de los siglos.", "Amén."] },
  'misterio': { icono: '📖', color: '#4682B4', versos: ["Misterio Doloroso", "La Agonía en el Huerto", "Jesús cae rostro en tierra y ora al Padre.", "Su sudor se hace como gotas de sangre.", "Señor, que se haga tu voluntad y no la mía."] }
};

export default function RezoEnFocoView() {
  const [tipoRezoActual, setTipoRezoActual] = useState('ave_maria'); 
  const rezoData = REZOS_DATA[tipoRezoActual];

  const [cargaTotal, setCargaTotal] = useState(0);
  const [isCargando, setIsCargando] = useState(false);
  const [modoInteraccion, setModoInteraccion] = useState('swipe'); // 'swipe' o 'hold'
  const [esperandoLevante, setEsperandoLevante] = useState(false); // Para evitar skip de versos
  
  const timerRef = useRef(null);
  const textoRef = useRef(null);

  const totalPuntos = rezoData.versos.length * 100;
  const versoActualIndex = Math.min(Math.floor(cargaTotal / 100), rezoData.versos.length - 1);
  const progresoVersoActual = (cargaTotal % 100);

  // MOCK de progreso
  // Vamos a asumir que la cuenta de progreso es global (0 a 54)
  // 5 decenas de (1 Padre Nuestro + 10 Ave Marias) = 5 * 11 = 55.
  const [oracionesCompletadasEnTotal, setOracionesCompletadasEnTotal] = useState(14); 

  // Lógica HOLD
  useEffect(() => {
    if (modoInteraccion === 'hold' && isCargando && cargaTotal < totalPuntos && !esperandoLevante) {
      timerRef.current = setInterval(() => {
        setCargaTotal(prev => {
           let next = prev + 2;
           // Si completa un verso, pausamos y pedimos soltar (o esperamos 1s)
           // Haremos que la pausa manual sea más inmersiva
           if (Math.floor(next / 100) > Math.floor(prev / 100)) {
               return Math.floor(next/100) * 100; 
           }
           return next >= totalPuntos ? totalPuntos : next;
        });
      }, 30);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCargando, cargaTotal, totalPuntos, modoInteraccion, esperandoLevante]);

  useEffect(() => {
    if (cargaTotal >= totalPuntos) {
      setIsCargando(false);
      setOracionesCompletadasEnTotal(prev => prev + 1); // Incrementa la rosa en el macetón
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setCargaTotal(0), 1000); 
    }
  }, [cargaTotal, totalPuntos]);

  // Lógica SWIPE
  const handlePointerMove = (e) => {
    if (modoInteraccion !== 'swipe' || cargaTotal >= totalPuntos || esperandoLevante) return;
    
    // Validar arrastre (mouse down o touch)
    if (e.buttons === 0 && e.pointerType === 'mouse') return;

    if (!textoRef.current) return;
    
    // Usar bounding box
    const rect = textoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const paddingSensibilidad = 20; // Facilitar llegar al 0% y 100%
    
    const porcentajeX = Math.max(0, Math.min(100, ((x + paddingSensibilidad) / (rect.width + paddingSensibilidad*2)) * 100));
    
    if (porcentajeX > progresoVersoActual + 1) { 
       const nuevoTotal = (versoActualIndex * 100) + porcentajeX;
       
       if (nuevoTotal >= (versoActualIndex + 1) * 100 - 5) {
          // Completar verso
          setCargaTotal((versoActualIndex + 1) * 100);
          setEsperandoLevante(true);
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
       } else if (nuevoTotal > cargaTotal) {
          setCargaTotal(nuevoTotal);
       }
    }
  };

  const handlePointerDown = (e) => {
    // Si la pantalla estaba pidiendo soltar, y presionan, permitimos continuar
    setEsperandoLevante(false);
    
    if (modoInteraccion === 'hold') {
      setIsCargando(true);
    } else {
      if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
      handlePointerMove(e);
    }
  };

  const handlePointerUp = (e) => {
    if (modoInteraccion === 'hold') {
      setIsCargando(false);
      setEsperandoLevante(false);
    } else {
      if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
      setEsperandoLevante(false);
      
      // Auto-completar si quedó muy cerca del final
      if (progresoVersoActual > 80 && cargaTotal < totalPuntos) {
        setCargaTotal((versoActualIndex + 1) * 100);
      }
    }
  };

  const currentVerseString = cargaTotal >= totalPuntos ? 'Amén.' : rezoData.versos[versoActualIndex];
  
  const renderVersoInteractivo = (text, progresoStr) => {
    const chars = text.split('');
    return chars.map((char, index) => {
       const charPct = (index / chars.length) * 100;
       const isColored = progresoStr >= charPct;
       // Color ligeramente más visible para el estado "apagado"
       const offColor = '#666'; 
       const onColor = isCargando || modoInteraccion === 'swipe' ? '#D4AF37' : rezoData.color;
       
       return (
         <span key={index} style={{
             color: isColored ? onColor : offColor,
             transition: 'color 0.1s ease',
             textShadow: isColored ? '0px 0px 5px rgba(212, 175, 55, 0.4)' : 'none'
         }}>
            {char}
         </span>
       );
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0A0A0A', userSelect: 'none', WebkitUserSelect: 'none' }}>
      
      {/* HEADER NAVBAR MÍNIMO */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: '5px' }}>
          <button onClick={() => setModoInteraccion(m => m === 'swipe' ? 'hold' : 'swipe')} style={miniBtn}>
              {modoInteraccion === 'swipe' ? '👆 Lectura' : '⏱️ Espera'}
          </button>
          <button onClick={() => setTipoRezoActual(t => t === 'ave_maria' ? 'padre_nuestro' : 'ave_maria')} style={miniBtn}>
              🔄 {tipoRezoActual === 'ave_maria' ? 'A.M.' : 'P.N.'}
          </button>
      </div>

      {/* 20%: EL MACETÓN (5 filas x 11 col: 55 casilleros) */}
      <div style={{ flex: '0 0 20%', borderBottom: '1px solid #222', padding: '15px 5px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(5, 1fr)', 
          gridTemplateColumns: 'repeat(11, 1fr)', 
          gap: '3px',
          width: '100%',
          height: '100%',
          maxWidth: '500px'
        }}>
          {Array.from({ length: 55 }).map((_, i) => {
            const col = i % 11;
            const esPadreNuestro = col === 0;
            const completada = i < oracionesCompletadasEnTotal;
            const esActual = i === oracionesCompletadasEnTotal;
            
            // Renderizado distintivo para Padre Nuestro
            const bgDefault = '#111';
            const bgMaceton = completada ? '#2a0a0a' : bgDefault;
            
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: bgMaceton,
                border: esActual ? '1px solid #D4AF37' : '1px solid #222',
                borderRadius: '3px',
                fontSize: 'min(2vh, 16px)'
              }}>
                {completada ? (
                  esPadreNuestro ? '✝️' : '🌹'
                ) : (
                  <span style={{ opacity: 0.15, filter: 'grayscale(1)' }}>
                    {esPadreNuestro ? '✝️' : '🌹'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 30%: EL ICONO/ROSA GIGANTE */}
      <div style={{ flex: '0 0 35%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{
            fontSize: 'min(25vh, 150px)', lineHeight: 1,
            filter: `drop-shadow(0 0 ${(modoInteraccion==='hold' && isCargando) ? 20 : 10}px ${rezoData.color}) saturate(${Math.max(20, (cargaTotal/totalPuntos)*100)}%)`,
            transform: `scale(${0.8 + ((cargaTotal / totalPuntos) * 0.2)}) ${(modoInteraccion==='hold' && isCargando) ? 'scale(1.02)' : 'scale(1)'}`,
            opacity: Math.max(0.4, cargaTotal / totalPuntos),
            transition: 'transform 0.1s ease-out, filter 0.2s ease, opacity 0.2s'
          }}>
            {rezoData.icono}
          </div>
      </div>

      {/* 45%: LOS VERSOS (INTERACTIVOS) */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ flex: '1', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px', touchAction: 'none' }}
      >
          <div style={{ textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2vh, 1.2rem)', opacity: 0.5, marginBottom: '20px' }}>
            {versoActualIndex > 0 && cargaTotal < totalPuntos ? rezoData.versos[versoActualIndex - 1] : ''}
          </div>
          
          <div ref={textoRef} style={{ position: 'relative', textAlign: 'center', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3.5vh, 1.8rem)', zIndex: 10, cursor: modoInteraccion === 'swipe' ? 'ew-resize' : 'pointer' }}>
             {renderVersoInteractivo(currentVerseString, progresoVersoActual)}
          </div>

          <div style={{ textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2vh, 1.2rem)', opacity: 0.5, marginTop: '20px' }}>
            {versoActualIndex < rezoData.versos.length - 1 && cargaTotal < totalPuntos ? rezoData.versos[versoActualIndex + 1] : ''}
          </div>
          
          {/* Indicador inferior */}
          <div style={{position: 'absolute', bottom: '15px', width: 'calc(100% - 40px)', textAlign: 'center', color: '#666', fontSize: '0.75rem', fontWeight: 'bold'}}>
            {modoInteraccion === 'swipe' ? '👉 Desliza aquí para leer 👉' : '👇 Mantén presionado 👇'}
          </div>
      </div>

    </div>
  );
}

const miniBtn = {
    background: 'rgba(20, 20, 20, 0.8)', 
    backdropFilter: 'blur(5px)',
    color: '#888', 
    border: '1px solid #333', 
    borderRadius: '15px', 
    padding: '8px 12px', 
    fontSize: '0.8rem',
    cursor: 'pointer',
    touchAction: 'manipulation'
};
