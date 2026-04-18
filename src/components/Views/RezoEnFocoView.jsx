import React, { useState, useEffect, useRef } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { useCloudSync } from '../../hooks/useCloudSync';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';

// Función para obtener los datos de una oración por ID
const getPrayerData = (id, mysteryType = 'gozosos') => {
  const apertura = RosarioPrayerBook.apertura.find(p => p.id === id);
  if (apertura) return apertura;
  const decada = RosarioPrayerBook.decada.find(p => p.id === id);
  if (decada) return decada;
  const mystery = RosarioPrayerBook.mysteries[mysteryType].find(p => p && p.id === id);
  if (mystery) return mystery;
  const cierre = RosarioPrayerBook.cierre.find(p => p.id === id);
  if (cierre) return cierre;
  return null;
};

// Generar la secuencia completa
const getSequenceData = (mysteryType = 'gozosos') => {
  const ids = mysteryType === 'gozosos' ? RosarioPrayerBook.RGo :
              mysteryType === 'dolorosos' ? RosarioPrayerBook.RDo :
              mysteryType === 'gloriosos' ? RosarioPrayerBook.RGl :
              RosarioPrayerBook.RL;

  return ids.map(id => {
    const rawData = getPrayerData(id, mysteryType);
    if (!rawData) return null;
    
    // Asignar colores e íconos por defecto según tipo de oración
    let icono = '🙏'; let color = '#808080';
    if (id === 'P') { icono = '✝️'; color = '#B8860B'; }
    else if (id === 'A') { icono = '🌹'; color = '#8B0000'; }
    else if (id === 'G') { icono = '🌟'; color = '#FFD700'; }
    else if (id === 'F') { icono = '🔥'; color = '#FF4500'; }
    else if (id.startsWith('M')) { icono = '📖'; color = '#4682B4'; }
    else if (id === 'LL' || id === 'S') { icono = '👑'; color = '#800080'; }

    // Separar oraciones por saltos de línea o signos de puntuación para modo karaoke
    const versos = rawData.text.split(/(?<=[.,;:!])\s+|\n+/).map(v => v.trim()).filter(v => v.length > 0);

    return {
      id,
      title: rawData.title,
      icono,
      color,
      versos
    };
  }).filter(Boolean);
};

export default function RezoEnFocoView() {
  const { addRosas, totalAveMarias } = useAveMariaStats();
  const totalRosasRef = useRef(totalAveMarias);

  // Mantener actualizado el valor para los workers de audio
  useEffect(() => {
    totalRosasRef.current = totalAveMarias;
  }, [totalAveMarias]);

  const [misterioActual] = useState('gozosos'); // TODO: Obtener del día
  const [secuencia] = useState(() => getSequenceData(misterioActual));
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0); 

  const { cloudState, syncToCloud } = useCloudSync();
  const [loadedPrayerIndex, setLoadedPrayerIndex] = useState(false);

  // Sincronizar indice desde la nube
  useEffect(() => {
    if (cloudState && !loadedPrayerIndex) {
      if (cloudState.currentPrayerIndex !== undefined && cloudState.todayDate === new Date().toDateString()) {
         setCurrentPrayerIndex(Math.min(cloudState.currentPrayerIndex, secuencia.length - 1));
      }
      setLoadedPrayerIndex(true);
    }
  }, [cloudState, loadedPrayerIndex, secuencia.length]);

  // Guardar índice cuando cambie
  useEffect(() => {
    if (loadedPrayerIndex) {
      syncToCloud({ 
         currentPrayerIndex, 
         todayDate: new Date().toDateString() 
      });
    }
  }, [currentPrayerIndex, loadedPrayerIndex]);

  const rezoData = secuencia[currentPrayerIndex];
  const [cargaTotal, setCargaTotal] = useState(0);
  const [targetCarga, setTargetCarga] = useState(0); // Nuevo para interpolación suave
  const [charHeatMap, setCharHeatMap] = useState(() => {
    try {
      const stored = localStorage.getItem('rosario_heatmap');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [isCargando, setIsCargando] = useState(false);
  const [modoInteraccion, setModoInteraccion] = useState('swipe'); // 'swipe' o 'hold'
  const [esperandoLevante, setEsperandoLevante] = useState(false); // Para evitar skip de versos
  
  const timerRef = useRef(null);
  const textoRef = useRef(null);
  
  // Audio Synthesizer refs
  const audioCtxRef = useRef(null);
  const synthRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
       const AudioContext = window.AudioContext || window.webkitAudioContext;
       if (!AudioContext) return;
       audioCtxRef.current = new AudioContext();
       
       const gainNode = audioCtxRef.current.createGain();
       gainNode.gain.value = 0;
       gainNode.connect(audioCtxRef.current.destination);
       
       // Tono Fundamental suave
       const osc = audioCtxRef.current.createOscillator();
       osc.type = 'sine';
       osc.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);
       osc.connect(gainNode);
       osc.start();
       
       // Tono Secundario (Armónico variable)
       const osc2 = audioCtxRef.current.createOscillator();
       osc2.type = 'triangle';
       osc2.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);
       // Hacemos que pase por un filtro básico para no ensordecer
       const filter = audioCtxRef.current.createBiquadFilter();
       filter.type = 'lowpass';
       filter.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
       osc2.connect(filter);
       filter.connect(gainNode);
       osc2.start();

       synthRef.current = { gainNode, osc, osc2, filter };
    }
    if (audioCtxRef.current.state === 'suspended') {
       audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    localStorage.setItem('rosario_heatmap', JSON.stringify(charHeatMap));
  }, [charHeatMap]);

  const totalPuntos = rezoData.versos.length * 100;
  const versoActualIndex = Math.min(Math.floor(cargaTotal / 100), rezoData.versos.length - 1);
  const progresoVersoActual = (cargaTotal % 100);

  // Mapear los casilleros del Macetón a los índices correspondientes en la secuencia
  const maceteroMap = secuencia.reduce((acc, oracion, index) => {
    if (oracion.id === 'P' || oracion.id === 'A') {
      acc.push({ seqIndex: index, id: oracion.id });
    }
    return acc;
  }, []); // Tendrá 59 (4 iniciales + 55 de decenas)

  // Encontrar cuántas oraciones de Macetón hemos completado o en cuál estamos
  const maceteroCurrentIndex = maceteroMap.findIndex(m => m.seqIndex >= currentPrayerIndex);
  const oracionesCompletadasEnTotal = maceteroCurrentIndex === -1 ? maceteroMap.length : maceteroCurrentIndex;

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
      
      // Integrate with the global stats
      if (rezoData.id === 'A') {
        addRosas(1);
      }

      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => {
        setCargaTotal(0);
        setTargetCarga(0);
        if (currentPrayerIndex < secuencia.length - 1) {
          setCurrentPrayerIndex(prev => prev + 1);
        }
      }, 1000); 
    }
  }, [cargaTotal, totalPuntos]);

  const renderVersoIndex = (esperandoLevante && cargaTotal > 0 && cargaTotal % 100 === 0)
    ? Math.max(0, Math.min(Math.floor(cargaTotal / 100) - 1, rezoData.versos.length - 1))
    : versoActualIndex;

  const currentVerseString = cargaTotal >= totalPuntos ? 'Amén.' : rezoData.versos[renderVersoIndex];

  // Lógica SWIPE (Lectura Suave con límite de velocidad y Heatmap)
  useEffect(() => {
    if (modoInteraccion !== 'swipe' || esperandoLevante || cargaTotal >= totalPuntos) return;
    
    const interval = setInterval(() => {
      setCargaTotal(prev => {
        if (prev >= targetCarga) return prev;

        const currentCharsLength = currentVerseString.length;
        
        // Flexibilizamos el límite de velocidad: base suave, pero escala con la agresividad del target
        const baseStep = currentCharsLength > 0 ? (60 / currentCharsLength) : 2; 
        const dynamicStep = Math.max(baseStep, (targetCarga - prev) * 0.15); // Permite apurar la lectura sin forzar lentitud
        const next = Math.min(prev + dynamicStep, targetCarga);
        
        // Modular Sintetizador según progreso total
        if (synthRef.current && audioCtxRef.current) {
          const tRosos = totalRosasRef.current || 0;
          // Escalado logarítmico: crece suavemente, nunca se vuelve extremo (soporta +10 millones de Ave Marías)
          const enrichmentMultiplier = Math.min(1, Math.log10(tRosos + 1) / 7.8);
          
          const { gainNode, osc2, filter } = synthRef.current;
          
          if (prev < targetCarga) {
             // Modulación de sintonía armónica: cuanto más rece en su vida, el segundo oscilador
             // se añade, sube armónicos y genera un "Chorus/Drone" progresivamente más rico.
             osc2.frequency.setTargetAtTime(220 * (1 + (enrichmentMultiplier * 0.5)), audioCtxRef.current.currentTime, 0.1);
             filter.frequency.setTargetAtTime(800 + (enrichmentMultiplier * 2000), audioCtxRef.current.currentTime, 0.1);
             
             // Sonido base bajo volumen
             const targetVolume = 0.05 + (enrichmentMultiplier * 0.05); 
             gainNode.gain.setTargetAtTime(targetVolume, audioCtxRef.current.currentTime, 0.05);
          } else {
             // Silence gently upon stopping
             gainNode.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
          }
        }

        // Aumentar el 'heat' o tiempo de permanencia en el caracter actual
        const charIndex = Math.floor((prev % 100) / 100 * currentCharsLength);
        if (charIndex >= 0 && charIndex < currentCharsLength) {
           setCharHeatMap(prevHeat => {
               const charKey = `${rezoData.id}-${renderVersoIndex}-${charIndex}`;
               const current = prevHeat[charKey] || 0;
               if (current >= 100) return prevHeat; 
               return { ...prevHeat, [charKey]: Math.min(100, current + 15) }; // Sube 15 cada 30ms de hover
           });
        }

        // Frenar al completar el verso
        if (Math.floor(next / 100) > Math.floor(prev / 100)) {
           setTargetCarga(Math.floor(next / 100) * 100);
           setEsperandoLevante(true);
           if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
           return Math.floor(next / 100) * 100;
        }

        return next >= totalPuntos ? totalPuntos : next;
      });
    }, 30);
    return () => {
      clearInterval(interval);
      if (synthRef.current && audioCtxRef.current) {
         synthRef.current.gainNode.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
      }
    };
  }, [modoInteraccion, targetCarga, totalPuntos, currentVerseString, esperandoLevante, rezoData.id, renderVersoIndex, cargaTotal]);

  const handlePointerMove = (e) => {
    initAudio(); // Initialize or resume on any interaction
    if (modoInteraccion !== 'swipe' || cargaTotal >= totalPuntos || esperandoLevante) return;
    
    // Ya no requerimos mouse down para desktop, pasando el puntero alcanza
    // if (e.buttons === 0 && e.pointerType === 'mouse') return;

    if (!textoRef.current) return;
    
    const rect = textoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const paddingSensibilidad = 60; // Área de contacto 30% más amplia
    
    const porcentajeX = Math.max(0, Math.min(100, ((x + paddingSensibilidad) / (rect.width + paddingSensibilidad*2)) * 100));
    
    // Permitir mover targetCarga solo hacia adelante
    if (porcentajeX > (targetCarga % 100) + 1 || Math.floor(targetCarga/100) < versoActualIndex) { 
       const nuevoTotal = (versoActualIndex * 100) + porcentajeX;
       
       if (nuevoTotal >= (versoActualIndex + 1) * 100 - 5) {
          // Auto-completar acercándose al final
          setTargetCarga((versoActualIndex + 1) * 100);
       } else if (nuevoTotal > targetCarga) {
          setTargetCarga(nuevoTotal);
       }
    }
  };

  const handlePointerDown = (e) => {
    initAudio();
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
      if (progresoVersoActual > 80 && targetCarga < totalPuntos) {
        setTargetCarga((versoActualIndex + 1) * 100);
      }
    }
  };

  const renderProgreso = (esperandoLevante && cargaTotal > 0 && cargaTotal % 100 === 0)
    ? 100 
    : progresoVersoActual;
  
  const renderVersoInteractivo = (text, progresoStr) => {
    const chars = text.split('');
    return chars.map((char, index) => {
       const charPct = (index / chars.length) * 100;
       const isColored = progresoStr >= charPct;
       // Color ligeramente más visible para el estado "apagado"
       const offColor = '#666'; 
       const onColor = isCargando || modoInteraccion === 'swipe' ? '#D4AF37' : rezoData.color;
       
       // Recuperar el Heat guardado
       const charKey = `${rezoData.id}-${renderVersoIndex}-${index}`;
       const heat = charHeatMap[charKey] || 0;
       const richness = 1 + (heat / 50); // Hasta 3x de saturación extra basado en tiempo leído
       
       return (
         <span key={index} style={{
             color: isColored ? onColor : offColor,
             transition: 'color 0.1s ease, filter 0.3s ease',
             textShadow: isColored ? `0px 0px ${5 + (heat/10)}px rgba(212, 175, 55, ${0.4 + (heat/200)})` : 'none',
             filter: isColored ? `saturate(${richness}) brightness(${1 + heat/200})` : 'none'
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
              {modoInteraccion === 'swipe' ? '✋ Modo: Deslizar' : '👇 Modo: Mantener'}
          </button>
      </div>

      {/* EL MACETÓN */}
      <div style={{ flex: '0 0 20%', borderBottom: '1px solid #222', padding: '15px 5px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(6, 1fr)', // Cambiado a 6 filas para acomodar los iniciales si es necesario
          gridTemplateColumns: 'repeat(11, 1fr)', 
          gap: '3px',
          height: '100%',
          maxWidth: '500px',
          width: '100%'
        }}>
          {maceteroMap.map((oracion, i) => {
            const completada = i < oracionesCompletadasEnTotal;
            const esActual = i === oracionesCompletadasEnTotal;
            const seqIndex = oracion.seqIndex;
            
            const esPadreNuestro = oracion.id === 'P';
            
            const bgDefault = '#111';
            const bgMaceton = completada ? '#2a0a0a' : bgDefault;

            // Al hacer click, avanzamos el estado a este punto en la secuencia
            const handleMaceteroClick = () => {
              setCurrentPrayerIndex(seqIndex);
              setCargaTotal(0);
              setTargetCarga(0);
            };
            
            return (
              <div key={i} onClick={handleMaceteroClick} style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: bgMaceton,
                border: esActual ? '1px solid #D4AF37' : '1px solid #222',
                borderRadius: '3px',
                fontSize: 'min(2vh, 16px)',
                cursor: 'pointer'
              }}>
                {completada || esActual ? (
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
        style={{ flex: '1', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px 40px', touchAction: 'none' }}
      >
          <div style={{ textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2vh, 1.2rem)', opacity: 0.5, marginBottom: '20px', minHeight: '1.5em' }}>
            {renderVersoIndex > 0 && cargaTotal < totalPuntos ? rezoData.versos[renderVersoIndex - 1] : ''}
          </div>
          
          {/* Al usar display inline-block, el rect() de DOM medirá exacto el ancho del verso,
              logrando que la distancia de swipe coincida con el largo del texto del verso (solicitud UX). */}
          <div ref={textoRef} style={{ display: 'inline-block', position: 'relative', textAlign: 'center', fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3.5vh, 1.8rem)', zIndex: 10, cursor: modoInteraccion === 'swipe' ? 'ew-resize' : 'pointer', padding: '0 5px' }}>
             {renderVersoInteractivo(currentVerseString, renderProgreso)}
          </div>

          <div style={{ textAlign: 'center', color: '#444', fontSize: 'clamp(1rem, 2vh, 1.2rem)', opacity: 0.5, marginTop: '20px', minHeight: '1.5em' }}>
            {renderVersoIndex < rezoData.versos.length - 1 && cargaTotal < totalPuntos ? rezoData.versos[renderVersoIndex + 1] : ''}
          </div>
          
          {/* Indicador inferior */}
          <div style={{
            position: 'absolute', bottom: '15px', width: 'calc(100% - 40px)', textAlign: 'center', 
            color: esperandoLevante ? '#D4AF37' : '#666', 
            fontSize: esperandoLevante ? '0.9rem' : '0.75rem', 
            fontWeight: 'bold',
            transition: 'color 0.3s ease, font-size 0.3s ease',
            animation: esperandoLevante ? 'pulse-hint 1.2s ease-in-out infinite' : 'none'
          }}>
            {esperandoLevante 
              ? '☝️ ¡Levanta el dedo para continuar!' 
              : (modoInteraccion === 'swipe' ? '👉 Desliza aquí para leer 👉' : '👇 Mantén presionado 👇')
            }
          </div>
          <style>{`
            @keyframes pulse-hint {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
            }
          `}</style>
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
