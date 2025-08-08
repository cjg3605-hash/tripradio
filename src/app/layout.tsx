// src/app/layout.tsx (최종 수정 버전)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import SessionProvider from '@/components/providers/SessionProvider';
import ClientLayout from '@/components/layout/ClientLayout';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import WebsiteSchema from '@/components/seo/WebsiteSchema';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { detectPreferredLanguage, LANGUAGE_COOKIE_NAME } from '@/lib/utils';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

// ✅ viewport 별도 export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ✅ 다국어 메타데이터 개선
export const metadata: Metadata = {
  title: {
    default: 'NaviDocent - AI 여행 도슨트 가이드',
    template: '%s | NaviDocent'
  },
  description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 다국어 지원으로 완벽한 여행 경험을 제공합니다.',
  keywords: ['AI', '여행', '도슨트', '가이드', '관광', '투어', '음성가이드', '다국어', '한국여행', 'Korea tour', 'AI guide', 'travel guide', 'tourism'],
  authors: [{ name: 'NaviDocent Team' }],
  creator: 'NaviDocent',
  publisher: 'NaviDocent',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'NaviDocent',
    title: 'NaviDocent - AI 여행 도슨트 가이드',
    description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 다국어 지원으로 완벽한 여행 경험을 제공합니다.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NaviDocent - AI Travel Docent'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@navidocent',
    title: 'NaviDocent - AI Travel Docent Guide',
    description: 'AI-powered personalized travel docent service. Providing perfect travel experiences with real-time voice guides and multilingual support.',
    images: ['/og-image.jpg']
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification': process.env.NAVER_SITE_VERIFICATION || '',
    }
  },
  category: 'travel',
  classification: 'travel guide',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NaviDocent',
  },
  other: {
    'msapplication-TileColor': '#000000',
    'theme-color': '#ffffff',
    // AI Content Transparency - Google AI Content Guidelines Compliance
    'ai-content-declaration': 'This service uses AI to generate personalized travel guides and recommendations',
    'content-generation': 'AI-assisted',
    'ai-disclosure': 'Content generated with AI assistance for travel guide creation',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔥 서버에서 쿠키 기반 언어 감지 (Next.js 15 호환)
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  // 서버-클라이언트 일관성을 위한 언어 감지
  const serverLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage
  });
  
  console.log(`🌍 서버 언어 감지: ${serverLanguage} (쿠키: ${cookieLanguage})`);
  
  return (
    <html lang={serverLanguage} suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for Performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect for Critical Resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="ZGsBu9eojRsKlixPE6U5iGBcebJVNNBRhZo-UIVl3Hk" />
        
        {/* Google AdSense Account Verification */}
        <meta name="google-adsense-account" content="ca-pub-8225961966676319" />
        
        {/* Naver Search Advisor Verification */}
        <meta name="naver-site-verification" content="dc5a0970077fc443190c84178a92820b04abeeef" />
        
        {/* hreflang Tags for Multilingual SEO */}
        <link rel="alternate" hrefLang="ko-KR" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=ko`} />
        <link rel="alternate" hrefLang="en-US" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=en`} />
        <link rel="alternate" hrefLang="ja-JP" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=ja`} />
        <link rel="alternate" hrefLang="zh-CN" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=zh`} />
        <link rel="alternate" hrefLang="es-ES" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=es`} />
        <link rel="alternate" hrefLang="x-default" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'} />
        

        {/* Google AdSense Auto Ads Script - 통합 최적화 */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8225961966676319"
          crossOrigin="anonymous"
        />
        
        {/* Google AdSense 자동 광고 초기화 - Script 컴포넌트 사용 */}
        <Script
          id="google-adsense-init"
          strategy="afterInteractive"
        >
          {`
            window.addEventListener('load', function() {
              if (typeof window.adsbygoogle !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({
                  google_ad_client: "ca-pub-8225961966676319",
                  enable_page_level_ads: true
                });
              }
            });
          `}
        </Script>
        
        {/* Local Business Schema */}
        <LocalBusinessSchema />
        
        {/* Website Schema for SEO */}
        <WebsiteSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* AMP 자동 광고는 일반 React 앱에서는 사용하지 않고, 대신 AutoAdSense 컴포넌트 사용 */}
        
        <SessionProvider>
          <LanguageProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </LanguageProvider>
        </SessionProvider>
        
        {/* Google Analytics - 최적화된 Script 컴포넌트 사용 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MZ7XSC2X43"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MZ7XSC2X43');
          `}
        </Script>
      </body>
    </html>
  );
}