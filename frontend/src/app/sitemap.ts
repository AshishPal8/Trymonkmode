import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trymonkmode.in';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/blogs?limit=100`, { cache: 'no-store' });
    if (!res.ok) return staticRoutes;
    const json = await res.json();
    const items = json?.data?.items || [];

    const blogRoutes: MetadataRoute.Sitemap = items.map((blog: { slug: string; createdAt: string }) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
