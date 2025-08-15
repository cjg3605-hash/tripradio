// src/components/seo/ImageObjectSchema.tsx
import React from 'react';

interface ImageData {
  url: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  encodingFormat?: string;
  contentSize?: string;
  uploadDate?: string;
  creator?: string;
  copyrightHolder?: string;
  license?: string;
  acquireLicensePage?: string;
  creditText?: string;
  alternateName?: string;
  associatedArticle?: string;
  representativeOfPage?: boolean;
  contentLocation?: string;
  keywords?: string[];
}

interface ImageObjectSchemaProps {
  images: ImageData[];
  context?: {
    mainEntity?: string;
    locationName?: string;
    webpageUrl?: string;
  };
}

const ImageObjectSchema: React.FC<ImageObjectSchemaProps> = ({ images, context }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${context?.webpageUrl || ''}#imagelist`,
    name: `${context?.locationName || '여행지'} 이미지 갤러리`,
    description: `${context?.locationName || '여행지'}의 고품질 이미지 컬렉션`,
    numberOfItems: images.length,
    itemListElement: images.map((image, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "ImageObject",
        "@id": `${image.url}#image`,
        url: image.url,
        contentUrl: image.url,
        
        // 기본 속성
        name: image.caption || `${context?.locationName || '여행지'} - 이미지 ${index + 1}`,
        caption: image.caption || `${context?.locationName || '여행지'}의 아름다운 모습`,
        description: image.description || `${context?.locationName || '여행지'}를 보여주는 고품질 이미지입니다.`,
        
        // 기술적 속성
        width: image.width || 1200,
        height: image.height || 630,
        encodingFormat: image.encodingFormat || "image/webp",
        ...(image.contentSize && { contentSize: image.contentSize }),
        
        // 메타데이터
        uploadDate: image.uploadDate || new Date().toISOString(),
        dateCreated: image.uploadDate || new Date().toISOString(),
        
        // 저작권 정보
        creator: {
          "@type": "Organization",
          name: image.creator || "TripRadio.AI"
        },
        copyrightHolder: {
          "@type": "Organization", 
          name: image.copyrightHolder || "TripRadio.AI"
        },
        ...(image.license && { license: image.license }),
        ...(image.acquireLicensePage && { acquireLicensePage: image.acquireLicensePage }),
        ...(image.creditText && { creditText: image.creditText }),
        
        // 대체 이름
        ...(image.alternateName && { alternateName: image.alternateName }),
        
        // 연관된 기사/페이지
        ...(image.associatedArticle && {
          associatedArticle: {
            "@type": "WebPage",
            url: image.associatedArticle
          }
        }),
        
        // 페이지 대표 이미지 여부
        representativeOfPage: image.representativeOfPage || index === 0,
        
        // 촬영 위치
        ...(image.contentLocation && {
          contentLocation: {
            "@type": "Place",
            name: image.contentLocation
          }
        }),
        
        // 키워드/태그
        ...(image.keywords && image.keywords.length > 0 && {
          keywords: image.keywords.join(", ")
        }),
        
        // 이미지가 포함된 웹페이지
        ...(context?.webpageUrl && {
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": context.webpageUrl
          }
        }),
        
        // 썸네일 (동일 이미지의 작은 버전)
        thumbnail: {
          "@type": "ImageObject",
          url: image.url,
          width: 300,
          height: 157
        },
        
        // 접근성
        accessibilityFeature: ["alternativeText", "longDescription"],
        
        // 용도
        usageInfo: "Educational and promotional use for travel guidance",
        
        // 품질 지표
        quality: "high",
        
        // 추가 속성
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Image Source",
            value: "Professional Travel Photography"
          },
          {
            "@type": "PropertyValue",
            name: "Usage Rights",
            value: "TripRadio.AI Licensed Content"
          },
          {
            "@type": "PropertyValue",
            name: "Optimization",
            value: "WebP format for fast loading"
          }
        ]
      }
    })),
    
    // 이미지 갤러리 전체 속성
    ...(context?.mainEntity && {
      about: {
        "@type": "TouristAttraction",
        name: context.locationName
      }
    }),
    
    // 갤러리 메타데이터
    provider: {
      "@type": "Organization",
      name: "TripRadio.AI",
      url: "https://navidocent.com"
    },
    
    // 라이센스 정보
    license: "https://navidocent.com/license",
    usageInfo: "Images for educational and travel guidance purposes",
    
    // 컬렉션 정보
    genre: "Travel Photography",
    inLanguage: "ko",
    
    // 접근성
    accessibilityControl: ["fullKeyboardControl", "fullMouseControl"],
    accessibilityFeature: ["alternativeText", "structuredNavigation"],
    accessibilityHazard: "none"
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

export default ImageObjectSchema;