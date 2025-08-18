// src/components/seo/ServiceSchema.tsx
import React from 'react';

interface ServiceData {
  name: string;
  description: string;
  url: string;
  logo?: string;
  images?: string[];
  serviceType: string;
  provider: string;
  areaServed: string[];
  availableLanguage: string[];
  offers?: {
    name: string;
    description: string;
    price: string;
    priceCurrency: string;
    availability: string;
    validFrom: string;
  }[];
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
    bestRating: number;
    worstRating: number;
  };
  features?: string[];
  contactPoint?: {
    contactType: string;
    availableLanguage: string[];
    hoursAvailable: {
      opens: string;
      closes: string;
    };
  };
  sameAs?: string[];
}

interface ServiceSchemaProps {
  data: ServiceData;
}

const ServiceSchema: React.FC<ServiceSchemaProps> = ({ data }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${data.url}#service`,
    name: data.name,
    description: data.description,
    url: data.url,
    
    // 로고 및 이미지
    ...(data.logo && {
      logo: {
        "@type": "ImageObject",
        url: data.logo,
        width: 200,
        height: 200
      }
    }),
    
    ...(data.images && data.images.length > 0 && {
      image: data.images.map(img => ({
        "@type": "ImageObject",
        url: img,
        contentUrl: img
      }))
    }),
    
    // 서비스 유형
    serviceType: data.serviceType,
    
    // 제공업체
    provider: {
      "@type": "Organization",
      name: data.provider,
      url: data.url,
      ...(data.logo && {
        logo: {
          "@type": "ImageObject",
          url: data.logo
        }
      })
    },
    
    // 서비스 지역
    areaServed: data.areaServed.map(area => ({
      "@type": "Country",
      name: area
    })),
    
    // 지원 언어
    availableLanguage: data.availableLanguage,
    
    // 서비스 제안
    ...(data.offers && data.offers.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `${data.name} 서비스`,
        itemListElement: data.offers.map((offer, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Service",
            name: offer.name,
            description: offer.description
          },
          price: offer.price,
          priceCurrency: offer.priceCurrency,
          availability: offer.availability,
          validFrom: offer.validFrom
        }))
      }
    }),
    
    // 평점
    ...(data.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.aggregateRating.ratingValue,
        ratingCount: data.aggregateRating.ratingCount,
        bestRating: data.aggregateRating.bestRating,
        worstRating: data.aggregateRating.worstRating
      }
    }),
    
    // 기능/특징
    ...(data.features && data.features.length > 0 && {
      features: data.features
    }),
    
    // 연락처
    ...(data.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: data.contactPoint.contactType,
        availableLanguage: data.contactPoint.availableLanguage,
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: data.contactPoint.hoursAvailable.opens,
          closes: data.contactPoint.hoursAvailable.closes
        }
      }
    }),
    
    // 소셜 미디어
    ...(data.sameAs && data.sameAs.length > 0 && {
      sameAs: data.sameAs
    }),
    
    // 생성/수정 일자 (고정값으로 hydration 오류 방지)
    dateCreated: "2024-01-01",
    dateModified: "2024-08-18",
    
    // 업계 분류
    category: "Travel Technology",
    
    // 추가 속성
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "AI Technology",
        value: "Advanced AI-powered travel guidance"
      },
      {
        "@type": "PropertyValue",
        name: "Real-time Service",
        value: "Live GPS-based audio guidance"
      },
      {
        "@type": "PropertyValue",
        name: "Multilingual Support",
        value: "5 languages supported"
      }
    ],
    
    // 서비스 출력
    serviceOutput: {
      "@type": "CreativeWork",
      name: "Personalized Travel Audio Guide",
      description: "AI-generated personalized travel narration and guidance"
    },
    
    // 메인 엔티티
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 0)
      }}
    />
  );
};

export default ServiceSchema;