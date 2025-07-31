import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword } from './user'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      profile(profile) {
        console.log('🔵 Google profile received:', profile);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      }
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
          const user = await getUserByEmail(credentials.email);
          if (!user) {
            throw new Error('존재하지 않는 계정입니다.');
          }

          if (!user.hashedPassword) {
            throw new Error('계정 정보에 오류가 있습니다.');
          }

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
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('🔵 SignIn callback triggered');
        console.log('🔵 User:', user);
        console.log('🔵 Account:', account);
        console.log('🔵 Profile:', profile);
        
        if (account?.provider === 'google') {
          console.log('🔵 Google sign-in attempt for:', user.email);
          console.log('🔵 Google account details:', {
            provider: account.provider,
            type: account.type,
            providerAccountId: account.providerAccountId
          });
          
          // Google 로그인 성공 시 추가 검증 로직
          if (!user.email) {
            console.error('❌ No email provided by Google');
            return false;
          }
          
          console.log('✅ Google sign-in approved for:', user.email);
          return true;
        }
        
        console.log('✅ Other provider sign-in approved');
        return true;
      } catch (error) {
        console.error('❌ Sign-in callback error:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      if (account?.provider === 'google') {
        token.provider = 'google';
      }
      
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
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
    },
    async redirect({ url, baseUrl }) {
      // 더 안전한 리다이렉트 처리
      try {
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        else if (new URL(url).origin === baseUrl) {
          return url;
        }
        return baseUrl;
      } catch (error) {
        console.error('Redirect callback error:', error);
        return baseUrl;
      }
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user.email, 'via', account?.provider);
    },
    async signOut({ token, session }) {
      console.log('User signed out');
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Session verified:', session.user?.email);
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

export default authOptions