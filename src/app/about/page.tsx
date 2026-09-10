import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BarBudget — how we score and recommend',
  description:
    'Who we are, how our expert scores and budget tiers are decided, how pricing works, and our affiliate and editorial policies.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-bold text-amber-900 dark:text-amber-100">About BarBudget</h1>
      <p className="mt-3 leading-relaxed text-amber-800 dark:text-amber-200">
        BarBudget helps people build a home bar that makes great drinks without overspending. We do
        not sell alcohol. Instead, we do the research — scoring bottles, writing about them, and
        tracking retail prices — so you can decide what to buy and then purchase from the retailer of
        your choice. The tools here are aimed at home bartenders getting started, and at bar managers
        comparing what is trending and what things cost.
      </p>

      <h2 className="mt-8 font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
        How our expert scores work
      </h2>
      <p className="mt-2 leading-relaxed text-amber-800 dark:text-amber-200">
        Every bottle carries an expert score from 0.0 to 10.0. That score reflects how a bottle
        performs in an actual drink relative to its price — not its prestige or packaging. A modest
        gin that makes an excellent gin & tonic can outscore a far pricier bottle that mostly buys a
        heavier label. Scores are our own editorial judgement, written in our own words; we never
        copy review text from other publications. Where we cite a source, it is for attribution only.
      </p>

      <h2 className="mt-8 font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
        Audience scores
      </h2>
      <p className="mt-2 leading-relaxed text-amber-800 dark:text-amber-200">
        Alongside the expert score, each bottle shows an audience score: the average of ratings
        submitted by visitors. Anyone can rate a bottle without an account; we limit repeat voting per
        browser so the average stays meaningful. The two numbers are deliberately separate so you can
        see where our judgement and the crowd agree or diverge.
      </p>

      <h2 className="mt-8 font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
        Budget tiers and pricing
      </h2>
      <p className="mt-2 leading-relaxed text-amber-800 dark:text-amber-200">
        We sort bottles into budget, mid-range, and premium tiers so the calculator can match
        suggestions to your spending level. Prices are shown as a low–high range and are refreshed from
        retailer product feeds where available, and entered by hand otherwise. Because prices move and
        vary by store and state, we show the date of the last price check and always link out to the
        retailer for the current figure. Nothing is purchased on this site.
      </p>

      <h2 className="mt-8 font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
        Affiliate disclosure
      </h2>
      <p className="mt-2 leading-relaxed text-amber-800 dark:text-amber-200">
        Some of the retailer links on this site are affiliate links, meaning we may earn a commission
        if you buy through them, at no additional cost to you. Affiliate relationships never influence
        our scores or which bottles we recommend — the score is decided before any link is added, and
        we link to multiple retailers so you can compare. We also run display advertising to support
        the site.
      </p>

      <h2 className="mt-8 font-display text-2xl font-semibold text-amber-900 dark:text-amber-100">
        Responsible enjoyment
      </h2>
      <p className="mt-2 leading-relaxed text-amber-800 dark:text-amber-200">
        This site is for adults of legal drinking age and is about enjoying good drinks in moderation.
        If you or someone you know is struggling with alcohol, please seek help from a qualified
        resource in your area.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/guides" className="btn-ghost">Read the guides</Link>
        <Link href="/" className="btn-primary">Build my bar</Link>
      </div>
    </div>
  );
}
