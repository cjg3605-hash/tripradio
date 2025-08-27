/**
 * SEO Utilities - TripRadio AI Travel Guide
 * Comprehensive SEO helper functions for optimal search engine visibility
 */

export interface SEOPageData {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  language: 'ko' | 'en' | 'ja' | 'zh' | 'es';
  imageUrl?: string;
  articleType?: string;
  readingTime?: number;
  locationName?: string;
}

/**
 * Generate structured data for different page types
 */
export function generateStructuredData(pageData: SEOPageData) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  const fullUrl = pageData.url.startsWith('http') ? pageData.url : `${baseUrl}${pageData.url}`;
  const fullImageUrl = pageData.imageUrl?.startsWith('http') 
    ? pageData.imageUrl 
    : `${baseUrl}${pageData.imageUrl || '/og-image.jpg'}`;

  // Base WebPage schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${fullUrl}#webpage`,
    "url": fullUrl,
    "name": pageData.title,
    "description": pageData.description,
    "inLanguage": pageData.language,
    "image": fullImageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "TripRadio.AI",
      "url": baseUrl
    },
    "mainEntity": {
      "@type": "Service",
      "name": "AI Travel Guide",
      "description": "AI-powered personalized travel docent service"
    },
    // AI Content Transparency
    "creativeWorkStatus": "AI-Generated",
    "contributor": {
      "@type": "SoftwareApplication",
      "name": "TripRadio AI",
      "applicationCategory": "Travel Guide Generator"
    }
  };

  return webPageSchema;
}

/**
 * Generate hreflang URLs for a given page
 */
export function generateHreflangUrls(basePath: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  const fullBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;

  return {
    'ko-KR': `${baseUrl}${fullBasePath}`,
    'x-default': `${baseUrl}${fullBasePath}`,
  };
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, locationName?: string): string[] {
  const baseKeywords = [
    'AI travel guide',
    'personalized tour',
    'travel docent',
    'multilingual guide',
    'real-time guide',
    'voice navigation'
  ];

  if (locationName) {
    baseKeywords.push(
      locationName,
      `${locationName} guide`,
      `${locationName} tour`,
      `${locationName} travel`
    );
  }

  // Simple keyword extraction from content
  const contentKeywords = content
    .toLowerCase()
    .match(/\b[가-힣a-z]{3,}\b/g) // Korean and English words 3+ chars
    ?.filter((word, index, arr) => arr.indexOf(word) === index) // unique
    ?.slice(0, 5) || []; // limit to top 5

  return [...baseKeywords, ...contentKeywords].slice(0, 15);
}

/**
 * Generate OpenGraph locale from language code
 */
export function getOpenGraphLocale(language: string): string {
  const localeMap: Record<string, string> = {
    ko: 'ko_KR',
    en: 'en_US', 
    ja: 'ja_JP',
    zh: 'zh_CN',
    es: 'es_ES'
  };
  return localeMap[language] || 'ko_KR';
}

/**
 * Generate AI content transparency metadata
 */
export function generateAIContentMetadata(contentType: string, locationName?: string) {
  return {
    'ai-content-declaration': locationName 
      ? `AI-generated ${contentType} for ${locationName}`
      : `AI-generated ${contentType}`,
    'content-generation': 'AI-assisted',
    'ai-disclosure': `This ${contentType} is generated with AI assistance`,
    'content-methodology': 'Large Language Model with travel expertise',
    'quality-assurance': 'Human-reviewed AI content'
  };
}

/**
 * Validate and optimize meta description
 */
export function optimizeMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  // Try to cut at sentence boundary
  const sentences = description.split('. ');
  let optimized = '';
  
  for (const sentence of sentences) {
    if ((optimized + sentence).length <= maxLength - 3) {
      optimized += (optimized ? '. ' : '') + sentence;
    } else {
      break;
    }
  }
  
  // If still too long, cut at word boundary
  if (optimized.length === 0 || optimized.length > maxLength) {
    const words = description.split(' ');
    optimized = '';
    
    for (const word of words) {
      if ((optimized + ' ' + word).length <= maxLength - 3) {
        optimized += (optimized ? ' ' : '') + word;
      } else {
        break;
      }
    }
  }
  
  return optimized + (optimized.length < description.length ? '...' : '');
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * SEO scoring function for content quality assessment
 */
export function calculateSEOScore(pageData: SEOPageData): {
  score: number;
  recommendations: string[];
} {
  let score = 0;
  const recommendations: string[] = [];
  
  // Title optimization (25 points)
  if (pageData.title) {
    if (pageData.title.length >= 30 && pageData.title.length <= 60) {
      score += 25;
    } else {
      score += 15;
      recommendations.push('Optimize title length to 30-60 characters');
    }
  } else {
    recommendations.push('Add page title');
  }
  
  // Description optimization (25 points)
  if (pageData.description) {
    if (pageData.description.length >= 120 && pageData.description.length <= 160) {
      score += 25;
    } else {
      score += 15;
      recommendations.push('Optimize description length to 120-160 characters');
    }
  } else {
    recommendations.push('Add meta description');
  }
  
  // Keywords (20 points)
  if (pageData.keywords && pageData.keywords.length >= 5) {
    score += 20;
  } else {
    score += 10;
    recommendations.push('Add more relevant keywords (5+ recommended)');
  }
  
  // Image (15 points)
  if (pageData.imageUrl) {
    score += 15;
  } else {
    recommendations.push('Add Open Graph image');
  }
  
  // Language support (15 points)
  if (pageData.language) {
    score += 15;
  } else {
    recommendations.push('Specify page language');
  }
  
  return { score, recommendations };
}

/**
 * Generate JSON-LD structured data string
 */
export function generateJSONLD(data: any): string {
  return JSON.stringify(data, null, 2);
}

const seoUtils = {
  generateStructuredData,
  generateHreflangUrls,
  extractKeywords,
  getOpenGraphLocale,
  generateAIContentMetadata,
  optimizeMetaDescription,
  generateCanonicalUrl,
  calculateSEOScore,
  generateJSONLD
};

export default seoUtils;