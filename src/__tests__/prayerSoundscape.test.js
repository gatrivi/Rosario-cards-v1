import { PrayerSoundscape, prayerTone, soundLayers } from '../audio/prayerSoundscape';

function context() {
  const param = () => ({ value: 0, setTargetAtTime: jest.fn(), setValueAtTime: jest.fn(),
    cancelScheduledValues: jest.fn(), linearRampToValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() });
  const nodes = [];
  const node = () => {
    const result = { gain: param(), frequency: param(), Q: param(), delayTime: param(),
      connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn() };
    nodes.push(result);
    return result;
  };
  return { currentTime: 0, state: 'running', destination: {}, nodes,
    createGain: node, createOscillator: node, createDelay: node, createBiquadFilter: node };
}

test('harmonies emerge gradually with bounded richness', () => {
  expect(soundLayers(0).filter(Boolean)).toHaveLength(1);
  expect(soundLayers(30).filter(Boolean)).toHaveLength(3);
  expect(soundLayers(150).filter(Boolean)).toHaveLength(4);
  expect(soundLayers(10000)).toEqual(soundLayers(180));
});

test('only active audible prayer time accumulates; paused ticks stay silent', () => {
  const ctx = context();
  const engine = new PrayerSoundscape(ctx);
  engine.update(true);
  for (let i = 0; i < 100; i++) { ctx.currentTime += 0.12; engine.update(true); }
  expect(engine.seconds).toBeCloseTo(12);
  engine.update(false);
  ctx.currentTime += 60;
  engine.update(false);
  expect(engine.seconds).toBeCloseTo(12);
  expect(engine.bed.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, ctx.currentTime, 0.45);
  engine.update(true, false);
  ctx.currentTime += 60;
  engine.update(true, false);
  expect(engine.seconds).toBeCloseTo(12);
  expect(engine.output.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, ctx.currentTime, 0.04);
  ctx.state = 'suspended';
  engine.update(true);
  ctx.currentTime += 1;
  engine.update(true);
  expect(engine.seconds).toBeCloseTo(12);
});

test('theme and prayer changes retune existing voices and completion bells', () => {
  const ctx = context();
  const engine = new PrayerSoundscape(ctx);
  engine.setTheme('dolorosos', 'P');
  const tone = prayerTone('dolorosos', 'P');
  expect(tone.third).toBe(1.2);
  expect(prayerTone('patrick', 'P').third).toBe(1.5);
  expect(engine.voices[2].osc.frequency.setTargetAtTime).toHaveBeenLastCalledWith(tone.root * tone.third, 0, 0.8);
  const before = ctx.nodes.length;
  engine.chime('prayer');
  const bellNodes = ctx.nodes.slice(before);
  expect(bellNodes[2].frequency.value).toBe(tone.root * tone.third);
  expect(bellNodes[3].connect).toHaveBeenCalledWith(engine.output);
  engine.dispose();
  engine.dispose();
  expect(engine.output.disconnect).toHaveBeenCalledTimes(1);
  bellNodes.filter((_, i) => i % 2 === 0).forEach(osc => expect(osc.stop).toHaveBeenCalledTimes(2));
});
