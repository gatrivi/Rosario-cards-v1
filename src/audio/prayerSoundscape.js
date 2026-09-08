const clamp = value => Math.max(0, Math.min(1, value));

export function prayerTone(theme, prayerId) {
  const colors = {
    gozosos: [164.81, 1.25, 950], dolorosos: [146.83, 1.2, 650],
    gloriosos: [196, 1.25, 1400], luminosos: [174.61, 1.5, 1700],
    patrick: [146.83, 1.5, 1000],
  };
  const [root, third, brightness] = colors[theme] || colors.gozosos;
  return { root: root * ({ P: 0.8, G: 1.2, S: 0.8 }[prayerId] || 1), third, brightness };
}

export function soundLayers(seconds) {
  return [0.55, clamp(seconds / 18) * 0.24,
    clamp((seconds - 12) / 45) * 0.16, clamp((seconds - 40) / 100) * 0.09];
}

export class PrayerSoundscape {
  constructor(ctx) {
    this.ctx = ctx;
    this.seconds = 0;
    this.lastTime = ctx.currentTime;
    this.active = false;
    this.disposed = false;
    this.nodes = [];
    this.sources = new Set();
    this.output = this.node(ctx.createGain());
    this.output.gain.value = 1;
    this.output.connect(ctx.destination);
    this.bed = this.node(ctx.createGain());
    this.bed.gain.value = 0;
    this.filter = this.node(ctx.createBiquadFilter());
    this.filter.type = 'lowpass';
    this.filter.Q.value = 0.5;
    this.filter.connect(this.bed);
    this.bed.connect(this.output);
    const delay = this.node(ctx.createDelay());
    delay.delayTime.value = 0.31;
    const feedback = this.node(ctx.createGain());
    feedback.gain.value = 0.24;
    const wet = this.node(ctx.createGain());
    wet.gain.value = 0.18;
    this.filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(this.bed);
    this.voices = [1, 1.5, 1.25, 4].map((ratio, i) => {
      const osc = this.node(ctx.createOscillator());
      const gain = this.node(ctx.createGain());
      osc.type = i === 1 ? 'triangle' : 'sine';
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start();
      this.sources.add(osc);
      return { osc, gain };
    });
    this.setTheme('gozosos', 'A');
  }

  node(node) { this.nodes.push(node); return node; }

  setTheme(theme, prayerId) {
    this.tone = prayerTone(theme, prayerId);
    [1, 1.5, this.tone.third, 4].forEach((ratio, i) => {
      this.voices[i].osc.frequency.setTargetAtTime(this.tone.root * ratio, this.ctx.currentTime, 0.8);
    });
  }

  update(active, enabled = true) {
    if (this.disposed) return;
    const now = this.ctx.currentTime;
    // Pauses and suspended/background time never accumulate enrichment.
    if (this.active && active && enabled && this.ctx.state === 'running') {
      this.seconds = Math.min(180, this.seconds + Math.min(0.25, Math.max(0, now - this.lastTime)));
    }
    this.lastTime = now;
    this.active = active && enabled;
    this.output.gain.setTargetAtTime(enabled ? 1 : 0, now, 0.04);
    const layers = soundLayers(this.seconds);
    layers.forEach((level, i) => this.voices[i].gain.gain.setTargetAtTime(level, now, 1.2));
    this.filter.frequency.setTargetAtTime(500 + this.tone.brightness * clamp(this.seconds / 120), now, 1.5);
    // Add voices without continually raising the overall level.
    const normalization = layers.reduce((sum, value) => sum + value, 0);
    this.bed.gain.setTargetAtTime(this.active ? 0.085 / normalization : 0, now, this.active ? 0.7 : 0.45);
  }

  chime(kind) {
    if (this.disposed) return;
    const ratios = kind === 'prayer' ? [1, this.tone.third, 1.5, 2] : kind === 'verse' ? [1, 2, 3] : [2];
    const duration = kind === 'activation' ? 0.7 : 2.4;
    ratios.forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.frequency.value = this.tone.root * ratio;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.026 / (i + 1), now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(this.output);
      this.sources.add(osc);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); this.sources.delete(osc); };
      osc.start();
      osc.stop(now + duration);
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.output.gain.cancelScheduledValues(this.ctx.currentTime);
    this.output.gain.setValueAtTime(0, this.ctx.currentTime);
    this.sources.forEach(source => { try { source.stop(); } catch (_) { /* ended */ } });
    this.nodes.forEach(node => node.disconnect());
    this.sources.clear();
  }
}
