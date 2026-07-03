import { useEffect, useRef } from 'react';
import {
  pickRecordingForSlot,
  blobToObjectUrl,
} from '../utils/prayerRecordingStore';

/**
 * When the active prayer changes, play the user's recording for that slot
 * (or a random take for the same prayerId). No-op if none exist.
 * Stops previous audio on change / unmount.
 */
export function usePrayerVoiceAutoplay({
  enabled = true,
  mystery,
  sequenceIndex,
  prayerId,
}) {
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const stop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };

    stop();

    if (!enabled || !mystery || prayerId == null || sequenceIndex == null || sequenceIndex < 0) {
      return () => {
        cancelled = true;
        stop();
      };
    }

    (async () => {
      try {
        const rec = await pickRecordingForSlot(mystery, sequenceIndex, prayerId);
        if (cancelled || !rec?.blob) return;
        const url = blobToObjectUrl(rec);
        if (!url || cancelled) return;
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          if (urlRef.current === url) {
            URL.revokeObjectURL(url);
            urlRef.current = null;
            audioRef.current = null;
          }
        };
        await audio.play();
      } catch (_) {
        /* autoplay blocked or missing clip — silent */
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, mystery, sequenceIndex, prayerId]);
}
