import Matter from 'matter-js';

const { Events, Render, World, Engine } = Matter;

/**
 * Idempotent teardown for a runMatterRosary handle.
 */
export function destroyMatterRosary(handle) {
  if (!handle || handle.destroyed) return;

  handle.destroyed = true;

  if (handle.renderLoopId) {
    cancelAnimationFrame(handle.renderLoopId);
    handle.renderLoopId = null;
  }

  if (handle.render) {
    Events.off(handle.render);
    Render.stop(handle.render);
    if (handle.render.canvas && handle.render.canvas.parentNode) {
      handle.render.canvas.parentNode.removeChild(handle.render.canvas);
    }
    handle.render = null;
  }

  if (handle.engine) {
    Events.off(handle.engine);
  }

  (handle.domListeners || []).forEach(({ target, type, fn, opts }) => {
    target.removeEventListener(type, fn, opts);
  });
  handle.domListeners = [];

  if (handle.dragConstraint && handle.world) {
    World.remove(handle.world, handle.dragConstraint);
    handle.dragConstraint = null;
  }

  if (handle.world) {
    World.clear(handle.world, false);
    handle.world = null;
  }

  if (handle.engine) {
    Engine.clear(handle.engine);
    handle.engine = null;
  }

  if (handle.pulseTimer) {
    clearTimeout(handle.pulseTimer);
    handle.pulseTimer = null;
  }
}
