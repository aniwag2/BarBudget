import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminBottleForm from '@/components/AdminBottleForm';
import { getBottle, listCategories } from '@/lib/bottles';

export const dynamic = 'force-dynamic';

export default async function EditBottlePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [bottle, categories] = await Promise.all([getBottle(id), listCategories()]);
  if (!bottle) notFound();

  return (
    <div>
      <Link href="/admin" className="text-sm text-amber-600 dark:text-amber-300 hover:underline">← Back to admin</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-amber-900 dark:text-amber-100">Edit bottle</h1>
      <div className="mt-4">
        <AdminBottleForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} bottle={bottle} />
      </div>
    </div>
  );
}
