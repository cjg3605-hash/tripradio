'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Component, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

import StructuredData from '@/components/seo/StructuredData';
import GuideLoading from '@/components/ui/GuideLoading';
import OptimalAdSense from '@/components/ads/OptimalAdSense';
import FAQSchema, { getDefaultFAQs } from '@/components/seo/FAQSchema';
import BreadcrumbSchema, { generateHomeBreadcrumb } from '@/components/seo/BreadcrumbSchema';
import ErrorModal, { ErrorModalProps } from '@/components/errors/ErrorModal';

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
  console.log('🔬 타입 검증 시작 - 데이터:', data);
  
  const isArray = Array.isArray(data);
  console.log('🔬 Array 체크:', isArray);
  
  if (!isArray) return false;
  
  const hasLength = data.length > 0;
  console.log('🔬 길이 체크:', hasLength, '길이:', data.length);
  
  if (!hasLength) return false;
  
  const allValid = data.every((item, index) => {
    const isObject = typeof item === 'object' && item !== null;
    const hasName = typeof item.name === 'string';
    const hasLocation = typeof item.location === 'string';
    console.log(`🔬 항목 ${index}:`, { 
      isObject, 
      hasName, 
      hasLocation,
      itemKeys: item ? Object.keys(item) : 'null',
      nameValue: item?.name,
      locValue: item?.location
    });
    return isObject && hasName && hasLocation;
  });
  
  console.log('🔬 모든 항목 유효:', allValid);
  return allValid;
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
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TranslatedSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [currentLoadingQuery, setCurrentLoadingQuery] = useState('');
  
  // 🧠 메모리 캐시 (LRU 방식) - useRef로 변경하여 리렌더링 방지
  const suggestionCacheRef = useRef<Map<string, { 
    data: TranslatedSuggestion[], 
    timestamp: number 
  }>>(new Map());
  
  // fetchSuggestions 함수 안정성을 위한 ref
  const fetchSuggestionsRef = useRef<((query: string) => Promise<void>) | null>(null);
  
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
  
  // 에러 모달 상태
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    errorType?: 'network' | 'timeout' | 'server' | 'validation' | 'config' | 'unknown';
    details?: string;
    retryAction?: () => void;
  }>({
    isOpen: false,
    message: ''
  });

  // 에러 표시 헬퍼 함수
  const showError = useCallback((
    message: string,
    options?: {
      title?: string;
      errorType?: 'network' | 'timeout' | 'server' | 'validation' | 'config' | 'unknown';
      details?: string;
      retryAction?: () => void;
    }
  ) => {
    setErrorModal({
      isOpen: true,
      message,
      ...options
    });
  }, []);

  // 에러 모달 닫기
  const closeErrorModal = useCallback(() => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  }, []);
  
  // 간격 참조
  const intervalRefs = useRef<{
    word: NodeJS.Timeout | null;
  }>({
    word: null
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


  // 회전하는 세계명소들 (구체적 장소 검색 유도) - 7개 핵심 명소
  const landmarks = useMemo(() => [
    '에펠탑',
    '콜로세움', 
    '타지마할',
    '자유의 여신상',
    '경복궁',
    '마추픽추',
    '사그라다 파밀리아'
  ], []);

  // 명소별 배경 이미지 매핑 (개발환경 캐시 버스팅 포함)
  const landmarkImages = useMemo(() => {
    const isDev = process.env.NODE_ENV === 'development';
    // 캐시 버스팅을 위한 고정 타임스탬프 (컴포넌트 마운트 시점)
    const cacheBuster = isDev ? `?t=${1723122651000}` : ''; // 고정 타임스탬프 사용
    
    return {
      '에펠탑': `/images/landmarks/eiffel-tower.png`,
      '콜로세움': `/images/landmarks/colosseum.png`,
      '타지마할': `/images/landmarks/taj-mahal.png`,
      '자유의 여신상': `/images/landmarks/statue-of-liberty.png`,
      '경복궁': `/images/landmarks/gyeongbokgung.png`,
      '마추픽추': `/images/landmarks/machu-picchu.png`,
      '사그라다 파밀리아': `/images/landmarks/sagrada-familia.png`
    };
  }, []);

  const [currentLandmarkIndex, setCurrentLandmarkIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 언어 변경 시 인덱스 리셋
  useEffect(() => {
    setCurrentLandmarkIndex(0);
  }, [currentLanguage]);

  useEffect(() => {
    setIsLoaded(true);
    
    // 명소 회전 (천천히 - 6초)
    const landmarkInterval = setInterval(() => {
      setCurrentLandmarkIndex((prev) => (prev + 1) % landmarks.length);
    }, 6000);

    return () => {
      clearInterval(landmarkInterval);
    };
  }, [currentLanguage, landmarks.length]);

  // 이미지 프리로드 및 에러 처리
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = landmarks.map((landmark) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          
          const handleLoad = () => {
            console.log(`✅ 이미지 로드 성공: ${landmark} (${landmarkImages[landmark]})`);
            resolve();
          };
          
          const handleError = (e: Event) => {
            console.error(`❌ 이미지 로드 실패: ${landmark}`, {
              src: landmarkImages[landmark],
              error: e,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            setImageLoadErrors(prev => new Set([...prev, landmark]));
            resolve();
          };
          
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          
          // 캐시 무시하고 항상 새로 로드
          img.crossOrigin = 'anonymous'; // CORS 이슈 방지
          
          img.src = landmarkImages[landmark];
        });
      });

      try {
        await Promise.all(imagePromises);
        console.log('🎉 모든 이미지 프리로드 완료');
        setImagesPreloaded(true);
      } catch (error) {
        console.error('이미지 프리로드 중 오류:', error);
        setImagesPreloaded(true); // 에러가 있어도 UI는 표시
      }
    };

    preloadImages();
  }, [landmarks, landmarkImages]);

  // 이미지 로드 에러 처리 헬퍼
  const getBackgroundStyle = useCallback((landmark: string) => {
    const hasError = imageLoadErrors.has(landmark);
    if (hasError) {
      // 폴백: 그라데이션 배경 (텍스트 가독성을 위한 오버레이 추가)
      return {
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
      };
    }
    
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('${landmarkImages[landmark]}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }, [imageLoadErrors, landmarkImages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 자동완성 API 호출 (메모리 안전, API 중복 방지, 캐시 적용)
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    console.log('🚀 fetchSuggestions 함수 실행 시작:', searchQuery);
    
    // 🧠 캐시 확인 (30분 만료)
    const cacheKey = `${searchQuery}-${currentLanguage}`;
    const cachedResult = suggestionCacheRef.current.get(cacheKey);
    const now = Date.now();
    
    if (cachedResult && (now - cachedResult.timestamp) < 30 * 60 * 1000) {
      console.log('⚡ 캐시에서 결과 반환:', searchQuery);
      if (isMountedRef.current) {
        setSuggestions(cachedResult.data);
        setShowSuggestions(true);
      }
      return;
    }
    
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
      const apiUrl = `/api/locations/search?q=${encodeURIComponent(searchQuery)}&lang=${currentLanguage}`;
      console.log('🌐 API 호출 시작:', apiUrl);
      
      const response = await fetch(apiUrl, { 
        signal: abortControllerRef.current.signal,
        cache: 'no-cache'
      });
      
      console.log('📡 API 응답 받음:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 API 응답 데이터:', data);
      console.log('📋 data.success:', data.success);
      console.log('📋 data.data:', data.data);
      console.log('📋 data.data 타입:', typeof data.data);
      console.log('📋 data.data Array인지:', Array.isArray(data.data));
      if (Array.isArray(data.data) && data.data.length > 0) {
        console.log('📋 첫 번째 항목:', data.data[0]);
        console.log('📋 첫 번째 항목 구조:', Object.keys(data.data[0]));
      }
      
      // 컴포넌트가 마운트되어 있을 때만 상태 업데이트
      if (!isMountedRef.current) return;
      
      if (data.success && isValidSuggestionsArray(data.data)) {
        const suggestionsData = data.data.slice(0, 5); // 최대 5개 제안
        
        // 🧠 캐시에 저장 (LRU 방식, 최대 100개)
        const cache = suggestionCacheRef.current;
        cache.set(cacheKey, {
          data: suggestionsData,
          timestamp: Date.now()
        });
        
        // LRU: 100개 초과시 가장 오래된 항목 제거
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value;
          if (firstKey) cache.delete(firstKey);
        }
        
        if (isMountedRef.current) {
          setSuggestions(suggestionsData);
          setSelectedSuggestionIndex(-1); // 새로운 제안이 오면 선택 초기화
          setShowSuggestions(true); // 성공적으로 받으면 드롭다운 표시
          console.log('✅ 자동완성 결과 설정 및 캐시 저장 완료:', suggestionsData.length, '개');
        }
      } else {
        if (isMountedRef.current) {
          setSuggestions([]);
          setSelectedSuggestionIndex(-1);
          setShowSuggestions(false);
          console.log('⚠️ 자동완성 결과 없음 또는 invalid');
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

  // fetchSuggestions를 ref에 할당하여 안정적인 참조 유지
  fetchSuggestionsRef.current = fetchSuggestions;


  // 디바운스된 검색 함수 (메모리 안전)
  useEffect(() => {
    console.log('🔍 디바운스 트리거:', { query: query.trim(), isFocused, isMountedRef: isMountedRef.current });
    if (!isMountedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      console.log('⏰ 디바운스 실행 전:', { query: query.trim(), isFocused, isMountedRef: isMountedRef.current });
      if (query.trim() && isFocused && isMountedRef.current) {
        console.log('✅ 자동완성 API 호출:', query.trim());
        fetchSuggestionsRef.current?.(query.trim());
      } else {
        console.log('❌ 자동완성 조건 불충족:', { hasQuery: !!query.trim(), isFocused, isMounted: isMountedRef.current });
      }
    }, 150); // 150ms 디바운스 (속도 최적화)

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, currentLanguage, isFocused]); // fetchSuggestions 의존성 제거하여 순환참조 방지

  // 컴포넌트 마운트/언마운트 관리 (React Strict Mode 대응)
  useEffect(() => {
    // 컴포넌트 마운트 시 초기화
    isMountedRef.current = true;
    console.log('🚀 컴포넌트 마운트: isMountedRef =', isMountedRef.current);
    
    return () => {
      // 컴포넌트 언마운트 표시
      console.log('🔚 컴포넌트 언마운트: isMountedRef 설정 false');
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
    
    setCurrentLoadingQuery(query.trim());
    setLoadingState('search', true);
    try {
      router.push(`/guide/${encodeURIComponent(query.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      if (isMountedRef.current) {
        setLoadingState('search', false);
        setCurrentLoadingQuery('');
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
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
          router.push(`/guide/${encodeURIComponent(selectedSuggestion.name)}`);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };



  // AI 가이드 생성 (강화된 에러 처리 및 디버깅)
  const handleAIGeneration = async () => {
    if (!query.trim()) {
      showError(t('home.alerts.enterLocation') as string, {
        errorType: 'validation',
        title: '입력 확인'
      });
      return;
    }

    const location = query.trim();
    setCurrentLoadingQuery(location);
    setLoadingState('guide', true);
    
    console.group('🚀 AI 가이드 생성 시작');
    console.log('📍 요청 정보:', {
      location,
      language: currentLanguage,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    try {
      // 1단계: 환경 변수 사전 체크
      console.log('🔍 1단계: 환경 설정 체크 중...');
      const envCheck = await fetch('/api/debug/env', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (envCheck.ok) {
        const envData = await envCheck.json();
        console.log('🔧 환경 설정 상태:', envData.diagnostics);
        
        if (envData.criticalMissing.length > 0) {
          console.error('🚨 필수 환경 변수 누락:', envData.criticalMissing);
          showError(
            `서비스 설정에 문제가 있습니다. 관리자에게 문의하세요.`,
            {
              errorType: 'config',
              title: '설정 오류',
              details: `누락된 설정: ${envData.criticalMissing.join(', ')}`,
              retryAction: () => handleAIGeneration()
            }
          );
          return;
        }
      } else {
        console.warn('⚠️ 환경 설정 체크 실패, 계속 진행');
      }

      // 2단계: AI 가이드 생성 API 호출
      console.log('🤖 2단계: AI 가이드 생성 요청 시작');
      const startTime = Date.now();
      
      const response = await fetch('/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'GuideAI/1.0'
        },
        body: JSON.stringify({
          location,
          userProfile: {
            language: currentLanguage,
            interests: ['문화', '역사'],
            knowledgeLevel: '중급',
            ageGroup: '30대',
            preferredStyle: '친근함',
            tourDuration: 90,
            companions: 'solo'
          },
          enhanceCoordinates: true,
          useEnhancedChapters: true
        }),
        signal: AbortSignal.timeout(60000) // 60초 타임아웃
      });

      const responseTime = Date.now() - startTime;
      console.log('📡 API 응답 수신:', {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (response.ok) {
        try {
          const data = await response.json();
          console.log('✅ 가이드 생성 성공:', {
            success: data.success,
            location: data.location,
            language: data.language,
            hasData: !!data.data,
            dataIntegration: data.dataIntegration?.hasIntegratedData,
            coordinateEnhancement: data.coordinateEnhancement?.success,
            cached: data.cached,
            totalTime: `${responseTime}ms`
          });
          
          // 3단계: 성공적인 페이지 이동
          console.log('🔄 가이드 페이지로 이동 중...');
          router.push(`/guide/${encodeURIComponent(location)}/tour`);
          
        } catch (jsonError) {
          console.error('❌ JSON 파싱 오류:', jsonError);
          const responseText = await response.text();
          console.log('원본 응답 텍스트 (처음 500자):', responseText);
          showError(
            '서버 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
            {
              errorType: 'server',
              title: '서버 응답 오류',
              details: `JSON 파싱 실패: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
              retryAction: () => handleAIGeneration()
            }
          );
        }
      } else {
        // 4단계: API 에러 처리
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            error: `HTTP ${response.status}: ${response.statusText}`,
            details: '서버에서 오류 응답을 받았습니다.'
          };
        }
        
        console.error('❌ API 가이드 생성 실패:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          details: errorData.details,
          retryAfter: response.headers.get('retry-after'),
          responseTime: `${responseTime}ms`
        });

        // 사용자 친화적 에러 메시지
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after') || '60';
          showError(
            `요청 한도를 초과했습니다. ${retryAfter}초 후 다시 시도해주세요.`,
            {
              errorType: 'server',
              title: '요청 제한',
              details: `HTTP 429: Rate limit exceeded. Retry after ${retryAfter} seconds`,
              retryAction: () => {
                setTimeout(() => handleAIGeneration(), parseInt(retryAfter) * 1000);
              }
            }
          );
        } else if (response.status === 500) {
          showError(
            'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            {
              errorType: 'server',
              title: '서버 오류',
              details: `HTTP 500: ${errorData.error || 'Internal Server Error'}`,
              retryAction: () => handleAIGeneration()
            }
          );
        } else if (response.status === 400) {
          showError(
            '입력하신 장소 정보를 확인해주세요.',
            {
              errorType: 'validation',
              title: '입력 오류',
              details: `HTTP 400: ${errorData.error || 'Bad Request'}`,
              retryAction: () => handleAIGeneration()
            }
          );
        } else {
          const defaultMessage = errorData.error || `${t('home.alerts.generationFailed')} (${response.status})`;
          showError(
            defaultMessage,
            {
              errorType: 'server',
              title: '가이드 생성 실패',
              details: `HTTP ${response.status}: ${response.statusText}`,
              retryAction: () => handleAIGeneration()
            }
          );
        }
      }
    } catch (error) {
      const responseTime = Date.now() - Date.now();
      console.error('❌ AI 생성 예외 발생:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'UnknownError',
        location,
        language: currentLanguage,
        timestamp: new Date().toISOString()
      });

      // 네트워크 에러별 사용자 친화적 메시지
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          showError(
            '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.',
            {
              errorType: 'timeout',
              title: '시간 초과',
              details: `${error.name}: ${error.message}`,
              retryAction: () => handleAIGeneration()
            }
          );
        } else if (error.message.includes('Failed to fetch')) {
          showError(
            '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
            {
              errorType: 'network',
              title: '연결 실패',
              details: `Network Error: ${error.message}`,
              retryAction: () => handleAIGeneration()
            }
          );
        } else if (error.message.includes('NetworkError')) {
          showError(
            '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            {
              errorType: 'network',
              title: '네트워크 오류',
              details: `Network Error: ${error.message}`,
              retryAction: () => handleAIGeneration()
            }
          );
        } else {
          showError(
            t('home.alerts.networkError') as string,
            {
              errorType: 'unknown',
              title: '알 수 없는 오류',
              details: `${error.name}: ${error.message}`,
              retryAction: () => handleAIGeneration()
            }
          );
        }
      } else {
        showError(
          t('home.alerts.networkError') as string,
          {
            errorType: 'unknown',
            title: '알 수 없는 오류',
            details: `Unknown error: ${String(error)}`,
            retryAction: () => handleAIGeneration()
          }
        );
      }
    } finally {
      console.groupEnd();
      setLoadingState('guide', false);
      setCurrentLoadingQuery('');
    }
  };

  // 오디오 재생 (지연 제거, 분리된 로딩 상태)
  const handleAudioPlayback = useCallback(() => {
    if (!query.trim() || !isMountedRef.current) {
      showError(t('home.alerts.enterLocation') as string, {
        errorType: 'validation',
        title: '입력 확인'
      });
      return;
    }

    setCurrentLoadingQuery(query.trim());
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
          message={String(t('guide.generatingWithLocation', { location: currentLoadingQuery || query || '' }))}
          subMessage={String(t('guide.generatingSubMessage'))}
          showProgress={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {/* 배경 - 헤더 컨테이너 크기에 맞춰서 Hero 섹션까지만 제한 - 모바일 반응형 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 overflow-hidden w-full max-w-6xl px-2 sm:px-4 md:px-6" style={{ height: '85vh' }}>
        {/* 회전하는 배경 이미지들 */}
        {landmarks.map((landmark, index) => (
          <div
            key={landmark}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentLandmarkIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${landmarkImages[landmark]}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: -2,
              borderRadius: '0 0 24px 24px'
            }}
          />
        ))}
      </div>

      {/* SEO Structured Data */}
      <StructuredData type="WebSite" />
      <StructuredData type="TravelAgency" />
      <StructuredData type="SoftwareApplication" />
      <FAQSchema faqs={getDefaultFAQs(currentLanguage as 'ko' | 'en' | 'ja' | 'zh' | 'es')} language={currentLanguage as 'ko' | 'en' | 'ja' | 'zh' | 'es'} />
      <BreadcrumbSchema items={generateHomeBreadcrumb()} />

      {/* Main Content */}
      <main className="relative z-10 overflow-hidden">
        {/* Hero Section - 모바일 반응형 패딩 */}
        <section className="relative flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 min-h-screen">
            
            {/* 중앙 명소 텍스트 - 2줄 레이아웃 (명소 부분만 회전) */}
            <div className="text-center text-white mb-4 sm:mb-6 w-full flex flex-col items-center justify-center">
              {/* 첫 번째 줄: [명소] - PC에서 40% 작게, 모바일 그대로 */}
              <div className="font-bold mb-2 flex items-center justify-center w-full" style={{ 
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)', 
                fontSize: isMobile 
                  ? 'clamp(1rem, 4vw, 1.375rem)'  // 모바일: 16px ~ 22px (약간 줄임)
                  : 'clamp(1.625rem, 2.6vw, 1.625rem)',   // PC: 26px 고정
                height: isMobile ? '36px' : '32px' 
              }}>
                <span className="inline-block overflow-hidden whitespace-nowrap w-full max-w-none" style={{ 
                  height: isMobile ? '36px' : '32px', 
                  lineHeight: isMobile ? '36px' : '32px',
                  textAlign: 'center'
                }}>
                  <span 
                    className="inline-block transition-transform duration-1000 ease-out w-full"
                    style={{
                      transform: `translateY(-${currentLandmarkIndex * (isMobile ? 36 : 32)}px)`
                    }}
                  >
                    {landmarks.map((landmark, index) => (
                      <span key={index} className="block font-bold whitespace-nowrap w-full" style={{ 
                        height: isMobile ? '36px' : '32px', 
                        lineHeight: isMobile ? '36px' : '32px',
                        textAlign: 'center',
                        fontSize: isMobile ? '1.1em' : '1.1em' // 10% 증가 (기본 1em → 1.1em)
                      }}>
                        {t(`home.landmarks.${landmark}` as any) || landmark}
                      </span>
                    ))}
                  </span>
                </span>
              </div>
              {/* 두 번째 줄: 앞에서 만드는 오디오 가이드 */}
              <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                {t('home.audioGuidePrefix')}
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-light mb-1" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                {t('home.subtitle')}
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-light" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                {t('home.subtitle2')}
              </div>
            </div>

            {/* How to Use - 3 Steps - 모바일 반응형 */}
            <div className="relative z-10 py-4 sm:py-6 md:py-8 w-full max-w-6xl">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
              {/* 모든 화면에서 가로 배열 - 모바일 간격 최적화 */}
              <div className="flex flex-row justify-center items-start gap-1 sm:gap-2 md:gap-4 lg:gap-6 xl:gap-8">
                
                {/* 장소 입력 - 모바일 최적화 */}
                <div className="text-center relative z-10 flex-1 max-w-20 sm:max-w-24 md:max-w-32 lg:max-w-xs">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center bg-white text-black mb-2 sm:mb-3 md:mb-4 shadow-lg border-2 border-gray-200">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-h-10 sm:min-h-12 md:min-h-16 lg:min-h-20 flex flex-col justify-start pt-1 sm:pt-2">
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-white mb-0 sm:mb-1" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.inputLocation')}</div>
                    <div className="text-xs sm:text-xs md:text-sm lg:text-base font-light text-white opacity-80" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.inputLocationSub')}</div>
                  </div>
                </div>

                {/* 화살표 1 - 모바일 최적화 */}
                <div className="flex items-center justify-center pt-3 sm:pt-4 md:pt-6 lg:pt-8">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* AI 생성 - 모바일 최적화 */}
                <div className="text-center relative z-10 flex-1 max-w-20 sm:max-w-24 md:max-w-32 lg:max-w-xs">
                  <button 
                    onClick={handleAIGeneration}
                    disabled={!query.trim() || loadingStates.search}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-2 sm:mb-3 md:mb-4 bg-white text-black border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      loadingStates.search ? 'animate-pulse' : ''
                    } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                    aria-label={loadingStates.guide ? 'AI 가이드 생성 중...' : String(t('home.stepTitles.aiGenerate'))}
                    aria-disabled={!query.trim() || loadingStates.search}
                  >
                    {loadingStates.guide ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="min-h-10 sm:min-h-12 md:min-h-16 lg:min-h-20 flex flex-col justify-start pt-1 sm:pt-2">
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-white mb-0 sm:mb-1" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.aiGenerate')}</div>
                    <div className="text-xs sm:text-xs md:text-sm lg:text-base font-light text-white opacity-80" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.aiGenerateSub')}</div>
                  </div>
                </div>

                {/* 화살표 2 - 모바일 최적화 */}
                <div className="flex items-center justify-center pt-3 sm:pt-4 md:pt-6 lg:pt-8">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 오디오 재생 - 모바일 최적화 */}
                <div className="text-center relative z-10 flex-1 max-w-20 sm:max-w-24 md:max-w-32 lg:max-w-xs">
                  <button 
                    onClick={handleAudioPlayback}
                    disabled={!query.trim()}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg mb-2 sm:mb-3 md:mb-4 bg-white text-black border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                      audioPlaying ? 'animate-pulse' : ''
                    } ${!query.trim() ? 'opacity-100 cursor-not-allowed' : ''}`}
                    aria-label={audioPlaying ? '오디오 일시정지' : String(t('home.stepTitles.audioPlay'))}
                    aria-pressed={audioPlaying}
                  >
                    {audioPlaying ? (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>
                  <div className="min-h-10 sm:min-h-12 md:min-h-16 lg:min-h-20 flex flex-col justify-start pt-1 sm:pt-2">
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-white mb-0 sm:mb-1" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.audioPlay')}</div>
                    <div className="text-xs sm:text-xs md:text-sm lg:text-base font-light text-white opacity-80" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.audioPlaySub')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box - 모바일 반응형 */}
          <div className="relative z-[9998] w-full max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-0">
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
                  onFocus={() => {
                    setIsFocused(true);
                    // 기존에 검색 결과가 있으면 다시 표시
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={(e) => {
                    // 클릭이 제안 목록 내부에서 일어나는지 확인
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (!relatedTarget || !relatedTarget.closest('.suggestions-container')) {
                      // 자동완성 API 응답 대기 시간 확보 (300ms 지연)
                      setTimeout(() => {
                        setIsFocused(false);
                        setShowSuggestions(false);
                      }, 300);
                    }
                  }}
                  placeholder={String(t('home.searchPlaceholder'))}
                  className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 text-base sm:text-lg md:text-xl font-light text-black bg-transparent rounded-3xl focus:outline-none transition-all duration-300 placeholder-gray-400 focus:ring-2 focus:ring-black focus:ring-opacity-20"
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
                    absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl transition-all duration-300
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
                    <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {(isFocused || showSuggestions) && query.length > 0 && (
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
                          setShowSuggestions(false);
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
            <div className="max-w-4xl mx-auto px-6 py-4">
              <OptimalAdSense 
                placement="homepage-countries" 
                className="text-center"
              />
            </div>
          </div>
        </section>

      </main>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        title={errorModal.title}
        message={errorModal.message}
        errorType={errorModal.errorType}
        details={errorModal.details}
        retryAction={errorModal.retryAction}
        helpUrl="https://t.me/naviguideai"
      />

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