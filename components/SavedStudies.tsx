'use client';

import { SavedStudy } from '@/types/study';
import { deleteStudy } from '@/lib/storage';
import { exportToText, exportToPDF } from '@/lib/export';
import { useState } from 'react';

interface SavedStudiesProps {
  studies: SavedStudy[];
  onLoad: (study: SavedStudy) => void;
  onDelete: (key: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedStudies({ studies, onLoad, onDelete, isOpen, onClose }: SavedStudiesProps) {
  const [exportingKey, setExportingKey] = useState<string | null>(null);

  const handleDelete = (key: string) => {
    deleteStudy(key);
    onDelete(key);
  };

  const handleExportPDF = async (study: SavedStudy) => {
    setExportingKey(study.key);
    try {
      await exportToPDF(study);
    } finally {
      setExportingKey(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
          background: '#18181b',
          borderLeft: '1px solid #27272a',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        }}
        role="dialog"
        aria-label="Saved studies"
        aria-modal="true"
      >
        {/* Drawer header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Saved Studies
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {studies.length} {studies.length === 1 ? 'study' : 'studies'} saved locally
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#ffffff',
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

        {/* Study list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {studies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
              <p style={{ fontSize: '14px' }}>No saved studies yet.</p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>
                Complete a study and it will be saved automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {studies.map((study) => (
                <div
                  key={study.key}
                  className="card"
                  style={{ padding: '14px 16px' }}
                >
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
                    {study.snippet}{study.scripture.length > 120 ? '…' : ''}
                  </p>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {formatDate(study.savedAt)}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { onLoad(study); onClose(); }}
                      style={{
                        flex: 1,
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '6px 10px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#27272a';
                      }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => exportToText(study)}
                      style={{
                        background: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#27272a';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#3f3f46';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#18181b';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a';
                      }}
                    >
                      .txt
                    </button>
                    <button
                      onClick={() => handleExportPDF(study)}
                      disabled={exportingKey === study.key}
                      style={{
                        background: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        opacity: exportingKey === study.key ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (exportingKey !== study.key) {
                          (e.currentTarget as HTMLButtonElement).style.background = '#27272a';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#3f3f46';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (exportingKey !== study.key) {
                          (e.currentTarget as HTMLButtonElement).style.background = '#18181b';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a';
                        }
                      }}
                    >
                      {exportingKey === study.key ? '…' : 'PDF'}
                    </button>
                    <button
                      onClick={() => handleDelete(study.key)}
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
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
