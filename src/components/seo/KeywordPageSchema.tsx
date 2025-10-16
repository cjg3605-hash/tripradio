// src/components/seo/KeywordPageSchema.tsx
'use client'

interface KeywordPageSchemaProps {
  keyword: string;
  pagePath?: string;
  title: string;
  description: string;
  features?: string[];
  type?: string;
  canonicalUrl?: string;
  breadcrumbs?: { name: string; url: string; }[];
}

export function KeywordPageSchema({ 
  keyword, 
  pagePath, 
  title, 
  description,
  features = [],
  type = 'service',
  canonicalUrl,
  breadcrumbs = []
}: KeywordPageSchemaProps) {
  
  const baseUrl = 'https://tripradio.shop';
  const finalPagePath = pagePath || canonicalUrl || '';
  
  // 키워드별 맞춤형 스키마 생성
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': ['WebPage', 'Service'],
    name: title,
    description,
    url: `${baseUrl}${finalPagePath}`,
    mainEntity: {
      '@type': 'Service',
      name: `TripRadio.AI ${keyword}`,
      description,
      provider: {
        '@type': 'Organization',
        name: 'TripRadio.AI',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`
      },
      serviceType: keyword,
      category: '여행 서비스',
      audience: {
        '@type': 'Audience',
        audienceType: ['여행객', '관광객', '문화 애호가', '혼자 여행하는 사람']
      },
      areaServed: {
        '@type': 'Place',
        name: '전 세계'
      },
      availableLanguage: ['ko', 'en', 'ja', 'zh', 'es'],
      serviceOutput: {
        '@type': 'AudioObject',
        name: `AI 기반 ${keyword} 해설`,
        description: `인공지능이 실시간으로 생성하는 ${keyword} 서비스`
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString(),
        eligibleRegion: {
          '@type': 'Place',
          name: '전 세계'
        }
      },
      ...(features.length > 0 && {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${keyword} 서비스 기능`,
          itemListElement: features.map((feature, index) => ({
            '@type': 'Offer',
            position: index + 1,
            name: feature,
            description: `${keyword} 서비스의 ${feature} 기능`
          }))
        }
      })
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'TripRadio.AI',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: keyword,
          item: `${baseUrl}${finalPagePath}`
        }
      ]
    },
    potentialAction: {
      '@type': 'ConsumeAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}${finalPagePath}`
      },
      object: {
        '@type': 'Service',
        name: `${keyword} 서비스 이용`
      }
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'TripRadio.AI',
      url: baseUrl
    },
    inLanguage: 'ko',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'TripRadio.AI'
    },
    publisher: {
      '@type': 'Organization',
      name: 'TripRadio.AI',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  );
}