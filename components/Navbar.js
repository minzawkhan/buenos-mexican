'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="navbar" style={{ 
      zIndex: 100, 
      backgroundColor: scrolled ? 'rgba(26, 26, 26, 0.98)' : 'transparent',
      borderBottom: scrolled ? '2px dashed var(--primary)' : '2px dashed transparent',
      padding: scrolled ? '16px 0' : '24px 0',
      color: '#fff',
      transition: 'all 0.4s ease'
    }}>
      <div className="container flex justify-between items-center w-full" style={{ width: '100%', padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <a href="/" className="anton-font" style={{ fontSize: '1.8rem', color: '#fff', letterSpacing: '1px' }}>BUENOS<span className="text-primary">MEX</span></a>
        
        {/* Desktop Menu */}
        <ul className="desktop-menu gap-8 uppercase tracking-widest items-center" style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
          <li><a href="/#home" className="nav-link">Home</a></li>
          <li><a href="/menu" className="nav-link">Menu</a></li>
          <li><a href="/#salsas" className="nav-link">Salsas</a></li>
          <li><a href="/#specials" className="nav-link">Daily Specials</a></li>
          <li><a href="#location" className="nav-link">Contact</a></li>
        </ul>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn flex flex-col gap-1 z-50 relative" onClick={() => setIsOpen(!isOpen)} style={{ padding: '0.5rem' }}>
          <span style={{ display: 'block', width: '25px', height: '3px', backgroundColor: '#fff', transition: '0.3s', transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ display: 'block', width: '25px', height: '3px', backgroundColor: '#fff', transition: '0.3s', opacity: isOpen ? 0 : 1 }}></span>
          <span style={{ display: 'block', width: '25px', height: '3px', backgroundColor: '#fff', transition: '0.3s', transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#1a1a1a', borderBottom: '2px dashed var(--primary)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <a href="/#home" className="nav-link uppercase tracking-widest font-bold" onClick={() => setIsOpen(false)}>Home</a>
          <a href="/menu" className="nav-link uppercase tracking-widest font-bold" onClick={() => setIsOpen(false)}>Menu</a>
          <a href="/#salsas" className="nav-link uppercase tracking-widest font-bold" onClick={() => setIsOpen(false)}>Salsas</a>
          <a href="/#specials" className="nav-link uppercase tracking-widest font-bold" onClick={() => setIsOpen(false)}>Daily Specials</a>
          <a href="#location" className="nav-link uppercase tracking-widest font-bold" onClick={() => setIsOpen(false)}>Contact</a>
        </div>
      )}
    </nav>
  );
}
