'use client';

import { useState, useEffect, useRef, useMemo, useCallback, useReducer, Component, ReactNode, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

// 성능 최적화: 중요하지 않은 컴포넌트는 지연 로드
const OptimalAdSense = dynamic(() => import('@/components/ads/OptimalAdSense'), {
  loading: () => <div className="h-24 animate-pulse bg-gray-100 rounded"></div>,
  ssr: true // SSR 활성화로 hydration 일치
});

// 필요한 함수들을 별도로 import
import { mergeTranslatedCountries } from '@/data/regionCountries';

// 성능 최적화를 위한 인터페이스들
interface TranslatedSuggestion {
  id?: string;
  text?: string;
  name?: string;
  location?: string;
  translations?: Record<string, string>;
}

// UI 상태 관리를 위한 타입들
interface UIState {
  query: string;
  isFocused: boolean;
  activeRegion: string;
  isLoaded: boolean;
  mousePosition: { x: number; y: number };
  suggestions: TranslatedSuggestion[];
  isLoadingSuggestions: boolean;
  placeholderIndex: number;
  selectedSuggestionIndex: number;
}

type UIAction = 
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FOCUSED'; payload: boolean }
  | { type: 'SET_REGION'; payload: string }
  | { type: 'SET_LOADED'; payload: boolean }
  | { type: 'SET_MOUSE_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_SUGGESTIONS'; payload: TranslatedSuggestion[] }
  | { type: 'SET_LOADING_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_PLACEHOLDER_INDEX'; payload: number }
  | { type: 'SET_SELECTED_INDEX'; payload: number };

// 에러 바운더리 클래스 컴포넌트
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: (error: Error, reset: () => void) => ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('HomePage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, () => {
          this.setState({ hasError: false, error: null });
        });
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
              <p className="text-gray-600 mb-6">죄송합니다. 예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500 font-mono">{this.state.error.message}</p>
              </div>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full bg-black text-white py-3 px-6 rounded-2xl font-medium hover:bg-gray-800 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 검색 제안 인터페이스 (기존 정의와 통합)
// interface TranslatedSuggestion는 위에서 이미 정의됨

// 타입 가드 함수들
const isValidSuggestionsArray = (data: any): data is TranslatedSuggestion[] => {
  return Array.isArray(data) && 
         data.length > 0 &&
         data.every(item => 
           typeof item === 'object' && 
           item !== null &&
           ((typeof item.id === 'string' && typeof item.text === 'string') ||
            (typeof item.name === 'string' && typeof item.location === 'string'))
         );
};

function HomeClient() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  // 단어 회전 상태 (useReducer와 별도 관리)
  const [currentWord, setCurrentWord] = useState(0);
  
  // 통합된 상태 관리 (성능 최적화)
  const [uiState, setUIState] = useReducer((state: UIState, action: UIAction) => {
    switch (action.type) {
      case 'SET_QUERY':
        return { ...state, query: action.payload };
      case 'SET_FOCUSED':
        return { ...state, isFocused: action.payload };
      case 'SET_REGION':
        return { ...state, activeRegion: action.payload };
      case 'SET_LOADED':
        return { ...state, isLoaded: action.payload };
      case 'SET_MOUSE_POSITION':
        return { ...state, mousePosition: action.payload };
      case 'SET_SUGGESTIONS':
        return { ...state, suggestions: action.payload, isLoadingSuggestions: false };
      case 'SET_LOADING_SUGGESTIONS':
        return { ...state, isLoadingSuggestions: action.payload };
      case 'SET_PLACEHOLDER_INDEX':
        return { ...state, placeholderIndex: action.payload };
      case 'SET_SELECTED_INDEX':
        return { ...state, selectedSuggestionIndex: action.payload };
      default:
        return state;
    }
  }, {
    query: '',
    isFocused: false,
    activeRegion: 'korea',
    isLoaded: false,
    mousePosition: { x: 0, y: 0 },
    suggestions: [],
    isLoadingSuggestions: false,
    placeholderIndex: 0,
    selectedSuggestionIndex: -1
  });
  
  // API 요청 관리
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 컴포넌트 마운트 상태
  const isMountedRef = useRef(true);
  
  // 상태에서 값 추출 (리듀서 사용으로 인한 수정)
  const { query, isFocused, activeRegion, isLoaded, mousePosition, suggestions, isLoadingSuggestions, placeholderIndex, selectedSuggestionIndex } = uiState;
  
  // 성능 최적화: 지역별 인기 국가 데이터 (정적 데이터 + 번역 병합)
  const regionCountries = useMemo(() => {
    const countries = t('home.countries') as any;
    
    return {
      korea: mergeTranslatedCountries(countries, 'korea'),
      europe: mergeTranslatedCountries(countries, 'europe'),
      asia: mergeTranslatedCountries(countries, 'asia'),
      americas: mergeTranslatedCountries(countries, 'americas')
    };
  }, [t]);

  // 회전하는 단어들 (audioguide 맞춤)
  const words = useMemo(() => [
    t('home.features.personalGuide') || '개인가이드',
    t('home.features.audioCommentary') || '오디오해설',
    t('home.features.tourDocent') || '투어도슨트',
    t('home.features.selfTour') || '셀프투어'
  ], [t]);

  // 회전하는 플레이스홀더 (다국어 지원)
  const placeholders = useMemo(() => {
    const translated = t('home.searchPlaceholders');
    
    return Array.isArray(translated) ? translated : [
      '에펠탑',
      '타지마할',
      '마추픽추',
      '콜로세움',
      '자유의 여신상'
    ];
  }, [t]);

  // 언어 변경 시 인덱스 리셋
  useEffect(() => {
    setUIState({ type: 'SET_PLACEHOLDER_INDEX', payload: 0 });
    setCurrentWord(0);
  }, [currentLanguage]);

  useEffect(() => {
    setUIState({ type: 'SET_LOADED', payload: true });
    
    // 단어 회전
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    // 플레이스홀더 회전  
    const placeholderInterval = setInterval(() => {
      setUIState({ type: 'SET_PLACEHOLDER_INDEX', payload: (placeholderIndex + 1) % placeholders.length });
    }, 3000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(placeholderInterval);
    };
  }, [currentLanguage, words.length, placeholders.length, placeholderIndex]);

  // 마우스 이벤트 최적화 - throttling 적용
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (timeoutId) return; // throttling
      
      timeoutId = setTimeout(() => {
        setUIState({ type: 'SET_MOUSE_POSITION', payload: { x: e.clientX, y: e.clientY } });
        timeoutId = null as any;
      }, 100); // 100ms throttling
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 자동완성 API 호출 (메모리 안전, API 중복 방지)
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      const translated = t('home.defaultSuggestions');
      // defaultSuggestions는 객체 배열이어야 하므로 타입 체크
      if (isValidSuggestionsArray(translated)) {
        if (isMountedRef.current) setUIState({ type: 'SET_SUGGESTIONS', payload: translated });
      } else {
        if (isMountedRef.current) {
          const defaultSuggestions = t('home.defaultSuggestions');
          if (isValidSuggestionsArray(defaultSuggestions)) {
            setUIState({ type: 'SET_SUGGESTIONS', payload: defaultSuggestions });
          } else {
            // 번역이 없을 경우 기본값
            const fallbackSuggestions: TranslatedSuggestion[] = [
              { id: "eiffel", text: "에펠탑" },
              { id: "taj", text: "타지마할" },
              { id: "machu", text: "마추픽추" }
            ];
            setUIState({ type: "SET_SUGGESTIONS", payload: fallbackSuggestions });
          }
        }
      }
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (isMountedRef.current) setUIState({ type: 'SET_LOADING_SUGGESTIONS', payload: true });
    
    try {
      const response = await fetch(
        `/api/locations/search/?q=${encodeURIComponent(searchQuery)}&lang=${currentLanguage}`,
        { 
          signal: abortControllerRef.current.signal,
          cache: 'no-cache'
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 컴포넌트가 마운트되어 있을 때만 상태 업데이트
      if (!isMountedRef.current) return;
      
      if (data.success && isValidSuggestionsArray(data.data)) {
        if (isMountedRef.current) {
          setUIState({ type: 'SET_SUGGESTIONS', payload: data.data.slice(0, 5) }); // 최대 5개 제안
          setUIState({ type: 'SET_SELECTED_INDEX', payload: -1 }); // 새로운 제안이 오면 선택 초기화
        }
      } else {
        if (isMountedRef.current) {
          setUIState({ type: 'SET_SUGGESTIONS', payload: [] });
          setUIState({ type: 'SET_SELECTED_INDEX', payload: -1 });
        }
      }
    } catch (error) {
      // AbortError는 의도적인 취소이므로 무시
      if (error instanceof Error && error.name === 'AbortError') return;
      
      console.error('Suggestions fetch error:', error);
      if (isMountedRef.current) {
        setUIState({ type: 'SET_SUGGESTIONS', payload: [] });
      }
    } finally {
      if (isMountedRef.current) {
        setUIState({ type: 'SET_LOADING_SUGGESTIONS', payload: false });
      }
    }
  }, [currentLanguage, t]);

  // 디바운싱된 자동완성 검색
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // 디바운스 타이머 정리
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // 300ms 후에 API 호출
    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim() && query.trim().length >= 1) {
        fetchSuggestions(query.trim());
      } else {
        // 검색어가 없으면 기본 제안 표시
        fetchSuggestions('');
      }
    }, 300);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, currentLanguage, fetchSuggestions]);

  // 컴포넌트 언마운트 시 정리 작업
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 표시
      isMountedRef.current = false;
      
      // 진행 중인 API 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 검색 실행 (즉시 페이지 이동)
  const handleSearch = useCallback(() => {
    if (!query.trim() || !isMountedRef.current) return;
    
    // 즉시 페이지 이동 (로딩 없이)
    router.push(`/guide/${encodeURIComponent(query.trim())}`);
  }, [query, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setUIState({ 
          type: 'SET_SELECTED_INDEX', 
          payload: selectedSuggestionIndex < suggestions.length - 1 ? selectedSuggestionIndex + 1 : selectedSuggestionIndex
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setUIState({ type: 'SET_SELECTED_INDEX', payload: selectedSuggestionIndex > -1 ? selectedSuggestionIndex - 1 : -1 });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          const suggestionText = selectedSuggestion.text || selectedSuggestion.name || '';
          setUIState({ type: 'SET_QUERY', payload: suggestionText });
          setUIState({ type: 'SET_FOCUSED', payload: false });
          setUIState({ type: 'SET_SELECTED_INDEX', payload: -1 });
          
          // 자동완성에서 추출한 정확한 지역정보를 URL 파라미터로 전달
          const params = new URLSearchParams();
          if ((selectedSuggestion as any).region) params.set('region', (selectedSuggestion as any).region);
          if ((selectedSuggestion as any).country) params.set('country', (selectedSuggestion as any).country);
          if ((selectedSuggestion as any).countryCode) params.set('countryCode', (selectedSuggestion as any).countryCode);
          if ((selectedSuggestion as any).type) params.set('type', (selectedSuggestion as any).type);
          
          const queryString = params.toString();
          const url = `/guide/${encodeURIComponent(suggestionText)}${queryString ? `?${queryString}` : ''}`;
          
          router.push(url);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setUIState({ type: 'SET_FOCUSED', payload: false });
        setUIState({ type: 'SET_SELECTED_INDEX', payload: -1 });
        break;
    }
  };

  // AI 가이드 생성 (즉시 페이지 이동)
  const handleAIGeneration = () => {
    if (!query.trim()) {
      alert(t('home.alerts.enterLocation'));
      return;
    }

    // 즉시 페이지 이동 (가이드 페이지에서 AI 생성 처리)
    router.push(`/guide/${encodeURIComponent(query.trim())}`);
  };

  // 인기 명소 가이드 생성 (즉시 페이지 이동)
  const handleAttractionGuide = (attraction: string) => {
    // 즉시 페이지 이동 (가이드 페이지에서 AI 생성 처리)
    router.push(`/guide/${encodeURIComponent(attraction)}`);
  };

  // 오디오 재생 (즉시 페이지 이동)
  const handleAudioPlayback = useCallback(() => {
    if (!query.trim() || !isMountedRef.current) {
      alert(t('home.alerts.enterLocation'));
      return;
    }

    // 즉시 투어 페이지로 이동
    router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
  }, [query, router, t]);

  return (
    <>
      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute w-96 h-96 border border-black/5 rounded-full transition-transform duration-1000 z-0"
            style={{
              top: '10%',
              right: '10%',
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
            }}
          />
          
          <div 
            className="absolute w-20 h-px bg-black opacity-15 transition-transform duration-700 z-0"
            style={{
              top: '35%',
              left: '8%',
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * 0.01}px)`
            }}
          />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pb-4">
          
          {/* Hero Typography */}
          <div className={`
            pb-4 px-4 transform transition-all duration-1000
            ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            {/* Main Title with SEO-optimized H1 */}
            <h1 className="text-2xl md:text-3xl font-thin tracking-[-0.02em] text-black mb-4">
              <div>
                {/* 상단: 도슨트투어 (왼쪽 정렬) */}
                <div className="mb-4 text-left">
                  <span className="block font-bold text-3xl md:text-5xl md:text-[1.5rem] lg:text-[2.5rem]">
                    {t('home.brandTitle') || '트립라디오.AI'}
                  </span>
                </div>
                
                {/* 하단 중앙: 회전하는 단어들 - SEO를 위해 고정 텍스트 추가 */}
                <div className="flex justify-center">
                  <div className="overflow-hidden" style={{ height: '48px', lineHeight: '48px' }}>
                    <span 
                      className="inline-block transition-transform duration-1000 ease-out font-bold text-3xl md:text-5xl md:text-[1.5rem] lg:text-[2.5rem]"
                      style={{
                        transform: `translateY(-${currentWord * 48}px)`
                      }}
                    >
                      {words.map((word, index) => (
                        <span key={index} className="block" style={{ height: '48px', lineHeight: '48px' }}>
                          {word}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                
                {/* SEO를 위한 숨겨진 완전한 제목 */}
                <span className="sr-only">AI 여행 도슨트</span>
              </div>
            </h1>

            {/* Decorative Element */}
            <div className="flex items-center justify-center gap-8 mb-6 relative z-0">
              <div className="w-12 h-px bg-black opacity-30"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-50"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-30"></div>
              <div className="w-1 h-1 bg-black rounded-full opacity-20"></div>
              <div className="w-12 h-px bg-black opacity-30"></div>
            </div>

            {/* Subtitle */}
            <div className="text-center space-y-1 mb-1">
              <p className="text-base text-gray-500 font-light tracking-wide">
                {t('home.subtitle')}
              </p>
              <p className="text-lg text-gray-700 font-light tracking-wide">
                {t('home.subtitle2')}
              </p>
              <p className="text-base text-black font-light tracking-wide">
                {t('home.description')}
              </p>
            </div>
          </div>

          {/* How to Use - 3 Steps */}
          <div className="relative z-10 py-4 mb-4">
            <div className="max-w-6xl mx-auto px-6">
              {/* 모든 화면에서 가로 배열 */}
              <div className="flex flex-row justify-center items-start gap-2 sm:gap-4 md:gap-8">
                
                {/* 장소 입력 */}
                <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center bg-black text-white mb-3 sm:mb-4 shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-h-16 sm:min-h-20 flex flex-col justify-start pt-2">
                    <div className="text-sm sm:text-lg lg:text-xl font-medium text-black mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{t('home.stepTitles.inputLocation')}</div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed">
                      {String(t('home.stepDescriptions.inputLocation')).split(' ').slice(0, 2).join(' ')}<br />
                      {String(t('home.stepDescriptions.inputLocation')).split(' ').slice(2).join(' ')}
                    </div>
                  </div>
                </div>

                {/* 화살표 1 */}
                <div className="flex items-center justify-center pt-6 sm:pt-8">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* AI 생성 */}
                <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                  <button 
                    onClick={handleAIGeneration}
                    disabled={!query.trim()}
                    className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      !query.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={String(t('home.stepTitles.aiGenerate'))}
                    aria-disabled={!query.trim()}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                  <div className="min-h-16 sm:min-h-20 flex flex-col justify-start pt-2">
                    <div className="text-sm sm:text-lg lg:text-xl font-medium text-black mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{t('home.stepTitles.aiGenerate')}</div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed">
                      {String(t('home.stepDescriptions.aiGenerate')).split(' ').slice(0, 1).join(' ')}<br />
                      {String(t('home.stepDescriptions.aiGenerate')).split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                </div>

                {/* 화살표 2 */}
                <div className="flex items-center justify-center pt-6 sm:pt-8">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 오디오 재생 */}
                <div className="text-center relative z-10 flex-1 max-w-32 sm:max-w-xs">
                  <button 
                    onClick={handleAudioPlayback}
                    disabled={!query.trim()}
                    className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      !query.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={String(t('home.stepTitles.audioPlay'))}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  <div className="min-h-16 sm:min-h-20 flex flex-col justify-start pt-2">
                    <div className="text-sm sm:text-lg lg:text-xl font-medium text-black mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{t('home.stepTitles.audioPlay')}</div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed">
                      {String(t('home.stepDescriptions.audioPlay')).split(' ').slice(0, 2).join(' ')}<br />
                      {String(t('home.stepDescriptions.audioPlay')).split(' ').slice(2).join(' ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div 
            className="relative z-[9998] w-full max-w-2xl mx-auto search-container"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={`
              relative transition-all duration-700 ease-out
              ${isFocused 
                ? 'scale-105 translate-y-[-8px]' 
                : 'scale-100 translate-y-0'
              }
            `}>
              <div className={`
                relative bg-white rounded-3xl transition-all duration-500
                ${isFocused 
                  ? 'shadow-2xl shadow-black/15 ring-1 ring-black/5' 
                  : 'shadow-xl shadow-black/10'
                }
              `}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setUIState({ type: 'SET_QUERY', payload: e.target.value });
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setUIState({ type: 'SET_FOCUSED', payload: true });
                  }}
                  onBlur={(e) => {
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || !relatedTarget.closest('.suggestions-container')) {
                      setUIState({ type: 'SET_FOCUSED', payload: false });
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  placeholder={placeholders[placeholderIndex]}
                  className="w-full px-8 py-6 text-xl font-light text-black bg-transparent rounded-3xl focus:outline-none transition-all duration-300 placeholder-gray-400 focus:ring-2 focus:ring-black focus:ring-opacity-20"
                  aria-label={String(t('home.searchPlaceholder'))}
                  aria-describedby="search-help"
                  aria-expanded={isFocused && suggestions.length > 0}
                  aria-autocomplete="list"
                  aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
                  aria-controls={isFocused && suggestions.length > 0 ? "suggestions-listbox" : undefined}
                  role="combobox"
                />
                
                <button
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className={`
                    absolute right-4 top-1/2 transform -translate-y-1/2
                    w-14 h-14 rounded-2xl transition-all duration-300
                    flex items-center justify-center group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                    ${query.trim()
                      ? 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                      : 'bg-black text-white shadow-lg opacity-50 cursor-not-allowed'
                    }
                  `}
                  aria-label={String(t('home.searchButton'))}
                  type="submit"
                >
                  <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* 검색 도움말 */}
              <div id="search-help" className="sr-only">
                검색어를 입력하고 Enter키를 누르거나 제안 목록에서 선택하세요. 화살표 키로 제안을 탐색할 수 있습니다.
              </div>

              {/* Suggestions Dropdown */}
              {isFocused && query.length > 0 && (
                <div 
                  className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-[9999] autocomplete-dropdown suggestions-container"
                  role="listbox"
                  id="suggestions-listbox"
                  aria-label="검색 제안 목록"
                >
                  {isLoadingSuggestions ? (
                    <div className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-500">검색 중...</span>
                      </div>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        id={`suggestion-${index}`}
                        onClick={() => {
                          const selectedLocation = suggestion.text || suggestion.name || '';
                          setUIState({ type: 'SET_QUERY', payload: selectedLocation });
                          setUIState({ type: 'SET_FOCUSED', payload: false });
                          setUIState({ type: 'SET_SELECTED_INDEX', payload: -1 });
                          
                          // 자동완성에서 추출한 정확한 지역정보를 URL 파라미터로 전달
                          const params = new URLSearchParams();
                          if ((suggestion as any).region) params.set('region', (suggestion as any).region);
                          if ((suggestion as any).country) params.set('country', (suggestion as any).country);
                          if ((suggestion as any).countryCode) params.set('countryCode', (suggestion as any).countryCode);
                          if ((suggestion as any).type) params.set('type', (suggestion as any).type);
                          
                          const queryString = params.toString();
                          const url = `/guide/${encodeURIComponent(selectedLocation)}${queryString ? `?${queryString}` : ''}`;
                          
                          router.push(url);
                        }}
                        onMouseEnter={() => setUIState({ type: 'SET_SELECTED_INDEX', payload: index })}
                        onMouseLeave={() => setUIState({ type: 'SET_SELECTED_INDEX', payload: -1 })}
                        className={`w-full px-6 py-4 text-left transition-all duration-200 group suggestion-item focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black ${
                          selectedSuggestionIndex === index 
                            ? 'bg-blue-50 ring-2 ring-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        role="option"
                        aria-selected={selectedSuggestionIndex === index}
                        aria-label={`${suggestion.name}, ${suggestion.location}로 이동`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-black">
                              {suggestion.name}
                            </div>
                            {suggestion.location && (
                              <div className="text-sm text-gray-500 mt-1">
                                {suggestion.location}
                              </div>
                            )}
                          </div>
                          <div className="opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-center text-sm text-gray-500">
                      {t('search.noResults')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 광고 배치 1: 검색박스 하단 */}
          <div className="max-w-4xl mx-auto px-6 py-4">
            <OptimalAdSense 
              placement="homepage-hero" 
              className="text-center"
            />
          </div>
        </section>

        {/* Regional Countries Section */}
        <section className="relative z-10 py-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* 섹션 제목 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('home.regionTitles.popularCountries')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('home.regionDescription')}
              </p>
            </div>
            
            {/* 지역별 탭 */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  {[
                    { id: 'korea', label: t('home.regionTitles.korea') },
                    { id: 'europe', label: t('home.regionTitles.europe') },
                    { id: 'asia', label: t('home.regionTitles.asia') },
                    { id: 'americas', label: t('home.regionTitles.americas') }
                  ].map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setUIState({ type: 'SET_REGION', payload: region.id })}
                      className={`
                        px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                        ${activeRegion === region.id
                          ? 'bg-black text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                      role="tab"
                      aria-selected={activeRegion === region.id}
                      aria-controls={`${region.id}-panel`}
                      tabIndex={activeRegion === region.id ? 0 : -1}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 국가 카드 슬라이드 */}
            <div 
              className="overflow-x-auto pb-4"
              role="tabpanel"
              id={`${activeRegion}-panel`}
              aria-labelledby={`${activeRegion}-tab`}
            >
              <div className="flex space-x-6 min-w-max px-2">
                {regionCountries[activeRegion as keyof typeof regionCountries].map((country, index) => (
                  <div
                    key={country.id}
                    className="flex-shrink-0 w-64 group"
                  >
                    {/* 메인 카드 */}
                    <div className="relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 overflow-hidden group-hover:scale-[1.02]">
                      
                      {/* 상단 헤더 */}
                      <div className="relative h-20 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full transform translate-x-8 -translate-y-8"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full transform -translate-x-4 translate-y-4"></div>
                        
                        {/* 국가명 */}
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <h3 className="font-light text-lg tracking-wider">
                            {country.name}
                          </h3>
                        </div>

                        {/* 인기 배지 */}
                        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                          <span className="text-xs text-white font-light tracking-wide">{t('home.popularBadge')}</span>
                        </div>
                      </div>

                      {/* 카드 콘텐츠 */}
                      <div className="p-6">
                        {/* 설명 */}
                        <p className="text-sm text-gray-600 mb-5 leading-relaxed font-light">
                          {country.description}
                        </p>

                        {/* 인기 관광지 */}
                        <div className="space-y-3 mb-5">
                          <h4 className="text-xs font-medium text-gray-900 uppercase tracking-[0.1em] letter-spacing-wider">
                            {t('home.countryAttraction')}
                          </h4>
                          {country.attractions.slice(0, 3).map((attraction, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAttractionGuide(attraction);
                              }}
                              className="flex items-center text-sm text-gray-700 hover:text-black transition-colors w-full text-left py-1 px-2 -mx-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
                              aria-label={`${attraction} 가이드 생성하기`}
                            >
                              <div className="w-1 h-1 bg-black rounded-full mr-4 group-hover:scale-125 transition-transform duration-300"></div>
                              <span className="font-light tracking-wide underline-offset-2 hover:underline">{attraction}</span>
                            </button>
                          ))}
                        </div>

                        {/* 정보 표시 영역 */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-end">
                            <div className="flex items-center text-sm font-light text-gray-600">
                              <span className="tracking-wide">{t('home.clickAttraction')}</span>
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 21.017l-.073-.046a.5.5 0 01-.179-.704l5.93-8.395-5.93-8.395a.5.5 0 01.179-.704l.073-.046 1.358-.655a.5.5 0 01.721.273l6.5 11.5a.5.5 0 010 .454l-6.5 11.5a.5.5 0 01-.721.273z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 모바일 스크롤 힌트 */}
            <div className="flex justify-center mt-8 md:hidden">
              <div className="flex items-center text-xs text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4-4m-4 4v12" />
                </svg>
                <span className="font-medium">{t('home.scrollHint')}</span>
              </div>
            </div>

            {/* 광고 배치 2: 지역별 국가 섹션 하단 */}
            <div className="max-w-4xl mx-auto px-6 py-4">
              <OptimalAdSense 
                placement="homepage-countries" 
                className="text-center"
              />
            </div>
          </div>
        </section>

      </main>

      {/* Footer with Legal Links */}
      <footer className="relative z-10 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Service Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('footer.companyName')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('footer.companyDescription')}
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{t('footer.copyright')}</span>
              </div>
            </div>

            {/* Legal Pages */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.legalInfo')}</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/legal/privacy" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('footer.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/terms" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('footer.termsOfService')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/about" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('footer.aboutUs')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/contact" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('footer.contact')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://t.me/naviguideai" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {t('footer.telegramChannel')}
                  </a>
                </li>
                <li>
                  <span className="text-sm text-gray-600">
                    {t('footer.supportHours')}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* AdSense Compliance Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {t('footer.adsenseNotice')} 
              <a href="/legal/privacy" className="underline hover:text-gray-700 ml-1">
                {t('footer.privacyPolicy')}
              </a>{t('footer.adsensePolicy')}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

// ErrorBoundary로 감싸진 메인 컴포넌트
export default function HomeClientWithBoundary() {
  return (
    <ErrorBoundary>
      <HomeClient />
    </ErrorBoundary>
  );
}