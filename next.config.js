/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  // 정적 에셋 최적화
  optimizeFonts: true,
  
  // 이미지 설정
  images: {
    domains: [
      'vercel.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ]
  },
  
  // API 라우트 프록시 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/:path*`,
      },
    ]
  },
  
  // 환경 변수
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://' + process.env.VERCEL_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  
  // 웹팩 설정
  webpack: (config, { dev, isServer }) => {
    // 정적 자원 로더 설정
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
        publicPath: '/_next/'
      }
    });
    
    // 클라이언트 사이드에서 process.env 접근 가능하도록
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env)
      })
    );
    
    return config;
  }
};

module.exports = nextConfig;