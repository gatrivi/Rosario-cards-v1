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

// Ecclesiastical Latin monastic modes:
// Each mode exposes BOTH:
// - `intervalsSemis`: [Root, Sub-Bass, Perfect Fifth, Third, Celestial Shimmer Octave]
// - `chordHz`:      [Root, Sub-Bass, Perfect Fifth, Third, Celestial Shimmer Octave]
export const MONASTIC_MODES = {
  gozosos: {
    churchMode: 'Dorian',
    intervalsSemis: [0, -12, 7, 3, 12],
    chordHz: [
      293.664767,
      146.8323835,
      439.9999986254417,
      349.2282303420163,
      587.329534,
    ],
  },
  dolorosos: {
    churchMode: 'Phrygian',
    intervalsSemis: [0, -12, 7, 3, 12],
    chordHz: [
      329.627557,
      164.8137785,
      493.88330138667175,
      391.995436085365,
      659.255114,
    ],
  },
  gloriosos: {
    churchMode: 'Mixolydian',
    intervalsSemis: [0, -12, 7, 4, 12],
    chordHz: [392, 196, 587.3363741356592, 493.8890515587903, 784],
  },
  luminosos: {
    churchMode: 'Lydian',
    intervalsSemis: [0, -12, 7, 4, 12],
    chordHz: [
      349.228231,
      174.6141155,
      523.2511299524244,
      439.99999945444927,
      698.456462,
    ],
  },
};

// 20 Holy Mysteries -> church-mode chord mapping.
// Note: `gloriosos` uses the same `MG1..MG5` ids present in the current data layer.
export const CHURCH_MODE_LOOKUP = {
  gozosos: {
    MG1: { churchMode: 'Dorian', ...MONASTIC_MODES.gozosos },
    MG2: { churchMode: 'Dorian', ...MONASTIC_MODES.gozosos },
    MG3: { churchMode: 'Dorian', ...MONASTIC_MODES.gozosos },
    MG4: { churchMode: 'Dorian', ...MONASTIC_MODES.gozosos },
    MG5: { churchMode: 'Dorian', ...MONASTIC_MODES.gozosos },
  },
  dolorosos: {
    MD1: { churchMode: 'Phrygian', ...MONASTIC_MODES.dolorosos },
    MD2: { churchMode: 'Phrygian', ...MONASTIC_MODES.dolorosos },
    MD3: { churchMode: 'Phrygian', ...MONASTIC_MODES.dolorosos },
    MD4: { churchMode: 'Phrygian', ...MONASTIC_MODES.dolorosos },
    MD5: { churchMode: 'Phrygian', ...MONASTIC_MODES.dolorosos },
  },
  gloriosos: {
    MG1: { churchMode: 'Mixolydian', ...MONASTIC_MODES.gloriosos },
    MG2: { churchMode: 'Mixolydian', ...MONASTIC_MODES.gloriosos },
    MG3: { churchMode: 'Mixolydian', ...MONASTIC_MODES.gloriosos },
    MG4: { churchMode: 'Mixolydian', ...MONASTIC_MODES.gloriosos },
    MG5: { churchMode: 'Mixolydian', ...MONASTIC_MODES.gloriosos },
  },
  luminosos: {
    ML1: { churchMode: 'Lydian', ...MONASTIC_MODES.luminosos },
    ML2: { churchMode: 'Lydian', ...MONASTIC_MODES.luminosos },
    ML3: { churchMode: 'Lydian', ...MONASTIC_MODES.luminosos },
    ML4: { churchMode: 'Lydian', ...MONASTIC_MODES.luminosos },
    ML5: { churchMode: 'Lydian', ...MONASTIC_MODES.luminosos },
  },
};

export const getChordFrequencies = (misterioActual) => {
  const mode = MONASTIC_MODES[misterioActual] ?? MONASTIC_MODES.gozosos;
  const [radix, subOctaveHz, fifthHz, thirdHz, octaveHz] = mode.chordHz;
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

