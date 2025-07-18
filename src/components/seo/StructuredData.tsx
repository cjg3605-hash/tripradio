'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { generateJsonLd } from '@/lib/seo/metadata';

interface StructuredDataProps {
  type: 'WebSite' | 'Article' | 'TouristAttraction';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const { currentLanguage } = useLanguage();
  
  const jsonLd = generateJsonLd(type, data, currentLanguage);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 