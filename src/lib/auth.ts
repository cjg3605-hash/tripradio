import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getRuntimeConfig } from '@/lib/config/runtime-config'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { getUserByEmail, verifyPassword } from './user'

export const authOptions: NextAuthOptions = {
  debug: false, // 디버그 모드 비활성화
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // CredentialsProvider 임시 비활성화 - Supabase 연결 문제 해결까지
    /*
    CredentialsProvider({
      id: 'credentials',
      name: '이메일로 로그인',
      credentials: {
        email: { 
          label: '이메일', 
          type: 'email',
          placeholder: 'your@email.com'
        },
        password: { 
          label: '비밀번호', 
          type: 'password',
          placeholder: '비밀번호를 입력하세요'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email);
          if (user && user.hashedPassword) {
            const isValid = await verifyPassword(credentials.password, user.hashedPassword);
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('로그인 실패:', error);
          return null;
        }
      }
    })
    */
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (보안 강화)
    updateAge: 12 * 60 * 60, // 12 hours (더 자주 갱신)
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days (보안 강화)
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/', // 로그아웃 후 홈페이지로 리다이렉트
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // 프로덕션에서 명시적으로 도메인 설정
        domain: process.env.NODE_ENV === 'production' ? '.tripradio.shop' : undefined
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.tripradio.shop' : undefined
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.tripradio.shop' : undefined
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = false; // 기본값으로 설정
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // @ts-ignore - NextAuth 타입 확장
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    }
  },
}

export default authOptions