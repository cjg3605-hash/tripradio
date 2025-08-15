// src/components/seo/ReviewSchema.tsx
import React from 'react';

interface ReviewData {
  author: {
    name: string;
    image?: string;
    url?: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviewBody: string;
  datePublished: string;
  headline?: string;
  pros?: string[];
  cons?: string[];
  language?: string;
}

interface AggregateRatingData {
  ratingValue: number;
  ratingCount: number;
  bestRating?: number;
  worstRating?: number;
  reviewCount?: number;
}

interface ReviewSchemaProps {
  itemReviewed: {
    name: string;
    type: 'TouristAttraction' | 'Service' | 'Place' | 'SoftwareApplication';
    url: string;
    image?: string;
  };
  reviews?: ReviewData[];
  aggregateRating?: AggregateRatingData;
}

const ReviewSchema: React.FC<ReviewSchemaProps> = ({ itemReviewed, reviews = [], aggregateRating }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${itemReviewed.url}#reviews`,
    name: `${itemReviewed.name} 리뷰`,
    description: `${itemReviewed.name}에 대한 사용자 리뷰 및 평점`,
    
    // 리뷰 대상
    about: {
      "@type": itemReviewed.type,
      "@id": `${itemReviewed.url}#${itemReviewed.type.toLowerCase()}`,
      name: itemReviewed.name,
      url: itemReviewed.url,
      ...(itemReviewed.image && {
        image: {
          "@type": "ImageObject",
          url: itemReviewed.image
        }
      })
    },
    
    // 집계 평점
    ...(aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        ratingCount: aggregateRating.ratingCount,
        reviewCount: aggregateRating.reviewCount || aggregateRating.ratingCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1
      }
    }),
    
    // 리뷰 목록
    numberOfItems: reviews.length,
    itemListElement: reviews.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        "@id": `${itemReviewed.url}#review-${index + 1}`,
        
        // 리뷰 대상
        itemReviewed: {
          "@type": itemReviewed.type,
          name: itemReviewed.name,
          url: itemReviewed.url
        },
        
        // 작성자
        author: {
          "@type": "Person",
          name: review.author.name,
          ...(review.author.image && {
            image: {
              "@type": "ImageObject",
              url: review.author.image
            }
          }),
          ...(review.author.url && { url: review.author.url })
        },
        
        // 평점
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.reviewRating.ratingValue,
          bestRating: review.reviewRating.bestRating || 5,
          worstRating: review.reviewRating.worstRating || 1
        },
        
        // 리뷰 내용
        reviewBody: review.reviewBody,
        headline: review.headline || `${itemReviewed.name} 이용 후기`,
        
        // 발행일
        datePublished: review.datePublished,
        dateCreated: review.datePublished,
        
        // 장단점
        ...(review.pros && review.pros.length > 0 && {
          positiveNotes: review.pros.join(", ")
        }),
        
        ...(review.cons && review.cons.length > 0 && {
          negativeNotes: review.cons.join(", ")
        }),
        
        // 언어
        inLanguage: review.language || "ko",
        
        // 리뷰 유형
        reviewAspect: ["Service Quality", "User Experience", "Content Quality", "Technical Performance"],
        
        // 추가 속성
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Review Source",
            value: "TripRadio.AI Platform"
          },
          {
            "@type": "PropertyValue",
            name: "Verified User",
            value: "true"
          }
        ]
      }
    })),
    
    // 리뷰 컬렉션 메타데이터
    provider: {
      "@type": "Organization",
      name: "TripRadio.AI",
      url: "https://navidocent.com"
    },
    
    // 언어
    inLanguage: "ko",
    
    // 정렬 기준
    orderBy: "datePublished DESC",
    
    // 추가 정보
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Review System",
        value: "TripRadio.AI Verified Reviews"
      },
      {
        "@type": "PropertyValue",
        name: "Moderation Policy",
        value: "AI-powered content moderation"
      },
      {
        "@type": "PropertyValue",
        name: "Review Guidelines",
        value: "Community-driven quality standards"
      }
    ]
  };

  // 리뷰가 없을 때는 집계 평점만 렌더링
  if (reviews.length === 0 && aggregateRating) {
    const ratingOnlySchema = {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      "@id": `${itemReviewed.url}#aggregaterating`,
      itemReviewed: {
        "@type": itemReviewed.type,
        name: itemReviewed.name,
        url: itemReviewed.url
      },
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
      reviewCount: aggregateRating.reviewCount || aggregateRating.ratingCount,
      bestRating: aggregateRating.bestRating || 5,
      worstRating: aggregateRating.worstRating || 1
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ratingOnlySchema, null, 0)
        }}
      />
    );
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 0)
      }}
    />
  );
};

export default ReviewSchema;