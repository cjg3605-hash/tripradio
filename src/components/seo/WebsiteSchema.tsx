import Script from 'next/script';

interface WebsiteSchemaProps {
  url?: string;
}

export default function WebsiteSchema({ url = 'https://navidocent.com' }: WebsiteSchemaProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NaviDocent",
    "alternateName": "네비가이드AI",
    "url": url,
    "description": "AI 기반 개인 맞춤형 여행 도슨트 서비스. 실시간 음성 가이드와 다국어 지원으로 완벽한 여행 경험을 제공합니다.",
    "inLanguage": ["ko", "en", "ja", "zh", "es"],
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${url}/guide/{search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "mainEntity": {
      "@type": "Organization",
      "name": "NaviDocent",
      "url": url,
      "logo": `${url}/logo.png`,
      "sameAs": [
        `${url}/sitemap.xml`
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Korean", "English", "Japanese", "Chinese", "Spanish"]
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "NaviDocent",
      "url": url,
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/logo.png`,
        "width": "200",
        "height": "200"
      }
    }
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema)
      }}
    />
  );
}