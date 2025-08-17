'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Component, ReactNode, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

import StructuredData from '@/components/seo/StructuredData';
import GuideLoading from '@/components/ui/GuideLoading';
import SkipToMain from '@/components/accessibility/SkipToMain';

// Dynamic imports for performance optimization
const OptimalAdSense = dynamic(() => import('@/components/ads/OptimalAdSense'), {
  loading: () => <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

const FAQSchema = dynamic(() => import('@/components/seo/FAQSchema'), {
  ssr: true
});

const BreadcrumbSchema = dynamic(() => import('@/components/seo/BreadcrumbSchema'), {
  ssr: true
});

const ErrorModal = dynamic(() => import('@/components/errors/ErrorModal'), {
  loading: () => null,
  ssr: false
});

// Helper functions - import synchronously for immediate use
import { getDefaultFAQs } from '@/components/seo/FAQSchema';
import { generateHomeBreadcrumb } from '@/components/seo/BreadcrumbSchema';

// Performance optimization components
const ImagePreloader = dynamic(() => import('@/components/optimization/ImagePreloader'), {
  ssr: false
});

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
              <h2 className="text-2xl font-bold text-black mb-2">오류가 발생했습니다</h2>
              <p className="text-[#555555] font-light mb-6">죄송합니다. 예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.</p>
              <div className="bg-[#F8F8F8] rounded-lg p-4 mb-6 text-left">
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

// 🌍 국가코드 캐시 (메모리 캐싱)
const countryCodeCache = new Map<string, string>();

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
    console.log('🔍 국가코드 변환 요청:', countryName);
    
    // 캐시 확인
    const cached = countryCodeCache.get(countryName);
    if (cached) {
      console.log('💾 국가코드 캐시 히트:', countryName, '→', cached);
      return cached;
    }
    
    // 🌏 한국어 국가명을 영어로 변환
    const englishCountryName = koreanCountryMap[countryName] || countryName;
    if (englishCountryName !== countryName) {
      console.log('🈯 한국어 국가명 매핑:', countryName, '→', englishCountryName);
    }
    
    console.log('🌍 REST Countries API 국가코드 변환 시작:', englishCountryName);
    
    // 여러 API 엔드포인트 시도
    const endpoints = [
      `https://restcountries.com/v3.1/name/${encodeURIComponent(englishCountryName)}?fields=cca3`,
      `https://restcountries.com/v3.1/translation/${encodeURIComponent(englishCountryName)}?fields=cca3`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('📡 API 호출:', endpoint);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          console.warn('⚠️ API 응답 실패:', response.status, endpoint);
          continue;
        }
        
        const data = await response.json();
        console.log('📋 API 응답 데이터:', data);
        
        if (data && data.length > 0 && data[0].cca3) {
          const countryCode = data[0].cca3; // ISO 3166-1 alpha-3 코드
          
          // 원래 한국어 이름과 영어 이름 모두 캐시에 저장
          countryCodeCache.set(countryName, countryCode);
          if (englishCountryName !== countryName) {
            countryCodeCache.set(englishCountryName, countryCode);
          }
          
          console.log('✅ 국가코드 변환 성공:', countryName, '→', countryCode);
          return countryCode;
        }
      } catch (endpointError) {
        console.warn('⚠️ API 엔드포인트 오류:', endpoint, endpointError);
        continue;
      }
    }
    
    console.warn('⚠️ 모든 API 엔드포인트 실패, 국가코드 데이터 없음:', countryName, '(영어명:', englishCountryName, ')');
    return null;
    
  } catch (error) {
    console.error('❌ 국가코드 변환 전체 오류:', error);
    return null;
  }
}

function Home() {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  // 명소 상세 설명 번역 로드
  const attractionDetails = useMemo(() => {
    try {
      const details = t('attractionDetails');
      return (typeof details === 'object' && details && !Array.isArray(details)) 
        ? details as Record<string, string> 
        : {};
    } catch (error) {
      console.log('attractionDetails 번역 로드 실패:', error);
      return {};
    }
  }, [t]);
  
  // URL 파라미터 처리를 위한 상태 추가
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  
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
          flag: '', 
          attractions: countries.seoul?.attractions || ['경복궁', '남산타워', '명동'],
          description: countries.seoul?.description || '전통과 현대가 어우러진 대한민국의 수도'
        },
        { 
          id: 'busan', 
          name: countries.busan?.name || '부산', 
          flag: '', 
          attractions: countries.busan?.attractions || ['해운대해수욕장', '감천문화마을', '자갈치시장'],
          description: countries.busan?.description || '아름다운 바다와 항구의 도시'
        },
        { 
          id: 'jeju', 
          name: countries.jeju?.name || '제주', 
          flag: '', 
          attractions: countries.jeju?.attractions || ['한라산', '성산일출봉', '중문관광단지'],
          description: countries.jeju?.description || '환상적인 자연경관의 섬'
        },
        { 
          id: 'gyeongju', 
          name: countries.gyeongju?.name || '경주', 
          flag: '', 
          attractions: countries.gyeongju?.attractions || ['불국사', '석굴암', '첨성대'],
          description: countries.gyeongju?.description || '천년고도 신라의 역사가 살아있는 도시'
        }
      ],
      europe: [
        { 
          id: 'france', 
          name: countries.france?.name || 'France', 
          flag: '', 
          attractions: countries.france?.attractions || ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles'],
          description: countries.france?.description || 'Romantic Paris and magnificent cultural heritage'
        },
        { 
          id: 'italy', 
          name: countries.italy?.name || 'Italy', 
          flag: '', 
          attractions: countries.italy?.attractions || ['Colosseum', 'Leaning Tower of Pisa', 'Vatican'],
          description: countries.italy?.description || 'Glory of ancient Rome and Renaissance art'
        },
        { 
          id: 'spain', 
          name: countries.spain?.name || 'Spain', 
          flag: '', 
          attractions: countries.spain?.attractions || ['Sagrada Familia', 'Alhambra', 'Park Güell'],
          description: countries.spain?.description || 'Gaudí\'s architecture and flamenco passion'
        },
        { 
          id: 'uk', 
          name: countries.uk?.name || 'United Kingdom', 
          flag: '', 
          attractions: countries.uk?.attractions || ['Big Ben', 'Tower Bridge', 'Buckingham Palace'],
          description: countries.uk?.description || 'Harmonious blend of tradition and modernity'
        },
        { 
          id: 'germany', 
          name: countries.germany?.name || 'Germany', 
          flag: '', 
          attractions: countries.germany?.attractions || ['Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral'],
          description: countries.germany?.description || 'Fairy-tale castles and deep historical heritage'
        }
      ],
      asia: [
        { 
          id: 'japan', 
          name: countries.japan?.name || 'Japan', 
          flag: '', 
          attractions: countries.japan?.attractions || ['Mount Fuji', 'Kiyomizu-dera', 'Senso-ji'],
          description: countries.japan?.description || 'Mysterious land where tradition and cutting-edge coexist'
        },
        { 
          id: 'china', 
          name: countries.china?.name || 'China', 
          flag: '', 
          attractions: countries.china?.attractions || ['Great Wall', 'Forbidden City', 'Tiananmen Square'],
          description: countries.china?.description || 'Great civilization with 5000 years of history'
        },
        { 
          id: 'india', 
          name: countries.india?.name || 'India', 
          flag: '', 
          attractions: countries.india?.attractions || ['Taj Mahal', 'Red Fort', 'Ganges River'],
          description: countries.india?.description || 'Mystical spirituality and magnificent palaces'
        },
        { 
          id: 'thailand', 
          name: countries.thailand?.name || 'Thailand', 
          flag: '', 
          attractions: countries.thailand?.attractions || ['Wat Arun', 'Grand Palace', 'Wat Pho'],
          description: countries.thailand?.description || 'Golden temples and the land of smiles'
        },
        { 
          id: 'singapore', 
          name: countries.singapore?.name || 'Singapore', 
          flag: '', 
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
      '에펠탑': `/images/landmarks/eiffel-tower.webp`,
      '콜로세움': `/images/landmarks/colosseum.webp`,
      '타지마할': `/images/landmarks/taj-mahal.webp`,
      '자유의 여신상': `/images/landmarks/statue-of-liberty.webp`,
      '경복궁': `/images/landmarks/gyeongbokgung.webp`,
      '마추픽추': `/images/landmarks/machu-picchu.webp`,
      '사그라다 파밀리아': `/images/landmarks/sagrada-familia.webp`
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

  // 이미지 로드 에러 처리 헬퍼 (WebP fallback 포함)
  const getBackgroundStyle = useCallback((landmark: string) => {
    const hasError = imageLoadErrors.has(landmark);
    if (hasError) {
      // 폴백: WebP 실패 시 PNG 사용, 그것도 실패하면 그라데이션
      const pngImage = landmarkImages[landmark].replace('.webp', '.png');
      return {
        background: `linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(40, 40, 60, 0.9) 100%)`,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('${pngImage}'), linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)`,
        backgroundSize: 'cover, cover, cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {
      // WebP 우선, PNG fallback, 최종 그라데이션 fallback
      background: `linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(40, 40, 60, 0.9) 100%)`,
      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('${landmarkImages[landmark]}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
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

  // URL 파라미터 처리 효과
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams(params);
      
      // 도구에서 온 파라미터 처리
      const destination = params.get('destination');
      const purpose = params.get('purpose');
      const film = params.get('film');
      const nomad = params.get('nomad');
      const visa = params.get('visa');
      
      if (destination) {
        setQuery(destination as string);
        // 자동으로 가이드 생성 시작 (옵션)
        // handleSearch();
      }
      
      // 특수 목적 파라미터 처리
      if (purpose === 'travel' || purpose === 'coworking') {
        // 해당 목적에 맞는 UI 모드 활성화 가능
        console.log('🎯 특수 목적 모드:', purpose as string);
      }
      
      if (film === 'experience') {
        console.log('🎬 영화 촬영지 체험 모드 활성화');
      }
      
      if (nomad === 'true') {
        console.log('💻 노마드 모드 활성화');
      }
      
      if (visa === 'ready') {
        console.log('📋 비자 준비 완료 모드');
      }
    }
  }, []);

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

  // 검색 실행 (자동완성 결과 활용, 지역정보 파라미터 생성)
  const handleSearch = useCallback(async () => {
    if (!query.trim() || !isMountedRef.current) return;
    
    console.log('🚀 handleSearch 함수 호출됨 (page.tsx):', { query: query.trim() });
    
    setCurrentLoadingQuery(query.trim());
    setLoadingState('search', true);
    
    try {
      // 🚀 엔터 입력 시 자동완성 API로 첫 번째 결과 가져오기
      console.log('🔍 엔터 입력 - 자동완성 API 호출:', query.trim());
      
      const searchResponse = await fetch(`/api/locations/search?q=${encodeURIComponent(query.trim())}&lang=${currentLanguage}`);
      const searchData = await searchResponse.json();
      
      if (searchData.success && searchData.data && searchData.data.length > 0) {
        // 첫 번째 자동완성 결과 사용
        const firstSuggestion = searchData.data[0];
        console.log('✅ 자동완성 첫 번째 결과:', firstSuggestion);
        
        // 자동완성 클릭과 동일한 로직으로 처리
        const parts = firstSuggestion.location.split(',').map((part: string) => part.trim());
        
        if (parts.length >= 2) {
          const region = parts[0]; // 지역명
          const country = parts[1]; // 국가명
          
          // 국가명을 국가코드로 변환
          console.log('🌍 국가코드 변환 시작:', country);
          const countryCode = await getCountryCode(country);
          
          if (countryCode) {
            // 성공: 정확한 지역정보로 이동
            const urlParams = new URLSearchParams({
              region: region,
              country: country,
              countryCode: countryCode,
              type: 'attraction',
              lang: currentLanguage
            });
            
            const targetUrl = `/guide/${encodeURIComponent(query.trim())}?${urlParams.toString()}`;
            
            console.log('🚀 엔터 입력 → 자동완성 로직 적용 성공 (page.tsx):', {
              query: query.trim(),
              suggestion: firstSuggestion.name,
              region: region,
              country: country,
              countryCode: countryCode,
              url: targetUrl
            });
            
            router.push(targetUrl);
            return;
          }
        }
      }
      
      // 자동완성 결과가 없거나 파싱 실패 시 기본 처리
      console.warn('⚠️ 자동완성 결과 없음 또는 파싱 실패 - 기본 URL로 이동 (page.tsx)');
      router.push(`/guide/${encodeURIComponent(query.trim())}?lang=${currentLanguage}`);
      
    } catch (error) {
      console.error('❌ 엔터 입력 처리 오류 (page.tsx):', error);
      
      // 오류 발생 시 기본 처리
      router.push(`/guide/${encodeURIComponent(query.trim())}?lang=${currentLanguage}`);
    } finally {
      if (isMountedRef.current) {
        setLoadingState('search', false);
        setCurrentLoadingQuery('');
      }
    }
  }, [query, router, setLoadingState, currentLanguage]);

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
          router.push(`/guide/${encodeURIComponent(selectedSuggestion.name)}?lang=${currentLanguage}`);
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
      const errorMessage = t('home.alerts.enterLocation');
      const titleMessage = t('errors.inputValidation.title');
      showError(typeof errorMessage === 'string' ? errorMessage : '위치를 입력해주세요.', {
        errorType: 'validation',
        title: typeof titleMessage === 'string' ? titleMessage : '입력 검증 오류'
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
            String(t('errors.configError.message')),
            {
              errorType: 'config',
              title: String(t('errors.configError.title')),
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
          router.push(`/guide/${encodeURIComponent(location)}/tour?lang=${currentLanguage}`);
          
        } catch (jsonError) {
          console.error('❌ JSON 파싱 오류:', jsonError);
          const responseText = await response.text();
          console.log('원본 응답 텍스트 (처음 500자):', responseText);
          showError(
            String(t('errors.serverResponse')),
            {
              errorType: 'server',
              title: String(t('errors.serverResponse.title')),
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
            String(t('errors.rateLimitExceeded', { seconds: retryAfter })),
            {
              errorType: 'server',
              title: String(t('errors.rateLimit.title')),
              details: `HTTP 429: Rate limit exceeded. Retry after ${retryAfter} seconds`,
              retryAction: () => {
                setTimeout(() => handleAIGeneration(), parseInt(retryAfter) * 1000);
              }
            }
          );
        } else if (response.status === 500) {
          showError(
            String(t('errors.aiServiceTemporary')),
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
            String(t('errors.requestTimeout')),
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
            String(t('errors.networkError')),
            {
              errorType: 'network',
              title: '네트워크 오류',
              details: `Network Error: ${error.message}`,
              retryAction: () => handleAIGeneration()
            }
          );
        } else {
          const errorMessage = t('home.alerts.networkError');
          showError(
            typeof errorMessage === 'string' ? errorMessage : '네트워크 오류가 발생했습니다.',
            {
              errorType: 'unknown',
              title: '알 수 없는 오류',
              details: `${error.name}: ${error.message}`,
              retryAction: () => handleAIGeneration()
            }
          );
        }
      } else {
        const errorMessage = t('home.alerts.networkError');
        showError(
          typeof errorMessage === 'string' ? errorMessage : '네트워크 오류가 발생했습니다.',
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
      const errorMessage = t('home.alerts.enterLocation');
      showError(typeof errorMessage === 'string' ? errorMessage : '위치를 입력해주세요.', {
        errorType: 'validation',
        title: String(t('errors.inputValidation.title'))
      });
      return;
    }

    setCurrentLoadingQuery(query.trim());
    if (isMountedRef.current) setAudioPlaying(!audioPlaying);
    setLoadingState('tour', true);
    router.push(`/guide/${encodeURIComponent(query.trim())}/tour?lang=${currentLanguage}`);
  }, [query, audioPlaying, router, t, setLoadingState, currentLanguage, showError]);


  // 가이드 생성 중일 때 모노크롬 로딩 화면 표시
  if (isAnyLoading) {
    const currentLoadingType = Object.entries(loadingStates).find(([_, loading]) => loading)?.[0] || 'search';
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
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
    <>
      <SkipToMain />
      <div className="min-h-screen bg-white font-sans relative" style={{ '--space-2xs': '4px', '--space-xs': '8px', '--space-sm': '12px', '--space-md': '16px', '--space-lg': '24px', '--space-xl': '40px', '--space-2xl': '64px' } as React.CSSProperties}>
        {/* 배경 - 헤더의 끝선에 맞춰서 시작하고, 검색박스 위까지로 제한 - 모바일 반응형 */}
      <div className="hero-background-container">
        {/* 회전하는 배경 이미지들 */}
        {landmarks.map((landmark, index) => (
          <div
            key={landmark}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentLandmarkIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              // 이미지가 전체를 채우지 못할 경우를 대비한 기본 그라데이션
              background: `linear-gradient(135deg, rgba(20, 20, 40, 0.9) 0%, rgba(40, 40, 60, 0.9) 100%)`,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('${landmarkImages[landmark]}')`,
              backgroundSize: 'cover', // cover로 변경하여 전체 영역을 채움
              backgroundPosition: 'top center', // 이미지 상단부터 표시하여 전체 이미지 보여줌
              backgroundRepeat: 'no-repeat',
              zIndex: -2,
              borderRadius: 'inherit'
            }}
          />
        ))}
      </div>

      {/* SEO Structured Data */}
      <StructuredData type="WebSite" />
      <StructuredData type="TravelAgency" />
      <StructuredData type="SoftwareApplication" />
      <Suspense fallback={null}>
        <FAQSchema faqs={getDefaultFAQs(currentLanguage as 'ko' | 'en' | 'ja' | 'zh' | 'es')} language={currentLanguage as 'ko' | 'en' | 'ja' | 'zh' | 'es'} />
        <BreadcrumbSchema items={generateHomeBreadcrumb()} />
      </Suspense>

      {/* Preload landmark images for better performance */}
      <ImagePreloader 
        images={Object.values(landmarkImages)} 
        priority={false} 
      />

      {/* Main Content */}
      <main id="main-content" className="relative z-10 overflow-hidden" tabIndex={-1}>
        {/* Hero Section - 모바일 반응형 패딩 */}
        <section className="relative flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:pb-12 min-h-screen" aria-labelledby="hero-heading">
            
            {/* 중앙 명소 텍스트 - 2줄 레이아웃 (명소 부분만 회전) */}
            <div className="text-center text-white mb-4 sm:mb-6 w-full flex flex-col items-center justify-center">
              <h1 id="hero-heading" className="sr-only">
                {t('home.pageTitle') || 'TripRadio.AI - AI 오디오가이드 여행 서비스'}
              </h1>
              {/* 첫 번째 줄: [명소] - PC에서 40% 작게, 모바일 그대로 */}
              <div className="font-bold mb-2 flex items-center justify-center w-full" style={{ 
                textShadow: '2px 2px 8px rgba(0,0,0,0.8)', 
                fontSize: isMobile 
                  ? 'clamp(1.125rem, 4vw, 1.5rem)'  // 모바일: 18px ~ 24px (4px 증가)
                  : 'clamp(1.875rem, 2.6vw, 1.875rem)',   // PC: 30px 고정 (4px 증가)
                height: isMobile ? '42px' : '40px'  // 높이 증가로 글자 간격 개선
              }}>
                <span className="inline-block overflow-hidden whitespace-nowrap w-full max-w-none" style={{ 
                  height: isMobile ? '42px' : '40px',  // 높이 증가로 글자 간격 개선
                  lineHeight: isMobile ? '42px' : '40px',  // 라인 높이 증가
                  textAlign: 'center'
                }}>
                  <span 
                    className="inline-block transition-transform duration-1000 ease-out w-full"
                    style={{
                      transform: `translateY(-${currentLandmarkIndex * (isMobile ? 42 : 40)}px)`,  // 새 높이에 맞춰 조정
                      letterSpacing: '0.05em'  // 글자 간격 약간 늘려서 가독성 향상
                    }}
                  >
                    {landmarks.map((landmark, index) => (
                      <span key={index} className="block font-bold whitespace-nowrap w-full" style={{ 
                        height: isMobile ? '42px' : '40px',  // 높이 증가로 글자 간격 개선
                        lineHeight: isMobile ? '42px' : '40px',  // 라인 높이 증가
                        textAlign: 'center',
                        fontSize: isMobile ? '1.3em' : '1.3em', // 30% 증가 (기본 1em → 1.3em)
                        letterSpacing: '0.05em'  // 글자 간격 약간 늘려서 가독성 향상
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
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-light mb-1 text-gray-300" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                {t('home.subtitle')}
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-light text-gray-300" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                {t('home.subtitle2')}
              </div>
            </div>

            {/* How to Use - 3 Steps - 모바일 반응형 */}
            <div className="relative z-10 py-4 sm:py-6 md:py-8 w-full max-w-4xl">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
              {/* 모든 화면에서 가로 배열 - 50% 압축하여 중앙 집중 */}
              <div className="flex flex-row justify-center items-start gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
                
                {/* 장소 입력 - 모바일 최적화 */}
                <div className="text-center relative z-10 flex-1 max-w-24 sm:max-w-28 md:max-w-32 lg:max-w-xs">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center bg-white text-black mb-2 sm:mb-3 md:mb-4 shadow-lg border-2 border-gray-200">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-h-10 sm:min-h-12 md:min-h-16 lg:min-h-20 flex flex-col justify-start pt-1 sm:pt-2">
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-gray-200 mb-0 sm:mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.inputLocation')}</div>
                    <div className="text-xs sm:text-xs md:text-sm lg:text-base font-light text-gray-300 opacity-80 whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.inputLocationSub')}</div>
                  </div>
                </div>

                {/* 화살표 1 - 모바일 최적화 */}
                <div className="flex items-center justify-center pt-3 sm:pt-4 md:pt-6 lg:pt-8">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* AI 생성 - 모바일 최적화 */}
                <div className="text-center relative z-10 flex-1 max-w-24 sm:max-w-28 md:max-w-32 lg:max-w-xs">
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
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-gray-200 mb-0 sm:mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.aiGenerate')}</div>
                    <div className="text-xs sm:text-xs md:text-sm lg:text-base font-light text-gray-300 opacity-80 whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.aiGenerateSub')}</div>
                  </div>
                </div>

                {/* 화살표 2 - 모바일 최적화 */}
                <div className="flex items-center justify-center pt-3 sm:pt-4 md:pt-6 lg:pt-8">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* 오디오 재생 - 모바일 최적화 */}
                <div className="text-center relative z-10 flex-1 max-w-24 sm:max-w-28 md:max-w-32 lg:max-w-xs">
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
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-gray-200 mb-0 sm:mb-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.audioPlay')}</div>
                    <div className="text-xs sm:text-xs md:text-sm lg:text-base font-light text-gray-300 opacity-80 whitespace-nowrap overflow-hidden text-ellipsis" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>{t('home.stepTitles.audioPlaySub')}</div>
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
                          router.push(`/guide/${encodeURIComponent(selectedLocation)}?lang=${currentLanguage}`);
                        }}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        onMouseLeave={() => setSelectedSuggestionIndex(-1)}
                        className={`w-full px-6 py-4 text-left transition-all duration-200 group suggestion-item focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black ${
                          selectedSuggestionIndex === index 
                            ? 'bg-blue-50 ring-2 ring-blue-200' 
                            : 'hover:bg-[#F8F8F8]'
                        }`}
                        role="option"
                        aria-selected={selectedSuggestionIndex === index}
                        aria-label={`${suggestion.name}, ${suggestion.location}로 이동`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-black group-hover:text-black">
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
        <section className="relative z-10 py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white" aria-labelledby="popular-destinations-heading">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* 섹션 제목 */}
            <div className="text-center mb-8">
              <h2 id="popular-destinations-heading" className="text-2xl md:text-3xl font-bold text-black mb-3">
                {t('home.regionTitles.popularCountries')}
              </h2>
              <p className="text-[#555555] font-light max-w-2xl mx-auto">
                {t('home.regionDescription')}
              </p>
            </div>
            
            {/* 지역별 탭 */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100" role="tablist" aria-label="지역 선택">
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
                        px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-fluid-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                        ${activeRegion === region.id
                          ? 'bg-black text-white shadow-md'
                          : 'text-[#555555] font-light hover:text-black hover:bg-[#F8F8F8]'
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
              {/* 지역 상세 페이지 링크 - 모든 기기 최적화 */}
              {/* 지역 상세 페이지 링크 박스는 카드 아래로 이동 */}
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
                      <div className="relative h-24 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                        {/* 미니멀 패턴 */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/3 rounded-full transform translate-x-6 -translate-y-6"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/3 rounded-full transform -translate-x-3 translate-y-3"></div>
                        
                        {/* 국가명 */}
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <h3 className="text-fluid-lg font-semibold tracking-wider leading-tight">
                            {country.name}
                          </h3>
                        </div>

                        {/* 인기 배지 - 모노크롬 */}
                        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                          <span className="text-fluid-xs text-white font-normal tracking-wide leading-tight">{t('home.popularBadge')}</span>
                        </div>
                      </div>

                      {/* 카드 콘텐츠 - 모노크롬 스타일 */}
                      <div className="p-6">
                        {/* 설명 */}
                        <p className="text-fluid-sm text-[#555555] font-light mb-5 leading-relaxed">
                          {country.description}
                        </p>

                        {/* 인기 관광지 - 클릭 가능한 버튼들 */}
                        <div className="space-y-3 mb-5">
                          <h4 className="text-fluid-xs font-semibold text-black uppercase tracking-wide leading-tight">
                            {t('home.countryAttraction')}
                          </h4>
                          {country.attractions.slice(0, 3).map((attraction, idx) => {
                            const description = attractionDetails[attraction] || '';
                            return (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLoadingState('country', true);
                                  
                                  // 특정 명소에 대해 지역 컨텍스트 추가
                                  let url = `/guide/${encodeURIComponent(attraction)}?lang=${currentLanguage}`;
                                  if (country.id === 'thailand' && attraction === '방콕 대왕궁') {
                                    url += '&parent=' + encodeURIComponent('방콕');
                                  }
                                  
                                  router.push(url);
                                }}
                                className="w-full text-left py-3 px-3 -mx-3 rounded-lg hover:bg-[#F8F8F8] focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 transition-all duration-200"
                                aria-label={`${attraction} 가이드 생성하기`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-black mb-1 underline-offset-2 hover:underline">
                                      {attraction}
                                    </h5>
                                    {description && (
                                      <p className="text-xs text-[#555555] font-light leading-relaxed line-clamp-3">
                                        {description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* 정보 표시 영역 */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-end">
                            <div className="flex items-center text-sm font-light text-[#555555]">
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

            {/* 지역 상세 페이지 링크 - 카드 하단 중앙 배치 */}
            <div className="mt-10 sm:mt-12 px-4 sm:px-6">
              <div className="bg-[#F8F8F8] rounded-2xl p-4 sm:p-5 lg:p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 max-w-2xl mx-auto text-center">
                <div className="space-y-2 sm:space-y-3">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-fluid-lg sm:text-fluid-xl font-semibold text-black leading-tight">
                      {activeRegion === 'korea' && '한국 여행지 전체보기'}
                      {activeRegion === 'europe' && '유럽 여행지 전체보기'}
                      {activeRegion === 'asia' && '아시아 여행지 전체보기'}
                      {activeRegion === 'americas' && '아메리카 여행지 전체보기'}
                    </h3>
                    
                    <p className="text-fluid-sm text-[#555555] font-light leading-relaxed max-w-md mx-auto">
                      {activeRegion === 'korea' && '모든 인기 명소와 숨은 보석 같은 장소들을 발견해보세요'}
                      {activeRegion === 'europe' && '유럽 각국의 역사적 명소와 문화 유산을 탐험해보세요'}
                      {activeRegion === 'asia' && '아시아의 다채로운 문화와 아름다운 자연을 만나보세요'}
                      {activeRegion === 'americas' && '남북 아메리카의 웅장한 자연과 도시를 경험해보세요'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/regions/${activeRegion}`)}
                    className="group inline-flex items-center justify-center bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-fluid-sm sm:text-fluid-base font-semibold hover:bg-gray-800 focus:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 min-w-[160px] sm:min-w-[200px] shadow-lg hover:shadow-xl"
                  >
                    <span className="leading-none">
                      더 많은 명소 보기
                    </span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
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
        helpUrl="https://t.me/docenttour"
      />

      {/* Footer with Legal Links */}
      <footer className="relative z-10 bg-[#F8F8F8] border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Service Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-black mb-4">{t('footer.companyName')}</h3>
              <p className="text-sm text-[#555555] font-light mb-4">
                {t('footer.companyDescription')}
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">{t('footer.copyright')}</span>
              </div>
            </div>

            {/* Legal Pages */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">{t('footer.legalInfo')}</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/legal/privacy" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/terms" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.termsOfService')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/about" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.aboutUs')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/legal/contact" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.contact')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">{t('footer.services.title')}</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/audio-guide" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.services.audioGuide')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/docent" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.services.docent')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/tour-radio" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.services.tourRadio')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/travel-radio" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.services.travelRadio')}
                  </a>
                </li>
              </ul>
            </div>

            {/* 여행 도구 */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">{t('footer.tools.title')}</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/trip-planner" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.tools.tripPlanner')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/nomad-calculator" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.tools.nomadCalculator')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/film-locations" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.tools.filmLocations')}
                  </a>
                </li>
                <li>
                  <a 
                    href="/visa-checker" 
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.tools.visaChecker')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://t.me/docenttour" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#555555] font-light hover:text-black transition-colors"
                  >
                    {t('footer.telegramChannel')}
                  </a>
                </li>
                <li>
                  <span className="text-sm text-[#555555] font-light">
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
    </>
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