import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { getRosaryBeads } from '../../data/physicsRosaryData';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import audioManager from '../../utils/audioManager';

const { Engine, World, Bodies, Constraint, Mouse, MouseConstraint, Composite, Events, Query } = Matter;

const VirtualRosaryPhysics = ({ onNodeClick, onLinkClick, activePrayerIndex = 0, misterioActual = 'gozosos', soundEnabled = true, isLeftHanded = false }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(Engine.create({ 
    gravity: { x: 0, y: 0 },
    positionIterations: 20 
  }));
  const [selectedBeadId, setSelectedBeadId] = useState(null);
  const prayedIdsRef = useRef(new Set());
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
    // Sync internal ref when activePrayerIndex changes
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
    const beadsData = getRosaryBeads(misterioActual);

    const allBodies = [];
    const allConstraints = [];

    const cx = width / 2;
    const cy = height * 0.45; // Move center up slightly to make room for tail
    const loopRadius = Math.min(width * 0.38, 200);

    const rosaryGroup = Matter.Body.nextGroup(true);
    const beadOptions = {
      restitution: 0.4,
      friction: 0.02,
      frictionAir: 0.08, // Dampen chaotic swinging
      density: 0.008,
      slop: 0.05,
      collisionFilter: { group: rosaryGroup } // Ignore collisions within the chain
    };

    const pendantItems = beadsData.filter(b => b.topology === 'tail');
    const loopItems = beadsData.filter(b => b.topology === 'loop');
    
    const centerItem = beadsData.find(b => b.role === 'medal') || beadsData.find(b => b.physicsType === 'center') || pendantItems[pendantItems.length - 1];
    const beadRadius = 10;
    
    // 1. Create Centerpiece (Medal) - Higher density to act as a stable hinge
    const centerBody = Bodies.circle(cx, cy + loopRadius, 20, {
      ...beadOptions,
      density: 0.04 // 5x density of normal beads
    });
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

      const body = Bodies.circle(x, y, beadRadius, beadOptions);
      body.beadData = data;
      body.circleRadius = beadRadius;
      loopBodies.push(body);
      allBodies.push(body);
    });

    // 3. Create Pendant (Tail)
    const pendantBodies = [];
    let py = cy + loopRadius + 30;
    const filteredPendant = pendantItems.filter(b => b.id !== centerItem.id).reverse();
    
    filteredPendant.forEach((data) => {
      let body;
      if (data.physicsType === 'cross') {
        body = Bodies.rectangle(cx, py + 20, 24, 48, beadOptions);
        body.circleRadius = 15;
        py += 60;
      } else {
        body = Bodies.circle(cx, py, beadRadius, beadOptions);
        body.circleRadius = beadRadius;
        py += beadRadius * 2 + 10;
      }
      body.beadData = data;
      pendantBodies.push(body);
      allBodies.push(body);
    });

    // --- CONECTIONS ---
    const getConstraintProps = (bodyA, bodyB) => {
      const rA = bodyA.beadData?.role;
      const rB = bodyB.beadData?.role;
      
      // Stiffness 0.8 as requested to stabilize the non-colliding chain
      // Lengths updated to accommodate 20px bead diameter (radius 10)
      if (rA === 'lone' || rB === 'lone') {
        return { length: 35, stiffness: 0.8, damping: 0.2 }; // Long
      }
      if (rA === 'crucifix' || rB === 'crucifix' || rA === 'medal' || rB === 'medal') {
        return { length: 25, stiffness: 0.8, damping: 0.1 }; // Short
      }
      return { length: 20, stiffness: 0.8, damping: 0.1 }; // Tight
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

    const world = engine.world;
    World.add(world, [...allBodies, ...allConstraints]);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(world, mouseConstraint);

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

    let mouseDownPos = { x: 0, y: 0 };
    const onMouseDown = (event) => {
      mouseDownPos = { x: event.mouse.position.x, y: event.mouse.position.y };
    };

    const onMouseUp = (event) => {
      const mouseUpPos = { x: event.mouse.position.x, y: event.mouse.position.y };
      const dist = Math.hypot(mouseUpPos.x - mouseDownPos.x, mouseUpPos.y - mouseDownPos.y);

      if (dist < 15) {
        const bodies = Composite.allBodies(world);
        const pickRadius = 30 / zoomScaleRef.current; 
        const bounds = {
          min: { x: mouseUpPos.x - pickRadius, y: mouseUpPos.y - pickRadius },
          max: { x: mouseUpPos.x + pickRadius, y: mouseUpPos.y + pickRadius }
        };
        const potentialBodies = Query.region(bodies, bounds);
        const beadBody = potentialBodies.find(b => b.beadData);

        if (beadBody) {
          const data = beadBody.beadData;
          playChime(1, data.physicsType, data.index, true);
          setSelectedBeadId(data.id);
          onNodeClick(data.index);
        }
      }
    };

    Events.on(mouseConstraint, 'mousedown', onMouseDown);
    Events.on(mouseConstraint, 'mouseup', onMouseUp);

    let initialTouchDist = 0;
    let initialTouchScale = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        initialTouchDist = d;
        initialTouchScale = zoomScaleRef.current;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.max(0.5, Math.min(3, initialTouchScale * (d / initialTouchDist)));
        zoomScaleRef.current = newScale;
        setZoomScale(newScale);
        const invScale = 1 / newScale;
        mouse.pixelRatio = invScale; 
        Matter.Mouse.setScale(mouse, { x: invScale, y: invScale });
      }
    };

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

    const onBeforeUpdate = () => {
      const allBodies = Composite.allBodies(engine.world);
      const activeBead = allBodies.find(b => b.beadData && b.beadData.index === activeIndexRef.current);
      
      if (activeBead) {
        const targetX = isLeftHanded ? width * 0.3 : width * 0.7;
        const targetY = height * 0.7; 
        const dx = targetX - activeBead.position.x;
        const dy = targetY - activeBead.position.y;
        const force = 0.0000008;
        Matter.Body.applyForce(activeBead, activeBead.position, { x: dx * force, y: dy * force });
      }
    };

    const onCollisionStart = (event) => {
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
    };

    Events.on(engine, 'beforeUpdate', onBeforeUpdate);
    Events.on(engine, 'collisionStart', onCollisionStart);

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width/2, height/2);
      ctx.scale(zoomScaleRef.current, zoomScaleRef.current);
      ctx.translate(-width/2, -height/2);

      const baseAlpha = 0.8; 
      
      for (const c of allConstraints) {
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

      for (const body of allBodies) {
        const data = body.beadData;
        const beadIndex = beadsData.findIndex(b => b.id === data.id);
        const isPrayed = beadIndex < activeIndexRef.current;
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
          const vWidth = 10; const hWidth = 32; const hHeight = 12; const vHeight = 48; const crossBarY = -10;
          ctx.beginPath();
          ctx.moveTo(-vWidth/2, -vHeight/2); ctx.lineTo(vWidth/2, -vHeight/2);
          ctx.lineTo(vWidth/2, crossBarY - hHeight/2); ctx.lineTo(hWidth/2, crossBarY - hHeight/2);
          ctx.lineTo(hWidth/2, crossBarY + hHeight/2); ctx.lineTo(vWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(vWidth/2, vHeight/2); ctx.lineTo(-vWidth/2, vHeight/2);
          ctx.lineTo(-vWidth/2, crossBarY + hHeight/2); ctx.lineTo(-hWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(-hWidth/2, crossBarY - hHeight/2); ctx.lineTo(-vWidth/2, crossBarY - hHeight/2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = isActive ? '#fff' : 'rgba(255,255,255,0.5)';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();
        } else {
          const r = body.circleRadius;
          const grad = ctx.createRadialGradient(-r/3, -r/3, r/10, 0, 0, r);
          if (isActive) {
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, '#F5E6A0'); grad.addColorStop(1, '#d4af37');
          } else if (data.physicsType === 'large') {
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)'); grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(200,200,200,0.8)');
          } else {
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)'); grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(220,220,220,0.8)');
          }
          if (isPrayed || isActive) {
            ctx.shadowColor = '#d4af37';
            ctx.shadowBlur = (isActive ? 20 + Math.sin(Date.now() / 150) * 8 : 10) + (isActive ? pulse * 40 : 0);
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
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [onNodeClick, onLinkClick, misterioActual, soundEnabled, isLeftHanded]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />;
};

export default VirtualRosaryPhysics;
