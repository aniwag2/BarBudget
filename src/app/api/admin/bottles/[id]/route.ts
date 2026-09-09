import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/require-admin';
import { bottleInputSchema } from '@/lib/bottle-schema';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const parsed = bottleInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }
  const { affiliateLinks, sourceLinks, ...data } = parsed.data;

  // Replace affiliate links wholesale (simple for a single-admin tool).
  await prisma.$transaction([
    prisma.affiliateLink.deleteMany({ where: { bottleId: id } }),
    prisma.bottle.update({
      where: { id },
      data: {
        ...data,
        priceUpdatedAt: new Date(),
        sourceLinks,
        affiliateLinks: { create: affiliateLinks },
      },
    }),
  ]);
  return NextResponse.json({ id });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await prisma.bottle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
