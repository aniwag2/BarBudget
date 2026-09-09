import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { listIngredientNames, getIngredientDetail } from '@/lib/cocktaildb';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Called weekly by pg_cron. Walks TheCocktailDB ingredient list and refreshes
// ingredient_cache (name, is_alcoholic, type, abv) so public pages never hit
// the live API just to check whether an ingredient is alcoholic.
export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let names: string[];
  try {
    names = await listIngredientNames();
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to list ingredients', detail: String(err) },
      { status: 502 },
    );
  }

  const CONCURRENCY = 5;
  let upserted = 0;
  let failed = 0;

  for (let i = 0; i < names.length; i += CONCURRENCY) {
    const batch = names.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (name) => {
        try {
          const detail = await getIngredientDetail(name);
          const isAlcoholic = (detail?.strAlcohol || '').toLowerCase() === 'yes';
          const abv = detail?.strABV ? Number.parseFloat(detail.strABV) : null;
          await prisma.ingredientCache.upsert({
            where: { ingredientName: name },
            update: {
              isAlcoholic,
              type: detail?.strType ?? null,
              abv: Number.isFinite(abv as number) ? abv : null,
              lastSyncedAt: new Date(),
            },
            create: {
              ingredientName: name,
              isAlcoholic,
              type: detail?.strType ?? null,
              abv: Number.isFinite(abv as number) ? abv : null,
            },
          });
          upserted++;
        } catch (err) {
          failed++;
          console.error(`[ingredient-refresh] ${name} failed:`, err);
        }
      }),
    );
  }

  return NextResponse.json({ ok: true, total: names.length, upserted, failed });
}
