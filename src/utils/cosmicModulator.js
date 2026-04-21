/**
 * COSMIC MODULATOR - SACRED EDITION
 * 
 * Calculates normalized (0-1) deterministic phases for inner and outer planets
 * based on orbital periods from the J2000 Epoch. 
 * Enables logic that evolves over days, years, and decades.
 */

const J2000 = 946728000000; // Jan 1, 2000 12:00:00 UTC
const YEAR_MS = 31557600000;

const PERIODS = {
  mercury: 0.2408,
  venus:   0.6152,
  earth:   1.0000,
  mars:    1.8808,
  jupiter: 11.8618,
  saturn:  29.4571,
  uranus:  84.0110,
  neptune: 164.7913,
  pluto:   247.9400
};

export const getCosmicPhases = (dateInput = Date.now()) => {
  const elapsed = dateInput - J2000;
  const elapsedY = elapsed / YEAR_MS;

  const phases = {};
  Object.keys(PERIODS).forEach(planet => {
    const period = PERIODS[planet];
    // We use a sine wave to get a clean oscillation (0 -> 1 -> 0)
    // Add planet-specific offset to ensure they don't all align at zero
    const offset = (Object.keys(PERIODS).indexOf(planet) * 0.13);
    const raw = Math.sin((elapsedY / period) * 2 * Math.PI + offset);
    phases[planet] = (raw + 1) / 2; // Normalize to 0-1
  });

  // Short-term "Small Journey" cycles
  const daily = (dateInput % (24 * 3600 * 1000)) / (24 * 3600 * 1000);
  const weekly = (dateInput % (7 * 24 * 3600 * 1000)) / (7 * 24 * 3600 * 1000);
  const hourly = (dateInput % (3600 * 1000)) / (3600 * 1000);

  return {
    ...phases,
    daily,
    weekly,
    hourly,
    isSacredWindow: phases.jupiter > 0.8 && phases.earth > 0.4 // Example alignment
  };
};

/**
 * A "Cosmic Seed" that can be used for deterministic randomness
 * that stays consistent for the current day but varies globally.
 */
export const getCosmicSeed = () => {
  const today = new Date().setHours(0,0,0,0);
  const phases = getCosmicPhases(today);
  return Math.floor(phases.jupiter * 10000 + phases.saturn * 1000);
};
