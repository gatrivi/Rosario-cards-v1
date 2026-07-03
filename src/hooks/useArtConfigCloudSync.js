import { useEffect, useRef } from 'react';
import {
  ART_CONFIG_CHANGED_EVENT,
  applyArtConfigFromCloud,
  packArtConfigForCloud,
} from '../utils/artConfigSync';
import {
  pullArtConfigFromFirestore,
  pushArtConfigToFirestore,
} from '../services/firebaseArtConfig';
import { isFirebaseConfigured } from '../config/firebase';

/**
 * Sync image renames + verse assignments:
 * - jsonblob when syncId exists
 * - Firestore shared/artConfig when Firebase env is set (no sync ID required)
 * - also users/{syncId}/meta/artConfig when syncId exists
 */
export function useArtConfigCloudSync({ syncId, cloudState, syncToCloud }) {
  const debounceRef = useRef(null);
  const appliedRemoteRef = useRef(false);

  useEffect(() => {
    if (!cloudState?.artConfig || appliedRemoteRef.current) return;
    const result = applyArtConfigFromCloud(cloudState.artConfig);
    if (result === 'applied') appliedRemoteRef.current = true;
  }, [cloudState]);

  useEffect(() => {
    const firebaseOn = isFirebaseConfigured();
    if (!syncId && !firebaseOn) return undefined;

    const push = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const artConfig = packArtConfigForCloud();
        if (syncId) syncToCloud({ artConfig });
        if (firebaseOn) {
          pushArtConfigToFirestore(syncId || null, artConfig).catch((err) => {
            console.warn('[ArtConfig] Firestore push failed:', err?.message || err);
          });
        }
      }, 2500);
    };

    window.addEventListener(ART_CONFIG_CHANGED_EVENT, push);
    return () => {
      window.removeEventListener(ART_CONFIG_CHANGED_EVENT, push);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [syncId, syncToCloud]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    pullArtConfigFromFirestore(syncId || null)
      .then((remote) => {
        if (!remote) return;
        const result = applyArtConfigFromCloud(remote);
        if (result === 'applied') appliedRemoteRef.current = true;
      })
      .catch((err) => {
        console.warn('[ArtConfig] Firestore pull failed:', err?.message || err);
      });
  }, [syncId]);
}
