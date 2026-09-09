'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { BottleView } from '@/lib/bottles';
import { money, score, BUDGET_TIER_LABEL } from '@/lib/format';
import AdSlot from './AdSlot';

type Category = { id: number; name: string; type: string };

const TIERS = ['budget', 'mid', 'premium'] as const;
type Tier = (typeof TIERS)[number];

// Soft spending guidance per tier — used to decide how many supplemental
// bottles to suggest on top of the essentials.
const TIER_BUDGET: Record<Tier, number> = { budget: 150, mid: 300, premium: 600 };

const ESSENTIAL_TYPES = ['base_spirit', 'essential_liqueur'];

function bestBottleForCategory(bottles: BottleView[], categoryId: number, tier: Tier): BottleView | null {
  const inCat = bottles.filter((b) => b.categoryId === categoryId);
  if (inCat.length === 0) return null;
  const inTier = inCat.filter((b) => b.budgetTier === tier);
  const pool = inTier.length > 0 ? inTier : inCat;
  return [...pool].sort((a, b) => (b.expertScore ?? 0) - (a.expertScore ?? 0))[0] ?? null;
}

export default function CalculatorClient({
  bottles,
  categories,
}: {
  bottles: BottleView[];
  categories: Category[];
}) {
  const [tier, setTier] = useState<Tier>('mid');
  const [owned, setOwned] = useState<Set<number>>(new Set());

  const essentialCats = categories.filter((c) => ESSENTIAL_TYPES.includes(c.type));
  const supplementalCats = categories.filter((c) => c.type === 'supplemental');

  const plan = useMemo(() => {
    const cap = TIER_BUDGET[tier];
    const essentials: { category: Category; bottle: BottleView }[] = [];

    for (const cat of essentialCats) {
      if (owned.has(cat.id)) continue;
      const bottle = bestBottleForCategory(bottles, cat.id, tier);
      if (bottle) essentials.push({ category: cat, bottle });
    }
    const essentialsTotal = essentials.reduce((sum, e) => sum + (e.bottle.priceMid ?? 0), 0);

    // Add supplemental picks while we stay within the tier budget.
    const supplemental: { category: Category; bottle: BottleView }[] = [];
    let running = essentialsTotal;
    for (const cat of supplementalCats) {
      if (owned.has(cat.id)) continue;
      const bottle = bestBottleForCategory(bottles, cat.id, tier);
      if (!bottle) continue;
      const price = bottle.priceMid ?? 0;
      if (running + price <= cap) {
        supplemental.push({ category: cat, bottle });
        running += price;
      }
    }

    return { cap, essentials, essentialsTotal, supplemental, total: running };
  }, [tier, owned, bottles, essentialCats, supplementalCats]);

  function toggleOwned(id: number) {
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const withinBudget = plan.total <= plan.cap;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        {/* Controls */}
        <div className="card p-5">
          <h2 className="font-display text-xl font-bold text-amber-900 dark:text-amber-100">1. Pick your budget</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={t === tier ? 'btn-primary' : 'btn-ghost'}
              >
                {BUDGET_TIER_LABEL[t]} · up to {money(TIER_BUDGET[t])}
              </button>
            ))}
          </div>

          <h2 className="mt-6 font-display text-xl font-bold text-amber-900 dark:text-amber-100">
            2. What do you already own?
          </h2>
          <p className="text-sm text-amber-600 dark:text-amber-300">Check categories to leave them off your list.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[...essentialCats, ...supplementalCats].map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-900 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="accent-amber-600"
                  checked={owned.has(c.id)}
                  onChange={() => toggleOwned(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        {/* Results */}
        <h2 className="mt-6 font-display text-xl font-bold text-amber-900 dark:text-amber-100">3. Your shopping list</h2>
        <PlanSection title="Essentials" items={plan.essentials} />
        {plan.supplemental.length > 0 ? (
          <PlanSection title="Add these if budget allows" items={plan.supplemental} />
        ) : null}

        <div className="mt-4">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} label="calculator results" />
        </div>
      </div>

      {/* Running total */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="card p-5">
          <div className="text-sm uppercase tracking-wide text-amber-500 dark:text-amber-400">Estimated total</div>
          <div className="mt-1 font-display text-4xl font-bold text-amber-900 dark:text-amber-100">
            {money(plan.total)}
          </div>
          <div className="mt-1 text-sm text-amber-600 dark:text-amber-300">
            of {money(plan.cap)} {BUDGET_TIER_LABEL[tier].toLowerCase()} budget
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-800">
            <div
              className={`h-full ${withinBudget ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (plan.total / plan.cap) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-amber-500 dark:text-amber-400">
            Totals use the midpoint of each bottle&rsquo;s price range. Actual prices vary by
            retailer — follow the buy links for live pricing.
          </p>
          <div className="mt-4 text-sm text-amber-700 dark:text-amber-200">
            {plan.essentials.length} essential{plan.essentials.length === 1 ? '' : 's'} ·{' '}
            {plan.supplemental.length} extra{plan.supplemental.length === 1 ? '' : 's'}
          </div>
        </div>
      </aside>
    </div>
  );
}

function PlanSection({
  title,
  items,
}: {
  title: string;
  items: { category: Category; bottle: BottleView }[];
}) {
  if (items.length === 0) {
    return (
      <div className="mt-3 text-sm text-amber-500 dark:text-amber-400">No {title.toLowerCase()} to suggest.</div>
    );
  }
  return (
    <div className="mt-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-500 dark:text-amber-400">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map(({ category, bottle }) => (
          <li key={bottle.id} className="card flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs uppercase tracking-wide text-amber-400 dark:text-amber-500">{category.name}</div>
              <Link href={`/bottles/${bottle.id}`} className="font-medium text-amber-900 dark:text-amber-100 hover:underline">
                {bottle.brand ? `${bottle.brand} — ` : ''}
                {bottle.name}
              </Link>
              <div className="text-xs text-amber-500 dark:text-amber-400">
                Expert {score(bottle.expertScore)} · Audience {score(bottle.audienceScore)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-amber-800 dark:text-amber-200">{money(bottle.priceMid)}</div>
              {bottle.affiliateLinks[0] ? (
                <a
                  href={bottle.affiliateLinks[0].url}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="text-xs text-amber-600 dark:text-amber-300 underline"
                >
                  Buy at {bottle.affiliateLinks[0].retailerName} ↗
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
