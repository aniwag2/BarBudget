import Link from 'next/link';
import AdminBottleForm from '@/components/AdminBottleForm';
import { listCategories } from '@/lib/bottles';

export const dynamic = 'force-dynamic';

export default async function NewBottlePage() {
  const categories = await listCategories();
  return (
    <div>
      <Link href="/admin" className="text-sm text-amber-600 dark:text-amber-300 hover:underline">← Back to admin</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-amber-900 dark:text-amber-100">New bottle</h1>
      <div className="mt-4">
        <AdminBottleForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
