import Matter from 'matter-js';

/** Map screen coords to Matter canvas space (handles CSS scaling). */
export function clientToCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
  const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

/** Region hit-test for rosary bead bodies at a screen pointer. */
export function hitTestBeadBodies(bodies, canvas, clientX, clientY, pickRadius = 24) {
  if (!canvas || !bodies?.length) return false;
  const point = clientToCanvasPoint(canvas, clientX, clientY);
  const region = {
    min: { x: point.x - pickRadius, y: point.y - pickRadius },
    max: { x: point.x + pickRadius, y: point.y + pickRadius },
  };
  return Matter.Query.region(bodies, region).length > 0;
}
