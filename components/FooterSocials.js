'use client';

import { motion } from 'framer-motion';

const socials = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61571573732880',
    hoverColor: '#1877F2',
    delay: 0,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/buenosmexican?fbclid=IwY2xjawRznhRleHRuA2FlbQIxMABicmlkETFQbkZOR1hqazAxSEpCNEFNc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHs0VzzJDWjePzxFG9a_AWF5tmBH8bmLqkP2YgFiBI6ZEGTjRA7RrfVC56QOx_aem_BKVr468BcDo4txoIxBuIcg',
    hoverColor: '#E1306C',
    delay: 0.15,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@buenosmexican?fbclid=IwY2xjawRznfpleHRuA2FlbQIxMABicmlkETFQbkZOR1hqazAxSEpCNEFNc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHop9ctZCrvyq4KyxuTUuHMc5wQqZKr04ypQpB8h8X0Wib7fpCS3LT8LtW9vr_aem_13NfEpKva0QHSvE7Kwt_QQ',
    hoverColor: '#010101',
    delay: 0.3,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.6-4.03-1.42-.88-.65-1.59-1.47-2.11-2.42v10.17c.03 2.1-.39 4.26-1.89 5.81-1.5 1.55-3.67 2.39-5.87 2.39-2.2 0-4.37-.84-5.87-2.39-1.5-1.55-1.92-3.71-1.89-5.81.03-2.1.45-4.26 1.95-5.81 1.5-1.55 3.67-2.39 5.87-2.39.2 0 .4 0 .6.02v4.03c-.2-.02-.4-.02-.6-.02-1.1 0-2.19.42-2.94 1.19-.75.77-.96 1.85-.98 2.9-.02 1.05.19 2.13.94 2.9.75.77 1.84 1.19 2.94 1.19 1.1 0 2.19-.42 2.94-1.19.75-.77.96-1.85.98-2.9V0h.06z" />
      </svg>
    ),
  },
];

export default function FooterSocials() {
  return (
    <>
      {socials.map((s) => (
        <motion.a
          key={s.label}
          href={s.href}
          aria-label={s.label}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: s.delay, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{
            scale: 1.18,
            y: -4,
            backgroundColor: s.hoverColor,
            color: '#fff',
            borderColor: s.hoverColor,
            boxShadow: `0 8px 22px ${s.hoverColor}55`,
          }}
          whileTap={{ scale: 0.92 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1.5px solid var(--border)',
            color: 'var(--foreground)',
            backgroundColor: 'transparent',
            textDecoration: 'none',
            transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
          }}
        >
          {s.icon}
        </motion.a>
      ))}
    </>
  );
}
