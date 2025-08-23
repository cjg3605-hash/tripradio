// src/app/layout.tsx (최종 수정 버전)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/custom.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import SessionProvider from '@/components/providers/SessionProvider';
import ClientLayout from '@/components/layout/ClientLayout';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import OrganizationSchema from '@/components/seo/OrganizationSchema';
import WebsiteSchema from '@/components/seo/WebsiteSchema';
import SoftwareApplicationSchema from '@/components/seo/SoftwareApplicationSchema';
import ServiceSchema from '@/components/seo/ServiceSchema';
import ReviewSchema from '@/components/seo/ReviewSchema';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { detectPreferredLanguage, LANGUAGE_COOKIE_NAME } from '@/lib/utils';

// Inter for modern design (primary font) - 최적화된 weight만 사용
const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'], // 다국어 지원 확장
  display: 'swap',
  variable: '--font-inter'
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
        url: '/og-image.svg',
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
    images: ['/og-image.svg']
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
      'naver-site-verification': 'ac6cd3c71672a4e6271216f7475e406fb50a99bc',
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
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
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
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        {/* CDN 의존성 제거 - 404 오류 방지 */}
        {/* <link rel="dns-prefetch" href="//cdn.jsdelivr.net" /> */}
        {/* <link rel="dns-prefetch" href="//unpkg.com" /> */}
        
        {/* Preconnect for Critical Resources - Connection Reuse */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* CDN preconnect 제거 - 404 오류 방지 */}
        {/* <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" /> */}
        
        {/* CSS는 import로 처리됨 - preload 제거 */}
        {/* Next.js에서는 globals.css가 import './globals.css'로 이미 로드됨 */}
        
        {/* Critical Image Preload */}
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/favicon-32x32.png" as="image" />
        
        {/* Hero Section Critical Images - All WebP Format for 50% smaller size */}
        <link rel="preload" href="/images/landmarks/eiffel-tower.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/landmarks/colosseum.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/landmarks/gyeongbokgung.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/landmarks/taj-mahal.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/landmarks/statue-of-liberty.webp" as="image" type="image/webp" />
        <link rel="preload" href="/images/landmarks/machu-picchu.webp" as="image" type="image/webp" />
        
        {/* Critical JavaScript Resources Prefetch */}
        <link rel="prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
        <link rel="prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" />
        <link rel="prefetch" href="https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="ZGsBu9eojRsKlixPE6U5iGBcebJVNNBRhZo-UIVl3Hk" />
        
        {/* Google AdSense Account Verification */}
        <meta name="google-adsense-account" content="ca-pub-8225961966676319" />
        
        
        
        {/* hreflang Tags for Multilingual SEO - Enhanced for Guide Pages */}
        <link rel="alternate" hrefLang="ko-KR" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=ko`} />
        <link rel="alternate" hrefLang="en-US" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=en`} />
        <link rel="alternate" hrefLang="ja-JP" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=ja`} />
        <link rel="alternate" hrefLang="zh-CN" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=zh`} />
        <link rel="alternate" hrefLang="es-ES" href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'}?lang=es`} />
        <link rel="alternate" hrefLang="x-default" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'} />
        
        {/* Enhanced Language Discovery for Search Engines */}
        <meta name="google" content="notranslate" />
        <meta name="robots" content="index,follow" />
        <meta httpEquiv="Content-Language" content={serverLanguage} />
        

        {/* ✅ Google AdSense - 안전한 Auto Ads 전용 초기화 */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8225961966676319"
          crossOrigin="anonymous"
        />
        
        {/* ✅ AdSense Auto Ads 초기화 - 승인 대기 중 graceful 처리 */}
        <Script
          id="google-adsense-auto-ads"
          strategy="afterInteractive"
        >
          {`
            // 전역 초기화 방지 플래그 설정
            if (typeof window !== 'undefined' && !window.adsenseGlobalInitialized) {
              window.adsenseGlobalInitialized = true;
              
              function initializeAdSense() {
                // 중복 초기화 방지
                if (window.adsenseAutoAdsInitialized) {
                  console.log('ℹ️ AdSense: 이미 초기화됨 - 중복 방지');
                  return;
                }
                
                // DOM에서 기존 AdSense 요소 확인
                const existingAutoAds = document.querySelector('[data-ad-client][data-ad-format="auto"]');
                if (existingAutoAds) {
                  console.log('ℹ️ AdSense: 기존 Auto Ads 요소 감지 - 중복 방지');
                  window.adsenseAutoAdsInitialized = true;
                  return;
                }
                
                // AdSense 스크립트 로드 확인
                if (typeof window.adsbygoogle === 'undefined') {
                  console.log('ℹ️ AdSense: 스크립트 로드 대기 중... (승인 상태에 따라 정상)');
                  return;
                }
                
                console.log('🟢 AdSense: Auto Ads 초기화 시작');
                try {
                  // 승인 상태 확인을 위한 조건부 초기화
                  (window.adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "ca-pub-8225961966676319",
                    enable_page_level_ads: true
                  });
                  window.adsenseAutoAdsInitialized = true;
                  console.log('✅ AdSense: Auto Ads 초기화 완료 (승인 후 광고 표시됨)');
                } catch (error) {
                  // 승인 대기 중일 때 발생할 수 있는 오류를 graceful하게 처리
                  if (error.message && (
                    error.message.includes('enable_page_level_ads') ||
                    error.message.includes('adsbygoogle') ||
                    error.message.includes('Only one')
                  )) {
                    console.log('ℹ️ AdSense: 승인 대기 중이거나 이미 초기화됨 - 정상 상태');
                    window.adsenseAutoAdsInitialized = true;
                  } else {
                    console.warn('⚠️ AdSense: 예상치 못한 오류:', error.message);
                  }
                }
              }
              
              // 스크립트 로드 완료 후 초기화
              const checkAdSenseReady = () => {
                if (typeof window.adsbygoogle !== 'undefined') {
                  initializeAdSense();
                } else {
                  console.log('ℹ️ AdSense: 스크립트 로딩 중... (승인 상태 확인 필요)');
                }
              };
              
              // DOM 준비 후 실행
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkAdSenseReady);
              } else {
                // 약간의 지연 후 실행 (스크립트 로드 대기)
                setTimeout(checkAdSenseReady, 1000);
              }
            }
          `}
        </Script>
        
        {/* Local Business Schema (네이버용) */}
        <LocalBusinessSchema />
        {/* Organization Schema (네이버용) */}
        <OrganizationSchema />
        
        {/* Website Schema for SEO */}
        <WebsiteSchema />
        
        {/* Software Application Schema for SEO */}
        <SoftwareApplicationSchema />
        
        {/* Enhanced Service Schema */}
        <ServiceSchema 
          data={{
            name: "TripRadio.AI",
            description: "AI가 만드는 개인 맞춤형 여행 오디오가이드. 실시간으로 생성되는 전문 해설과 다국어 지원으로 특별한 여행 경험을 제공합니다.",
            url: "https://navidocent.com",
            logo: "https://navidocent.com/logo.png",
            images: [
              "https://navidocent.com/og-image.jpg",
              "https://navidocent.com/web-app-manifest-512x512.png"
            ],
            serviceType: "AI Travel Guide Service",
            provider: "TripRadio.AI",
            areaServed: ["South Korea", "대한민국", "韓国", "韩国", "Corea del Sur"],
            availableLanguage: ["Korean", "English", "Japanese", "Chinese", "Spanish"],
            offers: [
              {
                name: "여행 라디오 AI",
                description: "AI가 만드는 개인 맞춤형 여행 라디오 서비스",
                price: "0",
                priceCurrency: "KRW",
                availability: "https://schema.org/InStock",
                validFrom: "2024-01-01"
              },
              {
                name: "실시간 음성 가이드",
                description: "GPS 기반 실시간 위치별 AI 음성 가이드",
                price: "0",
                priceCurrency: "KRW",
                availability: "https://schema.org/InStock",
                validFrom: "2024-01-01"
              },
              {
                name: "무료 체험",
                description: "무료로 체험 가능한 여행 라디오 AI",
                price: "0",
                priceCurrency: "KRW",
                availability: "https://schema.org/InStock",
                validFrom: "2024-01-01"
              }
            ],
            aggregateRating: {
              ratingValue: 4.8,
              ratingCount: 156,
              bestRating: 5,
              worstRating: 1
            },
            features: [
              "AI 기반 실시간 가이드 생성",
              "다국어 음성 해설 지원",
              "개인 맞춤형 여행 추천",
              "오프라인 사용 가능",
              "GPS 기반 위치 안내"
            ],
            contactPoint: {
              contactType: "customer service",
              availableLanguage: ["Korean", "English", "Japanese", "Chinese", "Spanish"],
              hoursAvailable: {
                opens: "00:00",
                closes: "23:59"
              }
            },
            sameAs: []
          }}
        />
        
        {/* Review Schema for Software Application */}
        <ReviewSchema 
          itemReviewed={{
            name: "TripRadio.AI",
            type: "SoftwareApplication",
            url: "https://navidocent.com",
            image: "https://navidocent.com/logo.png"
          }}
          aggregateRating={{
            ratingValue: 4.8,
            ratingCount: 156,
            reviewCount: 156,
            bestRating: 5,
            worstRating: 1
          }}
        />
        
        {/* Critical Fonts Only - Local Hosting */}
        <link 
          rel="preload" 
          href="/fonts/pretendard-regular.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
        {/* Medium과 Bold는 필요시 lazy loading */}
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