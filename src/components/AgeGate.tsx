'use client';

import { useEffect, useState } from 'react';

const COOKIE = 'bb_age_ok';

function hasCookie(): boolean {
  if (typeof document === 'undefined') return true;
  return document.cookie.split('; ').some((c) => c.startsWith(`${COOKIE}=`));
}

// Self-declared age gate — standard for alcohol-related sites and a prerequisite
// for opting into alcohol-category ads. Cookie-based, shown once per browser.
export default function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasCookie()) setOpen(true);
  }, []);

  function confirm() {
    // ~1 year, site-wide.
    document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/70 p-4">
      <div className="card max-w-md p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-amber-900 dark:text-amber-100">Are you 21 or older?</h2>
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-200">
          BarBudget contains information about alcoholic beverages. You must be of legal drinking
          age in your location to enter.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-primary" onClick={confirm}>
            Yes, I&rsquo;m 21+
          </button>
          <a className="btn-ghost" href="https://www.responsibility.org/">
            No
          </a>
        </div>
        <p className="mt-4 text-xs text-amber-500 dark:text-amber-400">Please enjoy responsibly.</p>
      </div>
    </div>
  );
}
