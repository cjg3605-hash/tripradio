import NextAuth from 'next-auth';
import authOptions from '@/lib/auth';

export const runtime = 'nodejs';

// NextAuth 핸들러에 오류 처리 추가
const handler = NextAuth(authOptions);

// 요청 로깅을 위한 래퍼 함수
const wrappedHandler = async (req: Request) => {
  try {
    console.log('🔵 NextAuth API call:', req.method, req.url);
    const response = await handler(req);
    console.log('🔵 NextAuth API response status:', response.status);
    return response;
  } catch (error) {
    console.error('❌ NextAuth API error:', error);
    throw error;
  }
};

export { wrappedHandler as GET, wrappedHandler as POST }; 