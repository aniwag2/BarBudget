import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GUIDES, getGuide } from '@/lib/guides';
import AdSlot from '@/components/AdSlot';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug);
  if (!guide) return { title: 'Guide — BarBudget' };
  return { title: `${guide.title} — BarBudget`, description: guide.description };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article>
        <Link href="/guides" className="text-sm text-amber-600 hover:underline dark:text-amber-300">
          ← All guides
        </Link>
        <h1 className="mt-2 font-display text-4xl font-bold text-amber-900 dark:text-amber-100">
          {guide.title}
        </h1>
        <p className="mt-2 text-lg text-amber-700 dark:text-amber-200">{guide.description}</p>
        <p className="mt-3 text-xs uppercase tracking-wide text-amber-500 dark:text-amber-400">
          {guide.readingMinutes} min read · Updated {new Date(guide.updated).toLocaleDateString()}
        </p>

        <div className="mt-6 space-y-6">
          {guide.sections.map((section, i) => (
            <section key={i}>
              {section.heading ? (
                <h2 className="font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
                  {section.heading}
                </h2>
              ) : null}
              <div className="mt-2 space-y-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="leading-relaxed text-amber-800 dark:text-amber-200">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 card p-5">
          <h2 className="font-display text-xl font-semibold text-amber-900 dark:text-amber-100">
            Ready to build your list?
          </h2>
          <p className="mt-1 text-amber-700 dark:text-amber-200">
            Use the calculator to turn these ideas into a specific shopping list for your budget.
          </p>
          <Link href="/" className="btn-primary mt-3">Build my bar →</Link>
        </div>
      </article>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="card p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-500 dark:text-amber-400">
            More guides
          </h3>
          <ul className="mt-2 space-y-3">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="font-medium text-amber-800 hover:underline dark:text-amber-100">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Ad appears alongside substantial original content only. */}
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} label="sidebar" className="min-h-[250px]" />
      </aside>
    </div>
  );
}
