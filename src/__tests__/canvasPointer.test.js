import Matter from 'matter-js';
import { clientToCanvasPoint, hitTestBeadBodies } from '../components/RosarioNube/utils/canvasPointer';

describe('canvasPointer', () => {
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
});
