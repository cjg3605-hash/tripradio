interface LanguageType {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  es: string;
}

interface LocalBusinessSchemaProps {
  businessName?: string;
  description?: string;
  url?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  language?: keyof LanguageType;
}

export default function LocalBusinessSchema({
  businessName = "TripRadio.AI",
  description,
  url = "https://navidocent.com",
  address,
  telephone,
  email,
  language = "ko"
}: LocalBusinessSchemaProps) {

  const descriptions: LanguageType = {
    ko: "AI가 만드는 개인 맞춤형 여행 라디오. 전문 음성해설과 다국어 지원으로 특별한 여행 경험을 제공합니다. 무료 체험 가능!",
    en: "AI-powered personalized travel radio. Provides special travel experiences with professional voice guide and multilingual support. Free trial available!",
    ja: "AIが作るパーソナライズされた旅行ラジオ。プロフェッショナル音声ガイドと多言語サポートで特別な旅行体験を提供します。無料体験可能！",
    zh: "AI打造的个性化旅行电台。通过专业语音导览和多语言支持提供特别的旅行体验。免费试用！",
    es: "Radio de viaje personalizada creada por IA. Proporciona experiencias de viaje especiales con guías de voz profesionales y soporte multiidioma. ¡Prueba gratuita disponible!"
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#localbusiness`,
    name: businessName,
    description: description || descriptions[language] || descriptions.ko,
    url: url,
    logo: `${url}/navi.png`,
    image: [
      `${url}/navi.png`,
      `${url}/web-app-manifest-512x512.png`
    ],
    telephone: telephone,
    email: email,
    address: address ? {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry
    } : undefined,
    geo: address ? {
      "@type": "GeoCoordinates",
      latitude: "37.5665",
      longitude: "126.9780"
    } : undefined,
    openingHours: "Mo-Su 00:00-23:59", // 24/7 온라인 서비스
    // 개인 서비스는 결제 정보 제거
    serviceArea: {
      "@type": "Country",
      name: ["South Korea", "대한민국", "韓国", "韩国", "Corea del Sur"]
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "TripRadio.AI 서비스",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "여행 라디오 AI",
            description: "AI가 만드는 개인 맞춤형 여행 라디오 서비스"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service", 
            name: "실시간 음성 가이드",
            description: "GPS 기반 실시간 위치별 AI 음성 가이드"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "무료 체험",
            description: "무료로 체험 가능한 여행 라디오 AI"
          }
        }
      ]
    },
    sameAs: [
      // 소셜미디어 및 비즈니스 프로필 링크 (설정 후 추가)
      // "https://www.facebook.com/NaviDocent",
      // "https://www.instagram.com/navidocent",
      // "https://business.google.com/...",
      // "https://place.map.kakao.com/..."
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: telephone,
      email: email,
      contactType: "customer service",
      availableLanguage: ["Korean", "English", "Japanese", "Chinese", "Spanish"],
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      }
    },
    creator: {
      "@type": "Person",
      name: "TripRadio.AI 개발팀"
    },
    foundingDate: "2024",
    slogan: "여행 라디오 AI로 자유롭고 특별한 여행을"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema)
      }}
      suppressHydrationWarning
    />
  );
}