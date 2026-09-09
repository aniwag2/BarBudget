import { z } from 'zod';

const nullableNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().nullable(),
);

export const affiliateLinkSchema = z.object({
  retailerName: z.string().min(1),
  affiliateNetwork: z.string().nullish(),
  url: z.string().url(),
  trackingId: z.string().nullish(),
  isAffiliate: z.boolean().default(true),
});

export const bottleInputSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  brand: z.string().nullish(),
  abv: nullableNumber,
  sizeMl: nullableNumber,
  cocktaildbIngredientName: z.string().nullish(),
  expertScore: nullableNumber.refine((v) => v === null || (v >= 0 && v <= 10), 'score 0–10'),
  expertSummary: z.string().nullish(),
  sourceLinks: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  priceLow: nullableNumber,
  priceHigh: nullableNumber,
  priceSource: z.enum(['feed', 'manual']).default('manual'),
  budgetTier: z.enum(['budget', 'mid', 'premium']).default('mid'),
  trending: z.boolean().default(false),
  imageUrl: z.string().nullish(),
  affiliateLinks: z.array(affiliateLinkSchema).default([]),
});

export type BottleInput = z.infer<typeof bottleInputSchema>;
