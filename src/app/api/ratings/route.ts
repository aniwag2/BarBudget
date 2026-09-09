import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SID_COOKIE = 'bb_sid';

const bodySchema = z.object({
  bottleId: z.number().int().positive(),
  score: z.number().min(0).max(10),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }
  const { bottleId, score } = parsed.data;

  const bottle = await prisma.bottle.findUnique({ where: { id: bottleId }, select: { id: true } });
  if (!bottle) return NextResponse.json({ error: 'Bottle not found' }, { status: 404 });

  // Anonymous per-browser id. Absent => mint one and set it on the response.
  let sid = req.cookies.get(SID_COOKIE)?.value;
  const mintNew = !sid;
  if (!sid) sid = crypto.randomUUID();

  // One row per (bottle, browser). Re-voting updates the existing vote.
  await prisma.rating.upsert({
    where: { bottleId_sessionId: { bottleId, sessionId: sid } },
    update: { score },
    create: { bottleId, sessionId: sid, score },
  });

  const agg = await prisma.rating.aggregate({
    where: { bottleId },
    _avg: { score: true },
    _count: true,
  });
  const average = agg._avg.score ? Number(agg._avg.score) : null;

  const res = NextResponse.json({
    average: average === null ? null : Number(average.toFixed(1)),
    count: agg._count,
    yourScore: score,
  });

  if (mintNew) {
    res.cookies.set(SID_COOKIE, sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      path: '/',
    });
  }
  return res;
}
