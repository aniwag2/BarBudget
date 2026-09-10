import Link from 'next/link';
import Image from 'next/image';
import CocktailSearchBox from '@/components/CocktailSearchBox';
import { searchCocktailsByName, filterByIngredients, type CocktailSummary } from '@/lib/cocktaildb';

export const dynamic = 'force-dynamic';

type SearchParams = { [key: string]: string | string[] | undefined };
function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CocktailsPage({ searchParams }: { searchParams: SearchParams }) {
  const s = str(searchParams.s)?.trim();
  const iParam = str(searchParams.i)?.trim();
  const ingredients = iParam ? iParam.split(',').map((x) => x.trim()).filter(Boolean) : [];

  let results: CocktailSummary[] = [];
  let heading = 'Search cocktails';
  if (ingredients.length > 0) {
    results = await filterByIngredients(ingredients);
    heading = `Cocktails with ${ingredients.join(' + ')}`;
  } else if (s) {
    results = await searchCocktailsByName(s);
    heading = `Results for “${s}”`;
  }

  function removeIngredientHref(remove: string): string {
    const rest = ingredients.filter((i) => i !== remove);
    return rest.length ? `/cocktails?i=${encodeURIComponent(rest.join(','))}` : '/cocktails';
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div>
        <h1 className="font-display text-3xl font-bold text-amber-900 dark:text-amber-100">Cocktails</h1>
        <p className="mt-1 text-amber-600 dark:text-amber-300">
          Search by name, or filter by the spirits you have on hand. Data from TheCocktailDB.
        </p>

        <div className="mt-4">
          <CocktailSearchBox initial={s ?? ''} />
        </div>

        {ingredients.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-amber-600 dark:text-amber-300">Filtering by (AND):</span>
            {ingredients.map((i) => (
              <Link key={i} href={removeIngredientHref(i)} className="chip-alc-active">
                {i} ✕
              </Link>
            ))}
          </div>
        ) : null}

        <h2 className="mt-6 font-display text-xl font-semibold text-amber-900 dark:text-amber-100">{heading}</h2>
        {results.length === 0 ? (
          <p className="mt-2 text-amber-500 dark:text-amber-400">
            {s || ingredients.length
              ? 'No cocktails found. Try a different name or fewer ingredients.'
              : 'Start by searching for a cocktail above, or open a bottle to filter by its spirit.'}
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {results.map((c) => (
              <li key={c.id}>
                <Link href={`/cocktails/${c.id}`} className="card block overflow-hidden hover:shadow-md">
                  {c.thumb ? (
                    <Image src={c.thumb} alt={c.name} width={300} height={300} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="aspect-square w-full bg-amber-100 dark:bg-amber-800" />
                  )}
                  <div className="p-2 text-sm font-medium text-amber-900 dark:text-amber-100">{c.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <h3 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">
            Stock the bar for these
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
            Found a drink you like? Our catalog and guides help you buy the right bottle for it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/catalog" className="btn-ghost text-sm">Browse catalog</Link>
            <Link href="/guides" className="btn-ghost text-sm">Read guides</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
