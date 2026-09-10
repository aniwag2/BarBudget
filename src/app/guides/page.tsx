import Link from 'next/link';
import type { Metadata } from 'next';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Home Bar Guides — BarBudget',
  description:
    'Original guides to building a home bar on a budget: which bottles to buy, where quality matters, and the tools and techniques that improve every drink.',
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-bold text-amber-900 dark:text-amber-100">Home bar guides</h1>
      <p className="mt-2 text-amber-700 dark:text-amber-200">
        Practical, opinionated writing on building a home bar that makes great drinks without
        overspending. These pair with the build-my-bar calculator and the catalog.
      </p>

      <ul className="mt-8 space-y-4">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="card block p-5 transition hover:shadow-md">
              <h2 className="font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
                {g.title}
              </h2>
              <p className="mt-2 text-amber-700 dark:text-amber-200">{g.description}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">
                {g.readingMinutes} min read · Updated {new Date(g.updated).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
