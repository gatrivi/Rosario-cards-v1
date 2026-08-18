/**
 * AudioManager.js
 * Provides a shared AudioContext and common sound utilities.
 * Audio is opt-in: no AudioContext is created or resumed unless the user
 * explicitly enabled sound in settings.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
    }

    isAudioEnabled() {
        try {
            return localStorage.getItem('rosario_sound_enabled') === 'true';
        } catch (_) {
            return false;
        }
    }

    init() {
        if (!this.isAudioEnabled()) return null;
        if (this.isInitialized) return this.ctx;

        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;

        this.ctx = new AC();
        this.isInitialized = true;
        return this.ctx;
    }

    getContext() {
        if (!this.isAudioEnabled()) return null;
        if (!this.isInitialized) return this.init();
        return this.ctx;
    }

    async resume() {
        if (!this.isAudioEnabled()) return;
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }
}

const audioManager = new AudioManager();
export default audioManager;
