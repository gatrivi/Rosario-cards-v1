import React from 'react';
import { act, render, cleanup } from '@testing-library/react';
import Matter from 'matter-js';
import RosaryAdapter from '../components/RosarioNube/RosaryAdapter';
import { buildSequence } from '../utils/bookletSequence';

describe('production Matter gesture handling', () => {
  let engine;
  let mouseConstraint;
  const sequence = buildSequence('gozosos');
  beforeEach(() => {
    jest.spyOn(Matter.Render, 'create').mockImplementation(({ element, engine: instance }) => {
      engine = instance;
      const canvas = document.createElement('canvas');
      canvas.width = 600; canvas.height = 800;
      element.appendChild(canvas);
      return { canvas, engine, options: {}, textures: {} };
    });
    jest.spyOn(Matter.Render, 'run').mockImplementation(() => {});
    jest.spyOn(Matter.Render, 'stop').mockImplementation(() => {});
    jest.spyOn(Matter.Runner, 'run').mockImplementation(() => {});
    jest.spyOn(Matter.Runner, 'stop').mockImplementation(() => {});
    const create = Matter.MouseConstraint.create;
    jest.spyOn(Matter.MouseConstraint, 'create').mockImplementation((...args) => {
      mouseConstraint = create(...args);
      return mouseConstraint;
    });
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600);
    jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800);
  });
  afterEach(() => { cleanup(); jest.restoreAllMocks(); });
  const bodies = () => Matter.Composite.allBodies(engine.world);
  const beadAt = (index) => bodies().find((b) => b.prayerIndex === index);
  const down = (bead) => act(() => {
    mouseConstraint.body = bead;
    mouseConstraint.mouse.position = bead ? { ...bead.position } : { x: 10, y: 10 };
    Matter.Events.trigger(mouseConstraint, 'mousedown', {});
  });
  const up = (dx = 0) => act(() => {
    // Matter clears its body before emitting mouseup.
    mouseConstraint.body = null;
    mouseConstraint.mouse.position.x += dx;
    Matter.Events.trigger(mouseConstraint, 'mouseup', {});
  });

  test('cross selects on release; drag, cancellation and empty tap never select or advance', () => {
    const select = jest.fn(); const advance = jest.fn();
    render(<RosaryAdapter sequence={sequence} soundEnabled={false} onBeadHoldStart={select} onAdvance={advance} />);
    const cross = beadAt(0);
    down(cross); expect(select).not.toHaveBeenCalled(); up();
    expect(select).toHaveBeenCalledWith(0);
    select.mockClear();
    down(cross); up(40);
    down(cross); act(() => window.dispatchEvent(new Event('pointercancel'))); up();
    down(null); up();
    expect(select).not.toHaveBeenCalled(); expect(advance).not.toHaveBeenCalled();
  });

  test('repeat taps follow Gloria and Fatima using current props without rebuilding physics', () => {
    const gloria = sequence.findIndex((p, i) => p.id === 'G' && sequence[i - 1]?.id === 'A');
    const select = jest.fn(); const repeat = jest.fn();
    window.addEventListener('beadRepeatTouch', repeat);
    const props = { sequence, soundEnabled: false, onBeadHoldStart: select };
    const view = render(<RosaryAdapter {...props} activePrayerIndex={gloria - 1} />);
    const bead = beadAt(gloria - 1); const originalEngine = engine;
    down(bead); up();
    down(bead); expect(repeat).not.toHaveBeenCalled(); up();
    expect(repeat.mock.calls[0][0].detail.prayerIndex).toBe(gloria - 1);
    view.rerender(<RosaryAdapter {...props} activePrayerIndex={gloria} />);
    down(bead); up();
    expect(repeat.mock.calls[1][0].detail.prayerIndex).toBe(gloria);
    view.rerender(<RosaryAdapter {...props} activePrayerIndex={gloria + 1} />);
    down(bead); up();
    expect(repeat.mock.calls[2][0].detail.prayerIndex).toBe(gloria + 1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(engine).toBe(originalEngine);
    window.removeEventListener('beadRepeatTouch', repeat);
  });

  test('medal uses updated unlock state and ignores drag', () => {
    const heart = jest.fn(); window.addEventListener('heartBeadPressed', heart);
    const props = { sequence, soundEnabled: false };
    const view = render(<RosaryAdapter {...props} activePrayerIndex={0} />);
    const medal = bodies().find((b) => b.isHeartMedal);
    down(medal); up(); expect(heart).not.toHaveBeenCalled();
    const ll = sequence.findIndex((p) => p.id === 'LL');
    view.rerender(<RosaryAdapter {...props} activePrayerIndex={ll} />);
    down(medal); up(40); expect(heart).not.toHaveBeenCalled();
    down(medal); expect(heart).not.toHaveBeenCalled(); up();
    expect(heart).toHaveBeenCalledTimes(1);
    window.removeEventListener('heartBeadPressed', heart);
  });

  test('empty swipe advances once; a pinch cancels it', () => {
    const advance = jest.fn();
    render(<RosaryAdapter sequence={sequence} soundEnabled={false} onAdvance={advance} />);
    down(null); up(-80);
    expect(advance).toHaveBeenCalledTimes(1);
    down(null);
    act(() => {
      const event = new Event('touchstart');
      Object.defineProperty(event, 'touches', { value: [{}, {}] });
      window.dispatchEvent(event);
    });
    up(-80);
    expect(advance).toHaveBeenCalledTimes(1);
  });

  test('swipe uses screen coordinates when panning keeps Matter coordinates unchanged', () => {
    const advance = jest.fn();
    render(<RosaryAdapter sequence={sequence} soundEnabled={false} onAdvance={advance} />);
    mouseConstraint.mouse.sourceEvents.mousedown = { clientX: 120, clientY: 300 };
    down(null);
    mouseConstraint.mouse.sourceEvents.mouseup = { changedTouches: [{ clientX: 30, clientY: 300 }] };
    up();
    expect(advance).toHaveBeenCalledTimes(1);
  });

  test('Matter picks the composite cross parent when a cross part is pressed', () => {
    const select = jest.fn();
    render(<RosaryAdapter sequence={sequence} soundEnabled={false} onBeadHoldStart={select} />);
    const cross = beadAt(0);
    act(() => {
      mouseConstraint.mouse.button = 0;
      mouseConstraint.mouse.position = { ...cross.parts[1].position };
      Matter.MouseConstraint.update(mouseConstraint, [cross]);
      expect(mouseConstraint.body).toBe(cross);
      Matter.Events.trigger(mouseConstraint, 'mousedown', {});
    });
    up();
    expect(select).toHaveBeenCalledWith(0);
  });

  test.each([[320, 568], [390, 744], [844, 330]])('rosary settles inside a %i × %i viewport with a connected cross', (width, height) => {
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
    jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height);
    render(<RosaryAdapter sequence={sequence} soundEnabled={false} />);
    const cross = beadAt(0);
    const links = Matter.Composite.allConstraints(engine.world);
    expect(links.some((link) => link.bodyA === cross || link.bodyB === cross)).toBe(true);
    for (let i = 0; i < 600; i += 1) Matter.Engine.update(engine, 1000 / 60);
    // Pull the cross across the screen, release, and let the actual solver settle.
    const origin = { ...cross.position };
    mouseConstraint.mouse.button = 0;
    for (let i = 0; i < 45; i += 1) {
      mouseConstraint.mouse.position = { x: origin.x + i / 45 * width * 0.25, y: origin.y + i / 45 * height * 0.1 };
      Matter.Engine.update(engine, 1000 / 60);
    }
    mouseConstraint.mouse.button = -1;
    for (let i = 0; i < 300; i += 1) Matter.Engine.update(engine, 1000 / 60);
    const visible = bodies().filter((b) => !b.isStatic && !b.isInvisible);
    expect(visible.every((b) => Number.isFinite(b.position.x) && Number.isFinite(b.position.y))).toBe(true);
    expect(Math.min(...visible.map((b) => b.bounds.min.x))).toBeGreaterThanOrEqual(-1);
    expect(Math.max(...visible.map((b) => b.bounds.max.x))).toBeLessThanOrEqual(width + 1);
    expect(Math.min(...visible.map((b) => b.bounds.min.y))).toBeGreaterThanOrEqual(-1);
    expect(Math.max(...visible.map((b) => b.bounds.max.y))).toBeLessThanOrEqual(height + 1);
    expect(Math.max(...visible.map((b) => b.speed))).toBeLessThan(0.3);
  });

  test('rearranging the rosary rebuilds geometry without navigating', () => {
    const select = jest.fn(), advance = jest.fn();
    render(<RosaryAdapter sequence={sequence} soundEnabled={false} activePrayerIndex={7} onBeadHoldStart={select} onAdvance={advance} />);
    const previousEngine = engine;
    act(() => window.dispatchEvent(new Event('resetRosaryLayout')));
    expect(engine).not.toBe(previousEngine);
    expect(select).not.toHaveBeenCalled();
    expect(advance).not.toHaveBeenCalled();
  });
});
