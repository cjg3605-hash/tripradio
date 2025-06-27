/** @type {import('next').NextConfig} */
const webpack = require('webpack');

// Vercel URL 설정
const vercelUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  // 정적 에셋 최적화
  optimizeFonts: true,
  
  // 이미지 설정
  images: {
    unoptimized: true, // 정적 내보내기 호환을 위해 비활성화
    domains: [], // 외부 이미지가 아닌 경우 비워둡니다
    path: '/_next/image',
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 정적 파일 경로 설정
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    disableStaticImages: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // 정적 파일 캐시 설정
  async headers() {
    return [
      {
        source: '/(.*).(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // 빌드 타임 환경 변수
  env: {
    NEXTAUTH_URL: vercelUrl,
    NEXT_PUBLIC_VERCEL_URL: vercelUrl
  },
  
  // 정적 내보내기 설정
  output: 'export',
  
  // 정적 페이지 생성 시 동적 경로 무시
  output: 'standalone',
  
  // 웹팩 설정
  webpack: (config, { dev, isServer }) => {
    // 정적 자원 로더 설정
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf|png|jpg|gif|svg)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
        publicPath: '/_next/'
      }
    });
    
    // 환경 변수 처리
    config.plugins.push(
      new webpack.EnvironmentPlugin({
        // 클라이언트에서 접근 가능한 환경 변수만 명시적으로 추가
        NEXTAUTH_URL: vercelUrl,
        NEXT_PUBLIC_VERCEL_URL: vercelUrl,
        NODE_ENV: process.env.NODE_ENV
      })
    );
    
    return config;
  }
};

module.exports = nextConfig;