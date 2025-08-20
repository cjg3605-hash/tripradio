'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { saveAutocompleteData } from '@/lib/cache/autocompleteStorage';
import { smartResolveLocation } from '@/lib/location/smart-location-resolver';
import { logger } from '@/lib/utils/logger';

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
  confidence?: number;   // 정확도 점수
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

// 🌍 국가코드 캐시 (메모리 캐싱) - 만료시간 포함
interface CacheEntry {
  value: string;
  timestamp: number;
}

const countryCodeCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 1000 * 60 * 60; // 1시간

// 🌏 한국어 국가명 → 영어 매핑 (REST Countries API 호환)
const koreanCountryMap: Record<string, string> = {
  '대한민국': 'South Korea',
  '한국': 'South Korea',
  '미국': 'United States',
  '일본': 'Japan',
  '중국': 'China',
  '영국': 'United Kingdom',
  '프랑스': 'France',
  '독일': 'Germany',
  '이탈리아': 'Italy',
  '스페인': 'Spain',
  '러시아': 'Russia',
  '인도': 'India',
  '브라질': 'Brazil',
  '캐나다': 'Canada',
  '호주': 'Australia',
  '태국': 'Thailand',
  '베트남': 'Vietnam',
  '싱가포르': 'Singapore',
  '말레이시아': 'Malaysia',
  '인도네시아': 'Indonesia',
  '필리핀': 'Philippines',
  '터키': 'Turkey',
  '이집트': 'Egypt',
  '남아프리카공화국': 'South Africa',
  '멕시코': 'Mexico',
  '아르헨티나': 'Argentina',
  '칠레': 'Chile',
  '페루': 'Peru',
  '네덜란드': 'Netherlands',
  '벨기에': 'Belgium',
  '스위스': 'Switzerland',
  '오스트리아': 'Austria',
  '노르웨이': 'Norway',
  '스웨덴': 'Sweden',
  '덴마크': 'Denmark',
  '핀란드': 'Finland'
};

// 🚀 REST Countries API 기반 국가코드 변환
async function getCountryCode(countryName: string): Promise<string | null> {
  try {
    logger.api.start('country-code-conversion', { countryName });
    
    // 캐시 확인 (만료시간 체크)
    const cached = countryCodeCache.get(countryName);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      logger.general.debug('국가코드 캐시 히트', { countryName, value: cached.value });
      return cached.value;
    } else if (cached) {
      // 만료된 캐시 삭제
      countryCodeCache.delete(countryName);
      logger.general.debug('만료된 캐시 삭제', { countryName });
    }
    
    // 🌏 한국어 국가명을 영어로 변환
    const englishCountryName = koreanCountryMap[countryName] || countryName;
    if (englishCountryName !== countryName) {
      logger.general.debug('한국어 국가명 매핑', { korean: countryName, english: englishCountryName });
    }
    
    // 여러 API 엔드포인트 시도
    const endpoints = [
      `https://restcountries.com/v3.1/name/${encodeURIComponent(englishCountryName)}?fields=cca3`,
      `https://restcountries.com/v3.1/translation/${encodeURIComponent(englishCountryName)}?fields=cca3`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          logger.api.error('country-code-api', { status: response.status, endpoint });
          continue;
        }
        
        const data = await response.json();
        
        if (data && data.length > 0 && data[0].cca3) {
          const countryCode = data[0].cca3; // ISO 3166-1 alpha-3 코드
          const cacheEntry: CacheEntry = {
            value: countryCode,
            timestamp: Date.now()
          };
          
          // 원래 한국어 이름과 영어 이름 모두 캐시에 저장
          countryCodeCache.set(countryName, cacheEntry);
          if (englishCountryName !== countryName) {
            countryCodeCache.set(englishCountryName, cacheEntry);
          }
          
          logger.api.success('country-code-conversion', { countryName, countryCode });
          return countryCode;
        }
      } catch (endpointError) {
        logger.api.error('country-code-endpoint', { endpoint, error: endpointError });
        continue;
      }
    }
    
    logger.general.warn('모든 국가코드 API 엔드포인트 실패', { countryName, englishCountryName });
    return null;
    
  } catch (error) {
    logger.general.error('국가코드 변환 전체 오류', error);
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
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [showExploration, setShowExploration] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  // 🔥 언어 변경 시 강제 리렌더링
  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    const handleLanguageChanged = (event: CustomEvent) => {
      console.log('🔄 검색박스: 언어 변경 이벤트 수신:', event.detail);
      setRenderKey(prev => prev + 1);
      
      // 검색 상태 초기화
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(-1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', handleLanguageChanged as EventListener);
      
      return () => {
        window.removeEventListener('languageChanged', handleLanguageChanged as EventListener);
      };
    }
    
    // cleanup 함수가 없는 경우를 위한 빈 함수 반환
    return () => {};
  }, []);

  // Single placeholder text
  const placeholderText = Array.isArray(t('home.searchPlaceholders')) 
    ? t('home.searchPlaceholders')[0] || '어디 가이드가 필요하세요?'
    : t('home.searchPlaceholders') || '어디 가이드가 필요하세요?';

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
          logger.search.query(query);
          const response = await fetch(`/api/locations/${currentLanguage}/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          const suggestionCount = data.success ? data.data.length : 0;
          
          setSuggestions(data.success ? data.data : []);
          setExplorationSuggestions(data.explorationSuggestions || []);
          setShowExploration(data.hasExploration || false);
          setSelectedIndex(-1);
          setHasAttemptedSearch(true);
          
          logger.search.results(suggestionCount);
        } catch (error) {
          logger.search.error(error);
          setSuggestions([]);
          setHasAttemptedSearch(true);
        } finally {
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
      setHasAttemptedSearch(false);
      return undefined;
    }
  }, [query, currentLanguage]); // currentLanguage 필요 - API 호출에 사용됨

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    logger.ui.interaction('keyboard', { key: e.key, selectedIndex, suggestionsLength: suggestions.length });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : selectedIndex;
      setSelectedIndex(newIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
      setSelectedIndex(newIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        logger.ui.interaction('suggestion-select', { suggestion: suggestions[selectedIndex].name });
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        logger.ui.interaction('direct-search', { query: query.trim() });
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      logger.ui.interaction('escape', {});
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || isSubmitting) {
      logger.general.warn('검색 조기 종료', { hasQuery: !!query.trim(), isSubmitting });
      return;
    }
    
    setIsSubmitting(true);
    setIsFocused(false);
    
    // 🚀 새로운 URL 구조: /guide/[language]/[location]
    const basicLocationPath = encodeURIComponent(query.trim());
    const immediateUrl = `/guide/${currentLanguage}/${basicLocationPath}`;
    
    // 기본 세션 데이터 즉시 저장
    const basicData = {
      name: query.trim(),
      location: '',
      region: 'loading',
      country: 'loading',
      countryCode: 'loading',
      type: 'attraction' as const,
      confidence: 0.5,
      timestamp: Date.now()
    };
    
    saveAutocompleteData(
      query.trim(),
      basicData,
      {
        region: 'loading',
        country: 'loading',
        countryCode: 'loading'
      }
    );
    
    // 🚀 즉시 페이지 이동
    logger.ui.interaction('immediate-navigation', { target: immediateUrl });
    router.push(immediateUrl);
    
    // 백그라운드에서 상세 정보 처리
    setIsSubmitting(false);
    
    // 백그라운드 처리 (비차단)
    Promise.resolve().then(async () => {
      try {
        logger.search.query(query.trim());
        
        const smartResolution = await smartResolveLocation(
          query.trim(),
          query.trim(),
          ''
        );
        
        logger.general.info('백그라운드 스마트 위치 해결 완료', { confidence: smartResolution.confidence });
        
        const selectedLocation = smartResolution.selectedLocation;
        
        // 상세 정보 업데이트 (국가코드는 병렬로 처리)
        const [countryCode] = await Promise.allSettled([
          getCountryCode(selectedLocation.country)
        ]);
        
        const enhancedData = {
          name: selectedLocation.displayName,
          location: `${selectedLocation.region}, ${selectedLocation.country}`,
          region: selectedLocation.region,
          country: selectedLocation.country,
          countryCode: countryCode.status === 'fulfilled' ? (countryCode.value || undefined) : undefined,
          type: 'attraction' as const,
          confidence: smartResolution.confidence,
          timestamp: Date.now()
        };
        
        // 향상된 데이터로 업데이트
        saveAutocompleteData(
          selectedLocation.displayName,
          enhancedData,
          {
            region: selectedLocation.region,
            country: selectedLocation.country,
            countryCode: countryCode.status === 'fulfilled' ? (countryCode.value || undefined) : undefined
          }
        );
        
        logger.general.info('백그라운드 데이터 업데이트 완료');
        
      } catch (error) {
        logger.general.warn('백그라운드 스마트 해결 실패, 폴백 시도', error);
        
        // 백그라운드 폴백 처리
        try {
          logger.api.start('background-autocomplete-fallback', { query: query.trim() });
          
          const searchResponse = await fetch(`/api/locations/${currentLanguage}/search?q=${encodeURIComponent(query.trim())}`);
          const searchData = await searchResponse.json();
          
          if (searchData.success && searchData.data && searchData.data.length > 0) {
            const firstSuggestion = searchData.data[0];
            logger.api.success('background-autocomplete-fallback', { suggestion: firstSuggestion.name });
            
            const fallbackData = {
              name: firstSuggestion.name,
              location: firstSuggestion.location,
              region: firstSuggestion.region || 'unknown',
              country: firstSuggestion.country || 'unknown', 
              countryCode: firstSuggestion.countryCode || 'unknown',
              type: 'attraction' as const,
              confidence: 0.7,
              timestamp: Date.now()
            };
            
            saveAutocompleteData(
              firstSuggestion.name,
              fallbackData,
              {
                region: firstSuggestion.region || 'unknown',
                country: firstSuggestion.country || 'unknown',
                countryCode: firstSuggestion.countryCode || 'unknown'
              }
            );
            
            logger.general.info('백그라운드 폴백 데이터 업데이트 완료');
          }
        } catch (fallbackError) {
          logger.general.error('백그라운드 폴백도 실패:', fallbackError);
        }
      }
    });
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
    
    // 🚀 새로운 URL 구조: /guide/[language]/[location] 
    const basicUrl = `/guide/${currentLanguage}/${encodeURIComponent(suggestion.name)}`;
    
    // 기본 자동완성 데이터로 즉시 저장
    const basicData = {
      name: suggestion.name,
      location: suggestion.location,
      region: suggestion.region || 'loading',
      country: suggestion.country || 'loading',
      countryCode: suggestion.countryCode || 'loading',
      type: suggestion.type || 'attraction',
      confidence: 0.7,
      timestamp: Date.now()
    };
    
    saveAutocompleteData(suggestion.name, basicData, {
      region: suggestion.region || 'loading',
      country: suggestion.country || 'loading',
      countryCode: suggestion.countryCode || 'loading'
    });
    
    // 🚀 즉시 페이지 이동
    console.log('🚀 즉시 네비게이션:', basicUrl);
    router.push(basicUrl);
    setIsSubmitting(false);
    
    // 백그라운드에서 상세 정보 처리 (비차단)
    Promise.resolve().then(async () => {
      try {
        // 자동완성 location 필드 파싱
        console.log('📍 백그라운드 location 파싱:', suggestion.location);
        
        const parts = suggestion.location.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
          const region = parts[0];
          const country = parts[1];
          
          // Gemini API와 국가코드 변환을 병렬로 처리
          const [geminiResult, countryCodeResult] = await Promise.allSettled([
            // Gemini API 호출 (5초 타임아웃)
            fetch('/api/locations/extract-regional-info', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                placeName: suggestion.name,
                language: currentLanguage,
                detailed: false
              }),
              signal: AbortSignal.timeout(5000)
            }).then(res => res.json()),
            // 국가코드 변환
            getCountryCode(country)
          ]);
          
          let enhancedInfo = {
            region: region,
            country: country,
            countryCode: undefined as string | undefined
          };
          
          // Gemini 결과 처리
          if (geminiResult.status === 'fulfilled' && 
              geminiResult.value?.success && 
              geminiResult.value?.data?.region && 
              geminiResult.value?.data?.countryCode) {
            enhancedInfo = {
              region: geminiResult.value.data.region,
              country: geminiResult.value.data.country || country,
              countryCode: geminiResult.value.data.countryCode
            };
            console.log('✅ Gemini 백그라운드 강화 성공:', enhancedInfo);
          } else {
            // 국가코드 결과 사용
            if (countryCodeResult.status === 'fulfilled' && countryCodeResult.value) {
              enhancedInfo.countryCode = countryCodeResult.value;
            }
            console.log('🔄 기존 방식으로 백그라운드 처리:', enhancedInfo);
          }
          
          // 향상된 데이터로 업데이트
          const enhancedData = {
            ...suggestion,
            region: enhancedInfo.region,
            country: enhancedInfo.country,
            countryCode: enhancedInfo.countryCode,
            confidence: geminiResult.status === 'fulfilled' ? 0.9 : 0.8,
            timestamp: Date.now()
          };
          
          saveAutocompleteData(suggestion.name, enhancedData, enhancedInfo);
          console.log('💾 백그라운드 향상된 데이터 저장 완료');
          
        } else {
          // location 파싱 실패시 원본 데이터로 업데이트
          console.log('⚠️ 백그라운드 location 파싱 실패, 원본 데이터 사용');
          const fallbackInfo = {
            region: suggestion.name,
            country: '',
            countryCode: undefined
          };
          
          saveAutocompleteData(suggestion.name, suggestion, fallbackInfo);
        }
        
      } catch (error) {
        console.error('❌ 백그라운드 자동완성 처리 오류:', error);
        
        // 최소한 원본 데이터라도 저장
        try {
          const fallbackInfo = {
            region: suggestion.name,
            country: '',
            countryCode: undefined
          };
          saveAutocompleteData(suggestion.name, suggestion, fallbackInfo);
          console.log('💾 백그라운드 오류 상황에서도 기본 데이터 저장 완료');
        } catch (storageError) {
          console.error('❌ 백그라운드 SessionStorage 저장 실패:', storageError);
        }
      }
    });
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
    
    // 탐색 추천 데이터 즉시 저장
    saveAutocompleteData(suggestion.name, suggestion, {
      region: suggestion.region || 'unknown',
      country: suggestion.country || 'unknown',
      countryCode: suggestion.countryCode || 'unknown'
    });
    
    // 🚀 새로운 URL 구조: /guide/[language]/[location]
    const targetUrl = `/guide/${currentLanguage}/${encodeURIComponent(suggestion.name)}`;
    console.log('🚀 탐색 추천 즉시 네비게이션:', targetUrl);
    router.push(targetUrl);
    setIsSubmitting(false);
  };

  const handleFocus = () => {
    console.log('🎯 입력창 포커스 취득');
    setIsFocused(true);
  };

  const handleBlur = () => {
    // 클릭이 아닌 다른 이유로 포커스가 해제될 때만 처리
    // (예: Tab 키, 다른 곳 클릭 등)
    console.log('🔄 입력창 포커스 해제 - 200ms 후 selectedIndex 초기화');
    setTimeout(() => {
      console.log('🔄 포커스 해제 완료:', { selectedIndex, isFocused });
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200); // 충분한 시간을 주어 클릭 이벤트가 먼저 처리되도록 함
  };


  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 xs:px-0" style={{ zIndex: 'var(--z-searchbox)' }}>
      {/* 🎯 메인 검색창 - HeroSection 스타일 */}
      <div className="flex items-center bg-white/95 backdrop-blur rounded-sm shadow-2xl border border-white/30 p-2 xs:p-3">
        <div className="flex items-center flex-1 px-2 xs:px-4">
          <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400 mr-2 xs:mr-3" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholderText}
            disabled={isSubmitting}
            // 접근성 속성
            aria-label={String(t('search.searchLocation'))}
            aria-describedby="search-suggestions"
            aria-expanded={suggestions.length > 0 && isFocused}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            role="combobox"
            aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
            className="border-0 bg-transparent text-base xs:text-lg placeholder:text-gray-500 focus-visible:ring-0"
          />
        </div>
        
        {/* 🔄 로딩 인디케이터 */}
        {isTyping && (
          <div className="px-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          </div>
        )}

        {/* 🔍 검색 버튼 - Example HeroSection 스타일 */}
        {!isTyping && (
          <Button 
            size="lg" 
            onClick={handleSearch}
            disabled={!query.trim() || isSubmitting}
            aria-label={query.trim() ? `'${query}' 검색하기` : '검색어를 입력하세요'}
            type="submit"
            className="rounded-sm px-6 xs:px-8 bg-black hover:bg-black/90"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                검색
              </>
            )}
          </Button>
        )}
      </div>

      {/* 📋 검색 제안 목록 - 검색창 바로 아래에 위치 */}
      {isFocused && !isSubmitting && isValidQuery(query) && (
        <div className="absolute top-full left-0 w-full mt-2" style={{ zIndex: 'var(--z-autocomplete)' }}>
          <div className="bg-white border border-gray-200 rounded-md shadow-2xl max-h-80 overflow-y-auto backdrop-filter backdrop-blur-sm relative">
            {isTyping ? (
              /* 로딩 상태 */
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                <span className="text-sm font-normal text-gray-600 leading-6">{t('search.searching')}</span>
              </div>
            ) : suggestions.length > 0 ? (
              /* 검색 결과 */
              <div role="listbox" aria-label={String(t('search.suggestions'))}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.id || suggestion.name}-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-150 ease border-b border-gray-100 last:border-b-0 text-left ${
                      index === selectedIndex 
                        ? 'bg-gray-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* 한 줄 표시: 장소명 + 위치 */}
                    <div className="text-gray-900 font-medium text-base leading-5 truncate">
                      {suggestion.name}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        · {suggestion.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasAttemptedSearch ? (
              /* 검색 시도 후 결과가 없을 때 */
              <div className="px-4 py-6 text-center">
                <div className="text-sm font-normal text-gray-500 leading-6">
                  &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}