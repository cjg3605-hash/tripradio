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
    title: 'NaviDocent.AI - 나비도슨트 AI 여행 가이드',
    description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 5개 언어 지원으로 완벽한 여행 경험을 제공합니다. 경복궁, 제주도, 부산 등 한국 전국 여행지 가이드 제공.',
    keywords: [
      'NaviDocent', '나비도슨트', 'AI여행가이드', '여행도슨트', '음성가이드', '오디오가이드', 'AI가이드', '개인맞춤여행', '한국여행', '관광가이드', '여행앱', '도슨트서비스', '실시간가이드', '다국어가이드', '스마트관광', 'TTS음성', 'PWA앱', '오프라인가이드', '위치기반가이드', '문화해설'
    ],
    ogTitle: 'NaviDocent.AI - 나비도슨트 AI 여행 가이드',
    ogDescription: 'AI가 만드는 개인 맞춤형 여행 도슨트. 한국 전국 여행지의 상세한 음성 가이드를 실시간으로 제공합니다.'
  },
  en: {
    title: 'TripRadio.AI - Travel Audio Guide AI',
    description: 'AI-powered personalized travel audio guide. Experience special travel with professional docent voice guides and multilingual support.',
    keywords: [
      'TripRadio.AI', 'audio guide', 'travel', 'AI guide', 'docent', 'tourism', 'tour', 'voice guide', 'multilingual', 'Korea travel', 'travel audio guide'
    ],
    ogTitle: 'TripRadio.AI - Travel Audio Guide AI',
    ogDescription: 'AI-powered personalized travel audio guide. Experience special travel with professional docent voice guides and multilingual support.'
  },
  ja: {
    title: 'TripRadio.AI - 旅行ラジオAIガイド',
    description: 'AIが作るパーソナライズされた旅行ラジオ。世界中どこでも特別なオーディオガイドを体験できます。',
    keywords: [
      'TripRadio.AI', '旅行ラジオ', '旅行ガイド', 'AIガイド', 'オーディオガイド', 'パーソナライズ旅行',
      'スマートツアー', 'リアルタイムガイド', '旅行情報', '観光アプリ', '旅行アシスタント'
    ],
    ogTitle: 'TripRadio.AI - 旅行ラジオAIガイド',
    ogDescription: 'AIが作るパーソナライズされた旅行ラジオを世界中どこでも発見しよう。'
  },
  zh: {
    title: 'TripRadio.AI - 旅行电台AI指南',
    description: 'AI打造的个性化旅行电台。在世界任何地方都能体验特别的音频导览。',
    keywords: [
      'TripRadio.AI', '旅行电台', '旅行指南', 'AI导游', '音频导游', '个性化旅行',
      '智能旅游', '实时导览', '旅行信息', '旅游应用', '旅行助手'
    ],
    ogTitle: 'TripRadio.AI - 旅行电台AI指南',
    ogDescription: '在世界任何地方发现AI打造的个性化旅行电台。'
  },
  es: {
    title: 'TripRadio.AI - Radio de Viaje con IA',
    description: 'Radio de viaje personalizada creada por IA. Experimenta guías de audio especiales para destinos turísticos de todo el mundo.',
    keywords: [
      'TripRadio.AI', 'radio de viaje', 'guía de viaje', 'guía AI', 'guía de audio', 'viaje personalizado',
      'tour inteligente', 'guía en tiempo real', 'información de viaje', 'aplicación de turismo', 'asistente de viaje'
    ],
    ogTitle: 'TripRadio.AI - Radio de Viaje con IA',
    ogDescription: 'Descubre radio de viaje personalizada creada por IA en tiempo real, en cualquier lugar del mundo.'
  }
};

// 정규화된 도메인 사용 (리디렉션 없는 최종 URL)
const BASE_DOMAIN = 'https://tripradio.shop';

const LOCALE_MAP: Record<SupportedLanguage, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_CN',
  es: 'es_ES',
};

/**
 * 키워드 페이지용 메타데이터 생성 (hreflang 최적화)
 */
export function generateKeywordPageMetadata(
  pagePath: string,
  language: SupportedLanguage = 'ko',
  customTitle?: string,
  customDescription?: string,
  keywords?: string[]
): Metadata {
  const config = SEO_CONFIGS[language];
  const domain = BASE_DOMAIN;
  const locale = LOCALE_MAP[language];
  
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  
  return {
    title: {
      default: title,
      template: `%s | TripRadio.AI`,
    },
    description,
    keywords: keywords || config.keywords,
    authors: [{ name: 'TripRadio.AI Team' }],
    creator: 'TripRadio.AI',
    publisher: 'TripRadio.AI',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(domain),
    alternates: {
      canonical: `${domain}${pagePath}`,
      languages: {
        'ko': `${BASE_DOMAIN}${pagePath.replace(/\/(en|ja|zh|es)\//, '/ko/')}`,
        'en': `${BASE_DOMAIN}${pagePath.replace(/\/(ko|ja|zh|es)\//, '/en/')}`,
        'ja': `${BASE_DOMAIN}${pagePath.replace(/\/(ko|en|zh|es)\//, '/ja/')}`,
        'zh': `${BASE_DOMAIN}${pagePath.replace(/\/(ko|en|ja|es)\//, '/zh/')}`,
        'es': `${BASE_DOMAIN}${pagePath.replace(/\/(ko|en|ja|zh)\//, '/es/')}`,
        'x-default': `${BASE_DOMAIN}${pagePath.includes('/guide/') ? pagePath.replace(/\/(en|ja|zh|es)\//, '/ko/') : pagePath}`,
      },
    },
    openGraph: {
      type: 'website',
      locale,
      alternateLocale: Object.values(LOCALE_MAP).filter(l => l !== locale),
      url: `${domain}${pagePath}`,
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      siteName: 'TripRadio.AI',
      images: [
        {
          url: `${domain}/api/og?title=${encodeURIComponent(title)}&type=service&lang=${language}`,
          width: 1200,
          height: 630,
          alt: `${title} - TripRadio.AI`,
        },
        {
          url: '/og-image-square.svg',
          width: 600,
          height: 600,
          alt: 'TripRadio.AI Guide',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      images: ['/og-image.svg'],
      creator: '@tripradio_ai',
      site: '@tripradio_ai',
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
 * 기본 메타데이터 생성 (viewport 제거)
 */
export function generateBaseMetadata(
  language: SupportedLanguage = 'ko',
  customTitle?: string,
  customDescription?: string
): Metadata {
  const config = SEO_CONFIGS[language];
  const domain = BASE_DOMAIN;
  const locale = LOCALE_MAP[language];
  
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  
  return {
    title: {
      default: title,
      template: `%s | TripRadio.AI`,
    },
    description,
    keywords: config.keywords,
    authors: [{ name: 'TripRadio.AI Team' }],
    creator: 'TripRadio.AI',
    publisher: 'TripRadio.AI',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(domain),
    alternates: {
      canonical: domain,
      languages: {
        'ko': BASE_DOMAIN,
        'en': BASE_DOMAIN,
        'ja': BASE_DOMAIN,
        'zh': BASE_DOMAIN,
        'es': BASE_DOMAIN,
        'x-default': BASE_DOMAIN,
      },
    },
    openGraph: {
      type: 'website',
      locale,
      alternateLocale: Object.values(LOCALE_MAP).filter(l => l !== locale),
      url: domain,
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      siteName: 'TripRadio.AI',
      images: [
        {
          url: '/og-image.svg',
          width: 1200,
          height: 630,
          alt: 'TripRadio.AI Guide',
        },
        {
          url: '/og-image-square.svg',
          width: 600,
          height: 600,
          alt: 'TripRadio.AI Guide',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.ogTitle || title,
      description: config.ogDescription || description,
      images: ['/og-image.svg'],
      creator: '@tripradio_ai',
      site: '@tripradio_ai',
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
  const domain = BASE_DOMAIN;
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
      url: `${domain}/guide/${language}/${encodeURIComponent(guideName)}`, // 🚀 새 URL 구조
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
 * 사이트맵 URL 생성 (실제 쿼리 파라미터 기반 구조에 맞게 수정)
 */
export function generateSitemapUrls(guides: Array<{ name: string; slug?: string }>): MetadataRoute.Sitemap {
  const baseUrl = 'https://tripradio.shop';
  const languages: SupportedLanguage[] = ['ko', 'en', 'ja', 'zh', 'es'];
  const now = new Date();
  
  const urls: MetadataRoute.Sitemap = [
    // 메인 페이지 (한국어 기본)
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
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

  // 🚀 각 가이드에 대한 URL 생성 (번역된 장소명 사용)
  guides.forEach(guide => {
    // 번역 시스템 사용하여 언어별 URL 생성
    try {
      const { generateLocalizedGuideUrls } = require('./locationTranslation');
      const localizedUrls = generateLocalizedGuideUrls(guide.name);
      
      localizedUrls.forEach(({ language, url, localizedName }) => {
        urls.push({
          url: url,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.9,
          // 🚀 다국어 alternate 링크 (번역된 장소명 사용)
          alternates: {
            languages: Object.fromEntries(
              localizedUrls.map(item => [item.language, item.url])
            )
          }
        });
      });
    } catch (error) {
      // 번역 모듈 없으면 기존 방식 사용
      console.log('📝 번역 모듈 없음, 기본 사이트맵 생성:', error);
      const guidePath = guide.slug || encodeURIComponent(guide.name);
      
      languages.forEach(lang => {
        // 🚀 기본 URL 구조: /guide/[language]/[location]
        const guideUrl = `${baseUrl}/guide/${lang}/${guidePath}`;
          
        urls.push({
          url: guideUrl,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: Object.fromEntries(
              languages.map(l => [l, `${baseUrl}/guide/${l}/${guidePath}`])
            )
          }
        });
      });
    }
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
  const domain = BASE_DOMAIN; // 정규화된 도메인 사용

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
        },
        // 다국어 지원 추가
        inLanguage: Object.keys(SEO_CONFIGS),
        // 정규화된 도메인 강조
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': domain
        }
      };

    case 'TouristAttraction':
      return {
        ...baseStructure,
        name: data.name,
        description: data.description,
        image: data.imageUrl,
        address: data.address,
        url: data.url || `${domain}/guide/${language}/${encodeURIComponent(data.name)}`, // 새로운 URL 구조
        geo: data.coordinates ? {
          '@type': 'GeoCoordinates',
          latitude: data.coordinates.lat,
          longitude: data.coordinates.lng
        } : undefined,
        touristType: 'tourist attraction',
        isAccessibleForFree: data.isFree,
        // 가이드 정보 추가
        hasMap: `${domain}/guide/${language}/${encodeURIComponent(data.name)}`,
        audienceType: 'tourist'
      };

    case 'Article':
      return {
        ...baseStructure,
        headline: data.title,
        description: data.description,
        url: data.url || domain,
        author: {
          '@type': 'Organization',
          name: 'TripRadio.AI',
          url: domain
        },
        publisher: {
          '@type': 'Organization',
          name: 'TripRadio.AI',
          url: domain,
          logo: {
            '@type': 'ImageObject',
            url: `${domain}/logo.svg`
          }
        },
        datePublished: data.publishedAt,
        dateModified: data.updatedAt,
        image: data.imageUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url || domain
        }
      };

    default:
      return baseStructure;
  }
}

/**
 * 네이버 SEO 최적화 메타데이터 생성
 */
export function generateNaverOptimizedMetadata(
  pagePath: string,
  guideData: {
    location: string;
    description: string;
    keywords?: string[];
    coordinates?: { latitude: number; longitude: number };
    rating?: number;
    lastModified?: Date;
  },
  language: SupportedLanguage = 'ko'
): Metadata {
  const config = SEO_CONFIGS[language];
  const domain = BASE_DOMAIN;
  const { location, description, keywords = [], coordinates, rating, lastModified } = guideData;
  
  // 네이버 검색 최적화 키워드 조합
  const naverKeywords = [
    ...config.keywords,
    location,
    `${location} 가이드`,
    `${location} 여행`,
    `${location} 관광`,
    `${location} 도슨트`,
    `${location} 투어`,
    ...keywords
  ];

  const title = `${location} 가이드 - 나비도슨트 AI 여행 가이드`;
  const ogTitle = `${location} AI 여행 가이드 | NaviDocent`;
  const metaDescription = `${location}의 상세한 AI 음성 가이드. ${description} 실시간 위치 기반 해설과 다국어 지원으로 완벽한 여행 경험을 제공합니다.`;

  return {
    title,
    description: metaDescription,
    keywords: naverKeywords,
    authors: [{ name: 'NaviDocent AI Team' }],
    creator: 'NaviDocent.AI',
    publisher: 'NaviDocent.AI',
    metadataBase: new URL(domain),
    alternates: {
      canonical: `${domain}${pagePath}`,
      languages: {
        'ko': `${domain}${pagePath.replace(/\/(en|ja|zh|es)\//, '/ko/')}`,
        'en': `${domain}${pagePath.replace(/\/(ko|ja|zh|es)\//, '/en/')}`,
        'ja': `${domain}${pagePath.replace(/\/(ko|en|zh|es)\//, '/ja/')}`,
        'zh': `${domain}${pagePath.replace(/\/(ko|en|ja|es)\//, '/zh/')}`,
        'es': `${domain}${pagePath.replace(/\/(ko|en|ja|zh)\//, '/es/')}`,
        'x-default': `${domain}${pagePath.includes('/guide/') ? pagePath.replace(/\/(en|ja|zh|es)\//, '/ko/') : pagePath}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      url: `${domain}${pagePath}`,
      title: ogTitle,
      description: metaDescription,
      siteName: 'NaviDocent.AI',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(location)}&type=guide`,
          width: 1200,
          height: 630,
          alt: `${location} 가이드`,
        }
      ],
      ...(lastModified && { modifiedTime: lastModified.toISOString() }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: metaDescription,
      images: [`/api/og?title=${encodeURIComponent(location)}&type=guide`],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    other: {
      // 네이버 특화 메타 태그
      'naver-site-verification': process.env.NAVER_VERIFICATION_ID || '',
      // 추가 지역 정보
      ...(coordinates && {
        'geo.position': `${coordinates.latitude};${coordinates.longitude}`,
        'geo.placename': location,
        'geo.region': 'KR',
      }),
      // 콘텐츠 분류
      'content-type': 'travel-guide',
      'content-language': language,
      ...(rating && { 'rating': rating.toString() }),
    },
  };
}