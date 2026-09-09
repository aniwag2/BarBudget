import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { money, score } from '@/lib/format';
import { num } from '@/lib/format';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [bottles, unmatchedCount] = await Promise.all([
    prisma.bottle.findMany({
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.priceFeedItem.count({ where: { matchedBottleId: null } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-amber-900 dark:text-amber-100">Admin</h1>
        <SignOutButton />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/bottles/new" className="btn-primary">+ New bottle</Link>
        <Link href="/admin/price-feed" className="btn-ghost">
          Review price feed{unmatchedCount > 0 ? ` (${unmatchedCount} unmatched)` : ''}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-amber-200 dark:border-amber-800 text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">
            <tr>
              <th className="py-2">Name</th>
              <th>Category</th>
              <th>Tier</th>
              <th>Price</th>
              <th>Expert</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bottles.map((b) => (
              <tr key={b.id} className="border-b border-amber-100 dark:border-amber-800">
                <td className="py-2 font-medium text-amber-900 dark:text-amber-100">
                  {b.brand ? `${b.brand} — ` : ''}{b.name}
                </td>
                <td>{b.category.name}</td>
                <td>{b.budgetTier}</td>
                <td>
                  {money(num(b.priceLow))}
                  {b.priceHigh && num(b.priceHigh) !== num(b.priceLow) ? `–${money(num(b.priceHigh))}` : ''}
                </td>
                <td>{score(num(b.expertScore))}</td>
                <td>
                  <span className={b.priceSource === 'feed' ? 'text-green-700' : 'text-amber-600 dark:text-amber-300'}>
                    {b.priceSource}
                  </span>
                </td>
                <td className="text-right">
                  <Link href={`/admin/bottles/${b.id}`} className="text-amber-600 dark:text-amber-300 underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bottles.length === 0 ? <p className="mt-4 text-amber-500 dark:text-amber-400">No bottles yet — add one.</p> : null}
      </div>
    </div>
  );
}
