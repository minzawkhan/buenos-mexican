'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 45, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '2.5px',
        background: 'linear-gradient(90deg, #8B1C1C 0%, #FFD700 65%, #FFF8DC 100%)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 99998,
        boxShadow: '0 0 10px rgba(255,215,0,0.55), 0 0 3px rgba(139,28,28,0.4)',
      }}
    />
  );
}
