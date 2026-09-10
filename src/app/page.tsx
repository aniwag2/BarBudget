import Link from 'next/link';
import CalculatorClient from '@/components/CalculatorClient';
import { listBottles, listCategories } from '@/lib/bottles';
import { GUIDES } from '@/lib/guides';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [bottles, categories] = await Promise.all([listBottles(), listCategories()]);

  return (
    <div>
      <section className="mb-8">
        <h1 className="font-display text-4xl font-bold text-amber-900 dark:text-amber-100">
          Build your home bar
        </h1>
        <p className="mt-2 max-w-2xl text-amber-700 dark:text-amber-200">
          Tell us your budget and what you already own. We&rsquo;ll suggest which bottles to buy —
          essentials first, then extras if there&rsquo;s room — with expert and audience scores and
          links to buy from trusted retailers.
        </p>
        <p className="mt-2 max-w-2xl text-amber-700 dark:text-amber-200">
          The recommendations lean on a simple idea: a handful of well-chosen bottles makes far more
          drinks than a shelf bought at random. New to this? Start with{' '}
          <Link href="/guides/how-to-build-a-home-bar" className="underline">
            how to build a home bar from scratch
          </Link>
          , or read about{' '}
          <Link href="/about" className="underline">
            how we score and recommend bottles
          </Link>
          .
        </p>
      </section>

      <CalculatorClient
        bottles={bottles}
        categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
      />

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-amber-900 dark:text-amber-100">
          Guides to get you started
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card block p-4 transition hover:shadow-md">
              <h3 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-100">
                {g.title}
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
