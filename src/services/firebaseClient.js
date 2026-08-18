import { getFirebaseConfig, isFirebaseConfigured } from '../config/firebase';

let appPromise = null;
let authPromise = null;
let initialUserPromise = null;

export async function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app');
      const config = getFirebaseConfig();
      return getApps().length ? getApps()[0] : initializeApp(config);
    })().catch((error) => {
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

export async function getFirebaseAuth() {
  if (!authPromise) {
    authPromise = (async () => {
      const app = await getFirebaseApp();
      if (!app) return null;
      const { getAuth } = await import('firebase/auth');
      return getAuth(app);
    })().catch((error) => {
      authPromise = null;
      throw error;
    });
  }
  return authPromise;
}

export async function getFirebaseDb() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(app);
}

export async function getFirebaseStorage() {
  const app = await getFirebaseApp();
  if (!app) return null;
  const { getStorage } = await import('firebase/storage');
  return getStorage(app);
}

async function waitForInitialUser(auth) {
  const { onAuthStateChanged } = await import('firebase/auth');
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

/**
 * Resolve persisted auth first; only create an anonymous account when there is
 * genuinely no signed-in user. Shared by UI and background upload services.
 */
export async function ensureSignedInUser() {
  if (!initialUserPromise) {
    initialUserPromise = (async () => {
      const auth = await getFirebaseAuth();
      if (!auth) return null;

      const persistedUser = auth.currentUser || (await waitForInitialUser(auth));
      if (persistedUser) return persistedUser;

      const { signInAnonymously } = await import('firebase/auth');
      const credential = await signInAnonymously(auth);
      return credential.user;
    })().catch((error) => {
      initialUserPromise = null;
      throw error;
    });
  }
  return initialUserPromise;
}
