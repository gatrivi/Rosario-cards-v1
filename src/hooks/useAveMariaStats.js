import { useState, useEffect } from 'react';
import { NIVELES } from '../data/LevelConfig';
import { useCloudSync } from './useCloudSync';

// Definimos cuántas rosas (Ave Marías) tiene un macetón (Rosario estándar de 5 decenas)
const ROSAS_PER_MACETON = 50; 

export function useAveMariaStats() {
  const [totalAveMarias, setTotalAveMarias] = useState(0);
  const [dailyAveMarias, setDailyAveMarias] = useState(0);
  const [nivelActualId, setNivelActualId] = useState(7);
  
  const { cloudState, syncToCloud } = useCloudSync();
  const [loadedFromCloud, setLoadedFromCloud] = useState(false);

  // Sincronizar desde la nube al cargar
  useEffect(() => {
    if (cloudState && !loadedFromCloud) {
       if (cloudState.nivelActualId !== undefined) {
         setNivelActualId(cloudState.nivelActualId);
         localStorage.setItem('nivel_usuario', cloudState.nivelActualId.toString());
       }
       if (cloudState.totalAveMarias !== undefined) {
         setTotalAveMarias(cloudState.totalAveMarias);
         localStorage.setItem('total_ave_marias', cloudState.totalAveMarias.toString());
       }
       if (cloudState.dailyAveMarias !== undefined && cloudState.todayDate === new Date().toDateString()) {
         setDailyAveMarias(cloudState.dailyAveMarias);
       }
       setLoadedFromCloud(true);
    }
  }, [cloudState, loadedFromCloud]);

  // Cargar el total y el diario al montar
  useEffect(() => {
    // Nivel del usuario
    const nivelGuardado = localStorage.getItem('nivel_usuario');
    if (nivelGuardado) setNivelActualId(parseInt(nivelGuardado, 10));

    // Total histórico
    const savedTotal = localStorage.getItem('total_ave_marias');
    if (savedTotal) {
      setTotalAveMarias(parseInt(savedTotal, 10));
    }

    // Progreso diario
    const todayStr = new Date().toDateString();
    const savedDate = localStorage.getItem('ave_marias_date');
    if (savedDate === todayStr) {
      const savedDaily = localStorage.getItem('daily_ave_marias');
      if (savedDaily) {
        setDailyAveMarias(parseInt(savedDaily, 10));
      }
    } else {
      // Nuevo día
      localStorage.setItem('ave_marias_date', todayStr);
      localStorage.setItem('daily_ave_marias', 0);
      setDailyAveMarias(0);
    }
  }, []);

  const cambiarNivel = (nuevoId) => {
    setNivelActualId(nuevoId);
    localStorage.setItem('nivel_usuario', nuevoId.toString());
    syncToCloud({ nivelActualId: nuevoId });
  };

  // Funciones de control manual
  const addRosas = (cantidad) => {
    setTotalAveMarias(prev => {
      const next = prev + cantidad;
      localStorage.setItem('total_ave_marias', next);
      return next;
    });

    setDailyAveMarias(prev => {
      const next = prev + cantidad;
      localStorage.setItem('daily_ave_marias', next);
      return next;
    });

    // Read the ACTUAL persisted values from localStorage for sync (avoids stale closure)
    setTimeout(() => {
      const currentTotal = parseInt(localStorage.getItem('total_ave_marias') || '0', 10);
      const currentDaily = parseInt(localStorage.getItem('daily_ave_marias') || '0', 10);
      syncToCloud({ 
        totalAveMarias: currentTotal, 
        dailyAveMarias: currentDaily,
        todayDate: new Date().toDateString()
      });
      // Dispatch event so other mounted components can re-read immediately
      window.dispatchEvent(new CustomEvent('rosario-stats-updated', { 
        detail: { totalAveMarias: currentTotal, dailyAveMarias: currentDaily } 
      }));
    }, 0);
  };

  const removeRosas = (cantidad) => {
    setTotalAveMarias(prev => {
      const next = Math.max(0, prev - cantidad);
      localStorage.setItem('total_ave_marias', next);
      return next;
    });

    setDailyAveMarias(prev => {
      const next = Math.max(0, prev - cantidad);
      localStorage.setItem('daily_ave_marias', next);
      return next;
    });

    setTimeout(() => {
      const currentTotal = parseInt(localStorage.getItem('total_ave_marias') || '0', 10);
      const currentDaily = parseInt(localStorage.getItem('daily_ave_marias') || '0', 10);
      syncToCloud({ 
        totalAveMarias: currentTotal, 
        dailyAveMarias: currentDaily,
        todayDate: new Date().toDateString()
      });
      window.dispatchEvent(new CustomEvent('rosario-stats-updated', { 
        detail: { totalAveMarias: currentTotal, dailyAveMarias: currentDaily } 
      }));
    }, 0);
  };

  // Función para registrar UNA Ave María rezada (una nueva rosa) (legado)
  const logAveMaria = () => addRosas(1);

  // Función para registrar un Rosario COMPLETO de una vez (legado)
  const logCompleteRosary = () => addRosas(ROSAS_PER_MACETON);

  // Cálculos para la visualización global
  const totalMacetones = Math.floor(totalAveMarias / ROSAS_PER_MACETON);
  const rosasInCurrentMaceton = totalAveMarias % ROSAS_PER_MACETON;

  // Cálculos de Disciplina Diaria
  const hoy = new Date().getDay();
  const nivelActual = NIVELES.find(n => n.id === nivelActualId) || NIVELES[6]; // Asume nivel 7 por defecto
  const objetivoMacetonesHoy = nivelActual.rutinaDiaria[hoy] || 0;

  return { 
    totalAveMarias, 
    dailyAveMarias,
    logAveMaria, 
    logCompleteRosary,
    addRosas,
    removeRosas,
    totalMacetones, 
    rosasInCurrentMaceton,
    ROSAS_PER_MACETON,
    nivelActual,
    objetivoMacetonesHoy,
    cambiarNivel
  };
}
