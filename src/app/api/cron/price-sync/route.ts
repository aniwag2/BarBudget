import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { parseFeed, parseFeedDefs, type ParsedFeedRow } from '@/lib/feeds';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Called daily by pg_cron. Downloads each configured affiliate feed into
// price_feed_items, fuzzy-matches rows to bottles via pg_trgm, and updates
// prices for confident matches. Low-confidence rows are left for admin review.
export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const defs = parseFeedDefs(process.env.AFFILIATE_FEEDS);
  const threshold = Number.parseFloat(process.env.PRICE_MATCH_THRESHOLD || '0.45');
  const authHeader = process.env.AFFILIATE_FEED_AUTH_HEADER;

  const summary: Array<Record<string, unknown>> = [];
  let totalMatched = 0;

  for (const def of defs) {
    const result = { retailer: def.retailerName, rows: 0, matched: 0, error: null as string | null };
    try {
      const res = await fetch(def.url, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseFeed(def, text);
      result.rows = rows.length;

      for (const row of rows) {
        const matched = await ingestRow(def.retailerName, row, threshold);
        if (matched) { result.matched++; totalMatched++; }
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      console.error(`[price-sync] ${def.retailerName} failed:`, err);
    }
    summary.push(result);
  }

  return NextResponse.json({ ok: true, feeds: defs.length, totalMatched, summary });
}

async function ingestRow(
  retailerName: string,
  row: ParsedFeedRow,
  threshold: number,
): Promise<boolean> {
  // Best trigram match against "brand name" of catalog bottles.
  const candidates = await prisma.$queryRaw<Array<{ id: number; sim: number }>>`
    SELECT id,
           similarity(
             lower(coalesce(brand,'') || ' ' || name),
             lower(${row.feedProductName})
           ) AS sim
    FROM bottles
    ORDER BY sim DESC
    LIMIT 1
  `;
  const best = candidates[0];
  const matchedBottleId = best && best.sim >= threshold ? best.id : null;
  const matchScore = best ? best.sim : null;

  await prisma.priceFeedItem.create({
    data: {
      retailerName,
      feedProductName: row.feedProductName,
      price: row.price,
      productUrl: row.productUrl,
      matchedBottleId,
      matchScore,
    },
  });

  if (matchedBottleId === null) return false;

  // Confident match: refresh the bottle's price window from feed prices seen
  // for this bottle in the last 24h (low = min, high = max across retailers).
  const stats = await prisma.priceFeedItem.aggregate({
    where: { matchedBottleId, fetchedAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
    _min: { price: true },
    _max: { price: true },
  });
  await prisma.bottle.update({
    where: { id: matchedBottleId },
    data: {
      priceLow: stats._min.price ?? row.price,
      priceHigh: stats._max.price ?? row.price,
      priceSource: 'feed',
      priceUpdatedAt: new Date(),
    },
  });
  return true;
}
