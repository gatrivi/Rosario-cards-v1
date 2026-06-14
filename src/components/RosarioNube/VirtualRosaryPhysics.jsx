import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { getRosaryBeads, getPhysicalMapping } from '../../data/physicsRosaryData';
import { buildRosaryEdges } from '../../data/rosaryTopology';
import CosmicResonator from '../../audio/CosmicResonator';
import audioManager from '../../utils/audioManager';
import { SACRED_SYMBOLS, SYMBOL_MAP } from '../../data/SacredSymbols';

const { Engine, World, Bodies, Constraint, Mouse, MouseConstraint, Composite, Events, Query, Body } = Matter;

// ─── Cross Gesture Detection ───
function detectCrossGesture(points) {
  if (points.length < 14) return false;

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const w = maxX - minX;
  const h = maxY - minY;

  if (Math.min(w, h) < 50) return false;
  if (Math.max(w, h) / Math.min(w, h) > 2.8) return false;

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // 3x3 grid occupancy
  let topCenter = 0, bottomCenter = 0, midLeft = 0, midRight = 0, center = 0;
  for (const p of points) {
    const gx = p.x < cx - w * 0.22 ? 0 : (p.x > cx + w * 0.22 ? 2 : 1);
    const gy = p.y < cy - h * 0.22 ? 0 : (p.y > cy + h * 0.22 ? 2 : 1);
    if (gx === 1 && gy === 0) topCenter++;
    if (gx === 1 && gy === 2) bottomCenter++;
    if (gx === 0 && gy === 1) midLeft++;
    if (gx === 2 && gy === 1) midRight++;
    if (gx === 1 && gy === 1) center++;
  }

  // Require a Latin cross proportion: vertical arm longer than horizontal
  const verticalRatio = h / w;
  return topCenter > 1 && bottomCenter > 1 && midLeft > 1 && midRight > 1 && center > 2 && verticalRatio > 1.0;
}

const PRAYER_FREQ = {
  'P': 130.81, // C3 — Padre Nuestro (grounding)
  'A': 164.81, // E3 — Ave María (warm)
  'G': 196.00, // G3 — Gloria (bright, ascending)
  'F': 146.83, // D3 — Creed (contemplative)
  'LL': 130.81, // C3
  'S': 130.81, // C3
};

const VirtualRosaryPhysics = ({
  onNodeClick,
  onLinkClick,
  onAdvance,
  onRetreat,
  onSwipeAdvance,
  onSwipeRetreat,
  onEmptyPointerDown,
  onEmptyPointerMove,
  onEmptyPointerUp,
  activePrayerIndex = 0,
  misterioActual = 'gozosos',
  soundEnabled = true,
  isLeftHanded = false,
  guided = true,
}) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(Engine.create({
    gravity: { x: 0, y: 0 },
    positionIterations: 8,
    velocityIterations: 6,
    constraintIterations: 4,
  }));
  const pulseRef = useRef(0);
  const activeIndexRef = useRef(activePrayerIndex);
  const zoomScaleRef = useRef(1);
  const homePositionsRef = useRef([]);
  const guidedRef = useRef(guided);
  const swipeStartRef = useRef(null);
  const isEmptyTouchingRef = useRef(false);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Callbacks refs to prevent re-renders
  const callbacksRef = useRef({
    onNodeClick, onLinkClick, onAdvance, onRetreat,
    onSwipeAdvance, onSwipeRetreat, onEmptyPointerDown,
    onEmptyPointerMove, onEmptyPointerUp
  });

  useEffect(() => {
    callbacksRef.current = {
      onNodeClick, onLinkClick, onAdvance, onRetreat,
      onSwipeAdvance, onSwipeRetreat, onEmptyPointerDown,
      onEmptyPointerMove, onEmptyPointerUp
    };
  }, [
    onNodeClick, onLinkClick, onAdvance, onRetreat,
    onSwipeAdvance, onSwipeRetreat, onEmptyPointerDown,
    onEmptyPointerMove, onEmptyPointerUp
  ]);

  // Audio system refs
  const audioCtxRef = useRef(null);
  const VoxOrganiRef = useRef(null);
  const totalPhysicalBeadsRef = useRef(61);

  // Gesture & magnetism refs
  const strokePointsRef = useRef([]);
  const magnetismActiveRef = useRef(false);
  const magnetismEndTimeRef = useRef(0);
  const needsRescueRef = useRef(false);
  const rescueFlashRef = useRef(0);

  // Keep guided ref in sync without re-running the engine effect
  useEffect(() => { guidedRef.current = guided; }, [guided]);

  useEffect(() => {
    if (activePrayerIndex !== activeIndexRef.current) {
      activeIndexRef.current = activePrayerIndex;
      pulseRef.current = 1;
      setTimeout(() => { pulseRef.current = 0; }, 600);
      if (VoxOrganiRef.current) {
        const denom = totalPhysicalBeadsRef.current || 1;
        const p = (activePrayerIndex + 1) / denom;
        VoxOrganiRef.current.setProgress(p);
      }
    }
  }, [activePrayerIndex]);

  useEffect(() => {
    activeIndexRef.current = activePrayerIndex;
  }, [activePrayerIndex]);

  // Mystery/chord changes must trigger SanctusFlush inside the resonator.
  useEffect(() => {
    if (VoxOrganiRef.current) VoxOrganiRef.current.setMystery(misterioActual);
  }, [misterioActual]);

  // Sound toggle.
  useEffect(() => {
    if (!VoxOrganiRef.current) return;
    VoxOrganiRef.current.soundEnabled = soundEnabled;
    if (!soundEnabled) VoxOrganiRef.current.silenceToHum();
  }, [soundEnabled]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const engine = engineRef.current;
    const world = engine.world;
    const beadsData = getRosaryBeads(misterioActual);

    // Clear existing world if misterioActual changed
    World.clear(world, false);
    Engine.clear(engine);

    const allBodies = [];
    const allConstraints = [];
    homePositionsRef.current = [];

    const cx = width / 2;
    const cy = height * 0.45;
    const loopRadius = Math.min(width * 0.38, 200);

    // collisionStart must fire between beads; previously nextGroup(true) disabled collisions.
    const rosaryGroup = Matter.Body.nextGroup(false);
    const beadCategory = 0x0001;

    // Physics tuned for contemplative weight: dry impacts, deliberate movement
    const baseBeadOptions = {
      restitution: 0.0,
      friction: 0.5,
      frictionAir: 0.06,
      // Allow gentle 2D ghosting overlap without explosive separation.
      slop: 0.05,
      // Sensor beads: collisions still trigger collisionStart, but they do not physically "push".
      isSensor: true,
      collisionFilter: { category: beadCategory, mask: beadCategory }
    };

    const getBeadOptions = (data) => {
      const opts = { ...baseBeadOptions };
      // Padre Nuestro beads are heavier — require denser drag
      if (data.role === 'lone') {
        opts.density = 0.020;
      }
      // Crucifix and medal have more heft
      if (data.physicsType === 'cross' || data.role === 'medal') {
        opts.density = 0.060;
      }
      if (data.role === 'medal') opts.density = 0.040;
      return opts;
    };

    const pendantItems = beadsData.filter(b => b.topology === 'tail');
    const loopItems = beadsData.filter(b => b.topology === 'loop');

    const centerItem = beadsData.find(b => b.role === 'medal') || beadsData.find(b => b.physicsType === 'center') || pendantItems[pendantItems.length - 1];
    const beadRadius = 10;

    // AudioContext resume guard:
    // browsers can keep ctx in "suspended" until a direct user gesture happens.
    const resumeAudioIfSuspendedInline = () => {
      const ctx = audioManager.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
    };

    // 1. Centerpiece (Medal) — free floating, no anchor
    const centerBody = Bodies.circle(cx, cy + loopRadius, 20, getBeadOptions(centerItem));
    centerBody.beadData = centerItem;
    centerBody.circleRadius = 20;
    centerBody.home = { x: cx, y: cy + loopRadius };
    allBodies.push(centerBody);
    homePositionsRef.current.push(centerBody.home);

    // 2. Loop
    const loopBodies = [];
    loopItems.forEach((data, i) => {
      const startAngle = Math.PI / 2;
      const totalAngle = Math.PI * 2;
      const angle = startAngle + ((i + 1) / (loopItems.length + 1)) * totalAngle;

      const x = cx + Math.cos(angle) * loopRadius;
      const y = cy + Math.sin(angle) * loopRadius;

      const body = Bodies.circle(x, y, beadRadius, getBeadOptions(data));
      body.beadData = data;
      body.circleRadius = beadRadius;
      body.home = { x, y };
      loopBodies.push(body);
      allBodies.push(body);
      homePositionsRef.current.push(body.home);
    });

    // 3. Pendant (Tail)
    const pendantBodies = [];
    let py = cy + loopRadius + 30;
    const filteredPendant = pendantItems.filter(b => b.id !== centerItem.id).reverse();

    filteredPendant.forEach((data) => {
      let body;
      if (data.physicsType === 'cross') {
        body = Bodies.rectangle(cx, py + 20, 24, 48, getBeadOptions(data));
        body.circleRadius = 15;
        py += 60;
      } else {
        body = Bodies.circle(cx, py, beadRadius, getBeadOptions(data));
        body.circleRadius = beadRadius;
        py += beadRadius * 2 + 10;
      }
      body.beadData = data;
      pendantBodies.push(body);
      allBodies.push(body);
      const homeY = py - (data.physicsType === 'cross' ? 40 : beadRadius + 5);
      body.home = { x: cx, y: homeY };
      homePositionsRef.current.push(body.home);
    });

    const getLinkParams = (link, bodyA, bodyB) => {
      const r = Math.max(bodyA.circleRadius || 10, bodyB.circleRadius || 10);
      if (link === 'tight_link') return { length: 2 * r + 1, stiffness: 0.85, damping: 0.12 };
      if (link === 'long_chain') return { length: 2 * r + 18, stiffness: 0.65, damping: 0.18 };
      return { length: 2 * r + 8, stiffness: 0.80, damping: 0.15 }; // short_chain
    };

    // Deterministic topology edges (explicit medal port closures).
    const edges = buildRosaryEdges({ centerBody, loopBodies, pendantBodies });
    const correctionEdges = [];
    edges.forEach((edge) => {
      const params = getLinkParams(edge.link, edge.bodyA, edge.bodyB);
      const c = Constraint.create({
        bodyA: edge.bodyA,
        bodyB: edge.bodyB,
        pointA: edge.pointA,
        pointB: edge.pointB,
        length: params.length,
        stiffness: params.stiffness,
        damping: params.damping,
        render: { visible: false }
      });
      allConstraints.push(c);
      correctionEdges.push({
        bodyA: edge.bodyA,
        bodyB: edge.bodyB,
        pointA: edge.pointA,
        pointB: edge.pointB,
        targetLength: params.length,
      });
    });

    World.add(world, [...allBodies, ...allConstraints]);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: guided ? 0.6 : 0.9, render: { visible: false } }
    });

    // Mouse constraint available in both modes, but very soft in guided
    World.add(world, mouseConstraint);

    const ensureVoxOrgani = () => {
      if (!soundEnabled) return false;
      if (VoxOrganiRef.current) return true;

      const ctx = audioManager.getContext();
      if (!ctx) return false;

      audioCtxRef.current = ctx;
      VoxOrganiRef.current = new CosmicResonator(ctx, { misterioActual, soundEnabled });

      // Seed progress immediately for seamless first interaction.
      totalPhysicalBeadsRef.current = beadsData.length || 61;
      const denom = totalPhysicalBeadsRef.current || 1;
      const p = (activeIndexRef.current + 1) / denom;
      VoxOrganiRef.current.setProgress(p);
      return true;
    };

    const updateAudioWarmth = (warmth = 0.1) => {
      if (!ensureVoxOrgani()) return;
      VoxOrganiRef.current.setWarmth(warmth);
    };

    const stopSynth = () => {
      if (!VoxOrganiRef.current) return;
      VoxOrganiRef.current.silenceToHum();
    };

    const checkBeadHit = (pos) => {
      const bodies = Composite.allBodies(world);
      const pickRadius = 30 / zoomScaleRef.current;
      const bounds = {
        min: { x: pos.x - pickRadius, y: pos.y - pickRadius },
        max: { x: pos.x + pickRadius, y: pos.y + pickRadius }
      };
      const potentialBodies = Query.region(bodies, bounds);
      return potentialBodies.find(b => b.beadData);
    };

    const playChime = (force, type, index, isProgress = false) => {
      if (!ensureVoxOrgani()) return;
      const impact = isProgress ? 4.5 : force;
      const beadPhysicsType = isProgress ? 'medal' : type;
      VoxOrganiRef.current.chime(impact, beadPhysicsType, index);
    };

    const playMagnetismChime = () => {
      if (!ensureVoxOrgani()) return;
      // Cross-gesture resonance: map to deep tone via 'cross'.
      VoxOrganiRef.current.chime(5.2, 'cross', activeIndexRef.current);
    };

    // ─── Haptic feedback ───
    const triggerHaptic = (ms = 10) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    };

    // ─── Stroke / Gesture tracking ───
    const onCanvasMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      strokePointsRef.current.push({ ...pos, t: Date.now() });
      if (strokePointsRef.current.length > 300) {
        strokePointsRef.current = strokePointsRef.current.slice(-200);
      }
      if (isEmptyTouchingRef.current) {
        const dx = pos.x - lastMousePosRef.current.x;
        const dy = pos.y - lastMousePosRef.current.y;
        if (Math.hypot(dx, dy) < 100) { // Avoid jumps on multi-touch
          panOffsetRef.current.x += dx;
          panOffsetRef.current.y += dy;
        }
        if (callbacksRef.current.onEmptyPointerMove) callbacksRef.current.onEmptyPointerMove(e);
      }
      lastMousePosRef.current = pos;
    };

    const onCanvasTouchMove = (e) => {
      if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const pos = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        strokePointsRef.current.push({ ...pos, t: Date.now() });
        if (strokePointsRef.current.length > 300) {
          strokePointsRef.current = strokePointsRef.current.slice(-200);
        }
        if (isEmptyTouchingRef.current) {
          const dx = pos.x - lastMousePosRef.current.x;
          const dy = pos.y - lastMousePosRef.current.y;
          if (Math.hypot(dx, dy) < 100) {
            panOffsetRef.current.x += dx;
            panOffsetRef.current.y += dy;
          }
          if (callbacksRef.current.onEmptyPointerMove) callbacksRef.current.onEmptyPointerMove(e);
          }

        lastMousePosRef.current = pos;
      }
    };

    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('touchmove', onCanvasTouchMove, { passive: true });

    const tryActivateMagnetism = () => {
      const points = strokePointsRef.current;
      if (points.length < 10) return false;
      // Only consider the last stroke (since last mouse/touch down)
      // We don't have down events here, so use all points; the gesture is short enough
      if (detectCrossGesture(points)) {
        magnetismActiveRef.current = true;
        magnetismEndTimeRef.current = Date.now() + 3000;
        needsRescueRef.current = false;
        rescueFlashRef.current = 1;
        setTimeout(() => { rescueFlashRef.current = 0; }, 800);
        playMagnetismChime();
        triggerHaptic(25);
        strokePointsRef.current = [];
        return true;
      }
      return false;
    };

    // ─── Click / Swipe handling ───
    let mouseDownPos = { x: 0, y: 0, time: 0 };

    const onMouseDown = (event) => {
      if (soundEnabled) resumeAudioIfSuspendedInline();
      mouseDownPos = { x: event.mouse.position.x, y: event.mouse.position.y, time: Date.now() };
      swipeStartRef.current = { x: event.mouse.position.x, y: event.mouse.position.y };
      lastMousePosRef.current = { x: event.mouse.position.x, y: event.mouse.position.y };
      strokePointsRef.current = [];
      
      const hit = checkBeadHit(event.mouse.position);
      isEmptyTouchingRef.current = !hit;
      
      // Only trigger "empty hold/charge" when we actually started on empty space.
      if (isEmptyTouchingRef.current && callbacksRef.current.onEmptyPointerDown) {
        callbacksRef.current.onEmptyPointerDown(event.sourceEvent);
      }

      if (soundEnabled) {
        ensureVoxOrgani();
        updateAudioWarmth(hit ? 0.3 : 0.1);
      }
    };

    const onMouseUp = (event) => {
      const mouseUpPos = { x: event.mouse.position.x, y: event.mouse.position.y };
      const dist = Math.hypot(mouseUpPos.x - mouseDownPos.x, mouseUpPos.y - mouseDownPos.y);
      const duration = Date.now() - mouseDownPos.time;

      stopSynth();

      const wasEmpty = isEmptyTouchingRef.current;
      if (wasEmpty && callbacksRef.current.onEmptyPointerUp) {
        callbacksRef.current.onEmptyPointerUp(event.sourceEvent);
      }
      isEmptyTouchingRef.current = false;

      // Swipe detection
      if (swipeStartRef.current && dist > 40 && duration < 600) {
        const dx = mouseUpPos.x - swipeStartRef.current.x;
        if (Math.abs(dx) > Math.abs(mouseUpPos.y - swipeStartRef.current.y)) {
          if (dx < 0) {
            if (callbacksRef.current.onSwipeAdvance) callbacksRef.current.onSwipeAdvance();
            else if (callbacksRef.current.onAdvance) callbacksRef.current.onAdvance();
          } else if (dx > 0) {
            if (callbacksRef.current.onSwipeRetreat) callbacksRef.current.onSwipeRetreat();
            else if (callbacksRef.current.onRetreat) callbacksRef.current.onRetreat();
          }
          swipeStartRef.current = null;
          strokePointsRef.current = [];
          return;
        }
      }

      // Cross gesture check (free mode) — ONLY if we started on empty space
      if (!guidedRef.current && wasEmpty && dist > 25 && duration > 150) {
        if (tryActivateMagnetism()) return;
      }

      if (dist < 30) {
        if (guidedRef.current) {
          if (callbacksRef.current.onAdvance) callbacksRef.current.onAdvance();
          strokePointsRef.current = [];
          return;
        }

        const beadBody = checkBeadHit(mouseUpPos);

        if (beadBody) {
          const data = beadBody.beadData;
          playChime(1, data.physicsType, data.index, true);
          callbacksRef.current.onNodeClick(data.index);
        }
      }
      strokePointsRef.current = [];
    };

    Events.on(mouseConstraint, 'mousedown', onMouseDown);
    Events.on(mouseConstraint, 'mouseup', onMouseUp);

    // Guided mode: canvas listeners for click/swipe + cross gesture
    const onGuidedMouseDown = (e) => {
      if (soundEnabled) resumeAudioIfSuspendedInline();
      const rect = canvas.getBoundingClientRect();
      const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      mouseDownPos = { x: pos.x, y: pos.y, time: Date.now() };
      swipeStartRef.current = { x: mouseDownPos.x, y: mouseDownPos.y };
      lastMousePosRef.current = { x: pos.x, y: pos.y };
      strokePointsRef.current = [];

      const hit = checkBeadHit(pos);
      isEmptyTouchingRef.current = !hit;
      if (isEmptyTouchingRef.current && callbacksRef.current.onEmptyPointerDown) {
        callbacksRef.current.onEmptyPointerDown(e);
      }

      if (soundEnabled) {
        ensureVoxOrgani();
        updateAudioWarmth(hit ? 0.3 : 0.1);
      }
    };

    const onGuidedMouseUp = (e) => {
      const rect = canvas.getBoundingClientRect();
      const up = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const dist = Math.hypot(up.x - mouseDownPos.x, up.y - mouseDownPos.y);
      const duration = Date.now() - mouseDownPos.time;

      stopSynth();

      const wasEmpty = isEmptyTouchingRef.current;
      if (wasEmpty && callbacksRef.current.onEmptyPointerUp) {
        callbacksRef.current.onEmptyPointerUp(e);
      }
      isEmptyTouchingRef.current = false;

      if (swipeStartRef.current && dist > 40 && duration < 600) {
        const dx = up.x - swipeStartRef.current.x;
        if (Math.abs(dx) > Math.abs(up.y - swipeStartRef.current.y)) {
          if (dx < 0) {
            if (callbacksRef.current.onSwipeAdvance) callbacksRef.current.onSwipeAdvance();
            else if (callbacksRef.current.onAdvance) callbacksRef.current.onAdvance();
          } else if (dx > 0) {
            if (callbacksRef.current.onSwipeRetreat) callbacksRef.current.onSwipeRetreat();
            else if (callbacksRef.current.onRetreat) callbacksRef.current.onRetreat();
          }
          swipeStartRef.current = null;
          strokePointsRef.current = [];
          return;
        }
      }

      // Cross gesture check in guided mode too — ONLY if we started on empty space
      if (wasEmpty && dist > 25 && duration > 150) {
        if (tryActivateMagnetism()) {
          strokePointsRef.current = [];
          return;
        }
      }

      // Only advance if it was a quick tap AND NOT a charge interaction
      if (dist < 30 && callbacksRef.current.onAdvance && duration < 300) {
        callbacksRef.current.onAdvance();
      }
      strokePointsRef.current = [];
    };

    const onGuidedTouchStart = (e) => {
      if (e.touches.length === 1) {
        if (soundEnabled) resumeAudioIfSuspendedInline();
        const rect = canvas.getBoundingClientRect();
        const pos = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        mouseDownPos = { x: pos.x, y: pos.y, time: Date.now() };
        swipeStartRef.current = { x: mouseDownPos.x, y: mouseDownPos.y };
        lastMousePosRef.current = { x: pos.x, y: pos.y };
        strokePointsRef.current = [];

        const hit = checkBeadHit(pos);
        isEmptyTouchingRef.current = !hit;
        if (isEmptyTouchingRef.current && callbacksRef.current.onEmptyPointerDown) {
          callbacksRef.current.onEmptyPointerDown(e);
        }

        if (soundEnabled) {
          ensureVoxOrgani();
          updateAudioWarmth(hit ? 0.3 : 0.1);
        }
      }
    };

    const onGuidedTouchEnd = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const up = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      const dist = Math.hypot(up.x - mouseDownPos.x, up.y - mouseDownPos.y);
      const duration = Date.now() - mouseDownPos.time;

      stopSynth();

      const wasEmpty = isEmptyTouchingRef.current;
      if (wasEmpty && callbacksRef.current.onEmptyPointerUp) {
        callbacksRef.current.onEmptyPointerUp(e);
      }
      isEmptyTouchingRef.current = false;

      if (swipeStartRef.current && dist > 40 && duration < 600) {
        const dx = up.x - swipeStartRef.current.x;
        if (Math.abs(dx) > Math.abs(up.y - swipeStartRef.current.y)) {
          if (dx < 0) {
            if (callbacksRef.current.onSwipeAdvance) callbacksRef.current.onSwipeAdvance();
            else if (callbacksRef.current.onAdvance) callbacksRef.current.onAdvance();
          } else if (dx > 0) {
            if (callbacksRef.current.onSwipeRetreat) callbacksRef.current.onSwipeRetreat();
            else if (callbacksRef.current.onRetreat) callbacksRef.current.onRetreat();
          }
          swipeStartRef.current = null;
          strokePointsRef.current = [];
          return;
        }
      }

      // Cross gesture check — ONLY if we started on empty space
      if (wasEmpty && dist > 25 && duration > 150) {
        if (tryActivateMagnetism()) {
          strokePointsRef.current = [];
          return;
        }
      }

      if (dist < 30 && callbacksRef.current.onAdvance && duration < 300) {
        callbacksRef.current.onAdvance();
      }
      strokePointsRef.current = [];
    };

    canvas.addEventListener('mousedown', onGuidedMouseDown);
    canvas.addEventListener('mouseup', onGuidedMouseUp);
    canvas.addEventListener('mouseleave', onGuidedMouseUp);
    canvas.addEventListener('touchstart', onGuidedTouchStart, { passive: true });
    canvas.addEventListener('touchend', onGuidedTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', onGuidedTouchEnd, { passive: true });


    // Touch zoom (only in free mode)
    let initialTouchDist = 0;
    let initialTouchScale = 1;

    const handleTouchStart = (e) => {
      if (soundEnabled) resumeAudioIfSuspendedInline();
      if (!guidedRef.current && e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialTouchDist = d;
        initialTouchScale = zoomScaleRef.current;
      }
    };

    const handleTouchMove = (e) => {
      if (!guidedRef.current && e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.max(0.5, Math.min(3, initialTouchScale * (d / initialTouchDist)));
        zoomScaleRef.current = newScale;
        const invScale = 1 / newScale;
        mouse.pixelRatio = invScale;
        Matter.Mouse.setScale(mouse, { x: invScale, y: invScale });
      }
    };

    const handleWheel = (e) => {
      if (!guidedRef.current) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.5, Math.min(3, zoomScaleRef.current * delta));
        zoomScaleRef.current = newScale;
        const invScale = 1 / newScale;
        Matter.Mouse.setScale(mouse, { x: invScale, y: invScale });
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const onBeforeUpdate = () => {
      const allWorldBodies = Composite.allBodies(engine.world);

      // Check magnetism timer
      if (magnetismActiveRef.current && Date.now() > magnetismEndTimeRef.current) {
        magnetismActiveRef.current = false;
      }

      // Only apply forces during cross-gesture magnetism.
      // Always-on weak tether (velvet reform) + stronger temporary boost during magnetism.
      const K_REST = 0.0007;
      const K_MAG = 0.025;
      const damping = 0.65;
      const k = magnetismActiveRef.current ? K_MAG : K_REST;

      allWorldBodies.forEach((body) => {
        if (!body.beadData || body.isStatic) return;
        const home = body.home;
        if (!home) return;

        const dx = home.x - body.position.x;
        const dy = home.y - body.position.y;
        Body.applyForce(body, body.position, { x: dx * k * body.mass, y: dy * k * body.mass });

        if (magnetismActiveRef.current) {
          Body.setVelocity(body, { x: body.velocity.x * damping, y: body.velocity.y * damping });
          Body.setAngularVelocity(body, body.angularVelocity * damping);
        }
      });

      // Absolute distance correction pass (anti-stretch for long sessions).
      // Deterministic ordering: use the same edge sequence as constraint creation.
      const CORR_K = 0.02;
      const CORR_ERR_THRESH = 3.5;
      // Clamp position deltas so correction doesn't fight overlap/collisions.
      const MAX_POS_SHIFT = 2.0; // pixels per frame per body
      for (let i = 0; i < correctionEdges.length; i++) {
        const e = correctionEdges[i];
        const a = e.bodyA;
        const b = e.bodyB;
        if (!a || !b) continue;
        if (a.isStatic && b.isStatic) continue;

        const ax = a.position.x + e.pointA.x;
        const ay = a.position.y + e.pointA.y;
        const bx = b.position.x + e.pointB.x;
        const by = b.position.y + e.pointB.y;

        const dx = bx - ax;
        const dy = by - ay;
        const dist = Math.hypot(dx, dy);
        if (dist < 1e-6) continue;

        const err = dist - e.targetLength;
        if (Math.abs(err) < CORR_ERR_THRESH) continue;

        const ux = dx / dist;
        const uy = dy / dist;
        const invA = a.isStatic ? 0 : 1 / (a.mass || 1);
        const invB = b.isStatic ? 0 : 1 / (b.mass || 1);
        const sumInv = invA + invB;
        if (sumInv <= 0) continue;

        const da = (invA / sumInv) * err * CORR_K;
        const db = (invB / sumInv) * err * CORR_K;

        const daClamped = Math.max(-MAX_POS_SHIFT, Math.min(MAX_POS_SHIFT, da));
        const dbClamped = Math.max(-MAX_POS_SHIFT, Math.min(MAX_POS_SHIFT, db));

        a.position.x += ux * daClamped;
        a.position.y += uy * daClamped;
        b.position.x -= ux * dbClamped;
        b.position.y -= uy * dbClamped;

        // Immediately drain kinetic energy after explicit distance correction.
        if (!a.isStatic) {
          a.velocity.x *= 0.5;
          a.velocity.y *= 0.5;
        }
        if (!b.isStatic) {
          b.velocity.x *= 0.5;
          b.velocity.y *= 0.5;
        }
      }

      // Containment clamp to prevent offscreen drift on low-end devices.
      const margin = 20;
      const maxSpeed = 25;
      allWorldBodies.forEach((body) => {
        if (!body.beadData || body.isStatic) return;
        const r = body.circleRadius || 15;

        const loX = margin + r;
        const hiX = width - margin - r;
        const loY = margin + r;
        const hiY = height - margin - r;

        if (body.position.x < loX) {
          body.position.x = loX;
          if (body.velocity.x < 0) body.velocity.x = 0;
        } else if (body.position.x > hiX) {
          body.position.x = hiX;
          if (body.velocity.x > 0) body.velocity.x = 0;
        }

        if (body.position.y < loY) {
          body.position.y = loY;
          if (body.velocity.y < 0) body.velocity.y = 0;
        } else if (body.position.y > hiY) {
          body.position.y = hiY;
          if (body.velocity.y > 0) body.velocity.y = 0;
        }

        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        if (speed > maxSpeed) {
          const s = maxSpeed / speed;
          body.velocity.x *= s;
          body.velocity.y *= s;
        }
      });
    };

    const onCollisionStart = (event) => {
      if (guidedRef.current) return;
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        if (bodyA.beadData && bodyB.beadData) {
          const force = pair.collision.normal.x * (bodyA.velocity.x - bodyB.velocity.x) +
            pair.collision.normal.y * (bodyA.velocity.y - bodyB.velocity.y);
          const absForce = Math.abs(force);
          if (absForce > 0.8) {
            const dataA = bodyA.beadData;
            const indexA = beadsData.findIndex(b => b.id === dataA.id);
            playChime(absForce, dataA.physicsType, indexA);
            triggerHaptic(Math.min(Math.round(absForce * 3), 15));
          }
        }
      });
    };

    Events.on(engine, 'beforeUpdate', onBeforeUpdate);
    Events.on(engine, 'collisionStart', onCollisionStart);

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomScaleRef.current, zoomScaleRef.current);
      ctx.translate(-width / 2, -height / 2);

      const baseAlpha = 0.8;

      // Audio->visual bridge (Mercury LFO + LP filter thresholds).
      const voxDyn = VoxOrganiRef.current?.getVoxDynamics?.() ?? null;
      const mercuryHz = voxDyn?.mercuryHz ?? 0.1;
      const cutoffHz = voxDyn?.cutoffHz ?? 450;
      const lpQ = voxDyn?.lpQ ?? 1.2;
      const t = Date.now() / 1000;
      const lfoPhase01 = (Math.sin(t * mercuryHz * Math.PI * 2) + 1) * 0.5; // 0..1
      const shimmerNorm = Math.max(0, Math.min(1, (cutoffHz - 450) / 900));
      const jitterAmp = 0.35 + lfoPhase01 * 0.9 + Math.max(0, lpQ - 1.2) * 0.45;
      const dustAlphaBoost = 0.9 + lfoPhase01 * 0.9 + shimmerNorm * 0.45;
      if (typeof window !== 'undefined') window.__voxDustAlphaBoost = dustAlphaBoost;

      for (const c of allConstraints) {
        if (!c.bodyA || !c.bodyB) continue; // Safety check
        const dataA = c.bodyA.beadData;
        const dataB = c.bodyB.beadData;
        const isPrayedA = dataA && dataA.index < activeIndexRef.current;
        const isPrayedB = dataB && dataB.index < activeIndexRef.current;

        ctx.save();
        ctx.beginPath();
        const posA = { x: c.bodyA.position.x + c.pointA.x, y: c.bodyA.position.y + c.pointA.y };
        const posB = { x: c.bodyB.position.x + c.pointB.x, y: c.bodyB.position.y + c.pointB.y };
        // Gentle ink-line wiggle from Mercury LFO (subtle, non-jarring).
        const midX = (posA.x + posB.x) * 0.5;
        const midY = (posA.y + posB.y) * 0.5;
        const phase = (midX * 0.02 + midY * 0.02) + t * mercuryHz * 3.0;
        const jx = Math.sin(phase) * jitterAmp * 0.65;
        const jy = Math.cos(phase) * jitterAmp * 0.65;
        ctx.moveTo(posA.x + jx, posA.y + jy);
        ctx.lineTo(posB.x - jx, posB.y - jy);

        if (isPrayedA && isPrayedB) {
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 5;
          ctx.globalAlpha = baseAlpha + 0.2;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.globalAlpha = baseAlpha;
        }
        ctx.stroke();
        ctx.restore();
      }

      const mapping = getPhysicalMapping(misterioActual);
      const activePhysicalIndex = mapping[activeIndexRef.current] ?? 0;

      for (const body of allBodies) {
        const data = body.beadData;
        if (!data) continue;

        const beadPhysicalIndex = beadsData.findIndex(b => b.id === data.id);
        const isPrayed = beadPhysicalIndex < activePhysicalIndex;
        const isActive = beadPhysicalIndex === activePhysicalIndex;
        const isBeingDragged = mouseConstraint.constraint.body === body;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        ctx.globalAlpha = isPrayed ? baseAlpha + 0.2 : baseAlpha;

        // ── Interaction Glow & Halo ──
        if (isActive || isBeingDragged) {
          ctx.save();
          ctx.beginPath();
          const pulse = Math.sin(Date.now() / 200) * 3 * (0.75 + shimmerNorm * 0.6);
          const haloR = (body.circleRadius || 15) + (isBeingDragged ? 12 : 8) + pulse;
          ctx.arc(0, 0, haloR, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, haloR);
          grad.addColorStop(0, isBeingDragged ? 'rgba(212, 175, 55, 0.4)' : 'rgba(212, 175, 55, 0.25)');
          grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
          if (isActive) {
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.restore();
        }

        if (data.physicsType === 'cross') {
          ctx.fillStyle = isPrayed ? '#d4af37' : '#222';
          if (isPrayed || isActive) {
            ctx.shadowColor = '#d4af37';
            const baseBlur = isActive ? 15 + Math.sin(Date.now() / 200) * 5 : 10;
            ctx.shadowBlur = baseBlur + (isActive ? pulseRef.current * 30 : 0);
            if (isActive) ctx.fillStyle = '#F5E6A0';
          }
          const vWidth = 10; const hWidth = 32; const hHeight = 12; const vHeight = 48; const crossBarY = -10;
          ctx.beginPath();
          ctx.moveTo(-vWidth / 2, -vHeight / 2); ctx.lineTo(vWidth / 2, -vHeight / 2);
          ctx.lineTo(vWidth / 2, crossBarY - hHeight / 2); ctx.lineTo(hWidth / 2, crossBarY - hHeight / 2);
          ctx.lineTo(hWidth / 2, crossBarY + hHeight / 2); ctx.lineTo(vWidth / 2, crossBarY + hHeight / 2);
          ctx.lineTo(vWidth / 2, vHeight / 2); ctx.lineTo(-vWidth / 2, vHeight / 2);
          ctx.lineTo(-vWidth / 2, crossBarY + hHeight / 2); ctx.lineTo(-hWidth / 2, crossBarY + hHeight / 2);
          ctx.lineTo(-hWidth / 2, crossBarY - hHeight / 2); ctx.lineTo(-vWidth / 2, crossBarY - hHeight / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();
        } else if (data.role === 'medal') {
          // The Sacred Medal (Centerpiece)
          const r = body.circleRadius || 20;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = '#111';
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 2;
          if (isActive) {
             ctx.shadowColor = '#d4af37';
             ctx.shadowBlur = 15 + Math.sin(Date.now() / 200) * 5;
          }
          ctx.fill();
          ctx.stroke();

          // DRAW SACRED SYMBOL ON MEDAL
          let symbolKey = SYMBOL_MAP[data.role] || 'praying_hands';
          const activeBead = beadsData[activePhysicalIndex];
          
          if (activeBead?.role === 'decena') {
             const mysteryNum = Math.floor(activeBead.index / 10) + 1;
             const mPrefix = misterioActual.endsWith('os') ? misterioActual.slice(0, -2) : misterioActual; // gozoso, doloroso, etc
             symbolKey = `${mPrefix}_${mysteryNum}`;
          }

          const paths = SACRED_SYMBOLS[symbolKey];
          if (paths) {
            ctx.save();
            ctx.scale(0.22, 0.22); // Shrink to fit medal
            ctx.translate(-50, -70); // Center symbol (100x140 viewbox)
            ctx.strokeStyle = (isActive || isPrayed) ? '#D4AF37' : 'rgba(212, 175, 55, 0.5)';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            paths.forEach(p => {
              ctx.stroke(new Path2D(p));
            });
            ctx.restore();
          }
        } else {
          const r = body.circleRadius;
          const grad = ctx.createRadialGradient(-r / 3, -r / 3, r / 10, 0, 0, r);
          if (isActive) {
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, '#F5E6A0'); grad.addColorStop(1, '#d4af37');
          } else if (data.physicsType === 'large') {
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)'); grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(200,200,200,0.8)');
          } else {
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)'); grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(220,220,220,0.8)');
          }
          if (isPrayed || isActive) {
            ctx.shadowColor = '#d4af37';
            ctx.shadowBlur = (isActive ? 20 + Math.sin(Date.now() / 150) * 8 : 10) + (isActive ? pulseRef.current * 40 : 0);
          }
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = isActive ? '#fff' : (isPrayed ? '#b8860b' : 'rgba(0,0,0,0.1)');
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Rescue hint: faint cross to draw ──
      if (needsRescueRef.current || rescueFlashRef.current > 0) {
        const alpha = needsRescueRef.current
          ? 0.25 + Math.sin(Date.now() / 400) * 0.15
          : rescueFlashRef.current * 0.4;
        const crossH = Math.min(width, height) * 0.18;
        const crossW = crossH * 0.65;
        const barY = -crossH * 0.15;

        ctx.save();
        ctx.translate(cx, cy + loopRadius);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 20;

        // Vertical
        ctx.beginPath();
        ctx.moveTo(0, -crossH / 2);
        ctx.lineTo(0, crossH / 2);
        ctx.stroke();

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(-crossW / 2, barY);
        ctx.lineTo(crossW / 2, barY);
        ctx.stroke();

        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✝  Gesto Sagrado', 0, crossH / 2 + 18);

        ctx.restore();
      }

      // ── Magnetism active flash ──
      if (magnetismActiveRef.current) {
        ctx.save();
        ctx.globalAlpha = (0.03 + Math.sin(Date.now() / 100) * 0.02) * dustAlphaBoost;
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      Events.off(engine);
      Events.off(mouseConstraint);
      World.clear(world, false);
      Engine.clear(engine);
      canvas.removeEventListener('mousemove', onCanvasMouseMove);
      canvas.removeEventListener('touchmove', onCanvasTouchMove);
      canvas.removeEventListener('mousedown', onGuidedMouseDown);
      canvas.removeEventListener('mouseup', onGuidedMouseUp);
      canvas.removeEventListener('touchstart', onGuidedTouchStart);
      canvas.removeEventListener('touchend', onGuidedTouchEnd);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [misterioActual, soundEnabled, isLeftHanded, guided]); // MINIMAL DEPENDENCIES


  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />;
};

export default VirtualRosaryPhysics;
