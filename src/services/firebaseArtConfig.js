import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase';

let dbPromise = null;

async function getDb() {
  if (!isFirebaseConfigured()) return null;
  if (!dbPromise) {
    dbPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore } = await import('firebase/firestore');
      const config = getFirebaseConfig();
      const app = getApps().length ? getApps()[0] : initializeApp(config);
      return getFirestore(app);
    })();
  }
  return dbPromise;
}

function artDocPath(syncId) {
  return `users/${syncId}/meta/artConfig`;
}

/** @returns {Promise<object|null>} */
export async function pullArtConfigFromFirestore(syncId) {
  if (!syncId) return null;
  const db = await getDb();
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, artDocPath(syncId)));
  return snap.exists() ? snap.data() : null;
}

export async function pushArtConfigToFirestore(syncId, artConfig) {
  if (!syncId || !artConfig) return false;
  const db = await getDb();
  if (!db) return false;
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  await setDoc(
    doc(db, artDocPath(syncId)),
    { ...artConfig, serverAt: serverTimestamp() },
    { merge: true }
  );
  return true;
}
