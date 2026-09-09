'use client';

import { useState } from 'react';

export default function RatingForm({
  bottleId,
  initialAverage,
  initialCount,
}: {
  bottleId: number;
  initialAverage: number | null;
  initialCount: number;
}) {
  const [value, setValue] = useState(7.5);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function submit() {
    setStatus('saving');
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bottleId, score: value }),
      });
      if (!res.ok) throw new Error('failed');
      const data = (await res.json()) as { average: number | null; count: number };
      setAverage(data.average);
      setCount(data.count);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="card p-4">
      <h3 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">Rate this bottle</h3>
      <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">
        Audience score: <strong>{average === null ? '—' : average.toFixed(1)}</strong> / 10
        {count > 0 ? ` (${count} vote${count === 1 ? '' : 's'})` : ''}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="flex-1 accent-amber-600"
          aria-label="Your score"
        />
        <span className="w-10 text-right font-bold text-amber-800 dark:text-amber-200">{value.toFixed(1)}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="btn-primary" onClick={submit} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Submit rating'}
        </button>
        {status === 'done' ? <span className="text-sm text-green-700">Thanks for voting!</span> : null}
        {status === 'error' ? <span className="text-sm text-red-700">Something went wrong.</span> : null}
      </div>
      <p className="mt-2 text-xs text-amber-400 dark:text-amber-500">One vote per browser; submitting again updates yours.</p>
    </div>
  );
}
