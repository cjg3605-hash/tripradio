'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMode } from '@/contexts/ModeContext';
import { MapPin, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

// UI 컴포넌트들을 동적 로딩으로 분리
const Input = dynamic(() => import('@/components/ui/input').then(mod => ({ default: mod.Input })), {
  ssr: true,
  loading: () => <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
});

const Button = dynamic(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })), {
  ssr: true,
  loading: () => <div className="h-10 px-4 bg-gray-100 rounded-md animate-pulse" />
});
import { saveAutocompleteData, getAutocompleteData } from '@/lib/cache/autocompleteStorage';
import { smartResolveLocation } from '@/lib/location/smart-location-resolver';
import { logger } from '@/lib/utils/logger';
import { safeGet } from '@/lib/api/safe-fetch';

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

// 🌏 자동완성 API에서 영어 국가명을 반환하므로 별도 변환 불필요

// 🚀 REST Countries API 기반 국가코드 변환
async function getCountryCode(countryName: string): Promise<string | null> {
  try {
    logger.api.start('country-code-conversion', { countryName });
    
    // "미분류", "알 수 없음" 등 Unknown 값 처리 (API 호출 전에 확인)
    const unknownValues = ['미분류', '알 수 없음', '불명', 'unknown', 'unclassified', 'n/a', ''];
    if (unknownValues.includes(countryName.toLowerCase().trim())) {
      logger.general.debug('분류되지 않은 국가명 감지, 처리 중단', { countryName });
      return null;
    }
    
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
    
    // 🌏 자동완성 API에서 파싱된 영어 국가명을 직접 사용
    // (이미 location 파싱 과정에서 영어 국가명을 추출했으므로 매핑 불필요)
    
    // 내부 API를 통해 국가 코드 조회
    try {
      const response = await fetch(`/api/country-code?country=${encodeURIComponent(countryName)}`);
      
      if (!response.ok) {
        logger.api.error('country-code-api', { status: response.status });
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.countryCode) {
        const countryCode = data.countryCode;
        const cacheEntry: CacheEntry = {
          value: countryCode,
          timestamp: Date.now()
        };
        
        // 캐시에 저장
        countryCodeCache.set(countryName, cacheEntry);
        
        logger.api.success('country-code-conversion', { countryName, countryCode });
        return countryCode;
      }
    } catch (apiError) {
      logger.api.error('country-code-api-error', { error: apiError });
    }
    
    logger.general.warn('모든 국가코드 API 엔드포인트 실패', { countryName });
    return null;
    
  } catch (error) {
    logger.general.error('국가코드 변환 전체 오류', error);
    return null;
  }
}

export default function NextLevelSearchBox() {
  const { mode } = useMode();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [explorationSuggestions, setExplorationSuggestions] = useState<ExplorationSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [apiErrorType, setApiErrorType] = useState<'network' | 'timeout' | 'server' | null>(null);
  const [showExploration, setShowExploration] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
      setHasAttemptedSearch(false);
      setHasApiError(false);
      setApiErrorType(null);
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
  const placeholderText = (() => {
    const searchPlaceholders = t('home.searchPlaceholders');
    if (Array.isArray(searchPlaceholders)) {
      return searchPlaceholders[0] || '어디 가이드가 필요하세요?';
    }
    return searchPlaceholders || '어디 가이드가 필요하세요?';
  })();

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
      const timer = setTimeout(async () => {
        // 이전 API 요청 취소
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // 새 AbortController 생성
        abortControllerRef.current = new AbortController();
        
        // 디바운스 후 API 호출 직전에만 로딩 상태 시작
        setIsTyping(true);
        try {
          logger.search.query(query);
          
          // 상태 초기화
          setHasApiError(false);
          setApiErrorType(null);
          
          // 5초 타임아웃으로 API 호출 (AI 처리 시간 고려)
          const result = await safeGet(`/api/locations/${currentLanguage}/search?q=${encodeURIComponent(query)}`, {
            timeout: 5000, // 5초 타임아웃
            signal: abortControllerRef.current.signal // AbortController 신호 추가
          });
          
          if (!result.success) {
            // API 호출 실패 - 에러 타입 분류
            const errorMessage = result.error || 'API 요청 실패';
            let errorType: 'network' | 'timeout' | 'server' = 'server';
            
            if (errorMessage.includes('timeout') || errorMessage.includes('시간초과')) {
              errorType = 'timeout';
            } else if (errorMessage.includes('network') || errorMessage.includes('네트워크') || errorMessage.includes('fetch')) {
              errorType = 'network';
            }
            
            setHasApiError(true);
            setApiErrorType(errorType);
            setSuggestions([]);
            setHasAttemptedSearch(false); // API 실패 시에는 검색 시도로 간주하지 않음
            
            throw new Error(errorMessage);
          }
          
          const data = result.data;
          const suggestionCount = data.success ? data.data.length : 0;
          
          // API 호출 성공
          setSuggestions(data.success ? data.data : []);
          setExplorationSuggestions(data.explorationSuggestions || []);
          setShowExploration(data.hasExploration || false);
          setSelectedIndex(-1);
          setHasAttemptedSearch(true); // 성공적인 API 호출 후에만 true
          setHasApiError(false);
          setApiErrorType(null);
          
          logger.search.results(suggestionCount);
        } catch (error) {
          // AbortError는 정상적인 취소이므로 무시
          if (error instanceof Error && error.name === 'AbortError') {
            return; // 취소된 요청은 무시
          }
          
          logger.search.error(error);
          // catch 블록에서는 이미 위에서 에러 상태가 설정됨
        } finally {
          setIsTyping(false);
        }
      }, 250); // 250ms 디바운스 (업계 표준)
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setExplorationSuggestions([]);
      setShowExploration(false);
      setIsTyping(false);
      setSelectedIndex(-1);
      setHasAttemptedSearch(false);
      setHasApiError(false);
      setApiErrorType(null);
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
    
    // 🎯 모드에 따라 다른 페이지로 라우팅
    const basicLocationPath = encodeURIComponent(query.trim());
    let targetUrl;
    
    if (mode === 'podcast') {
      // 팟캐스트 모드: 팟캐스트 전용 페이지로 이동
      targetUrl = `/podcast/${currentLanguage}/${basicLocationPath}`;
    } else {
      // 가이드 모드: 기존 가이드 페이지로 이동
      targetUrl = `/guide/${currentLanguage}/${basicLocationPath}`;
    }
    
    if (suggestions.length > 0 && suggestions[0].isMainLocation) {
      logger.ui.interaction('direct-search-hub', { query: query.trim(), isMainLocation: true });
    } else {
      logger.ui.interaction('direct-search-guide', { query: query.trim(), isMainLocation: false });
    }
    
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
    
    // 🚀 즉시 페이지 이동 (허브 또는 가이드 페이지)
    logger.ui.interaction('immediate-navigation', { target: targetUrl });
    router.push(targetUrl);
    
    // 백그라운드에서 상세 정보 처리
    setIsSubmitting(false);
    
    // 백그라운드 처리 (비차단)
    Promise.resolve().then(async () => {
      try {
        logger.search.query(query.trim());
        
        // 1단계: 세션 스토리지에서 이미 저장된 데이터 확인
        let actualCountry = '';
        let actualRegion = '';
        let resolvedCountryCode = '';
        
        const savedData = getAutocompleteData(query.trim(), false);
        if (savedData && savedData.country && savedData.region) {
          // 저장된 데이터가 유효한 경우 사용
          const invalidValues = ['미분류', '알 수 없음', '불명', 'unknown', 'unclassified', 'n/a', '', 'loading'];
          if (!invalidValues.includes(savedData.country.toLowerCase()) && 
              !invalidValues.includes(savedData.region.toLowerCase())) {
            actualCountry = savedData.country;
            actualRegion = savedData.region;
            resolvedCountryCode = savedData.countryCode || '';
            console.log(`✅ 세션에서 위치 정보 재사용: ${actualRegion}, ${actualCountry}`);
          }
        }
        
        // 2단계: Direct search에서는 location 파싱 불가능하므로 스킵
        
        // 3단계: 실제 국가 정보가 있으면 먼저 국가코드 구하기 (세션에 없는 경우만)
        if (actualCountry && !resolvedCountryCode) {
          try {
            const countryCodeResult = await getCountryCode(actualCountry);
            if (countryCodeResult) {
              resolvedCountryCode = countryCodeResult;
            }
          } catch (error) {
            console.log('국가코드 변환 실패:', error);
          }
        }
        
        // 4단계: Smart resolver 호출 (실제 위치 데이터와 함께)
        const locationData = actualCountry && actualRegion ? {
          country: actualCountry,
          region: actualRegion,
          countryCode: resolvedCountryCode
        } : undefined;
        
        const smartResolution = await smartResolveLocation(
          query.trim(),
          query.trim(),
          actualCountry ? `country: ${actualCountry}` : '',
          locationData
        );
        
        logger.general.info('백그라운드 스마트 위치 해결 완료', { confidence: smartResolution.confidence });
        
        const selectedLocation = smartResolution.selectedLocation;
        
        // 5단계: 실제 구한 값들로 보완
        if (actualCountry && selectedLocation.country === '미분류') {
          selectedLocation.country = actualCountry;
        }
        if (actualRegion && selectedLocation.region === '미분류') {
          selectedLocation.region = actualRegion;
        }
        
        const enhancedData = {
          name: selectedLocation.displayName,
          location: `${selectedLocation.region}, ${selectedLocation.country}`,
          region: selectedLocation.region,
          country: selectedLocation.country,
          countryCode: resolvedCountryCode || undefined,
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
            countryCode: resolvedCountryCode || undefined
          }
        );
        
        logger.general.info('백그라운드 데이터 업데이트 완료');
        
      } catch (error) {
        logger.general.warn('백그라운드 스마트 해결 실패, 폴백 시도', error);
        
        // 백그라운드 폴백 처리
        try {
          logger.api.start('background-autocomplete-fallback', { query: query.trim() });
          
          const searchResult = await safeGet(`/api/locations/${currentLanguage}/search?q=${encodeURIComponent(query.trim())}`);
          
          if (!searchResult.success) {
            throw new Error(searchResult.error || 'API 요청 실패');
          }
          
          const searchData = searchResult.data;
          
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
    
    // 🚀 모드에 따른 라우팅 로직
    let targetUrl: string;
    
    if (mode === 'podcast') {
      // 팟캐스트 모드: 팟캐스트 전용 페이지로 이동
      targetUrl = `/podcast/${currentLanguage}/${encodeURIComponent(suggestion.name)}`;
      console.log('🎙️ 팟캐스트 페이지로 이동:', targetUrl);
    } else {
      // 가이드 모드: 기존 가이드 페이지로 이동
      if (suggestion.isMainLocation) {
        // 지역명(첫 번째 항목)은 통일된 URL로 이동 (서버에서 자동 분류)
        targetUrl = `/guide/${currentLanguage}/${encodeURIComponent(suggestion.name)}`;
        console.log('🌏 지역/허브로 이동:', targetUrl);
      } else {
        // 관광명소들은 개별 가이드로 이동
        targetUrl = `/guide/${currentLanguage}/${encodeURIComponent(suggestion.name)}`;
        console.log('🏛️ 개별 가이드로 이동:', targetUrl);
      }
    }
    
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
    console.log('🚀 즉시 네비게이션:', targetUrl);
    router.push(targetUrl);
    setIsSubmitting(false);
    
    // 백그라운드에서 상세 정보 처리 (비차단)
    Promise.resolve().then(async () => {
      try {
        // 자동완성 location 필드 파싱
        console.log('📍 백그라운드 location 파싱:', suggestion.location);
        
        const parts = suggestion.location.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
          let region = parts[0].trim();
          let country = parts[1].trim();
          
          // "미분류", "알 수 없음" 등 잘못된 값 방지
          const invalidValues = ['미분류', '알 수 없음', '불명', 'unknown', 'unclassified', 'n/a', ''];
          
          if (invalidValues.includes(region.toLowerCase())) {
            console.log(`⚠️ 잘못된 region 값 감지: "${region}" → 기본값으로 대체`);
            region = suggestion.name; // 장소명을 region으로 사용
          }
          
          if (invalidValues.includes(country.toLowerCase())) {
            console.log(`⚠️ 잘못된 country 값 감지: "${country}" → 백그라운드 처리 중단`);
            return; // country가 잘못되면 처리 중단
          }
          
          // API용 영어 국가명으로 3자리 코드 변환
          let finalCountryCode = '';
          if (country) {
            try {
              // suggestion.apiCountry가 있으면 사용, 없으면 기존 방식
              const apiCountryName = (suggestion as any).apiCountry || country;
              finalCountryCode = await getCountryCode(apiCountryName) || '';
              console.log(`🌍 API 국가코드 변환: "${apiCountryName}" → "${finalCountryCode}"`);
            } catch (error) {
              console.log('국가코드 변환 실패:', error);
            }
          }
          
          // 파싱된 정확한 데이터 사용 (API 호출 제거)
          const enhancedInfo = {
            placeName: suggestion.name,
            region: region,
            country: country,
            countryCode: finalCountryCode || undefined
          };
          
          console.log('✅ 파싱된 정확한 데이터 사용:', enhancedInfo);
          
          // 정확한 데이터로 업데이트
          const enhancedData = {
            ...suggestion,
            region: enhancedInfo.region,
            country: enhancedInfo.country,
            countryCode: enhancedInfo.countryCode,
            confidence: 0.95, // 파싱된 정확한 데이터이므로 높은 신뢰도
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
    
    // 드롭다운 열릴 때 이벤트 발신 (아코디언 효과용)
    window.dispatchEvent(new CustomEvent('searchDropdownOpen', { 
      detail: { isOpen: true } 
    }));
  };

  // 재시도 함수
  const handleRetrySearch = async () => {
    if (!query.trim() || isTyping) return;
    
    // 이전 API 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    setIsTyping(true);
    setHasApiError(false);
    setApiErrorType(null);
    
    try {
      logger.search.query(`${query} (재시도)`);
      
      const result = await safeGet(`/api/locations/${currentLanguage}/search?q=${encodeURIComponent(query)}`, {
        timeout: 5000,
        signal: abortControllerRef.current.signal
      });
      
      if (!result.success) {
        const errorMessage = result.error || 'API 요청 실패';
        let errorType: 'network' | 'timeout' | 'server' = 'server';
        
        if (errorMessage.includes('timeout') || errorMessage.includes('시간초과')) {
          errorType = 'timeout';
        } else if (errorMessage.includes('network') || errorMessage.includes('네트워크') || errorMessage.includes('fetch')) {
          errorType = 'network';
        }
        
        setHasApiError(true);
        setApiErrorType(errorType);
        setSuggestions([]);
        setHasAttemptedSearch(false);
        return;
      }
      
      const data = result.data;
      const suggestionCount = data.success ? data.data.length : 0;
      
      setSuggestions(data.success ? data.data : []);
      setExplorationSuggestions(data.explorationSuggestions || []);
      setShowExploration(data.hasExploration || false);
      setSelectedIndex(-1);
      setHasAttemptedSearch(true);
      setHasApiError(false);
      setApiErrorType(null);
      
      logger.search.results(suggestionCount);
    } catch (error) {
      // AbortError는 정상적인 취소이므로 무시
      if (error instanceof Error && error.name === 'AbortError') {
        return; // 취소된 요청은 무시
      }
      
      logger.search.error(error);
      setHasApiError(true);
      setApiErrorType('server');
    } finally {
      setIsTyping(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // relatedTarget을 확인하여 드롭다운 내부 클릭인지 확인
    const target = e.relatedTarget as HTMLElement;
    const searchContainer = e.currentTarget.closest('[data-search-container]');
    
    // 포커스가 검색 컨테이너 내부로 이동하는 경우 blur 무시
    if (target && searchContainer && searchContainer.contains(target)) {
      console.log('🎯 검색 컨테이너 내부 포커스 이동 - blur 무시');
      return;
    }
    
    console.log('🔄 입력창 포커스 해제 - 300ms 후 드롭다운 닫기');
    setTimeout(() => {
      console.log('🔄 포커스 해제 완료:', { selectedIndex, isFocused });
      setIsFocused(false);
      setSelectedIndex(-1);
      
      // 드롭다운 닫힐 때 이벤트 발신 (아코디언 효과 해제용)
      window.dispatchEvent(new CustomEvent('searchDropdownClose', { 
        detail: { isOpen: false } 
      }));
    }, 300); // 클릭 이벤트가 확실히 처리될 수 있도록 시간 증가
  };


  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 xs:px-0" style={{ zIndex: 'var(--z-searchbox)' }} data-search-container>
      {/* 🎯 메인 검색창 - HeroSection 스타일 */}
      <div className="search-container flex items-center p-2 xs:p-3 
                      bg-white/95 dark:bg-dark-surface-2 
                      border border-gray-200 dark:border-dark-border-2
                      rounded-lg shadow-lg dark:shadow-dark-lg
                      backdrop-blur-sm
                      transition-all duration-200 
                      hover:shadow-xl dark:hover:shadow-dark-xl
                      focus-within:border-gray-300 dark:focus-within:border-dark-border-3
                      focus-within:shadow-xl dark:focus-within:shadow-dark-xl">
        <div className="flex items-center flex-1 px-4 xs:px-6">
          <MapPin className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary mr-3 flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // 타이핑 즉시 드롭다운 관련 상태 초기화 (더 빠른 반응성)
              setIsTyping(false);
              setSuggestions([]);
              setHasApiError(false);
              setHasAttemptedSearch(false);
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholderText}
            disabled={isSubmitting}
            // 접근성 속성
            aria-label={String(t('search.searchLocation'))}
            aria-describedby="search-suggestions"
            aria-expanded={isFocused && isValidQuery(query) && (suggestions.length > 0 || hasApiError || hasAttemptedSearch)}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            role="combobox"
            aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
            aria-invalid={hasApiError ? 'true' : 'false'}
            className="border-0 bg-transparent text-base xs:text-lg
                      text-gray-900 dark:text-dark-text-primary
                      placeholder:text-gray-500 dark:placeholder:text-dark-text-secondary 
                      placeholder:text-base placeholder:xs:text-lg
                      focus-visible:ring-0 focus-visible:outline-none
                      disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        {/* 🔄 로딩 인디케이터 */}
        {isTyping && (
          <div className="px-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-dark-border-2 border-t-transparent"></div>
          </div>
        )}

        {/* 🔍 검색 버튼 - 다크모드 대응 */}
        {!isTyping && (
          <Button 
            size="lg" 
            onClick={handleSearch}
            disabled={!query.trim() || isSubmitting}
            aria-label={query.trim() ? `'${query}' 검색하기` : '검색어를 입력하세요'}
            type="submit"
            className="px-4 xs:px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                      bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white
                      dark:bg-dark-interactive dark:hover:bg-dark-interactive-hover 
                      dark:active:bg-dark-interactive-active dark:text-dark-text-primary
                      border border-gray-800 dark:border-dark-border-2
                      shadow-md hover:shadow-lg dark:shadow-dark-sm dark:hover:shadow-dark-md
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-dark-border-3
                      focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-base xs:text-lg">{t('search.searchButton')}</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* 📋 검색 제안 목록 - API 호출 관련 상태가 있을 때만 표시 */}
      {isFocused && !isSubmitting && (isTyping || hasApiError || suggestions.length > 0 || hasAttemptedSearch) && (
        <div className="absolute top-full left-0 w-full mt-1" style={{ zIndex: 'var(--z-autocomplete)' }}>
          <div id="search-suggestions" 
               className="bg-white/95 dark:bg-dark-surface-2 
                         border border-gray-200 dark:border-dark-border-2
                         rounded-lg shadow-xl dark:shadow-dark-xl
                         backdrop-blur-sm max-h-80 overflow-y-auto
                         animate-fade-in-down"
               role="region" 
               aria-label="검색 제안사항">
            {isTyping ? (
              /* 로딩 상태 */
              <div className="px-6 py-4 flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 dark:border-dark-border-2 border-t-transparent"></div>
                <span className="text-base xs:text-lg text-gray-700 dark:text-dark-text-secondary leading-6">{t('search.searching')}</span>
              </div>
            ) : hasApiError ? (
              /* API 에러 상태 */
              <div className="px-6 py-6" role="alert" aria-live="assertive">
                <div className="text-center">
                  <div className="text-red-600 dark:text-red-400 mb-3">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="text-base xs:text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                    {apiErrorType === 'timeout' ? '검색 시간이 초과되었습니다' :
                     apiErrorType === 'network' ? '인터넷 연결을 확인해 주세요' :
                     '검색 서비스에 일시적인 문제가 발생했습니다'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                    {apiErrorType === 'timeout' ? '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' :
                     apiErrorType === 'network' ? '네트워크 연결 상태를 확인하고 다시 시도해 주세요.' :
                     '잠시 후 다시 시도해 주세요.'}
                  </div>
                  <button
                    onClick={handleRetrySearch}
                    disabled={isTyping}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`"${query}" 검색 재시도하기`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    다시 시도
                  </button>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              /* 검색 결과 */
              <div role="listbox" aria-label={String(t('search.suggestions'))}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.id || suggestion.name}-${index}`}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-6 py-4 cursor-pointer transition-all duration-200 
                               border-b border-gray-200/30 dark:border-dark-border-1 
                               last:border-b-0 text-left ${
                      index === selectedIndex 
                        ? 'bg-gray-50/80 dark:bg-dark-surface-3 backdrop-blur-sm' 
                        : 'hover:bg-gray-50/60 dark:hover:bg-dark-surface-3/70'
                    }`}
                    tabIndex={-1}
                  >
                    {/* 간결한 표시: 장소명 + 도시/국가 */}
                    <div className="text-gray-900 dark:text-dark-text-primary font-medium text-base xs:text-lg leading-5 truncate">
                      {suggestion.name}
                      <span className="text-sm xs:text-base font-normal text-gray-600 dark:text-dark-text-secondary ml-2">
                        · {suggestion.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasAttemptedSearch ? (
              /* 성공적인 API 호출 후 결과가 없을 때 */
              <div className="px-6 py-6 text-center" role="status" aria-live="polite">
                <div className="mb-3">
                  <svg className="w-12 h-12 text-gray-300 dark:text-dark-border-2 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-base xs:text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다
                </div>
                <div className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                  다른 검색어를 시도해보세요. 예: 도시명, 관광명소, 박물관 등
                </div>
                <div className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                  💡 팁: 한글 또는 영어로 더 구체적인 지명을 입력해보세요
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}