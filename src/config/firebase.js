/**
 * Firebase config — fill via .env (see .env.example).
 * App works without Firebase; jsonblob remains the fallback for stats + art.
 */

export function isFirebaseConfigured() {
  return Boolean(
    process.env.REACT_APP_FIREBASE_API_KEY
    && process.env.REACT_APP_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseConfig() {
  if (!isFirebaseConfigured()) return null;
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };
}
