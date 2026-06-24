'use client';

import { useEffect, useRef, useState } from 'react';

export default function ParticleTrail() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsMobile(false);
    }
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles = [];
    const colors = ['#8B1C1C', '#D2691E', '#E6B325', '#795548'];

    let lastMouseTime = 0;
    const handleMouseMove = (e) => {
      const now = performance.now();
      if (now - lastMouseTime < 16) return;
      lastMouseTime = now;
      
      // Spawn 2 particles per mouse move event
      for(let i=0; i<2; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1, // life ranges from 1 to 0
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      // Cap max particles to prevent lag
      if (particles.length > 100) {
        particles.splice(0, particles.length - 100);
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025; // Fade out speed
      }

      // Remove dead particles
      particles = particles.filter(p => p.life > 0);

      // Draw interconnected lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Alpha depends on life and distance
            let alpha = Math.min(particles[i].life, particles[j].life) * (1 - dist / 80);
            ctx.strokeStyle = `rgba(210, 105, 30, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        // Apply alpha to color
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9997,
      }}
    />
  );
}
