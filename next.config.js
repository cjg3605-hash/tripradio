const { i18n } = require('./next-i18next.config');

// 환경별 PWA 설정
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

// PWA 설정 (안정적인 구성)
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev, // 개발 환경에서만 비활성화
  
  // 빌드 제외 설정 (문제가 되는 파일들 제외)
  buildExcludes: [
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/
  ],
  
  // 기본적인 런타임 캐싱만 설정
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
        },
      },
    },
    {
      urlPattern: /^\/api\/(?!auth)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5분
        },
      },
    },
  ],
  
  // 간단한 오프라인 폴백만 설정
  ...(isProd && {
    fallbacks: {
      document: '/offline',
    },
  }),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  reactStrictMode: true,
  swcMinify: true,
  
  // 환경 변수 설정
  env: {
    // AdSense 설정 - 기본값 제공
    NEXT_PUBLIC_ADSENSE_PUBLISHER_ID: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-8225961966676319',
    NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID || '5109315234',
    NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED || 'true',
  },
  
  // 국제화 설정
  i18n,
  
  // TypeScript 빌드 오류 처리
  typescript: {
    ignoreBuildErrors: false, // 타입 오류 시 빌드 중단
  },
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: false, // ESLint 오류 확인
  },
  
  // 이미지 최적화 설정
  images: {
    domains: ['localhost', 'navi-guide-3nlzt47nx-jg-chois-projects.vercel.app'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
  // API 라우트 설정
  async rewrites() {
    return [
      {
        source: '/api/guides/:path*',
        destination: '/api/node/ai/generate-guide',
      },
    ];
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NODE_ENV === 'production' 
              ? 'https://navi-guide-3nlzt47nx-jg-chois-projects.vercel.app' 
              : '*' 
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // 웹팩 설정 (PWA 호환성 개선)
  webpack: (config, { dev, isServer }) => {
    // 개발 환경에서 PWA 관련 경고 무시
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    
    return config;
  },
};

module.exports = withPWA(nextConfig);