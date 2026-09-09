import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

const schema = z.object({
  feedItemId: z.number().int().positive(),
  // null => unmatch / dismiss.
  bottleId: z.number().int().positive().nullable(),
  applyPrice: z.boolean().default(true),
});

// Admin resolves a low-confidence / unmatched feed row by assigning it to a
// bottle (and optionally pushing its price onto that bottle).
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }
  const { feedItemId, bottleId, applyPrice } = parsed.data;

  const item = await prisma.priceFeedItem.findUnique({ where: { id: feedItemId } });
  if (!item) return NextResponse.json({ error: 'Feed item not found' }, { status: 404 });

  await prisma.priceFeedItem.update({
    where: { id: feedItemId },
    data: { matchedBottleId: bottleId },
  });

  if (bottleId && applyPrice) {
    await prisma.bottle.update({
      where: { id: bottleId },
      data: {
        priceLow: item.price,
        priceHigh: item.price,
        priceSource: 'feed',
        priceUpdatedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
