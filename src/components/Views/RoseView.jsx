/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 * 
 * This code and its associated "Cosmic Alignment" algorithms, interaction models,
 * and procedural devotional logic are protected as intellectual and spiritual property.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import audioManager from '../../utils/audioManager';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { useCloudSync } from '../../hooks/useCloudSync';
import RosarioPrayerBook from '../../data/RosarioPrayerBook';
import RoseDrawing from './RoseDrawing';
import SacredDrawing from './SacredDrawing';
import SacredText from './SacredText';
import { getCosmicPhases } from '../../utils/cosmicModulator';
import { SYMBOL_MAP } from '../../data/SacredSymbols';
import TutorialOverlay from '../common/TutorialOverlay';
import antonyImg from '../../data/assets/img/st-anthony-of-padua-icon-402.jpg';

// ─── Prayer data helpers ───

export const getPrayerData = (id, mysteryType = 'gozosos') => {
  const apertura = RosarioPrayerBook.apertura.find(p => p.id === id);
  if (apertura) return apertura;
  const decada = RosarioPrayerBook.decada.find(p => p.id === id);
  if (decada) return decada;
  const mystery = RosarioPrayerBook.mysteries[mysteryType]?.find(p => p && p.id === id);
  if (mystery) return mystery;
  const cierre = RosarioPrayerBook.cierre.find(p => p.id === id);
  if (cierre) return cierre;
  return null;
};

export const getSequenceData = (mysteryType = 'gozosos') => {
  const seqMap = { 'gozosos': 'RGo', 'dolorosos': 'RDo', 'gloriosos': 'RGl', 'luminosos': 'RL' };
  const sequenceKeys = RosarioPrayerBook[seqMap[mysteryType]] || RosarioPrayerBook.RGo;
  
  return sequenceKeys.map(id => {
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
    return { id, title: rawData.title, icono, color, versos, img: rawData.img, imgmo: rawData.imgmo };
  }).filter(Boolean);
};



// ═══════════════════════════════════════════════════════
// ─── Component ───
// ═══════════════════════════════════════════════════════

const MEDITATION_SPEEDS = {
  oro: 45,      // Fluid
  incienso: 85, // Balanced
  mirra: 155    // Deep
};

export default function RoseView({ 
  currentPrayerIndex, 
  misterioActual, 
  onUpdateProgreso, 
  onBack, 
  soundEnabled, 
  onToggleSound,
  meditationRitmo = 'incienso'
}) {
  const { addRosas, storeRoseData, getRoseData, totalAveMarias } = useAveMariaStats();
  const totalRosasRef = useRef(totalAveMarias);
  useEffect(() => { totalRosasRef.current = totalAveMarias; }, [totalAveMarias]);

  const [secuencia] = useState(() => getSequenceData(misterioActual));

  // ─── Cloud Sync ───
  const { cloudState, syncToCloud } = useCloudSync();
  const [loadedPrayerIndex, setLoadedPrayerIndex] = useState(false);

  useEffect(() => {
    if (cloudState && !loadedPrayerIndex) {
      if (cloudState.currentPrayerIndex !== undefined && cloudState.todayDate === new Date().toDateString()) {
         onUpdateProgreso(Math.min(cloudState.currentPrayerIndex, secuencia.length - 1));
      }
      setLoadedPrayerIndex(true);
    }
  }, [cloudState, loadedPrayerIndex, secuencia.length, onUpdateProgreso]);

  useEffect(() => {
    if (loadedPrayerIndex) {
      syncToCloud({ currentPrayerIndex, todayDate: new Date().toDateString() });
    }
  }, [currentPrayerIndex, loadedPrayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const rezoData = secuencia[currentPrayerIndex];

  // ─── Interaction State ───
  const [modoInteraccion, setModoInteraccion] = useState('swipe');
  const [versoIndex, setVersoIndex] = useState(0);
  const [charProgressIndex, setCharProgressIndex] = useState(-1); 
  const [isVerseActivated, setIsVerseActivated] = useState(false);
  const [isVersoComplete, setIsVersoComplete] = useState(false);
  const [isPrayerComplete, setIsPrayerComplete] = useState(false);
  const [isCargando, setIsCargando] = useState(false);
  const [warmthTick, setWarmthTick] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

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
  const roseSeedRef = useRef(0);

  // Audio
  const audioCtxRef = useRef(null);
  const synthRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  useEffect(() => { versoIndexRef.current = versoIndex; }, [versoIndex]);

  // ─── Derived ───
  const totalVersos = rezoData.versos.length;
  const currentVerseText = isPrayerComplete ? 'Amén.' : (rezoData.versos[versoIndex] || '');
  const currentWords = currentVerseText.split(/\s+/).filter(w => w.length > 0);

  // Initialize unique seed for the current rose
  useEffect(() => {
    if (rezoData.id === 'A') {
      roseSeedRef.current = Date.now();
    }
  }, [currentPrayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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
    'LL': 130.81, // C3
    'S': 130.81, // C3
  };
  const getBaseFreq = () => PRAYER_FREQ[rezoData.id] || PRAYER_FREQ[rezoData.id?.[0]] || 164.81;


  const initAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = audioManager.getContext();
      if (!ctx) return;
      audioCtxRef.current = ctx;

      if (!soundEnabledRef.current) ctx.suspend();

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);

      // --- Gothic Organ Timbre ---
      // Osc1: Sine (Foundational Root)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(getBaseFreq(), ctx.currentTime);

      // Osc2: Triangle (Perfect 5th — adds organ "reed" texture)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(getBaseFreq() * 1.5, ctx.currentTime);

      // Osc3: Sine (Octave below — adds depth/solemnity)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(getBaseFreq() * 0.5, ctx.currentTime);
      
      // Osc4: Sine (2 Octaves up — "Celestial" shimmer, grows with session)
      const osc4 = ctx.createOscillator();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(getBaseFreq() * 4, ctx.currentTime);
      const celestialGain = ctx.createGain();
      celestialGain.gain.value = 0;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.02; // Very soft base volume

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600; // Muffled, atmospheric
      filter.Q.value = 1;

      // LFO for subtle "breath"
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2; // 0.2 Hz (one breath every 5s)
      lfoGain.gain.value = 0;     // Starts static
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      osc.connect(filter);
      osc2.connect(filter);
      osc3.connect(padGain);
      osc4.connect(celestialGain);
      celestialGain.connect(filter);
      padGain.connect(filter);
      filter.connect(gainNode);

      osc.start();
      osc2.start();
      osc3.start();
      osc4.start();

      synthRef.current = { osc, osc2, osc3, osc4, celestialGain, lfo, lfoGain, filter, gainNode, padGain };
    } else if (audioCtxRef.current.state === 'suspended' && soundEnabledRef.current) {
      audioCtxRef.current.resume();
    }
  };

  // Called on pointer activity (on/off toggle)
  const modulateAudio = (active) => {
    if (!synthRef.current || !soundEnabledRef.current) return;
    const { gainNode } = synthRef.current;
    if (active) {
      updateAudioWarmth();
    } else {
      gainNode.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.3);
    }
  };

  // Called every 50ms by warmth timer — smoothly modulates pitch, filter, volume
  // based on the CURRENT character's live warmth and verse progress.
  const updateAudioWarmth = () => {
    if (!synthRef.current || !soundEnabledRef.current) return;
    const { filter, gainNode, padGain, celestialGain, lfoGain } = synthRef.current;
    const t = audioCtxRef.current.currentTime;
    
    // Subtle warmth changes only (no aggressive frequency shifts)
    const reachedAt = charReachedAtRef.current[charProgressIndex];
    const liveDwell = reachedAt ? Date.now() - reachedAt : 0;
    const warmth = Math.min(1, liveDwell / 3000);

    const tRosos = totalRosasRef.current || 0;
    const totalEnrichment = Math.min(1, Math.log10(tRosos + 1) / 8); 

    // Session-based reward: Grows as you get closer to completing the mystery
    const sessionProgress = (currentPrayerIndex + 1) / (secuencia.length || 1);
    const sessionEnrichment = Math.min(1, sessionProgress);

    // --- Cosmic Modulation (The Great Journey) ---
    const cosmic = getCosmicPhases();
    
    // Saturn (29y) & Pluto (248y) affect the "Ground" (Depth and Sub)
    const deepBase = cosmic.pluto * 10 + cosmic.saturn * 5;
    
    // Mercury (7d) affects LFO speed (The Breath)
    const lfoSpeed = 0.15 + (cosmic.mercury * 0.1);
    if (synthRef.current.lfo) {
      synthRef.current.lfo.frequency.setTargetAtTime(lfoSpeed, t, 1.0);
    }

    // --- Filter: extremely subtle opening & resonance increase ---
    // Jupiter modulates the Seasonal Cutoff range
    const jupiterMod = cosmic.jupiter * 150;
    const targetFreq = 400 + warmth * 300 + sessionEnrichment * 400 + totalEnrichment * 200 + jupiterMod + deepBase;
    filter.frequency.setTargetAtTime(targetFreq, t, 0.5);
    
    // Neptune (164y) modulates the ethereal "wash" (Resonance)
    filter.Q.setTargetAtTime(1 + sessionEnrichment * 2 + cosmic.neptune * 1.5, t, 0.5); 

    // --- High Celestial Voice: Uranus (84y) modulates shimmer depth ---
    celestialGain.gain.setTargetAtTime(sessionEnrichment * 0.015 + (cosmic.uranus * 0.005), t, 1.0); 

    // --- LFO Shimmer: "Living" sound grows as you deepen prayer ---
    lfoGain.gain.setTargetAtTime(sessionEnrichment * 50 + (cosmic.mercury * 20), t, 1.0);

    // --- Volume: constant low gain, no "blaring" ---
    const baseVolume = 0.012 + (totalEnrichment * 0.005);
    gainNode.gain.setTargetAtTime(baseVolume + warmth * 0.004, t, 0.5);

    // --- Pad: static stability ---
    padGain.gain.setTargetAtTime(0.01 + totalEnrichment * 0.01, t, 0.5);
  };

  // Verse start chime — pitch matches prayer type
  const playActivationChime = useCallback(() => {
    if (!soundEnabledRef.current || !audioCtxRef.current) return;
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Verse completion: Campana Gregoriana (Deep warm bell)
  const playVerseCompleteSound = useCallback((avgDwell) => {
    if (!soundEnabledRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const base = getBaseFreq() * 0.5; 
      
      // Gothic Bell harmonics
      const freqs = [base, base * 2.01, base * 3.02, base * 4.03]; 
      
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = (i === 0) ? 'sine' : 'triangle'; // triangle adds that "metal strike" harmonic
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04 - (i * 0.01), ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 4.1);
      });
    } catch (e) { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Prayer completion: richer resolved chord
  const playPrayerCompleteSound = useCallback(() => {
    if (!soundEnabledRef.current || !audioCtxRef.current) return;
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


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
        storeRoseData({ 
          warmthProfile, 
          wiggleProfile, 
          verseCount: totalVersos,
          timestamp: roseSeedRef.current || Date.now() 
        });
      }
      playPrayerCompleteSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const timer = setTimeout(() => {
        if (currentPrayerIndex < secuencia.length - 1) onUpdateProgreso(currentPrayerIndex + 1);
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
      }, MEDITATION_SPEEDS[meditationRitmo] || 80); 
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
    if (!hasInteracted) setHasInteracted(true);
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
    // ─── ACTIVATION CHECK ───
    if (!isVerseActivated) {
      const textRect = textoRef.current?.getBoundingClientRect();
      if (textRect) {
        // Broadened vertical margin for activation
        const isNearText = clientY >= textRect.top - 80 && clientY <= textRect.bottom + 80;
        // User can tap/start from anywhere on the text area, not just left half
        if (isNearText) {
          setIsVerseActivated(true);
          initAudio();
          playActivationChime();
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

      // Finalization threshold:
      // For normal verses, reach the last char. 
      // For very short ones (<15 chars), reaching the last 20% or even just moving suffices.
      const threshold = totalChars < 15 ? Math.floor(totalChars * 0.8) : totalChars - 1;

      if (charIdx >= threshold) {
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
  // ─── Macetero click ───
  // ═══════════════════════════════════════════════════════

  const handleMaceteroClick = (seqIndex) => {
    onUpdateProgreso(seqIndex);
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
    }}
    ref={containerRef}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onPointerLeave={handlePointerUp}
    onMouseMove={handleMouseMove}
    >
      
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
            text={currentVerseText}
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
         />
      </div>

      {/* Instruction */}
      <div style={{ 
          position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center',
          fontSize: '0.7rem', color: '#333', letterSpacing: '1px',
          opacity: (charProgressIndex < 0 && !isVersoComplete && !isPrayerComplete) ? 0.6 : 0, transition: 'opacity 0.5s'
      }}>
        Desliza sobre las letras para rezar
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
