import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // 일시적으로 비활성화
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt', // 데이터베이스 대신 JWT 사용
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user.email, 'via', account?.provider)
      // 나중에 데이터베이스 연결이 안정되면 사용자 정보 저장
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions) 