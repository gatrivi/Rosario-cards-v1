/**
 * Sound Effects Utility
 *
 * Provides audio feedback for prayer navigation:
 * - Scroll sounds (like unrolling a scroll)
 * - End-of-scroll sounds (reaching the limit)
 * - Prayer change sounds (like turning a page)
 * - Multiple variations to avoid repetition
 */

/**
 * Prayer History Tracker
 *
 * Tracks prayer activity over time to create personalized sound and visual feedback.
 * Each rosary creates an "echo" of your prayer evolution through subtle variations.
 */
class PrayerHistory {
  constructor() {
    this.loadHistory();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem("prayerHistory");
      if (saved) {
        this.history = JSON.parse(saved);
      } else {
        this.history = this.getDefaultHistory();
      }
    } catch (error) {
      console.warn("Error loading prayer history:", error);
      this.history = this.getDefaultHistory();
    }
  }

  getDefaultHistory() {
    return {
      totalBeadsPrayed: 0,
      rosariesCompleted: 0,
      lastPrayerDate: Date.now(),
      firstPrayerDate: Date.now(),
      mysteryPreferences: {
        gozosos: 0,
        dolorosos: 0,
        gloriosos: 0,
        luminosos: 0,
      },
      sessionDurations: [], // Array of session lengths in minutes
    };
  }

  saveHistory() {
    try {
      localStorage.setItem("prayerHistory", JSON.stringify(this.history));
    } catch (error) {
      console.warn("Error saving prayer history:", error);
    }
  }

  recordBeadPress(prayerIndex, mystery) {
    this.history.totalBeadsPrayed++;
    this.history.lastPrayerDate = Date.now();

    if (mystery && this.history.mysteryPreferences[mystery] !== undefined) {
      this.history.mysteryPreferences[mystery]++;
    }

    // Check if rosary completed (82 prayers in full sequence)
    if (prayerIndex === 81) {
      this.history.rosariesCompleted++;
    }

    this.saveHistory();
  }

  /**
   * Get a deterministic seed based on total prayer history
   * Creates a "rosary through time" effect by using position in eternal rosary
   * @returns {number} 0-1 value representing position in history cycle
   */
  getHistorySeed() {
    // Use modulo 82 (full rosary length) to create cyclical pattern
    // This makes your sound evolve in a rosary-shaped pattern over time
    const position = this.history.totalBeadsPrayed % 82;
    return position / 82;
  }

  /**
   * Get frequency modulation based on prayer regularity
   * More frequent prayer = brighter, higher tones
   * Sparse prayer = softer, lower tones
   * @returns {number} 0.8-1.2 multiplier
   */
  getFrequencyModulation() {
    const now = Date.now();
    const daysSinceLastPrayer =
      (now - this.history.lastPrayerDate) / (1000 * 60 * 60 * 24);
    const totalDaysPraying =
      (now - this.history.firstPrayerDate) / (1000 * 60 * 60 * 24);

    // Calculate consistency score (0-1)
    let consistencyScore = 0.5; // Default middle value

    if (this.history.totalBeadsPrayed > 82) {
      // If praying daily or more: 1.0
      // If once a week: 0.5
      // If once a month or less: 0.2
      const averageBeadsPerDay =
        this.history.totalBeadsPrayed / Math.max(totalDaysPraying, 1);
      consistencyScore = Math.min(averageBeadsPerDay / 82, 1.0);
    }

    // Recent activity bonus
    if (daysSinceLastPrayer < 1) {
      consistencyScore = Math.min(consistencyScore + 0.2, 1.0);
    } else if (daysSinceLastPrayer > 7) {
      consistencyScore = Math.max(consistencyScore - 0.2, 0.2);
    }

    // Map 0-1 to 0.8-1.2 range
    return 0.8 + consistencyScore * 0.4;
  }

  /**
   * Get volume modulation based on experience level
   * More rosaries completed = slightly more confident volume
   * @returns {number} 0.9-1.1 multiplier
   */
  getVolumeModulation() {
    const rosariesCompleted = this.history.rosariesCompleted;

    if (rosariesCompleted === 0) return 0.9; // Gentle for beginners
    if (rosariesCompleted < 10) return 0.95;
    if (rosariesCompleted < 50) return 1.0;
    if (rosariesCompleted < 100) return 1.05;
    return 1.1; // Confident for experienced
  }

  /**
   * Get total beads prayed for display/debugging
   */
  getTotalBeadsPrayed() {
    return this.history.totalBeadsPrayed;
  }

  /**
   * Get completed rosaries count
   */
  getRosariesCompleted() {
    return this.history.rosariesCompleted;
  }
}

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.soundVariation = 0;
    this.currentMystery = "gozosos"; // Default mystery

    // Initialize AudioContext on first user interaction
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // Create AudioContext lazily to avoid autoplay restrictions
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
      this.enabled = false;
    }
  }

  /**
   * Get mystery-specific sound characteristics
   * Each mystery has its own "sound palette" with different frequencies and waveforms
   */
  getMysterySoundPalette(mystery) {
    const soundPalettes = {
      // Joyful Mysteries - Bright, cheerful sounds
      gozosos: {
        baseFrequency: 400, // Higher, more cheerful
        frequencyRange: 80, // Wide range for joy
        waveform: "sine", // Pure, joyful tone
        volumeMultiplier: 1.0, // Standard volume
        durationMultiplier: 1.0, // Standard duration
        description: "Bright and joyful",
      },
      // Sorrowful Mysteries - Deep, solemn sounds
      dolorosos: {
        baseFrequency: 250, // Lower, more solemn
        frequencyRange: 50, // Narrower range for solemnity
        waveform: "triangle", // Softer, more contemplative
        volumeMultiplier: 0.8, // Quieter for reverence
        durationMultiplier: 1.2, // Longer for contemplation
        description: "Deep and contemplative",
      },
      // Glorious Mysteries - Rich, majestic sounds
      gloriosos: {
        baseFrequency: 350, // Medium-high for majesty
        frequencyRange: 100, // Wide range for grandeur
        waveform: "sine", // Pure, majestic tone
        volumeMultiplier: 1.1, // Slightly louder for glory
        durationMultiplier: 1.1, // Slightly longer for majesty
        description: "Rich and majestic",
      },
      // Luminous Mysteries - Bright, illuminating sounds
      luminosos: {
        baseFrequency: 500, // Highest for illumination
        frequencyRange: 120, // Widest range for brightness
        waveform: "sine", // Pure, illuminating tone
        volumeMultiplier: 1.2, // Brightest volume
        durationMultiplier: 0.9, // Shorter, more energetic
        description: "Bright and illuminating",
      },
    };
    return soundPalettes[mystery] || soundPalettes.gozosos;
  }

  /**
   * Set the current mystery for sound theming
   */
  setMystery(mystery) {
    this.currentMystery = mystery;
  }

  /**
   * Play a scroll sound - gentle bead tinkling like rosary navigation
   * Multiple variations to avoid repetition, themed by mystery
   */
  playScrollSound() {
    if (!this.enabled || !this.audioContext) return;

    // Throttle: only play every 3rd scroll sound to reduce frequency
    this.scrollSoundCounter = (this.scrollSoundCounter || 0) + 1;
    if (this.scrollSoundCounter % 3 !== 0) return;

    try {
      const ctx = this.audioContext;

      // Resume context if suspended (for autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create oscillator for subtle scroll sound (not chime-like)
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Lower frequency range for subtle scroll sound instead of chime
      const baseFreq = 150 + this.soundVariation * 20;
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        baseFreq * 0.95,
        ctx.currentTime + 0.03
      );

      // Much quieter and shorter for scroll effect
      const baseVolume = 0.03;
      const duration = 0.03;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Sawtooth for more "paper-like" scroll sound
      oscillator.type = "sawtooth";

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // Cycle through 4 variations
      this.soundVariation = (this.soundVariation + 1) % 4;
    } catch (e) {
      console.warn("Error playing scroll sound:", e);
    }
  }

  /**
   * Play end-of-scroll sound - gentle bead tap like reaching rosary end
   * Different sound to indicate no more content, themed by mystery
   */
  playEndOfScrollSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Create single oscillator for gentle bead tap
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use mystery-specific frequency (lower for "end" indication)
      const variation = this.soundVariation * (palette.frequencyRange / 6);
      const baseFreq = palette.baseFrequency * 0.7 + variation; // Lower than scroll sound
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.6,
        ctx.currentTime + 0.12 * palette.durationMultiplier
      );

      // Use mystery-specific volume and duration
      const baseVolume = 0.15 * palette.volumeMultiplier;
      const duration = 0.12 * palette.durationMultiplier;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Use mystery-specific waveform (triangle for softer end sound)
      oscillator.type =
        palette.waveform === "sine" ? "triangle" : palette.waveform;

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // Cycle through variations
      this.soundVariation = (this.soundVariation + 1) % 4;
    } catch (e) {
      console.warn("Error playing end sound:", e);
    }
  }

  /**
   * Play prayer change sound - gentle bead transition like moving between prayers
   * More distinct sound to indicate navigation, themed by mystery
   */
  playPrayerChangeSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Create two oscillators for gentle bead transition
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use mystery-specific frequency ranges
      const variation = this.soundVariation * (palette.frequencyRange / 8);

      // Gentle frequency sweep like bead collision
      osc1.frequency.setValueAtTime(
        palette.baseFrequency * 0.9 + variation,
        ctx.currentTime
      );
      osc1.frequency.exponentialRampToValueAtTime(
        palette.baseFrequency * 1.3 + variation,
        ctx.currentTime + 0.06 * palette.durationMultiplier
      );
      osc1.frequency.exponentialRampToValueAtTime(
        palette.baseFrequency * 0.6,
        ctx.currentTime + 0.15 * palette.durationMultiplier
      );

      osc2.frequency.setValueAtTime(
        palette.baseFrequency * 1.1 + variation,
        ctx.currentTime
      );
      osc2.frequency.exponentialRampToValueAtTime(
        palette.baseFrequency * 1.5 + variation,
        ctx.currentTime + 0.06 * palette.durationMultiplier
      );
      osc2.frequency.exponentialRampToValueAtTime(
        palette.baseFrequency * 0.7,
        ctx.currentTime + 0.15 * palette.durationMultiplier
      );

      // Use mystery-specific volume and duration
      const baseVolume = 0.18 * palette.volumeMultiplier;
      const duration = 0.15 * palette.durationMultiplier;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Use mystery-specific waveform
      osc1.type = palette.waveform;
      osc2.type = palette.waveform;

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);

      // Cycle through 5 variations for prayer changes
      this.soundVariation = (this.soundVariation + 1) % 5;
    } catch (e) {
      console.warn("Error playing prayer change sound:", e);
    }
  }

  /**
   * Play chain prayer chime - soft chime when advancing within same bead
   * Different from prayer change, indicates sub-prayer progression (Gloria → Fatima)
   */
  playChainPrayerChime() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Create gentle bell-like sound for chain prayer
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Higher frequency for lighter "continue on same bead" feeling
      const baseFreq = palette.baseFrequency * 1.5;
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.95,
        ctx.currentTime + 0.2 * palette.durationMultiplier
      );

      // Add harmonic for richer sound
      osc2.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.9,
        ctx.currentTime + 0.2 * palette.durationMultiplier
      );

      // Soft, gentle volume
      const baseVolume = 0.1 * palette.volumeMultiplier;
      const duration = 0.2 * palette.durationMultiplier;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Use sine for pure bell tone
      osc1.type = "sine";
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Error playing chain prayer chime:", e);
    }
  }

  /**
   * Play move-to-next-bead chime - distinctive chime when ready to move to next bead
   * Lower pitch than chain prayer, signals completion of current bead's prayers
   */
  playMoveToNextBeadChime() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Create descending tone to signal "move on"
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Lower frequency for "completion" feeling
      const baseFreq = palette.baseFrequency * 0.8;
      osc1.frequency.setValueAtTime(baseFreq * 1.2, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        baseFreq,
        ctx.currentTime + 0.25 * palette.durationMultiplier
      );

      // Second oscillator for richness
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.25,
        ctx.currentTime + 0.25 * palette.durationMultiplier
      );

      // Medium volume
      const baseVolume = 0.14 * palette.volumeMultiplier;
      const duration = 0.25 * palette.durationMultiplier;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Use triangle for softer completion sound
      osc1.type = palette.waveform === "sine" ? "triangle" : palette.waveform;
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Error playing move to next bead chime:", e);
    }
  }

  /**
   * Play enter chain prayer chime - gentle upward chime when content exhausted with chain prayers ahead
   * Signals "stay on this bead, press again"
   * History-modulated for personalized prayer evolution
   * @param {PrayerHistory} prayerHistory - Prayer history instance for personalization
   */
  playEnterChainPrayerChime(prayerHistory = null) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Get history-based modulation if available
      let historySeed = 0.5; // Default middle value
      let freqModulation = 1.0; // Default no change
      let volumeModulation = 1.0;

      if (prayerHistory) {
        historySeed = prayerHistory.getHistorySeed();
        freqModulation = prayerHistory.getFrequencyModulation();
        volumeModulation = prayerHistory.getVolumeModulation();
      }

      // Create gentle ascending bell-like sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use history seed to vary base frequency (creates "rosary through time" effect)
      // historySeed ranges 0-1 based on position in eternal rosary (mod 82)
      const historyVariation = 1.4 + historySeed * 0.2; // 1.4 to 1.6
      const baseFreq =
        palette.baseFrequency * historyVariation * freqModulation;

      // Gentle ascending chime
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.15,
        ctx.currentTime + 0.18 * palette.durationMultiplier
      );

      // Add harmonic for richness
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.725,
        ctx.currentTime + 0.18 * palette.durationMultiplier
      );

      // Soft, gentle volume with history modulation
      const baseVolume = 0.12 * palette.volumeMultiplier * volumeModulation;
      const duration = 0.18 * palette.durationMultiplier;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Use sine for pure bell tone
      osc1.type = "sine";
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Error playing enter chain prayer chime:", e);
    }
  }

  /**
   * Play complete chain prayers chime - descending resolution chime after last chain prayer
   * Signals "chain prayers complete, ready to move to next bead"
   * History-modulated for personalized prayer evolution
   * @param {PrayerHistory} prayerHistory - Prayer history instance for personalization
   */
  playCompleteChainPrayersChime(prayerHistory = null) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Get history-based modulation if available
      let historySeed = 0.5;
      let freqModulation = 1.0;
      let volumeModulation = 1.0;

      if (prayerHistory) {
        historySeed = prayerHistory.getHistorySeed();
        freqModulation = prayerHistory.getFrequencyModulation();
        volumeModulation = prayerHistory.getVolumeModulation();
      }

      // Create descending resolution tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use history for base frequency (slightly lower than enter chime)
      const historyVariation = 0.9 + historySeed * 0.2; // 0.9 to 1.1
      const baseFreq =
        palette.baseFrequency * historyVariation * freqModulation;

      // Descending "resolution" chime
      osc1.frequency.setValueAtTime(baseFreq * 1.3, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        baseFreq,
        ctx.currentTime + 0.22 * palette.durationMultiplier
      );

      // Second oscillator for richness
      osc2.frequency.setValueAtTime(baseFreq * 1.6, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(
        baseFreq * 1.25,
        ctx.currentTime + 0.22 * palette.durationMultiplier
      );

      // Medium volume with history modulation
      const baseVolume = 0.15 * palette.volumeMultiplier * volumeModulation;
      const duration = 0.22 * palette.durationMultiplier;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      // Use triangle for softer completion sound
      osc1.type = palette.waveform === "sine" ? "triangle" : palette.waveform;
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Error playing complete chain prayers chime:", e);
    }
  }

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instances and classes
export { SoundEffects, PrayerHistory };
export default new SoundEffects();
export const prayerHistory = new PrayerHistory();
