'use client';

import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

const menuData = [
  {
    category: "Appetizers and Shareables",
    subcategories: [
      {
        title: "Chips and Dips",
        items: [
          { name: "Chips and Salsa", price: "160", desc: "Our Homemade fried tortilla chips served with our signature house salsa or your choice of dips from our salsa selections", image: "/images/chips_dips.webp" },
          { name: "Chips and Guacamole", price: "210", desc: "Crispy fried corn tortilla chips with our homemade guacamole", image: "/images/chips_dips.webp" },
          { name: "Chips and Queso Dip", price: "195", desc: "", image: "/images/chips_dips.webp" },
          { name: "Buenos Trio", price: "195", desc: "Chips, Queso Dip, Salsa & Guacamole", image: "/images/chips_dips.webp" },
          { name: "Buenos Sampler", price: "180", desc: "Chips with a sampler (of our homemade salsas)", image: "/images/chips_dips.webp" },
        ]
      }
    ]
  },
  {
    category: "Salads",
    description: "Fresh from the Garden, Packed with Passion – where fresh meets flavor",
    items: [
      { name: "Mexican Chopped Salad", price: "250-320", desc: "A vibrant mix of black beans, cherry tomatoes, bell peppers, romaine lettuce, onions, pico de gallo, and roasted corn. Served in a crispy flour tortilla bowl.\nPlain: 250 | Grilled Chicken: 275 | Grilled Steak: 290 | Shrimp: 320", image: "/images/salads.webp" },
      { name: "Caesar Salad", price: "250-320", desc: "A classic Caesar salad with a bold Mexican twist! Served in a crispy tortilla bowl.\nPlain: 250 | Grilled Chicken: 275 | Grilled Steak: 290 | Shrimp: 320", image: "/images/salads.webp" },
      { name: "Shrimp and Avocado Salad", price: "320", desc: "Fresh romaine lettuce tossed with tender shrimp, creamy avocado, cherry tomatoes, and red onions. Topped with crispy tortilla strips.", image: "/images/salads.webp" },
    ]
  },
  {
    category: "Nachos & Fries",
    description: "Crispy tortilla chips or fries smothered in warm, gooey melted cheeses. Loaded with your choice of meat, jalapeños, tomatoes, and onions.",
    items: [
      { name: "Nachos (Various Meats)", price: "230-275", desc: "Cheese, Chicken, Carnitas, Carnie Asada, Al Pastor, Ground Beef.", image: "/images/nachos.webp" },
      { name: "Buenos Fiesta Fries", price: "230-275", desc: "Cheese, Chicken, Carnitas, Carnie Asada, Al Pastor, Ground Beef.", image: "/images/nachos.webp" }
    ]
  },
  {
    category: "Classics",
    subcategories: [
      {
        title: "Flautas (3 Per Order)",
        items: [
          { name: "Chicken, Carnitas, Ground Beef", price: "240", desc: "", image: "/images/flautas.webp" },
          { name: "Carnie Asada, Al Pastor", price: "250", desc: "", image: "/images/flautas.webp" },
          { name: "Shrimp Flautas", price: "325", desc: "", image: "/images/flautas.webp" },
        ]
      },
      {
        title: "Taquitos (4 Per Order)",
        items: [
          { name: "Cheese Taquitos", price: "230", desc: "", image: "/images/flautas.webp" },
          { name: "Chicken, Carnitas, Al Pastor", price: "260", desc: "", image: "/images/flautas.webp" },
          { name: "Carnie Asada", price: "275", desc: "", image: "/images/flautas.webp" },
          { name: "Ground Beef", price: "250", desc: "", image: "/images/flautas.webp" },
        ]
      },
      {
        title: "Enchiladas",
        items: [
          { name: "Vegetable", price: "225", desc: "", image: "/images/flautas.webp" },
          { name: "Chicken, Carnitas", price: "265", desc: "", image: "/images/flautas.webp" },
          { name: "Al Pastor, Carne Asada", price: "275", desc: "", image: "/images/flautas.webp" },
          { name: "Ground Beef", price: "255", desc: "", image: "/images/flautas.webp" },
        ]
      }
    ]
  },
  {
    category: "Burritos",
    description: "Your choice of meats or veggies wrapped in a warm flour tortilla with mexican rice, black beans, melted cheese, and guacamole.",
    items: [
      { name: "Rice and Beans Burrito", price: "250", desc: "", image: "/images/burritos.webp" },
      { name: "Chicken, Carnitas, Al Pastor, Birria", price: "265-275", desc: "", image: "/images/burritos.webp" },
      { name: "Carnie Asada", price: "295", desc: "", image: "/images/burritos.webp" },
      { name: "Ground Beef", price: "250", desc: "", image: "/images/burritos.webp" },
      { name: "Roasted Vegetables", price: "255", desc: "", image: "/images/burritos.webp" },
    ],
    subcategories: [
      {
        title: "Specialty Burrito Styles",
        items: [
          { name: "Wet Burrito, Dorado Style, Chimichanga", price: "(+) 30", desc: "Make any burrito special.", image: "/images/burritos.webp" }
        ]
      }
    ]
  },
  {
    category: "Bowls & Fajitas",
    subcategories: [
      {
        title: "Buenos Burrito Bowls",
        items: [
          { name: "Chicken, Carnitas, Al Pastor, Ground Beef", price: "250-275", desc: "", image: "/images/fajitas.webp" },
          { name: "Carnie Asada", price: "295", desc: "", image: "/images/fajitas.webp" },
          { name: "Fish / Shrimp", price: "275 / 375", desc: "", image: "/images/fajitas.webp" },
        ]
      },
      {
        title: "Fajitas",
        items: [
          { name: "Chicken / Steak", price: "295 / 325", desc: "", image: "/images/fajitas.webp" },
          { name: "Shrimp / Vegetables", price: "375 / 275", desc: "", image: "/images/fajitas.webp" },
        ]
      }
    ]
  },
  {
    category: "Quesadillas & Pizzas",
    subcategories: [
      {
        title: "Quesadillas",
        items: [
          { name: "Cheese, Chicken, Carnitas", price: "220-265", desc: "", image: "/images/quesadillas.webp" },
          { name: "Carnie Asada, Al Pastor, Ground Beef", price: "250-275", desc: "", image: "/images/quesadillas.webp" },
          { name: "Shrimp, Grilled Vegetables", price: "295 / 240", desc: "", image: "/images/quesadillas.webp" },
        ]
      },
      {
        title: "Mexican Pizzas (8\" / 12\")",
        items: [
          { name: "Chicken, Carnitas, Al Pastor", price: "230-375", desc: "", image: "/images/quesadillas.webp" },
          { name: "Carnie Asada, Ground Beef", price: "250-385", desc: "", image: "/images/quesadillas.webp" },
          { name: "Shrimp, Grilled Veggies", price: "220-450", desc: "", image: "/images/quesadillas.webp" },
        ]
      }
    ]
  },
  {
    category: "Fusion Selections",
    items: [
      { name: "Chili Con Carne (Tex-Mex Chili)", price: "295", desc: "Slow-simmered beef chili with tender kidney beans, fire-roasted tomatoes.", image: "/images/fusion_ramen.webp" },
      { name: "Birria Ramen", price: "295", desc: "Tex-Mex Ramen blending rich, savory Japanese-style broth.", image: "/images/fusion_ramen.webp" },
      { name: "Shredded Chicken / Carnitas Ramen", price: "275", desc: "Tex-Mex Ramen.", image: "/images/fusion_ramen.webp" },
    ]
  },
  {
    category: "Dulce / Desserts",
    subcategories: [
      {
        title: "Churros",
        items: [
          { name: "Cinnamon & Sugar / Tres Sauces", price: "140 / 195", desc: "", image: "/images/churros.webp" },
          { name: "With Chocolate / Vanilla Ice Cream", price: "175 / 210", desc: "", image: "/images/churros.webp" },
        ]
      },
      {
        title: "Other Sweets",
        items: [
          { name: "Mexican Spiced Chocolate Cookies", price: "210", desc: "", image: "/images/churros.webp" },
          { name: "Caramel and Cinnamon Pastry / Flan", price: "210 / 175", desc: "", image: "/images/churros.webp" },
        ]
      }
    ]
  }
];

const ItemCard = ({ item, idx }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [10, -10]);
  const rotateY = useTransform(x, [0, 1], [-10, 10]);

  // Spring animation for smooth tilt recovery
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: (idx % 6) * 0.1, duration: 0.6, type: 'spring' }}
      style={{ 
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        backgroundColor: 'var(--background)', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        borderLeft: `8px solid var(--primary)`, 
        boxShadow: '0 10px 30px rgba(62,39,35,0.08)',
        display: 'flex',
        flexDirection: 'row',
        gap: '1.5rem',
        alignItems: 'center',
        cursor: 'pointer'
      }}
    >
      {item.image && (
        <div style={{ flexShrink: 0, width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: `3px solid var(--border)`, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transform: 'translateZ(30px)' }}>
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      
      <div style={{ flex: 1, width: '100%', transform: 'translateZ(20px)' }}>
        <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="text-foreground" style={{ fontSize: '1.25rem', fontWeight: '800' }}>{item.name}</h3>
          <span className="text-primary font-bold" style={{ fontSize: '1.15rem', whiteSpace: 'nowrap', transform: 'translateZ(40px)' }}>{item.price}</span>
        </div>
        {item.desc && <p className="text-gray" style={{ lineHeight: '1.5', fontSize: '0.9rem', transform: 'translateZ(10px)' }}>{item.desc}</p>}
      </div>
    </motion.div>
  );
};

export default function MenuPage() {
  const { scrollYProgress } = useScroll();
  const yHeader = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const opacityHeader = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <SmoothScroll>
      <main className="min-h-screen" style={{ paddingTop: '100px', overflowX: 'hidden' }}>
        
        {/* Navigation */}
        <Navbar />

        <header className="container text-center py-24 relative perspective-container" style={{ perspective: 1000, zIndex: 10 }}>
          <motion.div
            style={{ y: yHeader, opacity: opacityHeader, transformStyle: 'preserve-3d' }}
          >
             <motion.h1 
               initial={{ opacity: 0, rotateX: 45, y: -50 }}
               animate={{ opacity: 1, rotateX: 0, y: 0 }}
               transition={{ duration: 1, type: "spring", bounce: 0.4 }}
               className="script-font text-primary" 
               style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', textShadow: '2px 2px 0px rgba(255,255,255,1)', transform: 'translateZ(50px)' }}
             >
               Full Menu
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="text-gray text-xl" 
               style={{ marginTop: '1rem', transform: 'translateZ(20px)' }}
             >
               Explore our authentic Mexican dishes.
             </motion.p>
          </motion.div>
        </header>

        <div className="container relative" style={{ paddingBottom: '100px', maxWidth: '1100px', zIndex: 20 }}>
          {menuData.map((section, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              style={{ marginBottom: '6rem' }}
            >
              
              {/* Category Header */}
              <div className="text-center" style={{ marginBottom: '3rem' }}>
                <h2 className="rustic-section-title" style={{ fontSize: '3.5rem', margin: 0, display: 'inline-block', borderBottom: '3px dashed var(--secondary)', paddingBottom: '0.5rem' }}>{section.category}</h2>
                {section.description && <p className="text-gray" style={{ marginTop: '1.5rem', fontSize: '1.1rem', fontStyle: 'italic', maxWidth: '700px', margin: '1.5rem auto 0 auto' }}>{section.description}</p>}
              </div>

              {/* Section Items Grid */}
              {section.items && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem', perspective: 1200 }}>
                   {section.items.map((item, i) => <ItemCard key={i} item={item} idx={i} />)}
                </div>
              )}

              {/* Subcategories */}
              {section.subcategories && section.subcategories.map((sub, sIdx) => (
                <div key={sIdx} style={{ marginTop: section.items ? '4rem' : '1rem' }}>
                  <div className="text-center" style={{ marginBottom: '2.5rem' }}>
                    <h3 className="script-font text-secondary" style={{ fontSize: '2.5rem', margin: 0 }}>{sub.title}</h3>
                    {sub.description && <p className="text-gray" style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{sub.description}</p>}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem', perspective: 1200 }}>
                     {sub.items.map((item, i) => <ItemCard key={i} item={item} idx={i} />)}
                  </div>
                </div>
              ))}

            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center relative" style={{ padding: '3rem 0', backgroundColor: 'var(--background)', borderTop: '2px dashed var(--border)', zIndex: 30 }}>
          <div className="container flex flex-col md-flex-row justify-between items-center gap-6">
            <div className="anton-font text-foreground" style={{ fontSize: '1.875rem' }}>BUENOS<span className="text-primary">MEX</span></div>
            <p className="text-gray" style={{ fontSize: '0.875rem' }}>© 2026 Buenos Mexican Restaurant. All rights reserved.</p>
            <div className="flex gap-4">
              <div className="footer-icon">FB</div>
              <div className="footer-icon">IG</div>
            </div>
          </div>
        </footer>

      </main>
    </SmoothScroll>
  );
}
