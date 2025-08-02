/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
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
  trailingSlash: true,
  images: {
    unoptimized: false, // 이미지 최적화 활성화
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    esmExternals: 'loose'
  },
  // 압축 최적화
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // 번들 크기 최적화
  webpack: (config, { isServer }) => {
    // 클라이언트 빌드에서만 번들 분석 활성화
    if (!isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // 큰 라이브러리들을 별도 청크로 분리
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
        },
        // 지도 관련 라이브러리 분리
        maps: {
          test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
          name: 'maps',
          chunks: 'all',
          priority: 10,
        },
        // 오디오 관련 라이브러리 분리
        audio: {
          test: /[\\/](audio|sound|tts)[\\/]/,
          name: 'audio',
          chunks: 'all',
          priority: 10,
        }
      };
    }
    return config;
  },
  // 로그아웃 캐시 문제 해결을 위해 동적 빌드 ID 사용
  generateBuildId: async () => {
    // 개발환경에서는 고정 ID, 프로덕션에서는 타임스탬프 기반
    if (process.env.NODE_ENV === 'development') {
      return 'navi-guide-dev';
    }
    return `navi-guide-${Date.now()}`;
  }
};

module.exports = withPWA(nextConfig);