'use client';

import { useState, useEffect } from 'react';

export default function PwaInstallModal() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Prevent running on SSR
    if (typeof window === 'undefined') return;

    // 2. Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 3. Check if user previously dismissed it in this session / localStorage
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasDismissed) return;

    // 4. Check user-agent to see if iOS
    const isLocalIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isLocalIOS);

    // 5. Handle prompt for Chrome/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds before prompting so it feels premium and doesn't interrupt instantly
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 6. For iOS: show the modal after 4 seconds (since there is no event to listen to)
    if (isLocalIOS) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 4000);
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
    if (!deferredPrompt) return;
    setShow(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    } else {
      // If rejected, set dismissed so we don't annoy them
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
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
                dividing.app &middot; Free Web App
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
              {!isIOS
                ? 'Install this application on your home screen for quick launch, distraction-free fullscreen view, and reliable offline bible study.'
                : 'Add Dividing to your home screen for a fullscreen layout, offline study access, and quick app launch.'}
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
          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '4px' }}>
            {!isIOS ? (
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
            ) : (
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
          /* Hide on desktop size as requested by user */
          .pwa-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
