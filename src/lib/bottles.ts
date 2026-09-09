import { prisma } from './prisma';
import { num, priceMidpoint, parseSourceLinks, type SourceLink } from './format';
import type { Prisma } from '@prisma/client';

export type AffiliateView = {
  id: number;
  retailerName: string;
  affiliateNetwork: string | null;
  url: string;
  isAffiliate: boolean;
};

export type BottleView = {
  id: number;
  name: string;
  brand: string | null;
  categoryId: number;
  categoryName: string;
  categoryType: string;
  abv: number | null;
  sizeMl: number | null;
  cocktaildbIngredientName: string | null;
  expertScore: number | null;
  expertSummary: string | null;
  sourceLinks: SourceLink[];
  priceLow: number | null;
  priceHigh: number | null;
  priceMid: number | null;
  priceSource: string;
  priceUpdatedAt: string | null;
  budgetTier: string;
  trending: boolean;
  imageUrl: string | null;
  audienceScore: number | null;
  audienceCount: number;
  affiliateLinks: AffiliateView[];
};

type BottleWithRelations = Prisma.BottleGetPayload<{
  include: { category: true; affiliateLinks: true };
}>;

function toView(b: BottleWithRelations, audienceScore: number | null, audienceCount: number): BottleView {
  const priceLow = num(b.priceLow);
  const priceHigh = num(b.priceHigh);
  return {
    id: b.id,
    name: b.name,
    brand: b.brand,
    categoryId: b.categoryId,
    categoryName: b.category.name,
    categoryType: b.category.type,
    abv: num(b.abv),
    sizeMl: b.sizeMl,
    cocktaildbIngredientName: b.cocktaildbIngredientName,
    expertScore: num(b.expertScore),
    expertSummary: b.expertSummary,
    sourceLinks: parseSourceLinks(b.sourceLinks),
    priceLow,
    priceHigh,
    priceMid: priceMidpoint(priceLow, priceHigh),
    priceSource: b.priceSource,
    priceUpdatedAt: b.priceUpdatedAt ? b.priceUpdatedAt.toISOString() : null,
    budgetTier: b.budgetTier,
    trending: b.trending,
    imageUrl: b.imageUrl,
    audienceScore,
    audienceCount,
    affiliateLinks: b.affiliateLinks.map((a) => ({
      id: a.id,
      retailerName: a.retailerName,
      affiliateNetwork: a.affiliateNetwork,
      url: a.url,
      isAffiliate: a.isAffiliate,
    })),
  };
}

async function audienceMap(bottleIds: number[]): Promise<Map<number, { avg: number | null; count: number }>> {
  const map = new Map<number, { avg: number | null; count: number }>();
  if (bottleIds.length === 0) return map;
  const groups = await prisma.rating.groupBy({
    by: ['bottleId'],
    where: { bottleId: { in: bottleIds } },
    _avg: { score: true },
    _count: true,
  });
  for (const g of groups) {
    const avg = g._avg.score ? Number(Number(g._avg.score).toFixed(1)) : null;
    map.set(g.bottleId, { avg, count: g._count });
  }
  return map;
}

export type BottleFilters = {
  categoryId?: number;
  budgetTier?: string;
  trending?: boolean;
  // Matches bottles.cocktaildb_ingredient_name (case-insensitive) so a cocktail
  // ingredient chip can "shop" every bottle for that spirit.
  ingredient?: string;
  sort?: 'price' | 'expert' | 'audience' | 'name';
};

export async function listBottles(filters: BottleFilters = {}): Promise<BottleView[]> {
  const where: Prisma.BottleWhereInput = {};
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.budgetTier) where.budgetTier = filters.budgetTier as Prisma.EnumBudgetTierFilter['equals'];
  if (filters.trending !== undefined) where.trending = filters.trending;
  if (filters.ingredient) {
    where.cocktaildbIngredientName = { equals: filters.ingredient, mode: 'insensitive' };
  }

  const orderBy: Prisma.BottleOrderByWithRelationInput =
    filters.sort === 'price'
      ? { priceLow: 'asc' }
      : filters.sort === 'expert'
        ? { expertScore: 'desc' }
        : { name: 'asc' };

  const bottles = await prisma.bottle.findMany({
    where,
    include: { category: true, affiliateLinks: true },
    orderBy,
  });
  const scores = await audienceMap(bottles.map((b) => b.id));
  let views = bottles.map((b) => {
    const s = scores.get(b.id);
    return toView(b, s?.avg ?? null, s?.count ?? 0);
  });

  // Audience sort needs the computed averages, so sort in JS.
  if (filters.sort === 'audience') {
    views = views.sort((a, b) => (b.audienceScore ?? -1) - (a.audienceScore ?? -1));
  }
  return views;
}

export async function getBottle(id: number): Promise<BottleView | null> {
  const b = await prisma.bottle.findUnique({
    where: { id },
    include: { category: true, affiliateLinks: true },
  });
  if (!b) return null;
  const scores = await audienceMap([id]);
  const s = scores.get(id);
  return toView(b, s?.avg ?? null, s?.count ?? 0);
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}
