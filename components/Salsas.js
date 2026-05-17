'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

const salsas = [
  { name: "Pico De Gallo", level: 1, desc: "Fresh and chunky, this raw salsa mixes tomatoes, onions, cilantro, lime, and jalapeños for a zesty, crisp bite that brightens any dish.", color: "#4CAF50", image: "/images/pico.webp" },
  { name: "Salsa Verde", level: 1, desc: "Made with green tomatoes, green chilies, and fresh herbs, this tangy green salsa delivers a sharp, citrusy punch with just the right heat.", color: "#8BC34A", image: "/images/verde.webp" },
  { name: "Mango Salsa", level: 1, desc: "A tropical twist combining juicy mangoes, red onion, lime, and chili—sweet, spicy, and vibrant, perfect with grilled meats or seafood.", color: "#FFC107", image: "/images/mango.webp" },
  { name: "Pineapple Salsa", level: 1, desc: "Sweet meets heat in this sunny salsa made with fresh pineapple, jalapeños, red onions, and cilantro—bright, bold, and refreshing.", color: "#FFEB3B", image: "/images/pineapple.webp" },
  { name: "Salsa Roja", level: 2, desc: "A classic red salsa featuring roasted tomatoes, chilies, garlic, and onions—smooth, savory, and deeply flavorful with a kick.", color: "#FF9800", image: "/images/roja.webp" },
  { name: "Charred Tomato Salsa", level: 3, desc: "Smoky and rich, this salsa is made with flame-roasted tomatoes, garlic, and jalapeño peppers, delivering a deep, earthy heat.", color: "#F44336", image: "/images/roja.webp" },
  { name: "Buenos Hotcha", level: 4, desc: "A fiery red hot sauce bursting with bold chili flavor and a tangy finish—Buenos Hotcha brings the heat.", color: "#B71C1C", image: "/images/roja.webp" },
];

const SalsaCard = ({ salsa, index }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [10, -10]);
  const rotateY = useTransform(x, [0, 1], [-10, 10]);

  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: 0.2 + ((index % 5) * 0.15), duration: 0.6, ease: "easeOut" }}
      className="flex flex-col md:flex-row gap-6 items-center salsa-card"
      style={{ 
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        backgroundColor: 'var(--background)', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(62,39,35,0.08)',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Decorative rounded left border that perfectly matches card border-radius */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '8px',
        backgroundColor: salsa.color,
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
        zIndex: 5
      }} />

      <div className="salsa-image-container" style={{ flexShrink: 0, width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${salsa.color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transform: 'translateZ(30px)', position: 'relative', zIndex: 10 }}>
        <Image src={salsa.image} alt={salsa.name || 'Salsa'} fill sizes="120px" style={{ objectFit: 'cover' }} />
      </div>

      <div style={{ flex: 1, transform: 'translateZ(20px)', zIndex: 10 }}>
        <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: '0.75rem' }}>
          <h3 className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{salsa.name}</h3>
          <div style={{ 
            backgroundColor: salsa.level === 1 ? '#33691E' : salsa.level === 2 ? '#FF9800' : '#8B1C1C', 
            color: 'white', 
            padding: '4px 16px', 
            borderRadius: '20px', 
            fontWeight: 'bold', 
            fontSize: '0.875rem', 
            transform: 'translateZ(10px)' 
          }}>
            🌶️ Spice Level {salsa.level}
          </div>
        </div>
        <p className="text-gray" style={{ lineHeight: '1.6', fontSize: '1.05rem', transform: 'translateZ(5px)' }}>{salsa.desc}</p>
      </div>
    </motion.div>
  );
};

export default function Salsas() {
  return (
    <section id="salsas" className="py-24 relative perspective-container">
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container relative z-10 solid-content-card" style={{ maxWidth: '900px' }}
      >
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <h2 className="script-font text-primary" style={{ fontSize: 'clamp(3.5rem, 6vw, 5rem)', marginBottom: '0.5rem', textShadow: 'none' }}>Our Salsas</h2>
          <p className="text-gray text-xl" style={{ fontStyle: 'italic' }}>(Ranked in order of spiciness)</p>
        </div>

        <div className="flex flex-col gap-6" style={{ perspective: 1200 }}>
          {salsas.map((salsa, index) => (
            <SalsaCard key={index} salsa={salsa} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
