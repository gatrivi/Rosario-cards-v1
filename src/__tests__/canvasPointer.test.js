import Matter from 'matter-js';
import { clientToCanvasPoint, hitTestBeadBodies, syncMouseToCanvas } from '../components/RosarioNube/utils/canvasPointer';

describe('canvasPointer', () => {
  test('Matter pointer coordinates follow CSS zoom changes', () => {
    const mouse = { absolute: { x: 240, y: 360 }, position: {}, offset: { x: 0, y: 0 }, scale: {} };
    const canvas = { clientWidth: 400, clientHeight: 600,
      getBoundingClientRect: () => ({ width: 480, height: 720 }) };
    syncMouseToCanvas(mouse, canvas);
    expect(mouse.position.x).toBeCloseTo(200);
    expect(mouse.position.y).toBeCloseTo(300);
    canvas.getBoundingClientRect = () => ({ width: 640, height: 960 });
    syncMouseToCanvas(mouse, canvas);
    expect(mouse.position.x).toBeCloseTo(150);
    expect(mouse.position.y).toBeCloseTo(225);
  });
  test('clientToCanvasPoint scales for CSS-stretched canvas', () => {
    const canvas = {
      width: 400,
      height: 800,
      getBoundingClientRect: () => ({ left: 10, top: 20, width: 200, height: 400 }),
    };
    const point = clientToCanvasPoint(canvas, 110, 120);
    expect(point.x).toBeCloseTo(200);
    expect(point.y).toBeCloseTo(200);
  });

  test('hitTestBeadBodies finds bead in scaled canvas space', () => {
    const bead = Matter.Bodies.circle(200, 200, 10);
    const canvas = {
      width: 400,
      height: 800,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 800 }),
    };
    expect(hitTestBeadBodies([bead], canvas, 200, 200)).toBe(true);
    expect(hitTestBeadBodies([bead], canvas, 0, 0)).toBe(false);
  });

  test('invisible chain target does not reserve a halo of empty space', () => {
    const chain = Matter.Bodies.circle(100, 100, 5, { isInvisible: true });
    const canvas = { width: 200, height: 200,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }) };
    expect(hitTestBeadBodies([chain], canvas, 100, 100)).toBe(true);
    expect(hitTestBeadBodies([chain], canvas, 120, 100)).toBe(false);
  });
});
