'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 지원 언어 타입
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es';

// 언어 설정 인터페이스
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  flag: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  fontFamily?: string;
}

// 지원 언어 목록
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { 
    code: 'ko', 
    name: '한국어', 
    flag: '🇰🇷', 
    nativeName: '한국어',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-kr)'
  },
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸', 
    nativeName: 'English',
    dir: 'ltr',
    fontFamily: 'var(--font-inter)'
  },
  { 
    code: 'ja', 
    name: '日本語', 
    flag: '🇯🇵', 
    nativeName: '日本語',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-jp)'
  },
  { 
    code: 'zh', 
    name: '中文', 
    flag: '🇨🇳', 
    nativeName: '中文',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-sc)'
  },
  { 
    code: 'es', 
    name: 'Español', 
    flag: '🇪🇸', 
    nativeName: 'Español',
    dir: 'ltr',
    fontFamily: 'var(--font-inter)'
  },
];

// 번역 데이터 타입
interface Translations {
  header: {
    title: string;
    language: string;
    login: string;
    logout: string;
    history: string;
    profile: string;
    settings: string;
  };
  navigation: {
    home: string;
    guides: string;
    favorites: string;
    about: string;
    contact: string;
  };
  home: {
    brandTitle: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    popularDestinations: string;
    description: string;
    features: {
      realTime: string;
      personalized: string;
      multiLanguage: string;
      offline: string;
    };
  };
  guide: {
    overview: string;
    route: string;
    realTimeGuide: string;
    play: string;
    pause: string;
    stop: string;
    next: string;
    previous: string;
    startingLocation: string;
    viewOnGoogleMaps: string;
    keyFacts: string;
    duration: string;
    difficulty: string;
    season: string;
    nextMove: string;
    downloadAudio: string;
    share: string;
  };
  search: {
    recentSearches: string;
    suggestions: string;
    noResults: string;
    searching: string;
    clear: string;
  };
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    retry: string;
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    back: string;
    close: string;
    yes: string;
    no: string;
  };
  date: {
    today: string;
    yesterday: string;
    daysAgo: string;
    weeksAgo: string;
    invalidDate: string;
  };
  profile: {
    mypage: string;
    account: string;
    preferences: string;
  };
  languages: Record<SupportedLanguage, string>;
}

// 기본 번역 데이터 (한국어)
const DEFAULT_TRANSLATIONS: Translations = {
  header: {
    title: 'NAVI',
    language: '언어',
    login: '로그인',
    logout: '로그아웃',
    history: '검색 기록',
    profile: '프로필',
    settings: '설정'
  },
  navigation: {
    home: '홈',
    guides: '가이드',
    favorites: '즐겨찾기',
    about: '소개',
    contact: '문의'
  },
  home: {
    brandTitle: '내손안의',
    title: '내손안의 도슨트',
    subtitle: '개인 맞춤형 여행 가이드를 AI가 실시간으로 생성해드립니다',
    searchPlaceholder: '어디로 떠나고 싶으신가요?',
    searchButton: '가이드 생성',
    popularDestinations: '인기 여행지',
    description: 'AI가 실시간으로 생성하는 독특한 여행 가이드를 만나보세요',
    features: {
      realTime: '실시간가이드',
      personalized: '맞춤형추천',
      multiLanguage: '다국어지원',
      offline: '오프라인사용'
    }
  },
  guide: {
    overview: '투어 개요',
    route: '추천 관람순서',
    realTimeGuide: '실시간 오디오 가이드',
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    next: '다음',
    previous: '이전',
    startingLocation: '시작 위치',
    viewOnGoogleMaps: '구글맵에서 보기',
    keyFacts: '핵심 정보',
    duration: '소요시간',
    difficulty: '난이도',
    season: '추천 계절',
    nextMove: '다음으로 이동',
    downloadAudio: '오디오 다운로드',
    share: '공유하기'
  },
  search: {
    recentSearches: '최근 검색',
    suggestions: '추천 검색어',
    noResults: '검색 결과가 없습니다',
    searching: '검색 중...',
    clear: '지우기'
  },
  errors: {
    networkError: '네트워크 연결을 확인해주세요',
    serverError: '서버 오류가 발생했습니다',
    notFound: '페이지를 찾을 수 없습니다',
    retry: '다시 시도'
  },
  common: {
    loading: '로딩 중...',
    save: '저장',
    cancel: '취소',
    confirm: '확인',
    delete: '삭제',
    edit: '편집',
    back: '뒤로',
    close: '닫기',
    yes: '예',
    no: '아니오'
  },
  date: {
    today: '오늘',
    yesterday: '어제',
    daysAgo: '{days}일 전',
    weeksAgo: '{weeks}주 전',
    invalidDate: '잘못된 날짜'
  },
  profile: {
    mypage: '마이페이지',
    account: '계정 관리',
    preferences: '환경설정'
  },
  languages: {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español'
  }
};

// Context 타입
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  currentConfig: LanguageConfig;
  setLanguage: (language: SupportedLanguage) => void;
  t: Translations;
  isLoading: boolean;
  isRTL: boolean;
  detectBrowserLanguage: () => SupportedLanguage;
}

// Context 생성
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 브라우저 언어 감지 함수
const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'ko';
  
  const browserLang = navigator.language.toLowerCase();
  const langCode = browserLang.split('-')[0];
  
  const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
  return supportedCodes.includes(langCode as SupportedLanguage) 
    ? langCode as SupportedLanguage 
    : 'ko';
};

// 번역 데이터 로드 함수
async function loadTranslations(language: SupportedLanguage): Promise<Translations> {
  try {
    const cacheKey = `translations-${language}`;
    
    // 세션 스토리지에서 캐시 확인
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          console.log(`✅ 캐시에서 ${language} 번역 로드`);
          return parsedCache;
        } catch (parseError) {
          console.warn('캐시 파싱 오류, 새로 로드:', parseError);
        }
      }
    }

    // 통합 번역 파일에서 로드
    const response = await fetch('/locales/translations.json', {
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.warn('통합 번역 파일 로드 실패, 기본값 사용');
      return DEFAULT_TRANSLATIONS;
    }
    
    const allTranslations = await response.json();
    const translations = allTranslations[language] || allTranslations['ko'];
    
    // 안전성 보장
    const safeTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...translations,
      search: {
        ...DEFAULT_TRANSLATIONS.search,
        ...(translations?.search || {})
      }
    };
    
    // 세션 스토리지에 캐시 저장
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(safeTranslations));
      } catch (storageError) {
        console.warn('세션 스토리지 저장 실패:', storageError);
      }
    }
    
    console.log(`✅ ${language} 번역 파일 로드 완료`);
    return safeTranslations;
    
  } catch (error) {
    console.error(`${language} 번역 로드 오류:`, error);
    return DEFAULT_TRANSLATIONS;
  }
}

// Provider 컴포넌트
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('ko');
  const [translations, setTranslations] = useState<Translations>(() => {
    return {
      ...DEFAULT_TRANSLATIONS,
      search: {
        ...DEFAULT_TRANSLATIONS.search
      }
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 현재 언어 설정 정보
  const currentConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const isRTL = currentConfig.dir === 'rtl';

  // 언어 변경 함수
  const setLanguage = async (language: SupportedLanguage) => {
    setIsLoading(true);
    try {
      const newTranslations = await loadTranslations(language);
      setTranslations(newTranslations);
      setCurrentLanguage(language);
      
      // 클라이언트 사이드에서만 localStorage 접근
      if (isClient && typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', language);
        
        // HTML dir 속성 업데이트
        const config = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
        if (config) {
          document.documentElement.dir = config.dir;
          document.documentElement.lang = language;
          
          // 폰트 패밀리 업데이트
          if (config.fontFamily) {
            document.documentElement.style.setProperty('--current-font', config.fontFamily);
          }
        }
      }
      
      console.log(`✅ 언어 변경 완료: ${language}`);
    } catch (error) {
      console.error('언어 변경 실패:', error);
      setTranslations({
        ...DEFAULT_TRANSLATIONS,
        search: { ...DEFAULT_TRANSLATIONS.search }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 언어 설정 및 번역 로드
  useEffect(() => {
    if (!isClient) return;

    const initializeLanguage = async () => {
      let initialLanguage: SupportedLanguage = 'ko';
      
      // localStorage에서 저장된 언어 확인
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage;
        if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
          initialLanguage = savedLanguage;
        } else {
          // 브라우저 언어 감지
          initialLanguage = detectBrowserLanguage();
        }
      }

      await setLanguage(initialLanguage);
    };

    initializeLanguage();
  }, [isClient]);

  // DOM 업데이트 (언어 변경시)
  useEffect(() => {
    if (!isClient) return;
    
    const config = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    if (config) {
      document.documentElement.dir = config.dir;
      document.documentElement.lang = currentLanguage;
      
      if (config.fontFamily) {
        document.documentElement.style.setProperty('--current-font', config.fontFamily);
      }
    }
  }, [currentLanguage, isClient]);

  const contextValue: LanguageContextType = {
    currentLanguage,
    currentConfig,
    setLanguage,
    t: translations,
    isLoading: isLoading && isClient,
    isRTL,
    detectBrowserLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom Hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 번역 함수 헬퍼
export function getTranslation(translations: Translations, key: string): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`번역 키를 찾을 수 없습니다: ${key}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// 언어별 URL 생성 헬퍼
export function getLocalizedUrl(path: string, language: SupportedLanguage): string {
  if (language === 'ko') return path;
  return `/${language}${path}`;
}