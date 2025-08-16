'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
// import { enhancedLocationSearch, SearchCandidate, SearchFilters } from '@/lib/search/enhanced-search-system';

// 새로운 구조화된 위치 데이터 인터페이스
interface EnhancedLocationSuggestion {
  id?: string;           // 고유 식별자
  name: string;          // 장소명
  location: string;      // 상세 위치 (기존 호환성)
  region: string;        // 지역/도시
  country: string;       // 국가명  
  countryCode: string;   // 국가 코드 (KR, US, FR 등)
  type: 'location' | 'attraction'; // 위치 타입
  isMainLocation?: boolean;
  metadata?: {
    isOfficial?: boolean;
    category?: string;
    popularity?: number;
  };
}

// 기존 호환성을 위한 레거시 인터페이스 유지
interface Suggestion extends EnhancedLocationSuggestion {}

interface ExplorationSuggestion {
  title: string;
  items: Suggestion[];
  searchable: boolean;
}

// 🌍 국가코드 캐시 (메모리 캐싱)
const countryCodeCache = new Map<string, string>();

// 🚀 REST Countries API 기반 국가코드 변환
async function getCountryCode(countryName: string): Promise<string | null> {
  try {
    // 캐시 확인
    const cached = countryCodeCache.get(countryName);
    if (cached) {
      console.log('💾 국가코드 캐시 히트:', countryName, '→', cached);
      return cached;
    }
    
    console.log('🌍 REST Countries API 국가코드 변환:', countryName);
    
    // REST Countries API 호출
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=cca3`);
    
    if (!response.ok) {
      console.warn('⚠️ REST Countries API 응답 실패:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].cca3) {
      const countryCode = data[0].cca3; // ISO 3166-1 alpha-3 코드
      
      // 캐시에 저장
      countryCodeCache.set(countryName, countryCode);
      
      console.log('✅ 국가코드 변환 성공:', countryName, '→', countryCode);
      return countryCode;
    }
    
    console.warn('⚠️ 국가코드 데이터 없음:', countryName);
    return null;
    
  } catch (error) {
    console.error('❌ 국가코드 변환 오류:', error);
    return null;
  }
}

export default function NextLevelSearchBox() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [explorationSuggestions, setExplorationSuggestions] = useState<ExplorationSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [showExploration, setShowExploration] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();

  // Rotating placeholder examples
  const placeholders = t('home.searchPlaceholders') || [];

  // Rotate placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // 검색어가 유효한지 확인하는 함수
  const isValidQuery = (text: string): boolean => {
    if (text.length < 2) return false;
    
    // 한글의 경우: 완성된 글자가 최소 1개 이상 있거나, 전체 길이가 3글자 이상
    const koreanCompleteChars = text.match(/[가-힣]/g);
    if (koreanCompleteChars && koreanCompleteChars.length >= 1) return true;
    
    // 영문/숫자의 경우: 최소 2글자 이상
    const englishChars = text.match(/[a-zA-Z0-9]/g);
    if (englishChars && englishChars.length >= 2) return true;
    
    // 전체 길이가 3글자 이상인 경우 (자음+모음 조합 등)
    if (text.length >= 3) return true;
    
    return false;
  };

  // Advanced search suggestions
  useEffect(() => {
    if (isValidQuery(query)) {
      // 로딩 상태 시작
      setIsTyping(true);
      
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${currentLanguage}`);
          const data = await response.json();
          setSuggestions(data.success ? data.data : []);
          setExplorationSuggestions(data.explorationSuggestions || []);
          setShowExploration(data.hasExploration || false);
          setSelectedIndex(-1);
          setHasAttemptedSearch(true); // 검색 시도 완료
        } catch (error) {
          // 에러 시 이전 결과 유지 (빈 배열로 초기화하지 않음)
          console.warn('검색 제안 오류:', error);
          setSuggestions([]);
          setHasAttemptedSearch(true); // 에러도 검색 시도로 간주
        } finally {
          // 로딩 완료 표시
          setIsTyping(false);
        }
      }, 100); // 100ms 디바운스 (더 빠름)
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setExplorationSuggestions([]);
      setShowExploration(false);
      setIsTyping(false);
      setSelectedIndex(-1);
      setHasAttemptedSearch(false); // 검색 시도 초기화
      return undefined;
    }
  }, [query, currentLanguage]); // currentLanguage 필요 - API 호출에 사용됨

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // 키보드로 선택된 항목을 클릭한 것과 동일하게 처리
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setIsFocused(false);
    
    try {
      // 🚀 직접 입력 시에도 지역정보 추출 API 호출
      console.log('🌍 직접 입력 지역정보 추출 시작:', query.trim());
      
      const extractResponse = await fetch('/api/locations/extract-regional-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeName: query.trim(),
          language: currentLanguage
        })
      });
      
      const extractData = await extractResponse.json();
      
      let targetUrl = `/guide/${encodeURIComponent(query.trim())}`;
      
      if (extractData.success) {
        // 🎉 지역정보 추출 성공
        console.log('✅ 직접 입력 지역정보 추출 성공:', extractData.data);
        const urlParams = new URLSearchParams({
          region: extractData.data.region || '',
          country: extractData.data.country || '',
          countryCode: extractData.data.countryCode || '',
          type: 'attraction'
        });
        targetUrl += `?${urlParams.toString()}`;
      } else {
        console.warn('⚠️ 직접 입력 지역정보 추출 실패:', extractData.error);
      }
      
      console.log('🚀 직접 입력으로 이동:', {
        query: query.trim(),
        extractedInfo: extractData.success ? extractData.data : 'failed',
        url: targetUrl
      });
      
      setTimeout(() => {
        router.push(targetUrl);
      }, 100);
      
    } catch (error) {
      console.error('❌ 직접 입력 지역정보 추출 API 오류:', error);
      // 오류 발생 시 기본 처리
      setTimeout(() => {
        router.push(`/guide/${encodeURIComponent(query.trim())}`);
      }, 100);
    }
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    console.log('🎯 자동완성 선택:', suggestion);
    
    // 입력창에 선택된 제안사항 채우기
    setQuery(suggestion.name);
    
    // 자동완성 드롭다운 닫기
    setIsFocused(false);
    setSuggestions([]);
    setExplorationSuggestions([]);
    setShowExploration(false);
    setSelectedIndex(-1);
    setIsSubmitting(true);
    
    try {
      // 🚀 자동완성 location 필드 직접 파싱
      console.log('📍 자동완성 location 파싱:', suggestion.location);
      
      // "부산, 대한민국" 형태를 파싱
      const parts = suggestion.location.split(',').map(part => part.trim());
      
      if (parts.length >= 2) {
        const region = parts[0]; // 부산
        const country = parts[1]; // 대한민국
        
        // 국가명만 국가코드로 변환
        console.log('🌍 국가코드 변환 시작:', country);
        const countryCode = await getCountryCode(country);
        
        if (countryCode) {
          // 성공: 정확한 지역정보로 이동
          const urlParams = new URLSearchParams({
            region: region,
            country: country,
            countryCode: countryCode,
            type: 'attraction'
          });
          
          const targetUrl = `/guide/${encodeURIComponent(suggestion.name)}?${urlParams.toString()}`;
          
          console.log('🚀 자동완성 → URL 파라미터 변환 성공:', {
            name: suggestion.name,
            region: region,
            country: country,
            countryCode: countryCode,
            url: targetUrl
          });
          
          setTimeout(() => {
            router.push(targetUrl);
          }, 100);
          
        } else {
          // 국가코드 변환 실패: 장소명만으로 이동
          console.warn('⚠️ 국가코드 변환 실패, 장소명만으로 이동');
          const fallbackUrl = `/guide/${encodeURIComponent(suggestion.name)}`;
          setTimeout(() => {
            router.push(fallbackUrl);
          }, 100);
        }
      } else {
        // location 파싱 실패: 장소명만으로 이동
        console.warn('⚠️ location 파싱 실패, 장소명만으로 이동');
        const fallbackUrl = `/guide/${encodeURIComponent(suggestion.name)}`;
        setTimeout(() => {
          router.push(fallbackUrl);
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ 자동완성 처리 오류:', error);
      
      // 오류 발생 시 기본 처리
      const fallbackUrl = `/guide/${encodeURIComponent(suggestion.name)}`;
      setTimeout(() => {
        router.push(fallbackUrl);
      }, 100);
    }
  };

  const handleExplorationClick = (suggestion: Suggestion) => {
    console.log('🌟 탐색 추천 선택:', suggestion);
    
    // 탐색 추천을 클릭하면 바로 검색 실행
    setQuery(suggestion.name);
    setIsFocused(false);
    setSuggestions([]);
    setExplorationSuggestions([]);
    setShowExploration(false);
    setSelectedIndex(-1);
    setIsSubmitting(true);
    
    // 구조화된 지역 정보와 함께 바로 검색 실행
    const urlParams = new URLSearchParams({
      region: suggestion.region || '',
      country: suggestion.country || '',
      countryCode: suggestion.countryCode || '',
      type: suggestion.type || 'attraction'
    });
    
    const targetUrl = `/guide/${encodeURIComponent(suggestion.name)}?${urlParams.toString()}`;
    
    setTimeout(() => {
      router.push(targetUrl);
    }, 100);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // 클릭이 아닌 다른 이유로 포커스가 해제될 때만 처리
    // (예: Tab 키, 다른 곳 클릭 등)
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200); // 충분한 시간을 주어 클릭 이벤트가 먼저 처리되도록 함
  };


  return (
    <>
      {/* Background Overlay on Focus */}
      {isFocused && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 transition-all duration-500" />
      )}
      
      {/* Main Search Container */}
      <div className="relative z-50">
        
        {/* Search Card */}
        <div className={`
          relative transition-all duration-700 ease-out
          ${isFocused 
            ? 'scale-105 translate-y-[-8px]' 
            : 'scale-100 translate-y-0'
          }
        `}>
          
          {/* Input Container */}
          <div className={`
            relative bg-white transition-all duration-500
            ${isFocused 
              ? 'shadow-ultra ring-1 ring-black/5' 
              : 'shadow-premium'
            }
          `}
          style={{
            borderRadius: 'var(--radius-2xl)'
          }}>
            
            {/* Main Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholders[placeholderIndex]}
              disabled={isSubmitting}
              // 접근성 속성
              aria-label={String(t('search.searchLocation'))}
              aria-describedby="search-suggestions"
              aria-expanded={suggestions.length > 0 && isFocused}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              role="combobox"
              aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
              className={`
                input-base w-full bg-transparent
                px-8 py-6 text-fluid-xl font-light text-black
                placeholder-gray-500 touch-target-comfortable
                transition-all duration-300 ease-out
                ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
              `}
              style={{
                borderRadius: 'var(--radius-2xl)',
                fontSize: 'var(--text-xl)'
              }}
            />
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSubmitting}
              // 접근성 속성
              aria-label={query.trim() ? `'${query}' 검색하기` : '검색어를 입력하세요'}
              type="submit"
              className={`
                absolute right-4 top-1/2 transform -translate-y-1/2
                btn-base touch-target flex items-center justify-center group
                transition-all duration-300 ease-out
                ${query.trim() && !isSubmitting
                  ? 'bg-black text-white shadow-button-hover hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:translate-y-0' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                }
              `}
              style={{
                width: 'var(--touch-target-comfortable)',
                height: 'var(--touch-target-comfortable)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isTyping ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg 
                  className="w-6 h-6 transition-transform group-hover:scale-110" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
            
            {/* Progress Indicator */}
            {query.length > 0 && !isSubmitting && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-3xl overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-black to-gray-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min((query.length / 15) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Enhanced Suggestions Dropdown */}
          {isFocused && !isSubmitting && isValidQuery(query) && (
            <div 
              className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 overflow-hidden z-10 shadow-dropdown"
              style={{
                borderRadius: 'var(--radius-xl)'
              }}
            >
              {isTyping ? (
                /* 로딩 상태 */
                <div className="px-6 py-4 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm text-gray-600">{t('search.searching')}</span>
                </div>
              ) : suggestions.length > 0 ? (
                /* 검색 결과가 있을 때 */
                <div role="listbox" aria-label={String(t('search.suggestions'))}>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.id || suggestion.name}-${index}`}
                      id={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      role="option"
                      aria-selected={selectedIndex === index}
                      aria-label={`${suggestion.name}, ${suggestion.location}`}
                      className={`
                        w-full text-left transition-all duration-200 ease-out
                        group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
                        touch-target-comfortable
                        ${suggestion.isMainLocation 
                          ? selectedIndex === index
                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-l-indigo-500 text-indigo-900'
                            : 'bg-gradient-to-r from-indigo-50/30 to-blue-50/30 border-l-2 border-l-indigo-300 hover:from-indigo-50 hover:to-blue-50'
                          : selectedIndex === index 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-900' 
                            : 'hover:bg-gray-50'
                        }
                      `}
                      style={{
                        padding: 'var(--space-4) var(--space-6)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {suggestion.isMainLocation && (
                              <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            )}
                            <div className={`
                              font-medium transition-colors
                              ${suggestion.isMainLocation
                                ? selectedIndex === index 
                                  ? 'text-indigo-900 font-semibold' 
                                  : 'text-indigo-800 font-semibold group-hover:text-indigo-900'
                                : selectedIndex === index 
                                  ? 'text-blue-900' 
                                  : 'text-gray-900 group-hover:text-black'
                              }
                            `}>
                              {suggestion.name}
                            </div>
                            {suggestion.metadata?.isOfficial && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                suggestion.isMainLocation 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {suggestion.isMainLocation ? '📍 위치' : t('search.official')}
                              </span>
                            )}
                            {suggestion.metadata?.category && !suggestion.isMainLocation && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                {suggestion.metadata.category}
                              </span>
                            )}
                          </div>
                          <div className={`text-sm mt-1 ${
                            suggestion.isMainLocation
                              ? selectedIndex === index 
                                ? 'text-indigo-700 font-medium' 
                                : 'text-indigo-600 font-medium'
                              : selectedIndex === index 
                                ? 'text-blue-700' 
                                : 'text-gray-500'
                          }`}>
                            {suggestion.location}
                          </div>
                        </div>
                        <div className={`
                          flex items-center gap-2 transition-all duration-200
                          ${selectedIndex === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'}
                        `}>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedIndex === index ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t('search.clickToComplete')}
                          </span>
                          <svg 
                            className={`w-4 h-4 ${
                              selectedIndex === index ? 'text-blue-600' : 'text-gray-400'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Exploration Suggestions */}
                  {showExploration && explorationSuggestions.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 pb-2">
                      <div className="px-6 pb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          🌟 더 탐색해보세요
                        </h4>
                      </div>
                      {explorationSuggestions.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-4 last:mb-0">
                          <div className="px-6 pb-2">
                            <h5 className="text-xs font-medium text-gray-600">
                              {category.title}
                            </h5>
                          </div>
                          <div className="space-y-1">
                            {category.items.map((item, itemIndex) => (
                              <button
                                key={`${categoryIndex}-${itemIndex}`}
                                onClick={() => handleExplorationClick(item)}
                                className="w-full text-left px-6 py-2 hover:bg-blue-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm text-gray-800 group-hover:text-blue-800 font-medium">
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500 group-hover:text-blue-600">
                                      {item.location}
                                    </div>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : hasAttemptedSearch ? (
                /* 검색 시도 후 결과가 없을 때만 표시 */
                <div className="px-6 py-4">
                  <div className="text-sm text-gray-500 text-center">
                    <svg className="mx-auto h-6 w-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    &ldquo;{query}&rdquo;에 대한 {t('search.noResults')}
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </>
  );
}