import { useEffect, useRef } from 'react';
import {
  pickRecordingForSlot,
  blobToObjectUrl,
} from '../utils/prayerRecordingStore';
import { resolveBundledVoiceClip, VOICE_TIER_USER } from '../data/bundledVoiceMap';
import { getVoicePrefs } from '../utils/voicePrefs';

/**
 * Legacy always-on step voice. Prefer Libro ▶ FSM (`prayerVoicePlayback` + BookletView).
 * Call with enabled=false unless an explicit auto-mode session owns playback.
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
        const prefs = getVoicePrefs();
        let url = null;
        let revokeOnEnd = false;

        if (prefs.useUserVoice) {
          const rec = await pickRecordingForSlot(mystery, sequenceIndex, prayerId);
          if (rec?.blob) {
            url = blobToObjectUrl(rec);
            revokeOnEnd = true;
          }
        }
        if (!url && prefs.useBundledVoice) {
          const clip = resolveBundledVoiceClip(prayerId);
          if (clip?.url) url = clip.url;
        }
        if (!url || cancelled) return;
        if (revokeOnEnd) urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.dataset.voiceTier = revokeOnEnd ? VOICE_TIER_USER : '3';
        audio.onended = () => {
          if (revokeOnEnd && urlRef.current === url) {
            URL.revokeObjectURL(url);
            urlRef.current = null;
          }
          audioRef.current = null;
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
