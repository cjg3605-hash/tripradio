/** @type {import('next').NextConfig} */
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

    return config;
  },
};

module.exports = nextConfig;