import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trymonkmode.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/*', '/pricing', '/privacy', '/terms', '/refund', '/security', '/contact'],
        // The signed-in app is private.
        disallow: ['/api/*', '/_next/*', '/admin', '/app'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
