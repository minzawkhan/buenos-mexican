'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';

const TiltCard = ({ item, i, image }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX / width);
    y.set(mouseY / height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + (i * 0.15), duration: 0.6, ease: "easeOut" }}
      className="menu-cat-card"
    >
      <div className="menu-cat-overlay" style={{ transform: "translateZ(30px)" }}></div>
      <div className="menu-cat-bg" style={{ transform: "translateZ(10px)", overflow: 'hidden', borderRadius: '50%', backgroundColor: '#fff' }}>
        <img src={image} alt="" style={{ width: '100%', height: '100%', opacity: 0.9, objectFit: 'cover', mixBlendMode: 'multiply' }} />
      </div>
      <h3 className="menu-cat-title" style={{ transform: "translateZ(60px)", textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>{item}</h3>
    </motion.div>
  );
};

export default function MenuCategories() {
  const items = ['Tacos', 'Burritos', 'Margaritas', 'Desserts'];

  return (
    <section className="py-24" style={{ borderTop: '2px dashed var(--secondary)', perspective: 1500 }}>
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container solid-content-card"
      >
        <motion.div 
          initial={{ rotateX: -20, opacity: 0, z: -100 }}
          whileInView={{ rotateX: 0, opacity: 1, z: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex flex-col md-flex-row justify-between items-center" 
          style={{ marginBottom: '6rem' }}
        >
          <h2 className="script-font text-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>Our Quick Menu</h2>
          <a href="/menu" style={{ transform: "translateZ(20px)" }}><button className="uppercase tracking-widest font-bold view-menu-btn text-foreground">View Full Menu</button></a>
        </motion.div>
        
        <div className="grid grid-cols-1 md-grid-cols-4 gap-6" style={{ perspective: 1200 }}>
          {items.map((item, i) => {
            const images = {
              'Tacos': '/hero_tacos.webp',
              'Burritos': '/images/burritos.webp',
              'Margaritas': '/images/mango.webp',
              'Desserts': '/images/churros.webp'
            };
            return <TiltCard key={i} item={item} i={i} image={images[item]} />
          })}
        </div>
      </motion.div>
    </section>
  );
}
