'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export type ChipIngredient = {
  name: string;
  measure: string | null;
  isAlcoholic: boolean;
  // How many catalog bottles can fill this ingredient. When > 0 we link to the
  // catalog filtered by the ingredient so the shopper sees every option.
  shopCount: number;
};

export default function IngredientChips({ ingredients }: { ingredients: ChipIngredient[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function applyFilter() {
    const list = [...selected];
    if (list.length === 0) return;
    router.push(`/cocktails?i=${encodeURIComponent(list.join(','))}`);
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {ingredients.map((ing) => {
          const active = selected.has(ing.name);
          return (
            <li key={ing.name} className="flex items-center gap-1">
              {ing.isAlcoholic ? (
                <button
                  type="button"
                  onClick={() => toggle(ing.name)}
                  className={active ? 'chip-alc-active' : 'chip-alc'}
                  aria-pressed={active}
                  title="Select to filter cocktails by this spirit"
                >
                  {ing.name}
                  {ing.measure ? <span className="opacity-70">· {ing.measure}</span> : null}
                </button>
              ) : (
                <span className="chip-plain" title="Non-alcoholic ingredient">
                  {ing.name}
                  {ing.measure ? <span className="opacity-70">· {ing.measure}</span> : null}
                </span>
              )}
              {ing.shopCount > 0 ? (
                <Link
                  href={`/catalog?ingredient=${encodeURIComponent(ing.name)}`}
                  className="text-xs text-amber-600 underline dark:text-amber-300"
                  title={`See ${ing.shopCount} bottle${ing.shopCount === 1 ? '' : 's'} for ${ing.name}`}
                >
                  shop {ing.shopCount}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center gap-3">
        <button className="btn-primary" onClick={applyFilter} disabled={selected.size === 0}>
          Find cocktails with {selected.size || 'these'} selected
        </button>
        {selected.size > 0 ? (
          <button className="btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-amber-400 dark:text-amber-500">
        Click the highlighted (alcoholic) ingredients to filter. Selecting several finds cocktails
        that use all of them.
      </p>
    </div>
  );
}
