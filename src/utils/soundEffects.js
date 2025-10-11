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
   * Play a scroll sound - soft rustling like parchment
   * Multiple variations to avoid repetition
   */
  playScrollSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      // Resume context if suspended (for autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create oscillator for scroll sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Vary the frequency slightly for each sound
      const baseFreq = 200 + this.soundVariation * 50;
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.7,
        ctx.currentTime + 0.1
      );

      // Soft volume for scrolling
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      // Use noise-like waveform for parchment rustling
      oscillator.type = "sawtooth";

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);

      // Cycle through 3 variations
      this.soundVariation = (this.soundVariation + 1) % 3;
    } catch (e) {
      console.warn("Error playing scroll sound:", e);
    }
  }

  /**
   * Play end-of-scroll sound - gentle bump like reaching scroll edge
   * Different sound to indicate no more content
   */
  playEndOfScrollSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create two oscillators for a "thud" sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Lower frequencies for "bump" sound
      const variation = this.soundVariation * 20;
      osc1.frequency.setValueAtTime(150 + variation, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

      osc2.frequency.setValueAtTime(100 + variation, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);

      // Quick decay for thud effect
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);

      // Cycle through variations
      this.soundVariation = (this.soundVariation + 1) % 4;
    } catch (e) {
      console.warn("Error playing end sound:", e);
    }
  }

  /**
   * Play prayer change sound - like turning a page
   * More distinct sound to indicate navigation
   */
  playPrayerChangeSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create multiple oscillators for page turn effect
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Variation for each page turn
      const variation = this.soundVariation * 30;

      // Rising then falling frequency for page flip
      osc1.frequency.setValueAtTime(300 + variation, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        600 + variation,
        ctx.currentTime + 0.08
      );
      osc1.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);

      osc2.frequency.setValueAtTime(400 + variation, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(
        800 + variation,
        ctx.currentTime + 0.08
      );
      osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);

      // Envelope for page turn
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc1.type = "triangle";
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.2);

      // Cycle through 5 variations for page turns
      this.soundVariation = (this.soundVariation + 1) % 5;
    } catch (e) {
      console.warn("Error playing page turn sound:", e);
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
