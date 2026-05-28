import type { Metadata } from 'next';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import PwaInstallModal from '@/components/PwaInstallModal';

export const metadata: Metadata = {
  metadataBase: new URL('https://dividing.vercel.app'),
  title: 'Dividing — AI-Powered Bible Study',
  description:
    'Deeply understand scripture through AI-powered contextual, theological, and scholarly insights. Paste any Bible verse and get instant study breakdowns.',
  keywords: 'Bible study, scripture analysis, AI Bible study, theology, Greek word study, Hebrew word study, cross references, commentaries, Wuest commentary, 2 Timothy 2:15, verse analysis, Bible breakdown',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dividing — AI-Powered Bible Study',
    description:
      'Deeply understand scripture through AI-powered contextual, theological, and scholarly insights. Paste any Bible verse and get instant study breakdowns.',
    url: 'https://dividing.vercel.app',
    siteName: 'Dividing',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Dividing Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dividing — AI-Powered Bible Study',
    description:
      'Deeply understand scripture through AI-powered contextual, theological, and scholarly insights. Paste any Bible verse and get instant study breakdowns.',
    images: ['/icon-512.png'],
    creator: '@ayodejilemo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'light') {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) {
                      console.log('Service Worker registered with scope:', reg.scope);
                    },
                    function(err) {
                      console.error('Service Worker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        {/* JSON-LD Structured Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              'name': 'Dividing',
              'url': 'https://dividing.vercel.app',
              'description': 'Deeply understand scripture through AI-powered contextual, theological, and scholarly insights. Paste any Bible verse and get instant study breakdowns.',
              'applicationCategory': 'EducationalApplication',
              'operatingSystem': 'All',
              'browserRequirements': 'Requires HTML5 compatible browser',
              'creator': {
                '@type': 'Person',
                'name': 'Ayodeji Lemo',
                'url': 'https://ayodeji-lemo-portfolio.vercel.app/'
              },
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD'
              }
            }),
          }}
        />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        {/* Navigation */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-mid)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '32px' }}>
            <img
              src="/logo.png"
              alt="Dividing Logo"
              style={{
                height: '20px',
                width: 'auto',
                display: 'block',
                opacity: 0.95,
                filter: 'var(--logo-filter)',
              }}
            />
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 500,
                borderLeft: '1px solid var(--border-mid)',
                paddingLeft: '12px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              2 Tim 2:15
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
          </div>
        </nav>

        {/* Main content */}
        <main
          style={{
            position: 'relative',
            paddingTop: '60px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-page)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            transition: 'background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease',
            zIndex: 10,
          }}
        >
          <span>
            Designed and Built by{' '}
            <a
              href="https://ayodeji-lemo-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{
                color: 'var(--brand-accent)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
            >
              Ayodeji Lemo
            </a>
            .
          </span>
        </footer>
        <PwaInstallModal />
      </body>
    </html>
  );
}
