import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ensureSignedInUser, getFirebaseAuth, getFirebaseDb } from '../services/firebaseClient';

const AuthContext = createContext(null);

async function ensureUserProfile(user) {
  if (!user) return;
  const db = await getFirebaseDb();
  if (!db) return;

  const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  const common = {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    displayName: user.displayName || '',
    email: user.email || '',
    lastSeenAt: serverTimestamp(),
  };

  if (snapshot.exists()) {
    await setDoc(ref, common, { merge: true });
    return;
  }

  await setDoc(ref, {
    ...common,
    role: 'user',
    createdAt: serverTimestamp(),
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    (async () => {
      try {
        const initialUser = await ensureSignedInUser();
        if (cancelled) return;
        setUser(initialUser);
        setReady(true);
        void ensureUserProfile(initialUser).catch((profileError) => {
          console.warn('[auth] profile sync failed', profileError);
        });

        const auth = await getFirebaseAuth();
        if (!auth || cancelled) return;
        const { onAuthStateChanged } = await import('firebase/auth');
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          if (cancelled) return;
          setUser(nextUser);
          setReady(true);
          if (nextUser) {
            void ensureUserProfile(nextUser).catch((profileError) => {
              console.warn('[auth] profile sync failed', profileError);
            });
          }
        });
      } catch (authError) {
        if (cancelled) return;
        console.warn('[auth] guest sign-in unavailable', authError);
        setError(authError);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    uid: user?.uid || null,
    isGuest: Boolean(user?.isAnonymous),
    ready,
    error,
  }), [user, ready, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return value;
}
