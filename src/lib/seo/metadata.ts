// src/lib/seo/metadata.ts
import type { Metadata, Viewport } from 'next';
import { MetadataRoute } from 'next';

export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es';

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
}

const SEO_CONFIGS: Record<SupportedLanguage, SEOConfig> = {
  ko: {
    title: 'NaviDocent - AI 여행 도슨트 가이드',
    description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 다국어 지원으로 완벽한 여행 경험을 제공합니다.',
    keywords: [
      'AI', '여행', '도슨트', '가이드', '관광', '투어', '음성가이드', '다국어', '한국여행', 'Korea tour', 'AI guide'
    ],
    ogTitle: 'NaviDocent - AI 여행 도슨트 가이드',
    ogDescription: 'AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 다국어 지원으로 완벽한 여행 경험을 제공합니다.'
  },
  en: {
    title: 'NaviDocent - AI Travel Docent Guide',
    description: 'AI-powered personalized travel docent service. Experience perfect travel with real-time voice guides and multilingual support.',
    keywords: [
      'AI', 'travel', 'docent', 'guide', 'tourism', 'tour', 'voice guide', 'multilingual', 'Korea travel', 'AI guide'
    ],
    ogTitle: 'NaviDocent - AI Travel Docent Guide',
    ogDescription: 'AI-powered personalized travel docent service. Experience perfect travel with real-time voice guides and multilingual support.'
  },
  ja: {
    title: 'NAVI - AIパーソナライズ旅行ガイド',
    description: 'AIがリアルタイムで生成するパーソナライズされた旅行ガイド。世界中どこでも詳細なオーディオガイドを体験できます。',
    keywords: [
      'AIガイド', '旅行ガイド', '観光ガイド', 'オーディオガイド', 'パーソナライズ旅行',
      'スマートツアー', 'リアルタイムガイド', '旅行情報', '観光アプリ', '旅行アシスタント'
    ],
    ogTitle: 'NAVI - AIで作るパーソナライズ旅行ガイド',
    ogDescription: 'AIがリアルタイムで生成するパーソナライズされた旅行ガイドを世界中どこでも発見しよう。'
  },
  zh: {
    title: 'NAVI - AI个性化旅行指南',
    description: 'AI实时生成的个性化旅行指南。在世界任何地方都能体验详细的音频导览。',
    keywords: [
      'AI导游', '旅行指南', '旅游导览', '音频导游', '个性化旅行',
      '智能旅游', '实时导览', '旅行信息', '旅游应用', '旅行助手'
    ],
    ogTitle: 'NAVI - AI驱动的个性化旅行指南',
    ogDescription: '在世界任何地方发现AI实时生成的个性化旅行指南。'
  },
  es: {
    title: 'NAVI - Guía de Viaje Personalizada con IA',
    description: 'Guías de viaje personalizadas generadas en tiempo real por IA. Experimenta guías de audio detalladas para destinos turísticos de todo el mundo.',
    keywords: [
      'guía AI', 'guía de viaje', 'guía turística', 'guía de audio', 'viaje personalizado',
      'tour inteligente', 'guía en tiempo real', 'información de viaje', 'aplicación de turismo', 'asistente de viaje'
    ],
    ogTitle: 'NAVI - Guías de Viaje Personalizadas con IA',
    ogDescription: 'Descubre guías de viaje personalizadas generadas por IA en tiempo real, en cualquier lugar del mundo.'
  }
};

const BASE_DOMAINS: Record<SupportedLanguage, string> = {
  ko: 'https://navidocent.com',
  en: 'https://navidocent.com/en',
  ja: 'https://navidocent.com/ja',
  zh: 'https://navidocent.com/zh',
  es: 'https://navidocent.com/es',
};

const LOCALE_MAP: Record<SupportedLanguage, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_CN',
  es: 'es_ES',
};

/**
 * 기본 메타데이터 생성 (viewport 제거)
 */
export function generateBaseMetadata(
  language: SupportedLanguage = 'ko',
  customTitle?: string,
  customDescription?: string
): Metadata {
  const config = SEO_CONFIGS[language];
  const domain = BASE_DOMAINS[language];
  const locale = LOCALE_MAP[language];
  
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  
  return {
    title: {
      default: title,
      template: `%s | NAVI AI Guide`,
    },
    description,
    keywords: config.keywords,
    authors: [{ name: 'NAVI Team' }],
    creator: 'NAVI',
    publisher: 'NAVI',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(domain),
    alternates: {
      canonical: domain,
      languages: {
        'ko': BASE_DOMAINS.ko,
        'en': BASE_DOMAINS.en,
        'ja': BASE_DOMAINS.ja,
        'zh': BASE_DOMAINS.zh,
        'es': BASE_DOMAINS.es,
        'x-default': BASE_DOMAINS.ko,
      },
    },
    openGraph: {
      type: 'website',
      locale,
      alternateLocale: Object.values(LOCALE_MAP).filter(l => l !== locale),
      url: domain,
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      siteName: 'NAVI',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'NAVI AI Guide',
        },
        {
          url: '/og-image-square.jpg',
          width: 600,
          height: 600,
          alt: 'NAVI AI Guide',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      images: ['/og-image.jpg'],
      creator: '@navi_guide',
      site: '@navi_guide',
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
      google: process.env.GOOGLE_VERIFICATION_ID,
      other: {
        'naver-site-verification': process.env.NAVER_VERIFICATION_ID || '',
        'facebook-domain-verification': process.env.FACEBOOK_VERIFICATION_ID || '',
      },
    },
  };
}

/**
 * 가이드 페이지 메타데이터 생성
 */
export function generateGuideMetadata(
  guideName: string,
  language: SupportedLanguage = 'ko',
  guideData?: {
    description?: string;
    duration?: string;
    difficulty?: string;
    imageUrl?: string;
  }
): Metadata {
  const config = SEO_CONFIGS[language];
  const domain = BASE_DOMAINS[language];
  const locale = LOCALE_MAP[language];
  
  const titleTemplates: Record<SupportedLanguage, string> = {
    ko: `${guideName} 가이드 - AI 오디오 투어`,
    en: `${guideName} Guide - AI Audio Tour`,
    ja: `${guideName} ガイド - AIオーディオツアー`,
    zh: `${guideName} 导览 - AI语音导游`,
    es: `${guideName} Guía - Tour de Audio AI`,
  };
  
  const descriptionTemplates: Record<SupportedLanguage, string> = {
    ko: `${guideName}의 상세한 AI 오디오 가이드입니다. ${guideData?.duration || '약 1-2시간'}의 몰입형 투어를 통해 ${guideName}의 숨겨진 이야기를 발견해보세요.`,
    en: `Detailed AI audio guide for ${guideName}. Discover hidden stories of ${guideName} through ${guideData?.duration || 'approximately 1-2 hours'} of immersive tour.`,
    ja: `${guideName}の詳細なAIオーディオガイドです。${guideData?.duration || '約1-2時間'}の没入型ツアーで${guideName}の隠された物語を発見してください。`,
    zh: `${guideName}的详细AI语音导览。通过${guideData?.duration || '约1-2小时'}的沉浸式导览发现${guideName}的隐藏故事。`,
    es: `Guía de audio AI detallada para ${guideName}. Descubre historias ocultas de ${guideName} a través de ${guideData?.duration || 'aproximadamente 1-2 horas'} de tour inmersivo.`,
  };
  
  const title = titleTemplates[language];
  const description = guideData?.description || descriptionTemplates[language];
  
  return {
    title,
    description,
    keywords: [
      ...config.keywords,
      guideName,
      ...(language === 'ko' ? [`${guideName} 가이드`, `${guideName} 투어`, `${guideName} 관광`] : []),
      ...(language === 'en' ? [`${guideName} guide`, `${guideName} tour`, `${guideName} tourism`] : []),
      ...(language === 'ja' ? [`${guideName} ガイド`, `${guideName} ツアー`, `${guideName} 観光`] : []),
      ...(language === 'zh' ? [`${guideName} 导览`, `${guideName} 旅游`, `${guideName} 景点`] : []),
      ...(language === 'es' ? [`${guideName} guía`, `${guideName} tour`, `${guideName} turismo`] : []),
    ],
    openGraph: {
      title,
      description,
      url: `${domain}/guide/${encodeURIComponent(guideName)}`,
      images: guideData?.imageUrl ? [
        {
          url: guideData.imageUrl,
          width: 1200,
          height: 630,
          alt: `${guideName} 가이드`,
        }
      ] : undefined,
    },
    twitter: {
      title,
      description,
      images: guideData?.imageUrl ? [guideData.imageUrl] : undefined,
    },
  };
}

/**
 * 공통 viewport 설정
 */
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * 사이트맵 URL 생성 (빌드 오류 해결)
 */
export function generateSitemapUrls(guides: Array<{ name: string; slug?: string }>): MetadataRoute.Sitemap {
  const baseUrl = 'https://navidocent.com';
  const languages: SupportedLanguage[] = ['ko', 'en', 'ja', 'zh', 'es'];
  const now = new Date();
  
  const urls: MetadataRoute.Sitemap = [
    // 메인 페이지들
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          ko: `${baseUrl}`,
          en: `${BASE_DOMAINS.en}`,
          ja: `${BASE_DOMAINS.ja}`,
          zh: `${BASE_DOMAINS.zh}`,
          es: `${BASE_DOMAINS.es}`,
        }
      }
    },
    // 가이드 목록 페이지
    {
      url: `${baseUrl}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // 검색 페이지
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }
  ];

  // 각 가이드에 대한 URL 생성
  guides.forEach(guide => {
    const guidePath = guide.slug || encodeURIComponent(guide.name);
    
    languages.forEach(lang => {
      const domain = BASE_DOMAINS[lang];
      urls.push({
        url: `${domain}/guide/${guidePath}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            languages.map(l => [l, `${BASE_DOMAINS[l]}/guide/${guidePath}`])
          )
        }
      });
    });
  });

  return urls;
}

/**
 * JSON-LD 구조화 데이터 생성
 */
export function generateJsonLd(
  type: 'WebSite' | 'Article' | 'TouristAttraction',
  data: any,
  language: SupportedLanguage = 'ko'
) {
  const config = SEO_CONFIGS[language];
  const domain = BASE_DOMAINS[language];

  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'WebSite':
      return {
        ...baseStructure,
        name: config.title,
        description: config.description,
        url: domain,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${domain}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      };

    case 'TouristAttraction':
      return {
        ...baseStructure,
        name: data.name,
        description: data.description,
        image: data.imageUrl,
        address: data.address,
        geo: data.coordinates ? {
          '@type': 'GeoCoordinates',
          latitude: data.coordinates.lat,
          longitude: data.coordinates.lng
        } : undefined,
        touristType: 'tourist attraction',
        isAccessibleForFree: data.isFree
      };

    case 'Article':
      return {
        ...baseStructure,
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Organization',
          name: 'NAVI AI Guide'
        },
        publisher: {
          '@type': 'Organization',
          name: 'NAVI',
          logo: {
            '@type': 'ImageObject',
            url: `${domain}/logo.png`
          }
        },
        datePublished: data.publishedAt,
        dateModified: data.updatedAt,
        image: data.imageUrl
      };

    default:
      return baseStructure;
  }
}