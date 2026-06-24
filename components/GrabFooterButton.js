'use client';

import { motion } from 'framer-motion';

export default function GrabFooterButton() {
  return (
    <motion.a
      href="https://r.grab.com/o/Zn6bI3Ar"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        scale: 1.07,
        y: -3,
        boxShadow: '0 10px 28px rgba(0,177,79,0.45)',
      }}
      whileTap={{ scale: 0.94 }}
      animate={{
        boxShadow: [
          '0 2px 10px rgba(0,177,79,0.2)',
          '0 6px 20px rgba(0,177,79,0.45)',
          '0 2px 10px rgba(0,177,79,0.2)',
        ],
        borderColor: [
          'rgba(0,177,79,0.5)',
          'rgba(0,177,79,1)',
          'rgba(0,177,79,0.5)',
        ],
      }}
      transition={{
        boxShadow:   { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
        borderColor: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        background: 'linear-gradient(135deg, #00B14F 0%, #00873C 100%)',
        color: '#fff',
        borderRadius: '50px',
        padding: '0.5rem 1.4rem',
        fontSize: '0.75rem',
        fontWeight: 800,
        fontFamily: 'var(--font-montserrat)',
        border: '1.5px solid rgba(0,177,79,0.5)',
        letterSpacing: '0.05em',
        textDecoration: 'none',
        marginLeft: '0.5rem',
      }}
    >
      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        style={{ fontSize: '1rem', lineHeight: 1 }}
      >
        🛵
      </motion.span>
      ORDER ON GRAB
    </motion.a>
  );
}
