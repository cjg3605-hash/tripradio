import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AutoAdSense from '@/components/ads/AutoAdSense';
import './globals.css';

// 구글 폰트 로드 (영문용)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: false,
  fallback: ['system-ui', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'NAVI-GUIDE - AI 개인 맞춤 관광 가이드',
  description: 'AI가 만드는 개인 맞춤형 관광 가이드로 특별한 여행을 경험하세요',
  keywords: ['AI 가이드', '관광 가이드', '여행 가이드', '명소 안내', '개인화 투어', 'NAVI-GUIDE'],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense 스크립트 */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <LanguageProvider>
            {children}
            <AutoAdSense />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 