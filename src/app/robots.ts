import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 네이버 크롤러 최적화 (Yeti)
      {
        userAgent: 'Yeti',
        allow: '/',
        crawlDelay: 1, // 네이버 크롤링 간격 최적화
      },
      // 다음 크롤러 지원
      {
        userAgent: 'Daumoa',
        allow: '/',
        crawlDelay: 1,
      },
      // 구글 및 기타 검색엔진
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/mypage/',
          '/test-*',
          '/*?*auth*',
          '/*?*session*'
        ],
        crawlDelay: 2,
      },
      // AI 봇 차단 (콘텐츠 보호)
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
    ],
    sitemap: [
      'https://navidocent.com/sitemap.xml',
      'https://navidocent.com/sitemap-keywords.xml',
    ],
    host: 'https://navidocent.com',
  };
} 