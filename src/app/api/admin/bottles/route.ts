import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/require-admin';
import { bottleInputSchema } from '@/lib/bottle-schema';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = bottleInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }
  const { affiliateLinks, sourceLinks, ...data } = parsed.data;

  const bottle = await prisma.bottle.create({
    data: {
      ...data,
      priceUpdatedAt: data.priceLow !== null || data.priceHigh !== null ? new Date() : null,
      sourceLinks: sourceLinks,
      affiliateLinks: { create: affiliateLinks },
    },
  });
  return NextResponse.json({ id: bottle.id }, { status: 201 });
}
