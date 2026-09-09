import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCocktailById } from '@/lib/cocktaildb';
import { prisma } from '@/lib/prisma';
import IngredientChips, { type ChipIngredient } from '@/components/IngredientChips';
import AdSlot from '@/components/AdSlot';

export const dynamic = 'force-dynamic';

export default async function CocktailDetailPage({ params }: { params: { id: string } }) {
  const cocktail = await getCocktailById(params.id);
  if (!cocktail) notFound();

  // Cross-reference each ingredient against the cached alcohol flag and the
  // catalog (for a "shop this bottle" link). Case-insensitive match.
  const names = cocktail.ingredients.map((i) => i.name);
  const [cacheRows, bottleRows] = await Promise.all([
    prisma.ingredientCache.findMany({
      where: { ingredientName: { in: names } },
      select: { ingredientName: true, isAlcoholic: true },
    }),
    prisma.bottle.groupBy({
      by: ['cocktaildbIngredientName'],
      where: { cocktaildbIngredientName: { in: names } },
      _count: true,
    }),
  ]);

  const alcByName = new Map(cacheRows.map((r) => [r.ingredientName.toLowerCase(), r.isAlcoholic]));
  // How many catalog bottles map to each ingredient (so "shop" lists all options).
  const shopCountByName = new Map(
    bottleRows
      .filter((b) => b.cocktaildbIngredientName)
      .map((b) => [b.cocktaildbIngredientName!.toLowerCase(), b._count]),
  );

  const chips: ChipIngredient[] = cocktail.ingredients.map((ing) => ({
    name: ing.name,
    measure: ing.measure,
    // If we don't have the ingredient cached yet, default to non-alcoholic
    // (plain text) rather than guessing it's a spirit.
    isAlcoholic: alcByName.get(ing.name.toLowerCase()) ?? false,
    shopCount: shopCountByName.get(ing.name.toLowerCase()) ?? 0,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div>
        <Link href="/cocktails" className="text-sm text-amber-600 dark:text-amber-300 hover:underline">← Back to cocktails</Link>
        <div className="mt-2 flex flex-wrap gap-4">
          {cocktail.thumb ? (
            <Image src={cocktail.thumb} alt={cocktail.name} width={240} height={240} className="rounded-xl object-cover" />
          ) : null}
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-amber-900 dark:text-amber-100">{cocktail.name}</h1>
            <div className="mt-1 text-sm text-amber-600 dark:text-amber-300">
              {[cocktail.category, cocktail.glass].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

        <div className="mt-5 card p-4">
          <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">Ingredients</h2>
          <div className="mt-3">
            <IngredientChips ingredients={chips} />
          </div>
        </div>

        {cocktail.instructions ? (
          <div className="mt-4 card p-4">
            <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">Instructions</h2>
            <p className="mt-1 whitespace-pre-line text-amber-800 dark:text-amber-200">{cocktail.instructions}</p>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} label="sidebar" className="min-h-[250px]" />
      </aside>
    </div>
  );
}
