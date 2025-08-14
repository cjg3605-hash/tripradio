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
  // 번들 크기 최적화
  webpack: (config, { isServer, dev }) => {
    // 성능 최적화 설정
    if (!isServer) {
      // 트리셰이킹 활성화
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // 청크 분할 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          // React & Core 라이브러리
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // Next.js 코어
          nextjs: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'nextjs',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // UI 컴포넌트 라이브러리들
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 12,
            maxSize: 150000,
          },
          // 지도 관련 (가장 무거운 라이브러리)
          maps: {
            test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
            name: 'maps',
            chunks: 'async',
            priority: 10,
            maxSize: 180000,
          },
          // 인증 관련
          auth: {
            test: /[\\/]node_modules[\\/](next-auth|@supabase)[\\/]/,
            name: 'auth',
            chunks: 'all',
            priority: 8,
          },
          // 기타 vendor 라이브러리들
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
            minSize: 30000,
            maxSize: 200000,
          },
        },
      };
      
      // 압축 최적화 (안전한 TerserPlugin 설정)
      if (!dev) {
        config.optimization.minimize = true;
        const TerserPlugin = require('terser-webpack-plugin');
        config.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: false,
                drop_debugger: true,
                pure_funcs: [],
                unsafe: false,
                unsafe_comps: false,
                unsafe_math: false,
                unsafe_proto: false,
                passes: 1,
                keep_fargs: true,
                keep_fnames: true,
                conditionals: false,
                evaluate: false,
              },
              mangle: false,
              format: {
                comments: false,
                preserve_annotations: true,
              },
            },
            extractComments: false,
          }),
        ];
      }
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