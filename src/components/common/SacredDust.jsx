import React, { useEffect, useRef, useMemo } from 'react';

/**
 * SacredDust — A low-overhead ambient particle system.
 * Simulates floating motes of light/dust in a sacred space.
 * Intensifies when 'isCargando' is true.
 */
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

    const render = () => {
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const intensity = isCargando ? 2.5 : 1.0;
      const audioAlphaBoost =
        typeof window !== 'undefined' && typeof window.__voxDustAlphaBoost === 'number'
          ? window.__voxDustAlphaBoost
          : 1;

      particles.forEach(p => {
        // Movement
        p.x += p.speedX * intensity;
        p.y += p.speedY * intensity;

        // Wrap around
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;

        // Pulse opacity
        const pulse = Math.sin(Date.now() / 2000 + p.seed) * 0.05;
        const finalOpacity = Math.min(1, ((p.opacity + pulse) * (isCargando ? 1.8 : 1)) * audioAlphaBoost);

        ctx.beginPath();
        ctx.arc(p.x * width / 100, p.y * height / 100, p.size, 0, Math.PI * 2);
        
        const grad = ctx.createRadialGradient(
          p.x * width / 100, p.y * height / 100, 0,
          p.x * width / 100, p.y * height / 100, p.size
        );
        grad.addColorStop(0, `rgba(212, 175, 55, ${finalOpacity})`);
        grad.addColorStop(1, `rgba(212, 175, 55, 0)`);
        
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
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
