'use client';

import { useEffect, useState } from 'react';

// Star Icon component for the 5-point stars in dark mode
const StarIcon = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      fill: '#ffffff',
      position: 'absolute',
      ...style,
    }}
  >
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('light', initialTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
  };

  if (!mounted) {
    // Spacer during hydration to prevent layout shift
    return <div style={{ width: '56px', height: '28px' }} />;
  }

  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: isLight
          ? 'linear-gradient(135deg, #6ea0f6, #7da2f5)' // Soft sky blue gradient for Light Mode
          : 'linear-gradient(135deg, #0b0f19, #070a13)', // Dark space navy/black for Dark Mode
        border: 'none',
        borderRadius: '30px',
        width: '56px',
        height: '28px',
        padding: '3px',
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: isLight 
          ? 'inset 0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)'
          : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        outline: 'none',
        userSelect: 'none',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* --- LIGHT MODE ELEMENTS (Right side sky dots) --- */}
      {/* Medium dot on the top right */}
      <span
        style={{
          position: 'absolute',
          right: '8px',
          top: '7px',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0.9 : 0,
          transform: isLight ? 'scale(1)' : 'scale(0) translate(10px, -10px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Small dot in the mid-right */}
      <span
        style={{
          position: 'absolute',
          right: '17px',
          top: '12px',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0.75 : 0,
          transform: isLight ? 'scale(1)' : 'scale(0) translate(10px, 10px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Tiny dot on the bottom-right */}
      <span
        style={{
          position: 'absolute',
          right: '12px',
          top: '17px',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0.6 : 0,
          transform: isLight ? 'scale(1)' : 'scale(0) translate(5px, 5px)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* --- DARK MODE ELEMENTS (Left side stars/dots matching the screenshot) --- */}
      {/* Medium 5-point Star (Top-Left) */}
      <StarIcon
        size={7.5}
        style={{
          left: '11px',
          top: '6px',
          opacity: isLight ? 0 : 0.95,
          transform: isLight ? 'scale(0) translate(-10px, -10px) rotate(-45deg)' : 'scale(1) rotate(0deg)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Small 5-point Star (Bottom-Mid-Left) */}
      <StarIcon
        size={6}
        style={{
          left: '18px',
          top: '16px',
          opacity: isLight ? 0 : 0.9,
          transform: isLight ? 'scale(0) translate(-5px, 10px) rotate(45deg)' : 'scale(1) rotate(0deg)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Tiny dot (Center-Left near edge) */}
      <span
        style={{
          position: 'absolute',
          left: '8px',
          top: '15px',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0 : 0.8,
          transform: isLight ? 'scale(0) translate(-12px, 5px)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Small dot (Upper-Right of the stars group) */}
      <span
        style={{
          position: 'absolute',
          left: '23px',
          top: '9px',
          width: '2.5px',
          height: '2.5px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0 : 0.85,
          transform: isLight ? 'scale(0) translate(5px, -8px)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Small dot (Center of the stars group) */}
      <span
        style={{
          position: 'absolute',
          left: '17px',
          top: '11px',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0 : 0.75,
          transform: isLight ? 'scale(0) translate(-2px, -2px)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* --- SLIDING TOGGLE THUMB (Sun in Light Mode / Crescent Moon in Dark Mode) --- */}
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: isLight ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0)',
          boxShadow: isLight
            ? '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 0 0 0 rgba(255, 255, 255, 0)'
            : '0 2px 4px rgba(0, 0, 0, 0), inset -7px -2px 0 0 #ffffff',
          transform: isLight ? 'translateX(0px)' : 'translateX(28px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.4s ease, box-shadow 0.4s ease',
          display: 'block',
          position: 'relative',
          zIndex: 2,
        }}
      />
    </button>
  );
}
