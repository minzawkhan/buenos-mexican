'use client';

import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Sparkles, CalendarDays } from 'lucide-react';

/* ── Stagger entrance variant ── */
const btnEntrance = {
  hidden: { opacity: 0, y: 40, scale: 0.88 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

/* ── Floating particle dots ── */
const PARTICLES = [
  { color: 'rgba(255,215,0,0.8)',  size: 6, left: '4%',  top: '-14px', dur: 2.5, delay: 0    },
  { color: 'rgba(139,28,28,0.75)', size: 5, left: '20%', top: '-22px', dur: 3.2, delay: 0.55 },
  { color: 'rgba(0,177,79,0.8)',   size: 7, left: '78%', top: '-16px', dur: 2.8, delay: 0.9  },
  { color: 'rgba(255,215,0,0.5)',  size: 4, left: '93%', top: '45%',   dur: 3.6, delay: 0.3  },
  { color: 'rgba(0,177,79,0.55)', size: 5, left: '55%', top: '-24px', dur: 2.2, delay: 1.1  },
  { color: 'rgba(139,28,28,0.5)', size: 4, left: '40%', top: '-10px', dur: 3.0, delay: 0.7  },
];

/* ── Burst angles ── */
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/* ── Click-burst hook ── */
function useBurst() {
  const [burst, setBurst] = useState(null);
  const timer = useRef(null);
  const trigger = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (timer.current) clearTimeout(timer.current);
    setBurst({ x: e.clientX - r.left, y: e.clientY - r.top, id: Date.now() });
    timer.current = setTimeout(() => setBurst(null), 700);
  };
  return { burst, trigger };
}

/* ── Burst particle renderer ── */
function Burst({ burst, c1, c2 }) {
  return (
    <AnimatePresence>
      {burst && ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={`${burst.id}-${i}`}
            initial={{ opacity: 1, x: burst.x - 4, y: burst.y - 4, scale: 1 }}
            animate={{ opacity: 0, x: burst.x + Math.cos(rad) * 65 - 4, y: burst.y + Math.sin(rad) * 65 - 4, scale: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.4, 1] }}
            style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: i % 2 === 0 ? c1 : c2, pointerEvents: 'none', zIndex: 50 }}
          />
        );
      })}
    </AnimatePresence>
  );
}

/* ── 3-D mouse-tilt wrapper ── */
function TiltCard({ children, style }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-50, 50], [10, -10]), { stiffness: 360, damping: 28 });
  const rY = useSpring(useTransform(mx, [-50, 50], [-10, 10]), { stiffness: 360, damping: 28 });
  return (
    <motion.div
      style={{ ...style, rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d' }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(e.clientX - (r.left + r.width / 2)); my.set(e.clientY - (r.top + r.height / 2)); }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end start'] });
  const rotateXText = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const scaleText   = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yText       = useTransform(scrollYProgress, [0, 1], ['0vh', '-20vh']);

  const reserveBurst   = useBurst();
  const subscribeBurst = useBurst();
  const grabBurst      = useBurst();

  return (
    <section
      id="home" ref={container}
      className="relative min-h-screen flex flex-col items-center justify-center pb-32 pt-40"
      style={{ position: 'relative', perspective: '1200px', transformStyle: 'preserve-3d', overflow: 'hidden' }}
    >
      <motion.div
        className="z-10 flex flex-col items-center text-center container"
        style={{ zIndex: 10, rotateX: rotateXText, scale: scaleText, opacity: opacityText, y: yText, transformOrigin: 'bottom center', transformStyle: 'preserve-3d' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.8, type: 'spring' }}
          style={{ marginBottom: '2rem', transform: 'translateZ(100px)' }}
        >
          <Image src="/mexican_hat.svg" alt="Buenos Mexican Sombrero Icon" width={120} height={120} priority />
        </motion.div>

        <motion.h1
          className="hero-title font-bold uppercase"
          style={{ fontSize: 'clamp(2.2rem, 10vw, 9rem)', marginBottom: '1.5rem', transform: 'translateZ(50px)', width: '100%', lineHeight: 1 }}
        >
          TASTE THE <br /> <span className="neon-red">DIFFERENCE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50, rotateX: -90 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring' }}
          className="text-white text-xl"
          style={{ maxWidth: '600px', marginBottom: '2.5rem', transform: 'translateZ(30px)', textShadow: '0px 4px 15px rgba(0,0,0,0.9)', fontWeight: '500' }}
        >
          Enjoy the best authentic Mexican food in Pattaya. We serve delicious tacos, burritos, and margaritas in the heart of Chon Buri. Visit us today!
        </motion.p>

        {/* ── Button group ── */}
        <div style={{ position: 'relative', width: '100%', transform: 'translateZ(60px)', padding: '0 16px' }}>

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <motion.div key={i}
              style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: p.color, left: p.left, top: p.top, pointerEvents: 'none', filter: 'blur(0.5px)', zIndex: 0 }}
              animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: p.dur, ease: 'easeInOut', delay: p.delay }}
            />
          ))}

          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.75 } } }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center w-full"
          >

            {/* ══ Reserve A Table ══ */}
            <motion.div variants={btnEntrance} style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 50 }}>
                <Burst burst={reserveBurst.burst} c1="#FFD700" c2="rgba(255,160,160,0.9)" />
              </div>
              <TiltCard style={{ width: '100%' }}>
                <motion.button
                  whileHover={{ scale: 1.07, y: -6, boxShadow: '0 24px 55px rgba(139,28,28,0.75), 0 0 0 2px rgba(255,215,0,0.4)' }}
                  whileTap={{ scale: 0.92 }}
                  animate={{
                    boxShadow: ['0 4px 16px rgba(139,28,28,0.35)', '0 14px 38px rgba(139,28,28,0.65)', '0 4px 16px rgba(139,28,28,0.35)'],
                    borderColor: ['rgba(255,215,0,0.2)', 'rgba(255,215,0,0.55)', 'rgba(255,215,0,0.2)'],
                  }}
                  transition={{ boxShadow: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.4 }, borderColor: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.4 } }}
                  style={{ position: 'relative', overflow: 'hidden', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #8B1C1C 0%, #5C1111 100%)', color: '#FDF8F0', border: '2px solid rgba(255,215,0,0.2)', borderRadius: '8px', padding: '16px 32px', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-montserrat)', letterSpacing: '0.02em', transformStyle: 'preserve-3d' }}
                  onClick={(e) => { reserveBurst.trigger(e); document.getElementById('booking').scrollIntoView(); }}
                >
                  {/* Ambient blob */}
                  <motion.span style={{ position: 'absolute', width: '80%', height: '80%', top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}
                    animate={{ x: ['-15%', '15%', '-15%'], y: ['-10%', '10%', '-10%'] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} />
                  {/* Shimmer */}
                  <motion.span style={{ position: 'absolute', top: 0, left: '-80%', width: '55%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none' }}
                    animate={{ left: ['-80%', '160%'] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', repeatDelay: 1.8 }} />
                  <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.4 }} style={{ display: 'flex' }}>
                    <CalendarDays size={20} />
                  </motion.span>
                  Reserve A Table
                </motion.button>
              </TiltCard>
            </motion.div>

            {/* ══ Subscribe ══ */}
            <motion.div variants={btnEntrance} style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 50 }}>
                <Burst burst={subscribeBurst.burst} c1="#FFD700" c2="rgba(255,255,200,0.9)" />
              </div>
              <TiltCard style={{ width: '100%' }}>
                <motion.button
                  whileHover={{ scale: 1.07, y: -6, boxShadow: '0 24px 55px rgba(255,215,0,0.55), 0 0 0 2px rgba(255,215,0,0.65)' }}
                  whileTap={{ scale: 0.92 }}
                  animate={{
                    boxShadow: ['0 4px 16px rgba(255,215,0,0.15)', '0 14px 38px rgba(255,215,0,0.45)', '0 4px 16px rgba(255,215,0,0.15)'],
                    borderColor: ['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.9)', 'rgba(255,215,0,0.3)'],
                  }}
                  transition={{ boxShadow: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.7 }, borderColor: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.7 } }}
                  style={{ position: 'relative', overflow: 'hidden', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #3E2723 0%, #5C2317 50%, #8B1C1C 100%)', color: '#FFD700', border: '1.5px solid rgba(255,215,0,0.3)', borderRadius: '8px', padding: '16px 32px', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--font-montserrat)', letterSpacing: '0.03em', transformStyle: 'preserve-3d' }}
                  onClick={(e) => { subscribeBurst.trigger(e); window.dispatchEvent(new Event('open-vip-modal')); }}
                >
                  {/* Ambient blob */}
                  <motion.span style={{ position: 'absolute', width: '80%', height: '80%', top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}
                    animate={{ x: ['15%', '-15%', '15%'], y: ['10%', '-10%', '10%'] }}
                    transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }} />
                  {/* Gold shimmer */}
                  <motion.span style={{ position: 'absolute', top: 0, left: '-80%', width: '55%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.14), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none' }}
                    animate={{ left: ['-80%', '160%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 1.2 }} />
                  <motion.span animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.35, 0.85, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.7 }} style={{ display: 'flex' }}>
                    <Sparkles size={18} />
                  </motion.span>
                  Subscribe
                </motion.button>
              </TiltCard>
            </motion.div>

            {/* ══ Order on Grab ══ */}
            <motion.div variants={btnEntrance} style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 50 }}>
                <Burst burst={grabBurst.burst} c1="rgba(0,255,127,0.9)" c2="rgba(255,255,255,0.9)" />
              </div>
              <TiltCard style={{ width: '100%' }}>
                <a href="https://r.grab.com/o/Zn6bI3Ar" target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'block' }}>
                  <motion.button
                    whileHover={{ scale: 1.07, y: -6, boxShadow: '0 24px 55px rgba(0,177,79,0.75)', background: 'linear-gradient(135deg, #00C853 0%, #009624 100%)' }}
                    whileTap={{ scale: 0.92 }}
                    animate={{ boxShadow: ['0 4px 16px rgba(0,177,79,0.3)', '0 14px 38px rgba(0,177,79,0.7)', '0 4px 16px rgba(0,177,79,0.3)'] }}
                    transition={{ boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 2 } }}
                    style={{ position: 'relative', overflow: 'hidden', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #00B14F 0%, #00873C 100%)', color: '#fff', border: '2px dashed rgba(0,255,120,0.38)', borderRadius: '8px', padding: '16px 32px', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--font-montserrat)', letterSpacing: '0.02em', transformStyle: 'preserve-3d' }}
                    onClick={(e) => grabBurst.trigger(e)}
                  >
                    {/* Ambient blob */}
                    <motion.span style={{ position: 'absolute', width: '80%', height: '80%', top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}
                      animate={{ x: ['-15%', '15%', '-15%'], y: ['10%', '-10%', '10%'] }}
                      transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }} />
                    {/* Green shimmer */}
                    <motion.span style={{ position: 'absolute', top: 0, left: '-80%', width: '55%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none' }}
                      animate={{ left: ['-80%', '160%'] }} transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', repeatDelay: 0.9 }} />
                    <motion.span animate={{ y: [0, -6, 0], rotate: [-7, 7, -7] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ fontSize: '1.5rem', lineHeight: 1, display: 'inline-block' }}>
                      🛵
                    </motion.span>
                    Order on Grab
                  </motion.button>
                </a>
              </TiltCard>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute text-center" style={{ bottom: '2.5rem', zIndex: 20 }}
      >
        <span style={{ display: 'block', width: '3px', height: '50px', backgroundColor: 'var(--primary)', margin: '0 auto 8px auto', boxShadow: '0px 0px 10px rgba(0,0,0,0.5)' }}></span>
        <p className="text-xs text-white font-bold uppercase tracking-widest" style={{ textShadow: '0px 2px 5px rgba(0,0,0,0.8)' }}>Scroll</p>
      </motion.div>
    </section>
  );
}
