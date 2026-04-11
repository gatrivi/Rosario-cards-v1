import { useState, useEffect } from 'react';

export function useRosaryStats() {
  const [history, setHistory] = useState([]);

  // Cargar historial al montar
  useEffect(() => {
    const saved = localStorage.getItem('rosary_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Función para registrar un nuevo rosario
  const logRosary = () => {
    const newHistory = [...history, new Date().toISOString()];
    setHistory(newHistory);
    localStorage.setItem('rosary_history', JSON.stringify(newHistory));
  };

  // Cálculos de estadísticas
  const now = new Date();
  
  const stats = {
    today: history.filter(date => {
      const d = new Date(date);
      return d.toDateString() === now.toDateString();
    }).length,
    
    thisWeek: history.filter(date => {
      const d = new Date(date);
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7;
    }).length,
    
    thisMonth: history.filter(date => {
      const d = new Date(date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    
    total: history.length
  };

  return { history, logRosary, stats };
}
