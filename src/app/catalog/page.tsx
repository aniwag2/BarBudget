import Link from 'next/link';
import BottleCard from '@/components/BottleCard';
import AdSlot from '@/components/AdSlot';
import { listBottles, listCategories, type BottleFilters } from '@/lib/bottles';
import { CATEGORY_TYPE_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const categoryId = str(searchParams.category) ? Number(str(searchParams.category)) : undefined;
  const budgetTier = str(searchParams.tier);
  const trending = str(searchParams.trending) === '1' ? true : undefined;
  const ingredient = str(searchParams.ingredient);
  const sort = (str(searchParams.sort) as BottleFilters['sort']) || 'name';

  const [bottles, categories] = await Promise.all([
    listBottles({ categoryId, budgetTier, trending, ingredient, sort }),
    listCategories(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-amber-900 dark:text-amber-100">
        {ingredient ? `Bottles for “${ingredient}”` : 'Bottle catalog'}
      </h1>
      <p className="mt-1 text-amber-600 dark:text-amber-300">
        {ingredient
          ? `Every bottle in the catalog that works as “${ingredient}” in a cocktail.`
          : 'Compare bottles by category, budget and rating — useful for home bartenders and bar managers alike.'}
      </p>
      {ingredient ? (
        <div className="mt-3">
          <Link href="/catalog" className="chip-alc-active">Clear “{ingredient}” filter ✕</Link>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          {/* Filter bar (GET form so filters live in the URL) */}
          <form className="card mb-5 flex flex-wrap items-end gap-3 p-4" method="get">
            {ingredient ? <input type="hidden" name="ingredient" value={ingredient} /> : null}
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" name="category" defaultValue={categoryId ?? ''} className="input">
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({CATEGORY_TYPE_LABEL[c.type]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="tier">Budget</label>
              <select id="tier" name="tier" defaultValue={budgetTier ?? ''} className="input">
                <option value="">Any</option>
                <option value="budget">Budget</option>
                <option value="mid">Mid-range</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sort">Sort by</label>
              <select id="sort" name="sort" defaultValue={sort} className="input">
                <option value="name">Name</option>
                <option value="price">Price (low→high)</option>
                <option value="expert">Expert score</option>
                <option value="audience">Audience score</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <input type="checkbox" name="trending" value="1" defaultChecked={!!trending} className="accent-amber-600" />
              Trending only
            </label>
            <button className="btn-primary" type="submit">Apply</button>
            <Link href="/catalog" className="btn-ghost">Reset</Link>
          </form>

          {bottles.length === 0 ? (
            <p className="text-amber-500 dark:text-amber-400">No bottles match these filters.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bottles.map((b, i) => (
                <div key={b.id} className="contents">
                  <BottleCard bottle={b} />
                  {/* In-feed ad after the 4th card */}
                  {i === 3 ? (
                    <div className="sm:col-span-2">
                      <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED} label="in-feed" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} label="sidebar" className="min-h-[250px]" />
        </aside>
      </div>
    </div>
  );
}
