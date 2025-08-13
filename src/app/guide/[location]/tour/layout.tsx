import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';
import { detectPreferredLanguage, LANGUAGE_COOKIE_NAME } from '@/lib/utils';
import ArticleSchema from '@/components/seo/ArticleSchema';
import BreadcrumbSchema, { generateTourBreadcrumb } from '@/components/seo/BreadcrumbSchema';

interface TourLayoutProps {
  children: React.ReactNode;
  params: Promise<{ location: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locationName = decodeURIComponent(resolvedParams.location || '');
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    prioritizeUrl: false
  });
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  
  // 언어별 메타데이터 템플릿
  const templates = {
    ko: {
      title: `${locationName} 실시간 투어 가이드 - TripRadio.AI`,
      description: `${locationName}의 AI 기반 실시간 투어 가이드입니다. 개인 맞춤형 음성 해설과 경로 안내로 완벽한 ${locationName} 여행을 경험하세요.`,
      keywords: ['실시간 투어', 'AI 가이드', '음성 해설', '여행 가이드', locationName]
    },
    en: {
      title: `${locationName} Real-time Tour Guide - TripRadio.AI`,
      description: `AI-powered real-time tour guide for ${locationName}. Experience perfect ${locationName} travel with personalized voice commentary and route guidance.`,
      keywords: ['real-time tour', 'AI guide', 'voice commentary', 'travel guide', locationName]
    },
    ja: {
      title: `${locationName}リアルタイムツアーガイド - TripRadio.AI`,
      description: `${locationName}のAI駆動型リアルタイムツアーガイドです。パーソナライズされた音声解説とルート案内で完璧な${locationName}旅行を体験してください。`,
      keywords: ['リアルタイムツアー', 'AIガイド', '音声解説', '旅行ガイド', locationName]
    },
    zh: {
      title: `${locationName}实时旅游指南 - TripRadio.AI`,
      description: `${locationName}的AI驱动实时旅游指南。通过个性化语音解说和路线指导，体验完美的${locationName}旅行。`,
      keywords: ['实时导览', 'AI指南', '语音解说', '旅游指南', locationName]
    },
    es: {
      title: `Guía de Tour en Tiempo Real de ${locationName} - TripRadio.AI`,
      description: `Guía de tour en tiempo real impulsada por IA para ${locationName}. Experimenta el viaje perfecto a ${locationName} con comentarios de voz personalizados y orientación de ruta.`,
      keywords: ['tour en tiempo real', 'guía IA', 'comentarios de voz', 'guía de viaje', locationName]
    }
  };
  
  const template = templates[serverDetectedLanguage as keyof typeof templates] || templates.ko;
  
  const metadata: Metadata = {
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    openGraph: {
      title: template.title,
      description: template.description,
      type: 'article',
      locale: getOpenGraphLocale(serverDetectedLanguage),
      url: `/guide/${encodeURIComponent(locationName)}/tour`,
      siteName: 'TripRadio',
      images: [
        {
          url: `/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${locationName} Real-time Tour Guide - TripRadio.AI`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: template.title,
      description: template.description,
      images: [`/og-image.jpg`]
    },
    alternates: {
      canonical: `${baseUrl}/guide/${encodeURIComponent(locationName)}/tour`,
      languages: {
        'ko': `${baseUrl}/guide/${encodeURIComponent(locationName)}/tour?lang=ko`,
        'en': `${baseUrl}/guide/${encodeURIComponent(locationName)}/tour?lang=en`,
        'ja': `${baseUrl}/guide/${encodeURIComponent(locationName)}/tour?lang=ja`,
        'zh': `${baseUrl}/guide/${encodeURIComponent(locationName)}/tour?lang=zh`,
        'es': `${baseUrl}/guide/${encodeURIComponent(locationName)}/tour?lang=es`,
      }
    },
    other: {
      'article:author': 'TripRadio.AI',
      'article:section': 'Real-time Tour Guide',
      'article:tag': template.keywords.join(','),
      // AI Content Transparency
      'ai-content-declaration': `AI-generated real-time tour guide for ${locationName}`,
      'content-generation': 'AI-assisted',
      'ai-disclosure': `This ${locationName} real-time tour guide is generated with AI assistance`,
    }
  };
  
  return metadata;
}

// OpenGraph 로케일 매핑
function getOpenGraphLocale(language: string): string {
  const localeMap: Record<string, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    ja: 'ja_JP',
    zh: 'zh_CN',
    es: 'es_ES'
  };
  return localeMap[language] || 'ko_KR';
}

export default async function TourLayout({ children, params }: TourLayoutProps) {
  const resolvedParams = await params;
  const locationName = decodeURIComponent(resolvedParams.location || '');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  
  return (
    <>
      {/* Article Schema for tour content */}
      <ArticleSchema
        title={`${locationName} 실시간 투어 가이드`}
        description={`${locationName}의 AI 기반 실시간 투어 가이드입니다. 개인 맞춤형 음성 해설과 경로 안내를 제공합니다.`}
        url={`/guide/${encodeURIComponent(locationName)}/tour`}
        locationName={locationName}
        category="Real-time Tour Guide"
        readingTime={15}
      />
      
      {/* Breadcrumb Schema for navigation */}
      <BreadcrumbSchema items={generateTourBreadcrumb(locationName)} />
      
      {children}
    </>
  );
}