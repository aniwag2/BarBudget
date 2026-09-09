'use client';

import { useEffect } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// A single AdSense display slot. Renders nothing if the publisher/slot IDs are
// not configured, so local/dev builds stay clean. Placeholder shown in dev.
export default function AdSlot({
  slotId,
  className,
  label = 'Advertisement',
}: {
  slotId?: string;
  className?: string;
  label?: string;
}) {
  useEffect(() => {
    if (CLIENT_ID && slotId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* AdSense not ready */
      }
    }
  }, [slotId]);

  if (!CLIENT_ID || !slotId) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-amber-300 dark:border-amber-700 bg-amber-100/50 dark:bg-amber-900/40 p-6 text-xs uppercase tracking-wide text-amber-400 dark:text-amber-500 ${className ?? ''}`}
      >
        Ad slot ({label})
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      aria-label={label}
    />
  );
}
