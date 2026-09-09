import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Liveness + DB reachability. Used by the compose healthcheck.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'up' });
  } catch {
    return NextResponse.json({ status: 'degraded', db: 'down' }, { status: 503 });
  }
}
