import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Providers from '@/components/Providers';
import AgeGate from '@/components/AgeGate';
import Nav from '@/components/Nav';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  title: 'BarBudget — build your home bar on a budget',
  description:
    'Figure out which bottles to buy for your home bar by budget, browse cocktails by what you already own, and compare retail prices.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Set the theme class before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {ADSENSE_CLIENT_ID ? (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>
        <Providers>
          <AgeGate />
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-amber-200 bg-white dark:border-amber-800 dark:bg-amber-900">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-amber-500 dark:text-amber-400">
              <p>
                BarBudget provides information and price comparisons only. We do not sell alcohol;
                all purchases happen on the retailer&rsquo;s own site. Some links are affiliate
                links. Please drink responsibly. You must be of legal drinking age to use this site.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
