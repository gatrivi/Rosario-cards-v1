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
import SacredDust from '../common/SacredDust';
import { getCosmicPhases } from '../../utils/cosmicModulator';
import { SYMBOL_MAP } from '../../data/SacredSymbols';


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

// Word-level reading pace — no longer character-based speeds.
// Each verse enforces a minimum total duration regardless of word count.

export default function RoseView({ 
  currentPrayerIndex, 
  misterioActual, 
  onUpdateProgreso, 
  onBack, 
  soundEnabled, 
  onToggleSound,
  meditationRitmo = 'incienso', // eslint-disable-line no-unused-vars
  simpleMode = false
}) {
  const { addRosas, storeRoseData, totalAveMarias } = useAveMariaStats();
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
  const [versoIndex, setVersoIndex] = useState(0);
  const [charProgressIndex, setCharProgressIndex] = useState(-1); 
  const [isVerseActivated, setIsVerseActivated] = useState(false);
  const [isVersoComplete, setIsVersoComplete] = useState(false);
  const [isPrayerComplete, setIsPrayerComplete] = useState(false);
  const [isCargando, setIsCargando] = useState(false);
  const [warmthTick, setWarmthTick] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showBloom, setShowBloom] = useState(false);

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
  const holdDelayTimerRef = useRef(null);
  const pointerStartX = useRef(null);
  const pointerStartY = useRef(null);
  const isVerticalGesture = useRef(false);
  const versoIndexRef = useRef(0);
  const advanceVerseRef = useRef(null);
  const roseSeedRef = useRef(0);
  const lastAdvanceTimeRef = useRef(0);
  const isVersoCompleteRef = useRef(false);
  const isPrayerCompleteRef = useRef(false);
  const charProgressIndexRef = useRef(-1);
  const wordProgressIndexRef = useRef(-1);
  const lastWordAdvanceTimeRef = useRef(0);

  // Audio
  const audioCtxRef = useRef(null);
  const synthRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  useEffect(() => { versoIndexRef.current = versoIndex; }, [versoIndex]);
  useEffect(() => { isVersoCompleteRef.current = isVersoComplete; }, [isVersoComplete]);
  useEffect(() => { isPrayerCompleteRef.current = isPrayerComplete; }, [isPrayerComplete]);
  useEffect(() => { charProgressIndexRef.current = charProgressIndex; }, [charProgressIndex]);
  useEffect(() => { wordProgressIndexRef.current = -1; lastWordAdvanceTimeRef.current = 0; }, [currentPrayerIndex, versoIndex]);

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

  // ═══════════════════════════════════════════════════════
  // ─── Audio System ───
  // ═══════════════════════════════════════════════════════

  // Root note per prayer type (Hz)
  const PRAYER_FREQ = {
    'P': 130.81, // C3 — Padre Nuestro (grounding)
    'A': 164.81, // E3 — Ave María (warm)
    'G': 196.00, // G3 — Gloria (bright, ascending)
    'F': 146.83, // D3 — Creed (contemplative)
    'LL': 130.81, // C3
    'S': 130.81, // C3
  };
  const getBaseFreq = useCallback(() => PRAYER_FREQ[rezoData.id] || PRAYER_FREQ[rezoData.id?.[0]] || 164.81, [rezoData.id]); // eslint-disable-line react-hooks/exhaustive-deps


  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = audioManager.getContext();
      if (!ctx) return;
      audioCtxRef.current = ctx;

      if (!soundEnabledRef.current) ctx.suspend();

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);

      // --- AMBIANCE LAYER: Deep Monastery Drone (Foundational) ---
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(getBaseFreq() * 0.25, ctx.currentTime); // 2 Octaves down
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.005; // Very low constant hum
      droneOsc.connect(droneGain);
      droneGain.connect(gainNode);
      droneOsc.start();

      // --- SACRED ORGAN LAYERS ---
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
      
      // Osc4: Sine (Celestial Choir / Harmonic Shimmer)
      const osc4 = ctx.createOscillator();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(getBaseFreq() * 4, ctx.currentTime);
      const celestialGain = ctx.createGain();
      celestialGain.gain.value = 0;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.015; 

      // Reverb Simulation: Long delay + Filter feedback
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.3;
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.5;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.4;
      const reverbFilter = ctx.createBiquadFilter();
      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.value = 800;
      
      delay.connect(feedback);
      feedback.connect(reverbFilter);
      reverbFilter.connect(delay);
      delay.connect(reverbGain);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500; 
      filter.Q.value = 1.5;

      // LFO for "Sacred Breath" (Tremolo + Filter)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15; 
      lfoGain.gain.value = 0;     
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
      filter.connect(delay);
      reverbGain.connect(gainNode);

      osc.start();
      osc2.start();
      osc3.start();
      osc4.start();

      synthRef.current = { osc, osc2, osc3, osc4, celestialGain, lfo, lfoGain, filter, gainNode, padGain, droneGain };
    } else if (audioCtxRef.current.state === 'suspended' && soundEnabledRef.current) {
      audioCtxRef.current.resume();
    }
  }, [getBaseFreq]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called on pointer activity (on/off toggle)
  const modulateAudio = (active) => {
    if (!synthRef.current || !soundEnabledRef.current) return;
    const { gainNode } = synthRef.current;
    if (active) {
      updateAudioWarmth();
    } else {
      // Don't kill it instantly, leave a tiny "ghost" hum
      gainNode.gain.setTargetAtTime(0.002, audioCtxRef.current.currentTime, 0.6);
    }
  };

  const updateAudioWarmth = () => {
    if (!synthRef.current || !soundEnabledRef.current) return;
    const { filter, gainNode, padGain, celestialGain, lfoGain, droneGain } = synthRef.current;
    const t = audioCtxRef.current.currentTime;
    
    const reachedAt = charReachedAtRef.current[charProgressIndex];
    const liveDwell = reachedAt ? Date.now() - reachedAt : 0;
    const warmth = Math.min(1, liveDwell / 3500);

    const tRosos = totalRosasRef.current || 0;
    const totalEnrichment = Math.min(1, Math.log10(tRosos + 1) / 8); 

    const sessionProgress = (currentPrayerIndex + 1) / (secuencia.length || 1);
    const sessionEnrichment = Math.min(1, sessionProgress);

    // --- Cosmic Modulation ---
    const cosmic = getCosmicPhases();
    
    const deepBase = cosmic.pluto * 15 + cosmic.saturn * 8;
    
    const lfoSpeed = 0.12 + (cosmic.mercury * 0.08);
    if (synthRef.current.lfo) {
      synthRef.current.lfo.frequency.setTargetAtTime(lfoSpeed, t, 1.5);
    }

    // --- Filter: extremely subtle opening ---
    const jupiterMod = cosmic.jupiter * 200;
    const targetFreq = 450 + warmth * 350 + sessionEnrichment * 500 + totalEnrichment * 250 + jupiterMod + deepBase;
    filter.frequency.setTargetAtTime(targetFreq, t, 0.8);
    
    filter.Q.setTargetAtTime(1.5 + sessionEnrichment * 3 + cosmic.neptune * 2, t, 0.8); 

    // --- Ambiance Layers ---
    celestialGain.gain.setTargetAtTime(sessionEnrichment * 0.025 + (cosmic.uranus * 0.01), t, 1.5); 
    droneGain.gain.setTargetAtTime(0.005 + (cosmic.pluto * 0.005), t, 2.0);
    lfoGain.gain.setTargetAtTime(sessionEnrichment * 60 + (cosmic.mercury * 30), t, 1.5);

    // --- Volume ---
    const baseVolume = 0.015 + (totalEnrichment * 0.008);
    gainNode.gain.setTargetAtTime(baseVolume + warmth * 0.006, t, 0.8);

    padGain.gain.setTargetAtTime(0.012 + totalEnrichment * 0.012, t, 1.0);
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
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    // Throttle rapid advances (e.g. trackpad wheel, event duplication)
    const now = Date.now();
    if (now - lastAdvanceTimeRef.current < 400) return;
    lastAdvanceTimeRef.current = now;
    const currentIdx = versoIndexRef.current;
    const newIndex = currentIdx + direction;
    if (newIndex >= totalVersos) { setIsVersoComplete(false); setIsPrayerComplete(true); return; }
    if (newIndex < 0) return;
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
      updateAudioWarmth(); // sync sound to visual warmth
    }, 50);
    return () => clearInterval(timer);
  }, [charProgressIndex, isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verse completion — record stats and chime, but DO NOT auto-advance.
  // The user must release to move to the next verse.
  useEffect(() => {
    if (isVersoComplete && !isPrayerComplete) {
      const dwells = charDwellRef.current.filter(d => d !== undefined && d !== null);
      const avgDwell = dwells.length > 0 ? dwells.reduce((s, d) => s + d, 0) / dwells.length : 200;
      verseWarmthRef.current.push(Math.min(1, avgDwell / 1000));
      const ws = mouseWiggleRef.current.samples;
      let wiggle = 0;
      if (ws.length >= 3) {
        const avg = ws.reduce((a, b) => a + b, 0) / ws.length;
        const variance = ws.reduce((sum, v) => sum + (v - avg) ** 2, 0) / ws.length;
        wiggle = Math.min(5, Math.sqrt(variance));
      }
      verseWiggleRef.current.push(wiggle);
      mouseWiggleRef.current.samples = [];
      playVerseCompleteSound(avgDwell);
    }
  }, [isVersoComplete, isPrayerComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prayer completion — sound, vibration, rose data, but NO auto-advance.
  // The user must release to move to the next prayer.
  useEffect(() => {
    if (isPrayerComplete) {
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
    if (current >= currentWords.length - 1) {
      if (!isVersoCompleteRef.current) {
        setIsVersoComplete(true);
        modulateAudio(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
      }
      return;
    }
    const next = current + 1;
    wordProgressIndexRef.current = next;
    lastWordAdvanceTimeRef.current = Date.now();

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
      400,
      Math.ceil(6000 / Math.max(1, currentWords.length))
    );
    if (now - lastWordAdvanceTimeRef.current < minInterval) return false;
    advanceWordCore();
    return true;
  };

  // Hold mode — reveals one word per tick at reading pace.
  useEffect(() => {
    if (isCargando && !isVersoComplete && !isPrayerComplete) {
      holdDelayTimerRef.current = setTimeout(() => {
        if (!isVerseActivated) {
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
        const MIN_VERSE_MS = 6000;
        const wordInterval = Math.max(
          400,
          Math.ceil(MIN_VERSE_MS / Math.max(1, currentWords.length))
        );
        holdTimerRef.current = setInterval(() => {
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
  }, [isCargando, isVersoComplete, isPrayerComplete, totalChars, isVerseActivated, meditationRitmo, initAudio, playActivationChime]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const M = 60;
    for (let w = 0; w < wordSpanRefs.current.length; w++) {
      const span = wordSpanRefs.current[w];
      if (!span) continue;
      const rect = span.getBoundingClientRect();
      if (clientY >= rect.top - M && clientY <= rect.bottom + M &&
          clientX >= rect.left - M && clientX <= rect.right + M) {
        return w;
      }
    }
    return -1;
  };


  // ═══════════════════════════════════════════════════════
  // ─── Pointer handlers ───
  // ═══════════════════════════════════════════════════════

  const handlePointerDown = (e) => {
    initAudio();
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isVerticalGesture.current = false;
    
    // Always start charging (allows hold-to-advance alongside swipe)
    setIsCargando(true);

    if (e.pointerType === 'touch' && e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
    
    // Simple Mode: Allow advance on simple tap (if not already completed)
    if (simpleMode && !isVersoComplete && !isPrayerComplete) {
      advanceVerse(1);
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
        setIsCargando(false);
        return;
      }
    }
    if (isVerticalGesture.current) return;
    if (isPrayerComplete || isVersoComplete) return;

    const textRect = textoRef.current?.getBoundingClientRect();
    const isNearText = textRect && 
      clientY >= textRect.top - 150 && clientY <= textRect.bottom + 150;

    // ─── ACTIVATION ───
    if (!isVerseActivated && (isNearText || isCargando)) {
      setIsVerseActivated(true);
      initAudio();
      playActivationChime();
      const wordIdx = findWordAtPointer(clientX, clientY);
      const startWord = Math.max(0, wordIdx);
      wordProgressIndexRef.current = startWord;
      lastWordAdvanceTimeRef.current = Date.now();
      const endChar = wordCharOffsets[startWord] + currentWords[startWord].length - 1;
      charProgressIndexRef.current = endChar;
      const now = Date.now();
      for (let i = 0; i <= endChar; i++) {
        if (!charReachedAtRef.current[i]) charReachedAtRef.current[i] = now;
      }
      setCharProgressIndex(endChar);
      modulateAudio(true);
    }

    // ─── HOVER / DRAG TRACKING ───
    if (isVerseActivated) {
      const wordIdx = findWordAtPointer(clientX, clientY);
      if (wordIdx < 0) return;
      if (wordIdx <= wordProgressIndexRef.current) return;
      tryAdvanceWord();
    }
  };

  const handlePointerMove = (e) => { handleTrackPointer(e.clientX, e.clientY, e.pointerType); };

  const handlePointerUp = (e) => {
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
      if (currentPrayerIndex < secuencia.length - 1) {
        setShowBloom(true);
        setTimeout(() => setShowBloom(false), 1200);
        onUpdateProgreso(currentPrayerIndex + 1);
      }
      resetVerseState();
    } else if (!simpleMode && isVersoCompleteRef.current) {
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
            simpleMode={simpleMode}
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
