/**
 * audioConstants.js
 *
 * Pure helpers for the offline Cosmic Resonator.
 * No DOM, no Matter.js, no WebAudio creation here.
 */

export const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export const clamp01 = (x) => Math.min(1, Math.max(0, x));

export const semitoneRatio = (semitones) => Math.pow(2, semitones / 12);

// Mystery -> chord-mode root frequency (equal temperament).
// Keeping names forward-looking; do not rename existing project identifiers elsewhere.
export const VoxRadix = {
  gozosos: 293.664767, // D4
  dolorosos: 329.627557, // E4
  gloriosos: 392.0, // G4
  luminosos: 349.228231, // F4
};

// Mode-dependent "third quality" (Dorian/Phrygian = minor third; Mixolydian/Lydian = major third)
const ThirdSemis = {
  gozosos: 3, // minor third
  dolorosos: 3, // minor third
  gloriosos: 4, // major third
  luminosos: 4, // major third
};

const FifthSemis = 7;
const OctaveSemis = 12;

export const getChordFrequencies = (misterioActual) => {
  const radix = VoxRadix[misterioActual] ?? VoxRadix.gozosos;
  const thirdHz = radix * semitoneRatio(ThirdSemis[misterioActual] ?? 3);
  const fifthHz = radix * semitoneRatio(FifthSemis);
  const octaveHz = radix * semitoneRatio(OctaveSemis);

  // Optional lower chord tone for impact blending.
  const subOctaveHz = radix * 0.5;
  return { radix, thirdHz, fifthHz, octaveHz, subOctaveHz };
};

/**
 * Quantize a frequency to the nearest chord tone (radix/third/fifth/octave/sub-octave).
 * Deterministic nearest-neighbor quantization to keep timbre stable.
 */
export const quantizeToChord = (freqHz, chord) => {
  const tones = [chord.subOctaveHz, chord.radix, chord.thirdHz, chord.fifthHz, chord.octaveHz];
  let best = tones[0];
  let bestDist = Math.abs(freqHz - best);
  for (let i = 1; i < tones.length; i++) {
    const d = Math.abs(freqHz - tones[i]);
    if (d < bestDist) {
      bestDist = d;
      best = tones[i];
    }
  }
  return best;
};

