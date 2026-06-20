import Matter from 'matter-js';
import { createEngine } from './createEngine';
import { createBeads } from './createBeads';
import { createConstraints } from './createConstraints';
import { ROSARY_CONFIG } from './rosaryConfig';

const { Bodies, World, Composite } = Matter;

export function createWorld(misterioActual, width, height) {
  const engine = createEngine();
  const world = engine.world;

  const beadPack = createBeads(misterioActual, width, height);
  const constraints = createConstraints(beadPack);

  const { cursorRadius } = ROSARY_CONFIG.drag;
  const cursorBody = Bodies.circle(width / 2, height / 2, cursorRadius, {
    isSensor: true,
    collisionFilter: { mask: 0 },
    render: { visible: false },
  });
  cursorBody.isCursor = true;

  World.add(world, [...beadPack.allBodies, cursorBody, ...constraints]);

  return {
    engine,
    world,
    ...beadPack,
    constraints,
    cursorBody,
  };
}

export function getPrayerBodies(world) {
  return Composite.allBodies(world).filter((b) => b.beadData);
}
