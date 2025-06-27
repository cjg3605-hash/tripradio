import NextAuth from '@/lib/auth'

// NextAuth v4 방식: 직접 인스턴스 사용
const handler = NextAuth

export { handler as GET, handler as POST } 