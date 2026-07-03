import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase';
import { libraryAsMap, mergeLibraryFromRemote } from '../utils/imageLibraryStore';

let appPromise = null;

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

function safeId(name) {
  const base = String(name || 'img')
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'img';
  return `up_${Date.now().toString(36)}_${base}`;
}

/** Upload one file to Storage and return a library entry. */
export async function uploadImageFile(file) {
  const storage = await getStorage();
  if (!storage) throw new Error('Firebase Storage no configurado');

  const id = safeId(file.name);
  const path = `art/uploads/${id}`;
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
  const url = await getDownloadURL(storageRef);

  return {
    id,
    path: url,
    name: file.name.replace(/\.[^.]+$/, ''),
    tags: [],
    source: 'upload',
    storagePath: path,
    createdAt: Date.now(),
  };
}

export async function pushImageLibraryToFirestore() {
  const db = await getDb();
  if (!db) return false;
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const entries = libraryAsMap();
  await setDoc(
    doc(db, 'shared', 'imageLibrary'),
    { entries, updatedAt: Date.now(), serverAt: serverTimestamp() },
    { merge: true }
  );
  return true;
}

export async function pullImageLibraryFromFirestore() {
  const db = await getDb();
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'shared', 'imageLibrary'));
  if (!snap.exists()) return null;
  const data = snap.data();
  const entries = data.entries || {};
  mergeLibraryFromRemote(entries);
  return entries;
}
