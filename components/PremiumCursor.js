'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function PremiumCursor() {
  const [ready,    setReady]    = useState(false);
  const [visible,  setVisible]  = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  /* Dot: tight spring — follows nearly instantly */
  const dotX = useSpring(mx, { stiffness: 1000, damping: 40 });
  const dotY = useSpring(my, { stiffness: 1000, damping: 40 });

  /* Ring: loose spring — visible lag creates the premium trail */
  const ringX = useSpring(mx, { stiffness: 150, damping: 20 });
  const ringY = useSpring(my, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setReady(true);

    const onMove  = (e) => { mx.set(e.clientX); my.set(e.clientY); setVisible(true); };
    const onOver  = (e) => { setHovering(!!e.target.closest('a, button, [role="button"], input, select, textarea, label')); };
    const onDown  = () => setClicking(true);
    const onUp    = () => setClicking(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener('mousemove',  onMove);
    document.addEventListener('mouseover',  onOver);
    document.addEventListener('mousedown',  onDown);
    document.addEventListener('mouseup',    onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [mx, my]);

  if (!ready) return null;

  return (
    <>
      {/* Hide native cursor on all elements */}
      <style>{`* { cursor: none !important; }`}</style>

      {/* Outer ring — lags behind cursor for a trailing feel */}
      <motion.div
        animate={{
          width:           hovering ? 54 : 34,
          height:          hovering ? 54 : 34,
          borderColor:     hovering ? 'rgba(255,215,0,0.92)' : 'rgba(255,215,0,0.5)',
          backgroundColor: hovering ? 'rgba(255,215,0,0.07)' : 'rgba(0,0,0,0)',
          opacity:  visible  ? 1    : 0,
          scale:    clicking ? 0.72 : 1,
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0,
          x: ringX, y: ringY,
          translateX: '-50%', translateY: '-50%',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,215,0,0.5)',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />

      {/* Center dot — nearly instant */}
      <motion.div
        animate={{
          width:           clicking ? 3  : 5,
          height:          clicking ? 3  : 5,
          backgroundColor: hovering ? '#FFD700' : '#8B1C1C',
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0,
          x: dotX, y: dotY,
          translateX: '-50%', translateY: '-50%',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />
    </>
  );
}
