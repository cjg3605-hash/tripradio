import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

interface GuideMetadataProps {
  locationName: string;
  language: string;
  guideContent?: any;
}

// 언어별 메타데이터 템플릿
const metadataTemplates = {
  ko: {
    titleTemplate: '{location} 여행 가이드 - NaviDocent AI',
    descriptionTemplate: '{location}의 개인 맞춤형 AI 여행 가이드입니다. 실시간 음성 안내와 다국어 지원으로 완벽한 {location} 여행 경험을 제공합니다.',
    keywords: ['여행 가이드', 'AI 가이드', '개인 맞춤', '실시간 안내', '한국 여행']
  },
  en: {
    titleTemplate: '{location} Travel Guide - NaviDocent AI',
    descriptionTemplate: 'Personalized AI travel guide for {location}. Experience perfect {location} travel with real-time voice guidance and multilingual support.',
    keywords: ['travel guide', 'AI guide', 'personalized', 'real-time guidance', 'Korea travel']
  },
  ja: {
    titleTemplate: '{location}旅行ガイド - NaviDocent AI',
    descriptionTemplate: '{location}のパーソナライズドAI旅行ガイドです。リアルタイム音声案内と多言語サポートで完璧な{location}旅行体験を提供します。',
    keywords: ['旅行ガイド', 'AIガイド', 'パーソナライズド', 'リアルタイム案内', '韓国旅行']
  },
  zh: {
    titleTemplate: '{location}旅行指南 - NaviDocent AI',
    descriptionTemplate: '{location}的个性化AI旅行指南。通过实时语音导览和多语言支持，为您提供完美的{location}旅行体验。',
    keywords: ['旅行指南', 'AI导览', '个性化', '实时导览', '韩国旅行']
  },
  es: {
    titleTemplate: 'Guía de Viaje de {location} - NaviDocent AI',
    descriptionTemplate: 'Guía de viaje personalizada con IA para {location}. Experimenta el viaje perfecto a {location} con orientación de voz en tiempo real y soporte multiidioma.',
    keywords: ['guía de viaje', 'guía IA', 'personalizada', 'orientación en tiempo real', 'viaje a Corea']
  }
};

export async function generateGuideMetadata({
  locationName,
  language,
  guideContent
}: GuideMetadataProps): Promise<Metadata> {
  const template = metadataTemplates[language as keyof typeof metadataTemplates] || metadataTemplates.ko;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  
  // 가이드 내용에서 실제 정보 추출
  let extractedDescription = template.descriptionTemplate.replace(/{location}/g, locationName);
  let extractedImage = '';
  let duration = '';
  
  if (guideContent?.content) {
    try {
      const content = typeof guideContent.content === 'string' 
        ? JSON.parse(guideContent.content) 
        : guideContent.content;
      
      // 실제 가이드 설명 사용
      if (content.overview || content.description) {
        const overview = content.overview || content.description;
        extractedDescription = overview.length > 160 
          ? overview.substring(0, 157) + '...' 
          : overview;
      }
      
      // 이미지 URL 추출
      if (content.images && content.images.length > 0) {
        extractedImage = content.images[0];
      }
      
      // 소요시간 추출
      if (content.duration) {
        duration = content.duration;
      }
    } catch (e) {
      console.log('가이드 메타데이터 추출 실패:', e);
    }
  }
  
  // 템플릿에서 {location} 치환
  const title = template.titleTemplate.replace(/{location}/g, locationName);
  const description = extractedDescription;
  
  // 가이드 내용에서 추가 키워드 추출 (선택적)
  let additionalKeywords: string[] = [];
  if (guideContent?.content) {
    try {
      const content = typeof guideContent.content === 'string' 
        ? JSON.parse(guideContent.content) 
        : guideContent.content;
      
      // 가이드 섹션에서 키워드 추출
      if (content.sections && Array.isArray(content.sections)) {
        content.sections.forEach((section: any) => {
          if (section.title) {
            additionalKeywords.push(section.title);
          }
        });
      }
    } catch (e) {
      console.log('가이드 내용에서 키워드 추출 실패:', e);
    }
  }
  
  const allKeywords = [
    ...template.keywords,
    locationName,
    `${locationName} 가이드`,
    `${locationName} 여행`,
    ...additionalKeywords
  ].slice(0, 15); // SEO 최적화를 위해 키워드 수 제한
  
  const metadata: Metadata = {
    title,
    description,
    keywords: allKeywords,
    openGraph: {
      title,
      description,
      type: 'article',
      locale: getOpenGraphLocale(language),
      url: `${baseUrl}/guide/${encodeURIComponent(locationName)}`,
      siteName: 'NaviDocent',
      images: extractedImage ? [
        {
          url: extractedImage,
          width: 1200,
          height: 630,
          alt: `${locationName} Travel Guide - NaviDocent AI`
        }
      ] : [
        {
          url: `/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${locationName} Travel Guide - NaviDocent AI`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: extractedImage ? [extractedImage] : [`/og-image.jpg`]
    },
    alternates: {
      canonical: `${baseUrl}/guide/${encodeURIComponent(locationName)}`,
      languages: {
        'ko': `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=ko`,
        'en': `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=en`,
        'ja': `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=ja`,
        'zh': `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=zh`,
        'es': `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=es`,
      }
    },
    other: {
      'article:author': 'NaviDocent AI',
      'article:section': 'Travel Guide',
      'article:tag': allKeywords.join(','),
      // AI Content Transparency
      'ai-content-declaration': `AI-generated travel guide for ${locationName}`,
      'content-generation': 'AI-assisted',
      'ai-disclosure': `This ${locationName} travel guide is generated with AI assistance`,
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

// 가이드 내용을 기반으로 한 메타데이터 생성
export async function generateMetadataFromGuide(
  locationName: string, 
  language: string = 'ko'
): Promise<Metadata> {
  try {
    // 데이터베이스에서 가이드 내용 조회
    const { data: guideData } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', locationName.trim().toLowerCase())
      .eq('language', language.toLowerCase())
      .maybeSingle();
    
    return generateGuideMetadata({
      locationName,
      language,
      guideContent: guideData
    });
  } catch (error) {
    console.error('가이드 메타데이터 생성 실패:', error);
    
    // 오류 시 기본 메타데이터 반환
    return generateGuideMetadata({
      locationName,
      language
    });
  }
}