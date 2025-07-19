/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  },
  // SSG 빌드 시 세션 관련 에러 무시
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // 빌드 시 useSession 관련 페이지를 동적으로 처리
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
};

module.exports = withPWA(nextConfig);