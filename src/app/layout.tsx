import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Providers from '@/components/Providers';
import AgeGate from '@/components/AgeGate';
import Nav from '@/components/Nav';

// Baked in at build time (NEXT_PUBLIC_*), passed via Docker build arg.
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
// Read at runtime (server-rendered), so no rebuild needed to change it.
const FO_VERIFY = process.env.FO_VERIFY;

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
        {/* FlexOffers ownership verification (meta-tag method). */}
        {FO_VERIFY ? <meta name="fo-verify" content={FO_VERIFY} /> : null}
        {/* Google AdSense verification / ad serving. Rendered as a real <head>
            script so the AdSense crawler reliably finds it on every page. */}
        {ADSENSE_CLIENT_ID ? (
          <script
            async
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
            <div className="mx-auto max-w-6xl px-4 py-6">
              <nav className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-amber-700 dark:text-amber-200">
                <Link href="/" className="hover:underline">Build my bar</Link>
                <Link href="/catalog" className="hover:underline">Catalog</Link>
                <Link href="/cocktails" className="hover:underline">Cocktails</Link>
                <Link href="/guides" className="hover:underline">Guides</Link>
                <Link href="/about" className="hover:underline">About &amp; disclosures</Link>
              </nav>
              <p className="text-xs text-amber-500 dark:text-amber-400">
                BarBudget provides information and price comparisons only. We do not sell alcohol;
                all purchases happen on the retailer&rsquo;s own site. Some links are affiliate
                links and we may earn a commission at no cost to you. Please drink responsibly. You
                must be of legal drinking age to use this site.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
