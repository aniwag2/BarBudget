import type { MetadataRoute } from 'next';
import { GUIDES } from '@/lib/guides';

// Helps search + AdSense crawlers discover the site's content pages.
// Set NEXT_PUBLIC_SITE_URL to your public domain (defaults to barbudget.org).
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://barbudget.org').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/catalog', '/cocktails', '/guides', '/about'].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  const guideRoutes = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...guideRoutes];
}
