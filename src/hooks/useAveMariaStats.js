import { useState, useEffect } from 'react';

// Definimos cuántas rosas (Ave Marías) tiene un macetón (Rosario estándar de 5 decenas)
const ROSAS_PER_MACETON = 50; 

export function useAveMariaStats() {
  const [totalAveMarias, setTotalAveMarias] = useState(0);

  // Cargar el total al montar
  useEffect(() => {
    const saved = localStorage.getItem('total_ave_marias');
    if (saved) {
      setTotalAveMarias(parseInt(saved, 10));
    }
  }, []);

  // Función para registrar UNA Ave María rezada (una nueva rosa)
  const logAveMaria = () => {
    setTotalAveMarias(prev => {
      const nextCount = prev + 1;
      localStorage.setItem('total_ave_marias', nextCount);
      return nextCount;
    });
  };

  // Función para registrar un Rosario COMPLETO de una vez (agrega 50 rosas)
  // Esto es útil si el usuario solo registra al final
  const logCompleteRosary = () => {
    setTotalAveMarias(prev => {
      const nextCount = prev + ROSAS_PER_MACETON;
      localStorage.setItem('total_ave_marias', nextCount);
      return nextCount;
    });
  };

  // Cálculos para la visualización
  const totalMacetones = Math.floor(totalAveMarias / ROSAS_PER_MACETON);
  const rosasInCurrentMaceton = totalAveMarias % ROSAS_PER_MACETON;

  return { 
    totalAveMarias, 
    logAveMaria, 
    logCompleteRosary,
    totalMacetones, 
    rosasInCurrentMaceton,
    ROSAS_PER_MACETON
  };
}
