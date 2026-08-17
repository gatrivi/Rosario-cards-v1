import { useState, useEffect, useRef, useCallback } from 'react';

const BASE_URL = 'https://jsonblob.com/api/jsonBlob';
const LOCAL_CACHE_KEY = 'rosario_cloud_cache';
const ID_KEY = 'rosario_sync_id';
const SYNC_TIMEOUT_MS = 6000;
const CLASSIC_MYSTERIES = new Set(['gozosos', 'dolorosos', 'gloriosos', 'luminosos']);

/**
 * Libro, Rosario and Rosa intentionally share progress for the four classic
 * mysteries. Older builds kept a second rosaryIndex, and RoseView still has
 * its own cloud-sync consumer, so stale instances could re-introduce the old
 * index and make Rosa jump backwards when opened.
 *
 * Keep the legacy rosary fields for non-classic booklet/devotion modes, but
 * make classic cloud state canonical on bookletMystery/bookletIndex.
 */
export function normalizeSharedClassicCloudState(state = {}) {
  if (!state || typeof state !== 'object') return {};
  if (!CLASSIC_MYSTERIES.has(state.bookletMystery)) return state;

  const normalized = { ...state, rosaryMystery: state.bookletMystery };
  if (Number.isInteger(state.bookletIndex) && state.bookletIndex >= 0) {
    normalized.rosaryIndex = state.bookletIndex;
  }
  return normalized;
}

function readCachedState() {
  try {
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    return cached ? normalizeSharedClassicCloudState(JSON.parse(cached)) : {};
  } catch {
    return {};
  }
}

export function useCloudSync() {
  const [syncId, setSyncId] = useState(() => localStorage.getItem(ID_KEY));
  const [cloudState, setCloudState] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, loading, synced, local, error
  const debounceTimer = useRef(null);

  // --- 1. Inicialización de ID si no existe ---
  const initializeNewSync = useCallback(async (initialData = {}) => {
    setSyncStatus('loading');
    const normalizedInitialData = normalizeSharedClassicCloudState(initialData);
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(normalizedInitialData)
      });
      if (!res.ok) throw new Error('Failed to create cloud slot');
      
      // El ID está en el header 'Location' o podemos intentar sacarlo del body si el API lo da
      // JSONBlob suele devolver el ID en un header. Si no, parseamos el URL del location.
      const location = res.headers.get('Location');
      const newId = location ? location.split('/').pop() : null;
      
      if (newId) {
        localStorage.setItem(ID_KEY, newId);
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(normalizedInitialData));
        setSyncId(newId);
        setCloudState(normalizedInitialData);
        setSyncStatus('synced');
        return newId;
      }
    } catch (e) {
      // Cloud sync is best-effort (offline/unavailable is expected). Avoid
      // noisy "red" logs in the browser console.
      console.warn('[CloudSync] Initialization failed, using local:', e);
      setSyncStatus('error');
    }
    return null;
  }, []);

  // --- 2. Cargar datos del ID actual ---
  useEffect(() => {
    if (!syncId) {
      // Si no hay ID, cargamos solo lo local
      const cached = readCachedState();
      if (Object.keys(cached).length) setCloudState(cached);
      setSyncStatus('local');
      return;
    }

    const loadCloudData = async () => {
      setSyncStatus('loading');
      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

      try {
        const res = await fetch(`${BASE_URL}/${syncId}`, { 
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(tId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        setCloudState(prev => {
          const merged = normalizeSharedClassicCloudState({ ...readCachedState(), ...prev, ...data });
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));
          return merged;
        });
        setSyncStatus('synced');
      } catch (e) {
        clearTimeout(tId);
        console.warn('[CloudSync] Fetch failed, using local:', e.message);
        const cached = readCachedState();
        if (Object.keys(cached).length) setCloudState(cached);
        setSyncStatus('local');
      }
    };

    loadCloudData();
  }, [syncId]);

  // --- 3. Sincronizar hacia la nube (Debounced) ---
  const syncToCloud = useCallback((partialData) => {
    setCloudState(prev => {
      // Multiple mounted consumers (AppShell, Rosa, etc.) can have a stale
      // React snapshot. Merge the latest local cache first so one consumer
      // cannot silently erase fields written by another.
      const merged = normalizeSharedClassicCloudState({
        ...readCachedState(),
        ...prev,
        ...partialData,
      });
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));

      if (syncId) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
          try {
            const res = await fetch(`${BASE_URL}/${syncId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(merged)
            });
            if (res.ok) setSyncStatus('synced');
            else throw new Error('Sync failed');
          } catch (e) {
            setSyncStatus('local');
          }
        }, 2000);
      }
      return merged;
    });
  }, [syncId]);

  // --- 4. Recuperación automática al volver a estar Online ---
  useEffect(() => {
    const handleOnline = () => {
      if (syncId) {
        const cached = readCachedState();
        if (Object.keys(cached).length) {
          syncToCloud(cached);
        }
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncId, syncToCloud]);

  // --- 5. Forzar un ID (Importar) ---
  const forceSetSyncId = useCallback((newId) => {
    if (!newId || newId === syncId) return;
    localStorage.setItem(ID_KEY, newId);
    setSyncId(newId);
  }, [syncId]);

  return { 
    syncId, 
    cloudState, 
    syncStatus, 
    syncToCloud, 
    initializeNewSync, 
    forceSetSyncId 
  };
}
