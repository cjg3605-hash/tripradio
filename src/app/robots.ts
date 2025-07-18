import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: [
      'https://navi-guide.com/sitemap.xml',
      'https://en.navi-guide.com/sitemap.xml',
      'https://ja.navi-guide.com/sitemap.xml',
      'https://zh.navi-guide.com/sitemap.xml',
      'https://es.navi-guide.com/sitemap.xml',
    ],
    host: 'https://navi-guide.com',
  };
} 