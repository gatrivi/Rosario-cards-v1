/**
 * Firebase config — prefers REACT_APP_* env, falls back to project defaults.
 * Web API keys are public; protect data with Firestore/Storage rules.
 */

const FALLBACK_CONFIG = {
  apiKey: 'AIzaSyArLB5GETzRlRya_sMyxcCGQZznlqZa5Go',
  authDomain: 'rosario-cards.firebaseapp.com',
  projectId: 'rosario-cards',
  storageBucket: 'rosario-cards.firebasestorage.app',
  messagingSenderId: '443688115227',
  appId: '1:443688115227:web:9d2d8a1069c328827bacbe',
};

export function getFirebaseConfig() {
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
    storageBucket:
      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
    messagingSenderId:
      process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
    appId: process.env.REACT_APP_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
  };
}

export function isFirebaseConfigured() {
  const c = getFirebaseConfig();
  return Boolean(c.apiKey && c.projectId);
}
