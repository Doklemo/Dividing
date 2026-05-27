'use client';

import { useState, useEffect, useCallback } from 'react';
import ScriptureInput from '@/components/ScriptureInput';
import StudyBreakdown from '@/components/StudyBreakdown';
import SavedStudies from '@/components/SavedStudies';
import ExportMenu from '@/components/ExportMenu';
import { StudyResult, SavedStudy } from '@/types/study';
import { saveStudy, getAllStudies } from '@/lib/storage';

export default function HomePage() {
  const [scripture, setScripture] = useState('');
  const [result, setResult] = useState<StudyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentStudy, setCurrentStudy] = useState<SavedStudy | null>(null);
  const [mobileView, setMobileView] = useState<'input' | 'breakdown'>('input');

  // Load saved studies on mount
  useEffect(() => {
    setSavedStudies(getAllStudies());
  }, []);

  const handleStudy = useCallback(async (text: string) => {
    setScripture(text);
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStudy(null);
    setMobileView('breakdown');

    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scripture: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate study');
      }

      const data: StudyResult = await res.json();
      setResult(data);

      // Auto-save
      const saved = saveStudy(text, data);
      setCurrentStudy(saved);
      setSavedStudies((prev) => [saved, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoadStudy = useCallback((study: SavedStudy) => {
    setScripture(study.scripture);
    setResult(study.result);
    setCurrentStudy(study);
    setError(null);
    setMobileView('breakdown');
  }, []);

  const handleDeleteStudy = useCallback((key: string) => {
    setSavedStudies((prev) => prev.filter((s) => s.key !== key));
    if (currentStudy?.key === key) setCurrentStudy(null);
  }, [currentStudy]);

  return (
    <>
      {/* Toolbar */}
      <div
        className="toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 32px',
          borderBottom: '1px solid var(--border-mid)',
          background: 'var(--toolbar-bg)',
          backdropFilter: 'blur(10px)',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {mobileView === 'breakdown' && (
            <button
              className="mobile-back-btn"
              onClick={() => setMobileView('input')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '8px',
                padding: '6px 0',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'block', flexShrink: 0 }}
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>
          )}
          {result && (
            <span className="badge badge-green animate-fade-up">
              ✓ Study complete
            </span>
          )}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                AI is studying your scripture…
              </span>
            </div>
          )}
          {error && (
            <span
              style={{
                fontSize: '13px',
                color: '#f87171',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '6px',
                padding: '4px 12px',
              }}
            >
              ⚠ {error}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {result && mobileView === 'input' && (
            <button
              className="mobile-view-breakdown-btn"
              onClick={() => setMobileView('breakdown')}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '500',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Show Study</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'block', flexShrink: 0 }}
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          )}
          {currentStudy && <ExportMenu study={currentStudy} />}

          <button
            id="saved-studies-btn"
            onClick={() => setDrawerOpen(true)}
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
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'all 200ms',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-active)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-brand)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)';
            }}
            aria-label={`View saved studies (${savedStudies.length})`}
          >
            📚 Saved
            {savedStudies.length > 0 && (
              <span
                style={{
                  background: 'var(--bg-tab-active)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-brand)',
                  fontSize: '10px',
                  fontWeight: '700',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {savedStudies.length > 9 ? '9+' : savedStudies.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Split-screen layout */}
      <div
        className="split-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          height: 'calc(100vh - 60px - 52px - 36px)',
          overflow: 'hidden',
        }}
      >
        {/* Left: Scripture Input */}
        <div
          className={`input-panel ${mobileView === 'breakdown' ? 'mobile-hidden' : ''}`}
          style={{
            borderRight: '1px solid var(--border-subtle)',
            padding: '32px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ScriptureInput onSubmit={handleStudy} isLoading={isLoading} />
        </div>

        {/* Right: Study Breakdown */}
        <div
          className={`card breakdown-panel ${mobileView === 'input' ? 'mobile-hidden' : ''}`}
          style={{
            margin: '16px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 32px)',
          }}
        >
          <StudyBreakdown
            result={result}
            isLoading={isLoading}
            scripture={scripture}
          />
        </div>
      </div>

      {/* Responsive mobile layout override */}
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 0 16px !important;
          }
          .toolbar {
            padding: 12px 16px !important;
          }
          .split-layout {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }
          .input-panel {
            border-right: none !important;
            border-bottom: 1px solid var(--border-mid) !important;
            padding: 24px 16px !important;
            overflow-y: visible !important;
          }
          .breakdown-panel {
            margin: 16px 8px !important;
            height: 600px !important;
            overflow: hidden !important;
          }
          .mobile-hidden {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-back-btn,
          .mobile-view-breakdown-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Saved Studies Drawer */}
      <SavedStudies
        studies={savedStudies}
        onLoad={handleLoadStudy}
        onDelete={handleDeleteStudy}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
