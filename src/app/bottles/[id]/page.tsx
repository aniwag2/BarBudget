import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBottle } from '@/lib/bottles';
import { filterByIngredients } from '@/lib/cocktaildb';
import { money, score, BUDGET_TIER_LABEL, CATEGORY_TYPE_LABEL } from '@/lib/format';
import RatingForm from '@/components/RatingForm';
import AdSlot from '@/components/AdSlot';

export const dynamic = 'force-dynamic';

export default async function BottleDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const bottle = await getBottle(id);
  if (!bottle) notFound();

  const cocktails = bottle.cocktaildbIngredientName
    ? await filterByIngredients([bottle.cocktaildbIngredientName])
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <Link href="/catalog" className="text-sm text-amber-600 dark:text-amber-300 hover:underline">← Back to catalog</Link>

        <div className="mt-2 flex flex-wrap items-start gap-2">
          <div className="flex-1">
            <div className="text-xs font-medium uppercase tracking-wide text-amber-500 dark:text-amber-400">
              {bottle.categoryName} · {CATEGORY_TYPE_LABEL[bottle.categoryType]}
            </div>
            <h1 className="font-display text-3xl font-bold text-amber-900 dark:text-amber-100">
              {bottle.brand ? `${bottle.brand} — ` : ''}
              {bottle.name}
            </h1>
            <div className="mt-1 text-sm text-amber-600 dark:text-amber-300">
              {bottle.abv ? `${bottle.abv}% ABV` : ''}
              {bottle.sizeMl ? ` · ${bottle.sizeMl} ml` : ''}
              {' · '}
              <span className="rounded-full bg-amber-100 dark:bg-amber-800 px-2 py-0.5">{BUDGET_TIER_LABEL[bottle.budgetTier]}</span>
              {bottle.trending ? <span className="ml-1 rounded-full bg-amber-600 px-2 py-0.5 text-white">Trending</span> : null}
            </div>
          </div>
          {bottle.imageUrl ? (
            <Image src={bottle.imageUrl} alt={bottle.name} width={120} height={160} className="rounded-lg object-cover" />
          ) : null}
        </div>

        {/* Scores */}
        <div className="mt-4 flex gap-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">Expert score</div>
            <div className="font-display text-3xl font-bold text-amber-800 dark:text-amber-200">{score(bottle.expertScore)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">Audience score</div>
            <div className="font-display text-3xl font-bold text-amber-800 dark:text-amber-200">
              {score(bottle.audienceScore)}
              <span className="ml-1 text-sm font-normal text-amber-500 dark:text-amber-400">({bottle.audienceCount})</span>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">Price</div>
            <div className="font-display text-3xl font-bold text-amber-800 dark:text-amber-200">
              {money(bottle.priceLow)}
              {bottle.priceHigh && bottle.priceHigh !== bottle.priceLow ? (
                <span className="text-lg">–{money(bottle.priceHigh)}</span>
              ) : null}
            </div>
          </div>
        </div>

        {bottle.expertSummary ? (
          <div className="mt-4 card p-4">
            <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">Our take</h2>
            <p className="mt-1 text-amber-800 dark:text-amber-200">{bottle.expertSummary}</p>
            {bottle.sourceLinks.length > 0 ? (
              <p className="mt-3 text-xs text-amber-500 dark:text-amber-400">
                References:{' '}
                {bottle.sourceLinks.map((s, i) => (
                  <span key={i}>
                    {i > 0 ? ' · ' : ''}
                    <a href={s.url} target="_blank" rel="noopener" className="underline">{s.label}</a>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Buy links */}
        <div className="mt-4 card p-4">
          <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">Where to buy</h2>
          <p className="text-xs text-amber-500 dark:text-amber-400">
            Last price check: {bottle.priceUpdatedAt ? new Date(bottle.priceUpdatedAt).toLocaleDateString() : 'n/a'}
            {' · '}source: {bottle.priceSource}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bottle.affiliateLinks.length === 0 ? (
              <span className="text-sm text-amber-500 dark:text-amber-400">No retailer links yet.</span>
            ) : (
              bottle.affiliateLinks.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="nofollow sponsored noopener" className="btn-primary text-sm">
                  Buy at {a.retailerName} ↗
                </a>
              ))
            )}
          </div>
          <p className="mt-2 text-xs text-amber-400 dark:text-amber-500">
            We don&rsquo;t sell alcohol — these links take you to the retailer&rsquo;s own site to purchase.
          </p>
        </div>

        {/* Used in cocktails */}
        <div className="mt-4 card p-4">
          <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">
            Used in these cocktails
          </h2>
          {cocktails.length === 0 ? (
            <p className="mt-1 text-sm text-amber-500 dark:text-amber-400">
              {bottle.cocktaildbIngredientName
                ? 'No matching cocktails found right now.'
                : 'This bottle isn’t linked to a cocktail ingredient yet.'}
            </p>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cocktails.slice(0, 12).map((c) => (
                <li key={c.id}>
                  <Link href={`/cocktails/${c.id}`} className="block rounded-lg border border-amber-200 dark:border-amber-800 p-2 text-sm hover:bg-amber-50">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <RatingForm bottleId={bottle.id} initialAverage={bottle.audienceScore} initialCount={bottle.audienceCount} />
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} label="sidebar" className="min-h-[250px]" />
      </aside>
    </div>
  );
}
