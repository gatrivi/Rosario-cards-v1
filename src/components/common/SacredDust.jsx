import React, { useEffect, useRef, useMemo } from 'react';

/**
 * SacredDust — A low-overhead ambient particle system.
 * Simulates floating motes of light/dust in a sacred space.
 * Intensifies when 'isCargando' is true.
 */
const FRAME_MS = 50;

export default function SacredDust({ isCargando = false, count = 25 }) {
  const canvasRef = useRef(null);
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,
      opacity: 0.1 + Math.random() * 0.3,
      seed: Math.random() * 100
    }));
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastFrame = 0;

    // Size the bitmap on mount and on resize only. Reading window.innerWidth
    // (forced layout) and reallocating a full-screen canvas on every frame
    // kept the main thread busy even with nobody touching the screen, and
    // made drag-to-pray trail the finger on phones.
    let width = 0;
    let height = 0;
    const fit = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    fit();
    window.addEventListener('resize', fit);

    let timerId;
    const render = (time = 0) => {
      // Slow drifting motes need ~20 frames per second. Wait on a timer and
      // only then ask for a frame: a bare rAF loop makes the browser produce
      // a full main-thread frame 60 times a second for nothing.
      timerId = setTimeout(() => { animationFrameId = requestAnimationFrame(render); }, FRAME_MS);
      const frames = lastFrame ? Math.min(6, (time - lastFrame) / (1000 / 60)) : 1;
      lastFrame = time;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgb(212, 175, 55)';

      const intensity = isCargando ? 2.5 : 1.0;
      const audioAlphaBoost =
        typeof window !== 'undefined' && typeof window.__voxDustAlphaBoost === 'number'
          ? window.__voxDustAlphaBoost
          : 1;

      particles.forEach(p => {
        // Movement
        p.x += p.speedX * intensity * frames;
        p.y += p.speedY * intensity * frames;

        // Wrap around
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;

        // Pulse opacity
        const pulse = Math.sin(Date.now() / 2000 + p.seed) * 0.05;
        const finalOpacity = Math.min(1, ((p.opacity + pulse) * (isCargando ? 1.8 : 1)) * audioAlphaBoost);

        // A 1–4 px mote: a soft core plus a fainter halo reads the same as
        // a per-particle radial gradient, at a fraction of the cost.
        const cx = p.x * width / 100;
        const cy = p.y * height / 100;
        ctx.globalAlpha = Math.max(0, finalOpacity) * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = Math.max(0, finalOpacity);
        ctx.beginPath();
        ctx.arc(cx, cy, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', fit);
    };
  }, [particles, isCargando]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, 
        width: '100%', height: '100%', 
        pointerEvents: 'none', 
        zIndex: 1, // Above background, below interactive content
        opacity: 0.6,
        mixBlendMode: 'screen'
      }} 
    />
  );
}
