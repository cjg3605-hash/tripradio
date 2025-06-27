/** @type {import('next').NextConfig} */
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
    
    return config;
  }
};

// 환경 변수 설정
if (process.env.NODE_ENV === 'production') {
  nextConfig.env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };
}

module.exports = nextConfig; 