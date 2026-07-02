'use client';

import { useState } from 'react';
import { TopicStudyResult, TopicTabId, TopicTab } from '@/types/study';

interface TopicBreakdownProps {
  result: TopicStudyResult | null;
  isLoading: boolean;
  topic: string;
}

const TOPIC_TABS: TopicTab[] = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'keyScriptures', label: 'Key Scriptures', icon: '📖' },
  { id: 'wordStudy', label: 'Word Study', icon: 'Α' },
  { id: 'theologicalDevelopment', label: 'Theological Development', icon: '📜' },
  { id: 'practicalApplication', label: 'Application', icon: '🎯' },
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
        📚
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
          Your topic study will appear here
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>
          Enter a Bible topic on the left and click &ldquo;Study this topic&rdquo;
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
          }}
        >
          {para}
        </p>
      ))}
    </div>
  );
}

function KeyScripturesTab({ scriptures }: { scriptures: TopicStudyResult['keyScriptures'] }) {
  if (!scriptures.length) return <p style={{ color: 'var(--text-muted)' }}>No key scriptures found.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {scriptures.map((s, i) => (
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
            <span className="badge badge-brand">{s.reference}</span>
          </div>
          <p
            className="font-display"
            style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.7' }}
          >
            &ldquo;{s.text}&rdquo;
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {s.significance}
          </p>
        </div>
      ))}
    </div>
  );
}

function WordStudyTab({ words }: { words: TopicStudyResult['wordStudy'] }) {
  if (!words.length) return <p style={{ color: 'var(--text-muted)' }}>No word study available.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {words.map((w, i) => (
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
              {w.word}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              {w.transliteration}
            </span>
            {w.englishWord && (
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                &middot; &ldquo;{w.englishWord}&rdquo;
              </span>
            )}
            {w.strongsNumber && (
              <span className="badge badge-green">{w.strongsNumber}</span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: w.usage ? '10px' : '0' }}>
            {w.definition}
          </p>
          {w.usage && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.6' }}>
              {w.usage}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function TheologicalDevelopmentTab({ text }: { text: string }) {
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

function PracticalApplicationTab({ text }: { text: string }) {
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

export default function TopicBreakdown({ result, isLoading, topic }: TopicBreakdownProps) {
  const [activeTab, setActiveTab] = useState<TopicTabId>('overview');

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

    const tabContent: Record<TopicTabId, React.ReactNode> = {
      overview: <OverviewTab text={result.overview} />,
      keyScriptures: <KeyScripturesTab scriptures={result.keyScriptures} />,
      wordStudy: <WordStudyTab words={result.wordStudy} />,
      theologicalDevelopment: <TheologicalDevelopmentTab text={result.theologicalDevelopment} />,
      practicalApplication: <PracticalApplicationTab text={result.practicalApplication} />,
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
          padding: '20px 24px 12px',
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
              Topic Study
            </h2>
            {topic && (
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
                {topic.slice(0, 60)}{topic.length > 60 ? '…' : ''}
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
          aria-label="Topic study tabs"
        >
          {TOPIC_TABS.map((tab) => (
            <button
              key={tab.id}
              id={`topic-tab-${tab.id}`}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`topic-tabpanel-${tab.id}`}
              disabled={isLoading}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div
        id={`topic-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`topic-tab-${activeTab}`}
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
