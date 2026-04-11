import { useState, useEffect } from 'react';

// Definimos cuántas rosas (Ave Marías) tiene un macetón (Rosario estándar de 5 decenas)
const ROSAS_PER_MACETON = 50; 

export function useAveMariaStats() {
  const [totalAveMarias, setTotalAveMarias] = useState(0);
  const [dailyAveMarias, setDailyAveMarias] = useState(0);

  // Cargar el total y el diario al montar
  useEffect(() => {
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

  // Función para registrar UNA Ave María rezada (una nueva rosa)
  const logAveMaria = () => {
    setTotalAveMarias(prev => {
      const nextCount = prev + 1;
      localStorage.setItem('total_ave_marias', nextCount);
      return nextCount;
    });

    setDailyAveMarias(prev => {
      const nextCount = prev + 1;
      localStorage.setItem('daily_ave_marias', nextCount);
      return nextCount;
    });
  };

  // Función para registrar un Rosario COMPLETO de una vez (agrega 50 rosas)
  const logCompleteRosary = () => {
    setTotalAveMarias(prev => {
      const nextCount = prev + ROSAS_PER_MACETON;
      localStorage.setItem('total_ave_marias', nextCount);
      return nextCount;
    });

    setDailyAveMarias(prev => {
      const nextCount = prev + ROSAS_PER_MACETON;
      localStorage.setItem('daily_ave_marias', nextCount);
      return nextCount;
    });
  };

  // Cálculos para la visualización global
  const totalMacetones = Math.floor(totalAveMarias / ROSAS_PER_MACETON);
  const rosasInCurrentMaceton = totalAveMarias % ROSAS_PER_MACETON;

  return { 
    totalAveMarias, 
    dailyAveMarias,
    logAveMaria, 
    logCompleteRosary,
    totalMacetones, 
    rosasInCurrentMaceton,
    ROSAS_PER_MACETON
  };
}
