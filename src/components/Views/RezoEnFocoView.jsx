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
  const [instruccionVisible, setInstruccionVisible] = useState(true);
  const timerRef = useRef(null);

  const totalPuntos = rezoData.versos.length * 100;
  const versoActualIndex = Math.min(Math.floor(cargaTotal / 100), rezoData.versos.length - 1);
  const progresoVersoActual = (cargaTotal % 100);

  // MOCK de progreso: asume que estamos en la cuenta 14 de 50 (Decena 2, Ave María 4)
  const rosasCompletadasEnTotal = 14; 

  useEffect(() => {
    if (isCargando && cargaTotal < totalPuntos) {
      setInstruccionVisible(false);
      timerRef.current = setInterval(() => {
        setCargaTotal(prev => (prev >= totalPuntos ? totalPuntos : prev + 3));
      }, 30);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCargando, cargaTotal, totalPuntos]);

  useEffect(() => {
    if (cargaTotal >= totalPuntos) {
      setIsCargando(false);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setCargaTotal(0), 1500); 
    }
  }, [cargaTotal, totalPuntos]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0A0A0A' }}>
      
      {/* 20%: EL MACETÓN (50 casilleros fijos. Zona NO interactiva) */}
      <div style={{ height: '20%', borderBottom: '1px solid #222', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(5, 1fr)', // 5 decenas
          gridTemplateColumns: 'repeat(10, 1fr)', // 10 rosas por decena
          gap: '2px',
          width: '100%',
          height: '100%',
          maxWidth: '500px'
        }}>
          {Array.from({ length: 50 }).map((_, i) => {
            const completada = i < rosasCompletadasEnTotal;
            const esActual = i === rosasCompletadasEnTotal;
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: completada ? '#2a0a0a' : '#111', // Fondo oscuro para la maceta
                border: esActual ? '1px solid #D4AF37' : '1px solid #222',
                borderRadius: '3px',
                fontSize: 'min(2vh, 14px)' // Rosa pequeña que escala con la pantalla
              }}>
                {completada ? '🌹' : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* ZONA INTERACTIVA (Rose 40% + Versos 30%) */}
      <div 
        onPointerDown={(e) => { e.preventDefault(); setIsCargando(true); }}
        onPointerUp={() => setIsCargando(false)}
        onPointerLeave={() => setIsCargando(false)}
        onContextMenu={(e) => e.preventDefault()}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
      >
        {/* 40%: EL ICONO/ROSA GIGANTE */}
        <div style={{ height: '55%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {instruccionVisible && (
            <div style={{ position: 'absolute', top: '5%', color: '#666', fontSize: '0.8rem', animation: 'pulse 2s infinite' }}>👇 Mantén presionado abajo</div>
          )}
          <div style={{
            fontSize: 'min(25vh, 150px)', lineHeight: 1,
            filter: `drop-shadow(0 0 ${isCargando ? 15 : 5}px ${rezoData.color})`,
            transform: `scale(${0.8 + ((cargaTotal / totalPuntos) * 0.2)}) ${isCargando ? 'scale(1.05)' : 'scale(1)'}`,
            opacity: Math.max(0.5, cargaTotal / totalPuntos),
            transition: 'transform 0.1s ease-out, filter 0.2s ease'
          }}>
            {rezoData.icono}
          </div>
        </div>

        {/* 30%: LOS VERSOS */}
        <div style={{ height: '45%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2vh, 1.2rem)', opacity: 0.5, marginBottom: '10px' }}>
            {versoActualIndex > 0 && cargaTotal < totalPuntos ? rezoData.versos[versoActualIndex - 1] : ''}
          </div>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ color: isCargando ? '#D4AF37' : '#888', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3vh, 1.6rem)', zIndex: 10, transition: 'color 0.2s' }}>
              {cargaTotal >= totalPuntos ? 'Amén.' : rezoData.versos[versoActualIndex]}
            </div>
            {cargaTotal < totalPuntos && (
              <div style={{ width: '100%', height: '3px', background: '#222', marginTop: '10px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progresoVersoActual}%`, height: '100%', background: rezoData.color, transition: 'width 0.1s linear' }} />
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2vh, 1.2rem)', opacity: 0.5, marginTop: '10px' }}>
            {versoActualIndex < rezoData.versos.length - 1 ? rezoData.versos[versoActualIndex + 1] : ''}
          </div>
        </div>
      </div>

      {/* 10%: BOTONES AUXILIARES */}
      <div style={{ height: '10%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderTop: '1px solid #1a1a1a' }}>
         <button onClick={() => setTipoRezoActual('padre_nuestro')} style={btnChico}>P.N.</button>
         <button onClick={() => setTipoRezoActual('ave_maria')} style={btnChico}>A.M.</button>
         <button onClick={() => setTipoRezoActual('gloria')} style={btnChico}>Glor.</button>
         <button onClick={() => setTipoRezoActual('misterio')} style={btnChico}>Mist.</button>
      </div>

      <style>{`@keyframes pulse { 0% { opacity: 0.3; transform: translateY(0px); } 50% { opacity: 1; transform: translateY(5px); } 100% { opacity: 0.3; transform: translateY(0px); } }`}</style>
    </div>
  );
}

const btnChico = { background: 'transparent', color: '#555', border: '1px solid #333', borderRadius: '5px', padding: '5px 10px', fontSize: '0.8rem' };
