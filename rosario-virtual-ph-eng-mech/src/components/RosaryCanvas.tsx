import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { BeadData, getRosaryBeads } from '../data/rosaryData';

const { Engine, World, Bodies, Constraint, Mouse, MouseConstraint, Composite, Events, Query } = Matter;

interface RosaryCanvasProps {
  showIds: boolean;
  selectedBeadId?: string;
  prayedIds: Set<string>;
  onSelectBead: (bead: BeadData | null) => void;
}

export const RosaryCanvas: React.FC<RosaryCanvasProps> = ({ 
  showIds, 
  selectedBeadId, 
  prayedIds, 
  onSelectBead 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine>(Engine.create({ gravity: { x: 0, y: 0 } }));
  const prayedIdsRef = useRef<Set<string>>(prayedIds);

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

    const allBodies: Matter.Body[] = [];
    const allConstraints: Matter.Constraint[] = [];

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
    const centerData = beadsData.find(b => b.id === 'centerpiece')!;
    const centerBody = Bodies.circle(cx, cy + loopRadius, 18, beadOptions);
    (centerBody as any).beadData = centerData;
    allBodies.push(centerBody);

    // Loop (Decades)
    const loopItems = beadsData.filter(b => (b.id.startsWith('d') && b.id !== 'd1_of') || b.id === 'loop_chain_start');
    const loopBodies: Matter.Body[] = [];
    
    loopItems.forEach((data, i) => {
      const startAngle = Math.PI / 2;
      const totalAngle = Math.PI * 2;
      const angle = startAngle + ((i + 1) / (loopItems.length + 1)) * totalAngle;
      
      const x = cx + Math.cos(angle) * loopRadius;
      const y = cy + Math.sin(angle) * loopRadius;

      let r = 8;
      if (data.type === 'large') r = 12;
      if (data.type === 'chain') r = 4;

      const body = Bodies.circle(x, y, r, beadOptions);
      (body as any).beadData = data;
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
    const pendantBodies: Matter.Body[] = [];
    let py = cy + loopRadius + 30;
    
    pendantItems.forEach((data) => {
      let body;
      if (data.type === 'cross') {
        body = Bodies.rectangle(cx, py + 20, 24, 48, beadOptions);
        py += 60;
      } else {
        let r = 8;
        if (data.type === 'large') r = 12;
        if (data.type === 'chain') r = 4;
        body = Bodies.circle(cx, py, r, beadOptions);
        py += r * 2 + 10;
      }
      (body as any).beadData = data;
      pendantBodies.push(body);
      allBodies.push(body);
    });

    // Connect pendant
    pendantBodies.forEach((bodyB, i) => {
      const bodyA = i === 0 ? centerBody : pendantBodies[i - 1];
      const isCrossA = (bodyA as any).beadData.type === 'cross';
      const isCrossB = (bodyB as any).beadData.type === 'cross';
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
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let lastChimeTime = 0;
    const CHIME_COOLDOWN = 40;
    
    const playChime = (force: number, type: string, index: number, isProgress: boolean = false) => {
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
        const beadBody = clickedBodies.find(b => (b as any).beadData);

        if (beadBody) {
          const data = (beadBody as any).beadData as BeadData;
          if (data.prayer) {
            if (!prayedIdsRef.current.has(data.id)) {
              const index = beadsData.findIndex(b => b.id === data.id);
              playChime(1, data.type, index, true);
            }
            onSelectBead(data);
          }
        } else {
          onSelectBead(null);
        }
      }
    });

    Events.on(engine, 'collisionStart', (event: any) => {
      event.pairs.forEach((pair: any) => {
        const bodyA = pair.bodyA as any;
        const bodyB = pair.bodyB as any;
        if (bodyA.beadData && bodyB.beadData) {
          const force = pair.collision.normal.x * (bodyA.velocity.x - bodyB.velocity.x) + 
                        pair.collision.normal.y * (bodyA.velocity.y - bodyB.velocity.y);
          const absForce = Math.abs(force);
          if (absForce > 0.8) {
            const dataA = bodyA.beadData as BeadData;
            const indexA = beadsData.findIndex(b => b.id === dataA.id);
            playChime(absForce, dataA.type, indexA);
          }
        }
      });
    });

    // --- Rendering ---
    const ctx = canvas.getContext('2d')!;
    const render = () => {
      Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, width, height);

      const baseAlpha = selectedBeadId ? 0.3 : 0.6;
      
      // Draw chains
      for (const c of allConstraints) {
        const dataA = (c.bodyA as any).beadData as BeadData;
        const dataB = (c.bodyB as any).beadData as BeadData;
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
          ctx.globalAlpha = baseAlpha + 0.3;
        } else {
          ctx.strokeStyle = '#b89947';
          ctx.lineWidth = 2;
          ctx.globalAlpha = baseAlpha;
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw bodies
      for (const body of allBodies) {
        const data = (body as any).beadData as BeadData;
        const isSelected = data.id === selectedBeadId;
        const isPrayed = prayedIdsRef.current.has(data.id);
        
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        
        ctx.globalAlpha = isSelected ? 1.0 : (isPrayed ? baseAlpha + 0.3 : baseAlpha);

        if (data.type === 'cross') {
          ctx.fillStyle = isPrayed ? '#d4af37' : '#8b7355';
          if (isPrayed) {
            ctx.shadowColor = '#d4af37';
            ctx.shadowBlur = 10;
          }
          
          // Draw a proper cross shape
          const vWidth = 10;
          const hWidth = 32;
          const hHeight = 12;
          const vHeight = 48;
          const crossBarY = -10; // Offset from center

          ctx.beginPath();
          // Top
          ctx.moveTo(-vWidth/2, -vHeight/2);
          ctx.lineTo(vWidth/2, -vHeight/2);
          // Right arm top
          ctx.lineTo(vWidth/2, crossBarY - hHeight/2);
          ctx.lineTo(hWidth/2, crossBarY - hHeight/2);
          // Right arm bottom
          ctx.lineTo(hWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(vWidth/2, crossBarY + hHeight/2);
          // Bottom
          ctx.lineTo(vWidth/2, vHeight/2);
          ctx.lineTo(-vWidth/2, vHeight/2);
          // Left arm bottom
          ctx.lineTo(-vWidth/2, crossBarY + hHeight/2);
          ctx.lineTo(-hWidth/2, crossBarY + hHeight/2);
          // Left arm top
          ctx.lineTo(-hWidth/2, crossBarY - hHeight/2);
          ctx.lineTo(-vWidth/2, crossBarY - hHeight/2);
          ctx.closePath();
          
          ctx.fill();
          ctx.strokeStyle = '#5d4037';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          const r = (body as any).circleRadius;
          const grad = ctx.createRadialGradient(-r/3, -r/3, r/10, 0, 0, r);
          
          if (data.type === 'large') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : '#e0e0e0');
            grad.addColorStop(1, isPrayed ? '#b8860b' : '#bdbdbd');
          } else if (data.type === 'center') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : '#f5f5f5');
            grad.addColorStop(1, isPrayed ? '#b8860b' : '#9e9e9e');
          } else if (data.type === 'chain') {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, isPrayed ? '#d4af37' : '#b89947');
          } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, isPrayed ? '#d4af37' : '#f5f5f5');
            grad.addColorStop(1, isPrayed ? '#b8860b' : '#d1d1d1');
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

        if (showIds) {
          ctx.rotate(-body.angle);
          ctx.fillStyle = '#000';
          ctx.font = '10px sans-serif';
          ctx.fillText(data.id, 15, 5);
        }
        
        ctx.restore();
      }

      requestAnimationFrame(render);
    };
    render();

    return () => {
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [showIds, selectedBeadId, onSelectBead]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none" />;
};
