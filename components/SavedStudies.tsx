'use client';

import { SavedStudy, SavedTopicStudy } from '@/types/study';
import { deleteStudy, deleteTopicStudy } from '@/lib/storage';
import { exportToText, exportToPDF } from '@/lib/export';
import { useState } from 'react';

type AnyStudy = SavedStudy | SavedTopicStudy;

function isTopicStudy(study: AnyStudy): study is SavedTopicStudy {
  return 'type' in study && study.type === 'topic';
}

interface SavedStudiesProps {
  studies: SavedStudy[];
  topicStudies: SavedTopicStudy[];
  onLoad: (study: SavedStudy) => void;
  onLoadTopic: (study: SavedTopicStudy) => void;
  onDelete: (key: string) => void;
  onDeleteTopic: (key: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedStudies({
  studies,
  topicStudies,
  onLoad,
  onLoadTopic,
  onDelete,
  onDeleteTopic,
  isOpen,
  onClose,
}: SavedStudiesProps) {
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verse' | 'topic'>('all');

  // Merge and sort all studies by date
  const allStudies: AnyStudy[] = [
    ...studies,
    ...topicStudies,
  ].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  const filteredStudies = activeFilter === 'all'
    ? allStudies
    : activeFilter === 'topic'
      ? allStudies.filter(isTopicStudy)
      : allStudies.filter((s) => !isTopicStudy(s));

  const handleDelete = (study: AnyStudy) => {
    if (isTopicStudy(study)) {
      deleteTopicStudy(study.key);
      onDeleteTopic(study.key);
    } else {
      deleteStudy(study.key);
      onDelete(study.key);
    }
  };

  const handleLoad = (study: AnyStudy) => {
    if (isTopicStudy(study)) {
      onLoadTopic(study);
    } else {
      onLoad(study);
    }
    onClose();
  };

  const handleExportPDF = async (study: AnyStudy) => {
    if (isTopicStudy(study)) return; // PDF export only for verse studies for now
    setExportingKey(study.key);
    try {
      await exportToPDF(study as SavedStudy);
    } finally {
      setExportingKey(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalCount = allStudies.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99,
          backdropFilter: 'blur(4px)',
        }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '360px',
          maxWidth: '90vw',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-mid)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--drawer-shadow)',
        }}
        role="dialog"
        aria-label="Saved studies"
        aria-modal="true"
      >
        {/* Drawer header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-mid)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Saved Studies
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {totalCount} {totalCount === 1 ? 'study' : 'studies'} saved locally
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-tab-active)',
                border: '1px solid var(--border-brand)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
              aria-label="Close saved studies"
            >
              ✕
            </button>
          </div>

          {/* Filter tabs */}
          {totalCount > 0 && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'verse', 'topic'] as const).map((filter) => (
                <button
                  key={filter}
                  className={`tab-btn${activeFilter === filter ? ' active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  {filter === 'all' ? 'All' : filter === 'verse' ? '📖 Verse' : '📚 Topic'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Study list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {filteredStudies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
              <p style={{ fontSize: '14px' }}>
                {activeFilter === 'all'
                  ? 'No saved studies yet.'
                  : `No saved ${activeFilter} studies yet.`}
              </p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>
                Complete a study and it will be saved automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredStudies.map((study) => {
                const isTopic = isTopicStudy(study);
                const displayText = isTopic ? study.topic : study.snippet;
                const fullText = isTopic ? study.topic : study.scripture;

                return (
                  <div
                    key={study.key}
                    className="card"
                    style={{ padding: '14px 16px' }}
                  >
                    {/* Type badge */}
                    <div style={{ marginBottom: '8px' }}>
                      <span
                        className="badge"
                        style={{
                          background: isTopic ? 'rgba(96, 165, 250, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          color: isTopic ? 'var(--brand-accent)' : '#34d399',
                          border: `1px solid ${isTopic ? 'rgba(96, 165, 250, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
                          fontSize: '10px',
                        }}
                      >
                        {isTopic ? '📚 Topic' : '📖 Verse'}
                      </span>
                    </div>

                    {/* Study snippet */}
                    <p
                      className="font-display"
                      style={{
                        fontSize: '13px',
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        marginBottom: '10px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {displayText}{fullText.length > 120 ? '…' : ''}
                    </p>

                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      {formatDate(study.savedAt)}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleLoad(study)}
                        style={{
                          flex: 1,
                          background: 'var(--bg-tab-active)',
                          border: '1px solid var(--border-brand)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '6px 10px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-brand)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-active)';
                        }}
                      >
                        Load
                      </button>
                      {!isTopic && (
                        <>
                          <button
                            onClick={() => exportToText(study as SavedStudy)}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-mid)',
                              borderRadius: '6px',
                              color: 'var(--text-secondary)',
                              fontSize: '11px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-active)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-brand)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)';
                            }}
                          >
                            .txt
                          </button>
                          <button
                            onClick={() => handleExportPDF(study)}
                            disabled={exportingKey === study.key}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-mid)',
                              borderRadius: '6px',
                              color: 'var(--text-secondary)',
                              fontSize: '11px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              opacity: exportingKey === study.key ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (exportingKey !== study.key) {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-active)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-brand)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (exportingKey !== study.key) {
                                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)';
                              }
                            }}
                          >
                            {exportingKey === study.key ? '…' : 'PDF'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(study)}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '6px',
                          color: '#f87171',
                          fontSize: '11px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.35)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
                        }}
                        aria-label="Delete study"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
