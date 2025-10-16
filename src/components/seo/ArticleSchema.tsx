interface ArticleSchemaProps {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
  imageUrl?: string;
  language?: 'ko' | 'en' | 'ja' | 'zh' | 'es';
  category?: string;
  locationName?: string;
  readingTime?: number; // minutes
}

export default function ArticleSchema({
  title,
  description,
  author = "TripRadio AI",
  datePublished = new Date().toISOString(),
  dateModified = new Date().toISOString(),
  url,
  imageUrl = "/og-image.jpg",
  language = 'ko',
  category = 'Travel Guide',
  locationName,
  readingTime = 5
}: ArticleSchemaProps) {
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${fullUrl}#article`,
    "headline": title,
    "description": description,
    "image": {
      "@type": "ImageObject",
      "url": fullImageUrl,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Organization",
      "name": author,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/navi.png`
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "TripRadio",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/navi.png`,
        "width": 512,
        "height": 512
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    },
    "inLanguage": language,
    "articleSection": category,
    "wordCount": Math.round(readingTime * 200), // Estimated 200 words per minute
    "timeRequired": `PT${readingTime}M`,
    "about": locationName ? {
      "@type": "Place",
      "name": locationName,
      "description": `AI-generated travel guide for ${locationName}`
    } : {
      "@type": "Service",
      "name": "AI Travel Guide Service",
      "description": "Personalized AI-powered travel guidance"
    },
    "genre": ["Travel", "Tourism", "Guide"],
    "keywords": [
      "AI travel guide",
      "personalized tour",
      "travel docent",
      locationName,
      `${locationName} guide`,
      "multilingual guide"
    ].filter(Boolean),
    // AI Content Transparency
    "creativeWorkStatus": "AI-Generated",
    "contributor": {
      "@type": "SoftwareApplication",
      "name": "TripRadio AI",
      "applicationCategory": "Travel Guide Generator"
    },
    "isAccessibleForFree": true,
    "audience": {
      "@type": "Audience",
      "audienceType": "Travelers"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleSchema, null, 2)
      }}
    />
  );
}