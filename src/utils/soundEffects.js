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
   * Play a scroll sound - gentle bead tinkling like rosary navigation
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

      // Create oscillator for bead-like scroll sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Vary the frequency like bead collisions (higher, more musical)
      const baseFreq = 400 + this.soundVariation * 80; // 400-640 Hz range
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.8,
        ctx.currentTime + 0.08
      );

      // Gentle volume like bead taps
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      // Use sine wave for pure bead-like tone
      oscillator.type = "sine";

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);

      // Cycle through 4 variations
      this.soundVariation = (this.soundVariation + 1) % 4;
    } catch (e) {
      console.warn("Error playing scroll sound:", e);
    }
  }

  /**
   * Play end-of-scroll sound - gentle bead tap like reaching rosary end
   * Different sound to indicate no more content
   */
  playEndOfScrollSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create single oscillator for gentle bead tap
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Lower frequency for gentle "tap" sound (like heart bead)
      const variation = this.soundVariation * 30;
      const baseFreq = 300 + variation; // 300-390 Hz range
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.6,
        ctx.currentTime + 0.12
      );

      // Gentle volume envelope like bead collision
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      // Use triangle wave for softer bead-like tone
      oscillator.type = "triangle";

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);

      // Cycle through variations
      this.soundVariation = (this.soundVariation + 1) % 4;
    } catch (e) {
      console.warn("Error playing end sound:", e);
    }
  }

  /**
   * Play prayer change sound - gentle bead transition like moving between prayers
   * More distinct sound to indicate navigation
   */
  playPrayerChangeSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create two oscillators for gentle bead transition
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Variation for each prayer change
      const variation = this.soundVariation * 40;

      // Gentle frequency sweep like bead collision
      osc1.frequency.setValueAtTime(350 + variation, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(
        500 + variation,
        ctx.currentTime + 0.06
      );
      osc1.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);

      osc2.frequency.setValueAtTime(450 + variation, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(
        650 + variation,
        ctx.currentTime + 0.06
      );
      osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);

      // Gentle envelope like bead collision
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      // Use sine waves for pure bead-like tones
      osc1.type = "sine";
      osc2.type = "sine";

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);

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
