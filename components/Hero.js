'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Hero() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end start'],
  });

  const rotateXText = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ['0vh', '-20vh']);

  return (
    <section id="home" ref={container} className="relative min-h-screen flex flex-col items-center justify-center pb-32 pt-24" style={{ perspective: '1200px', transformStyle: 'preserve-3d', overflow: 'hidden' }}>

      <motion.div 
        className="z-10 flex flex-col items-center text-center container" 
        style={{ 
          zIndex: 10, 
          rotateX: rotateXText, 
          scale: scaleText, 
          opacity: opacityText,
          y: yText,
          transformOrigin: 'bottom center',
          transformStyle: 'preserve-3d'
        }}
      >
        
        <motion.div
          initial={{ scale: 0, rotate: -180, z: 200 }}
          animate={{ scale: 1, rotate: 0, z: 0 }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.6 }}
          style={{ marginBottom: '2rem' }}
        >
          <img src="/smiley_logo.svg" alt="Buenos Mexican Logo" width="150" height="150" style={{ filter: 'drop-shadow(0px 0px 15px rgba(0,0,0,0.5))', borderRadius: '50%', clipPath: 'circle(50% at 50% 50%)' }} />
        </motion.div>

        <motion.h1 
          className="hero-title font-bold uppercase text-white"
          style={{ marginBottom: '1.5rem', textShadow: '0px 10px 30px rgba(0,0,0,0.9)', transform: 'translateZ(50px)' }}
        >
          TASTE THE <br /> <span className="text-primary" style={{ textShadow: '0px 5px 20px rgba(0,0,0,0.8)' }}>DIFFERENCE</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.5, duration: 1, type: "spring" }}
          className="text-white text-xl"
          style={{ maxWidth: '600px', marginBottom: '2.5rem', transform: 'translateZ(30px)', textShadow: '0px 4px 15px rgba(0,0,0,0.9)', fontWeight: '500' }}
        >
          Your friendly neighbourhood authentic Mexican experience. A modern twist on classic comfort food.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20, z: -50 }}
          animate={{ opacity: 1, y: 0, z: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex gap-4 justify-center items-center"
          style={{ transform: 'translateZ(60px)' }}
        >
          <button className="primary-btn" onClick={() => document.getElementById('booking').scrollIntoView()}>
            Reserve A Table
          </button>
          <button className="outline-btn" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', borderColor: 'var(--primary)' }}>
            Order on Grab
          </button>
        </motion.div>

      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute text-center"
        style={{ bottom: '2.5rem', zIndex: 20 }}
      >
        <span style={{ display: 'block', width: '3px', height: '50px', backgroundColor: 'var(--primary)', margin: '0 auto 8px auto', boxShadow: '0px 0px 10px rgba(0,0,0,0.5)' }}></span>
        <p className="text-xs text-white font-bold uppercase tracking-widest" style={{ textShadow: '0px 2px 5px rgba(0,0,0,0.8)' }}>Scroll</p>
      </motion.div>
    </section>
  );
}
