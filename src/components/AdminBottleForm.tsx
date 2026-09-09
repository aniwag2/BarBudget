'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { BottleView } from '@/lib/bottles';

type Category = { id: number; name: string };
type AffiliateRow = { retailerName: string; affiliateNetwork: string; url: string; trackingId: string; isAffiliate: boolean };
type SourceRow = { label: string; url: string };

function toStr(v: number | null | undefined): string {
  return v === null || v === undefined ? '' : String(v);
}

export default function AdminBottleForm({
  categories,
  bottle,
}: {
  categories: Category[];
  bottle?: BottleView;
}) {
  const router = useRouter();
  const isEdit = !!bottle;

  const [form, setForm] = useState({
    categoryId: bottle?.categoryId ?? categories[0]?.id ?? 0,
    name: bottle?.name ?? '',
    brand: bottle?.brand ?? '',
    abv: toStr(bottle?.abv),
    sizeMl: toStr(bottle?.sizeMl ?? 750),
    cocktaildbIngredientName: bottle?.cocktaildbIngredientName ?? '',
    expertScore: toStr(bottle?.expertScore),
    expertSummary: bottle?.expertSummary ?? '',
    priceLow: toStr(bottle?.priceLow),
    priceHigh: toStr(bottle?.priceHigh),
    priceSource: bottle?.priceSource ?? 'manual',
    budgetTier: bottle?.budgetTier ?? 'mid',
    trending: bottle?.trending ?? false,
    imageUrl: bottle?.imageUrl ?? '',
  });
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>(
    bottle?.affiliateLinks.map((a) => ({
      retailerName: a.retailerName,
      affiliateNetwork: a.affiliateNetwork ?? '',
      url: a.url,
      trackingId: '',
      isAffiliate: a.isAffiliate,
    })) ?? [],
  );
  const [sources, setSources] = useState<SourceRow[]>(bottle?.sourceLinks ?? []);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError('');
    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name,
      brand: form.brand || null,
      abv: form.abv === '' ? null : Number(form.abv),
      sizeMl: form.sizeMl === '' ? null : Number(form.sizeMl),
      cocktaildbIngredientName: form.cocktaildbIngredientName || null,
      expertScore: form.expertScore === '' ? null : Number(form.expertScore),
      expertSummary: form.expertSummary || null,
      sourceLinks: sources.filter((s) => s.url),
      priceLow: form.priceLow === '' ? null : Number(form.priceLow),
      priceHigh: form.priceHigh === '' ? null : Number(form.priceHigh),
      priceSource: form.priceSource,
      budgetTier: form.budgetTier,
      trending: form.trending,
      imageUrl: form.imageUrl || null,
      affiliateLinks: affiliates
        .filter((a) => a.retailerName && a.url)
        .map((a) => ({
          retailerName: a.retailerName,
          affiliateNetwork: a.affiliateNetwork || null,
          url: a.url,
          trackingId: a.trackingId || null,
          isAffiliate: a.isAffiliate,
        })),
    };

    const res = await fetch(isEdit ? `/api/admin/bottles/${bottle!.id}` : '/api/admin/bottles', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus('error');
      setError(data.error || 'Save failed');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  async function remove() {
    if (!bottle || !confirm('Delete this bottle?')) return;
    await fetch(`/api/admin/bottles/${bottle.id}`, { method: 'DELETE' });
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.categoryId} onChange={(e) => set('categoryId', Number(e.target.value))}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Budget tier</label>
          <select className="input" value={form.budgetTier} onChange={(e) => set('budgetTier', e.target.value as typeof form.budgetTier)}>
            <option value="budget">Budget</option>
            <option value="mid">Mid-range</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Brand</label>
          <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
        </div>
        <div>
          <label className="label">ABV %</label>
          <input className="input" type="number" step="0.1" value={form.abv} onChange={(e) => set('abv', e.target.value)} />
        </div>
        <div>
          <label className="label">Size (ml)</label>
          <input className="input" type="number" value={form.sizeMl} onChange={(e) => set('sizeMl', e.target.value)} />
        </div>
        <div>
          <label className="label">Expert score (0–10)</label>
          <input className="input" type="number" step="0.1" min="0" max="10" value={form.expertScore} onChange={(e) => set('expertScore', e.target.value)} />
        </div>
        <div>
          <label className="label">TheCocktailDB ingredient name</label>
          <input className="input" value={form.cocktaildbIngredientName} onChange={(e) => set('cocktaildbIngredientName', e.target.value)} placeholder="e.g. Campari" />
        </div>
        <div>
          <label className="label">Price low</label>
          <input className="input" type="number" step="0.01" value={form.priceLow} onChange={(e) => set('priceLow', e.target.value)} />
        </div>
        <div>
          <label className="label">Price high</label>
          <input className="input" type="number" step="0.01" value={form.priceHigh} onChange={(e) => set('priceHigh', e.target.value)} />
        </div>
        <div>
          <label className="label">Price source</label>
          <select className="input" value={form.priceSource} onChange={(e) => set('priceSource', e.target.value as typeof form.priceSource)}>
            <option value="manual">manual</option>
            <option value="feed">feed</option>
          </select>
        </div>
        <div>
          <label className="label">Image URL</label>
          <input className="input" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
        <input type="checkbox" className="accent-amber-600" checked={form.trending} onChange={(e) => set('trending', e.target.checked)} />
        Trending
      </label>

      <div>
        <label className="label">Expert summary (original writing only)</label>
        <textarea className="input min-h-[100px]" value={form.expertSummary} onChange={(e) => set('expertSummary', e.target.value)} />
      </div>

      {/* Affiliate links */}
      <fieldset className="card p-4">
        <legend className="px-1 text-sm font-semibold text-amber-800 dark:text-amber-200">Affiliate / retailer links</legend>
        {affiliates.map((a, i) => (
          <div key={i} className="mt-2 grid gap-2 sm:grid-cols-4">
            <input className="input" placeholder="Retailer" value={a.retailerName} onChange={(e) => updateRow(setAffiliates, i, { retailerName: e.target.value })} />
            <input className="input" placeholder="Network" value={a.affiliateNetwork} onChange={(e) => updateRow(setAffiliates, i, { affiliateNetwork: e.target.value })} />
            <input className="input" placeholder="URL" value={a.url} onChange={(e) => updateRow(setAffiliates, i, { url: e.target.value })} />
            <div className="flex gap-1">
              <input className="input" placeholder="Tracking ID" value={a.trackingId} onChange={(e) => updateRow(setAffiliates, i, { trackingId: e.target.value })} />
              <button type="button" className="btn-ghost" onClick={() => setAffiliates((rows) => rows.filter((_, j) => j !== i))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-ghost mt-3" onClick={() => setAffiliates((rows) => [...rows, { retailerName: '', affiliateNetwork: '', url: '', trackingId: '', isAffiliate: true }])}>
          + Add link
        </button>
      </fieldset>

      {/* Source links (attribution only) */}
      <fieldset className="card p-4">
        <legend className="px-1 text-sm font-semibold text-amber-800 dark:text-amber-200">Source links (attribution only)</legend>
        {sources.map((s, i) => (
          <div key={i} className="mt-2 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input className="input" placeholder="Label" value={s.label} onChange={(e) => updateRow(setSources, i, { label: e.target.value })} />
            <input className="input" placeholder="URL" value={s.url} onChange={(e) => updateRow(setSources, i, { url: e.target.value })} />
            <button type="button" className="btn-ghost" onClick={() => setSources((rows) => rows.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn-ghost mt-3" onClick={() => setSources((rows) => [...rows, { label: '', url: '' }])}>
          + Add source
        </button>
      </fieldset>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-3">
        <button className="btn-primary" type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : isEdit ? 'Save changes' : 'Create bottle'}
        </button>
        {isEdit ? <button type="button" className="btn-ghost text-red-700" onClick={remove}>Delete</button> : null}
      </div>
    </form>
  );
}

function updateRow<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, patch: Partial<T>) {
  setter((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
}
