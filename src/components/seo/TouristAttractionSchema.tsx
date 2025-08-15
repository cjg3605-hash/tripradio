// src/components/seo/TouristAttractionSchema.tsx
import React from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TouristAttractionData {
  name: string;
  description: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  coordinates?: Coordinates;
  image?: string;
  website?: string;
  telephone?: string;
  email?: string;
  openingHours?: string[];
  priceRange?: string;
  category?: string[];
  language?: string[];
  accessibility?: string[];
  amenityFeature?: string[];
  touristType?: string[];
  starRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}

interface TouristAttractionSchemaProps {
  data: TouristAttractionData;
}

const TouristAttractionSchema: React.FC<TouristAttractionSchemaProps> = ({ data }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": `https://navidocent.com/guide/${encodeURIComponent(data.name)}#touristattraction`,
    name: data.name,
    description: data.description,
    url: data.website || `https://navidocent.com/guide/${encodeURIComponent(data.name)}`,
    
    // 주소 정보
    address: {
      "@type": "PostalAddress",
      streetAddress: data.address?.streetAddress,
      addressLocality: data.address?.addressLocality || data.name,
      addressRegion: data.address?.addressRegion || "서울특별시",
      postalCode: data.address?.postalCode,
      addressCountry: data.address?.addressCountry || "KR"
    },
    
    // 지리적 좌표
    ...(data.coordinates && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng
      }
    }),
    
    // 이미지 정보
    ...(data.image && {
      image: {
        "@type": "ImageObject",
        url: data.image,
        caption: `${data.name} - TripRadio.AI 여행 가이드`,
        contentUrl: data.image,
        width: 1200,
        height: 630
      }
    }),
    
    // 연락처 정보
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    
    // 운영 시간
    ...(data.openingHours && { openingHours: data.openingHours }),
    
    // 가격 정보
    ...(data.priceRange && { priceRange: data.priceRange }),
    
    // 카테고리
    ...(data.category && { category: data.category }),
    
    // 언어 지원
    availableLanguage: data.language || ["Korean", "English", "Japanese", "Chinese", "Spanish"],
    
    // 관광객 유형
    touristType: data.touristType || ["Leisure", "Cultural", "Educational", "Business"],
    
    // 접근성 정보
    ...(data.accessibility && {
      accessibilityFeature: data.accessibility
    }),
    
    // 편의시설
    ...(data.amenityFeature && {
      amenityFeature: data.amenityFeature.map(amenity => ({
        "@type": "LocationFeatureSpecification",
        name: amenity
      }))
    }),
    
    // 평점 정보
    ...(data.starRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.starRating.ratingValue,
        ratingCount: data.starRating.ratingCount,
        bestRating: 5,
        worstRating: 1
      }
    }),
    
    // 제공업체 정보
    provider: {
      "@type": "Organization",
      name: "TripRadio.AI",
      url: "https://navidocent.com",
      logo: {
        "@type": "ImageObject",
        url: "https://navidocent.com/logo.png"
      }
    },
    
    // 액션
    potentialAction: [
      {
        "@type": "ListenAction",
        name: "AI 음성 가이드 듣기",
        target: `https://navidocent.com/guide/${encodeURIComponent(data.name)}/tour`
      },
      {
        "@type": "ReadAction",
        name: "여행 가이드 읽기",
        target: `https://navidocent.com/guide/${encodeURIComponent(data.name)}`
      }
    ],
    
    // 추가 속성
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://navidocent.com/guide/${encodeURIComponent(data.name)}`
    },
    
    // 콘텐츠 정보
    dateCreated: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: data.language?.map(lang => 
      lang === "Korean" ? "ko" : 
      lang === "English" ? "en" :
      lang === "Japanese" ? "ja" :
      lang === "Chinese" ? "zh" : "es"
    ) || ["ko", "en", "ja", "zh", "es"]
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

export default TouristAttractionSchema;