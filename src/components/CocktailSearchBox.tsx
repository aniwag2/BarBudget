'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CocktailSearchBox({ initial = '' }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/cocktails?s=${encodeURIComponent(trimmed)}` : '/cocktails');
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="input"
        placeholder="Search cocktails by name (e.g. Margarita)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search cocktails by name"
      />
      <button className="btn-primary" type="submit">Search</button>
    </form>
  );
}
