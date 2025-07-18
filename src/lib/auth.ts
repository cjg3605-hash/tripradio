import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword } from './user'

export const authOptions: NextAuthOptions = {
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
          // 사용자 조회
          const user = await getUserByEmail(credentials.email);
          if (!user) {
            throw new Error('존재하지 않는 계정입니다.');
          }

          // 타입 안전성 체크 추가
          if (!user.hashedPassword) {
            throw new Error('계정 정보에 오류가 있습니다.');
          }

          // 패스워드 검증
          const isValid = await verifyPassword(credentials.password, user.hashedPassword);
          if (!isValid) {
            throw new Error('비밀번호가 올바르지 않습니다.');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('로그인 실패:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt', // JWT 기반 세션 (데이터베이스 불필요)
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user.email, 'via', account?.provider)
      // JWT 기반이므로 별도 저장 불필요
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export default authOptions