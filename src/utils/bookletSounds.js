import audioManager from './audioManager';

/** Base chime families (Hz) — soft meditation palette. */
const PRAYER_BASE = {
  SC: 523.25,
  AC: 466.16,
  C: 349.23,
  P: 392.0,
  A: 659.25,
  G: 783.99,
  F: 329.63,
  M: 440.0,
  LL: 293.66,
  S: 261.63,
};

function prayerFamily(prayerId) {
  if (!prayerId) return 'P';
  if (prayerId === 'A') return 'A';
  if (prayerId.startsWith('M')) return 'M';
  return PRAYER_BASE[prayerId] ? prayerId : 'P';
}

function playTone(ctx, { freq, gain = 0.07, duration = 0.45, type = 'sine', delay = 0 }) {
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/**
 * Subtle signature chime when entering a prayer in Libro mode.
 * Ave Marías rise ~1 semitone per bead; mysteries shift per decade; overall pitch
 * drifts upward toward the end of the rosary.
 */
export async function playBookletTransitionSound({
  prayerId,
  stepContext,
  soundEnabled = true,
}) {
  if (!soundEnabled || typeof window === 'undefined') return;

  const ctx = audioManager.getContext();
  if (!ctx) return;
  await audioManager.resume();
  if (ctx.state === 'suspended') return;

  const family = prayerFamily(prayerId);
  const base = PRAYER_BASE[family] ?? 392;
  const progress = stepContext?.rosaryProgress ?? 0;
  const progressMul = 1 + progress * 0.04;

  let freq = base * progressMul;

  if (family === 'A' && stepContext?.aveRun) {
    const semitone = Math.pow(2, (stepContext.aveRun.position - 1) / 12);
    freq = base * semitone * progressMul;
    playTone(ctx, { freq, gain: 0.065, duration: 0.42, type: 'sine' });
    playTone(ctx, {
      freq: freq * 1.5,
      gain: 0.022,
      duration: 0.35,
      type: 'triangle',
      delay: 0.04,
    });
    return;
  }

  if (family === 'M' && stepContext?.mysteryDecade) {
    const decadeMul = Math.pow(2, (stepContext.mysteryDecade - 1) / 24);
    freq = base * decadeMul * progressMul;
    playTone(ctx, { freq, gain: 0.06, duration: 0.55, type: 'sine' });
    playTone(ctx, {
      freq: freq * 1.25,
      gain: 0.028,
      duration: 0.4,
      type: 'triangle',
      delay: 0.06,
    });
    return;
  }

  if (family === 'SC') {
    playTone(ctx, { freq, gain: 0.055, duration: 0.5, type: 'sine' });
    return;
  }

  if (family === 'AC') {
    playTone(ctx, { freq, gain: 0.05, duration: 0.4, type: 'sine' });
    playTone(ctx, { freq: freq * 1.2, gain: 0.03, duration: 0.35, type: 'sine', delay: 0.08 });
    return;
  }

  if (family === 'C') {
    playTone(ctx, { freq, gain: 0.058, duration: 0.55, type: 'triangle' });
    playTone(ctx, { freq: freq * 0.75, gain: 0.032, duration: 0.5, type: 'sine', delay: 0.05 });
    return;
  }

  playTone(ctx, { freq, gain: 0.055, duration: 0.45, type: 'sine' });
  if (family === 'G' || family === 'LL' || family === 'S') {
    playTone(ctx, {
      freq: freq * 1.33,
      gain: 0.025,
      duration: 0.38,
      type: 'triangle',
      delay: 0.07,
    });
  }
}

/** Tiny chime when offering a completed prayer to intention orbs. */
export async function playOfferingChime(soundEnabled = true) {
  if (!soundEnabled || typeof window === 'undefined') return;
  const ctx = audioManager.getContext();
  if (!ctx) return;
  await audioManager.resume();
  if (ctx.state === 'suspended') return;
  playTone(ctx, { freq: 784, gain: 0.035, duration: 0.28, type: 'sine' });
  playTone(ctx, { freq: 988, gain: 0.022, duration: 0.22, type: 'triangle', delay: 0.07 });
}
