import CalculatorClient from '@/components/CalculatorClient';
import { listBottles, listCategories } from '@/lib/bottles';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [bottles, categories] = await Promise.all([listBottles(), listCategories()]);

  return (
    <div>
      <section className="mb-8">
        <h1 className="font-display text-4xl font-bold text-amber-900">Build your home bar</h1>
        <p className="mt-2 max-w-2xl text-amber-700">
          Tell us your budget and what you already own. We&rsquo;ll suggest which bottles to buy —
          essentials first, then extras if there&rsquo;s room — with expert and audience scores and
          links to buy from trusted retailers.
        </p>
      </section>

      <CalculatorClient
        bottles={bottles}
        categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
      />
    </div>
  );
}
