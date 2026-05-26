import type { Metadata } from 'next';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Dividing — AI-Powered Bible Study',
  description:
    'Deeply understand scripture through AI-powered contextual, theological, and scholarly insights. Paste any Bible verse and get instant study breakdowns.',
  keywords: 'Bible study, scripture, AI, theology, Greek words, cross references, commentaries',
  openGraph: {
    title: 'Dividing — AI-Powered Bible Study',
    description: 'Deeply understand scripture with AI-powered insights.',
    type: 'website',
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
      </head>
      <body>
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
          <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <a
              href="https://2timothy2-15.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}
            >
              2 Tim 2:15
            </a>
          </div>
        </nav>

        {/* Main content */}
        <main
          style={{
            position: 'relative',
            paddingTop: '60px',
            minHeight: '100vh',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
