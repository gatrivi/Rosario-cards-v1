/**
 * AudioManager.js
 * Provides a shared AudioContext and common sound utilities.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return this.ctx;
        
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        
        this.ctx = new AC();
        this.isInitialized = true;
        
        // Resume on state change if needed
        if (this.ctx.state === 'suspended') {
            const resume = () => {
                this.ctx.resume().then(() => {
                    console.log('AudioContext resumed');
                    window.removeEventListener('click', resume);
                    window.removeEventListener('touchstart', resume);
                    window.removeEventListener('keydown', resume);
                });
            };
            window.addEventListener('click', resume);
            window.addEventListener('touchstart', resume);
            window.addEventListener('keydown', resume);
        }
        
        return this.ctx;
    }

    getContext() {
        if (!this.isInitialized) return this.init();
        return this.ctx;
    }

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }
}

const audioManager = new AudioManager();
export default audioManager;
