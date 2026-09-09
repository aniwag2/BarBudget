import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { num } from '@/lib/format';
import PriceFeedReview from '@/components/PriceFeedReview';

export const dynamic = 'force-dynamic';

export default async function PriceFeedReviewPage() {
  const threshold = Number.parseFloat(process.env.PRICE_MATCH_THRESHOLD || '0.45');

  // Show rows that need a human: unmatched, or matched below a comfortable
  // confidence, from the last 7 days.
  const [rows, bottles] = await Promise.all([
    prisma.priceFeedItem.findMany({
      where: {
        fetchedAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
        OR: [{ matchedBottleId: null }, { matchScore: { lt: threshold + 0.15 } }],
      },
      orderBy: [{ matchedBottleId: 'asc' }, { fetchedAt: 'desc' }],
      take: 200,
    }),
    prisma.bottle.findMany({ include: { category: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div>
      <Link href="/admin" className="text-sm text-amber-600 dark:text-amber-300 hover:underline">← Back to admin</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-amber-900 dark:text-amber-100">Price feed review</h1>
      <p className="mt-1 text-amber-600 dark:text-amber-300">
        Unmatched and low-confidence feed rows. Assigning a bottle applies the feed price to it.
      </p>
      <div className="mt-4 overflow-x-auto">
        <PriceFeedReview
          items={rows.map((r) => ({
            id: r.id,
            retailerName: r.retailerName,
            feedProductName: r.feedProductName,
            price: num(r.price) ?? 0,
            matchScore: num(r.matchScore),
            matchedBottleId: r.matchedBottleId,
          }))}
          bottles={bottles.map((b) => ({
            id: b.id,
            label: `${b.brand ? `${b.brand} — ` : ''}${b.name} (${b.category.name})`,
          }))}
        />
      </div>
    </div>
  );
}
