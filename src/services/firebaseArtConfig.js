import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase';

let dbPromise = null;

/** Shared project art (renames + verse assignments) — no sync ID required. */
export const SHARED_ART_PATH = ['shared', 'artConfig'];

async function getDb() {
  if (!isFirebaseConfigured()) return null;
  if (!dbPromise) {
    dbPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      const config = getFirebaseConfig();
      const app = getApps().length ? getApps()[0] : initializeApp(config);
      return getFirestore(app);
    })().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

function userArtRef(db, syncId, docFn) {
  return docFn(db, 'users', syncId, 'meta', 'artConfig');
}

function sharedArtRef(db, docFn) {
  return docFn(db, ...SHARED_ART_PATH);
}

function stripServerFields(data) {
  if (!data || typeof data !== 'object') return null;
  const { serverAt, ...rest } = data;
  void serverAt;
  return rest;
}

/** @returns {Promise<object|null>} */
export async function pullSharedArtConfig() {
  const db = await getDb();
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(sharedArtRef(db, doc));
  return snap.exists() ? stripServerFields(snap.data()) : null;
}

/** @returns {Promise<object|null>} */
export async function pullArtConfigFromFirestore(syncId) {
  if (!syncId) return pullSharedArtConfig();
  const db = await getDb();
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');

  const [sharedSnap, userSnap] = await Promise.all([
    getDoc(sharedArtRef(db, doc)),
    getDoc(userArtRef(db, syncId, doc)),
  ]);

  const shared = sharedSnap.exists() ? stripServerFields(sharedSnap.data()) : null;
  const user = userSnap.exists() ? stripServerFields(userSnap.data()) : null;
  if (!shared && !user) return null;
  if (!shared) return user;
  if (!user) return shared;

  // Newer wins; merge maps so neither side drops keys.
  const sharedAt = shared.updatedAt || 0;
  const userAt = user.updatedAt || 0;
  const newer = userAt >= sharedAt ? user : shared;
  const older = userAt >= sharedAt ? shared : user;
  return {
    registryOverrides: {
      ...(older.registryOverrides || {}),
      ...(newer.registryOverrides || {}),
    },
    verseAssignments: {
      ...(older.verseAssignments || {}),
      ...(newer.verseAssignments || {}),
    },
    updatedAt: Math.max(sharedAt, userAt),
  };
}

export async function pushArtConfigToFirestore(syncId, artConfig) {
  if (!artConfig) return false;
  const db = await getDb();
  if (!db) return false;
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const payload = { ...artConfig, serverAt: serverTimestamp() };

  const writes = [setDoc(sharedArtRef(db, doc), payload, { merge: true })];
  if (syncId) {
    writes.push(setDoc(userArtRef(db, syncId, doc), payload, { merge: true }));
  }
  await Promise.all(writes);
  return true;
}

export async function getFirebaseArtStatus() {
  if (!isFirebaseConfigured()) {
    return { configured: false, ok: false, message: 'Firebase no configurado (.env.local)' };
  }
  try {
    const db = await getDb();
    if (!db) {
      return { configured: true, ok: false, message: 'No se pudo iniciar Firestore' };
    }
    const { doc, getDoc } = await import('firebase/firestore');
    await getDoc(sharedArtRef(db, doc));
    return { configured: true, ok: true, message: 'Firestore conectado (shared/artConfig)' };
  } catch (e) {
    const msg = e?.code === 'permission-denied'
      ? 'Permiso denegado — revisá reglas de Firestore'
      : (e?.message || 'Error de Firestore');
    return { configured: true, ok: false, message: msg };
  }
}
