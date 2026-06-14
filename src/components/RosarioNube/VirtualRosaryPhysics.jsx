import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { getRosaryBeads, getPhysicalMapping } from '../../data/physicsRosaryData';
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
    positionIterations: 20
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
  const synthRef = useRef(null);

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
    }
  }, [activePrayerIndex]);

  useEffect(() => {
    activeIndexRef.current = activePrayerIndex;
  }, [activePrayerIndex]);

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

    const rosaryGroup = Matter.Body.nextGroup(true);

    // Physics tuned for contemplative weight: dry impacts, deliberate movement
    const baseBeadOptions = {
      restitution: 0.05,
      friction: 0.3,
      frictionAir: guided ? 0.03 : 0.01,
      slop: 0.05,
      collisionFilter: { group: rosaryGroup }
    };

    const getBeadOptions = (data) => {
      const opts = { ...baseBeadOptions };
      // Padre Nuestro beads are heavier — require denser drag
      if (data.role === 'lone') {
        opts.density = 0.025;
        opts.friction = 0.4;
      }
      // Crucifix and medal have more heft
      if (data.physicsType === 'cross' || data.role === 'medal') {
        opts.density = 0.05;
      }
      return opts;
    };

    const pendantItems = beadsData.filter(b => b.topology === 'tail');
    const loopItems = beadsData.filter(b => b.topology === 'loop');

    const centerItem = beadsData.find(b => b.role === 'medal') || beadsData.find(b => b.physicsType === 'center') || pendantItems[pendantItems.length - 1];
    const beadRadius = 10;

    // 1. Centerpiece (Medal) — free floating, no anchor
    const centerBody = Bodies.circle(cx, cy + loopRadius, 20, getBeadOptions(centerItem));
    centerBody.beadData = centerItem;
    centerBody.circleRadius = 20;
    allBodies.push(centerBody);
    homePositionsRef.current.push({ x: cx, y: cy + loopRadius });

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
      loopBodies.push(body);
      allBodies.push(body);
      homePositionsRef.current.push({ x, y });
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
      homePositionsRef.current.push({ x: cx, y: py - (data.physicsType === 'cross' ? 40 : beadRadius + 5) });
    });

    // Connections — loose, rope-like constraints
    const getConstraintProps = (bodyA, bodyB) => {
      const rA = bodyA.beadData?.role;
      const rB = bodyB.beadData?.role;
      if (rA === 'lone' || rB === 'lone') {
        return { length: 35, stiffness: 0.35, damping: 0.4 };
      }
      if (rA === 'crucifix' || rB === 'crucifix' || rA === 'medal' || rB === 'medal') {
        return { length: 25, stiffness: 0.45, damping: 0.3 };
      }
      return { length: 20, stiffness: 0.4, damping: 0.3 };
    };

    loopBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : loopBodies[i - 1];
      const props = getConstraintProps(bodyA, bodyB);
      allConstraints.push(Constraint.create({ bodyA, bodyB, ...props, render: { visible: false } }));
    });

    if (loopBodies.length > 0) {
      const bodyA = loopBodies[loopBodies.length - 1];
      const bodyB = centerBody;
      const props = getConstraintProps(bodyA, bodyB);
      allConstraints.push(Constraint.create({ bodyA, bodyB, ...props, render: { visible: false } }));
    }

    pendantBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : pendantBodies[i - 1];
      const isCrossB = bodyB.beadData.physicsType === 'cross';
      const isCrossA = bodyA.beadData?.physicsType === 'cross';
      const offsetA = isCrossA ? { x: 0, y: 15 } : { x: 0, y: 0 };
      const offsetB = isCrossB ? { x: 0, y: -15 } : { x: 0, y: 0 };
      const props = getConstraintProps(bodyA, bodyB);
      allConstraints.push(Constraint.create({ bodyA, pointA: offsetA, bodyB, pointB: offsetB, ...props, render: { visible: false } }));
    });

    World.add(world, [...allBodies, ...allConstraints]);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: guided ? 0.6 : 0.9, render: { visible: false } }
    });

    // Mouse constraint available in both modes, but very soft in guided
    World.add(world, mouseConstraint);

    const getBaseFreq = () => {
      const mapping = getPhysicalMapping(misterioActual);
      const activeIdx = activeIndexRef.current;
      const beadIndex = mapping[activeIdx];
      const beadData = beadsData[beadIndex];
      const role = beadData?.role || 'A';
      return PRAYER_FREQ[role] || PRAYER_FREQ[role[0]] || 164.81;
    };

    const initSynth = () => {
      if (!audioCtxRef.current) {
        const ctx = audioManager.getContext();
        if (!ctx) return;
        audioCtxRef.current = ctx;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(ctx.destination);

        const base = getBaseFreq();

        // --- AMBIANCE LAYER: Deep Sub Ground ---
        const droneOsc = ctx.createOscillator();
        droneOsc.type = 'sine';
        droneOsc.frequency.setValueAtTime(base * 0.25, ctx.currentTime);
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.012;
        droneOsc.connect(droneGain);
        droneGain.connect(gainNode);
        droneOsc.start();

        // --- SACRED ORGAN LAYERS ---
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(base * 1.5, ctx.currentTime);

        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(base * 0.5, ctx.currentTime);
        
        const osc4 = ctx.createOscillator();
        osc4.type = 'sine';
        osc4.frequency.setValueAtTime(base * 4, ctx.currentTime);
        const celestialGain = ctx.createGain();
        celestialGain.gain.value = 0;

        const padGain = ctx.createGain();
        padGain.gain.value = 0.028;

        // Reverb Simulation
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.25;
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.55;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.45;
        const reverbFilter = ctx.createBiquadFilter();
        reverbFilter.type = 'lowpass';
        reverbFilter.frequency.value = 700;
        
        delay.connect(feedback);
        feedback.connect(reverbFilter);
        reverbFilter.connect(delay);
        delay.connect(reverbGain);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 550;
        filter.Q.value = 1.2;

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.12;
        lfoGain.gain.value = 0;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        osc.connect(filter);
        osc2.connect(filter);
        osc3.connect(padGain);
        osc4.connect(celestialGain);
        celestialGain.connect(filter);
        padGain.connect(filter);
        filter.connect(gainNode);
        filter.connect(delay);
        reverbGain.connect(gainNode);

        osc.start();
        osc2.start();
        osc3.start();
        osc4.start();

        synthRef.current = { osc, osc2, osc3, osc4, celestialGain, lfo, lfoGain, filter, gainNode, padGain, droneGain };
      }
    };

    const updateAudioWarmth = (warmth = 0.1) => {
      if (!synthRef.current || !soundEnabled) return;
      const { filter, gainNode, celestialGain, lfoGain, droneGain } = synthRef.current;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      
      const sessionProgress = (activeIndexRef.current + 1) / (beadsData.length || 1);
      const cosmic = { mercury: 0.5, jupiter: 0.5, saturn: 0.5, pluto: 0.5, uranus: 0.5, neptune: 0.5 }; // Fallback
      try {
        const { getCosmicPhases } = require('../../utils/cosmicModulator');
        const c = getCosmicPhases();
        if (c) Object.assign(cosmic, c);
      } catch(e){}

      const deepBase = cosmic.pluto * 12 + cosmic.saturn * 6;
      const targetFreq = 450 + warmth * 400 + sessionProgress * 500 + deepBase;
      filter.frequency.setTargetAtTime(targetFreq, t, 0.7);
      filter.Q.setTargetAtTime(1.2 + sessionProgress * 2.5 + cosmic.neptune * 1.8, t, 0.7); 
      celestialGain.gain.setTargetAtTime(sessionProgress * 0.02 + (cosmic.uranus * 0.008), t, 1.2); 
      droneGain.gain.setTargetAtTime(0.012 + (cosmic.pluto * 0.006), t, 1.5);
      lfoGain.gain.setTargetAtTime(sessionProgress * 55 + (cosmic.mercury * 25), t, 1.2);
      gainNode.gain.setTargetAtTime(0.038 + warmth * 0.016, t, 0.5);
    };

    const stopSynth = () => {
      if (synthRef.current) {
        // Keep a tiny "sacred background" hum
        synthRef.current.gainNode.gain.setTargetAtTime(0.002, audioCtxRef.current.currentTime, 0.8);
      }
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

    const audioCtx = audioManager.getContext();
    const playChime = (force, type, index, isProgress = false) => {
      if (!audioCtx) return;
      if (!soundEnabled || audioCtx.state === 'suspended') {
        if (soundEnabled) audioCtx.resume();
        else return;
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const baseFreq = isProgress ? 1200 : (type === 'chain' ? 800 : (type === 'large' ? 300 : 500));
      const chargeFactor = 1 + (index / beadsData.length) * 0.5;
      osc.frequency.setValueAtTime(baseFreq * chargeFactor, audioCtx.currentTime);
      osc.type = isProgress ? 'sine' : (type === 'chain' ? 'triangle' : 'sine');

      const volume = isProgress ? 0.12 : Math.min(force * 0.2, 0.1);
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1);
    };

    const playMagnetismChime = () => {
      if (!audioCtx) return;
      if (!soundEnabled || audioCtx.state === 'suspended') {
        if (soundEnabled) audioCtx.resume();
        else return;
      }
      // Deep, distant bell for the cross gesture
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 1.5);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.5);
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
        initSynth();
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
        initSynth();
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
          initSynth();
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
      // The rosary is otherwise completely free — no home forces, no anchor.
      if (magnetismActiveRef.current) {
        const k = 0.025;
        const damping = 0.65;
        allWorldBodies.forEach((body, i) => {
          if (!body.beadData || body.isStatic) return;
          const home = homePositionsRef.current[i];
          if (!home) return;
          const dx = home.x - body.position.x;
          const dy = home.y - body.position.y;
          Body.applyForce(body, body.position, { x: dx * k * body.mass, y: dy * k * body.mass });
          Body.setVelocity(body, {
            x: body.velocity.x * damping,
            y: body.velocity.y * damping
          });
          Body.setAngularVelocity(body, body.angularVelocity * damping);
        });
      }
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
        ctx.moveTo(posA.x, posA.y);
        ctx.lineTo(posB.x, posB.y);

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
          const pulse = Math.sin(Date.now() / 200) * 3;
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
        ctx.globalAlpha = 0.03 + Math.sin(Date.now() / 100) * 0.02;
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
