/**
 * CosmicResonator.js
 *
 * Offline Web Audio “Gothic Organ” soundscape:
 * - Persistent oscillator graph (no background node spawning)
 * - Event-driven parameter interpolation via AudioParam.setTargetAtTime
 * - SanctusFlush during chord (mystery) changes to avoid clashing dissonance
 * - Mobile cabinet rattle guard via 65Hz high-pass filter
 */

import { getCosmicPhases } from '../utils/cosmicModulator';
import {
  clamp01,
  smoothstep,
  quantizeToChord,
  getChordFrequencies,
} from '../utils/audioConstants';

const isProbablyMobile = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
};

export default class CosmicResonator {
  constructor(ctx, { misterioActual = 'gozosos', soundEnabled = true } = {}) {
    this.ctx = ctx;
    this.soundEnabled = soundEnabled;

    // Progress state used for parameter blending.
    this.progress = 0;
    this.warmth = 0;
    this.lastChimeTime = -1e9;
    this.activeChimes = 0;
    this.chimeConcurrency = 4;

    // Cosmic base parameters computed once on load (offline / deterministic).
    const cosmic = getCosmicPhases();
    this.cosmic = cosmic;
    this.organBase = this.getOrganBaseParams(cosmic);

    // Chord frequencies for current misterioActual.
    this.chord = getChordFrequencies(misterioActual);

    this.#buildGraph();
    this.setMystery(misterioActual, { skipSanctusFlush: true });
    this.setProgress(0);
    this.setWarmth(0);
  }

  getOrganBaseParams(phases) {
    return {
      // Pluto -> sub-bass foundation
      subFreq: 32 + phases.pluto * 16,
      // Saturn -> timbre cutoff baseline
      cutoffBase: 450 + phases.saturn * 120,
      // Neptune -> delay feedback wash amount
      reverbTail: 0.35 + phases.neptune * 0.35,
      // Mercury -> breath (LFO) speed
      breathHz: 0.05 + phases.mercury * 0.20,
      // Jupiter -> resonance / Q scaling
      resonance: 1.0 + phases.jupiter * 4.0,
      // Uranus -> shimmer ceiling
      shimmer: phases.uranus * 0.012,
      // Keep a stable delay time (nostalgic organ chamber)
      delayTime: 0.55,
    };
  }

  #buildGraph() {
    const { ctx } = this;

    // ── Shared buses (persistent) ──
    this.VoxOrganiBus = ctx.createGain();
    this.VoxOrganiBus.gain.value = 1.0;

    // Dry + Wash split after low-pass to blend impacts into organ timbre.
    this.LP_Celest = ctx.createBiquadFilter();
    this.LP_Celest.type = 'lowpass';
    this.LP_Celest.frequency.value = this.organBase.cutoffBase;
    this.LP_Celest.Q.value = 1.2;

    // Mobile low-end cabinet rattle guard.
    this.VirgaCabinetRattleGuard = ctx.createBiquadFilter();
    this.VirgaCabinetRattleGuard.type = 'highpass';
    this.VirgaCabinetRattleGuard.frequency.value = isProbablyMobile() ? 65 : 20;

    this.MasterDry = ctx.createGain();
    this.MasterDry.gain.value = 1.0;

    // Delay reverb network (small and cheap: no convolver).
    this.VoxDelay = ctx.createDelay(1.5);
    this.VoxDelay.delayTime.value = this.organBase.delayTime;

    this.SeculaSeculorum = ctx.createGain(); // feedback gain (Sans flush target)
    this.SeculaSeculorum.gain.value = this.organBase.reverbTail * 0.45;
    this.SeculaSeculorumBase = this.SeculaSeculorum.gain.value;

    this.VoxWashFilt = ctx.createBiquadFilter();
    this.VoxWashFilt.type = 'lowpass';
    this.VoxWashFilt.frequency.value = 700;
    this.VoxWashFilt.Q.value = 0.8;

    this.VoxWash = ctx.createGain();
    this.VoxWash.gain.value = 0.25; // initial wash mix

    // Compressor limiter for stacked chimes.
    this.Compempsio = ctx.createDynamicsCompressor();
    this.Compempsio.threshold.value = -18;
    this.Compempsio.knee.value = 18;
    this.Compempsio.ratio.value = 4;
    this.Compempsio.attack.value = 0.01;
    this.Compempsio.release.value = 0.25;

    this.MasterOut = ctx.createGain();
    this.MasterOut.gain.value = 0.002; // “tiny sacred hum” baseline

    // Routing:
    // VoxOrganiBus -> LP -> HP -> (Dry + Delay input)
    // Delay input -> feedback loop -> wash -> MasterOut
    this.VoxOrganiBus.connect(this.LP_Celest);
    this.LP_Celest.connect(this.VirgaCabinetRattleGuard);

    // Dry
    this.VirgaCabinetRattleGuard.connect(this.MasterDry);
    this.MasterDry.connect(this.Compempsio);

    // Wet
    this.VirgaCabinetRattleGuard.connect(this.VoxDelay);
    this.VoxDelay.connect(this.SeculaSeculorum);
    this.SeculaSeculorum.connect(this.VoxWashFilt);
    this.VoxWashFilt.connect(this.VoxDelay);
    this.VoxDelay.connect(this.VoxWash);
    this.VoxWash.connect(this.Compempsio);

    this.Compempsio.connect(this.MasterOut);
    this.MasterOut.connect(this.ctx.destination);

    // ── Oscillators (persistent) ──
    this.VoxSub = ctx.createOscillator();
    this.VoxSub.type = 'sine';
    this.VoxSub.frequency.value = this.organBase.subFreq;

    this.VoxFund = ctx.createOscillator();
    this.VoxFund.type = 'sine';
    this.VoxFund.frequency.value = this.chord.radix;

    this.VoxTertium = ctx.createOscillator();
    this.VoxTertium.type = 'sine';
    this.VoxTertium.frequency.value = this.chord.thirdHz;

    this.VoxQuintus = ctx.createOscillator();
    this.VoxQuintus.type = 'triangle';
    this.VoxQuintus.frequency.value = this.chord.fifthHz;

    this.VoxCeleste = ctx.createOscillator();
    this.VoxCeleste.type = 'sine';
    this.VoxCeleste.frequency.value = this.chord.octaveHz;

    // Gains for progressive harmonic entrance.
    this.GainFund = ctx.createGain();
    this.GainFund.gain.value = 0.030;

    this.GainSub = ctx.createGain();
    this.GainSub.gain.value = 0.012;

    this.GainQuintus = ctx.createGain();
    this.GainQuintus.gain.value = 0;

    this.GainTertium = ctx.createGain();
    this.GainTertium.gain.value = 0;

    this.GainCeleste = ctx.createGain();
    this.GainCeleste.gain.value = 0;

    // Mix to VoxOrganiBus.
    this.VoxFund.connect(this.GainFund);
    this.VoxSub.connect(this.GainSub);
    this.VoxQuintus.connect(this.GainQuintus);
    this.VoxTertium.connect(this.GainTertium);
    this.VoxCeleste.connect(this.GainCeleste);

    this.GainFund.connect(this.VoxOrganiBus);
    this.GainSub.connect(this.VoxOrganiBus);
    this.GainQuintus.connect(this.VoxOrganiBus);
    this.GainTertium.connect(this.VoxOrganiBus);
    this.GainCeleste.connect(this.VoxOrganiBus);

    // Gentle LFOs (Mercury/Jupiter) to avoid React thread ticking.
    this.LFO_Mercurius = ctx.createOscillator();
    this.LFO_Mercurius.type = 'sine';
    this.LFO_Mercurius.frequency.value = this.organBase.breathHz;

    this.LFO_MercuriusGain = ctx.createGain();
    this.LFO_MercuriusGain.gain.value = 0; // lifted in setProgress

    this.LFO_Mercurius.connect(this.LFO_MercuriusGain);
    this.LFO_MercuriusGain.connect(this.LP_Celest.frequency);

    this.LFO_Jovianus = ctx.createOscillator();
    this.LFO_Jovianus.type = 'sine';
    this.LFO_Jovianus.frequency.value = 0.02;

    this.LFO_JovianusGain = ctx.createGain();
    this.LFO_JovianusGain.gain.value = 0;
    this.LFO_Jovianus.connect(this.LFO_JovianusGain);
    this.LFO_JovianusGain.connect(this.LP_Celest.Q);

    // Start everything.
    this.VoxSub.start();
    this.VoxFund.start();
    this.VoxTertium.start();
    this.VoxQuintus.start();
    this.VoxCeleste.start();

    this.LFO_Mercurius.start();
    this.LFO_Jovianus.start();
  }

  ensureRunning() {
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  // Chord change + SanctusFlush (feedback wipe) to avoid clashes.
  setMystery(misterioActual, { skipSanctusFlush = false } = {}) {
    if (!this.soundEnabled) return;
    this.ensureRunning();

    const t = this.ctx.currentTime;
    this.chord = getChordFrequencies(misterioActual);

    // Retune harmonic voices without spawning nodes.
    this.VoxFund.frequency.setValueAtTime(this.chord.radix, t);
    this.VoxTertium.frequency.setValueAtTime(this.chord.thirdHz, t);
    this.VoxQuintus.frequency.setValueAtTime(this.chord.fifthHz, t);
    this.VoxCeleste.frequency.setValueAtTime(this.chord.octaveHz, t);

    // SanctusFlush: drop delay feedback to 0 for 50ms.
    if (!skipSanctusFlush) {
      const SanctusFlush = 0.05;
      this.SeculaSeculorum.gain.cancelScheduledValues(t);
      this.SeculaSeculorum.gain.setValueAtTime(this.SeculaSeculorumBase, t);
      this.SeculaSeculorum.gain.setTargetAtTime(0.0, t, 0.001);
      this.SeculaSeculorum.gain.setTargetAtTime(
        this.SeculaSeculorumBase,
        t + SanctusFlush,
        0.01
      );
    }

    // High-pass guard is static; do not toggle per chord change (stability).
  }

  setProgress(p01) {
    if (!this.soundEnabled) return;
    const p = clamp01(p01);
    this.progress = p;
    const t = this.ctx.currentTime;
    const tau = 0.8;
    const { cutoffBase, resonance, shimmer, subFreq } = this.organBase;

    // Ensure deep sub remains present but very gentle.
    this.GainSub.gain.setTargetAtTime(0.012 + 0.006 * (this.cosmic.pluto || 0), t, tau);
    this.VoxSub.frequency.setTargetAtTime(subFreq, t, tau);

    // Fundamental anchor.
    this.GainFund.gain.setTargetAtTime(0.030, t, tau);

    // Higher harmonics fade in as progress increases.
    this.GainQuintus.gain.setTargetAtTime(0.022 * smoothstep(0.15, 0.6, p), t, tau);
    this.GainTertium.gain.setTargetAtTime(0.018 * smoothstep(0.45, 0.9, p), t, tau);
    this.GainCeleste.gain.setTargetAtTime(shimmer * p, t, 1.2);

    // Resonator timbre opening.
    this.LP_Celest.frequency.setTargetAtTime(cutoffBase + 500 * p, t, tau);
    this.LP_Celest.Q.setTargetAtTime(1.2 + resonance * p, t, tau);

    // LFO depths (event-driven; LFOs themselves run continuously).
    this.LFO_MercuriusGain.gain.setTargetAtTime(p * 55, t, 1.2);
    this.LFO_JovianusGain.gain.setTargetAtTime(p * 0.8, t, 1.2);
  }

  setWarmth(w01) {
    if (!this.soundEnabled) return;
    const w = clamp01(w01);
    this.warmth = w;
    const t = this.ctx.currentTime;
    const tau = 0.5;

    // Gentle swell of master + cutoff while charging.
    const masterTarget = 0.002 + (0.034 + w * 0.020);
    this.MasterOut.gain.setTargetAtTime(masterTarget, t, 0.4);

    this.LP_Celest.frequency.setTargetAtTime(
      this.organBase.cutoffBase + 400 * w + 500 * this.progress,
      t,
      tau
    );

    // Add slight wet-wash during warmth.
    this.VoxWash.gain.setTargetAtTime(0.15 + w * 0.25, t, 0.6);
  }

  chime(impactScalar = 0.5, beadPhysicsType = 'bead', beadIndex = 0) {
    if (!this.soundEnabled) return;
    this.ensureRunning();
    const now = this.ctx.currentTime;

    // Rate limit (CPU + noise floor).
    if (now - this.lastChimeTime < 0.06) return;
    if (this.activeChimes >= this.chimeConcurrency) return;

    this.lastChimeTime = now;
    this.activeChimes += 1;

    const v = Math.max(0, Math.min(6, impactScalar));
    const chord = this.chord;

    // Degree selection for impact blending.
    let targetHz;
    if (beadPhysicsType === 'cross') {
      targetHz = chord.subOctaveHz;
    } else if (beadPhysicsType === 'medal') {
      targetHz = chord.octaveHz;
    } else {
      const p = v / 6;
      if (p < 0.33) targetHz = chord.radix;
      else if (p < 0.66) targetHz = chord.thirdHz;
      else targetHz = chord.fifthHz;
    }

    // Quantize onto chord tone set to keep timbre aligned.
    const freq = quantizeToChord(targetHz * (1 + v * 0.02), chord);
    const gainValue = Math.min(0.04 + v * 0.02, 0.11);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Softer bell-like oddities for stronger impacts.
    osc.type = (v > 3.5) ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    // Route chime through VoxOrganiBus for consistent LP/HP timbre.
    gain.connect(this.VoxOrganiBus);

    osc.start(now);
    osc.stop(now + 0.55);
    osc.onended = () => {
      this.activeChimes = Math.max(0, this.activeChimes - 1);
      try { osc.disconnect(); } catch (_) {}
      try { gain.disconnect(); } catch (_) {}
    };
  }

  // Used when pointer/touch ends: soften back to “tiny sacred hum”.
  silenceToHum() {
    if (!this.soundEnabled) return;
    const t = this.ctx.currentTime;
    this.MasterOut.gain.setTargetAtTime(0.002, t, 0.6);
    this.VoxWash.gain.setTargetAtTime(0.15, t, 0.6);
  }

  dispose() {
    try {
      this.silenceToHum();
      this.VoxSub.stop();
      this.VoxFund.stop();
      this.VoxTertium.stop();
      this.VoxQuintus.stop();
      this.VoxCeleste.stop();
      this.LFO_Mercurius.stop();
      this.LFO_Jovianus.stop();
    } catch (_) {}
  }

  // Lean getter for real-time audio dynamics (audio->visual bridge).
  getVoxDynamics() {
    return {
      mercuryHz: this.LFO_Mercurius?.frequency?.value ?? this.organBase.breathHz,
      cutoffHz: this.LP_Celest?.frequency?.value ?? this.organBase.cutoffBase,
      lpQ: this.LP_Celest?.Q?.value ?? 1.2,
    };
  }
}

