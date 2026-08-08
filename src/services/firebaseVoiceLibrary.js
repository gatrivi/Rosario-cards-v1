/**
 * Shared prayer voice clips (Firebase Storage + Firestore).
 * Mirror of art library — one canonical clip per prayerId (ponytail; variants later).
 */

import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase';

const CACHE_KEY = 'rosario_voice_library_cache';
const DOC_PATH = ['shared', 'voiceLibrary'];

let appPromise = null;
let memoryCache = null;

async function getApp() {
  if (!isFirebaseConfigured()) return null;
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app');
      const config = getFirebaseConfig();
      return getApps().length ? getApps()[0] : initializeApp(config);
    })().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

async function getDb() {
  const app = await getApp();
  if (!app) return null;
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(app);
}

async function getStorage() {
  const app = await getApp();
  if (!app) return null;
  const { getStorage } = await import('firebase/storage');
  return getStorage(app);
}

function safePrayerId(prayerId) {
  return String(prayerId || 'clip')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 64) || 'clip';
}

function readLocalCache() {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    memoryCache = raw ? JSON.parse(raw) : {};
  } catch (_) {
    memoryCache = {};
  }
  return memoryCache;
}

function writeLocalCache(entries) {
  memoryCache = entries || {};
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch (_) {
    /* quota */
  }
  return memoryCache;
}

/** Sync lookup from local cache (no network). */
export function getSharedClipUrl(prayerId) {
  if (!prayerId) return null;
  const entries = readLocalCache();
  const entry = entries[prayerId];
  return entry?.url || null;
}

export function getCachedVoiceLibrary() {
  return { ...readLocalCache() };
}

/**
 * Upload clip to Storage and merge into Firestore shared/voiceLibrary.
 * @returns {{ url, storagePath, prayerId, label, updatedAt }}
 */
export async function uploadVoiceClip({ prayerId, blob, mimeType, label = '' }) {
  if (!prayerId || !blob) throw new Error('prayerId y blob requeridos');
  const storage = await getStorage();
  const db = await getDb();
  if (!storage || !db) throw new Error('Firebase no configurado');

  const id = safePrayerId(prayerId);
  const stamp = Date.now().toString(36);
  const ext = (mimeType || blob.type || '').includes('wav')
    ? 'wav'
    : (mimeType || blob.type || '').includes('mp3')
      ? 'mp3'
      : 'webm';
  const path = `voice/shared/${id}/${stamp}.${ext}`;

  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, {
    contentType: mimeType || blob.type || 'audio/webm',
  });
  const url = await getDownloadURL(storageRef);
  const updatedAt = Date.now();
  const entry = { url, storagePath: path, label: label || id, updatedAt };

  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  await setDoc(
    doc(db, ...DOC_PATH),
    {
      entries: { [prayerId]: entry },
      updatedAt,
      serverAt: serverTimestamp(),
    },
    { merge: true }
  );

  const cache = readLocalCache();
  cache[prayerId] = entry;
  writeLocalCache(cache);
  return { prayerId, ...entry };
}

/** Pull shared index into local cache. */
export async function pullVoiceLibrary() {
  const db = await getDb();
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, ...DOC_PATH));
  if (!snap.exists()) {
    writeLocalCache({});
    return {};
  }
  const entries = snap.data()?.entries || {};
  writeLocalCache(entries);
  return entries;
}

/** Soft publish: never throws to callers that only care about local save. */
export async function publishVoiceClipSoft(opts) {
  if (!isFirebaseConfigured()) return { ok: false, reason: 'no-firebase' };
  try {
    const entry = await uploadVoiceClip(opts);
    return { ok: true, entry };
  } catch (err) {
    console.warn('[voiceLibrary] publish failed', err);
    return { ok: false, reason: 'upload-failed', error: err };
  }
}
