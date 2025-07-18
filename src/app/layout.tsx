import type { Metadata } from 'next';
import { 
  Inter, 
  Noto_Sans_KR, 
  Noto_Sans_JP, 
  Noto_Sans_SC,
  Roboto 
} from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AdSenseScript from '@/components/ads/AdSenseScript';
import AutoAdSense from '@/components/ads/AutoAdSense';
import ClientLayout from '@/components/layout/ClientLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 언어별 폰트 설정
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  preload: true,
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  preload: false, // 필요시에만 로드
});

const notoSansSc = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  preload: false, // 필요시에만 로드
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  preload: false, // 영어/스페인어용
});

// 다국어 메타데이터
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: 'NAVI - AI 가이드',
      template: '%s | NAVI AI Guide',
    },
    description: 'AI가 만들어주는 맞춤형 여행 가이드',
    keywords: [
      'AI 가이드', '여행 가이드', '관광 안내', 'AI guide', 'travel guide', 
      'AI ガイド', '旅行ガイド', 'AI导游', '旅游指南', 'Guía AI', 'guía de viaje'
    ],
    authors: [{ name: 'NAVI Team' }],
    creator: 'NAVI',
    publisher: 'NAVI',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon-16x16.png',
    },
    manifest: '/manifest.json',
    alternates: {
      canonical: 'https://navi-guide.com',
      languages: {
        'ko': 'https://navi-guide.com',
        'en': 'https://en.navi-guide.com',
        'ja': 'https://ja.navi-guide.com',
        'zh': 'https://zh.navi-guide.com',
        'es': 'https://es.navi-guide.com',
      },
    },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      alternateLocale: ['en_US', 'ja_JP', 'zh_CN', 'es_ES'],
      url: 'https://navi-guide.com',
      title: 'NAVI - AI 가이드',
      description: 'AI가 만들어주는 맞춤형 여행 가이드',
      siteName: 'NAVI',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'NAVI AI Guide',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'NAVI - AI 가이드',
      description: 'AI가 만들어주는 맞춤형 여행 가이드',
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 안전한 세션 가져오기
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('서버 세션 가져오기 실패:', error);
  }

  // 모든 폰트 변수를 className에 포함
  const fontClasses = [
    inter.variable,
    notoSansKr.variable,
    notoSansJp.variable,
    notoSansSc.variable,
    roboto.variable,
  ].join(' ');

  return (
    <html lang="ko" className={fontClasses} suppressHydrationWarning>
      <head>
        <AdSenseScript />
        {/* 다국어 DNS prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* 언어별 대체 URL */}
        <link rel="alternate" hrefLang="ko" href="https://navi-guide.com" />
        <link rel="alternate" hrefLang="en" href="https://en.navi-guide.com" />
        <link rel="alternate" hrefLang="ja" href="https://ja.navi-guide.com" />
        <link rel="alternate" hrefLang="zh" href="https://zh.navi-guide.com" />
        <link rel="alternate" hrefLang="es" href="https://es.navi-guide.com" />
        <link rel="alternate" hrefLang="x-default" href="https://navi-guide.com" />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'var(--current-font, var(--font-noto-sans-kr))' }}>
        <SessionProvider session={session}>
          <LanguageProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </LanguageProvider>
        </SessionProvider>
        <AutoAdSense />
      </body>
    </html>
  );
}