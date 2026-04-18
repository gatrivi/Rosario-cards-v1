import { useState, useEffect, useRef } from 'react';

const JSONBLOB_ID = '019d9259-0adf-7800-ac8b-182751178763';
const SYNC_URL = `https://jsonblob.com/api/jsonBlob/${JSONBLOB_ID}`;
const LOCAL_CACHE_KEY = 'rosario_cloud_cache';
const SYNC_TIMEOUT_MS = 4000; // Max wait for network before falling back to local

export function useCloudSync() {
  const [cloudState, setCloudState] = useState(null);
  const [syncStatus, setSyncStatus] = useState('loading'); // 'loading' | 'cloud' | 'local' | 'error'
  const debounceTimer = useRef(null);

  // Load from localStorage immediately, then try cloud as enhancement
  useEffect(() => {
    // Step 1: Load from local cache FIRST so we never block on network
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCloudState(parsed);
        setSyncStatus('local');
      }
    } catch (e) {
      console.warn('[CloudSync] Error reading localStorage cache:', e);
    }

    // Step 2: Attempt cloud fetch with timeout as an enhancement
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

    fetch(SYNC_URL, { 
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        clearTimeout(timeoutId);
        setCloudState(prevLocal => {
          // Merge: cloud data takes priority, but don't lose local-only keys
          const merged = { ...prevLocal, ...data };
          // Cache the merged result locally
          try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged)); } catch {}
          return merged;
        });
        setSyncStatus('cloud');
      })
      .catch(err => {
        clearTimeout(timeoutId);
        // Silently degrade — localStorage data is already loaded
        if (err.name === 'AbortError') {
          console.warn('[CloudSync] Fetch timed out, using local cache.');
        } else {
          console.warn('[CloudSync] Fetch failed, using local cache:', err.message);
        }
        // Only set error status if we have NO data at all
        setSyncStatus(prev => prev === 'local' ? 'local' : 'error');
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Función para guardar cambios — always writes to localStorage, 
  // cloud write is best-effort
  const syncToCloud = (partialData) => {
    setCloudState(prev => {
      const merged = { ...prev, ...partialData };
      
      // Always persist to local cache immediately
      try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged)); } catch {}

      // Debounced best-effort cloud sync
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetch(SYNC_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(merged)
        })
          .then(() => setSyncStatus('cloud'))
          .catch(err => {
            console.warn('[CloudSync] Write failed (data safe in localStorage):', err.message);
            setSyncStatus('local');
          });
      }, 1500);

      return merged;
    });
  };

  return { cloudState, syncToCloud, syncStatus };
}
