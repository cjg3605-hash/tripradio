/**
 * 가이드 페이지 404 에러 처리
 * 다국어 지명 매핑 실패 시 사용자 친화적인 대안 제공
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { suggestSimilarLocations } from '@/lib/location-mapping';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function GuideNotFound() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, currentLanguage } = useLanguage();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const locationName = Array.isArray(params?.location) 
    ? params.location[0] 
    : params?.location || '';
  const decodedLocation = decodeURIComponent(locationName);
  
  useEffect(() => {
    // 유사한 지명 추천
    if (decodedLocation) {
      const similar = suggestSimilarLocations(decodedLocation);
      setSuggestions(similar);
      
      // 404 에러 로깅 (분석용)
      console.warn(`🚨 404 Error: Guide not found for "${decodedLocation}" (lang: ${currentLanguage})`);
    }
  }, [decodedLocation, currentLanguage]);

  const langParam = searchParams?.get('lang');
  const buildUrl = (location: string) => {
    const baseUrl = `/guide/${encodeURIComponent(location)}`;
    return langParam ? `${baseUrl}?lang=${langParam}` : baseUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* 404 아이콘 */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* 메인 메시지 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('errors.notFound')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          <span className="font-medium">&ldquo;{decodedLocation}&rdquo;</span>에 대한 가이드를 찾을 수 없습니다.
        </p>

        {/* 추천 지명 */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🎯 이런 장소는 어떠세요?
            </h2>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <Link
                  key={suggestion}
                  href={buildUrl(suggestion)}
                  className="block w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors duration-200"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 인기 관광지 제안 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            ⭐ 인기 관광지
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { ko: '경복궁', en: 'Gyeongbokgung Palace' },
              { ko: '에펠탑', en: 'Eiffel Tower' },
              { ko: '콜로세움', en: 'Colosseum' },
              { ko: '타지마할', en: 'Taj Mahal' }
            ].map((item) => (
              <Link
                key={item.ko}
                href={buildUrl(item.ko)}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                {currentLanguage === 'ko' ? item.ko : item.en}
              </Link>
            ))}
          </div>
        </div>

        {/* 검색으로 돌아가기 */}
        <div className="space-y-3">
          <Link 
            href={`/?lang=${currentLanguage}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            🏠 홈으로 돌아가기
          </Link>
          
          <Link 
            href={`/search?q=${encodeURIComponent(decodedLocation)}&lang=${currentLanguage}`}
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            🔍 다시 검색하기
          </Link>
        </div>

        {/* 도움말 */}
        <div className="mt-6 text-xs text-gray-500">
          <p>문제가 계속되면 고객지원으로 문의해주세요</p>
        </div>
      </div>
    </div>
  );
}