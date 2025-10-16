// src/components/seo/StructuredData.tsx (Google Search Console 최적화)
import React from 'react';

interface StructuredDataProps {
  type?: 'WebSite' | 'TravelAgency' | 'TouristAttraction' | 'SoftwareApplication' | 'TravelGuide' | 'LocalBusiness';
  data?: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type = 'WebSite', data = {} }) => {
  // 일관된 브랜드명과 URL 사용
  const BRAND_NAME = 'TripRadio.AI';
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop';
  const LOGO_URL = `${BASE_URL}/logo.png`;
  
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseData,
          '@id': `${BASE_URL}#website`,
          name: BRAND_NAME,
          url: BASE_URL,
          description: 'AI 기반 개인 맞춤형 여행 가이드 서비스. 실시간 음성 해설과 다국어 지원으로 완벽한 여행 경험을 제공합니다.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${BASE_URL}/guide/ko/{search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            '@id': `${BASE_URL}#organization`,
            name: BRAND_NAME
          },
          inLanguage: ['ko', 'en', 'ja', 'zh', 'es'],
          ...data
        };

      case 'TravelAgency':
        return {
          ...baseData,
          '@id': `${BASE_URL}#travelagency`,
          name: BRAND_NAME,
          url: BASE_URL,
          description: 'AI 기반 개인 맞춤형 여행 가이드 서비스',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'KR',
            addressRegion: 'Seoul'
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['Korean', 'English', 'Japanese', 'Chinese', 'Spanish']
          },
          serviceType: 'AI Travel Guide Service',
          areaServed: [
            {
              '@type': 'Country',
              name: 'South Korea'
            }
          ],
          ...data
        };

      case 'SoftwareApplication':
        return {
          ...baseData,
          '@id': `${BASE_URL}#softwareapplication`,
          name: BRAND_NAME,
          applicationCategory: 'TravelApplication',
          operatingSystem: ['Web Browser', 'iOS', 'Android'],
          description: 'AI 기반 개인 맞춤형 여행 가이드 서비스',
          url: BASE_URL,
          softwareVersion: '1.0',
          datePublished: '2024-01-01',
          dateModified: '2025-01-14',  // Fixed date to prevent hydration mismatch
          author: {
            '@type': 'Organization',
            '@id': `${BASE_URL}#organization`,
            name: BRAND_NAME
          },
          publisher: {
            '@type': 'Organization',
            '@id': `${BASE_URL}#organization`,
            name: BRAND_NAME
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'KRW',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '100',
            bestRating: '5',
            worstRating: '1'
          },
          ...data
        };

      case 'TouristAttraction':
        return {
          ...baseData,
          name: data.name || 'Korean Tourist Attractions',
          description: data.description || 'Discover amazing tourist attractions in Korea with AI-powered guides',
          image: data.image || `${BASE_URL}/images/korea-attractions.jpg`,
          url: data.url || `${BASE_URL}/destinations`,
          address: data.address || {
            '@type': 'PostalAddress',
            addressCountry: 'KR'
          },
          ...(data.coordinates && {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: data.coordinates.latitude,
              longitude: data.coordinates.longitude
            }
          }),
          touristType: ['Leisure', 'Business', 'Cultural', 'Educational'],
          availableLanguage: ['Korean', 'English', 'Japanese', 'Chinese', 'Spanish'],
          ...data
        };

      case 'TravelGuide':
        return {
          ...baseData,
          '@id': data.url ? `${data.url}#travelguide` : undefined,
          name: data.name || `${data.location} 여행 가이드`,
          description: data.description || `${data.location}의 상세한 여행 가이드`,
          url: data.url,
          mainEntity: {
            '@type': 'Place',
            name: data.location,
            description: data.description,
            ...(data.coordinates && {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: data.coordinates.latitude,
                longitude: data.coordinates.longitude
              }
            }),
            ...(data.address && { address: data.address })
          },
          author: {
            '@type': 'Organization',
            '@id': `${BASE_URL}#organization`,
            name: BRAND_NAME,
            url: BASE_URL
          },
          publisher: {
            '@type': 'Organization',
            '@id': `${BASE_URL}#organization`,
            name: BRAND_NAME,
            url: BASE_URL,
            logo: {
              '@type': 'ImageObject',
              url: LOGO_URL
            }
          },
          inLanguage: data.language || 'ko',
          datePublished: data.datePublished,
          dateModified: data.dateModified,  // Only use provided date, don't generate new one
          ...(data.rating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: data.rating,
              bestRating: '5',
              worstRating: '1',
              ratingCount: data.reviewCount || 1
            }
          }),
          keywords: data.keywords?.join(', '),
          image: data.images || [`${BASE_URL}/guide-images/${encodeURIComponent(data.location || 'default')}.jpg`],
          ...data
        };

      case 'LocalBusiness':
        return {
          ...baseData,
          '@id': `${BASE_URL}#localbusiness`,
          name: BRAND_NAME,
          description: 'AI 기반 개인 맞춤형 여행 가이드 서비스',
          url: BASE_URL,
          logo: {
            '@type': 'ImageObject',
            url: LOGO_URL
          },
          telephone: data.telephone,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'KR',
            addressRegion: 'Seoul',
            ...data.address
          },
          geo: data.geo,
          openingHours: data.openingHours || ['Mo-Su 00:00-23:59'],
          serviceArea: {
            '@type': 'Country',
            name: 'South Korea'
          },
          makesOffer: {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'AI 여행 가이드 서비스',
              description: '실시간 음성 가이드와 다국어 지원'
            }
          },
          aggregateRating: data.aggregateRating,
          ...data
        };

      default:
        return { ...baseData, ...data };
    }
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
};

export default StructuredData;