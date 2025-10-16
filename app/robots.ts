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
          '/*?*session*',
          '/*?lang=*',  // 구식 URL 패턴 차단
          '/guide/*/live', // 실시간 가이드 차단 (예전 구조)
          '/guide/*/*/tour', // 투어 모드 차단 (예전 구조)
          '/monitoring', // 모니터링 페이지 차단
          '/disambiguate', // 모호성 해결 페이지 차단
          '/_next/', // Next.js 내부 파일 차단
          '/vercel.svg', // Vercel 로고 차단
          '/favicon.ico', // favicon 중복 차단
          '/*.json', // JSON 파일 차단
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
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Scrapy',
        disallow: '/',
      },
    ],
    sitemap: [
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop'}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop'}/sitemap-keywords.xml`,
    ],
    host: process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop',
  };
} 