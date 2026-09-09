'use client';

import { useState, useEffect, useCallback } from 'react';
import { BibleChapterData, BibleVerse } from '@/types/study';
import { BIBLE_BOOKS, BookMeta } from '@/app/api/bible/route';

interface BibleReaderProps {
  onTriggerStudy: (scriptureText: string) => void;
  isLoadingStudy?: boolean;
}

export default function BibleReader({ onTriggerStudy, isLoadingStudy }: BibleReaderProps) {
  const [translation, setTranslation] = useState<string>('NKJV');
  const [selectedBook, setSelectedBook] = useState<BookMeta>(
    BIBLE_BOOKS.find((b) => b.name === 'John') || BIBLE_BOOKS[42]
  );
  const [chapter, setChapter] = useState<number>(3);
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selected verse(s) for study
  const [selectedVerseStart, setSelectedVerseStart] = useState<number | null>(null);
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<number | null>(null);

  // Fetch chapter data
  const loadChapter = useCallback(
    async (trans: string, bookName: string, chapNum: number) => {
      setIsLoadingChapter(true);
      setFetchError(null);
      setSelectedVerseStart(null);
      setSelectedVerseEnd(null);

      try {
        const res = await fetch(
          `/api/bible?translation=${encodeURIComponent(trans)}&book=${encodeURIComponent(
            bookName
          )}&chapter=${chapNum}`
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load chapter');
        }

        const data: BibleChapterData = await res.json();
        setChapterData(data);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Error loading Bible chapter');
      } finally {
        setIsLoadingChapter(false);
      }
    },
    []
  );

  useEffect(() => {
    loadChapter(translation, selectedBook.name, chapter);
  }, [translation, selectedBook, chapter, loadChapter]);

  // Handle chapter navigation
  const handlePrevChapter = () => {
    if (chapter > 1) {
      setChapter(chapter - 1);
    } else {
      // Go to previous book if available
      const currentIndex = BIBLE_BOOKS.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1];
        setSelectedBook(prevBook);
        setChapter(prevBook.chapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (chapter < selectedBook.chapters) {
      setChapter(chapter + 1);
    } else {
      // Go to next book if available
      const currentIndex = BIBLE_BOOKS.findIndex((b) => b.id === selectedBook.id);
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1];
        setSelectedBook(nextBook);
        setChapter(1);
      }
    }
  };

  const handleVerseClick = (vNum: number) => {
    if (selectedVerseStart === null) {
      setSelectedVerseStart(vNum);
      setSelectedVerseEnd(null);
    } else if (selectedVerseEnd === null) {
      if (vNum === selectedVerseStart) {
        // Toggle off if same verse clicked again
        setSelectedVerseStart(null);
      } else if (vNum > selectedVerseStart) {
        setSelectedVerseEnd(vNum);
      } else {
        setSelectedVerseEnd(selectedVerseStart);
        setSelectedVerseStart(vNum);
      }
    } else {
      // Reset selection to clicked verse
      setSelectedVerseStart(vNum);
      setSelectedVerseEnd(null);
    }
  };

  // Build reference string and text snippet for study trigger
  const getSelectedPassage = () => {
    if (!chapterData || selectedVerseStart === null) return null;
    const start = selectedVerseStart;
    const end = selectedVerseEnd !== null ? selectedVerseEnd : start;

    const ref =
      start === end
        ? `${chapterData.book} ${chapterData.chapter}:${start}`
        : `${chapterData.book} ${chapterData.chapter}:${start}-${end}`;

    const matchingVerses = chapterData.verses.filter((v) => v.verse >= start && v.verse <= end);
    const fullText = matchingVerses.map((v) => `${v.verse}. ${v.text}`).join(' ');

    return {
      reference: ref,
      text: fullText,
      combined: `${fullText} — ${ref} (${chapterData.translation})`,
    };
  };

  const activePassage = getSelectedPassage();

  const handleLaunchStudy = () => {
    if (activePassage) {
      onTriggerStudy(activePassage.combined);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '16px',
        position: 'relative',
      }}
    >
      {/* Top Header / Selector Controls */}
      <div
        className="animate-fade-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          {/* Translation Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>VERSION:</span>
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="bible-select"
              aria-label="Select Bible Translation"
            >
              <option value="NKJV">NKJV (New King James)</option>
              <option value="KJV">KJV (King James)</option>
              <option value="WEB">WEB (World English)</option>
            </select>
          </div>

          {/* Prev / Next Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handlePrevChapter}
              className="chapter-nav-btn"
              title="Previous Chapter"
              aria-label="Previous Chapter"
            >
              ← Prev
            </button>
            <button
              onClick={handleNextChapter}
              className="chapter-nav-btn"
              title="Next Chapter"
              aria-label="Next Chapter"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Book & Chapter Pickers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          {/* Book Select */}
          <select
            value={selectedBook.id}
            onChange={(e) => {
              const bId = parseInt(e.target.value, 10);
              const b = BIBLE_BOOKS.find((bk) => bk.id === bId);
              if (b) {
                setSelectedBook(b);
                setChapter(1);
              }
            }}
            className="bible-select-large"
            aria-label="Select Bible Book"
          >
            <optgroup label="Old Testament">
              {BIBLE_BOOKS.filter((b) => b.testament === 'OT').map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="New Testament">
              {BIBLE_BOOKS.filter((b) => b.testament === 'NT').map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Chapter Select */}
          <select
            value={chapter}
            onChange={(e) => setChapter(parseInt(e.target.value, 10))}
            className="bible-select-large"
            aria-label="Select Chapter"
          >
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                Ch. {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instructional Tip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-glass)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span>💡 Click any verse number or text to select it for study</span>
        <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{chapterData?.translation || translation}</span>
      </div>

      {/* Main Chapter Content Scroll Area */}
      <div
        className="bible-reader-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {isLoadingChapter ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0' }}>
            <div className="skeleton-line" style={{ width: '40%', height: '20px' }} />
            <div className="skeleton-line" style={{ width: '100%', height: '16px' }} />
            <div className="skeleton-line" style={{ width: '95%', height: '16px' }} />
            <div className="skeleton-line" style={{ width: '98%', height: '16px' }} />
            <div className="skeleton-line" style={{ width: '90%', height: '16px' }} />
          </div>
        ) : fetchError ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--accent-red)',
              background: 'var(--bg-glass)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Unable to load chapter</p>
            <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '14px' }}>{fetchError}</p>
            <button
              onClick={() => loadChapter(translation, selectedBook.name, chapter)}
              className="primary-btn"
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              Retry
            </button>
          </div>
        ) : chapterData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '700',
                fontFamily: 'serif',
                color: 'var(--text-primary)',
                marginBottom: '10px',
                borderBottom: '1px dashed var(--border-subtle)',
                paddingBottom: '8px',
              }}
            >
              {chapterData.book} {chapterData.chapter}
            </h2>

            {chapterData.verses.map((v) => {
              const start = selectedVerseStart;
              const end = selectedVerseEnd !== null ? selectedVerseEnd : start;
              const isSelected = start !== null && v.verse >= start && v.verse <= (end ?? start);

              return (
                <div
                  key={v.verse}
                  onClick={() => handleVerseClick(v.verse)}
                  className={`bible-verse-item${isSelected ? ' selected' : ''}`}
                >
                  <sup className="bible-verse-num">{v.verse}</sup>
                  <span className="bible-verse-text">{v.text}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Floating / Sticky Bottom Bar when Verse is Selected */}
      {activePassage && (
        <div className="bible-floating-modal animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)' }}>
              Selected: {activePassage.reference}
            </span>
            <button
              onClick={() => {
                setSelectedVerseStart(null);
                setSelectedVerseEnd(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '13px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>

          <button
            onClick={handleLaunchStudy}
            disabled={isLoadingStudy}
            className="primary-btn pulse-glow bible-study-action-btn"
          >
            {isLoadingStudy ? (
              <span>Preparing Study...</span>
            ) : (
              <>
                <span>📖 Study {activePassage.reference}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
