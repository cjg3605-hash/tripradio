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
  // 🔧 도메인 통일: navidocent.com 사용
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';

  return (
    <>
      {/* 🚀 언어별 alternate URL 생성 */}
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
      
      {/* ✅ x-default는 한 번만 설정 (한국어 기본) */}
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={`${baseUrl}/guide/ko/${encodeURIComponent(locationName)}`} 
      />
      
      {/* ✅ Canonical URL - 현재 페이지만 */}
      <link 
        rel="canonical" 
        href={`${baseUrl}/guide/${currentLanguage}/${encodeURIComponent(locationName)}`} 
      />
    </>
  );
}