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
  businessName = "도슨트투어",
  description,
  url = "https://navidocent.com",
  address,
  telephone,
  email,
  language = "ko"
}: LocalBusinessSchemaProps) {

  const descriptions: LanguageType = {
    ko: "개인 맞춤형 여행 오디오가이드 서비스. 전문 도슨트 음성해설과 다국어 지원으로 완벽한 여행 경험을 제공합니다. 무료 체험 가능!",
    en: "Personalized travel audio guide service. Provides perfect travel experiences with professional voice docent and multilingual support. Free trial available!",
    ja: "パーソナライズド旅行オーディオガイドサービス。プロフェッショナル音声ドーセントと多言語サポートで完璧な旅行体験を提供します。無料体験可能！",
    zh: "个性化旅游音频导览服务。通过专业语音导览和多语言支持提供完美的旅行体验。免费试用！",
    es: "Servicio de guía de audio de viaje personalizado. Proporciona experiencias de viaje perfectas con guías de voz profesionales y soporte multiidioma. ¡Prueba gratuita disponible!"
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
      name: "도슨트투어 서비스",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "여행 오디오가이드",
            description: "개인 맞춤형 여행 오디오가이드 서비스"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service", 
            name: "실시간 음성 도슨트",
            description: "GPS 기반 실시간 위치별 음성 도슨트"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "무료 체험",
            description: "무료로 체험 가능한 여행 오디오 가이드"
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
      name: "도슨트투어 개발팀"
    },
    foundingDate: "2024",
    slogan: "여행 오디오가이드로 자유롭고 깊이있는 여행을"
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