import type { Prisma } from '@prisma/client';

// Prisma Decimal | number | null -> number | null
export function num(v: Prisma.Decimal | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  return typeof v === 'number' ? v : Number(v);
}

export function money(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

// Midpoint of a price range, used for the calculator's running total.
export function priceMidpoint(low: number | null, high: number | null): number | null {
  if (low === null && high === null) return null;
  if (low === null) return high;
  if (high === null) return low;
  return (low + high) / 2;
}

export function score(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v.toFixed(1);
}

export type SourceLink = { label: string; url: string };

export function parseSourceLinks(v: unknown): SourceLink[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (x): x is SourceLink =>
      !!x && typeof x === 'object' && typeof (x as SourceLink).url === 'string',
  );
}

export const BUDGET_TIER_LABEL: Record<string, string> = {
  budget: 'Budget',
  mid: 'Mid-range',
  premium: 'Premium',
};

export const CATEGORY_TYPE_LABEL: Record<string, string> = {
  base_spirit: 'Base spirit',
  essential_liqueur: 'Essential liqueur',
  supplemental: 'Supplemental',
  mixer: 'Mixer',
  tool: 'Tool',
};
