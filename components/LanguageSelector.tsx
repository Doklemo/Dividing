'use client';

import { useState, useRef, useEffect } from 'react';
import { SupportedLanguage } from '@/types/study';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export default function LanguageSelector({
  currentLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: '500',
          padding: '8px 12px',
          cursor: 'pointer',
          transition: 'all 200ms',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'var(--bg-tab-active)';
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            'var(--border-brand)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'var(--bg-card)';
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            'var(--border-mid)';
        }}
      >
        <span style={{ fontSize: '14px' }}>{currentMeta.flag}</span>
        <span style={{ fontSize: '12px', fontWeight: 600 }}>
          {currentMeta.nativeName}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div
          className="animate-fade-up"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-brand)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            minWidth: '180px',
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '4px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isSelected
                    ? 'var(--bg-tab-active)'
                    : 'transparent',
                  color: isSelected
                    ? 'var(--accent-gold)'
                    : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--bg-tab-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '15px' }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.nativeName}</span>
                {isSelected && (
                  <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
