import Matter from 'matter-js';
import { ROSARY_CONFIG } from './rosaryConfig';

const { Engine } = Matter;

export function createEngine() {
  return Engine.create({
    gravity: ROSARY_CONFIG.gravity,
    positionIterations: ROSARY_CONFIG.engine.positionIterations,
    velocityIterations: ROSARY_CONFIG.engine.velocityIterations,
    constraintIterations: ROSARY_CONFIG.engine.constraintIterations,
  });
}
