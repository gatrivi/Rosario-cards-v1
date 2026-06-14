/**
 * rosaryTopology.js
 *
 * Deterministic rosary edge topology for VirtualRosaryPhysics.
 *
 * Design goals:
 * - Stable loop closure (anti-knot) via explicit medal left/right ports.
 * - Deterministic edge ordering for constraint creation and distance correction pass.
 *
 * This file is intentionally free of Matter.js imports: it only describes edges.
 */

export const MEDAL_PORTS = {
  // Medal y_split dual ports (blueprint-derived offsets).
  left: { x: -9, y: -5 },
  right: { x: 9, y: -5 },
};

const isLoopLoneIndex = (loopIndex) => {
  // Blueprint v4 pattern (loop ring = 5 decades of 10 group-beads + 4 lone beads).
  // Using the assumption that loopBodies preserves this exact sequence ordering:
  // [cluster(10)] [lone] [cluster(10)] [lone] [cluster(10)] [lone] [cluster(10)] [lone] [cluster(10)]
  const lonePositions = new Set([10, 21, 32, 43]); // 0-based within loopBodies (expected N=54)
  return lonePositions.has(loopIndex);
};

/**
 * Returns deterministic edges for constraint creation.
 *
 * @param {Object} p
 * @param {Matter.Body} p.centerBody  Medal centerpiece body.
 * @param {Array<Matter.Body>} p.loopBodies Ordered arc/circle bodies (expected N=54).
 * @param {Array<Matter.Body>} p.pendantBodies Tail strand bodies (excluding medal).
 * @returns {Array<{bodyA:any, bodyB:any, pointA:{x:number,y:number}, pointB:{x:number,y:number}, link:string}>}
 */
export const buildRosaryEdges = ({ centerBody, loopBodies, pendantBodies }) => {
  const edges = [];

  // ── Loop ring edges: sequential + explicit medal port closures ──
  // Edges in exact declared order for determinism.
  for (let i = 0; i < loopBodies.length - 1; i++) {
    const bodyA = loopBodies[i];
    const bodyB = loopBodies[i + 1];
    const loneA = isLoopLoneIndex(i);
    const loneB = isLoopLoneIndex(i + 1);
    const link = (loneA || loneB) ? 'long_chain' : 'tight_link';

    edges.push({
      bodyA,
      bodyB,
      pointA: { x: 0, y: 0 },
      pointB: { x: 0, y: 0 },
      link,
    });
  }

  if (loopBodies.length > 0) {
    const loopFirst = loopBodies[0];
    const loopLast = loopBodies[loopBodies.length - 1];

    // Start attachment: loopFirst -> medal_port_right
    edges.push({
      bodyA: loopFirst,
      bodyB: centerBody,
      pointA: { x: 0, y: 0 },
      pointB: MEDAL_PORTS.right,
      link: 'short_chain',
    });

    // End attachment: loopLast -> medal_port_left
    edges.push({
      bodyA: loopLast,
      bodyB: centerBody,
      pointA: { x: 0, y: 0 },
      pointB: MEDAL_PORTS.left,
      link: 'short_chain',
    });
  }

  // ── Tail edges: deterministic chain from centerBody down pendantBodies ──
  // We keep existing cross offset behavior, but the edge ordering is explicit.
  const tailCrossYOffset = 15;
  for (let i = 0; i < pendantBodies.length; i++) {
    const bodyA = i === 0 ? centerBody : pendantBodies[i - 1];
    const bodyB = pendantBodies[i];

    const isCrossA = bodyA?.beadData?.physicsType === 'cross';
    const isCrossB = bodyB?.beadData?.physicsType === 'cross';

    const pointA = isCrossA ? { x: 0, y: tailCrossYOffset } : { x: 0, y: 0 };
    const pointB = isCrossB ? { x: 0, y: -tailCrossYOffset } : { x: 0, y: 0 };

    const roleA = bodyA?.beadData?.role;
    const roleB = bodyB?.beadData?.role;
    const physicsA = bodyA?.beadData?.physicsType;
    const physicsB = bodyB?.beadData?.physicsType;

    // Keep deterministic intent:
    // - If cross involved => short_chain (transition feel)
    // - If a lone is involved => long_chain (isolate PN-like beads)
    // - else => tight_link
    let link;
    if (physicsA === 'cross' || physicsB === 'cross') link = 'short_chain';
    else if (roleA === 'lone' || roleB === 'lone') link = 'long_chain';
    else link = 'tight_link';

    edges.push({ bodyA, bodyB, pointA, pointB, link });
  }

  return edges;
};

