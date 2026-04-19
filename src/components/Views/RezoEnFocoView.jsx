import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { useCloudSync } from '../../hooks/useCloudSync';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import RoseDrawing from './RoseDrawing';
import TutorialOverlay from '../common/TutorialOverlay';
import antonyImg from '../../data/assets/img/st-anthony-of-padua-icon-402.jpg';

// ─── Prayer data helpers ───

const getPrayerData = (id, mysteryType = 'gozosos') => {
  const apertura = RosarioPrayerBook.apertura.find(p => p.id === id);
  if (apertura) return apertura;
  const decada = RosarioPrayerBook.decada.find(p => p.id === id);
  if (decada) return decada;
  const mystery = RosarioPrayerBook.mysteries[mysteryType].find(p => p && p.id === id);
  if (mystery) return mystery;
  const cierre = RosarioPrayerBook.cierre.find(p => p.id === id);
  if (cierre) return cierre;
  return null;
};

const getSequenceData = (mysteryType = 'gozosos') => {
  const ids = mysteryType === 'gozosos' ? RosarioPrayerBook.RGo :
              mysteryType === 'dolorosos' ? RosarioPrayerBook.RDo :
              mysteryType === 'gloriosos' ? RosarioPrayerBook.RGl :
              RosarioPrayerBook.RL;

  return ids.map(id => {
    const rawData = getPrayerData(id, mysteryType);
    if (!rawData) return null;
    let icono = '🙏'; let color = '#808080';
    if (id === 'P') { icono = '✝️'; color = '#B8860B'; }
    else if (id === 'A') { icono = '🌹'; color = '#8B0000'; }
    else if (id === 'G') { icono = '🌟'; color = '#FFD700'; }
    else if (id === 'F') { icono = '🔥'; color = '#FF4500'; }
    else if (id.startsWith('M')) { icono = '📖'; color = '#4682B4'; }
    else if (id === 'LL' || id === 'S') { icono = '👑'; color = '#800080'; }
    const versos = rawData.text.split(/(?<=[.,;:!])\s+|\n+/).map(v => v.trim()).filter(v => v.length > 0);
    return { id, title: rawData.title, icono, color, versos };
  }).filter(Boolean);
};

// ─── Color helpers ───

const SILVER      = [185, 185, 195];
const GOLD        = [212, 175, 55];
const DEEP_GOLD   = [184, 134, 11];   // DarkGoldenrod
const WARM_AMBER  = [210, 140, 10];   // richer amber — extended meditation
const INCANDESCENT = [245, 215, 160]; // warm white — deep contemplation
const UNREAD      = [51, 51, 51];     // #333

const lerp = (a, b, t) => a + (b - a) * t;
const lerpColor = (from, to, t) => [
  Math.round(lerp(from[0], to[0], t)),
  Math.round(lerp(from[1], to[1], t)),
  Math.round(lerp(from[2], to[2], t)),
];
const toRGB = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

// Extended color ramp — rewards lingering with richer tones:
//   0–100ms    → building to silver (fast swipe stays here)
//   100–200ms  → silver → gold
//   200–600ms  → gold → deep gold
//   600–1500ms → deep gold → warm amber
//   1500–4000ms → warm amber → incandescent (deep contemplation)
//   4000ms+    → incandescent glow
const colorFromElapsed = (elapsed) => {
  if (elapsed <= 0)    return UNREAD;
  if (elapsed < 100)   return lerpColor(UNREAD, SILVER, elapsed / 100);
  if (elapsed < 200)   return lerpColor(SILVER, GOLD, (elapsed - 100) / 100);
  if (elapsed < 600)   return lerpColor(GOLD, DEEP_GOLD, (elapsed - 200) / 400);
  if (elapsed < 1500)  return lerpColor(DEEP_GOLD, WARM_AMBER, (elapsed - 600) / 900);
  if (elapsed < 4000)  return lerpColor(WARM_AMBER, INCANDESCENT, (elapsed - 1500) / 2500);
  return INCANDESCENT;
};

// Glow intensity scales with dwell time
const glowFromElapsed = (elapsed, baseSize) => {
  if (elapsed < 150) return 'none';
  if (elapsed < 600) {
    const t = (elapsed - 150) / 450;
    return `0 0 ${baseSize * t}px rgba(212, 175, 55, ${0.15 + t * 0.3})`;
  }
  if (elapsed < 1500) {
    const t = (elapsed - 600) / 900;
    return `0 0 ${baseSize + t * 8}px rgba(210, 140, 10, ${0.4 + t * 0.25})`;
  }
  // Transcendent double-glow
  const t = Math.min(1, (elapsed - 1500) / 2500);
  return `0 0 ${baseSize + 8 + t * 6}px rgba(245, 215, 160, ${0.5 + t * 0.3}), 0 0 ${baseSize + 16 + t * 10}px rgba(212, 175, 55, ${0.15 + t * 0.15})`;
};


// ═══════════════════════════════════════════════════════
// ─── Component ───
// ═══════════════════════════════════════════════════════

export default function RezoEnFocoView() {
  const { addRosas, storeRoseData, getRoseData, totalAveMarias } = useAveMariaStats();
  const totalRosasRef = useRef(totalAveMarias);
  useEffect(() => { totalRosasRef.current = totalAveMarias; }, [totalAveMarias]);

  const [misterioActual] = useState('gozosos');
  const [secuencia] = useState(() => getSequenceData(misterioActual));
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0); 

  // ─── Cloud Sync ───
  const { cloudState, syncToCloud } = useCloudSync();
  const [loadedPrayerIndex, setLoadedPrayerIndex] = useState(false);

  useEffect(() => {
    if (cloudState && !loadedPrayerIndex) {
      if (cloudState.currentPrayerIndex !== undefined && cloudState.todayDate === new Date().toDateString()) {
         setCurrentPrayerIndex(Math.min(cloudState.currentPrayerIndex, secuencia.length - 1));
      }
      setLoadedPrayerIndex(true);
    }
  }, [cloudState, loadedPrayerIndex, secuencia.length]);

  useEffect(() => {
    if (loadedPrayerIndex) {
      syncToCloud({ currentPrayerIndex, todayDate: new Date().toDateString() });
    }
  }, [currentPrayerIndex, loadedPrayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const rezoData = secuencia[currentPrayerIndex];

  // ─── Interaction State ───
  const [modoInteraccion, setModoInteraccion] = useState('swipe');
  const [versoIndex, setVersoIndex] = useState(0);
  const [charProgressIndex, setCharProgressIndex] = useState(-1); // Global char index reached (-1 = not started)
  const [isVerseActivated, setIsVerseActivated] = useState(false);
  const [isVersoComplete, setIsVersoComplete] = useState(false);
  const [isPrayerComplete, setIsPrayerComplete] = useState(false);
  const [isCargando, setIsCargando] = useState(false);
  const [warmthTick, setWarmthTick] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('rosario_sound_enabled');
    return stored === null ? true : stored === 'true';
  });

  // ─── Refs ───
  const containerRef = useRef(null);
  const textoRef = useRef(null);
  const wordSpanRefs = useRef([]);       // DOM elements for each word (for getBoundingClientRect)
  const charReachedAtRef = useRef([]);   // Timestamp when each global char was first reached
  const charDwellRef = useRef([]);       // LOCKED dwell ms for passed chars (fast = small, slow = large)
  const verseWarmthRef = useRef([]);     // Per-verse average warmth (for rose fingerprint)
  const verseWiggleRef = useRef([]);     // Per-verse mouse variance (for rose uniqueness)
  const mouseWiggleRef = useRef({ lastX: null, lastY: null, samples: [] });
  const autoAdvanceTimer = useRef(null);
  const holdTimerRef = useRef(null);
  const pointerStartX = useRef(null);
  const pointerStartY = useRef(null);
  const isVerticalGesture = useRef(false);
  const versoIndexRef = useRef(0);
  const advanceVerseRef = useRef(null);

  // Audio
  const audioCtxRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => { versoIndexRef.current = versoIndex; }, [versoIndex]);

  // ─── Derived ───
  const totalVersos = rezoData.versos.length;
  const currentVerseText = isPrayerComplete ? 'Amén.' : (rezoData.versos[versoIndex] || '');
  const currentWords = currentVerseText.split(/\s+/).filter(w => w.length > 0);

  // Precompute character offsets: wordCharOffsets[w] = global index of the first char of word w
  const wordCharOffsets = [];
  let _off = 0;
  for (const w of currentWords) { wordCharOffsets.push(_off); _off += w.length; }
  const totalChars = _off;

  const overallProgress = isPrayerComplete ? 1 :
    (versoIndex + (charProgressIndex >= 0 ? (charProgressIndex + 1) / Math.max(1, totalChars) : 0)) / Math.max(1, totalVersos);

  // ─── Macetero mapping ───
  const maceteroMap = secuencia.reduce((acc, oracion, index) => {
    if (oracion.id === 'P' || oracion.id === 'A') acc.push({ seqIndex: index, id: oracion.id });
    return acc;
  }, []);
  const maceteroCurrentIndex = maceteroMap.findIndex(m => m.seqIndex >= currentPrayerIndex);
  const oracionesCompletadasEnTotal = maceteroCurrentIndex === -1 ? maceteroMap.length : maceteroCurrentIndex;


  // ═══════════════════════════════════════════════════════
  // ─── Audio System ───
  // ═══════════════════════════════════════════════════════
  //
  // Each prayer type has a root frequency. As the user reads,
  // pitch rises subtly (~15%) through the verse. The filter
  // cutoff tracks character warmth (silver = muffled, gold = open).
  // Lifetime enrichment from totalAveMarias adds harmonics.

  // Root note per prayer type (Hz)
  const PRAYER_FREQ = {
    'P': 130.81, // C3 — Padre Nuestro (grounding)
    'A': 164.81, // E3 — Ave María (warm)
    'G': 196.00, // G3 — Gloria (bright, ascending)
    'F': 146.83, // D3 — Creed (contemplative)
    'LL': 155.56, // Eb3 — Letanía
    'S': 155.56, // Eb3 — Salve
  };
  const getBaseFreq = () => PRAYER_FREQ[rezoData.id] || PRAYER_FREQ[rezoData.id?.[0]] || 164.81;

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('rosario_sound_enabled', String(next));
      if (!next && synthRef.current) {
        synthRef.current.gainNode.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
      }
      return next;
    });
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      audioCtxRef.current = ctx;

      // Master gain
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);

      // Osc1: sine — fundamental tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(getBaseFreq(), ctx.currentTime);

      // Osc2: triangle — harmonic warmth (filtered)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(getBaseFreq() * 1.5, ctx.currentTime); // 5th above

      // Osc3: soft sine pad — octave below for depth
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(getBaseFreq() * 0.5, ctx.currentTime);
      const padGain = ctx.createGain();
      padGain.gain.value = 0; // starts silent, grows with enrichment

      // Filter shapes the timbre based on warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      // Routing: osc1 + osc2→filter → gainNode → destination
      osc.connect(gainNode);
      osc2.connect(filter);
      filter.connect(gainNode);
      osc3.connect(padGain);
      padGain.connect(gainNode);

      osc.start();
      osc2.start();
      osc3.start();

      synthRef.current = { gainNode, osc, osc2, osc3, filter, padGain };
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  // Called on pointer activity (on/off toggle)
  const modulateAudio = (isActive) => {
    if (!soundEnabled || !synthRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const { gainNode } = synthRef.current;
    if (isActive) {
      gainNode.gain.setTargetAtTime(0.04, ctx.currentTime, 0.08);
    } else {
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    }
  };

  // Called every 50ms by warmth timer — smoothly modulates pitch, filter, volume
  // based on the CURRENT character's live warmth and verse progress.
  const updateAudioWarmth = () => {
    if (!soundEnabled || !synthRef.current || !audioCtxRef.current) return;
    if (charProgressIndex < 0) return;
    const ctx = audioCtxRef.current;
    const { osc, osc2, osc3, filter, padGain, gainNode } = synthRef.current;
    const t = ctx.currentTime;

    const tRosos = totalRosasRef.current || 0;
    const enrichment = Math.min(1, Math.log10(tRosos + 1) / 7.8);

    // Progress through verse: 0 → 1
    const progress = charProgressIndex / Math.max(1, totalChars - 1);

    // Live warmth of character at cursor: 0 → 1
    const reachedAt = charReachedAtRef.current[charProgressIndex];
    const liveDwell = reachedAt ? Date.now() - reachedAt : 0;
    const warmth = Math.min(1, liveDwell / 2000);

    // --- Frequency: base × (1 + progress×0.15) — subtle ascent through verse ---
    const baseFreq = getBaseFreq();
    const freq = baseFreq * (1 + progress * 0.15);
    osc.frequency.setTargetAtTime(freq, t, 0.15);
    osc2.frequency.setTargetAtTime(freq * 1.5, t, 0.15);       // 5th harmonic
    osc3.frequency.setTargetAtTime(freq * 0.5, t, 0.15);       // octave below

    // --- Filter: warmth opens the cutoff (silver = muffled, gold = open) ---
    const cutoff = 300 + warmth * 2200 + enrichment * 800;
    filter.frequency.setTargetAtTime(cutoff, t, 0.1);

    // --- Volume: base + warmth bonus + enrichment bonus ---
    const vol = 0.03 + warmth * 0.025 + enrichment * 0.02;
    gainNode.gain.setTargetAtTime(vol, t, 0.08);

    // --- Pad: grows with enrichment (accumulated prayer depth) ---
    padGain.gain.setTargetAtTime(enrichment * 0.03, t, 0.2);
  };

  // Verse start chime — pitch matches prayer type
  const playActivationChime = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const base = getBaseFreq();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * 2, ctx.currentTime);        // octave up
      osc.frequency.setValueAtTime(base * 2.5, ctx.currentTime + 0.06); // major 3rd
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { /* ignore */ }
  }, [soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verse completion: brief ascending arpeggio, silver or gold depending on speed
  const playVerseCompleteSound = useCallback((avgDwell) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const base = getBaseFreq();
      const isWarm = avgDwell >= 150;
      // 3-note ascending arpeggio
      const notes = isWarm
        ? [base * 2, base * 2.5, base * 3]       // major arpeggio (warm)
        : [base * 2, base * 2.25, base * 2.67];  // cooler intervals (silver)
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isWarm ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(isWarm ? 0.05 : 0.04, ctx.currentTime + i * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.2);
      });
    } catch (e) { /* ignore */ }
  }, [soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prayer completion: richer resolved chord
  const playPrayerCompleteSound = useCallback(() => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const base = getBaseFreq();
      // Full major chord (root + 3rd + 5th + octave)
      [base, base * 1.25, base * 1.5, base * 2].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 2, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04 - i * 0.005, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      });
    } catch (e) { /* ignore */ }
  }, [soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps


  // ═══════════════════════════════════════════════════════
  // ─── State helpers ───
  // ═══════════════════════════════════════════════════════

  const resetVerseState = () => {
    setVersoIndex(0);
    setCharProgressIndex(-1);
    setIsVerseActivated(false);
    setIsVersoComplete(false);
    setIsPrayerComplete(false);
    charReachedAtRef.current = [];
    charDwellRef.current = [];
    verseWarmthRef.current = [];
    verseWiggleRef.current = [];
    mouseWiggleRef.current = { lastX: null, lastY: null, samples: [] };
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
  };

  const advanceVerse = (direction) => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    const currentIdx = versoIndexRef.current;
    const newIndex = currentIdx + direction;
    if (newIndex >= totalVersos) { setIsVersoComplete(false); setIsPrayerComplete(true); return; }
    if (newIndex < 0) return;
    setVersoIndex(newIndex);
    setCharProgressIndex(-1);
    setIsVerseActivated(false);
    setIsVersoComplete(false);
    charReachedAtRef.current = [];
    charDwellRef.current = [];
  };

  useEffect(() => { advanceVerseRef.current = advanceVerse; });


  // ═══════════════════════════════════════════════════════
  // ─── Effects ───
  // ═══════════════════════════════════════════════════════

  // Stamp timestamps for newly-reached characters AND lock dwell for passed ones
  useEffect(() => {
    if (charProgressIndex >= 0) {
      const now = Date.now();
      for (let i = 0; i <= charProgressIndex; i++) {
        if (!charReachedAtRef.current[i]) {
          // HEAD START: if the previous character had a long dwell, this char
          // was in the bleed zone and pre-warmed. Backdate its timestamp so it
          // doesn't snap from bleed-gold back to raw silver.
          let headStart = 0;
          if (i > 0 && charReachedAtRef.current[i - 1]) {
            const prevDwell = now - charReachedAtRef.current[i - 1];
            if (prevDwell > 200) {
              headStart = Math.min(prevDwell * 0.25, 600);
            }
          }
          charReachedAtRef.current[i] = now - headStart;
        }
        // Lock dwell for chars the cursor has moved PAST.
        if (i < charProgressIndex && charDwellRef.current[i] === undefined) {
          charDwellRef.current[i] = now - charReachedAtRef.current[i];
        }
      }
      // Clear ahead (supports backward movement)
      for (let i = charProgressIndex + 1; i < charReachedAtRef.current.length; i++) {
        charReachedAtRef.current[i] = null;
        charDwellRef.current[i] = undefined;
      }
    }
  }, [charProgressIndex]);

  // Warmth animation + audio: re-render every 50ms while reading
  useEffect(() => {
    if (charProgressIndex < 0 || isVersoComplete || isPrayerComplete) return;
    const timer = setInterval(() => {
      setWarmthTick(t => t + 1);
      updateAudioWarmth(); // sync sound to visual warmth
    }, 50);
    return () => clearInterval(timer);
  }, [charProgressIndex, isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verse auto-advance — brief flash then quick transition
  useEffect(() => {
    if (isVersoComplete && !isPrayerComplete) {
      // Record verse stats for rose fingerprint
      const dwells = charDwellRef.current.filter(d => d !== undefined && d !== null);
      const avgDwell = dwells.length > 0 ? dwells.reduce((s, d) => s + d, 0) / dwells.length : 200;
      verseWarmthRef.current.push(Math.min(1, avgDwell / 1000));
      // Compute wiggle from mouse variance
      const ws = mouseWiggleRef.current.samples;
      let wiggle = 0;
      if (ws.length >= 3) {
        const avg = ws.reduce((a, b) => a + b, 0) / ws.length;
        const variance = ws.reduce((sum, v) => sum + (v - avg) ** 2, 0) / ws.length;
        wiggle = Math.min(5, Math.sqrt(variance));
      }
      verseWiggleRef.current.push(wiggle);
      mouseWiggleRef.current.samples = []; // reset for next verse

      playVerseCompleteSound(avgDwell);
      autoAdvanceTimer.current = setTimeout(() => advanceVerse(1), 350);
      return () => clearTimeout(autoAdvanceTimer.current);
    }
  }, [isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prayer completion
  useEffect(() => {
    if (isPrayerComplete) {
      if (rezoData.id === 'A') {
        addRosas(1);
        // Store unique rose fingerprint — maps verse warmth/wiggle to path slots
        const N = RoseDrawing.PATH_COUNT;
        const vw = verseWarmthRef.current;
        const vg = verseWiggleRef.current;
        const warmthProfile = Array.from({ length: N }, (_, i) => {
          const vi = Math.floor(i * totalVersos / N);
          return vw[Math.min(vi, vw.length - 1)] || 0.15;
        });
        const wiggleProfile = Array.from({ length: N }, (_, i) => {
          const vi = Math.floor(i * totalVersos / N);
          return vg[Math.min(vi, vg.length - 1)] || 0;
        });
        storeRoseData({ warmthProfile, wiggleProfile, verseCount: totalVersos });
      }
      playPrayerCompleteSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const timer = setTimeout(() => {
        if (currentPrayerIndex < secuencia.length - 1) setCurrentPrayerIndex(prev => prev + 1);
        resetVerseState();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hold mode
  useEffect(() => {
    if (modoInteraccion === 'hold' && isCargando && !isVersoComplete && !isPrayerComplete) {
      if (!isVerseActivated) setIsVerseActivated(true);
      holdTimerRef.current = setInterval(() => {
        setCharProgressIndex(prev => {
          const next = prev + 1;
          if (next >= totalChars) {
            setIsVersoComplete(true);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
            return totalChars - 1;
          }
          return next;
        });
      }, 80); // ~12 chars/second ≈ 3 words/second
      return () => clearInterval(holdTimerRef.current);
    }
    return () => { if (holdTimerRef.current) clearInterval(holdTimerRef.current); };
  }, [modoInteraccion, isCargando, isVersoComplete, isPrayerComplete, totalChars, isVerseActivated]);

  // Wheel handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => { e.preventDefault(); if (advanceVerseRef.current) advanceVerseRef.current(e.deltaY > 0 ? 1 : -1); };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);


  // ═══════════════════════════════════════════════════════
  // ─── Character detection from pointer (DOM-based) ───
  // ═══════════════════════════════════════════════════════
  //
  // Uses getBoundingClientRect() on word-level <span> refs to find
  // which word the mouse is over, then interpolates within that
  // word to find the specific character. Handles multi-line text.

  const findCharAtPointer = (clientX, clientY) => {
    if (wordSpanRefs.current.length === 0 || totalChars === 0) return -1;
    const M = 15; // ~thumbnail-width margin for forgiving touch/mouse detection

    let lastPassedGlobal = -1;

    for (let w = 0; w < wordSpanRefs.current.length; w++) {
      const span = wordSpanRefs.current[w];
      if (!span) continue;
      const rect = span.getBoundingClientRect();
      const wordLen = currentWords[w].length;
      const baseGlobal = wordCharOffsets[w];

      // Word is on a line ABOVE the pointer → fully passed
      if (clientY > rect.bottom + M) {
        lastPassedGlobal = baseGlobal + wordLen - 1;
        continue;
      }

      // Word is on a line BELOW the pointer → stop
      if (clientY < rect.top - M) break;

      // Same line — mouse is LEFT of this word (beyond margin)
      if (clientX < rect.left - M) {
        return lastPassedGlobal;
      }

      // Mouse is WITHIN or NEAR this word (extended hit zone)
      if (clientX <= rect.right + M) {
        const pctInWord = Math.max(0, Math.min(0.999, (clientX - rect.left) / rect.width));
        const localChar = Math.floor(pctInWord * wordLen);
        return baseGlobal + localChar;
      }

      // Mouse is RIGHT of this word
      lastPassedGlobal = baseGlobal + wordLen - 1;
    }

    return lastPassedGlobal;
  };


  // ═══════════════════════════════════════════════════════
  // ─── Pointer handlers ───
  // ═══════════════════════════════════════════════════════

  const handlePointerDown = (e) => {
    initAudio();
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isVerticalGesture.current = false;
    if (modoInteraccion === 'hold') {
      setIsCargando(true);
    } else if (e.pointerType === 'touch' && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handleTrackPointer = (clientX, clientY, pointerType) => {
    // Vertical gesture (touch only)
    if (pointerType === 'touch' && pointerStartY.current !== null && !isVerticalGesture.current) {
      const dY = clientY - pointerStartY.current;
      const dX = clientX - (pointerStartX.current || 0);
      if (Math.abs(dY) > 50 && Math.abs(dY) > Math.abs(dX) * 1.5) {
        isVerticalGesture.current = true;
        advanceVerse(dY < 0 ? 1 : -1);
        modulateAudio(false);
        if (modoInteraccion === 'hold') setIsCargando(false);
        return;
      }
    }
    if (isVerticalGesture.current) return;
    if (modoInteraccion !== 'swipe' || isPrayerComplete || isVersoComplete) return;

    // ─── ACTIVATION GATE ───
    // Instead of requiring the mouse at the screen edge, activate when the
    // mouse is in the LEFT HALF of the text area. This is where the first
    // words are — intuitive for any user.
    if (!isVerseActivated) {
      const textRect = textoRef.current?.getBoundingClientRect();
      if (textRect) {
        const textMidX = textRect.left + textRect.width * 0.5;
        const isNearText = clientY >= textRect.top - 30 && clientY <= textRect.bottom + 30;
        if (clientX <= textMidX && isNearText) {
          setIsVerseActivated(true);
          initAudio();
          playActivationChime();
          // Find which char the mouse is actually on and start there
          const charIdx = findCharAtPointer(clientX, clientY);
          setCharProgressIndex(Math.max(0, charIdx));
          modulateAudio(true);
        }
      }
      return;
    }

    // ─── CHARACTER TRACKING (DOM-based) ───
    const charIdx = findCharAtPointer(clientX, clientY);
    if (charIdx < 0) return;

    if (charIdx !== charProgressIndex) {
      setCharProgressIndex(charIdx);
      modulateAudio(true);

      // Track mouse distance for wiggle profile
      if (mouseWiggleRef.current.lastX !== null) {
        const dx = clientX - mouseWiggleRef.current.lastX;
        const dy = clientY - mouseWiggleRef.current.lastY;
        mouseWiggleRef.current.samples.push(Math.sqrt(dx * dx + dy * dy));
        if (mouseWiggleRef.current.samples.length > 25) mouseWiggleRef.current.samples.shift();
      }
      mouseWiggleRef.current.lastX = clientX;
      mouseWiggleRef.current.lastY = clientY;

      // Auto-complete when reaching last char
      if (charIdx >= totalChars - 1) {
        setIsVersoComplete(true);
        modulateAudio(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
      }
    }
  };

  const handlePointerMove = (e) => { handleTrackPointer(e.clientX, e.clientY, e.pointerType); };
  const handleMouseMove = (e) => { handleTrackPointer(e.clientX, e.clientY, 'mouse'); };

  const handlePointerUp = (e) => {
    if (modoInteraccion === 'hold') setIsCargando(false);
    else if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
    pointerStartY.current = null;
    pointerStartX.current = null;
    isVerticalGesture.current = false;
    modulateAudio(false);
  };


  // ═══════════════════════════════════════════════════════
  // ─── Character-level rendering with bleed ───
  // ═══════════════════════════════════════════════════════
  //
  // Each character is a <span>. Colors are based on:
  //  1. Whether the char has been reached (charProgressIndex)
  //  2. How long since it was reached (silver → gold → deep gold)
  //  3. Distance from the progress cursor (bleed/conduction effect)
  //
  // Bleed: characters 1–3 positions AHEAD of the cursor get partial
  // brightness, as if heat conducts forward through the text.

  const renderVersoInteractivo = (words) => {
    const tRosos = totalRosasRef.current || 0;
    const enrichment = Math.min(1, Math.log10(tRosos + 1) / 7.8);
    const glowSize = 6 + enrichment * 10;
    const now = Date.now();
    const notStarted = charProgressIndex < 0 && !isPrayerComplete && !isVersoComplete;

    // Suppress unused-var lint for warmthTick (forces re-render for animation)
    void warmthTick;

    return words.map((word, wordIdx) => {
      const letters = word.split('');
      const baseGlobal = wordCharOffsets[wordIdx];

      const renderedLetters = letters.map((letter, letterIdx) => {
        const gi = baseGlobal + letterIdx; // global char index

        // ── First letter pulse (visual anchor when verse not started) ──
        if (notStarted && gi === 0) {
          return (
            <span key={letterIdx} style={{
              animation: 'pulse-first-letter 2s ease-in-out infinite',
            }}>{letter}</span>
          );
        }

        // ── Unstarted chars ──
        if (notStarted) {
          return <span key={letterIdx} style={{ color: '#333' }}>{letter}</span>;
        }

        // ── Completed verse/prayer: adaptive flash (silver for fast, gold for slow) ──
        if (isPrayerComplete || isVersoComplete) {
          // Compute average dwell to determine flash warmth
          const dwells = charDwellRef.current.filter(d => d !== undefined && d !== null);
          const avgDwell = dwells.length > 0
            ? dwells.reduce((s, d) => s + d, 0) / dwells.length
            : 200;
          const flashAnim = avgDwell < 150 ? 'verse-flash-silver' : 'verse-flash-gold';
          return (
            <span key={letterIdx} style={{
              animation: `${flashAnim} 0.3s ease-out forwards`,
            }}>{letter}</span>
          );
        }

        // ── Calculate distance from progress cursor ──
        const dist = gi - charProgressIndex; // negative = behind, positive = ahead

        // ── BEHIND the cursor (already read) ──
        // Uses LOCKED dwell time — fast swipes stay silver, slow reading stays warm.
        if (dist < 0) {
          const dwell = charDwellRef.current[gi] || 0; // frozen when cursor moved past
          const color = colorFromElapsed(dwell);
          const shadow = glowFromElapsed(dwell, glowSize);
          return (
            <span key={letterIdx} style={{
              color: toRGB(color),
              textShadow: shadow,
              transition: 'text-shadow 0.15s ease',
            }}>{letter}</span>
          );
        }

        // ── AT the cursor (LIVE dwell — keeps toasting while static) ──
        if (dist === 0) {
          const reachedAt = charReachedAtRef.current[gi];
          const liveDwell = reachedAt ? now - reachedAt : 0;
          const color = colorFromElapsed(liveDwell);
          const shadow = glowFromElapsed(liveDwell, glowSize);
          return (
            <span key={letterIdx} style={{
              color: toRGB(color),
              textShadow: shadow,
              transition: 'text-shadow 0.1s ease',
            }}>{letter}</span>
          );
        }

        // ── BLEED ZONE: 1–4 chars ahead ──
        // When the cursor lingers, bleed heat also intensifies (conduction)
        if (dist <= 4) {
          const cursorReachedAt = charReachedAtRef.current[charProgressIndex];
          const cursorDwell = cursorReachedAt ? now - cursorReachedAt : 0;
          const lingerBonus = Math.min(0.35, cursorDwell / 4000); // up to +0.35 over 4s
          const baseBleed = Math.max(0, 0.45 - (dist - 1) * 0.13);
          const totalHeat = Math.min(0.8, baseBleed + lingerBonus);
          const bleedTarget = cursorDwell > 600 ? GOLD : SILVER; // warm bleed when cursor is hot
          const bleedColor = lerpColor(UNREAD, bleedTarget, totalHeat);
          return (
            <span key={letterIdx} style={{
              color: toRGB(bleedColor),
              transition: 'color 0.08s linear',
            }}>{letter}</span>
          );
        }

        // ── UNREAD ──
        return <span key={letterIdx} style={{ color: '#333', transition: 'color 0.1s ease' }}>{letter}</span>;
      });

      return (
        <React.Fragment key={`${versoIndex}-${wordIdx}`}>
          <span ref={el => { wordSpanRefs.current[wordIdx] = el; }}>
            {renderedLetters}
          </span>
          {wordIdx < words.length - 1 && ' '}
        </React.Fragment>
      );
    });
  };


  // ═══════════════════════════════════════════════════════
  // ─── Macetero click ───
  // ═══════════════════════════════════════════════════════

  const handleMaceteroClick = (seqIndex) => {
    setCurrentPrayerIndex(seqIndex);
    resetVerseState();
  };

  // Hint text
  const notStarted = charProgressIndex < 0 && !isVersoComplete && !isPrayerComplete;

  // ═══════════════════════════════════════════════════════
  // ─── JSX ───
  // ═══════════════════════════════════════════════════════

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', backgroundColor: '#0A0A0A',
      userSelect: 'none', WebkitUserSelect: 'none'
    }}>

      {/* ─── MODE + SOUND TOGGLES ─── */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: '5px' }}>
        <button onClick={toggleSound} style={miniBtn} title={soundEnabled ? 'Silenciar' : 'Activar sonido'}>
          {soundEnabled ? '🔊 Sonido' : '🔇 Silencio'}
        </button>
        <button onClick={() => setModoInteraccion(m => m === 'swipe' ? 'hold' : 'swipe')} style={miniBtn}>
          {modoInteraccion === 'swipe' ? '✋ Deslizar' : '👇 Mantener'}
        </button>
        <TutorialOverlay 
          title="Foco de Oración" 
          imageSrc={antonyImg}
          text="Mueve tu dedo o cursor sobre las letras lentamente. Como decía San Antonio de Padua: 'Las acciones hablan más fuerte que las palabras; que enseñen tus acciones y hablen tus palabras.'&#10;&#10;Dedicarle tiempo a cada letra hace que tu rosa interior florezca con colores más intensos."
        />
      </div>

      {/* ─── MACETÓN ─── */}
      <div style={{
        flex: '0 0 20%', borderBottom: '1px solid #222', padding: '15px 5px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        marginTop: '30px', overflowX: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(6, 1fr)',
          gridTemplateColumns: 'repeat(11, 1fr)', 
          gap: '3px', height: '100%', maxWidth: '500px', width: '100%'
        }}>
          {(() => {
            // Figure out how many 'A' items are completed in the current grid
            const completedAvesInGrid = maceteroMap.filter((m, i) => i < oracionesCompletadasEnTotal && m.id === 'A').length;
            const roses = getRoseData();
            let seenAves = 0;

            return maceteroMap.map((oracion, i) => {
              const completada = i < oracionesCompletadasEnTotal;
              const esActual = i === oracionesCompletadasEnTotal;
              const esPadreNuestro = oracion.id === 'P';

              // Map this 'A' to a stored rose
              let targetRose = null;
              if (oracion.id === 'A') {
                if (completada) {
                  // We map backwards: the most recently completed 'A' gets the most recent rose.
                  // So the 1st completed 'A' gets rose[length - completedAvesInGrid].
                  const targetIndex = roses.length - completedAvesInGrid + seenAves;
                  if (targetIndex >= 0 && targetIndex < roses.length) {
                    targetRose = roses[targetIndex];
                  }
                  seenAves++;
                }
              }

              return (
                <div key={i} onClick={() => handleMaceteroClick(oracion.seqIndex)} style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  backgroundColor: completada ? '#2a0a0a' : '#111',
                  border: esActual ? '1px solid #D4AF37' : '1px solid #222',
                  borderRadius: '3px', fontSize: 'min(2vh, 16px)', cursor: 'pointer',
                  overflow: 'hidden'
                }}>
                  {esPadreNuestro ? (
                    <span style={{ opacity: completada || esActual ? 1 : 0.15, filter: completada || esActual ? 'none' : 'grayscale(1)' }}>✝️</span>
                  ) : (
                    completada && targetRose ? (
                      <RoseDrawing
                        progress={1}
                        warmthProfile={targetRose.warmthProfile}
                        wiggleProfile={targetRose.wiggleProfile}
                        enrichment={Math.min(1, Math.log10((totalRosasRef.current || 0) + 1) / 7.8)}
                        size={30}
                        compact={true}
                      />
                    ) : esActual ? (
                      <RoseDrawing
                        progress={overallProgress}
                        liveWarmth={(() => {
                          if (charProgressIndex < 0) return 0;
                          const reachedAt = charReachedAtRef.current[charProgressIndex];
                          const liveDwell = reachedAt ? Date.now() - reachedAt : 0;
                          return Math.max(0, Math.min(1, liveDwell / 2000));
                        })()}
                        warmthProfile={(() => {
                          const vw = verseWarmthRef.current;
                          return Array.from({ length: 9 }, (_, i) => vw[Math.floor(i / 3)] || 0.1);
                        })()}
                        size={30}
                        compact={true}
                      />
                    ) : (
                      <span style={{ opacity: 0.15, filter: 'grayscale(1)' }}>🌹</span>
                    )
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* ─── ICON / ROSE DRAWING ─── */}
      <div style={{ flex: '0 0 30%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {rezoData.id === 'A' ? (
          /* ── Progressive SVG rose for Ave María ── */
          <div style={{
            filter: `drop-shadow(0 0 ${6 + overallProgress * 12}px ${rezoData.color})`,
            transform: `scale(${0.85 + overallProgress * 0.15})`,
            opacity: Math.max(0.5, 0.5 + overallProgress * 0.5),
            transition: 'transform 0.3s ease-out, filter 0.4s ease, opacity 0.3s',
          }}>
            <RoseDrawing
              progress={overallProgress}
              liveWarmth={(() => {
                if (charProgressIndex < 0) return 0;
                const reachedAt = charReachedAtRef.current[charProgressIndex];
                const liveDwell = reachedAt ? Date.now() - reachedAt : 0;
                return Math.max(0, Math.min(1, liveDwell / 2000));
              })()}
              warmthProfile={(() => {
                const N = RoseDrawing.PATH_COUNT;
                const vw = verseWarmthRef.current;
                return Array.from({ length: N }, (_, i) => {
                  const vi = Math.floor(i * totalVersos / N);
                  return vw[Math.min(vi, vw.length - 1)] || 0.1;
                });
              })()}
              wiggleProfile={(() => {
                const N = RoseDrawing.PATH_COUNT;
                const vg = verseWiggleRef.current;
                return Array.from({ length: N }, (_, i) => {
                  const vi = Math.floor(i * totalVersos / N);
                  return vg[Math.min(vi, vg.length - 1)] || 0;
                });
              })()}
              enrichment={Math.min(1, Math.log10((totalRosasRef.current || 0) + 1) / 7.8)}
              size={Math.min(160, window.innerHeight * 0.23)}
            />
          </div>
        ) : (
          /* ── Emoji fallback for non-Ave-María prayers ── */
          <div style={{
            fontSize: 'min(25vh, 150px)', lineHeight: 1,
            filter: `drop-shadow(0 0 ${10 + overallProgress * 15}px ${rezoData.color}) saturate(${Math.max(20, overallProgress * 100)}%)`,
            transform: `scale(${0.8 + overallProgress * 0.2})`,
            opacity: Math.max(0.4, overallProgress),
            transition: 'transform 0.2s ease-out, filter 0.3s ease, opacity 0.3s'
          }}>
            {rezoData.icono}
          </div>
        )}
      </div>

      {/* ─── VERSE INTERACTION ZONE ─── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          flex: '1', position: 'relative',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: '20px 30px',
          touchAction: 'none', cursor: 'default'
        }}
      >
        {/* Previous verse preview */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => advanceVerse(-1)}
          style={{
            textAlign: 'center', color: '#333',
            fontSize: 'clamp(0.85rem, 1.8vh, 1rem)',
            opacity: versoIndex > 0 && !isPrayerComplete ? 0.4 : 0,
            marginBottom: '20px', minHeight: '1.5em',
            cursor: 'pointer', transition: 'opacity 0.3s',
            pointerEvents: versoIndex > 0 && !isPrayerComplete ? 'auto' : 'none'
          }}
        >
          {versoIndex > 0 && !isPrayerComplete ? rezoData.versos[versoIndex - 1] : ''}
        </div>

        {/* Current verse text */}
        <div
          ref={textoRef}
          style={{
            display: 'inline-block', position: 'relative', textAlign: 'center',
            fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3.5vh, 1.8rem)',
            lineHeight: 1.6, zIndex: 10,
            padding: '5px 10px',
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }}
        >
          {renderVersoInteractivo(currentWords)}
        </div>

        {/* Next verse preview */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => advanceVerse(1)}
          style={{
            textAlign: 'center', color: '#333',
            fontSize: 'clamp(0.85rem, 1.8vh, 1rem)',
            opacity: versoIndex < totalVersos - 1 && !isPrayerComplete ? 0.4 : 0,
            marginTop: '20px', minHeight: '1.5em',
            cursor: 'pointer', transition: 'opacity 0.3s',
            pointerEvents: versoIndex < totalVersos - 1 && !isPrayerComplete ? 'auto' : 'none'
          }}
        >
          {versoIndex < totalVersos - 1 && !isPrayerComplete ? rezoData.versos[versoIndex + 1] : ''}
        </div>

        {/* Hint — only for hold mode or prayer completion */}
        {(isPrayerComplete || (modoInteraccion === 'hold' && notStarted)) && (
          <div style={{
            position: 'absolute', bottom: '15px', width: 'calc(100% - 60px)',
            textAlign: 'center',
            color: isPrayerComplete ? '#D4AF37' : '#555',
            fontSize: '0.8rem', fontWeight: 'bold',
            animation: isPrayerComplete ? 'pulse-hint 1.2s ease-in-out infinite' : 'none',
          }}>
            {isPrayerComplete ? '✨ Oración completada' : '👇 Mantén presionado 👇'}
          </div>
        )}

        <style>{`
          @keyframes pulse-hint {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.02); }
          }
          @keyframes pulse-first-letter {
            0%, 100% {
              color: #555;
              text-shadow: 0 0 4px rgba(185, 185, 195, 0.15);
            }
            50% {
              color: #AAA;
              text-shadow: 0 0 14px rgba(185, 185, 195, 0.5);
            }
          }
          @keyframes verse-flash-gold {
            0% { color: #D4AF37; text-shadow: 0 0 8px rgba(212, 175, 55, 0.6); }
            35% { color: #F5E6A0; text-shadow: 0 0 18px rgba(245, 215, 160, 0.8); }
            100% { color: #D4AF37; text-shadow: 0 0 4px rgba(212, 175, 55, 0.3); }
          }
          @keyframes verse-flash-silver {
            0% { color: #B9B9C3; text-shadow: 0 0 6px rgba(185, 185, 195, 0.5); }
            35% { color: #E8E8F0; text-shadow: 0 0 14px rgba(210, 210, 220, 0.7); }
            100% { color: #B9B9C3; text-shadow: 0 0 3px rgba(185, 185, 195, 0.25); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Styles ───
const miniBtn = {
  background: 'rgba(20, 20, 20, 0.8)',
  backdropFilter: 'blur(5px)',
  color: '#888',
  border: '1px solid #333',
  borderRadius: '15px',
  padding: '8px 12px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  touchAction: 'manipulation'
};
