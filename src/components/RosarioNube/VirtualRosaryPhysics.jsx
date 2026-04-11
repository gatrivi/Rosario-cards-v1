import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { getRosaryBeads } from '../../data/physicsRosaryData';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';

const { Engine, World, Bodies, Constraint, Mouse, MouseConstraint, Composite, Events, Query } = Matter;

const VirtualRosaryPhysics = ({ onNodeClick, onLinkClick }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(Engine.create({ gravity: { x: 0, y: 0 } }));
  const [selectedBeadId, setSelectedBeadId] = useState(null);
  const [prayedIds, setPrayedIds] = useState(new Set());
  const prayedIdsRef = useRef(prayedIds);
  const { logAveMaria } = useAveMariaStats();

  useEffect(() => {
    prayedIdsRef.current = prayedIds;
  }, [prayedIds]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const engine = engineRef.current;
    const beadsData = getRosaryBeads();

    const allBodies = [];
    const allConstraints = [];

    const cx = width / 2;
    const cy = height / 2;
    const loopRadius = Math.min(width * 0.35, 220);

    const beadOptions = {
      restitution: 0.4,
      friction: 0.02,
      frictionAir: 0.08,
      density: 0.008,
      slop: 0.05,
    };

    // --- Physics Setup ---
    
    // Centerpiece
    const centerData = beadsData.find(b => b.id === 'centerpiece');
    const centerBody = Bodies.circle(cx, cy + loopRadius, 18, beadOptions);
    centerBody.beadData = centerData;
    allBodies.push(centerBody);

    // Loop (Decades)
    const loopItems = beadsData.filter(b => (b.id.startsWith('d') && b.id !== 'd1_of') || b.id === 'loop_chain_start');
    const loopBodies = [];
    
    loopItems.forEach((data, i) => {
      const startAngle = Math.PI / 2;
      const totalAngle = Math.PI * 2;
      const angle = startAngle + ((i + 1) / (loopItems.length + 1)) * totalAngle;
      
      const x = cx + Math.cos(angle) * loopRadius;
      const y = cy + Math.sin(angle) * loopRadius;

      let r = 8;
      if (data.physicsType === 'large') r = 12;
      if (data.physicsType === 'chain') r = 4;

      const body = Bodies.circle(x, y, r, beadOptions);
      body.beadData = data;
      loopBodies.push(body);
      allBodies.push(body);
    });

    // Connect loop
    loopBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : loopBodies[i - 1];
      allConstraints.push(Constraint.create({
        bodyA, bodyB,
        stiffness: 0.4,
        damping: 0.1,
        length: (bodyA.circleRadius || 10) + (bodyB.circleRadius || 10) + 8,
        render: { visible: false }
      }));
    });
    // Close the loop
    allConstraints.push(Constraint.create({
      bodyA: loopBodies[loopBodies.length - 1],
      bodyB: centerBody,
      stiffness: 0.4,
      damping: 0.1,
      length: (loopBodies[loopBodies.length - 1].circleRadius || 10) + centerBody.circleRadius + 8,
      render: { visible: false }
    }));

    // Pendant (Tail)
    const pendantItems = beadsData.filter(b => 
      (!b.id.startsWith('d') || b.id === 'd1_of') && 
      b.id !== 'loop_chain_start' && 
      b.id !== 'centerpiece'
    ).reverse();
    const pendantBodies = [];
    let py = cy + loopRadius + 30;
    
    pendantItems.forEach((data) => {
      let body;
      if (data.physicsType === 'cross') {
        body = Bodies.rectangle(cx, py + 20, 24, 48, beadOptions);
        py += 60;
      } else {
        let r = 8;
        if (data.physicsType === 'large') r = 12;
        if (data.physicsType === 'chain') r = 4;
        body = Bodies.circle(cx, py, r, beadOptions);
        py += r * 2 + 10;
      }
      body.beadData = data;
      pendantBodies.push(body);
      allBodies.push(body);
    });

    // Connect pendant
    pendantBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : pendantBodies[i - 1];
      const isCrossA = bodyA.beadData.physicsType === 'cross';
      const isCrossB = bodyB.beadData.physicsType === 'cross';
      const offsetA = isCrossA ? { x: 0, y: -20 } : { x: 0, y: 0 };
      const offsetB = isCrossB ? { x: 0, y: -20 } : { x: 0, y: 0 };
      const lenA = isCrossA ? 4 : (bodyA.circleRadius || 10);
      const lenB = isCrossB ? 4 : (bodyB.circleRadius || 10);

      allConstraints.push(Constraint.create({
        bodyA, pointA: offsetA,
        bodyB, pointB: offsetB,
        stiffness: 0.3,
        damping: 0.1,
        length: lenA + lenB + 6,
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
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let lastChimeTime = 0;
    const CHIME_COOLDOWN = 40;
    
    const playChime = (force, type, index, isProgress = false) => {
      const now = audioCtx.currentTime * 1000;
      if (!isProgress && now - lastChimeTime < CHIME_COOLDOWN) return;
      if (!isProgress) lastChimeTime = now;

      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      const baseFreq = isProgress ? 1200 : (type === 'chain' ? 800 : (type === 'large' ? 300 : 500));
      const chargeFactor = 1 + (index / beadsData.length) * 0.5;
      osc.frequency.setValueAtTime(baseFreq * chargeFactor, audioCtx.currentTime);
      osc.type = isProgress ? 'sine' : (type === 'chain' ? 'triangle' : 'sine');
      
      const volume = isProgress ? 0.15 : Math.min(force * 0.3, 0.15);
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

      if (dist < 10) {
        const bodies = Composite.allBodies(world);
        const clickedBodies = Query.point(bodies, mouseUpPos);
        const beadBody = clickedBodies.find(b => b.beadData);

        if (beadBody) {
          const data = beadBody.beadData;
          if (data.prayer || data.type === 'chain') {
            if (!prayedIdsRef.current.has(data.id)) {
              setPrayedIds(prev => new Set(prev).add(data.id));
              const index = beadsData.findIndex(b => b.id === data.id);
              playChime(1, data.physicsType, index, true);
              if (data.type === 'small-bead') {
                logAveMaria();
              }
            }
            setSelectedBeadId(data.id);
            if (data.type === 'chain') {
              onLinkClick(data);
            } else {
              onNodeClick(data);
            }
          }
        } else {
          setSelectedBeadId(null);
        }
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
        
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        
        ctx.globalAlpha = isPrayed ? baseAlpha + 0.2 : baseAlpha;

        if (data.physicsType === 'cross') {
          ctx.fillStyle = isPrayed ? '#d4af37' : '#222';
          if (isPrayed) {
            ctx.shadowColor = '#d4af37';
            ctx.shadowBlur = 10;
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
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          const r = body.circleRadius;
          const grad = ctx.createRadialGradient(-r/3, -r/3, r/10, 0, 0, r);
          
          if (data.physicsType === 'large') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(200,200,200,0.8)');
          } else if (data.physicsType === 'center') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(150,150,150,0.8)');
          } else if (data.physicsType === 'chain') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, isPrayed ? '#d4af37' : 'rgba(180,180,180,0.8)');
          } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, isPrayed ? '#b8860b' : 'rgba(220,220,220,0.8)');
          }

          if (isPrayed) {
            ctx.shadowColor = '#d4af37';
            ctx.shadowBlur = 10;
          }

          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = isPrayed ? '#b8860b' : 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [onNodeClick, onLinkClick]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />;
};

export default VirtualRosaryPhysics;
