/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 * 
 * This code and its associated "Cosmic Alignment" algorithms, interaction models,
 * and procedural devotional logic are protected as intellectual and spiritual property.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import usePrayerSoundscape from '../../hooks/usePrayerSoundscape';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { useCloudSync } from '../../hooks/useCloudSync';
import { getSequenceData, RHYTHM_CONFIG } from './roseViewHelpers';
import RoseDrawing from './RoseDrawing';
import SacredDrawing from './SacredDrawing';
import SacredText from './SacredText';
import SacredDust from '../common/SacredDust';
import { SYMBOL_MAP } from '../../data/SacredSymbols';
import { readRoseSession, saveRoseSession } from './roseSession';

const debug = () => {};


export default function RoseView({
  currentPrayerIndex,
  misterioActual,
  devotion,
  onUpdateProgreso,
  onBack,
  soundEnabled,
  onToggleSound,
  meditationRitmo = 'incienso',
  simpleMode = false
}) {
  const { addRosas, storeRoseData, totalAveMarias } = useAveMariaStats();
  const totalRosasRef = useRef(totalAveMarias);
  useEffect(() => { totalRosasRef.current = totalAveMarias; }, [totalAveMarias]);

  const secuencia = useMemo(() => getSequenceData(misterioActual, devotion), [misterioActual, devotion]);
  const sessionMystery = devotion || misterioActual;
  const safeIndex = Math.min(
    Math.max(currentPrayerIndex, 0),
    Math.max(secuencia.length - 1, 0)
  );
  const currentRhythm = RHYTHM_CONFIG[meditationRitmo] || RHYTHM_CONFIG.incienso;


  // ─── Cloud Sync ───
  const { cloudState, syncToCloud } = useCloudSync();
  const [loadedPrayerIndex, setLoadedPrayerIndex] = useState(false);

  useEffect(() => {
    if (cloudState && !loadedPrayerIndex) {
      // AppShell owns the prayer index; don't overwrite it on each return from the garden.
      setLoadedPrayerIndex(true);
    }
  }, [cloudState, loadedPrayerIndex, secuencia.length, onUpdateProgreso]);

  useEffect(() => {
    if (loadedPrayerIndex && !devotion) {
      syncToCloud({
        rosaryIndex: currentPrayerIndex,
        todayDate: new Date().toDateString(),
      });
    }
  }, [currentPrayerIndex, loadedPrayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const rezoData = secuencia[safeIndex] || secuencia[0];

  // ─── Interaction State ───
  const [resume] = useState(() => readRoseSession(sessionMystery, currentPrayerIndex));
  const [versoIndex, setVersoIndex] = useState(resume?.versoIndex ?? 0);
  const [charProgressIndex, setCharProgressIndex] = useState(resume?.charProgressIndex ?? -1);
  const [isVerseActivated, setIsVerseActivated] = useState(resume?.isVerseActivated ?? false);
  const [isVersoComplete, setIsVersoComplete] = useState(resume?.isVersoComplete ?? false);
  const [isPrayerComplete, setIsPrayerComplete] = useState(resume?.isPrayerComplete ?? false);
  const [isCargando, setIsCargando] = useState(false);
  const [warmthTick, setWarmthTick] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showBloom, setShowBloom] = useState(false);

  // ─── Refs ───
  const containerRef = useRef(null);
  const textoRef = useRef(null);
  const wordSpanRefs = useRef([]);       // DOM elements for each word (for getBoundingClientRect)
  const charReachedAtRef = useRef(resume?.charReachedAt?.map(time => time ? Date.now() : null) ?? []);   // Timestamp when each global char was first reached
  const charDwellRef = useRef(resume?.charDwell ?? []);       // LOCKED dwell ms for passed chars (fast = small, slow = large)
  const verseWarmthRef = useRef(resume?.warmth ?? []);     // Per-verse average warmth (for rose fingerprint)
  const verseWiggleRef = useRef(resume?.wiggle ?? []);     // Per-verse mouse variance (for rose uniqueness)
  const mouseWiggleRef = useRef({ lastX: null, lastY: null, samples: [] });
  const autoAdvanceTimer = useRef(null);
  const holdTimerRef = useRef(null);
  const holdDelayTimerRef = useRef(null);
  const pointerStartX = useRef(null);
  const pointerStartY = useRef(null);
  const pointerStartedInTextRef = useRef(false);
  const isVerticalGesture = useRef(false);
  const versoIndexRef = useRef(resume?.versoIndex ?? 0);
  const advanceVerseRef = useRef(null);
  const roseSeedRef = useRef(resume?.seed ?? Date.now());
  const countedRef = useRef(resume?.isPrayerComplete ?? false);
  const prayerKey = sessionMystery + ':' + currentPrayerIndex;
  const previousPrayerKeyRef = useRef(prayerKey);
  const latestSessionRef = useRef(null);
  useEffect(() => {
    latestSessionRef.current = {
      mystery: sessionMystery, prayerIndex: currentPrayerIndex, versoIndex,
      charProgressIndex, isVerseActivated, isVersoComplete, isPrayerComplete,
      charReachedAt: charReachedAtRef.current, charDwell: charDwellRef.current,
      warmth: verseWarmthRef.current, wiggle: verseWiggleRef.current, seed: roseSeedRef.current,
    };
  });
  useEffect(() => {
    const save = () => { if (latestSessionRef.current) saveRoseSession(latestSessionRef.current); };
    window.addEventListener('pagehide', save);
    return () => { save(); window.removeEventListener('pagehide', save); };
  }, []);
  const lastAdvanceTimeRef = useRef(0);
  const isVersoCompleteRef = useRef(resume?.isVersoComplete ?? false);
  const isPrayerCompleteRef = useRef(resume?.isPrayerComplete ?? false);
  const charProgressIndexRef = useRef(resume?.charProgressIndex ?? -1);
  const wordProgressIndexRef = useRef(-1);
  const lastWordAdvanceTimeRef = useRef(0);
  const isPointerDownRef = useRef(false); // guards pointerup/pointerleave double-fire on touch

  useEffect(() => { versoIndexRef.current = versoIndex; }, [versoIndex]);
  useEffect(() => { isVersoCompleteRef.current = isVersoComplete; }, [isVersoComplete]);
  useEffect(() => { isPrayerCompleteRef.current = isPrayerComplete; }, [isPrayerComplete]);
  useEffect(() => { charProgressIndexRef.current = charProgressIndex; }, [charProgressIndex]);
  useEffect(() => {
    let offset = 0;
    wordProgressIndexRef.current = -1;
    const words = (rezoData.versos[versoIndex] || '').split(/\s+/).filter(Boolean);
    words.forEach((word, index) => {
      offset += word.length;
      if (offset - 1 <= charProgressIndexRef.current) wordProgressIndexRef.current = index;
    });
    lastWordAdvanceTimeRef.current = 0;
  }, [currentPrayerIndex, versoIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (previousPrayerKeyRef.current === prayerKey) return;
    previousPrayerKeyRef.current = prayerKey;
    countedRef.current = false;
    roseSeedRef.current = Date.now();
    verseWarmthRef.current = [];
    verseWiggleRef.current = [];
    charReachedAtRef.current = [];
    charDwellRef.current = [];
    setVersoIndex(0);
    setCharProgressIndex(-1);
    setIsVerseActivated(false);
    setIsVersoComplete(false);
    setIsPrayerComplete(false);
    setIsCargando(false);
  }, [prayerKey]);

  // ─── Derived ───
  const totalVersos = rezoData.versos.length;
  const currentVerseText = isPrayerComplete ? 'Amén.' : (rezoData.versos[versoIndex] || '');
  const currentWords = currentVerseText.split(/\s+/).filter(w => w.length > 0);

  // Seed and completed strokes survive garden visits.

  // Precompute character offsets: wordCharOffsets[w] = global index of the first char of word w
  const wordCharOffsets = [];
  let _off = 0;
  for (const w of currentWords) { wordCharOffsets.push(_off); _off += w.length; }
  const totalChars = _off;

  const overallProgress = isPrayerComplete ? 1 :
    (versoIndex + (charProgressIndex >= 0 ? (charProgressIndex + 1) / Math.max(1, totalChars) : 0)) / Math.max(1, totalVersos);

  // ═══════════════════════════════════════════════════════
  // ─── Audio System ───
  // ═══════════════════════════════════════════════════════

  const { initAudio, modulateAudio, playActivationChime, playVerseCompleteSound, playPrayerCompleteSound } = usePrayerSoundscape({
    enabled: soundEnabled,
    active: isCargando && isVerseActivated && !isVersoComplete && !isPrayerComplete,
    theme: devotion || misterioActual,
    prayerId: rezoData.id,
  });


  // ═══════════════════════════════════════════════════════
  // ─── State helpers ───
  // ═══════════════════════════════════════════════════════

  const resetVerseState = () => {
    setVersoIndex(0);
    setCharProgressIndex(-1);
    charProgressIndexRef.current = -1;
    wordProgressIndexRef.current = -1;
    lastWordAdvanceTimeRef.current = 0;
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
    debug(`[RoseView] advanceVerse: dir=${direction}, currentVersoIndex=${versoIndexRef.current}, totalVersos=${totalVersos}`);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    // Throttle rapid advances (e.g. trackpad wheel, event duplication)
    const now = Date.now();
    if (now - lastAdvanceTimeRef.current < 400) {
      debug(`[RoseView] advanceVerse throttled: elapsed=${now - lastAdvanceTimeRef.current}`);
      return;
    }
    lastAdvanceTimeRef.current = now;
    const currentIdx = versoIndexRef.current;
    const newIndex = currentIdx + direction;
    if (newIndex >= totalVersos) { 
      debug(`[RoseView] reached end of versos, setting isPrayerComplete=true`);
      setIsVersoComplete(false); 
      setIsPrayerComplete(true); 
      return; 
    }
    if (newIndex < 0) {
       debug(`[RoseView] cannot retreat beyond index 0`);
       return;
    }
    debug(`[RoseView] setting versoIndex to ${newIndex}`);
    setVersoIndex(newIndex);
    setCharProgressIndex(-1);
    charProgressIndexRef.current = -1;
    wordProgressIndexRef.current = -1;
    lastWordAdvanceTimeRef.current = 0;
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
    }, 50);
    return () => clearInterval(timer);
  }, [charProgressIndex, isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verse completion — record stats and chime, but DO NOT auto-advance.
  // The user must release to move to the next verse.
  useEffect(() => {
    if (isVersoComplete && !isPrayerComplete) {
      const dwells = charDwellRef.current.filter(d => d !== undefined && d !== null);
      const avgDwell = dwells.length > 0 ? dwells.reduce((s, d) => s + d, 0) / dwells.length : 200;
      verseWarmthRef.current[versoIndex] = Math.min(1, avgDwell / 1000);
      const ws = mouseWiggleRef.current.samples;
      let wiggle = 0;
      if (ws.length >= 3) {
        const avg = ws.reduce((a, b) => a + b, 0) / ws.length;
        const variance = ws.reduce((sum, v) => sum + (v - avg) ** 2, 0) / ws.length;
        wiggle = Math.min(5, Math.sqrt(variance));
      }
      verseWiggleRef.current[versoIndex] = wiggle;
      mouseWiggleRef.current.samples = [];
      playVerseCompleteSound(avgDwell);
    }
  }, [isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prayer completion — sound, vibration, rose data, but NO auto-advance.
  // The user must release to move to the next prayer.
  useEffect(() => {
    if (isPrayerComplete && !countedRef.current) {
      countedRef.current = true;
      if (rezoData.id === 'A') {
        addRosas(1);
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
        storeRoseData({
          verseTraits: { warmth: [...vw], wiggle: [...vg] },
          warmthProfile, 
          wiggleProfile, 
          verseCount: totalVersos,
          timestamp: roseSeedRef.current || Date.now() 
        });
      }
      playPrayerCompleteSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  }, [isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unified WORD-level advancement — people read in staccatos (words), not characters.
  const advanceWordCore = () => {
    const current = wordProgressIndexRef.current;
    debug(`[RoseView] advanceWordCore: currentWordIdx=${current}, totalWords=${currentWords.length}`);
    if (current >= currentWords.length - 1) {
      if (!isVersoCompleteRef.current) {
        debug(`[RoseView] Verse Complete!`);
        setIsVersoComplete(true);
        modulateAudio(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
      }
      return;
    }
    const next = current + 1;
    wordProgressIndexRef.current = next;
    lastWordAdvanceTimeRef.current = Date.now();
    debug(`[RoseView] Advancing to word ${next}: '${currentWords[next]}'`);

    // Reveal all characters up to the end of this word
    const prevEndChar = charProgressIndexRef.current;
    const endChar = wordCharOffsets[next] + currentWords[next].length - 1;
    charProgressIndexRef.current = endChar;
    setCharProgressIndex(endChar);

    const now = Date.now();
    for (let i = prevEndChar + 1; i <= endChar; i++) {
      if (!charReachedAtRef.current[i]) charReachedAtRef.current[i] = now;
    }

    if (next >= currentWords.length - 1) {
      debug(`[RoseView] Verse reached end word`);
      setIsVersoComplete(true);
      modulateAudio(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    } else {
      modulateAudio(true);
    }
  };

  const tryAdvanceWord = () => {
    const now = Date.now();
    const minInterval = Math.max(
      currentRhythm.minWordMs,
      Math.ceil(currentRhythm.minVerseMs / Math.max(1, currentWords.length))
    );
    const elapsed = now - lastWordAdvanceTimeRef.current;
    if (elapsed < minInterval) {
      if (Math.random() < 0.1) debug(`[RoseView] tryAdvanceWord throttled: elapsed=${elapsed}, min=${minInterval}`);
      return false;
    }
    debug(`[RoseView] tryAdvanceWord allowed: elapsed=${elapsed}`);
    advanceWordCore();
    return true;
  };

  // Hold mode — reveals one word per tick at reading pace.
  useEffect(() => {
    if (isCargando && !pointerStartedInTextRef.current && !isVersoComplete && !isPrayerComplete) {
      debug(`[RoseView] Starting Hold Timer...`);
      holdDelayTimerRef.current = setTimeout(() => {
        if (!isVerseActivated) {
          debug(`[RoseView] Activating via Hold Delay`);
          setIsVerseActivated(true);
          initAudio();
          playActivationChime();
          if (wordProgressIndexRef.current < 0) {
            wordProgressIndexRef.current = 0;
            const endChar = wordCharOffsets[0] + currentWords[0].length - 1;
            charProgressIndexRef.current = endChar;
            setCharProgressIndex(endChar);
            const now = Date.now();
            for (let i = 0; i <= endChar; i++) {
              if (!charReachedAtRef.current[i]) charReachedAtRef.current[i] = now;
            }
          }
        }
        const wordInterval = Math.max(
          currentRhythm.minWordMs,
          Math.ceil(currentRhythm.minVerseMs / Math.max(1, currentWords.length))
        );
        debug(`[RoseView] Hold Interval set to ${wordInterval}ms`);
        holdTimerRef.current = setInterval(() => {
          debug(`[RoseView] Hold Timer Tick`);
          advanceWordCore();
        }, wordInterval);
      }, 150);
      return () => {
        if (holdDelayTimerRef.current) clearTimeout(holdDelayTimerRef.current);
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      };
    }
    return () => {
      if (holdDelayTimerRef.current) clearTimeout(holdDelayTimerRef.current);
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [isCargando, isVersoComplete, isPrayerComplete, totalChars, isVerseActivated, currentRhythm, initAudio, playActivationChime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let wheelAccum = 0;
    const handler = (e) => {
      e.preventDefault();
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) > 50) {
        if (advanceVerseRef.current) advanceVerseRef.current(wheelAccum > 0 ? 1 : -1);
        wheelAccum = 0;
      }
    };
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

  const findWordAtPointer = (clientX, clientY) => {
    if (wordSpanRefs.current.length === 0) return -1;
    let nearest = -1;
    let nearestDistance = Infinity;
    for (let w = 0; w < currentWords.length; w++) {
      const span = wordSpanRefs.current[w];
      if (!span) continue;
      const rect = span.getBoundingClientRect();
      const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
      const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
      // Leave room below the letters for a thumb without overlapping word targets.
      if (clientY >= rect.top - 12 && clientY <= rect.bottom + 56 && dx <= 24) {
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearest = w;
          nearestDistance = distance;
        }
      }
    }
    return nearest;
  };


  // ═══════════════════════════════════════════════════════
  // ─── Pointer handlers ───
  // ═══════════════════════════════════════════════════════

  const THUMB_ZONE_START = 0.62;

  const isInThumbZone = (clientY) =>
    clientY >= window.innerHeight * THUMB_ZONE_START;

  const handleTrackPointer = (clientX, clientY, pointerType) => {
    if (!isPointerDownRef.current) return;
    if (!hasInteracted) setHasInteracted(true);

    const mw = mouseWiggleRef.current;
    if (mw.lastX != null && mw.lastY != null) {
      const dx = clientX - mw.lastX;
      const dy = clientY - mw.lastY;
      mw.samples.push(Math.sqrt(dx * dx + dy * dy));
      if (mw.samples.length > 40) mw.samples.shift();
    }
    mw.lastX = clientX;
    mw.lastY = clientY;
    
    const textRect = textoRef.current?.getBoundingClientRect();
    const isNearText = textRect && 
      clientY >= textRect.top - 180 && clientY <= textRect.bottom + 180;

    // Log movement and proximity (sampled)
    if (Math.random() < 0.05) {
      debug(`[RoseView] PointerMove: ${pointerType} at (${clientX}, ${clientY}), isNear: ${isNearText}, active: ${isVerseActivated}, charging: ${isCargando}`);
    }

    // Vertical swipe on text zone; thumb zone is hold-only unless gesture started on text
    if (
      pointerType === 'touch' &&
      pointerStartY.current !== null &&
      !isVerticalGesture.current &&
      !pointerStartedInTextRef.current && !isInThumbZone(clientY)
    ) {
      const dY = clientY - pointerStartY.current;
      const dX = clientX - (pointerStartX.current || 0);
      if (Math.abs(dY) > 50 && Math.abs(dY) > Math.abs(dX) * 1.5) {
        debug(`[RoseView] Vertical Gesture detected: dY=${dY}`);
        isVerticalGesture.current = true;
        advanceVerse(dY < 0 ? 1 : -1);
        modulateAudio(false);
        setIsCargando(false);
        return;
      }
    }
    if (isVerticalGesture.current) return;
    if (isPrayerComplete || isVersoComplete) return;

    // ─── ACTIVATION ───
    // Activate when holding anywhere, or near text — thumb zone always activates
    if (findWordAtPointer(clientX, clientY) < 0) return;
    if (!isVerseActivated) {
      debug(`[RoseView] Activating Verse! Proximity: ${isNearText}, Charging: ${isCargando}`);
      setIsVerseActivated(true);
      initAudio();
      playActivationChime();
      const wordIdx = findWordAtPointer(clientX, clientY);
      const startWord = Math.max(0, wordIdx);
      debug(`[RoseView] Initial word: idx=${wordIdx}, startAt=${startWord}`);
      wordProgressIndexRef.current = startWord;
      lastWordAdvanceTimeRef.current = Date.now();
      const endChar = wordCharOffsets[startWord] - 1;
      charProgressIndexRef.current = endChar;
      const now = Date.now();
      for (let i = 0; i <= endChar; i++) {
        if (!charReachedAtRef.current[i]) charReachedAtRef.current[i] = now;
      }
      setCharProgressIndex(endChar);
      modulateAudio(true);
    }

    // ─── HOVER / DRAG TRACKING ───
    {
      const wordIdx = findWordAtPointer(clientX, clientY);
      if (wordIdx < 0) {
        if (Math.random() < 0.02) debug(`[RoseView] Hover: No word at pointer`);
        return;
      }
      const span = wordSpanRefs.current[wordIdx];
      const rect = span.getBoundingClientRect();
      const letters = Array.from(span.children);
      let li = letters.findIndex(letter => clientX <= letter.getBoundingClientRect().right);
      if (!letters.length) li = Math.floor((clientX - rect.left) / Math.max(1, rect.width) * currentWords[wordIdx].length);
      if (li < 0) li = currentWords[wordIdx].length - 1;
      const next = wordCharOffsets[wordIdx] + Math.min(currentWords[wordIdx].length - 1, Math.max(0, li));
      if (next <= charProgressIndexRef.current) return;
      const now = Date.now();
      for (let i = charProgressIndexRef.current + 1; i <= next; i++) charReachedAtRef.current[i] = now;
      wordProgressIndexRef.current = wordIdx;
      charProgressIndexRef.current = next;
      setCharProgressIndex(next);
      if (next === totalChars - 1) {
        isVersoCompleteRef.current = true;
        setIsVersoComplete(true);
        modulateAudio(false);
      }
    }
  };

  const handlePointerMove = (e) => { handleTrackPointer(e.clientX, e.clientY, e.pointerType); };

  const handlePointerDown = (e) => {
    initAudio();
    debug(`[RoseView] PointerDown: ${e.pointerType}`);
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isVerticalGesture.current = false;
    pointerStartedInTextRef.current = !e.target.closest?.('[data-rose-hold]') &&
      findWordAtPointer(e.clientX, e.clientY) >= 0;
    
    isPointerDownRef.current = true;
    // Always start charging (allows hold-to-advance alongside swipe)
    setIsCargando(true);

    if (e.pointerType === 'touch' && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }

    // ADVANCE WORD ON TAP: if already activated, clicking advances to next word
    if (!pointerStartedInTextRef.current && isVerseActivated && !isVersoComplete && !isPrayerComplete) {
       debug(`[RoseView] Tap-to-Advance word attempt`);
       tryAdvanceWord();
    }
    
    // Simple Mode: Allow advance on simple tap (if not already completed)
    if (simpleMode && !isVersoComplete && !isPrayerComplete) {
      debug(`[RoseView] Simple Mode Tap`);
      advanceVerse(1);
    }
  };

  const handlePointerUp = (e) => {
    debug(`[RoseView] PointerUp: PrayerComp=${isPrayerCompleteRef.current}, VersoComp=${isVersoCompleteRef.current}`);
    // Touch releases fire BOTH pointerup and an implicit pointercancel/leave;
    // without this guard the second event double-fires the advance below
    // (e.g. skipping the "Amén." completion state entirely).
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsCargando(false);
    if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
    pointerStartY.current = null;
    pointerStartX.current = null;
    isVerticalGesture.current = false;
    modulateAudio(false);

    // Advance on release if the verse/prayer is complete.
    // This gives the user control: hold to read, release to move on.
    if (isPrayerCompleteRef.current) {
      debug(`[RoseView] Advance Prayer on Release`);
      if (currentPrayerIndex < secuencia.length - 1) {
        setShowBloom(true);
        setTimeout(() => setShowBloom(false), 1200);
        onUpdateProgreso(currentPrayerIndex + 1);
      }
      resetVerseState();
    } else if (!simpleMode && isVersoCompleteRef.current) {
      debug(`[RoseView] Advance Verse on Release`);
      advanceVerse(1);
    }
  };





  // ═══════════════════════════════════════════════════════
  // ─── Macetero click ───
  // ═══════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════
  // ─── JSX ───
  // ═══════════════════════════════════════════════════════

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', backgroundColor: '#0A0A0A',
      userSelect: 'none', WebkitUserSelect: 'none',
      touchAction: 'none'
    }}
    ref={containerRef}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onPointerLeave={handlePointerUp}
    >
      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: 'var(--app-header-height, 64px)', left: 0, right: 0, zIndex: 30,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', pointerEvents: 'none',
      }}>
        {onBack && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            style={{
              pointerEvents: 'auto', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(212,175,55,0.35)',
              color: '#D4AF37', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem',
            }}
          >
            ← Rosedal
          </button>
        )}
        {onToggleSound && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onToggleSound(); }}
            style={{
              pointerEvents: 'auto', marginLeft: 'auto',
              background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)',
              color: soundEnabled ? '#D4AF37' : '#666', borderRadius: '8px', padding: '6px 10px',
              cursor: 'pointer', fontSize: '0.85rem',
            }}
            aria-label={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>
        )}
      </div>

      {/* ── Layer 1: Ambient Depth ── */}
      <SacredDust isCargando={isCargando || (isVerseActivated && !isVersoComplete)} />

      {/* ── Layer 1.5: Bloom Effect ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: `radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 75%)`,
        opacity: showBloom ? 1 : 0,
        transition: showBloom ? 'none' : 'opacity 1s ease-out',
        pointerEvents: 'none',
        zIndex: 15
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          {/* Subtle Mystery Title */}
          <div style={{ 
            marginTop: '40px', textAlign: 'center', opacity: 0.3, 
            fontSize: '0.7rem', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase' 
          }}>
            {rezoData.title}
          </div>

          {/* ICON / SACRED DRAWING */}
          <div style={{ flex: '0 0 35%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {rezoData.id === 'A' ? (
          /* ── Progressive SVG rose for Ave María ── */
          <div style={{
            filter: `drop-shadow(0 0 ${6 + overallProgress * 12}px ${rezoData.color})`,
            transform: `scale(${0.85 + overallProgress * 0.15})`,
            opacity: Math.max(0.5, 0.5 + overallProgress * 0.5),
            transition: 'transform 0.3s ease-out, filter 0.4s ease, opacity 0.3s',
          }}>
            <RoseDrawing
              verseCount={totalVersos}
              verseTraits={{ warmth: verseWarmthRef.current, wiggle: verseWiggleRef.current }}
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
              seed={roseSeedRef.current}
              size={Math.min(160, window.innerHeight * 0.23)}
            />
          </div>
        ) : (
          /* ── Progressive Sacred Drawing for other prayers ── */
          <div style={{
            filter: `drop-shadow(0 0 ${8 + overallProgress * 15}px ${rezoData.color})`,
            transform: `scale(${0.8 + overallProgress * 0.2})`,
            opacity: Math.max(0.4, 0.4 + overallProgress * 0.6),
            transition: 'transform 0.2s ease-out, filter 0.3s ease, opacity 0.3s'
          }}>
            <SacredDrawing
              verseCount={totalVersos}
              verseTraits={{ warmth: verseWarmthRef.current, wiggle: verseWiggleRef.current }}
              seed={roseSeedRef.current}
              symbolKey={(() => {
                const id = rezoData.id;
                const type = misterioActual; // 'gozosos', 'dolorosos', 'gloriosos', 'luminosos'
                
                // Map MG1-5, MD1-5, ML1-5 to unique keys
                if (id.startsWith('MG')) {
                  const num = id.slice(2);
                  if (type === 'gozosos') return `gozoso_${num}`;
                  if (type === 'gloriosos') return `glorioso_${num}`;
                }
                if (id.startsWith('MD')) return `doloroso_${id.slice(2)}`;
                if (id.startsWith('ML')) return `luminoso_${id.slice(2)}`;
                
                return SYMBOL_MAP[id] || 'cross';
              })()}
              progress={overallProgress}
              liveWarmth={(() => {
                if (charProgressIndex < 0) return 0;
                const reachedAt = charReachedAtRef.current[charProgressIndex];
                const liveDwell = reachedAt ? Date.now() - reachedAt : 0;
                return Math.max(0, Math.min(1, liveDwell / 2000));
              })()}
              warmthProfile={(() => {
                const vw = verseWarmthRef.current;
                return Array.from({ length: 6 }, (_, i) => vw[Math.floor(i * totalVersos / 6)] || 0.1);
              })()}
              wiggleProfile={(() => {
                const vg = verseWiggleRef.current;
                return Array.from({ length: 6 }, (_, i) => vg[Math.floor(i * totalVersos / 6)] || 0);
              })()}
              enrichment={Math.min(1, Math.log10((totalRosasRef.current || 0) + 1) / 7.8)}
              size={Math.min(150, window.innerHeight * 0.21)}
              decadeIndex={(() => {
                // Find distance from last mystery announcement to show growth within decade
                let lastM = 0;
                for (let j = currentPrayerIndex; j >= 0; j--) {
                  if (secuencia[j]?.id.startsWith('M')) { lastM = j; break; }
                }
                return Math.min(9, currentPrayerIndex - lastM);
              })()}
            />
          </div>
        )}
      </div>

      {/* ─── FOCAL TEXT ZONE ─── */}
      <div style={{ 
        flex: '0 0 45%', display: 'flex', justifyContent: 'center', 
        padding: '20px', zIndex: 10, position: 'relative' 
      }}>
         <SacredText 
            ref={textoRef}
            words={currentWords}
            wordCharOffsets={wordCharOffsets}
            charProgressIndex={charProgressIndex}
            isVersoComplete={isVersoComplete}
            isPrayerComplete={isPrayerComplete}
            charReachedAtRef={charReachedAtRef}
            charDwellRef={charDwellRef}
            wordSpanRefs={wordSpanRefs}
            warmthTick={warmthTick}
            totalAveMarias={totalAveMarias}
            simpleMode={simpleMode}
         />
      </div>

      {/* Instruction + thumb hold zone (reachable on large phones) */}
      <div
        style={{
          position: 'absolute',
          // Clear the BottomNav footprint: it is absolutely positioned over the
          // whole bottom strip and (transparent glass-footer) swallows taps.
          bottom: 'var(--app-above-nav, 70px)',
          left: 0,
          right: 0,
          height: 'min(30vh, 240px)',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '10px',
          background: isCargando
            ? 'linear-gradient(transparent 0%, rgba(212,175,55,0.14) 70%)'
            : 'linear-gradient(transparent 0%, rgba(0,0,0,0.55) 75%)',
          touchAction: 'none',
        }}
      >
        <div data-rose-hold="true" style={{
          width: 'min(92%, 420px)',
          minHeight: '72px',
          borderRadius: '16px',
          border: isCargando ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.12)',
          background: isCargando ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 20px',
          transition: 'background 0.3s, border-color 0.3s',
          boxShadow: isCargando ? '0 0 24px rgba(212,175,55,0.2)' : 'none',
        }}>
          <span style={{
            fontSize: simpleMode ? '1.05rem' : '0.85rem',
            color: isCargando ? '#D4AF37' : '#777',
            letterSpacing: '0.06em',
            textAlign: 'center',
            lineHeight: 1.4,
          }}>
            {simpleMode
              ? (isPrayerComplete
                  ? 'Soltá para pasar a la próxima oración'
                  : isVersoComplete
                    ? 'Soltá para seguir con la próxima estrofa'
                    : isCargando ? 'Toca para avanzar el verso' : 'Toca aquí para rezar')
              : (isPrayerComplete
                  ? 'Soltá para pasar a la próxima oración'
                  : isVersoComplete
                    ? 'Soltá para seguir con la próxima estrofa'
                    : isCargando ? 'Mantén… las palabras avanzan solas' : 'Mantén presionado aquí para rezar')}
          </span>
        </div>
      </div>

      <div style={{
          bottom: 'calc(var(--app-above-nav, 70px) + min(30vh, 240px) - 12px)', width: '100%', textAlign: 'center',
          fontSize: '0.65rem', color: '#444', letterSpacing: '1px',
          opacity: (charProgressIndex < 0 && !isVersoComplete && !isPrayerComplete) ? 0.5 : 0,
          transition: 'opacity 0.5s', pointerEvents: 'none', zIndex: 5
      }}>
        {simpleMode ? 'Toca la barra inferior' : 'También puedes deslizar sobre las palabras'}
      </div>

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
      <style>{`
        @keyframes pulseHint {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
