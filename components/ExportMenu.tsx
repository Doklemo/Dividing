'use client';

import { useState, useRef, useEffect } from 'react';
import { SavedStudy } from '@/types/study';
import { exportToText, exportToPDF } from '@/lib/export';

interface ExportMenuProps {
  study: SavedStudy;
}

export default function ExportMenu({ study }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'txt' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExportText = () => {
    setExporting('txt');
    try {
      exportToText(study);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await exportToPDF(study);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        id="export-menu-btn"
        onClick={() => setOpen((o) => !o)}
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
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-active)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-brand)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-mid)';
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ↓ Export
      </button>
 
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            minWidth: '180px',
            overflow: 'hidden',
            zIndex: 50,
            animation: 'fade-up 0.15s ease forwards',
          }}
        >
          <button
            role="menuitem"
            onClick={handleExportPDF}
            disabled={exporting !== null}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tab-active)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>📄</span>
            <div>
              <div style={{ fontWeight: '600' }}>Export as PDF</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Formatted report</div>
            </div>
            {exporting === 'pdf' && <span style={{ marginLeft: 'auto' }}>…</span>}
          </button>
 
          <div className="divider" style={{ margin: '0' }} />
 
          <button
            role="menuitem"
            onClick={handleExportText}
            disabled={exporting !== null}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tab-active)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>📝</span>
            <div>
              <div style={{ fontWeight: '600' }}>Export as Text</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Plain .txt file</div>
            </div>
            {exporting === 'txt' && <span style={{ marginLeft: 'auto' }}>…</span>}
          </button>
        </div>
      )}
    </div>
  );
}
