interface SoftwareApplicationSchemaProps {
  appName?: string;
  description?: string;
  url?: string;
  language?: 'ko' | 'en' | 'ja' | 'zh' | 'es';
}

export default function SoftwareApplicationSchema({
  appName = "TripRadio.AI",
  description,
  url = "https://navidocent.com",
  language = "ko"
}: SoftwareApplicationSchemaProps) {

  const descriptions = {
    ko: "AI가 만드는 개인 맞춤형 여행 오디오가이드. 실시간으로 생성되는 전문 해설과 다국어 지원으로 특별한 여행 경험을 제공합니다.",
    en: "AI-powered personalized travel audio guide. Experience special travel with real-time generated professional commentary and multilingual support.",
    ja: "AIが作るパーソナライズされた旅行オーディオガイド。リアルタイムで生成される専門解説と多言語サポートで特別な旅行体験を提供します。",
    zh: "AI打造的个性化旅行音频导览。通过实时生成的专业解说和多语言支持提供特别的旅行体验。",
    es: "Guía de audio de viaje personalizada creada por IA. Proporciona experiencias de viaje especiales con comentarios profesionales generados en tiempo real y soporte multiidioma."
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": appName,
    "description": description || descriptions[language],
    "url": url,
    "applicationCategory": "TravelApplication",
    "operatingSystem": ["iOS", "Android", "Web"],
    "softwareVersion": "1.0.0",
    "datePublished": "2024-01-01",
    "dateModified": "2024-12-13",
    "author": {
      "@type": "Organization",
      "name": "TripRadio.AI Team",
      "url": url
    },
    "publisher": {
      "@type": "Organization", 
      "name": "TripRadio.AI",
      "url": url,
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/navi.png`,
        "width": "200",
        "height": "200"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW",
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    },
    "features": [
      "AI 기반 실시간 가이드 생성",
      "다국어 음성 해설 지원", 
      "개인 맞춤형 여행 추천",
      "오프라인 사용 가능",
      "GPS 기반 위치 안내"
    ],
    "screenshot": [
      `${url}/screenshot1.jpg`,
      `${url}/screenshot2.jpg`,
      `${url}/screenshot3.jpg`
    ],
    "downloadUrl": url,
    "installUrl": url,
    "storageRequirements": "50MB",
    "memoryRequirements": "2GB RAM",
    "processorRequirements": "1GHz",
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": `${url}/help`,
      "name": "TripRadio.AI 사용 가이드"
    },
    "applicationSuite": "여행 도구",
    "countries": ["KR", "US", "JP", "CN", "ES"],
    "inLanguage": ["ko", "en", "ja", "zh", "es"],
    "isAccessibleForFree": true,
    "permissions": [
      "위치 서비스",
      "마이크 (음성 인식)",
      "저장공간 (오프라인 콘텐츠)"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(softwareApplicationSchema)
      }}
      suppressHydrationWarning
    />
  );
}