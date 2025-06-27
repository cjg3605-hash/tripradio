/** @type {import('next').NextConfig} */
const webpack = require('webpack');

// Vercel URL 설정
const vercelUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화 설정
  images: {
    domains: [], // 외부 이미지 도메인 추가
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 환경 변수 설정 (빌드 타임에만 사용)
  env: {
    NEXTAUTH_URL: vercelUrl,
    NEXT_PUBLIC_VERCEL_URL: vercelUrl,
  },
  
  // API 라우트 리라이트 설정 (필요시 사용)
  async rewrites() {
    return [
      // API 경로 프록시 예시
      // {
      //   source: '/api/:path*',
      //   destination: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/:path*`,
      // },
    ];
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
    
    // 클라이언트에서 접근 가능한 환경 변수만 노출
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          // NEXT_PUBLIC_ 접두사가 있는 변수만 클라이언트에 노출
          ...Object.fromEntries(
            Object.entries(process.env).filter(([key]) => 
              key.startsWith('NEXT_PUBLIC_') || 
              key === 'NODE_ENV'
            )
          ),
          NEXTAUTH_URL: JSON.stringify(vercelUrl),
          NEXT_PUBLIC_VERCEL_URL: JSON.stringify(vercelUrl)
        }
      })
    );
    
    return config;
  }
};

module.exports = nextConfig;