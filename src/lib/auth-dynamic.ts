import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getRuntimeConfig } from '@/lib/config/runtime-config'

/**
 * 동적 NextAuth 설정 생성 함수
 * 요청 정보를 기반으로 실시간으로 설정을 생성합니다.
 */
export function createDynamicAuthOptions(req?: any): NextAuthOptions {
  const runtimeConfig = getRuntimeConfig(req);
  
  return {
    debug: false,
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    session: {
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      updateAge: 12 * 60 * 60, // 12 hours
    },
    jwt: {
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    pages: {
      signIn: '/auth/signin',
      signOut: '/',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.isAdmin = false;
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
      },
      async redirect({ url, baseUrl }) {
        // 동적 base URL 사용
        const dynamicBaseUrl = runtimeConfig.baseUrl;
        
        // Same origin인 경우
        if (url.startsWith("/")) return `${dynamicBaseUrl}${url}`;
        // Same origin인 경우 (절대 URL)
        else if (new URL(url).origin === dynamicBaseUrl) return url;
        // 기본 URL로 리다이렉트
        return dynamicBaseUrl;
      }
    },
    // 동적으로 설정되는 쿠키 설정
    cookies: {
      sessionToken: {
        name: 'next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: runtimeConfig.protocol === 'https',
          domain: runtimeConfig.protocol === 'https' 
            ? (runtimeConfig.host.includes('.') ? `.${runtimeConfig.host}` : undefined)
            : undefined
        }
      },
      callbackUrl: {
        name: 'next-auth.callback-url',
        options: {
          sameSite: 'lax',
          httpOnly: true,
          path: '/',
          secure: runtimeConfig.protocol === 'https',
          domain: runtimeConfig.protocol === 'https' 
            ? (runtimeConfig.host.includes('.') ? `.${runtimeConfig.host}` : undefined)
            : undefined
        }
      },
      csrfToken: {
        name: 'next-auth.csrf-token',
        options: {
          sameSite: 'lax',
          httpOnly: true,
          path: '/',
          secure: runtimeConfig.protocol === 'https',
          domain: runtimeConfig.protocol === 'https' 
            ? (runtimeConfig.host.includes('.') ? `.${runtimeConfig.host}` : undefined)
            : undefined
        }
      }
    }
  };
}

// 호환성을 위한 기본 export
export const authOptions: NextAuthOptions = createDynamicAuthOptions();