'use client';

import { useState } from 'react';
import { StudyResult, TabId, Tab } from '@/types/study';

interface StudyBreakdownProps {
  result: StudyResult | null;
  isLoading: boolean;
  scripture: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'crossReferences', label: 'Cross references', icon: '⇌' },
  { id: 'greekWords', label: 'Greek/Hebrew words', icon: 'Α' },
  { id: 'historicalContext', label: 'Historical / Cultural', icon: '🏛' },
  { id: 'commentaries', label: 'Commentaries', icon: '✍' },
];

function SkeletonBlock({ lines = 4 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: '16px', width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '16px',
        padding: '40px',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-mid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
        }}
      >
        📖
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
          Your study breakdown will appear here
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>
          Paste scripture on the left and click &ldquo;Let&apos;s study this scripture&rdquo;
        </p>
      </div>
    </div>
  );
}

function OverviewTab({ text }: { text: string }) {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {text.split('\n\n').filter(Boolean).map((para, i) => (
        <p
          key={i}
          style={{
            fontSize: '15px',
            lineHeight: '1.85',
            color: 'var(--text-primary)',
            fontStyle: i === 0 ? 'normal' : 'normal',
          }}
        >
          {para}
        </p>
      ))}
    </div>
  );
}

function CrossReferencesTab({ refs }: { refs: StudyResult['crossReferences'] }) {
  if (!refs.length) return <p style={{ color: 'var(--text-muted)' }}>No cross references found.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {refs.map((cr, i) => (
        <div
          key={i}
          className="animate-fade-up card"
          style={{
            padding: '16px 18px',
            animationDelay: `${i * 0.07}s`,
            animationFillMode: 'both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-brand">{cr.reference}</span>
          </div>
          <p
            className="font-display"
            style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.7' }}
          >
            &ldquo;{cr.text}&rdquo;
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {cr.connection}
          </p>
        </div>
      ))}
    </div>
  );
}

function GreekWordsTab({ words }: { words: StudyResult['greekWords'] }) {
  if (!words.length) return <p style={{ color: 'var(--text-muted)' }}>No Greek/Hebrew word analysis available.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {words.map((gw, i) => (
        <div
          key={i}
          className="card animate-fade-up"
          style={{
            padding: '18px 20px',
            animationDelay: `${i * 0.07}s`,
            animationFillMode: 'both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span
              className="font-display"
              style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand-accent)' }}
            >
              {gw.word}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              {gw.transliteration}
            </span>
            {gw.englishWord && (
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                &middot; &ldquo;{gw.englishWord}&rdquo;
              </span>
            )}
            {gw.strongsNumber && (
              <span className="badge badge-green">{gw.strongsNumber}</span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: gw.usage ? '10px' : '0' }}>
            {gw.definition}
          </p>
          {gw.usage && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.6' }}>
              {gw.usage}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function HistoricalTab({ text }: { text: string }) {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {text.split('\n\n').filter(Boolean).map((para, i) => (
        <p
          key={i}
          style={{ fontSize: '15px', lineHeight: '1.85', color: 'var(--text-primary)' }}
        >
          {para}
        </p>
      ))}
    </div>
  );
}

function CommentariesTab({ commentaries }: { commentaries: StudyResult['commentaries'] }) {
  if (!commentaries.length) return <p style={{ color: 'var(--text-muted)' }}>No commentaries available.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {commentaries.map((c, i) => (
        <div
          key={i}
          className="card animate-fade-up"
          style={{
            padding: '18px 20px',
            borderLeft: '3px solid var(--border-brand)',
            animationDelay: `${i * 0.07}s`,
            animationFillMode: 'both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-tab-active)',
                border: '1px solid var(--border-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                flexShrink: 0,
                color: '#ffffff',
              }}
            >
              {c.author[0]}
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {c.author}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                · {c.source}
              </span>
            </div>
          </div>
          <p
            className="font-display"
            style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.75' }}
          >
            &ldquo;{c.text}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}

export default function StudyBreakdown({ result, isLoading, scripture }: StudyBreakdownProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkeletonBlock lines={5} />
          <div className="divider" />
          <SkeletonBlock lines={3} />
          <SkeletonBlock lines={4} />
        </div>
      );
    }

    if (!result) return <EmptyState />;

    const tabContent: Record<TabId, React.ReactNode> = {
      overview: <OverviewTab text={result.overview} />,
      crossReferences: <CrossReferencesTab refs={result.crossReferences} />,
      greekWords: <GreekWordsTab words={result.greekWords} />,
      historicalContext: <HistoricalTab text={result.historicalContext} />,
      commentaries: <CommentariesTab commentaries={result.commentaries} />,
    };

    return (
      <div style={{ padding: '24px' }}>
        {tabContent[activeTab]}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Panel header */}
      <div
        style={{
          padding: '20px 24px 0',
          borderBottom: '1px solid var(--border-mid)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Study Breakdown
            </h2>
            {scripture && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '3px',
                  maxWidth: '320px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {scripture.slice(0, 60)}{scripture.length > 60 ? '…' : ''}
              </p>
            )}
          </div>
          {result && <span className="badge badge-green">✓ Complete</span>}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyzing…</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
            paddingBottom: '1px',
          }}
          role="tablist"
          aria-label="Study breakdown tabs"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              disabled={isLoading}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
