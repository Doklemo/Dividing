'use client';

import { useState, useEffect } from 'react';

export default function PwaInstallModal() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showAndroidTip, setShowAndroidTip] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service Worker registered on mount:', reg.scope))
        .catch((err) => console.error('Service Worker registration failed:', err));
    }

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check user-agent to see if iOS
    const isLocalIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isLocalIOS);

    // 1. For iOS: show the Safari instructions modal after 3 seconds
    if (isLocalIOS) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 2. For Android/Chrome: listen for the PWA prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the modal after 2 seconds if prompt event is received
      const timer = setTimeout(() => {
        setShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Fallback: Always display the modal on mobile viewports after 3 seconds,
    // even if beforeinstallprompt hasn't fired yet (ensures visibility on every refresh)
    const isMobileViewport = window.innerWidth <= 768;
    if (isMobileViewport) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setShow(false);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // If prompt event is not ready (e.g. testing local connection or Chrome throttling),
      // show a clean inline tip rather than opening a second instructions modal.
      setShowAndroidTip(true);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setShowAndroidTip(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="pwa-backdrop"
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 9, 11, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'pwa-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Bottom sheet card container */}
        <div
          className="pwa-modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-brand)',
            borderLeft: '1px solid var(--border-brand)',
            borderRight: '1px solid var(--border-brand)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.4)',
            width: '100%',
            maxWidth: '480px',
            padding: '24px 24px 32px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            transform: 'translateY(100%)',
            animation: 'pwa-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Close installation window"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tab-hover)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            ✕
          </button>

          {/* App Info Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/icon-192.png"
              alt="Dividing Logo"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                border: '1px solid var(--border-mid)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                background: 'var(--bg-surface)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2
                style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Install Dividing
              </h2>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                dividing.vercel.app &middot; Free Web App
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {isIOS
                ? 'Add Dividing to your home screen for a fullscreen layout, offline study access, and quick app launch.'
                : 'Install this application on your home screen for quick launch, distraction-free fullscreen view, and reliable offline bible study.'}
            </p>

            {/* iOS Instructions */}
            {isIOS && (
              <div
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span
                    style={{
                      background: 'var(--bg-tab-active)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '700',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{
                        display: 'inline-block',
                        verticalAlign: 'text-bottom',
                        color: 'var(--brand-accent)',
                      }}
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="16"></line>
                    </svg>
                    ) in Safari.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span
                    style={{
                      background: 'var(--bg-tab-active)',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '700',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </span>
                  <span>
                    Scroll down and select <strong>Add to Home Screen</strong> (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'var(--brand-accent)',
                      }}
                    >
                      ＋
                    </span>
                    ).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '4px' }}>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {isIOS ? (
                <button
                  className="btn-primary"
                  onClick={handleDismiss}
                  style={{
                    width: '100%',
                    height: '46px',
                    fontSize: '13px',
                  }}
                >
                  Got It
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDismiss}
                    style={{
                      flex: 1,
                      height: '46px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-mid)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
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
                    Maybe Later
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleInstallClick}
                    style={{
                      flex: 1,
                      height: '46px',
                      fontSize: '13px',
                    }}
                  >
                    Install App
                  </button>
                </>
              )}
            </div>

            {/* Inline Hint Fallback (displays underneath the buttons in the same card) */}
            {!isIOS && showAndroidTip && (
              <p
                style={{
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'var(--brand-accent)',
                  textAlign: 'center',
                  margin: '8px 0 0 0',
                  animation: 'pwa-fade-in 0.2s ease forwards',
                }}
              >
                Tip: Tap your browser's menu (<strong>⋮</strong> or <strong>⋯</strong>) and select <strong>Add to Home Screen</strong>.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pwa-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pwa-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (min-width: 769px) {
          /* Hide on desktop size */
          .pwa-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
