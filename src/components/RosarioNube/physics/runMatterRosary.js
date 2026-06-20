import Matter from 'matter-js';
import { getPhysicalMapping } from '../../../data/physicsRosaryData';
import { createWorld, getPrayerBodies } from './createWorld';
import { destroyMatterRosary } from './destroyMatterRosary';
import { ROSARY_CONFIG } from './rosaryConfig';

const { Body, Composite, Constraint, Events, Query, Render, World } = Matter;

function clientPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  }
  if (e.changedTouches && e.changedTouches.length) {
    return { x: e.changedTouches[0].clientX - rect.left, y: e.changedTouches[0].clientY - rect.top };
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function findBeadAt(world, pos, pickRadius = 28) {
  const bounds = {
    min: { x: pos.x - pickRadius, y: pos.y - pickRadius },
    max: { x: pos.x + pickRadius, y: pos.y + pickRadius },
  };
  const hits = Query.region(Composite.allBodies(world), bounds);
  return hits.find((b) => b.beadData);
}

function styleBody(body, fill, stroke, lineWidth = 1) {
  body.render.fillStyle = fill;
  body.render.strokeStyle = stroke;
  body.render.lineWidth = lineWidth;
}

function applyBodyStyles(bodies, activeLiturgicIndex, misterioActual, beadsData) {
  const mapping = getPhysicalMapping(misterioActual);
  const activePhysical = mapping[activeLiturgicIndex] ?? 0;

  bodies.forEach((body) => {
    const data = body.beadData;
    if (!data) return;
    const physicalIndex = beadsData.findIndex((b) => b.id === data.id);
    const isActive = data.index === activeLiturgicIndex;
    const prayed = physicalIndex >= 0 && physicalIndex < activePhysical;

    if (data.physicsType === 'cross') {
      styleBody(body, prayed || isActive ? '#c9a227' : '#333333', isActive ? '#ffffff' : '#666666', isActive ? 2 : 1);
    } else if (data.role === 'medal') {
      styleBody(body, '#111111', isActive ? '#f5e6a0' : '#d4af37', 2);
    } else if (data.role === 'lone') {
      styleBody(body, prayed || isActive ? '#e8c547' : '#cccccc', isActive ? '#ffffff' : '#888888', isActive ? 2 : 1);
    } else {
      styleBody(body, prayed || isActive ? '#d4af37' : '#eeeeee', isActive ? '#ffffff' : '#aaaaaa', isActive ? 2 : 1);
    }
  });
}

/**
 * @param {HTMLElement} container
 * @param {object} opts
 * @returns handle with destroy(), setActiveIndex(), setGuided()
 */
export function runMatterRosary(container, opts = {}) {
  const {
    misterioActual = 'gozosos',
    getCallbacks = () => ({}),
    getActiveIndex = () => 0,
    getGuided = () => true,
  } = opts;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 600;

  const worldPack = createWorld(misterioActual, width, height);
  const { engine, world, cursorBody, beadsData, allBodies, constraints } = worldPack;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const render = Render.create({
    canvas,
    engine,
    options: {
      width,
      height,
      background: ROSARY_CONFIG.render.background,
      wireframes: ROSARY_CONFIG.render.wireframes,
      showAngleIndicator: false,
      showVelocity: false,
    },
  });

  allBodies.forEach((b) => {
    if (b.beadData) {
      b.render = b.render || {};
      b.render.visible = true;
    }
  });
  if (cursorBody.render) cursorBody.render.visible = false;

  applyBodyStyles(getPrayerBodies(world), getActiveIndex(), misterioActual, beadsData);

  const handle = {
    destroyed: false,
    engine,
    world,
    render,
    canvas,
    container,
    domListeners: [],
    dragConstraint: null,
    heldBead: null,
    activeLiturgicIndex: getActiveIndex(),
    misterioActual,
    pulse: 0,
    renderLoopId: null,
  };

  const addListener = (target, type, fn, listenerOpts) => {
    target.addEventListener(type, fn, listenerOpts);
    handle.domListeners.push({ target, type, fn, opts: listenerOpts });
  };

  const removeDragConstraint = () => {
    if (handle.dragConstraint) {
      World.remove(world, handle.dragConstraint);
      handle.dragConstraint = null;
    }
    handle.heldBead = null;
  };

  const attachDragConstraint = (bead) => {
    removeDragConstraint();
    handle.heldBead = bead;
    handle.dragConstraint = Constraint.create({
      bodyA: cursorBody,
      bodyB: bead,
      stiffness: ROSARY_CONFIG.drag.constraintStiffness,
      damping: ROSARY_CONFIG.drag.constraintDamping,
      length: 0,
      render: { visible: false },
    });
    World.add(world, handle.dragConstraint);

    const data = bead.beadData;
    if (data && getCallbacks().onBeadClick) {
      getCallbacks().onBeadClick(data.index);
    } else if (data && getCallbacks().onNodeClick) {
      getCallbacks().onNodeClick(data.index);
    }
  };

  let pointerDown = null;
  let isPanning = false;
  let panMode = false;

  const onSpeedCap = () => {
    const maxSpeed = ROSARY_CONFIG.maxSpeed;
    getPrayerBodies(world).forEach((body) => {
      const speed = Math.hypot(body.velocity.x, body.velocity.y);
      if (speed > maxSpeed) {
        const s = maxSpeed / speed;
        Body.setVelocity(body, { x: body.velocity.x * s, y: body.velocity.y * s });
      }
    });
  };
  Events.on(engine, 'beforeUpdate', onSpeedCap);

  const onPointerDown = (e) => {
    if (e.target !== canvas) return;
    const pos = clientPos(e, canvas);
    pointerDown = { ...pos, time: Date.now() };
    Body.setPosition(cursorBody, pos);

    const bead = findBeadAt(world, pos);
    if (bead) {
      panMode = false;
      isPanning = false;
      attachDragConstraint(bead);
    } else {
      panMode = true;
      isPanning = true;
      removeDragConstraint();
      const cb = getCallbacks();
      if (cb.onEmptyPointerDown) cb.onEmptyPointerDown(e);
    }
  };

  const onPointerMove = (e) => {
    const pos = clientPos(e, canvas);
    Body.setPosition(cursorBody, pos);

    if (isPanning && panMode && pointerDown) {
      const dx = pos.x - pointerDown.x;
      const dy = pos.y - pointerDown.y;
      if (Math.hypot(dx, dy) > 2) {
        getPrayerBodies(world).forEach((body) => {
          Body.translate(body, { x: dx, y: dy });
        });
        pointerDown = { ...pos, time: pointerDown.time };
        const cb = getCallbacks();
        if (cb.onEmptyPointerMove) cb.onEmptyPointerMove(e);
      }
    }
  };

  const onPointerUp = (e) => {
    const pos = clientPos(e, canvas);
    const dist = pointerDown
      ? Math.hypot(pos.x - pointerDown.x, pos.y - pointerDown.y)
      : 0;
    const duration = pointerDown ? Date.now() - pointerDown.time : 0;

    removeDragConstraint();

    const cb = getCallbacks();
    const guided = getGuided();

    if (panMode && cb.onEmptyPointerUp) {
      cb.onEmptyPointerUp(e);
    }

    if (dist < 30 && duration < 400) {
      const bead = findBeadAt(world, pos);
      if (bead && !guided) {
        const data = bead.beadData;
        if (cb.onBeadClick) cb.onBeadClick(data.index);
        else if (cb.onNodeClick) cb.onNodeClick(data.index);
      } else if (!bead && guided && cb.onAdvance) {
        cb.onAdvance();
      } else if (bead && guided && cb.onBeadClick) {
        cb.onBeadClick(bead.beadData.index);
      } else if (bead && guided && cb.onNodeClick) {
        cb.onNodeClick(bead.beadData.index);
      }
    }

    if (dist > 50 && duration < 600 && pointerDown) {
      const dx = pos.x - pointerDown.x;
      if (Math.abs(dx) > 30) {
        if (dx < 0) {
          if (cb.onSwipeAdvance) cb.onSwipeAdvance();
          else if (cb.onAdvance) cb.onAdvance();
        } else {
          if (cb.onSwipeRetreat) cb.onSwipeRetreat();
          else if (cb.onRetreat) cb.onRetreat();
        }
      }
    }

    pointerDown = null;
    isPanning = false;
    panMode = false;
  };

  addListener(canvas, 'mousedown', onPointerDown);
  addListener(canvas, 'mousemove', onPointerMove);
  addListener(canvas, 'mouseup', onPointerUp);
  addListener(canvas, 'mouseleave', onPointerUp);
  addListener(canvas, 'touchstart', onPointerDown, { passive: true });
  addListener(canvas, 'touchmove', onPointerMove, { passive: true });
  addListener(canvas, 'touchend', onPointerUp, { passive: true });
  addListener(canvas, 'touchcancel', onPointerUp, { passive: true });

  Render.run(render);

  const onAfterRender = () => {
    if (handle.destroyed) return;

    applyBodyStyles(getPrayerBodies(world), handle.activeLiturgicIndex, misterioActual, beadsData);

    const ctx = render.context;
    const mapping = getPhysicalMapping(misterioActual);
    const activePhysical = mapping[handle.activeLiturgicIndex] ?? 0;

    constraints.forEach((c) => {
      if (!c.bodyA || !c.bodyB) return;
      const ax = c.bodyA.position.x + (c.pointA?.x || 0);
      const ay = c.bodyA.position.y + (c.pointA?.y || 0);
      const bx = c.bodyB.position.x + (c.pointB?.x || 0);
      const by = c.bodyB.position.y + (c.pointB?.y || 0);

      const idxA = c.bodyA.beadData ? beadsData.findIndex((b) => b.id === c.bodyA.beadData.id) : -1;
      const idxB = c.bodyB.beadData ? beadsData.findIndex((b) => b.id === c.bodyB.beadData.id) : -1;
      const prayed = idxA >= 0 && idxB >= 0 && idxA < activePhysical && idxB < activePhysical;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = prayed ? 'rgba(212, 175, 55, 0.85)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = prayed ? 2.5 : 1.5;
      ctx.stroke();
    });
  };

  Events.on(render, 'afterRender', onAfterRender);
  handle.onAfterRender = onAfterRender;

  handle.setActiveIndex = (index) => {
    if (handle.activeLiturgicIndex !== index) {
      handle.activeLiturgicIndex = index;
      handle.pulse = 1;
      if (handle.pulseTimer) clearTimeout(handle.pulseTimer);
      handle.pulseTimer = setTimeout(() => { handle.pulse = 0; }, 500);
    }
  };

  handle.setGuided = () => { /* ref-driven via getGuided */ };

  handle.destroy = () => {
    Events.off(engine, 'beforeUpdate', onSpeedCap);
    if (handle.onAfterRender && handle.render) {
      Events.off(handle.render, 'afterRender', handle.onAfterRender);
    }
    destroyMatterRosary(handle);
  };

  return handle;
}
