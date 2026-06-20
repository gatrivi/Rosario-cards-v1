/** Tunable physics parameters — adjust here, never in React. */
export const ROSARY_CONFIG = {
  gravity: { x: 0, y: 0 },

  engine: {
    positionIterations: 6,
    velocityIterations: 4,
    constraintIterations: 3,
  },

  bead: {
    radius: 10,
    medalRadius: 20,
    crossWidth: 24,
    crossHeight: 48,
    restitution: 0,
    friction: 0.4,
    frictionAir: 0.12,
    slop: 0.02,
  },

  constraint: {
    stiffness: 0.4,
    damping: 0.8,
    tightGap: 2,
    shortGap: 10,
    longGap: 22,
  },

  drag: {
    cursorRadius: 8,
    constraintStiffness: 0.35,
    constraintDamping: 0.85,
  },

  layout: {
    minSurfaceGap: 3,
    loopVerticalOffset: 0.38,
    tailGapBelowMedal: 14,
  },

  render: {
    background: 'transparent',
    wireframes: false,
  },

  maxSpeed: 18,
};

export function linkLength(bodyA, bodyB, linkType) {
  const rA = bodyA.circleRadius || 10;
  const rB = bodyB.circleRadius || 10;
  const { tightGap, shortGap, longGap } = ROSARY_CONFIG.constraint;
  if (linkType === 'tight_link') return rA + rB + tightGap;
  if (linkType === 'long_chain') return rA + rB + longGap;
  return rA + rB + shortGap;
}
