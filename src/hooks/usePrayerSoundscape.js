import { useCallback, useEffect, useRef } from 'react';
import audioManager from '../utils/audioManager';
import { PrayerSoundscape } from '../audio/prayerSoundscape';

export default function usePrayerSoundscape({ enabled, active, theme, prayerId }) {
  const engine = useRef(null);
  const interrupted = useRef(false);
  const state = useRef({ enabled, active, theme, prayerId });
  state.current = { enabled, active, theme, prayerId };

  // Unlock from pointerdown, before delayed hold activation on mobile browsers.
  const initAudio = useCallback(() => {
    if (!state.current.enabled || document.hidden) return;
    interrupted.current = false;
    const ctx = audioManager.getContext();
    if (!ctx) return;
    audioManager.resume().catch(() => {});
    if (!engine.current) engine.current = new PrayerSoundscape(ctx);
    engine.current.setTheme(state.current.theme, state.current.prayerId);
  }, []);

  const modulateAudio = useCallback(wanted => {
    engine.current?.update(wanted && state.current.active && !document.hidden && !interrupted.current,
      state.current.enabled && !document.hidden && !interrupted.current);
  }, []);

  useEffect(() => { engine.current?.setTheme(theme, prayerId); }, [theme, prayerId]);
  useEffect(() => { modulateAudio(active); }, [enabled, active, modulateAudio]);
  useEffect(() => {
    const hide = () => { interrupted.current = true; engine.current?.update(false, false); };
    const tick = () => { if (document.hidden) hide(); else modulateAudio(state.current.active); };
    const timer = setInterval(tick, 120);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('pagehide', hide);
    window.addEventListener('blur', hide);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('blur', hide);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [modulateAudio]);

  const chime = useCallback(kind => {
    if (state.current.enabled && !document.hidden && !interrupted.current) engine.current?.chime(kind);
  }, []);
  const playActivationChime = useCallback(() => chime('activation'), [chime]);
  const playVerseCompleteSound = useCallback(() => chime('verse'), [chime]);
  const playPrayerCompleteSound = useCallback(() => chime('prayer'), [chime]);
  return { initAudio, modulateAudio, playActivationChime, playVerseCompleteSound, playPrayerCompleteSound };
}
