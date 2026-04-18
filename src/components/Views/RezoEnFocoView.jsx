import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { useCloudSync } from '../../hooks/useCloudSync';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';

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
  const { addRosas, totalAveMarias } = useAveMariaStats();
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
  const [warmthTick, setWarmthTick] = useState(0); // Drives re-renders for color animation

  // ─── Refs ───
  const containerRef = useRef(null);
  const textoRef = useRef(null);
  const wordSpanRefs = useRef([]);       // DOM elements for each word (for getBoundingClientRect)
  const charReachedAtRef = useRef([]);   // Timestamp when each global char was first reached
  const charDwellRef = useRef([]);       // LOCKED dwell ms for passed chars (fast = small, slow = large)
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
  // ─── Audio ───
  // ═══════════════════════════════════════════════════════

  const initAudio = () => {
    if (!audioCtxRef.current) {
       const AudioContext = window.AudioContext || window.webkitAudioContext;
       if (!AudioContext) return;
       audioCtxRef.current = new AudioContext();
       const gainNode = audioCtxRef.current.createGain();
       gainNode.gain.value = 0;
       gainNode.connect(audioCtxRef.current.destination);
       const osc = audioCtxRef.current.createOscillator();
       osc.type = 'sine';
       osc.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);
       osc.connect(gainNode);
       osc.start();
       const osc2 = audioCtxRef.current.createOscillator();
       osc2.type = 'triangle';
       osc2.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);
       const filter = audioCtxRef.current.createBiquadFilter();
       filter.type = 'lowpass';
       filter.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
       osc2.connect(filter);
       filter.connect(gainNode);
       osc2.start();
       synthRef.current = { gainNode, osc, osc2, filter };
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const modulateAudio = (isActive) => {
    if (!synthRef.current || !audioCtxRef.current) return;
    const tRosos = totalRosasRef.current || 0;
    const enrichment = Math.min(1, Math.log10(tRosos + 1) / 7.8);
    const { gainNode, osc2, filter } = synthRef.current;
    if (isActive) {
      osc2.frequency.setTargetAtTime(220 * (1 + enrichment * 0.5), audioCtxRef.current.currentTime, 0.1);
      filter.frequency.setTargetAtTime(800 + enrichment * 2000, audioCtxRef.current.currentTime, 0.1);
      gainNode.gain.setTargetAtTime(0.05 + enrichment * 0.05, audioCtxRef.current.currentTime, 0.05);
    } else {
      gainNode.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
    }
  };

  const playActivationChime = useCallback(() => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) { /* ignore */ }
  }, []);


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

  // Warmth animation: re-render every 50ms while reading is active
  useEffect(() => {
    if (charProgressIndex < 0 || isVersoComplete || isPrayerComplete) return;
    const timer = setInterval(() => setWarmthTick(t => t + 1), 50);
    return () => clearInterval(timer);
  }, [charProgressIndex, isVersoComplete, isPrayerComplete]);

  // Verse auto-advance — brief flash then quick transition (350ms)
  useEffect(() => {
    if (isVersoComplete && !isPrayerComplete) {
      autoAdvanceTimer.current = setTimeout(() => advanceVerse(1), 350);
      return () => clearTimeout(autoAdvanceTimer.current);
    }
  }, [isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prayer completion
  useEffect(() => {
    if (isPrayerComplete) {
      if (rezoData.id === 'A') addRosas(1);
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

      {/* ─── MODE TOGGLE ─── */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: '5px' }}>
        <button onClick={() => setModoInteraccion(m => m === 'swipe' ? 'hold' : 'swipe')} style={miniBtn}>
          {modoInteraccion === 'swipe' ? '✋ Deslizar' : '👇 Mantener'}
        </button>
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
          {maceteroMap.map((oracion, i) => {
            const completada = i < oracionesCompletadasEnTotal;
            const esActual = i === oracionesCompletadasEnTotal;
            const esPadreNuestro = oracion.id === 'P';
            return (
              <div key={i} onClick={() => handleMaceteroClick(oracion.seqIndex)} style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: completada ? '#2a0a0a' : '#111',
                border: esActual ? '1px solid #D4AF37' : '1px solid #222',
                borderRadius: '3px', fontSize: 'min(2vh, 16px)', cursor: 'pointer'
              }}>
                {completada || esActual ? (
                  esPadreNuestro ? '✝️' : '🌹'
                ) : (
                  <span style={{ opacity: 0.15, filter: 'grayscale(1)' }}>
                    {esPadreNuestro ? '✝️' : '🌹'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ICON ─── */}
      <div style={{ flex: '0 0 30%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{
          fontSize: 'min(25vh, 150px)', lineHeight: 1,
          filter: `drop-shadow(0 0 ${10 + overallProgress * 15}px ${rezoData.color}) saturate(${Math.max(20, overallProgress * 100)}%)`,
          transform: `scale(${0.8 + overallProgress * 0.2})`,
          opacity: Math.max(0.4, overallProgress),
          transition: 'transform 0.2s ease-out, filter 0.3s ease, opacity 0.3s'
        }}>
          {rezoData.icono}
        </div>
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
