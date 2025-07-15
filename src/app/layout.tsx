import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'  // Corrected import path
import SessionProvider from '@/components/providers/SessionProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { getServerSession } from 'next-auth/next'
import authOptions from '@/lib/auth'
import { Session } from 'next-auth'
import Head from 'next/head'
import ClientLayout from '@/components/layout/ClientLayout'
import ClientI18nProvider from '@/components/providers/ClientI18nProvider'

// 구글 폰트 로드 (영문용)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'optional', // swap → optional로 변경
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: false,
  fallback: ['system-ui', 'sans-serif']
})

// 구글 폰트 로드 (한국어용 - Noto Sans KR)
const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'optional', // swap → optional로 변경
  variable: '--font-noto-sans-kr',
  preload: true,
  adjustFontFallback: false,
  fallback: ['system-ui', 'sans-serif']
})

// 기본 폰트 클래스
const fontClassName = `${inter.className} ${notoSansKR.className}`;

export const metadata: Metadata = {
  title: 'NAVI-GUIDE - AI 개인 맞춤 관광 가이드',
  description: 'AI가 만드는 개인 맞춤형 관광 가이드로 특별한 여행을 경험하세요',
  keywords: ['AI 가이드', '관광 가이드', '여행 가이드', '명소 안내', '개인화 투어', 'NAVI-GUIDE'],
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/navi.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="NAVI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NAVI" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* AdSense 스크립트 - Google에서 제공한 코드 */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8225961966676319"
          crossOrigin="anonymous"
        />
        
        {/* 개발 환경에서만 서비스 워커 디버깅 도구 로드 */}
        {process.env.NODE_ENV === 'development' && (
          <script src="/sw-debug.js" async></script>
        )}
      </head>
      <body className={`${fontClassName} font-sans`}>
        <ClientI18nProvider>
          <SessionProvider session={session as Session | null}>
            <LanguageProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </LanguageProvider>
          </SessionProvider>
        </ClientI18nProvider>
      </body>
    </html>
  )
} 