import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword } from './user'

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        try {
          // 타이밍 공격 방지를 위한 일정한 시간 지연
          const startTime = Date.now();
          const minAuthTime = 500; // 최소 500ms 소요

          const user = await getUserByEmail(credentials.email);
          let isValid = false;
          let authResult: { id: string; email: string; name: string } | null = null;

          if (user && user.hashedPassword) {
            isValid = await verifyPassword(credentials.password, user.hashedPassword);
            if (isValid) {
              authResult = {
                id: user.id,
                email: user.email,
                name: user.name,
              };
            }
          } else {
            // 사용자가 없어도 비밀번호 해싱 시간을 시뮬레이션
            await verifyPassword(credentials.password, '$2a$12$dummy.hash.to.prevent.timing.attack.vulnerability');
          }

          // 최소 시간이 지나지 않았다면 대기
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < minAuthTime) {
            await new Promise(resolve => setTimeout(resolve, minAuthTime - elapsedTime));
          }

          if (!authResult) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
          }

          return authResult;
        } catch (error) {
          console.error('로그인 실패');
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
      }
    })
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
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax', // 로그아웃 개선을 위해 lax로 변경
        path: '/',
        secure: process.env.NODE_ENV === 'production', // 개발환경에서는 false
        domain: process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL?.replace(/https?:\/\//, '') : undefined
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

export default authOptions