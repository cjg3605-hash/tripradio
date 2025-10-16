'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CityDisambiguationModal from '@/components/location/CityDisambiguationModal';
import { CityOption } from '@/lib/location/city-disambiguation';

export default function DisambiguatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<CityOption[]>([]);
  const [query, setQuery] = useState<string>('');
  const [language, setLanguage] = useState<string>('ko');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryParam = searchParams.get('query');
    const languageParam = searchParams.get('language');
    const optionsParam = searchParams.get('options');

    if (queryParam) setQuery(queryParam);
    if (languageParam) setLanguage(languageParam);
    if (optionsParam) {
      try {
        const parsedOptions = JSON.parse(optionsParam);
        setOptions(parsedOptions);
      } catch (error) {
        console.error('옵션 파싱 오류:', error);
      }
    }
  }, [searchParams]);

  const handleCitySelect = async (cityId: string) => {
    setIsLoading(true);
    try {
      // 선택된 도시로 라우팅 정보 요청
      const response = await fetch('/api/locations/disambiguate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('선택 결과:', result);
        
        if (result.success && result.selectedCity) {
          const selectedCity = result.selectedCity;
          
          // 선택된 도시의 가이드 페이지로 이동
          const locationName = selectedCity.name;
          const targetUrl = `/guide/${language}/${encodeURIComponent(locationName)}?selectedCity=${cityId}`;
          
          console.log('리다이렉트 URL:', targetUrl);
          router.push(targetUrl);
        } else {
          console.error('API 응답 형식 오류:', result);
          handleCancel();
        }
      } else {
        console.error('도시 선택 처리 실패');
        handleCancel();
      }
    } catch (error) {
      console.error('도시 선택 오류:', error);
      handleCancel();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // 검색 페이지나 홈으로 돌아가기
    router.push('/');
  };

  if (options.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로딩 중...</h1>
          <p className="text-gray-600">도시 옵션을 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            도시 선택
          </h1>
          <p className="text-lg text-gray-600">
            &ldquo;<span className="font-medium">{query}</span>&rdquo;와 일치하는 도시가 여러 개 발견되었습니다.<br />
            원하시는 도시를 선택해주세요.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {options.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city.id)}
                disabled={isLoading}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-lg mb-1">
                      {city.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {city.country} • {city.region}
                      {city.population && (
                        <span className="ml-2">
                          인구: {city.population.toLocaleString()}명
                        </span>
                      )}
                    </p>
                    {city.description && (
                      <p className="text-sm text-gray-500">
                        {city.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소하고 돌아가기
            </button>
          </div>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">처리 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}