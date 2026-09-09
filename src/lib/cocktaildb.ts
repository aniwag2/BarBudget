// TheCocktailDB client with a server-side cache table so public traffic doesn't
// burn the API key's quota or trip rate limits.
//
// NOTE: the premium/supporter base URL + key path can differ from the free tier
// (`/api/json/v1/1/`). We build the base as `${COCKTAILDB_BASE_URL}/${KEY}`.
// Confirm the exact premium format from your account dashboard and adjust
// COCKTAILDB_BASE_URL if needed. The public test key "1" works for development.
import { prisma } from './prisma';

const BASE_URL = process.env.COCKTAILDB_BASE_URL || 'https://www.thecocktaildb.com/api/json/v1';
const API_KEY = process.env.COCKTAILDB_API_KEY || '1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h

export type CocktailSummary = {
  id: string;
  name: string;
  thumb: string | null;
};

export type CocktailIngredient = {
  name: string;
  measure: string | null;
};

export type CocktailDetail = CocktailSummary & {
  category: string | null;
  glass: string | null;
  instructions: string | null;
  ingredients: CocktailIngredient[];
};

function endpoint(path: string): string {
  return `${BASE_URL}/${API_KEY}/${path}`;
}

// Cached GET against TheCocktailDB. Results are stored in cocktail_api_cache
// keyed by the request path; a pg_cron job prunes stale rows.
async function cachedFetch<T>(path: string): Promise<T | null> {
  const cacheKey = path;
  const cached = await prisma.cocktailApiCache.findUnique({ where: { cacheKey } });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    return cached.payload as T;
  }

  try {
    const res = await fetch(endpoint(path), {
      headers: { Accept: 'application/json' },
      // Also leverage Next's fetch cache as a second layer.
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`TheCocktailDB ${res.status}`);
    const data = (await res.json()) as T;
    await prisma.cocktailApiCache.upsert({
      where: { cacheKey },
      update: { payload: data as object, fetchedAt: new Date() },
      create: { cacheKey, payload: data as object },
    });
    return data;
  } catch (err) {
    // On upstream failure, fall back to any stale cached copy.
    if (cached) return cached.payload as T;
    console.error('[cocktaildb] fetch failed', path, err);
    return null;
  }
}

type RawDrink = Record<string, string | null> & { idDrink: string; strDrink: string };

function toSummary(d: RawDrink): CocktailSummary {
  return { id: d.idDrink, name: d.strDrink, thumb: d.strDrinkThumb ?? null };
}

function toDetail(d: RawDrink): CocktailDetail {
  const ingredients: CocktailIngredient[] = [];
  for (let i = 1; i <= 15; i++) {
    const name = (d[`strIngredient${i}`] || '').trim();
    if (!name) continue;
    const measure = (d[`strMeasure${i}`] || '').trim();
    ingredients.push({ name, measure: measure || null });
  }
  return {
    id: d.idDrink,
    name: d.strDrink,
    thumb: d.strDrinkThumb ?? null,
    category: d.strCategory ?? null,
    glass: d.strGlass ?? null,
    instructions: d.strInstructions ?? null,
    ingredients,
  };
}

export async function searchCocktailsByName(query: string): Promise<CocktailSummary[]> {
  const data = await cachedFetch<{ drinks: RawDrink[] | null }>(
    `search.php?s=${encodeURIComponent(query)}`,
  );
  return (data?.drinks ?? []).map(toSummary);
}

export async function getCocktailById(id: string): Promise<CocktailDetail | null> {
  const data = await cachedFetch<{ drinks: RawDrink[] | null }>(
    `lookup.php?i=${encodeURIComponent(id)}`,
  );
  const drink = data?.drinks?.[0];
  return drink ? toDetail(drink) : null;
}

// Single or multi-ingredient AND filter. The multi-ingredient form
// (filter.php?i=A,B,C) is a premium endpoint.
export async function filterByIngredients(ingredients: string[]): Promise<CocktailSummary[]> {
  const list = ingredients.map((i) => i.trim()).filter(Boolean);
  if (list.length === 0) return [];
  const param = list.map((i) => encodeURIComponent(i)).join(',');
  const data = await cachedFetch<{ drinks: RawDrink[] | null | 'None Found' }>(
    `filter.php?i=${param}`,
  );
  if (!data || data.drinks === 'None Found' || !Array.isArray(data.drinks)) return [];
  return data.drinks.map(toSummary);
}

// ── Ingredient-cache refresh support ──────────────────────────────────────────
// The alcohol flag / ABV are NOT in the bare ingredient list; that endpoint only
// returns names. Details come from `search.php?i=<name>`. So the refresh job
// lists names, then looks up each one. Both calls bypass the api-cache table
// (the job runs infrequently and writes straight to ingredient_cache).
export type RawIngredientDetail = {
  idIngredient: string;
  strIngredient: string;
  strType: string | null;
  strAlcohol: string | null; // "Yes" | "No" | null
  strABV: string | null;
};

export async function listIngredientNames(): Promise<string[]> {
  const res = await fetch(endpoint('list.php?i=list'), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`TheCocktailDB list.php ${res.status}`);
  const data = (await res.json()) as { drinks: Array<{ strIngredient1: string }> | null };
  return (data.drinks ?? []).map((d) => d.strIngredient1).filter(Boolean);
}

export async function getIngredientDetail(name: string): Promise<RawIngredientDetail | null> {
  const res = await fetch(endpoint(`search.php?i=${encodeURIComponent(name)}`), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TheCocktailDB search.php ${res.status}`);
  const data = (await res.json()) as { ingredients: RawIngredientDetail[] | null };
  return data.ingredients?.[0] ?? null;
}
