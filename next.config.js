const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // 개발 환경에서 디버깅을 위한 설정
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    document: '/offline', // 오프라인 페이지 설정 (선택사항)
  },
  // 개발 환경에서 압축 비활성화
  ...(process.env.NODE_ENV === 'development' && {
    sw: 'sw-dev.js', // 개발용 서비스 워커 파일명
    scope: '/',
  }),
  // 프로덕션 환경에서만 압축 활성화
  ...(process.env.NODE_ENV === 'production' && {
    sw: 'sw.js',
    mode: 'production',
  }),
  runtimeCaching: [
    {
      urlPattern: /^\/api\/auth\//,
      handler: 'NetworkOnly',
      method: 'GET',
    },
    {
      urlPattern: /^\/api\/auth\//,
      handler: 'NetworkOnly',
      method: 'POST',
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // TypeScript 오류 무시 (빌드 시)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint 오류 무시 (빌드 시)
  eslint: {
    ignoreDuringBuilds: true,
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
  
  // API 라우트 리라이트 설정 (필요시 사용)
  async rewrites() {
    return [];
  },
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // 정적 자원 로더 설정
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf|png|jpg|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
        publicPath: '/_next/'
      }
    });

    // @auth/core 관련 모듈 해결
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  
  // 환경 변수 설정 (필요시)
  env: {
    // 여기에 환경 변수 추가
  },
  
  // 프로덕션에서 소스맵 생성 비활성화 (성능 최적화)
  productionBrowserSourceMaps: false,
  
  // 정적 파일 캐싱 설정
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/locales/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);