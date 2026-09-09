import Link from 'next/link';
import type { BottleView } from '@/lib/bottles';
import { money, score, BUDGET_TIER_LABEL } from '@/lib/format';

export function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-amber-100 dark:bg-amber-800 px-2 py-1">
      <span className="text-[10px] uppercase tracking-wide text-amber-500 dark:text-amber-400">{label}</span>
      <span className="text-sm font-bold text-amber-800 dark:text-amber-200">{value}</span>
    </div>
  );
}

export default function BottleCard({ bottle }: { bottle: BottleView }) {
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-amber-500 dark:text-amber-400">
            {bottle.categoryName}
          </div>
          <Link href={`/bottles/${bottle.id}`} className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100 hover:underline">
            {bottle.brand ? `${bottle.brand} — ` : ''}
            {bottle.name}
          </Link>
        </div>
        {bottle.trending ? (
          <span className="chip bg-amber-600 text-xs text-white">Trending</span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ScorePill label="Expert" value={score(bottle.expertScore)} />
        <ScorePill label="Audience" value={score(bottle.audienceScore)} />
        <span className="ml-auto rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-1 text-xs text-amber-600 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800">
          {BUDGET_TIER_LABEL[bottle.budgetTier]}
        </span>
      </div>

      <div className="mt-3 text-sm text-amber-700 dark:text-amber-200">
        {money(bottle.priceLow)}
        {bottle.priceHigh && bottle.priceHigh !== bottle.priceLow ? `–${money(bottle.priceHigh)}` : ''}
      </div>

      {bottle.affiliateLinks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {bottle.affiliateLinks.map((a) => (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="btn-ghost text-xs"
            >
              Buy at {a.retailerName} ↗
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
