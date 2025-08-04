// src/app/layout.tsx (최종 수정 버전)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import SessionProvider from '@/components/providers/SessionProvider';
import ClientLayout from '@/components/layout/ClientLayout';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
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

// ✅ metadata에서 viewport 제거됨
export const metadata: Metadata = {
  title: {
    default: 'NaviDocent - AI Travel Guide',
    template: '%s | NaviDocent'
  },
  description: 'AI-powered personalized travel docent service. Providing perfect travel experiences with real-time voice guides and multilingual support.',
  keywords: ['AI', 'travel', 'docent', 'guide', 'tourism', 'tour', 'voice guide', 'multilingual', 'Korea travel', 'Korea tour', 'AI guide'],
  authors: [{ name: 'NaviDocent Team' }],
  creator: 'NaviDocent',
  publisher: 'NaviDocent',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'NaviDocent',
    title: 'NaviDocent - AI Travel Docent Guide',
    description: 'AI-powered personalized travel docent service. Providing perfect travel experiences with real-time voice guides and multilingual support.',
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔥 서버에서 쿠키 기반 언어 감지
  const cookieStore = cookies();
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
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-MZ7XSC2X43"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MZ7XSC2X43');
            `
          }}
        />
        
        {/* Local Business Schema */}
        <LocalBusinessSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          <LanguageProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}