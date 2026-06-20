import Matter from 'matter-js';
import { getRosaryBeads } from '../../../data/physicsRosaryData';
import { ROSARY_CONFIG } from './rosaryConfig';

const { Bodies } = Matter;

function beadOptions(data) {
  const { restitution, friction, frictionAir, slop } = ROSARY_CONFIG.bead;
  const opts = {
    restitution,
    friction,
    frictionAir,
    slop,
    isSensor: true,
    collisionFilter: { category: 0x0001, mask: 0 },
  };
  if (data.role === 'lone') opts.density = 0.018;
  if (data.physicsType === 'cross' || data.role === 'medal') opts.density = 0.055;
  return opts;
}

/**
 * Lay out beads with no overlap. Loop order matches canonical sequence.
 * Medal sits at the bottom opening of the loop; tail hangs downward.
 */
export function createBeads(misterioActual, width, height) {
  const beadsData = getRosaryBeads(misterioActual);
  const { radius, medalRadius, crossWidth, crossHeight } = ROSARY_CONFIG.bead;
  const { minSurfaceGap, loopVerticalOffset, tailGapBelowMedal } = ROSARY_CONFIG.layout;

  const cx = width / 2;
  const cy = height * loopVerticalOffset;

  const loopItems = beadsData.filter((b) => b.topology === 'loop');
  const pendantItems = beadsData.filter((b) => b.topology === 'tail' && b.role !== 'medal');
  const centerItem = beadsData.find((b) => b.role === 'medal');

  const nLoop = loopItems.length || 1;
  const loopRadius = Math.max(
    120,
    Math.min(width * 0.36, height * 0.32, (nLoop * (radius * 2 + minSurfaceGap)) / (2 * Math.PI))
  );

  const medalX = cx;
  const medalY = cy + loopRadius;

  const centerBody = Bodies.circle(medalX, medalY, medalRadius, beadOptions(centerItem));
  centerBody.beadData = centerItem;
  centerBody.circleRadius = medalRadius;

  const loopBodies = [];
  loopItems.forEach((data, i) => {
    // Start at 3 o'clock (medal-right attachment) proceed counter-clockwise
    const angle = (i / nLoop) * Math.PI * 2;
    const x = cx + Math.cos(angle) * loopRadius;
    const y = cy + Math.sin(angle) * loopRadius;
    const body = Bodies.circle(x, y, radius, beadOptions(data));
    body.beadData = data;
    body.circleRadius = radius;
    loopBodies.push(body);
  });

  const pendantBodies = [];
  let py = medalY + medalRadius + tailGapBelowMedal;
  const filteredPendant = [...pendantItems].reverse();

  filteredPendant.forEach((data) => {
    let body;
    if (data.physicsType === 'cross') {
      body = Bodies.rectangle(cx, py + crossHeight / 2 - 4, crossWidth, crossHeight, beadOptions(data));
      body.circleRadius = 15;
      py += crossHeight + minSurfaceGap + 8;
    } else {
      body = Bodies.circle(cx, py, radius, beadOptions(data));
      body.circleRadius = radius;
      py += radius * 2 + minSurfaceGap + 6;
    }
    body.beadData = data;
    pendantBodies.push(body);
  });

  return {
    beadsData,
    centerBody,
    loopBodies,
    pendantBodies,
    allBodies: [centerBody, ...loopBodies, ...pendantBodies],
    layout: { cx, cy, loopRadius, width, height },
  };
}
