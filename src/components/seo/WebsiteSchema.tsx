import Script from 'next/script';

interface WebsiteSchemaProps {
  url?: string;
}

export default function WebsiteSchema({ url = 'https://navidocent.com' }: WebsiteSchemaProps) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TripRadio.AI",
    "alternateName": "여행라디오AI",
    "url": url,
    "description": "AI가 만드는 개인 맞춤형 여행 라디오. 전문 음성해설과 다국어 지원으로 특별한 여행 경험을 제공합니다. 무료 체험 가능!",
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
      "name": "TripRadio.AI",
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
      "name": "TripRadio.AI",
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