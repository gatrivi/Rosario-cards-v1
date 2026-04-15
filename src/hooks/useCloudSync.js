import { useState, useEffect, useRef } from 'react';

const JSONBLOB_ID = '019d9259-0adf-7800-ac8b-182751178763';
const SYNC_URL = `https://jsonblob.com/api/jsonBlob/${JSONBLOB_ID}`;

export function useCloudSync() {
  const [cloudState, setCloudState] = useState(null);
  const debounceTimer = useRef(null);

  // Cargar estado inicial desde la nube
  useEffect(() => {
    fetch(SYNC_URL, { headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => {
         setCloudState(data);
      })
      .catch(console.error); // Falla silenciosamente si no hay internet
  }, []);

  // Función para guardar cambios en la nube
  // Actualiza parcialmente el objeto para no sobreescribir otros datos
  const syncToCloud = (partialData) => {
    setCloudState(prev => {
      const merged = { ...prev, ...partialData };
      
      // Debounce para no spamear la API abierta
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetch(SYNC_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(merged)
        }).catch(console.error);
      }, 1500);

      return merged;
    });
  };

  return { cloudState, syncToCloud };
}
