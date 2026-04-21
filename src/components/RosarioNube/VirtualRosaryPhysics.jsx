import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { getRosaryBeads } from '../../data/physicsRosaryData';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import audioManager from '../../utils/audioManager';

const { Engine, World, Bodies, Constraint, Mouse, MouseConstraint, Composite, Events, Query } = Matter;

const VirtualRosaryPhysics = ({ onNodeClick, onLinkClick, activePrayerIndex = 0, misterioActual = 'gozosos', soundEnabled = true }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(Engine.create({ gravity: { x: 0, y: 0 } }));
  const [selectedBeadId, setSelectedBeadId] = useState(null);
  const [prayedIds, setPrayedIds] = useState(new Set());
  const prayedIdsRef = useRef(prayedIds);
  const [pulse, setPulse] = useState(0);
  const activeIndexRef = useRef(activePrayerIndex);
  const { logAveMaria } = useAveMariaStats();

  // Zoom and Pan State
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const zoomScaleRef = useRef(1);
  const panOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (activePrayerIndex !== activeIndexRef.current) {
      activeIndexRef.current = activePrayerIndex;
      setPulse(1);
      setTimeout(() => setPulse(0), 600);
    }
  }, [activePrayerIndex]);

  useEffect(() => {
    prayedIdsRef.current = prayedIds;
  }, [prayedIds]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const engine = engineRef.current;
    const beadsData = getRosaryBeads(misterioActual);

    const allBodies = [];
    const allConstraints = [];

    const cx = width / 2;
    const cy = height * 0.45; // Move center up slightly to make room for tail
    const loopRadius = Math.min(width * 0.38, 200);

    const beadOptions = {
      restitution: 0.4,
      friction: 0.02,
      frictionAir: 0.08,
      density: 0.008,
      slop: 0.05,
    };

    // --- PHYSICS SEGMENTATION ---
    // Tail: first 8 beads (indices 0-7)
    const pendantItems = beadsData.filter(b => b.index < 8);
    // Center: index 8
    const centerItem = beadsData.find(b => b.index === 8);
    // Loop: everything else
    const loopItems = beadsData.filter(b => b.index > 8);

    // 1. Create Centerpiece
    const centerBody = Bodies.circle(cx, cy + loopRadius, 20, beadOptions);
    centerBody.beadData = centerItem;
    centerBody.circleRadius = 20;
    allBodies.push(centerBody);

    // 2. Create Loop
    const loopBodies = [];
    loopItems.forEach((data, i) => {
      const startAngle = Math.PI / 2;
      const totalAngle = Math.PI * 2;
      const angle = startAngle + ((i + 1) / (loopItems.length + 1)) * totalAngle;
      
      const x = cx + Math.cos(angle) * loopRadius;
      const y = cy + Math.sin(angle) * loopRadius;

      let r = 8;
      if (data.physicsType === 'large') r = 13;
      if (data.physicsType === 'chain') r = 4;

      const body = Bodies.circle(x, y, r, beadOptions);
      body.beadData = data;
      body.circleRadius = r;
      loopBodies.push(body);
      allBodies.push(body);
    });

    // 3. Create Pendant (Tail) - reverse so cross is at the bottom
    const pendantBodies = [];
    let py = cy + loopRadius + 30;
    const reversedPendant = [...pendantItems].reverse();
    
    reversedPendant.forEach((data) => {
      let body;
      if (data.physicsType === 'cross') {
        body = Bodies.rectangle(cx, py + 20, 24, 48, beadOptions);
        body.circleRadius = 15; // virtual radius for constraint calc
        py += 60;
      } else {
        let r = 8;
        if (data.physicsType === 'large') r = 12;
        if (data.physicsType === 'chain') r = 4;
        body = Bodies.circle(cx, py, r, beadOptions);
        body.circleRadius = r;
        py += r * 2 + 10;
      }
      body.beadData = data;
      pendantBodies.push(body);
      allBodies.push(body);
    });

    // --- CONECTIONS ---
    // Connect Loop
    loopBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : loopBodies[i - 1];
      allConstraints.push(Constraint.create({
        bodyA, bodyB,
        stiffness: 0.4,
        damping: 0.1,
        length: (bodyA.circleRadius) + (bodyB.circleRadius) + 8,
        render: { visible: false }
      }));
    });
    // Close Loop
    allConstraints.push(Constraint.create({
      bodyA: loopBodies[loopBodies.length - 1],
      bodyB: centerBody,
      stiffness: 0.4,
      damping: 0.1,
      length: (loopBodies[loopBodies.length - 1].circleRadius) + centerBody.circleRadius + 8,
      render: { visible: false }
    }));

    // Connect Pendant to Centerpiece
    pendantBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : pendantBodies[i - 1];
      const isCrossB = bodyB.beadData.physicsType === 'cross';
      const isCrossA = bodyA.beadData?.physicsType === 'cross';

      const offsetA = isCrossA ? { x: 0, y: 15 } : { x: 0, y: 0 };
      const offsetB = isCrossB ? { x: 0, y: -15 } : { x: 0, y: 0 };

      allConstraints.push(Constraint.create({
        bodyA, pointA: offsetA,
        bodyB, pointB: offsetB,
        stiffness: 0.4,
        damping: 0.1,
        length: (isCrossA ? 10 : bodyA.circleRadius) + (isCrossB ? 10 : bodyB.circleRadius) + 6,
        render: { visible: false }
      }));
    });

    const world = engine.world;
    World.add(world, [...allBodies, ...allConstraints]);

    // Mouse control
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(world, mouseConstraint);

    // --- Audio System ---
    const audioCtx = audioManager.getContext();
    let lastChimeTime = 0;
    const CHIME_COOLDOWN = 40;
    
    const playChime = (force, type, index, isProgress = false) => {
      if (!audioCtx) return;
      const now = audioCtx.currentTime * 1000;
      if (!isProgress && now - lastChimeTime < CHIME_COOLDOWN) return;
      if (!isProgress) lastChimeTime = now;

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
      
      if (isProgress) {
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      } else {
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1 + (force * 0.1));
      }
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (isProgress ? 1 : 0.4));
    };

    // Click detection
    let mouseDownPos = { x: 0, y: 0 };
    Events.on(mouseConstraint, 'mousedown', (event) => {
      mouseDownPos = { x: event.mouse.position.x, y: event.mouse.position.y };
    });

    Events.on(mouseConstraint, 'mouseup', (event) => {
      const mouseUpPos = { x: event.mouse.position.x, y: event.mouse.position.y };
      const dist = Math.hypot(mouseUpPos.x - mouseDownPos.x, mouseUpPos.y - mouseDownPos.y);

      if (dist < 15) { // Slightly more lenient 
        const bodies = Composite.allBodies(world);
        
        // Thumb-friendly: expand detection radius
        const pickRadius = 30 / zoomScaleRef.current; 
        const bounds = {
          min: { x: mouseUpPos.x - pickRadius, y: mouseUpPos.y - pickRadius },
          max: { x: mouseUpPos.x + pickRadius, y: mouseUpPos.y + pickRadius }
        };
        const potentialBodies = Query.region(bodies, bounds);
        const beadBody = potentialBodies.find(b => b.beadData);

        if (beadBody) {
          const data = beadBody.beadData;
          if (!prayedIdsRef.current.has(data.id)) {
            setPrayedIds(prev => new Set(prev).add(data.id));
            playChime(1, data.physicsType, data.index, true);
          }
          
          setSelectedBeadId(data.id);
          onNodeClick(data.index);
        }
      }
    });

    // --- ZOOM & PAN (THUMB FRIENDLY) ---
    let initialTouchDist = 0;
    let initialTouchScale = 1;
    let initialMidpoint = { x: 0, y: 0 };
    let initialOffset = { x: 0, y: 0 };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialTouchDist = d;
        initialTouchScale = zoomScaleRef.current;
        initialMidpoint = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        };
        initialOffset = { ...panOffsetRef.current };
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.max(0.5, Math.min(3, initialTouchScale * (d / initialTouchDist)));
        
        zoomScaleRef.current = newScale;
        setZoomScale(newScale);

        // Adjust mouse scale so interaction works while zoomed
        const invScale = 1 / newScale;
        mouse.pixelRatio = invScale; // matter-js specific way to handle internal scale
        Matter.Mouse.setScale(mouse, { x: invScale, y: invScale });
      }
    };

    // Use regular wheel for desktop zoom
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.5, Math.min(3, zoomScaleRef.current * delta));
      zoomScaleRef.current = newScale;
      setZoomScale(newScale);
      const invScale = 1 / newScale;
      Matter.Mouse.setScale(mouse, { x: invScale, y: invScale });
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // --- MAGNETISM (UX) ---
    // Make the active bead "magnetic" so it drifts towards the bottom center focus zone
    Events.on(engine, 'beforeUpdate', () => {
      const allBodies = Composite.allBodies(engine.world);
      const activeBead = allBodies.find(b => b.beadData && b.beadData.index === activeIndexRef.current);
      
      if (activeBead) {
        const targetX = width / 2;
        const targetY = height * 0.7; // Above the subtitle
        
        const dx = targetX - activeBead.position.x;
        const dy = targetY - activeBead.position.y;
        
        // Very subtle force to avoid chaos
        const force = 0.0000008;
        Matter.Body.applyForce(activeBead, activeBead.position, {
          x: dx * force,
          y: dy * force
        });
      }
    });

    Events.on(engine, 'collisionStart', (event) => {
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
          }
        }
      });
    });

    // --- Rendering ---
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Apply Zoom Transform
      ctx.translate(width/2, height/2);
      ctx.scale(zoomScaleRef.current, zoomScaleRef.current);
      ctx.translate(-width/2, -height/2);

      const baseAlpha = 0.8; 
      
      // Draw chains
      for (const c of allConstraints) {
        const dataA = c.bodyA.beadData;
        const dataB = c.bodyB.beadData;
        const isPrayedA = dataA && prayedIdsRef.current.has(dataA.id);
        const isPrayedB = dataB && prayedIdsRef.current.has(dataB.id);
        
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

      // Draw bodies
      for (const body of allBodies) {
        const data = body.beadData;
        const isPrayed = prayedIdsRef.current.has(data.id);
        const beadIndex = beadsData.findIndex(b => b.id === data.id);
        const isActive = beadIndex === activeIndexRef.current;
        
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        
        ctx.globalAlpha = isPrayed ? baseAlpha + 0.2 : baseAlpha;

        if (data.physicsType === 'cross') {
          ctx.fillStyle = isPrayed ? '#d4af37' : '#222';
          if (isPrayed || isActive) {
            ctx.shadowColor = '#d4af37';
            const baseBlur = isActive ? 15 + Math.sin(Date.now() / 200) * 5 : 10;
            ctx.shadowBlur = baseBlur + (isActive ? pulse * 30 : 0);
            if (isActive) ctx.fillStyle = '#F5E6A0';
          }
          
          const vWidth = 10;
          const hWidth = 32;
          const hHeight = 12;
          const vHeight = 48;
          const crossBarY = -10;

          ctx.beginPath();
          ctx.moveTo(-vWidth/2, -vHeight/2);
          ctx.lineTo(vWidth/2, -vHeight/2);
          ctx.lineTo(vWidth/2, crossBarY - hHeight/2);
          ctx.lineTo(hWidth/2, crossBarY - hHeight/2);
          ctx.lineTo(hWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(vWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(vWidth/2, vHeight/2);
          ctx.lineTo(-vWidth/2, vHeight/2);
          ctx.lineTo(-vWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(-hWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(-hWidth/2, crossBarY - hHeight/2);
          ctx.lineTo(-vWidth/2, crossBarY - hHeight/2);
          ctx.closePath();
          
          ctx.fill();
          ctx.strokeStyle = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();
        } else {
          const r = body.circleRadius;
          const grad = ctx.createRadialGradient(-r/3, -r/3, r/10, 0, 0, r);
          
          if (isActive) {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, '#F5E6A0');
            grad.addColorStop(1, '#d4af37');
          } else if (data.physicsType === 'large') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(200,200,200,0.8)');
          } else if (data.physicsType === 'center') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(150,150,150,0.8)');
          } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(220,220,220,0.8)');
          }

          if (isPrayed || isActive) {
            ctx.shadowColor = '#d4af37';
            const baseBlur = isActive ? 20 + Math.sin(Date.now() / 150) * 8 : 10;
            ctx.shadowBlur = baseBlur + (isActive ? pulse * 40 : 0);
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

      ctx.restore(); // Restore Zoom Transform
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      World.clear(world, false);
      Engine.clear(engine);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [onNodeClick, onLinkClick]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />;
};

export default VirtualRosaryPhysics;
