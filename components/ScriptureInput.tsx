'use client';

import { useState, useRef } from 'react';
import { StudyMode } from '@/types/study';

interface ScriptureInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  studyMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const EXAMPLE_VERSES = [
  'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. — John 3:16',
  'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight. — Proverbs 3:5-6',
  'I can do all this through him who gives me strength. — Philippians 4:13',
  'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures... — Psalm 23:1-2',
];

const EXAMPLE_TOPICS = [
  'Grace',
  'Faith',
  'Prayer',
  'The Holy Spirit',
  'Salvation',
  'Love of God',
  'Sin',
  'Repentance',
  'The Trinity',
  'The Second Coming',
  'Heaven and Eternal Life',
];

export default function ScriptureInput({ onSubmit, isLoading, studyMode, onModeChange }: ScriptureInputProps) {
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
    if (studyMode === 'topic') {
      const random = EXAMPLE_TOPICS[Math.floor(Math.random() * EXAMPLE_TOPICS.length)];
      setText(random);
    } else {
      const random = EXAMPLE_VERSES[Math.floor(Math.random() * EXAMPLE_VERSES.length)];
      setText(random);
    }
    textareaRef.current?.focus();
  };

  const handleModeSwitch = (mode: StudyMode) => {
    if (mode !== studyMode) {
      setText('');
      onModeChange(mode);
    }
  };

  const charCount = text.length;
  const charLimit = studyMode === 'topic' ? 200 : 5000;
  const isOverLimit = charCount > charLimit;

  const isVerse = studyMode === 'verse';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '20px',
      }}
    >
      {/* Mode Toggle */}
      <div className="mode-toggle animate-fade-up">
        <button
          className={`mode-toggle-btn${isVerse ? ' active' : ''}`}
          onClick={() => handleModeSwitch('verse')}
          disabled={isLoading}
          aria-label="Switch to verse study mode"
        >
          Verse Study
        </button>
        <button
          className={`mode-toggle-btn${!isVerse ? ' active' : ''}`}
          onClick={() => handleModeSwitch('topic')}
          disabled={isLoading}
          aria-label="Switch to topic study mode"
        >
          Topic Study
        </button>
      </div>

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
            {isVerse ? 'Dividing the word of truth' : 'Explore a Bible topic'}
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {isVerse
            ? 'Paste any scripture passage for a deep AI-powered study'
            : 'Enter a topic for a comprehensive biblical exploration'}
        </p>
      </div>

      {/* Textarea wrapper */}
      <div
        className="animate-fade-up-delay-1"
        style={{
          flex: 1,
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${isFocused ? 'var(--border-brand)' : 'var(--border-mid)'}`,
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
          placeholder={
            isVerse
              ? "Paste the Bible verse(s) you want to study here…\n\nExample: For God so loved the world… (John 3:16)"
              : "Enter a Bible topic to study…\n\nExample: Grace, Sanctification, The Holy Spirit"
          }
          aria-label={isVerse ? 'Scripture input' : 'Topic input'}
          style={{
            width: '100%',
            height: '100%',
            minHeight: isVerse ? '240px' : '120px',
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
          aria-label={isVerse ? 'Start studying this scripture' : 'Start studying this topic'}
        >
          {isLoading ? (
            <>
              <span className="pulse-dot" style={{ flexShrink: 0 }} />
              <span>{isVerse ? 'Studying scripture…' : 'Studying topic…'}</span>
            </>
          ) : (
            <>
              <span>✦</span>
              <span>{isVerse ? "Let\u0027s study this scripture" : 'Study this topic'}</span>
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
              background: 'var(--bg-card)',
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
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-active)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-brand)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
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

          <span className="hide-mobile" style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            ⌘ + Enter to study
          </span>
        </div>
      </div>
    </div>
  );
}
