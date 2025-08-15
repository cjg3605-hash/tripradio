import { MetadataRoute } from 'next';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://navidocent.com';
  const currentDate = new Date().toISOString();
  
  const keywordPages = [
    {
      url: `${baseUrl}/audio-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docent`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tour-radio`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/travel-radio`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  // Generate XML sitemap manually for better control
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${keywordPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${page.url}" />
    <xhtml:link rel="alternate" hreflang="en" href="${page.url}?lang=en" />
    <xhtml:link rel="alternate" hreflang="ja" href="${page.url}?lang=ja" />
    <xhtml:link rel="alternate" hreflang="zh" href="${page.url}?lang=zh" />
    <xhtml:link rel="alternate" hreflang="es" href="${page.url}?lang=es" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${page.url}" />
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}