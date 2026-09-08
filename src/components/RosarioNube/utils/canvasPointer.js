import Matter from 'matter-js';

/** Gesture distances stay in screen pixels even while the canvas pans/zooms. */
export function mouseGesturePoint(mouse, eventName) {
  const event = mouse.sourceEvents?.[eventName];
  const point = event?.changedTouches?.[0] || event;
  return Number.isFinite(point?.clientX)
    ? { x: point.clientX, y: point.clientY }
    : { ...mouse.position };
}

/** Matter accounts for canvas resolution, but not CSS transforms. */
export function syncMouseToCanvas(mouse, canvas) {
  const rect = canvas.getBoundingClientRect();
  Matter.Mouse.setScale(mouse, {
    x: rect.width > 0 ? canvas.clientWidth / rect.width : 1,
    y: rect.height > 0 ? canvas.clientHeight / rect.height : 1,
  });
}

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

/** Match Matter's actual picking geometry so empty space remains pannable. */
export function hitTestBeadBodies(bodies, canvas, clientX, clientY) {
  if (!canvas || !bodies?.length) return false;
  const point = clientToCanvasPoint(canvas, clientX, clientY);
  return Matter.Query.point(bodies, point).length > 0;
}
