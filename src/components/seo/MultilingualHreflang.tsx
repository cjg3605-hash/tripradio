/**
 * 다국어 페이지용 hreflang 태그 생성 컴포넌트
 * 각 가이드 페이지에서 언어별 URL을 자동 생성
 */

import { generateMultilingualUrls } from '@/lib/location-mapping';

interface MultilingualHreflangProps {
  locationName: string;
  currentLanguage: string;
  urls: Record<string, string>; // 🚀 새 구조: 언어별 URL 맵핑
}

export default function MultilingualHreflang({ 
  locationName, 
  currentLanguage, 
  urls 
}: MultilingualHreflangProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.ai';

  return (
    <>
      {/* 🚀 새 URL 구조: /guide/[language]/[location] */}
      {Object.entries(urls).map(([lang, url]) => {
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
            href={`${baseUrl}${url}`}
          />
        );
      })}
      
      {/* x-default는 한국어 기본 페이지로 설정 */}
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={`${baseUrl}/guide/ko/${encodeURIComponent(locationName)}`} 
      />
      
      {/* 현재 페이지의 canonical URL */}
      <link 
        rel="canonical" 
        href={`${baseUrl}/guide/${currentLanguage}/${encodeURIComponent(locationName)}`} 
      />
    </>
  );
}