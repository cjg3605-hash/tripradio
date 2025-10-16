// src/components/seo/PlaceSchema.tsx
import React from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PlaceData {
  name: string;
  description: string;
  placeType?: 'LandmarksOrHistoricalBuildings' | 'Museum' | 'Park' | 'ReligiousSite' | 'TouristDestination';
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  coordinates?: Coordinates;
  image?: string[];
  website?: string;
  telephone?: string;
  email?: string;
  openingHours?: string[];
  admissionPrice?: string;
  containedInPlace?: string;
  containsPlace?: string[];
  publicAccess?: boolean;
  smokingAllowed?: boolean;
  wheelchairAccessible?: boolean;
  specialOpeningHoursSpecification?: any[];
}

interface PlaceSchemaProps {
  data: PlaceData;
}

const PlaceSchema: React.FC<PlaceSchemaProps> = ({ data }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": ["Place", data.placeType || "TouristDestination"],
    "@id": `https://tripradio.shop/guide/${encodeURIComponent(data.name)}#place`,
    name: data.name,
    description: data.description,
    url: data.website || `https://tripradio.shop/guide/${encodeURIComponent(data.name)}`,
    
    // 식별자
    identifier: {
      "@type": "PropertyValue",
      name: "TripRadio ID",
      value: `trip_${data.name.replace(/\s+/g, '_').toLowerCase()}`
    },
    
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
    
    // 이미지 정보 (배열 지원)
    ...(data.image && data.image.length > 0 && {
      image: data.image.map((img, index) => ({
        "@type": "ImageObject",
        url: img,
        caption: `${data.name} - 이미지 ${index + 1}`,
        contentUrl: img,
        width: 1200,
        height: 630,
        encodingFormat: "image/jpeg"
      }))
    }),
    
    // 연락처 정보
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    
    // 운영 시간
    ...(data.openingHours && { 
      openingHoursSpecification: data.openingHours.map(hours => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
        opens: "09:00",
        closes: "18:00",
        description: hours
      }))
    }),
    
    // 특별 운영시간
    ...(data.specialOpeningHoursSpecification && {
      specialOpeningHoursSpecification: data.specialOpeningHoursSpecification
    }),
    
    // 입장료
    ...(data.admissionPrice && {
      maximumAttendeeCapacity: 1000,
      isAccessibleForFree: data.admissionPrice === "무료" || data.admissionPrice === "Free",
      ...(data.admissionPrice !== "무료" && data.admissionPrice !== "Free" && {
        offers: {
          "@type": "Offer",
          name: "입장료",
          price: data.admissionPrice.replace(/[^0-9]/g, '') || "0",
          priceCurrency: "KRW"
        }
      })
    }),
    
    // 장소 포함 관계
    ...(data.containedInPlace && {
      containedInPlace: {
        "@type": "Place",
        name: data.containedInPlace
      }
    }),
    
    ...(data.containsPlace && data.containsPlace.length > 0 && {
      containsPlace: data.containsPlace.map(place => ({
        "@type": "Place",
        name: place
      }))
    }),
    
    // 접근성 정보
    publicAccess: data.publicAccess !== false,
    smokingAllowed: data.smokingAllowed || false,
    ...(data.wheelchairAccessible !== undefined && {
      accessibilityFeature: data.wheelchairAccessible ? ["wheelchair accessible"] : []
    }),
    
    // 추가 속성
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "AI 가이드 제공",
        value: "available"
      },
      {
        "@type": "PropertyValue", 
        name: "다국어 지원",
        value: "Korean, English, Japanese, Chinese, Spanish"
      },
      {
        "@type": "PropertyValue",
        name: "실시간 음성 안내",
        value: "available"
      }
    ],
    
    // 편의시설
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "AI 음성 가이드",
        value: true
      },
      {
        "@type": "LocationFeatureSpecification", 
        name: "다국어 지원",
        value: true
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "실시간 위치 기반 안내",
        value: true
      }
    ],
    
    // 검색 액션
    potentialAction: {
      "@type": "SearchAction",
      target: `https://tripradio.shop/guide/${encodeURIComponent(data.name)}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    
    // 메인 엔티티
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tripradio.shop/guide/${encodeURIComponent(data.name)}`
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

export default PlaceSchema;