/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  // This is the default location for the i18n config
  './src/i18n.ts'
);
const withPWA = require('next-pwa')({
  dest: 'public',
  register: process.env.NODE_ENV !== 'development',
  skipWaiting: process.env.NODE_ENV !== 'development',
  disable: process.env.NODE_ENV === 'development',
  // PWA 설정 최적화
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1년
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7일
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: /\.(?:json|xml|csv)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-data-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: ({ url }) => {
        // 세션 관련 API는 캐시에서 완전 제외
        return url.origin === self.location.origin && 
               url.pathname.startsWith('/api/') && 
               !url.pathname.startsWith('/api/auth/') &&
               !url.pathname.includes('session') &&
               !url.pathname.includes('force-logout');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    },
    {
      urlPattern: ({ url }) => {
        return url.origin === self.location.origin && !url.pathname.startsWith('/api/');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    }
  ]
});

const nextConfig = {
  // output: 'export', // NextAuth와 충돌하므로 제거
  trailingSlash: false,
  images: {
    unoptimized: false, // 이미지 최적화 활성화
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // experimental.esmExternals 제거 - webpack 호환성 문제 해결
  // 압축 최적화
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // SEO를 위한 헤더 설정
  async headers() {
    return [
      {
        // 일반 페이지들 - SEO 친화적 캐싱
        source: '/((?!api|auth|mypage|admin).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=86400', // 30분 캐시, 1일 stale
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
          },
        ],
      },
      {
        // 사이트맵과 robots.txt - 긴 캐싱
        source: '/(sitemap.xml|robots.txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, max-age=3600', // 1시간 캐시
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      {
        // ads.txt 파일 - 올바른 MIME 타입과 접근성 보장
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, max-age=86400', // 24시간 캐시
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        // 가이드 페이지들 - 적극적 색인
        source: '/guide/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=86400',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-snippet:-1, max-image-preview:large',
          },
        ],
      },
      {
        // 인증 관련 페이지 - 캐시 비활성화
        source: '/(auth|mypage|admin)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // API 경로 - 캐시 비활성화
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      }
    ];
  },
  // 🔀 URL 리다이렉트 설정 - 기존 URL을 새 구조로 리다이렉트
  async redirects() {
    return [
      // 🌐 도메인 정규화 리디렉션 (www → non-www, HTTP → HTTPS)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.navidocent.com'
          }
        ],
        destination: 'https://navidocent.com/:path*',
        permanent: true
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://navidocent.com/:path*',
        permanent: true
      },
      // 🔄 기존 URL 구조 리다이렉션
      {
        // 기존 URL: /guide/[location]?lang=ko → 새 URL: /guide/ko/[location]
        source: '/guide/:location',
        has: [
          {
            type: 'query',
            key: 'lang',
            value: '(?<lang>ko|en|ja|zh|es)'
          }
        ],
        destination: '/guide/:lang/:location',
        permanent: true // 301 리다이렉트로 SEO 점수 유지
      },
      {
        // 기존 URL: /guide/[location] (쿼리 없음) → 새 URL: /guide/ko/[location] (기본 한국어)
        source: '/guide/:location',
        destination: '/guide/ko/:location',
        permanent: true
      }
    ];
  },
  // 번들 크기 최적화
  webpack: (config, { isServer, dev }) => {
    // 개발 환경에서만 최적화 비활성화, 프로덕션에서는 최적화 활성화
    if (!isServer && dev) {
      // 개발 환경에서만 최적화 비활성화
      config.optimization = {
        ...config.optimization,
        minimize: false,
        minimizer: [],
        usedExports: false,
        sideEffects: false,
        splitChunks: {
          chunks: 'async',
          cacheGroups: {
            default: false,
            vendors: false,
          }
        }
      };
    } else if (!isServer && !dev) {
      // 프로덕션 환경에서는 최적화 활성화
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all'
            }
          }
        }
      };
    }
    
    // 모듈 해석 최적화
    config.resolve.alias = {
      ...config.resolve.alias,
      // 불필요한 polyfill 제거
      'fs': false,
      'path': false,
      'os': false,
    };
    
    return config;
  },
  // 로그아웃 캐시 문제 해결을 위해 동적 빌드 ID 사용
  generateBuildId: async () => {
    // 개발환경에서는 고정 ID, 프로덕션에서는 타임스탬프 기반
    if (process.env.NODE_ENV === 'development') {
      return 'docenttour-dev';
    }
    return `docenttour-${Date.now()}`;
  }
};

module.exports = withNextIntl(withPWA(nextConfig));