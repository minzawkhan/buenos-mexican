'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function VipFooterButton() {
  return (
    <motion.button
      onClick={() => window.dispatchEvent(new Event('open-vip-modal'))}
      whileHover={{
        scale: 1.07,
        y: -3,
        boxShadow: '0 10px 28px rgba(62,39,35,0.45)',
      }}
      whileTap={{ scale: 0.94 }}
      animate={{
        boxShadow: [
          '0 2px 10px rgba(255,215,0,0.15)',
          '0 6px 20px rgba(255,215,0,0.4)',
          '0 2px 10px rgba(255,215,0,0.15)',
        ],
        borderColor: [
          'rgba(255,215,0,0.3)',
          'rgba(255,215,0,0.9)',
          'rgba(255,215,0,0.3)',
        ],
      }}
      transition={{
        boxShadow:   { repeat: Infinity, duration: 2.6, ease: 'easeInOut' },
        borderColor: { repeat: Infinity, duration: 2.6, ease: 'easeInOut' },
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'linear-gradient(135deg, #3E2723 0%, #5C2317 50%, #8B1C1C 100%)',
        color: '#FFD700',
        borderRadius: '50px',
        padding: '0.5rem 1.4rem',
        fontSize: '0.75rem',
        fontWeight: 800,
        fontFamily: 'var(--font-montserrat)',
        border: '1.5px solid rgba(255,215,0,0.3)',
        cursor: 'pointer',
        letterSpacing: '0.05em',
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.5 }}
        style={{ display: 'flex' }}
      >
        <Sparkles size={14} />
      </motion.span>
      SUBSCRIBE
    </motion.button>
  );
}
