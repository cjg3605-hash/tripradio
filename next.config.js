/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 내보내기 설정 (Next.js 14에서는 output: 'export' 사용 권장)
  output: 'export',
  reactStrictMode: false,
  swcMinify: true,
  
  // 정적 에셋 최적화
  optimizeFonts: true,
  
  // 정적 파일 캐싱
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 정적 내보내기 시 경로에 슬래시 추가
  trailingSlash: true,
  
  // 환경 변수
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // 이미지 설정
  images: {
    unoptimized: true, // 정적 내보내기 시 필요
    domains: [
      'vercel.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'avatars.githubusercontent.com',
      'navi-guide-22r545qh3-jg-chois-projects.vercel.app'
    ]
  },
  
  // CORS 헤더 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  
  webpack: (config, { dev, isServer }) => {
    // Production 빌드에서 hydration 오류 방지
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-runtime.js': 'react/jsx-runtime',
        'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
      };
    }
    
    // 정적 자원 로더 설정
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
        publicPath: '/_next/'
      }
    });
    
    return config;
  },
  
  // 페이지 확장자 설정
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig; 