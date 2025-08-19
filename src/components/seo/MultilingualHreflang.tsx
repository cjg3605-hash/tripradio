/**
 * 다국어 페이지용 hreflang 태그 생성 컴포넌트
 * 각 가이드 페이지에서 언어별 URL을 자동 생성
 */

import { generateMultilingualUrls } from '@/lib/location-mapping';

interface MultilingualHreflangProps {
  locationName: string;
  currentLanguage: string;
  currentUrl: string;
}

export default function MultilingualHreflang({ 
  locationName, 
  currentLanguage, 
  currentUrl 
}: MultilingualHreflangProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  
  // 현재 페이지의 다국어 URL 생성
  const multilingualUrls = generateMultilingualUrls(locationName, baseUrl);
  
  // 현재 URL을 한국어 기본 URL로 추가
  const allUrls = {
    ko: `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=ko`,
    ...multilingualUrls
  };

  return (
    <>
      {Object.entries(allUrls).map(([lang, url]) => {
        const hrefLangCode = {
          ko: 'ko-KR',
          en: 'en-US', 
          ja: 'ja-JP',
          zh: 'zh-CN',
          es: 'es-ES'
        }[lang] || `${lang}`;

        return (
          <link
            key={lang}
            rel="alternate"
            hrefLang={hrefLangCode}
            href={url}
          />
        );
      })}
      
      {/* x-default는 한국어 기본 페이지로 설정 */}
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={`${baseUrl}/guide/${encodeURIComponent(locationName)}`} 
      />
      
      {/* 현재 페이지의 canonical URL */}
      <link 
        rel="canonical" 
        href={currentUrl} 
      />
    </>
  );
}