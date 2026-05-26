'use client';

import { useState, useRef } from 'react';

interface ScriptureInputProps {
  onSubmit: (scripture: string) => void;
  isLoading: boolean;
}

const EXAMPLE_VERSES = [
  'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. — John 3:16',
  'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. — Proverbs 3:5-6',
  'I can do all this through him who gives me strength. — Philippians 4:13',
  'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures... — Psalm 23:1-2',
];

export default function ScriptureInput({ onSubmit, isLoading }: ScriptureInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const loadExample = () => {
    const random = EXAMPLE_VERSES[Math.floor(Math.random() * EXAMPLE_VERSES.length)];
    setText(random);
    textareaRef.current?.focus();
  };

  const charCount = text.length;
  const charLimit = 5000;
  const isOverLimit = charCount > charLimit;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Dividing the word of truth
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Paste any scripture passage for a deep AI-powered study
        </p>
      </div>

      {/* Textarea wrapper */}
      <div
        className="animate-fade-up-delay-1"
        style={{
          flex: 1,
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${isFocused ? '#3f3f46' : 'var(--border-mid)'}`,
          transition: 'border-color 150ms ease',
          background: 'var(--bg-input)',
          overflow: 'hidden',
        }}
      >
        <textarea
          ref={textareaRef}
          id="scripture-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the Bible verse(s) you want to study here…&#10;&#10;Example: For God so loved the world… (John 3:16)"
          aria-label="Scripture input"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '240px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '15px',
            lineHeight: '1.8',
            padding: '20px',
            resize: 'none',
            outline: 'none',
          }}
        />

        {/* Character count */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            fontSize: '11px',
            color: isOverLimit ? '#f87171' : 'var(--text-muted)',
            transition: 'color 200ms',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {charCount.toLocaleString()} / {charLimit.toLocaleString()}
        </div>
      </div>

      {/* Footer actions */}
      <div className="animate-fade-up-delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Submit button */}
        <button
          id="study-scripture-btn"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isLoading || !text.trim() || isOverLimit}
          style={{ width: '100%', height: '52px', fontSize: '15px' }}
          aria-label="Start studying this scripture"
        >
          {isLoading ? (
            <>
              <span className="pulse-dot" style={{ flexShrink: 0 }} />
              <span>Studying scripture…</span>
            </>
          ) : (
            <>
              <span>✦</span>
              <span>Let&apos;s study this scripture</span>
            </>
          )}
        </button>

        {/* Secondary actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            onClick={loadExample}
            disabled={isLoading}
            style={{
              background: '#18181b',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              padding: '7px 14px',
              cursor: 'pointer',
              transition: 'all 200ms',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#27272a';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#3f3f46';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#18181b';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            ⚡ Try an example
          </button>

          {text && (
            <button
              onClick={() => setText('')}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Clear
            </button>
          )}

          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            ⌘ + Enter to study
          </span>
        </div>
      </div>
    </div>
  );
}
