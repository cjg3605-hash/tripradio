'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Component, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

import StructuredData from '@/components/seo/StructuredData';
import GuideLoading from '@/components/ui/GuideLoading';
import OptimalAdSense from '@/components/ads/OptimalAdSense';
import FAQSchema, { getDefaultFAQs } from '@/components/seo/FAQSchema';
import BreadcrumbSchema, { generateHomeBreadcrumb } from '@/components/seo/BreadcrumbSchema';

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

// 검색 제안 인터페이스
interface Suggestion {
  id?: string;
  name: string;
  location: string;
}

// 번역된 제안 타입 가드
interface TranslatedSuggestion {
  name: string;
  location: string;
}

// 타입 가드 함수들
const isValidSuggestionsArray = (data: any): data is TranslatedSuggestion[] => {
  return Array.isArray(data) && 
         data.length > 0 &&
         data.every(item => 
           typeof item === 'object' && 
           item !== null &&
           typeof item.name === 'string' && 
           typeof item.location === 'string'
         );
};

const isValidCountriesData = (data: any): boolean => {
  return data && typeof data === 'object' && !Array.isArray(data);
};

function Home() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  // 상태 관리
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<TranslatedSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // 기능 상태 (분리된 로딩 상태)
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    guide: false,
    tour: false,
    country: false
  });
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  // 개별 로딩 상태 헬퍼 함수
  const setLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    if (!isMountedRef.current) return;
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // 전체 로딩 상태 확인
  const isAnyLoading = useMemo(() => 
    Object.values(loadingStates).some(loading => loading), 
    [loadingStates]
  );
  
  // 지역별 탭 상태
  const [activeRegion, setActiveRegion] = useState('korea');
  
  // API 요청 관리
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 컴포넌트 마운트 상태
  const isMountedRef = useRef(true);
  
  // 간격 참조
  const intervalRefs = useRef<{
    word: NodeJS.Timeout | null;
    placeholder: NodeJS.Timeout | null;
  }>({
    word: null,
    placeholder: null
  });
  
  // 지역별 인기 국가 데이터 (번역키 사용)
  const regionCountries = useMemo(() => {
    const countries = t('home.countries') as any;
    
    // 번역 데이터 유효성 검증
    if (!isValidCountriesData(countries)) {
      return {
        korea: [],
        europe: [],
        asia: [],
        americas: []
      };
    }
    
    return {
      korea: [
        { 
          id: 'seoul', 
          name: countries.seoul?.name || '서울', 
          flag: '🏙️', 
          attractions: countries.seoul?.attractions || ['경복궁', '남산타워', '명동'],
          description: countries.seoul?.description || '전통과 현대가 어우러진 대한민국의 수도'
        },
        { 
          id: 'busan', 
          name: countries.busan?.name || '부산', 
          flag: '🌊', 
          attractions: countries.busan?.attractions || ['해운대해수욕장', '감천문화마을', '자갈치시장'],
          description: countries.busan?.description || '아름다운 바다와 항구의 도시'
        },
        { 
          id: 'jeju', 
          name: countries.jeju?.name || '제주', 
          flag: '🌺', 
          attractions: countries.jeju?.attractions || ['한라산', '성산일출봉', '중문관광단지'],
          description: countries.jeju?.description || '환상적인 자연경관의 섬'
        },
        { 
          id: 'gyeongju', 
          name: countries.gyeongju?.name || '경주', 
          flag: '🏛️', 
          attractions: countries.gyeongju?.attractions || ['불국사', '석굴암', '첨성대'],
          description: countries.gyeongju?.description || '천년고도 신라의 역사가 살아있는 도시'
        }
      ],
      europe: [
        { 
          id: 'france', 
          name: countries.france?.name || 'France', 
          flag: '🇫🇷', 
          attractions: countries.france?.attractions || ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles'],
          description: countries.france?.description || 'Romantic Paris and magnificent cultural heritage'
        },
        { 
          id: 'italy', 
          name: countries.italy?.name || 'Italy', 
          flag: '🇮🇹', 
          attractions: countries.italy?.attractions || ['Colosseum', 'Leaning Tower of Pisa', 'Vatican'],
          description: countries.italy?.description || 'Glory of ancient Rome and Renaissance art'
        },
        { 
          id: 'spain', 
          name: countries.spain?.name || 'Spain', 
          flag: '🇪🇸', 
          attractions: countries.spain?.attractions || ['Sagrada Familia', 'Alhambra', 'Park Güell'],
          description: countries.spain?.description || 'Gaudí\'s architecture and flamenco passion'
        },
        { 
          id: 'uk', 
          name: countries.uk?.name || 'United Kingdom', 
          flag: '🇬🇧', 
          attractions: countries.uk?.attractions || ['Big Ben', 'Tower Bridge', 'Buckingham Palace'],
          description: countries.uk?.description || 'Harmonious blend of tradition and modernity'
        },
        { 
          id: 'germany', 
          name: countries.germany?.name || 'Germany', 
          flag: '🇩🇪', 
          attractions: countries.germany?.attractions || ['Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral'],
          description: countries.germany?.description || 'Fairy-tale castles and deep historical heritage'
        }
      ],
      asia: [
        { 
          id: 'japan', 
          name: countries.japan?.name || 'Japan', 
          flag: '🇯🇵', 
          attractions: countries.japan?.attractions || ['Mount Fuji', 'Kiyomizu-dera', 'Senso-ji'],
          description: countries.japan?.description || 'Mysterious land where tradition and cutting-edge coexist'
        },
        { 
          id: 'china', 
          name: countries.china?.name || 'China', 
          flag: '🇨🇳', 
          attractions: countries.china?.attractions || ['Great Wall', 'Forbidden City', 'Tiananmen Square'],
          description: countries.china?.description || 'Great civilization with 5000 years of history'
        },
        { 
          id: 'india', 
          name: countries.india?.name || 'India', 
          flag: '🇮🇳', 
          attractions: countries.india?.attractions || ['Taj Mahal', 'Red Fort', 'Ganges River'],
          description: countries.india?.description || 'Mystical spirituality and magnificent palaces'
        },
        { 
          id: 'thailand', 
          name: countries.thailand?.name || 'Thailand', 
          flag: '🇹🇭', 
          attractions: countries.thailand?.attractions || ['Wat Arun', 'Grand Palace', 'Wat Pho'],
          description: countries.thailand?.description || 'Golden temples and the land of smiles'
        },
        { 
          id: 'singapore', 
          name: countries.singapore?.name || 'Singapore', 
          flag: '🇸🇬', 
          attractions: countries.singapore?.attractions || ['Marina Bay Sands', 'Gardens by the Bay', 'Merlion'],
          description: countries.singapore?.description || 'Future city meets diverse cultures'
        }
      ],
      americas: [
        { 
          id: 'usa', 
          name: countries.usa?.name || 'United States', 
          flag: '🇺🇸', 
          attractions: countries.usa?.attractions || ['Statue of Liberty', 'Grand Canyon', 'Times Square'],
          description: countries.usa?.description || 'Land of freedom and dreams, infinite possibilities'
        },
        { 
          id: 'canada', 
          name: countries.canada?.name || 'Canada', 
          flag: '🇨🇦', 
          attractions: countries.canada?.attractions || ['Niagara Falls', 'CN Tower', 'Banff National Park'],
          description: countries.canada?.description || 'Vast nature and clean cities'
        },
        { 
          id: 'brazil', 
          name: countries.brazil?.name || 'Brazil', 
          flag: '🇧🇷', 
          attractions: countries.brazil?.attractions || ['Christ the Redeemer', 'Iguazu Falls', 'Maracanã Stadium'],
          description: countries.brazil?.description || 'Samba and football, passionate South America'
        },
        { 
          id: 'peru', 
          name: countries.peru?.name || 'Peru', 
          flag: '🇵🇪', 
          attractions: countries.peru?.attractions || ['Machu Picchu', 'Cusco', 'Nazca Lines'],
          description: countries.peru?.description || 'Mysterious ruins of Inca civilization'
        },
        { 
          id: 'mexico', 
          name: countries.mexico?.name || 'Mexico', 
          flag: '🇲🇽', 
          attractions: countries.mexico?.attractions || ['Chichen Itza', 'Teotihuacan', 'Cancun'],
          description: countries.mexico?.description || 'Mayan civilization and Caribbean paradise'
        }
      ]
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
    setPlaceholderIndex(0);
    setCurrentWord(0);
  }, [currentLanguage]);

  useEffect(() => {
    setIsLoaded(true);
    
    // 단어 회전
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);

    // 플레이스홀더 회전
    const placeholderInterval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(placeholderInterval);
    };
  }, [currentLanguage, words.length, placeholders.length]); // currentLanguage 의존성 추가

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 자동완성 API 호출 (메모리 안전, API 중복 방지)
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      const translated = t('home.defaultSuggestions');
      // defaultSuggestions는 객체 배열이어야 하므로 타입 체크
      if (isValidSuggestionsArray(translated)) {
        if (isMountedRef.current) setSuggestions(translated);
      } else {
        if (isMountedRef.current) {
          const defaultSuggestions = t('home.defaultSuggestions');
          if (isValidSuggestionsArray(defaultSuggestions)) {
            setSuggestions(defaultSuggestions);
          } else {
            // 번역이 없을 경우 기본값
            setSuggestions([
              { name: '에펠탑', location: '프랑스 파리' },
              { name: '타지마할', location: '인도 아그라' },
              { name: '마추픽추', location: '페루 쿠스코' }
            ]);
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

    if (isMountedRef.current) setIsLoadingSuggestions(true);
    
    try {
      const response = await fetch(
        `/api/locations/search?q=${encodeURIComponent(searchQuery)}&lang=${currentLanguage}`,
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
          setSuggestions(data.data.slice(0, 5)); // 최대 5개 제안
          setSelectedSuggestionIndex(-1); // 새로운 제안이 오면 선택 초기화
        }
      } else {
        if (isMountedRef.current) {
          setSuggestions([]);
          setSelectedSuggestionIndex(-1);
        }
      }
    } catch (error) {
      // AbortError는 의도적인 취소이므로 무시
      if (error instanceof Error && error.name === 'AbortError') return;
      
      console.error('Suggestions fetch error:', error);
      if (isMountedRef.current) {
        if (isMountedRef.current) setSuggestions([]);
      }
    } finally {
      if (isMountedRef.current) {
        if (isMountedRef.current) setIsLoadingSuggestions(false);
      }
    }
  }, [currentLanguage, t]);


  // 디바운스된 검색 함수 (메모리 안전)
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (query.trim() && isFocused && isMountedRef.current) {
        fetchSuggestions(query.trim());
      }
    }, 200); // 200ms 디바운스 (최적화)

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, currentLanguage, isFocused, fetchSuggestions, isMountedRef]);

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

  // 검색 실행 (메모리 안전, 분리된 로딩 상태)
  const handleSearch = useCallback(async () => {
    if (!query.trim() || !isMountedRef.current) return;
    
    setLoadingState('search', true);
    try {
      router.push(`/guide/${encodeURIComponent(query.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      if (isMountedRef.current) {
        setLoadingState('search', false);
      }
    }
  }, [query, router, setLoadingState]);

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
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          setQuery(selectedSuggestion.name);
          setIsFocused(false);
          setSelectedSuggestionIndex(-1);
          router.push(`/guide/${encodeURIComponent(selectedSuggestion.name)}`);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };



  // AI 가이드 생성
  const handleAIGeneration = async () => {
    if (!query.trim()) {
      alert(t('home.alerts.enterLocation'));
      return;
    }

    setLoadingState('guide', true);
    try {
      console.log('🚀 AI 가이드 생성 요청 시작:', {
        url: '/api/ai/generate-guide-with-gemini',
        method: 'POST',
        location: query.trim(),
        language: currentLanguage,
        library: 'Gemini 완전 라이브러리'
      });

      // 완전한 Gemini 라이브러리 사용으로 변경
      const response = await fetch('/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          location: query.trim(),
          userProfile: {
            language: currentLanguage,
            interests: ['문화', '역사'],
            knowledgeLevel: '중급',
            ageGroup: '30대',
            preferredStyle: '친근함',
            tourDuration: 90,
            companions: 'solo'
          }
        }),
      });

      console.log('📡 응답 수신:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 가이드 생성 성공:', data);
        router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        console.error('❌ 가이드 생성 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        alert(errorData.error || `${t('home.alerts.generationFailed')} (${response.status})`);
      }
    } catch (error) {
      console.error('❌ AI 생성 오류:', error);
      alert(t('home.alerts.networkError'));
    } finally {
      setLoadingState('guide', false);
    }
  };

  // 오디오 재생 (지연 제거, 분리된 로딩 상태)
  const handleAudioPlayback = useCallback(() => {
    if (!query.trim() || !isMountedRef.current) {
      alert(t('home.alerts.enterLocation'));
      return;
    }

    if (isMountedRef.current) setAudioPlaying(!audioPlaying);
    setLoadingState('tour', true);
    router.push(`/guide/${encodeURIComponent(query.trim())}/tour`);
  }, [query, audioPlaying, router, t, setLoadingState]);


  // 가이드 생성 중일 때 모노크롬 로딩 화면 표시
  if (isAnyLoading) {
    const currentLoadingType = Object.entries(loadingStates).find(([_, loading]) => loading)?.[0] || 'search';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GuideLoading 
          type="generating"
          message={`"${query}" 가이드 생성 중...`}
          subMessage="AI가 맞춤형 가이드를 만들고 있어요"
          showProgress={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* SEO Structured Data */}
      <StructuredData type="WebSite" />
      <StructuredData type="TravelAgency" />
      <StructuredData type="SoftwareApplication" />
      <FAQSchema faqs={getDefaultFAQs(currentLanguage as 'ko' | 'en' | 'ja' | 'zh' | 'es')} language={currentLanguage as 'ko' | 'en' | 'ja' | 'zh' | 'es'} />
      <BreadcrumbSchema items={generateHomeBreadcrumb()} />



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
        <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-4">
          
          {/* Hero Typography */}
          <div className={`
            pb-4 px-4 transform transition-all duration-1000
            ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl font-thin tracking-[-0.02em] text-black mb-4">
              <div>
                {/* 상단: 내손안의 (왼쪽 정렬) */}
                <div className="mb-4 text-left">
                  <span className="block font-bold text-3xl md:text-5xl md:text-[1.5rem] lg:text-[2.5rem]">
                    {t('home.brandTitle') || '내 손안의'}
                  </span>
                </div>
                
                {/* 하단 중앙: 회전하는 단어들 */}
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

          {/* How to Use - 3 Steps - 깔끔한 디자인 */}
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
                    <div className="text-sm sm:text-lg lg:text-xl font-medium text-black mb-2">{t('home.stepTitles.inputLocation')}</div>
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
                    disabled={!query.trim() || loadingStates.search}
                    className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-3 sm:mb-4 bg-black text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      loadingStates.search ? 'animate-pulse' : ''
                    } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                    aria-label={loadingStates.guide ? 'AI 가이드 생성 중...' : String(t('home.stepTitles.aiGenerate'))}
                    aria-disabled={!query.trim() || loadingStates.search}
                  >
                    {loadingStates.guide ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="min-h-16 sm:min-h-20 flex flex-col justify-start pt-2">
                    <div className="text-sm sm:text-lg lg:text-xl font-medium text-black mb-2">{t('home.stepTitles.aiGenerate')}</div>
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
                      audioPlaying ? 'animate-pulse' : ''
                    } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                    aria-label={audioPlaying ? '오디오 일시정지' : String(t('home.stepTitles.audioPlay'))}
                    aria-pressed={audioPlaying}
                  >
                    {audioPlaying ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  <div className="min-h-16 sm:min-h-20 flex flex-col justify-start pt-2">
                    <div className="text-sm sm:text-lg lg:text-xl font-medium text-black mb-2">{t('home.stepTitles.audioPlay')}</div>
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
          <div className="relative z-[9998] w-full max-w-2xl mx-auto">
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
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={(e) => {
                    // 클릭이 제안 목록 내부에서 일어나는지 확인
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || !relatedTarget.closest('.suggestions-container')) {
                      setIsFocused(false);
                    }
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
                  disabled={!query.trim() || loadingStates.search}
                  className={`
                    absolute right-4 top-1/2 transform -translate-y-1/2
                    w-14 h-14 rounded-2xl transition-all duration-300
                    flex items-center justify-center group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                    ${query.trim() && !loadingStates.search
                      ? 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                      : 'bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 opacity-50 cursor-not-allowed'
                    }
                  `}
                  aria-label={loadingStates.search ? '검색 중...' : String(t('home.searchButton'))}
                  type="submit"
                >
                  {loadingStates.search ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 검색 도움말 (화면 판독기용) */}
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
                          const selectedLocation = suggestion.name;
                          setQuery(selectedLocation);
                          setIsFocused(false);
                          setSelectedSuggestionIndex(-1);
                          router.push(`/guide/${encodeURIComponent(selectedLocation)}`);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        onMouseLeave={() => setSelectedSuggestionIndex(-1)}
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

          {/* 전략적 광고 배치 1: 검색박스 하단 */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <OptimalAdSense 
              placement="homepage-hero" 
              className="text-center"
            />
          </div>
        </section>

        {/* Regional Countries Section */}
        <section className="relative z-10 py-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* 섹션 제목 */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('home.regionTitles.popularCountries')}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('home.regionDescription')}
              </p>
            </div>
            
            {/* 지역별 탭 */}
            <div className="flex justify-center mb-8">
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
                      onClick={() => setActiveRegion(region.id)}
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

            {/* 국가 카드 슬라이드 - 인기여행지 스타일 */}
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
                    {/* 메인 카드 - 모던 모노크롬 스타일 */}
                    <div className="relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 overflow-hidden group-hover:scale-[1.02]">
                      
                      {/* 상단 모노크롬 헤더 */}
                      <div className="relative h-32 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                        {/* 미니멀 패턴 */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full transform translate-x-8 -translate-y-8"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/3 rounded-full transform -translate-x-4 translate-y-4"></div>
                        
                        {/* 국기와 국가명 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                            {country.flag}
                          </div>
                          <h3 className="font-light text-lg tracking-wider">
                            {country.name}
                          </h3>
                        </div>

                        {/* 인기 배지 - 모노크롬 */}
                        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                          <span className="text-xs text-white font-light tracking-wide">{t('home.popularBadge')}</span>
                        </div>
                      </div>

                      {/* 카드 콘텐츠 - 모노크롬 스타일 */}
                      <div className="p-6">
                        {/* 설명 */}
                        <p className="text-sm text-gray-600 mb-5 leading-relaxed font-light">
                          {country.description}
                        </p>

                        {/* 인기 관광지 - 클릭 가능한 버튼들 */}
                        <div className="space-y-3 mb-5">
                          <h4 className="text-xs font-medium text-gray-900 uppercase tracking-[0.1em] letter-spacing-wider">
                            {t('home.countryAttraction')}
                          </h4>
                          {country.attractions.slice(0, 3).map((attraction, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLoadingState('country', true);
                                router.push(`/guide/${encodeURIComponent(attraction)}?lang=${currentLanguage}`);
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

            {/* 전략적 광고 배치 2: 지역별 국가 섹션 하단 */}
            <div className="max-w-4xl mx-auto px-6 py-8">
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
    </div>
  );
}

// ErrorBoundary로 감싸진 메인 컴포넌트
export default function HomePage() {
  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  );
}