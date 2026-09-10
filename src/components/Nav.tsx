import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  return (
    <header className="border-b border-amber-200 bg-white/80 backdrop-blur dark:border-amber-800 dark:bg-amber-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-200">
          Bar<span className="text-amber-500 dark:text-amber-400">Budget</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="rounded-lg px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-800">
            Build my bar
          </Link>
          <Link href="/catalog" className="rounded-lg px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-800">
            Catalog
          </Link>
          <Link href="/cocktails" className="rounded-lg px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-800">
            Cocktails
          </Link>
          <Link href="/guides" className="rounded-lg px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-800">
            Guides
          </Link>
          <Link href="/about" className="hidden rounded-lg px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-800 sm:inline">
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
