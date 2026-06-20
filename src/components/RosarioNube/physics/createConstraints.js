import Matter from 'matter-js';
import { buildRosaryEdges } from '../../../data/rosaryTopology';
import { ROSARY_CONFIG, linkLength } from './rosaryConfig';

const { Constraint } = Matter;

export function createConstraints({ centerBody, loopBodies, pendantBodies }) {
  const { stiffness, damping } = ROSARY_CONFIG.constraint;
  const edges = buildRosaryEdges({ centerBody, loopBodies, pendantBodies });
  const constraints = [];

  edges.forEach((edge) => {
    const c = Constraint.create({
      bodyA: edge.bodyA,
      bodyB: edge.bodyB,
      pointA: edge.pointA,
      pointB: edge.pointB,
      length: linkLength(edge.bodyA, edge.bodyB, edge.link),
      stiffness,
      damping,
      render: { visible: false },
    });
    constraints.push(c);
  });

  return constraints;
}
