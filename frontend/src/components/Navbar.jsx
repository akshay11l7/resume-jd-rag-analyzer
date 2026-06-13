import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const GithubIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Navbar = ({ theme, toggleTheme, navigate, currentPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'results', label: 'Analysis History' }
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--navbar-height)',
      zIndex: 50,
      transition: 'all 0.3s ease',
      backgroundColor: scrolled ? 'var(--glass-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
      boxShadow: scrolled ? 'var(--glass-shadow)' : 'none'
    }}>
      <div className="container flex items-center justify-between" style={{ height: '100%' }}>
        
        {/* Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => navigate('landing')}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold'
          }}>H</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Hire<span className="text-gradient">Ready</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: '32px' }} className="hidden-mobile">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => navigate(link.id === 'features' ? 'landing' : link.id)}
              style={{
                background: 'none',
                color: currentPage === link.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: currentPage === link.id ? 600 : 500,
                fontSize: '0.95rem',
                position: 'relative',
                transition: 'color 0.2s ease'
              }}
            >
              {link.label}
              {currentPage === link.id && (
                <motion.div 
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px',
                    background: 'var(--accent-color)', borderRadius: '2px'
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} style={{ background: 'none', color: 'var(--text-primary)', padding: '8px', borderRadius: '50%' }} className="btn-icon">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <a href="#" style={{ color: 'var(--text-primary)', display: 'flex' }} className="hidden-mobile btn-icon">
            <GithubIcon size={20} />
          </a>
          <button style={{ background: 'none', color: 'var(--text-primary)', display: 'flex' }} className="hidden-mobile btn-icon">
            <UserCircle size={24} />
          </button>
          <button 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', color: 'var(--text-primary)' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        .btn-icon:hover {
          background-color: var(--border-color);
          transition: background-color 0.2s ease;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
