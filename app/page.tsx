'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Component, ReactNode, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Globe, Camera, Heart, MapPin, Star, Calculator, Plane, CheckCircle, Film, Coffee, Briefcase, Users } from 'lucide-react';

import StructuredData from '@/components/seo/StructuredData';
import GuideLoading from '@/components/ui/GuideLoading';

// Dynamic imports for performance optimization
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

// NextLevelSearchBox - Critical component, but can be lazy loaded
const NextLevelSearchBox = dynamic(() => import('@/components/home/NextLevelSearchBox'), {
  ssr: true,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto px-4 animate-pulse">
      <div className="relative bg-gray-200 rounded-lg h-16"></div>
    </div>
  )
});

// 에러 바운더리 클래스 컴포넌트
class ErrorBoundary extends Component<
  { 
    children: ReactNode; 
    fallback?: (error: Error, reset: () => void) => ReactNode;
    t: (key: string, params?: Record<string, string>) => string | string[];
  },
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
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">{String(this.props.t('errors.generalError'))}</h2>
              <p className="text-gray-600 dark:text-gray-400 font-light mb-6">{String(this.props.t('home.alerts.unexpectedError') || this.props.t('errors.generalError'))}</p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{this.state.error.message}</p>
              </div>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary w-full py-3 px-6 rounded-lg font-medium"
            >
              {String(this.props.t('common.tryAgain'))}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


// 타입 정의 추가
interface TranslatedSuggestion {
  name: string;
  location: string;
  id?: string;
  score?: number;
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
  
  // 언어 변경 시 강제 리렌더링을 위한 key 추가
  const [renderKey, setRenderKey] = useState(0);
  
  // 드롭다운 아코디언 효과를 위한 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  
  // 🔥 전역 언어 변경 이벤트 수신
  useEffect(() => {
    const handleLanguageChanged = (event: CustomEvent) => {
      console.log('🔄 홈페이지: 언어 변경 이벤트 수신:', event.detail);
      setRenderKey(prev => prev + 1);
      
    };

    // 기존 언어 변경 감지
    setRenderKey(prev => prev + 1);
    
    // 드롭다운 이벤트 리스너 등록
    const handleDropdownOpen = () => setIsDropdownOpen(true);
    const handleDropdownClose = () => setIsDropdownOpen(false);
    
    // 전역 이벤트 리스너 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', handleLanguageChanged as EventListener);
      window.addEventListener('searchDropdownOpen', handleDropdownOpen);
      window.addEventListener('searchDropdownClose', handleDropdownClose);
      
      return () => {
        window.removeEventListener('languageChanged', handleLanguageChanged as EventListener);
        window.removeEventListener('searchDropdownOpen', handleDropdownOpen);
        window.removeEventListener('searchDropdownClose', handleDropdownClose);
      };
    }
    
    // cleanup 함수가 없는 경우를 위한 빈 함수 반환
    return () => {};
  }, [currentLanguage]);
  
  // URL 파라미터 처리를 위한 상태 추가
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  
  // 상태 관리
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  
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
          description: countries.busan?.description || '아름다운 항구의 도시'
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
  const LANDMARK_ASPECT_RATIO = 21 / 9;

  const landmarks = useMemo(() => [
    t('home.countries.france.attractions.0'),
    t('home.countries.italy.attractions.0'),
    t('home.countries.india.attractions.0'),
    t('home.countries.usa.attractions.0'),
    t('home.countries.seoul.attractions.0'),
    t('home.countries.peru.attractions.0'),
    t('home.countries.spain.attractions.0')
  ], [t]);

  // 명소별 배경 이미지 매핑 (개발환경 캐시 버스팅 포함)
  const landmarkImages = useMemo(() => {
    const isDev = process.env.NODE_ENV === 'development';
    // 캐시 버스팅을 위한 고정 타임스탬프 (컴포넌트 마운트 시점)
    const cacheBuster = isDev ? `?t=${1723122651000}` : ''; // 고정 타임스탬프 사용
    
    // 번역 함수에서 문자열 추출
    const getTranslationString = (key: string): string => {
      const result = t(key);
      return Array.isArray(result) ? result[0] || key : result || key;
    };

    return {
      [getTranslationString('home.countries.france.attractions.0')]: `/images/landmarks/eiffel-tower.webp${cacheBuster}`,
      [getTranslationString('home.countries.italy.attractions.0')]: `/images/landmarks/colosseum.webp${cacheBuster}`,
      [getTranslationString('home.countries.india.attractions.0')]: `/images/landmarks/taj-mahal.webp${cacheBuster}`,
      [getTranslationString('home.countries.usa.attractions.0')]: `/images/landmarks/statue-of-liberty.webp${cacheBuster}`,
      [getTranslationString('home.countries.seoul.attractions.0')]: `/images/landmarks/gyeongbokgung.webp${cacheBuster}`,
      [getTranslationString('home.countries.peru.attractions.0')]: `/images/landmarks/machu-picchu.webp${cacheBuster}`,
      [getTranslationString('home.countries.spain.attractions.0')]: `/images/landmarks/sagrada-familia.webp${cacheBuster}`
    };
  }, [t]);

  const [currentLandmarkIndex, setCurrentLandmarkIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  const [imageMeta, setImageMeta] = useState<Record<string, { width: number; height: number }>>({});
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportAspect, setViewportAspect] = useState<number>(() => {
    if (typeof window === 'undefined') {
      return 16 / 9;
    }
    return window.innerWidth / window.innerHeight;
  });

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    const updateAspect = () => {
      setViewportAspect(window.innerWidth / window.innerHeight);
    };
    updateAspect();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateAspect);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateAspect);
    };
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
          const landmarkKey = Array.isArray(landmark) ? landmark[0] : landmark;
          
          const handleLoad = () => {
            console.log(`✅ 이미지 로드 성공: ${landmarkKey} (${landmarkImages[landmarkKey]})`);
            setImageMeta(prev => {
              const current = prev[landmarkKey];
              if (current && current.width === img.naturalWidth && current.height === img.naturalHeight) {
                return prev;
              }
              return {
                ...prev,
                [landmarkKey]: {
                  width: img.naturalWidth || 1,
                  height: img.naturalHeight || 1
                }
              };
            });
            resolve();
          };
          
          const handleError = (e: Event) => {
            console.error(`❌ 이미지 로드 실패: ${landmarkKey}`, {
              src: landmarkImages[landmarkKey],
              error: e,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            setImageLoadErrors(prev => new Set([...prev, landmarkKey]));
            resolve();
          };
          
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          
          // 캐시 무시하고 항상 새로 로드
          img.crossOrigin = 'anonymous'; // CORS 이슈 방지
          
          img.src = landmarkImages[landmarkKey];
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
      const pngImage = landmarkImages[landmark].replace('.webp', '.png');
      return {
        background: `linear-gradient(135deg, rgba(40, 45, 80, 0.35) 0%, rgba(60, 65, 100, 0.25) 100%)`,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.14), rgba(0,0,0,0.22)), url('${pngImage}'), linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)`,
        backgroundSize: 'cover, cover, cover',
        backgroundPosition: 'center center, center 48%, center center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    const meta = imageMeta[landmark];
    const baseStyle = {
      background: `linear-gradient(135deg, rgba(40, 45, 80, 0.35) 0%, rgba(60, 65, 100, 0.25) 100%)`,
      backgroundImage: `linear-gradient(rgba(0,0,0,0.14), rgba(0,0,0,0.22)), url('${landmarkImages[landmark]}')`,
      backgroundRepeat: 'no-repeat'
    };

    if (!viewportAspect) {
      return {
        ...baseStyle,
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center center, center 48%'
      };
    }

    const imageAspect = meta && meta.width && meta.height
      ? meta.width / Math.max(meta.height, 1)
      : LANDMARK_ASPECT_RATIO;

    // 화면이 더 넓거나 이미지가 매우 와이드인 경우 상단 초점 유지
    const shouldOffsetFocus = imageAspect >= LANDMARK_ASPECT_RATIO || viewportAspect > imageAspect;
    const focusPosition = shouldOffsetFocus ? 'center 48%' : 'center center';

    return {
      ...baseStyle,
      backgroundSize: 'cover, cover',
      backgroundPosition: `center center, ${focusPosition}`
    };
  }, [imageLoadErrors, imageMeta, landmarkImages, viewportAspect]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 필수 State 변수들 추가
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TranslatedSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [currentLoadingQuery, setCurrentLoadingQuery] = useState('');

  // 캐시 참조
  const suggestionCacheRef = useRef(new Map());
  const fetchSuggestionsRef = useRef<((query: string) => Promise<void>) | null>(null);

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
      const apiUrl = `/api/locations/${currentLanguage}/search?q=${encodeURIComponent(searchQuery)}`;
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
  useEffect(() => {
    fetchSuggestionsRef.current = fetchSuggestions;
  }, [fetchSuggestions]);


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
      
      const searchResponse = await fetch(`/api/locations/${currentLanguage}/search?q=${encodeURIComponent(query.trim())}`);
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
      // 🚀 새 URL 구조: /guide/[language]/[location]
      router.push(`/guide/${currentLanguage}/${encodeURIComponent(query.trim())}`);
      
    } catch (error) {
      console.error('❌ 엔터 입력 처리 오류 (page.tsx):', error);
      
      // 오류 발생 시 기본 처리
      // 🚀 새 URL 구조: /guide/[language]/[location]
      router.push(`/guide/${currentLanguage}/${encodeURIComponent(query.trim())}`);
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
          // 🚀 새 URL 구조: /guide/[language]/[location]
          router.push(`/guide/${currentLanguage}/${encodeURIComponent(selectedSuggestion.name)}`);
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
          // 🚀 새 URL 구조: /guide/[language]/[location]/tour
          router.push(`/guide/${currentLanguage}/${encodeURIComponent(location)}/tour`);
          
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
    // 🚀 새 URL 구조: /guide/[language]/[location]/tour
    router.push(`/guide/${currentLanguage}/${encodeURIComponent(query.trim())}/tour`);
  }, [query, audioPlaying, router, t, setLoadingState, currentLanguage, showError]);


  // 가이드 생성 중일 때 모노크롬 로딩 화면 표시
  if (isAnyLoading) {
    const currentLoadingType = Object.entries(loadingStates).find(([_, loading]) => loading)?.[0] || 'search';
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
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
      <div 
        className="min-h-screen bg-white dark:bg-gray-950 font-sans relative transition-colors duration-300" 
        style={{ 
          '--space-2xs': '4px', 
          '--space-xs': '8px', 
          '--space-sm': '12px', 
          '--space-md': '16px', 
          '--space-lg': '24px', 
          '--space-xl': '40px', 
          '--space-2xl': '64px',
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none'
        } as React.CSSProperties}
      >

      {/* SEO Structured Data는 layout.tsx에서 통합 관리됨 */}
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
      <main id="main-content" className="relative" tabIndex={-1}>
        {/* Hero Section - 예시와 동일한 구조 */}
        <section
          className="relative min-h-[50vh] xs:min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex items-center justify-center"
          aria-labelledby="hero-heading"
          style={{
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            width: '100vw'
          }}
        >
          {/* Background Image - 예시와 동일하게 섹션 내부에 */}
          <div className="absolute inset-0 overflow-hidden">
            {landmarks.map((landmark, index) => {
              const landmarkKey = Array.isArray(landmark) ? landmark[0] : landmark;
              return (
              <div
                key={landmarkKey}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentLandmarkIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={getBackgroundStyle(landmarkKey)}
              />
              );
            })}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10" />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/8 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ transform: 'translateY(-4px)' }}>
            
            {/* Badge */}
            <div className="inline-flex items-center px-3 xs:px-4 sm:px-4 md:px-3 py-1.5 xs:py-2 sm:py-2 md:py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-8 xs:mb-12 sm:mb-12 md:mb-12 mt-4 xs:mt-6 sm:mt-6 md:mt-6">
              <span className="text-xs xs:text-sm sm:text-sm md:text-sm font-medium text-white/90">{String(t('home.audioGuidePrefix')).split(' | ')[0] || 'AI 오디오가이드'}</span>
              <span className="mx-2 text-white/50">•</span>
              <span className="text-xs xs:text-sm sm:text-sm md:text-sm font-medium text-white/90">{String(t('home.audioGuidePrefix')).split(' | ')[1] || '무료 체험'}</span>
            </div>

            {/* 중앙 명소 텍스트 - 2줄 레이아웃 (명소 부분만 회전) */}
            <div className="text-center text-white mb-18 w-full flex flex-col items-center justify-center">
              <h1 id="hero-heading" className="sr-only">
                {t('home.pageTitle') || 'TripRadio.AI - AI 오디오가이드 여행 서비스'}
              </h1>
              {/* 명소 제목 - 1.5배 크기, 예시 스타일 (그림자 제거) */}
              <div className="font-bold mb-2 flex items-center justify-center w-full" style={{ 
                fontSize: isMobile 
                  ? 'clamp(1.4625rem, 5.2vw, 1.95rem)'  // 1.3배 크기: 모바일 23.4px ~ 31.2px
                  : 'clamp(2.4375rem, 3.4vw, 2.4375rem)',   // 1.3배 크기: PC 39px
                height: isMobile ? '86px' : '72px'  // 10% 증가한 높이로 조정
              }}>
                <span className="inline-block overflow-hidden whitespace-nowrap w-full max-w-none" style={{ 
                  height: isMobile ? '86px' : '72px',  // 컨테이너 높이와 일치
                  lineHeight: isMobile ? '86px' : '72px',  // 라인 높이도 일치
                  textAlign: 'center'
                }}>
                  <span 
                    className="inline-block transition-transform duration-1000 ease-out w-full"
                    style={{
                      transform: `translateY(-${currentLandmarkIndex * (isMobile ? 86 : 72)}px)`,  // Transform도 높이와 일치
                      letterSpacing: '0.04em'  // 1.3배 크기에 맞춰 자간 약간 줄임
                    }}
                  >
                    {landmarks.map((landmark, index) => (
                      <span key={index} className="block font-bold whitespace-nowrap w-full" style={{ 
                        height: isMobile ? '86px' : '72px',  // 각 항목 높이도 일치
                        lineHeight: isMobile ? '86px' : '72px',  // 라인 높이도 일치
                        textAlign: 'center',
                        fontSize: isMobile ? '2.08em' : '1.69em', // 1.3배 크기 (1.6em × 1.3, 1.3em × 1.3)
                        letterSpacing: '0.04em'  // 크기에 맞춰 자간 조정
                      }}>
                        {landmark}
                      </span>
                    ))}
                  </span>
                </span>
              </div>
              <div className="text-base xs:text-base sm:text-base md:text-base lg:text-lg font-light text-gray-300 px-4 text-center" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                {t('home.subtitle')} {t('home.subtitle2')}
              </div>

              {/* 헤더는 유지하고, 홈 히어로에 명확한 탐색 CTA만 추가 */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/guide"
                  className="inline-flex items-center justify-center bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  {currentLanguage === 'ko' ? '여행가이드 보기' : 'Browse Guides'}
                </Link>
                <Link
                  href="/podcast"
                  className="inline-flex items-center justify-center bg-black/80 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors"
                >
                  {currentLanguage === 'ko' ? '팟캐스트 듣기' : 'Browse Podcasts'}
                </Link>
              </div>
            </div>

          {/* Feature Steps - 히어로 섹션 내부 */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 xs:mb-8">
            {/* 모바일: 축약형 가로 배치, 데스크톱: 기존 세로 상세형 */}
            <div className="sm:hidden">
              {/* 모바일 전용 축약형 스텝 인디케이터 */}
              <div className="flex items-center justify-center space-x-6 py-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white text-center">장소입력</span>
                </div>
                
                {/* 연결 화살표 */}
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white text-center">AI생성</span>
                </div>

                {/* 연결 화살표 */}
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-white text-center">오디오재생</span>
                </div>
              </div>
            </div>

            {/* 데스크톱: 기존 상세형 유지 */}
            <div className="hidden sm:grid grid-cols-3 gap-4 md:gap-6">
              <div className="flex items-center justify-center space-x-3 py-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white text-sm">{t('home.stepTitles.inputLocation') || '장소 입력'}</h3>
                  <p className="text-xs text-white/70">{t('home.stepDescriptions.inputLocation') || '방문할 여행지나 관광명소를 입력하세요'}</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 py-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white text-sm">{t('home.stepTitles.aiGenerate') || 'AI 가이드 생성'}</h3>
                  <p className="text-xs text-white/70">{t('home.stepDescriptions.aiGenerate') || 'AI가 개인 맞춤형 가이드를 자동으로 생성해드려요'}</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 py-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white text-sm">{t('home.stepTitles.audioPlay') || '오디오 투어 시작'}</h3>
                  <p className="text-xs text-white/70">{t('home.stepDescriptions.audioPlay') || '생성된 가이드로 몰입감 있는 오디오 투어를 즐기세요'}</p>
                </div>
              </div>
            </div>
          </div>


          {/* Enhanced Search Box with all advanced features */}
          <div className="relative max-w-7xl mx-auto mb-6 xs:mb-8 sm:mb-6 px-4 sm:px-6 lg:px-8" style={{ transform: 'translateY(4px)' }}>
            <div className="max-w-2xl xs:max-w-2xl sm:max-w-xl md:max-w-xl mx-auto">
              <NextLevelSearchBox />
            </div>
          </div>

          </div>
        </section>

        {/* Regional Countries Section */}
        <section 
          id="popular-countries-section"
          className="hero-section relative z-[1] py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 transition-all duration-300 ease-out" 
          aria-labelledby="popular-destinations-heading"
          style={{ 
            marginTop: isDropdownOpen 
              ? (typeof window !== 'undefined' && window.innerWidth < 640) ? '280px' : '320px' // 모바일에서는 더 작은 마진
              : '0px' // 드롭다운 열릴 때 아코디언 효과
          }}
        >
          <div className="max-w-6xl mx-auto px-4 xs:px-6 sm:px-6 md:px-8">
            
            {/* 섹션 제목 */}
            <div className="text-center mb-0 xs:mb-0 sm:mb-0">
              <h2 id="popular-destinations-heading" className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white mb-2 xs:mb-3 sm:mb-2">
                {t('home.regionTitles.popularCountries')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto text-sm xs:text-base sm:text-sm px-4 xs:px-0">
                {t('home.regionDescription')}
              </p>
            </div>
            
            {/* 지역별 탭 */}
            <div className="flex justify-center mb-4 xs:mb-6 sm:mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-xs xs:max-w-sm sm:max-w-md" role="tablist" aria-label="지역 선택">
                <div className="grid grid-cols-2 gap-1 xs:flex xs:space-x-1 xs:grid-cols-none sm:grid sm:grid-cols-2 sm:gap-1 sm:space-x-0">
                  {[
                    { id: 'korea', label: t('home.regionTitles.korea') || '한국' },
                    { id: 'europe', label: t('home.regionTitles.europe') || '유럽' },
                    { id: 'asia', label: t('home.regionTitles.asia') || '아시아' },
                    { id: 'americas', label: t('home.regionTitles.americas') || '미주' }
                  ].map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setActiveRegion(region.id)}
                      className={`
                        px-3 xs:px-6 sm:px-4 md:px-5 py-2 xs:py-2 sm:py-2.5 rounded-lg xs:rounded-xl sm:rounded-md md:rounded-lg text-xs xs:text-sm sm:text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black min-h-[44px] text-center
                        ${activeRegion === region.id
                          ? 'bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white shadow-sm'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:text-gray-900 dark:hover:text-gray-200'
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
              className="overflow-x-auto pb-4 px-4 xs:px-6 sm:px-4 md:px-6 scrollbar-hide"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              }}
              role="tabpanel"
              id={`${activeRegion}-panel`}
              aria-labelledby={`${activeRegion}-tab`}
            >
              <div className="flex gap-4 xs:gap-6 sm:gap-3 md:gap-4 min-w-max scroll-smooth">
                {regionCountries[activeRegion as keyof typeof regionCountries].map((country, index) => (
                  <div
                    key={country.id}
                    className="flex-shrink-0 w-56 xs:w-64 sm:w-48 md:w-56 group"
                  >
                    {/* 메인 카드 - 모던 모노크롬 스타일 */}
                    <div className="destination-card relative overflow-hidden group bg-white dark:bg-dark-surface-2 border border-gray-200 dark:border-dark-border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      
                      {/* 상단 모노크롬 헤더 */}
                      <div className="relative h-20 xs:h-24 sm:h-16 md:h-20 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-600 flex items-center justify-center rounded-t-lg">
                        <h3 className="text-white text-lg xs:text-xl sm:text-base md:text-lg font-bold px-2 text-center">{country.name}</h3>

                      </div>

                      {/* 카드 콘텐츠 - 모노크롬 스타일 */}
                      <div className="p-4 xs:p-6 sm:p-4 md:p-5">
                        {/* 설명 */}
                        <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm sm:text-xs md:text-sm mb-4 xs:mb-6 sm:mb-4 md:mb-5 leading-relaxed">
                          {country.description}
                        </p>

                        {/* Attractions */}
                        <div className="space-y-2 xs:space-y-3 sm:space-y-2 md:space-y-2.5 mb-4 xs:mb-6 sm:mb-4 md:mb-5">
                          <h4 className="text-xs xs:text-sm sm:text-xs md:text-xs font-semibold text-black dark:text-white uppercase tracking-wide">
                            Top Attractions
                          </h4>
                          <div className="space-y-1.5 xs:space-y-2 sm:space-y-1 md:space-y-1.5">
                            {country.attractions.slice(0, 3).map((attraction, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center space-x-2 xs:space-x-3 sm:space-x-2 md:space-x-2.5 group/item cursor-pointer min-h-[40px] xs:min-h-[44px] sm:min-h-[40px] -my-1 py-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLoadingState('country', true);
                                  
                                  // 🚀 새로운 URL 구조: /guide/[language]/[location]
                                  let url = `/guide/${currentLanguage}/${encodeURIComponent(attraction)}`;
                                  if (country.id === 'thailand' && attraction === '방콕 대왕궁') {
                                    url += '?parent=' + encodeURIComponent('방콕');
                                  }
                                  
                                  router.push(url);
                                }}
                              >
                                <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-1 sm:h-1 md:w-1 md:h-1 bg-black dark:bg-white rounded-full group-hover/item:scale-125 transition-transform flex-shrink-0" />
                                <span className="text-xs xs:text-sm sm:text-xs md:text-xs text-gray-700 dark:text-gray-300 group-hover/item:text-black dark:group-hover/item:text-white transition-colors leading-tight">
                                  {attraction}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 xs:pt-4 sm:pt-2 md:pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-1 md:space-x-1.5 text-gray-500 dark:text-gray-400">
                              <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-xs xs:text-sm sm:text-xs md:text-xs text-gray-500 dark:text-gray-400">{t('home.clickAttraction')}</span>
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
            <div className="flex justify-center mt-6 xs:mt-8 sm:hidden md:hidden">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 xs:px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4-4m-4 4v12" />
                </svg>
                <span className="font-medium text-gray-500 dark:text-gray-400">{t('home.scrollHint')}</span>
              </div>
            </div>

            {/* 더 많은 명소 보기 버튼 */}
            <div className="mt-0 xs:mt-0 sm:mt-0 md:mt-0 px-4 xs:px-8 sm:px-4 md:px-6 text-center">
              <Link
                href="/destinations"
                className="btn-primary group inline-flex items-center justify-center px-6 xs:px-8 sm:px-4 md:px-6 py-3 xs:py-3 sm:py-2.5 md:py-2.5 rounded-lg text-sm xs:text-base sm:text-sm md:text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[48px] shadow-lg md:hover:shadow-xl lg:hover:shadow-xl"
              >
                <span className="leading-none">
                  {t('home.viewMoreAttractions')}
                </span>
                <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-4 sm:h-4 md:w-4 md:h-4 ml-2 transition-transform duration-300 md:group-hover:translate-x-1 lg:group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
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
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white flex items-center justify-center" style={{ borderRadius: '6px' }}>
                  <span className="text-black font-bold">T</span>
                </div>
                <h2 className="text-xl font-bold">TripRadio.AI</h2>
              </div>
              <p className="text-gray-400 text-sm">
                {t('footer.companyDescription')}
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">{t('footer.services.title')}</h3>
              <div className="space-y-2">
                <a 
                  href="/audio-guide"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('footer.services.audioGuide')}
                </a>
                <a 
                  href="/docent"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('footer.services.docent')}
                </a>
                <a 
                  href="/tour-radio"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {t('footer.services.tourRadio')}
                </a>
                <a 
                  href="/travel-radio"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('footer.services.travelRadio')}
                </a>
              </div>
            </div>

            {/* Travel Tools */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">{t('footer.tools.title')}</h3>
              <div className="space-y-2">
                <a 
                  href="/ai-trip-planner"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  {t('footer.tools.tripPlanner')}
                </a>
                <a 
                  href="/nomad-calculator"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {t('footer.tools.nomadCalculator')}
                </a>
                <a 
                  href="/visa-checker"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('footer.tools.visaChecker')}
                </a>
                <a 
                  href="/film-locations"
                  className="flex items-center text-gray-400 hover:text-white p-0 h-auto transition-colors"
                >
                  <Film className="w-4 h-4 mr-2" />
                  {t('footer.tools.filmLocations')}
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <div className="pt-4">
                <h4 className="font-medium text-white text-sm mb-2">{t('footer.support')}</h4>
                <div className="space-y-1">
                  <a 
                    href="https://t.me/docenttour" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {t('footer.telegramChannel')}
                  </a>
                  <div className="text-gray-400 text-xs">
                    {t('footer.supportHours')}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {t('footer.services.helpCenter')}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {t('footer.services.feedback')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="/legal/ads-revenue" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.services.adsRevenue')}
              </a>
              <a href="/legal/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.privacyPolicy')}
              </a>
              <a href="/legal/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.termsOfService')}
              </a>
              <span className="text-gray-400 text-sm">{t('footer.adsensePolicy')}</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

// ErrorBoundary로 감싸진 메인 컴포넌트
export default function HomePage() {
  const { t } = useLanguage();
  
  return (
    <ErrorBoundary t={t}>
      <Home />
    </ErrorBoundary>
  );
}
