// src/app/layout.tsx (최종 수정 버전)
import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import '@/styles/custom.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import SessionProvider from '@/components/providers/SessionProvider';
import ClientLayout from '@/components/layout/ClientLayout';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import WebsiteSchema from '@/components/seo/WebsiteSchema';
import SoftwareApplicationSchema from '@/components/seo/SoftwareApplicationSchema';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { detectPreferredLanguage, LANGUAGE_COOKIE_NAME } from '@/lib/utils';

// Roboto for English text
const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
});


// ✅ viewport 별도 export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ✅ 다국어 메타데이터 개선 - TripRadio.AI 브랜딩
export const metadata: Metadata = {
  title: {
    default: 'AI 오디오가이드 | 무료 여행 해설 TripRadio.AI',
    template: '%s | TripRadio.AI'
  },
  description: '🎧 혼자 여행이 심심하다면? AI가 실시간으로 만들어주는 나만의 여행 오디오가이드! 무료 다운로드하고 특별한 여행 경험을 시작하세요 ✈️',
  keywords: ['TripRadio.AI', '트립라디오', '여행', '오디오가이드', 'AI가이드', '음성가이드', '관광', '투어', '여행가이드', '다국어', '한국여행', '무료체험', 'audio guide', 'audio guide', 'AI guide', 'Korea tour', '여행AI'],
  authors: [{ name: 'TripRadio.AI 팀' }],
  creator: 'TripRadio.AI',
  publisher: 'TripRadio.AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'TripRadio.AI',
    title: 'AI 오디오가이드 | 무료 여행 해설 TripRadio.AI',
    description: '🎧 혼자 여행이 심심하다면? AI가 실시간으로 만들어주는 나만의 여행 오디오가이드! 무료 다운로드하고 특별한 여행 경험을 시작하세요 ✈️',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TripRadio.AI - AI 여행 오디오가이드 가이드'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tripradio_ai',
    title: 'TripRadio.AI | Travel Radio AI | Free Travel Audio Guide',
    description: 'AI-powered personalized audio guide. Providing special travel experiences with professional voice guide and multilingual support. Free trial available!',
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
    title: 'TripRadio.AI',
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
        {/* 🚀 Critical Resource Performance Optimization */}
        
        {/* DNS Prefetch - Critical 3rd Party Domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//unpkg.com" />
        
        {/* Preconnect for Critical Resources - Connection Reuse */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        
        {/* Critical CSS Preload */}
        <link 
          rel="preload" 
          href="/styles/globals.css" 
          as="style"
          onload="this.onload=null;this.rel='stylesheet'"
        />
        
        {/* Critical Image Preload */}
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/favicon-32x32.png" as="image" />
        
        {/* Critical JavaScript Resources Prefetch */}
        <link rel="prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
        <link rel="prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" />
        <link rel="prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" />
        
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
        

        {/* ✅ Google AdSense - 안전한 Auto Ads 전용 초기화 */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8225961966676319"
          crossOrigin="anonymous"
        />
        
        {/* ✅ AdSense Auto Ads 초기화 - 중복 방지 */}
        <Script
          id="google-adsense-auto-ads"
          strategy="afterInteractive"
        >
          {`
            window.addEventListener('load', function() {
              // 중복 초기화 방지
              if (window.adsenseAutoAdsInitialized) {
                console.log('ℹ️ AdSense Auto Ads 이미 초기화됨 - 중복 방지');
                return;
              }
              
              console.log('🟢 AdSense Auto Ads 초기화 시작');
              if (typeof window.adsbygoogle !== 'undefined') {
                try {
                  (window.adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "ca-pub-8225961966676319",
                    enable_page_level_ads: true
                  });
                  window.adsenseAutoAdsInitialized = true;
                  console.log('✅ AdSense Auto Ads 활성화 완료');
                } catch (error) {
                  console.warn('⚠️ AdSense Auto Ads 초기화 실패:', error);
                }
              } else {
                console.warn('⚠️ AdSense 스크립트 로드 대기 중...');
              }
            });
          `}
        </Script>
        
        {/* Local Business Schema */}
        <LocalBusinessSchema />
        
        {/* Website Schema for SEO */}
        <WebsiteSchema />
        
        {/* Software Application Schema for SEO */}
        <SoftwareApplicationSchema />
        
        {/* Pretendard Font CDN */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className={`${roboto.variable} font-sans antialiased`} suppressHydrationWarning>
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
        
        {/* 🚀 Performance Monitoring */}
        <Script id="performance-monitor" strategy="afterInteractive">
          {`
            // Core Web Vitals Tracking for Google Analytics
            function sendToGA(metric) {
              if (typeof gtag !== 'undefined') {
                gtag('event', metric.name, {
                  value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                  event_category: 'Web Vitals',
                  event_label: metric.id,
                  non_interaction: true,
                });
              }
            }
            
            // Web Vitals 초기화
            if (typeof window !== 'undefined') {
              // Performance Observer 지원 확인
              if ('PerformanceObserver' in window) {
                console.log('🚀 Performance monitoring enabled');
                
                // 5초 후 성능 리포트 생성 (개발 환경에서만)
                if (window.location.hostname === 'localhost') {
                  setTimeout(() => {
                    if (window.performanceReport) {
                      window.performanceReport();
                    }
                  }, 5000);
                }
              } else {
                console.warn('⚠️ Performance Observer not supported');
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}