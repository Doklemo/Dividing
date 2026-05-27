'use client';

import { useEffect, useState } from 'react';

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
          ? 'linear-gradient(135deg, #6ea0f6, #7da2f5)' // Soft sky blue gradient matching the reference image
          : 'linear-gradient(135deg, #1e1b4b, #0f172a)', // Deep space navy/indigo gradient
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
          : 'inset 0 2px 4px rgba(0, 0, 0, 0.25)',
        transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        outline: 'none',
        userSelect: 'none',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Light Mode sky elements (clouds/dots) */}
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

      {/* Dark Mode space elements (twinkling stars) */}
      {/* Star 1 - top left */}
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '7px',
          width: '2.5px',
          height: '2.5px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0 : 0.9,
          transform: isLight ? 'scale(0) translate(-10px, -10px)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Star 2 - mid/low left */}
      <span
        style={{
          position: 'absolute',
          left: '20px',
          top: '15px',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0 : 0.7,
          transform: isLight ? 'scale(0) translate(-5px, 5px)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Star 3 - mid top */}
      <span
        style={{
          position: 'absolute',
          left: '26px',
          top: '6px',
          width: '1.5px',
          height: '1.5px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: isLight ? 0 : 0.6,
          transform: isLight ? 'scale(0) translate(-2px, -5px)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Sliding Toggle Thumb */}
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: isLight
            ? '0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(110, 160, 246, 0.2)'
            : '0 2px 4px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 255, 255, 0.1)',
          transform: isLight ? 'translateX(0px)' : 'translateX(28px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'block',
          position: 'relative',
          zIndex: 2,
        }}
      />
    </button>
  );
}
