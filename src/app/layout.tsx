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

// 간단한 헤더 컴포넌트
function SimpleHeader() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-0">
              <img
                src="/navi.png"
                alt="NAVI 로고"
                width={50}
                height={50}
                className="object-contain -mr-1"
              />
              <span className="text-2xl font-bold">
                <span className="text-indigo-600">N</span>
                <span className="text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-extrabold">A</span>
                <span className="text-indigo-600">V</span>
                <span className="text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-extrabold">I</span>
                <span className="text-gray-400">-</span>
                <span className="text-indigo-600">GUIDE</span>
              </span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              로그인
            </button>
          </div>
        </div>
      </div>
    </header>
  );
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
            <SimpleHeader />
            {children}
            <AutoAdSense />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 