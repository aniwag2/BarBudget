'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FeedItem = {
  id: number;
  retailerName: string;
  feedProductName: string;
  price: number;
  matchScore: number | null;
  matchedBottleId: number | null;
};
type BottleOption = { id: number; label: string };

export default function PriceFeedReview({
  items,
  bottles,
}: {
  items: FeedItem[];
  bottles: BottleOption[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function assign(feedItemId: number, bottleId: number | null) {
    setBusy(feedItemId);
    await fetch('/api/admin/price-feed/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedItemId, bottleId, applyPrice: true }),
    });
    setBusy(null);
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="text-amber-500 dark:text-amber-400">Nothing to review — all recent feed rows are matched.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-amber-200 dark:border-amber-800 text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">
        <tr>
          <th className="py-2">Retailer</th>
          <th>Feed product</th>
          <th>Price</th>
          <th>Confidence</th>
          <th>Assign to bottle</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id} className="border-b border-amber-100 dark:border-amber-800 align-top">
            <td className="py-2">{it.retailerName}</td>
            <td className="max-w-xs">{it.feedProductName}</td>
            <td>${it.price.toFixed(2)}</td>
            <td>{it.matchScore !== null ? `${(it.matchScore * 100).toFixed(0)}%` : '—'}</td>
            <td>
              <select
                className="input"
                defaultValue={it.matchedBottleId ?? ''}
                disabled={busy === it.id}
                onChange={(e) => assign(it.id, e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— unmatched —</option>
                {bottles.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
