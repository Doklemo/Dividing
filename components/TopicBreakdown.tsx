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
  { id: 'scholarlyPerspectives', label: 'Scholarly Insights', icon: '✍' },
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

// Canonical Bible book order for sorting scriptures OT → NT
const BIBLE_BOOK_ORDER: Record<string, number> = (() => {
  const books = [
    // Old Testament (39 books)
    'genesis','exodus','leviticus','numbers','deuteronomy',
    'joshua','judges','ruth','1 samuel','2 samuel',
    '1 kings','2 kings','1 chronicles','2 chronicles',
    'ezra','nehemiah','esther','job','psalms','psalm',
    'proverbs','ecclesiastes','song of solomon','song of songs',
    'isaiah','jeremiah','lamentations','ezekiel','daniel',
    'hosea','joel','amos','obadiah','jonah','micah',
    'nahum','habakkuk','zephaniah','haggai','zechariah','malachi',
    // New Testament (27 books)
    'matthew','mark','luke','john','acts',
    'romans','1 corinthians','2 corinthians','galatians','ephesians',
    'philippians','colossians','1 thessalonians','2 thessalonians',
    '1 timothy','2 timothy','titus','philemon',
    'hebrews','james','1 peter','2 peter',
    '1 john','2 john','3 john','jude','revelation',
  ];
  const map: Record<string, number> = {};
  books.forEach((b, i) => { map[b] = i; });
  return map;
})();

function getBookOrder(reference: string): number {
  // Normalize: trim, lowercase, strip leading numbers-with-spaces carefully
  const ref = reference.trim().toLowerCase();
  // Try progressively shorter prefixes to match "1 corinthians 13:4-7" → "1 corinthians"
  // First, strip chapter:verse — everything from the first digit-colon pattern onward
  const bookPart = ref.replace(/\s+\d+[:\d\-–,\s]*$/, '').trim();
  if (BIBLE_BOOK_ORDER[bookPart] !== undefined) return BIBLE_BOOK_ORDER[bookPart];
  // Fallback: try without trailing 's' (e.g. "psalm" vs "psalms")
  const alt = bookPart.endsWith('s') ? bookPart.slice(0, -1) : bookPart + 's';
  if (BIBLE_BOOK_ORDER[alt] !== undefined) return BIBLE_BOOK_ORDER[alt];
  return 999; // Unknown books go to the end
}

function sortScriptures<T extends { reference: string }>(scriptures: T[]): T[] {
  return [...scriptures].sort((a, b) => getBookOrder(a.reference) - getBookOrder(b.reference));
}

function KeyScripturesTab({ scriptures }: { scriptures: TopicStudyResult['keyScriptures'] }) {
  if (!scriptures || !scriptures.length) return <p style={{ color: 'var(--text-muted)' }}>No key scriptures found.</p>;
  const sorted = sortScriptures(scriptures);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
          {scriptures.length} Foundational Passages
        </span>
      </div>
      {sorted.map((s, i) => (
        <div
          key={i}
          className="animate-fade-up card"
          style={{
            padding: '18px 20px',
            animationDelay: `${i * 0.05}s`,
            animationFillMode: 'both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span className="badge badge-brand" style={{ fontSize: '12px', padding: '5px 10px' }}>
              {s.reference}
            </span>
            {s.category && (
              <span
                className="badge"
                style={{
                  background: 'var(--bg-tab-active)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-mid)',
                }}
              >
                {s.category}
              </span>
            )}
          </div>
          <p
            className="font-display"
            style={{ fontSize: '15px', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: '1.75' }}
          >
            &ldquo;{s.text}&rdquo;
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
            {s.significance}
          </p>
        </div>
      ))}
    </div>
  );
}

function WordStudyTab({ words }: { words: TopicStudyResult['wordStudy'] }) {
  if (!words || !words.length) return <p style={{ color: 'var(--text-muted)' }}>No word study available.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
          {words.length} Hebrew & Greek Terms Analyzed
        </span>
      </div>
      {words.map((w, i) => (
        <div
          key={i}
          className="card animate-fade-up"
          style={{
            padding: '18px 20px',
            animationDelay: `${i * 0.05}s`,
            animationFillMode: 'both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span
              className="font-display"
              style={{ fontSize: '24px', fontWeight: '700', color: 'var(--brand-accent)' }}
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

function ScholarlyPerspectivesTab({ perspectives }: { perspectives?: TopicStudyResult['scholarlyPerspectives'] }) {
  if (!perspectives || !perspectives.length) {
    return <p style={{ color: 'var(--text-muted)' }}>No scholarly insights available for this topic.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {perspectives.map((c, i) => (
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
      scholarlyPerspectives: <ScholarlyPerspectivesTab perspectives={result.scholarlyPerspectives} />,
    };

    return <div style={{ padding: '24px' }}>{tabContent[activeTab]}</div>;
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
          {result && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-green">✓ Complete</span>
            </div>
          )}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyzing…</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          className="no-scrollbar"
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
