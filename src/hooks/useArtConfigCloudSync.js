import { useEffect, useRef } from 'react';
import {
  ART_CONFIG_CHANGED_EVENT,
  applyArtConfigFromCloud,
  packArtConfigForCloud,
} from '../utils/artConfigSync';
import { pullArtConfigFromFirestore, pushArtConfigToFirestore } from '../services/firebaseArtConfig';

/**
 * Sync image renames + verse assignments via jsonblob (always) and Firestore (when configured).
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
    if (!syncId) return undefined;

    const push = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const artConfig = packArtConfigForCloud();
        syncToCloud({ artConfig });
        pushArtConfigToFirestore(syncId, artConfig).catch(() => {});
      }, 2500);
    };

    window.addEventListener(ART_CONFIG_CHANGED_EVENT, push);
    return () => {
      window.removeEventListener(ART_CONFIG_CHANGED_EVENT, push);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [syncId, syncToCloud]);

  useEffect(() => {
    if (!syncId) return;
    pullArtConfigFromFirestore(syncId).then((remote) => {
      if (!remote) return;
      const result = applyArtConfigFromCloud(remote);
      if (result === 'applied') appliedRemoteRef.current = true;
    }).catch(() => {});
  }, [syncId]);
}
