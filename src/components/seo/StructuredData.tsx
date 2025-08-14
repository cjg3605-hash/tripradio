// src/components/seo/StructuredData.tsx
import React from 'react';

interface StructuredDataProps {
  type?: 'WebSite' | 'TravelAgency' | 'TouristAttraction' | 'SoftwareApplication';
  data?: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type = 'WebSite', data = {} }) => {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'WebSite':
        return {
          ...baseData,
          name: 'TripRadio',
          url: 'https://navidocent.com',
          description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 다국어 지원으로 완벽한 여행 경험을 제공합니다.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://navidocent.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'TripRadio',
            logo: {
              '@type': 'ImageObject',
              url: 'https://navidocent.com/logo.png'
            }
          },
          inLanguage: ['ko', 'en', 'ja', 'zh', 'es'],
          ...data
        };

      case 'TravelAgency':
        return {
          ...baseData,
          name: 'TripRadio',
          url: 'https://navidocent.com',
          description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스',
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
          areaServed: {
            '@type': 'Country',
            name: 'South Korea'
          },
          ...data
        };

      case 'SoftwareApplication':
        return {
          ...baseData,
          name: 'TripRadio',
          applicationCategory: 'TravelApplication',
          operatingSystem: 'Web Browser',
          description: 'AI 기반 개인 맞춤형 여행 도슨트 서비스',
          url: 'https://navidocent.com',
          softwareVersion: '1.0',
          datePublished: '2025-01-16',
          author: {
            '@type': 'Organization',
            name: 'TripRadio Team'
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'KRW'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '100'
          },
          ...data
        };

      case 'TouristAttraction':
        return {
          ...baseData,
          name: data.name || 'Korean Tourist Attractions',
          description: data.description || 'Discover amazing tourist attractions in Korea with AI-powered guides',
          image: data.image || 'https://navidocent.com/korea-attractions.jpg',
          url: data.url || 'https://navidocent.com/destinations',
          address: data.address || {
            '@type': 'PostalAddress',
            addressCountry: 'KR'
          },
          geo: data.geo,
          touristType: ['Leisure', 'Business', 'Cultural', 'Educational'],
          availableLanguage: ['Korean', 'English', 'Japanese', 'Chinese', 'Spanish'],
          ...data
        };

      default:
        return { ...baseData, ...data };
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
};

export default StructuredData;