/**
 * Sound Effects Utility
 *
 * Provides audio feedback for prayer navigation:
 * - Scroll sounds (like unrolling a scroll)
 * - End-of-scroll sounds (reaching the limit)
 * - Prayer change sounds (like turning a page)
 * - Multiple variations to avoid repetition
 */

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.soundVariation = 0;
    this.currentMystery = 'gozosos'; // Default mystery

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
        waveform: 'sine', // Pure, joyful tone
        volumeMultiplier: 1.0, // Standard volume
        durationMultiplier: 1.0, // Standard duration
        description: 'Bright and joyful'
      },
      // Sorrowful Mysteries - Deep, solemn sounds
      dolorosos: {
        baseFrequency: 250, // Lower, more solemn
        frequencyRange: 50, // Narrower range for solemnity
        waveform: 'triangle', // Softer, more contemplative
        volumeMultiplier: 0.8, // Quieter for reverence
        durationMultiplier: 1.2, // Longer for contemplation
        description: 'Deep and contemplative'
      },
      // Glorious Mysteries - Rich, majestic sounds
      gloriosos: {
        baseFrequency: 350, // Medium-high for majesty
        frequencyRange: 100, // Wide range for grandeur
        waveform: 'sine', // Pure, majestic tone
        volumeMultiplier: 1.1, // Slightly louder for glory
        durationMultiplier: 1.1, // Slightly longer for majesty
        description: 'Rich and majestic'
      },
      // Luminous Mysteries - Bright, illuminating sounds
      luminosos: {
        baseFrequency: 500, // Highest for illumination
        frequencyRange: 120, // Widest range for brightness
        waveform: 'sine', // Pure, illuminating tone
        volumeMultiplier: 1.2, // Brightest volume
        durationMultiplier: 0.9, // Shorter, more energetic
        description: 'Bright and illuminating'
      }
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

    try {
      const ctx = this.audioContext;

      // Resume context if suspended (for autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Get mystery-specific sound characteristics
      const palette = this.getMysterySoundPalette(this.currentMystery);

      // Create oscillator for bead-like scroll sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use mystery-specific frequency range
      const baseFreq = palette.baseFrequency + this.soundVariation * (palette.frequencyRange / 4);
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.8,
        ctx.currentTime + 0.08 * palette.durationMultiplier
      );

      // Use mystery-specific volume and duration
      const baseVolume = 0.12 * palette.volumeMultiplier;
      const duration = 0.08 * palette.durationMultiplier;
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      // Use mystery-specific waveform
      oscillator.type = palette.waveform;

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
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      // Use mystery-specific waveform (triangle for softer end sound)
      oscillator.type = palette.waveform === 'sine' ? 'triangle' : palette.waveform;

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
      osc1.frequency.setValueAtTime(palette.baseFrequency * 0.9 + variation, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        palette.baseFrequency * 1.3 + variation,
        ctx.currentTime + 0.06 * palette.durationMultiplier
      );
      osc1.frequency.exponentialRampToValueAtTime(
        palette.baseFrequency * 0.6,
        ctx.currentTime + 0.15 * palette.durationMultiplier
      );

      osc2.frequency.setValueAtTime(palette.baseFrequency * 1.1 + variation, ctx.currentTime);
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
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

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

// Export singleton instance and class
export { SoundEffects };
export default new SoundEffects();
