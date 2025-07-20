'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 지원 언어 타입
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es';

// 언어 설정 인터페이스 (ttsLang 필드 추가)
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  flag: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  fontFamily?: string;
  ttsLang: string; // TTS용 언어 코드 추가
}

// 지원 언어 목록 (ttsLang 추가)
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { 
    code: 'ko', 
    name: '한국어', 
    flag: '🇰🇷', 
    nativeName: '한국어',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-kr)',
    ttsLang: 'ko-KR'
  },
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸', 
    nativeName: 'English',
    dir: 'ltr',
    fontFamily: 'var(--font-inter)',
    ttsLang: 'en-US'
  },
  { 
    code: 'ja', 
    name: '日本語', 
    flag: '🇯🇵', 
    nativeName: '日本語',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-jp)',
    ttsLang: 'ja-JP'
  },
  { 
    code: 'zh', 
    name: '中文', 
    flag: '🇨🇳', 
    nativeName: '中文',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-sc)',
    ttsLang: 'zh-CN'
  },
  { 
    code: 'es', 
    name: 'Español', 
    flag: '🇪🇸', 
    nativeName: 'Español',
    dir: 'ltr',
    fontFamily: 'var(--font-inter)',
    ttsLang: 'es-ES'
  },
];

// 완전한 번역 데이터 타입
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
    subtitle2: string;
    searchPlaceholder: string;
    searchButton: string;
    popularDestinations: string;
    description: string;
    features: {
      personalizedGuides: string;
      audioNarration: string;
      offlineAccess: string;
      multiLanguage: string;
    };
  };
  guide: {
    loading: string;
    error: string;
    chapters: string;
    duration: string;
    difficulty: string;
    nextChapter: string;
    previousChapter: string;
    playAudio: string;
    pauseAudio: string;
    mapView: string;
    listView: string;
  };
  search: {
    placeholder: string;
    searching: string;
    noResults: string;
    tryAgain: string;
    suggestions: string;
    recentSearches: string;
  };
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    generalError: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
  };
  date: {
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
  };
  profile: {
    name: string;
    email: string;
    preferences: string;
    language: string;
    notifications: string;
    privacy: string;
    account: string;
    logout: string;
    mypage: string;
  };
  mypage: {
    title: string;
    overview: string;
    guides: string;
    settings: string;
    recentGuides: string;
    favoriteGuides: string;
    totalGuides: string;
    completedTours: string;
    savedLocations: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    rememberMe: string;
    loginWithGoogle: string;
    loginWithFacebook: string;
    createAccount: string;
    alreadyHaveAccount: string;
    noAccount: string;
    signin: string;
    signout: string;
  };
  buttons: {
    submit: string;
    continue: string;
    goBack: string;
    tryAgain: string;
    viewDetails: string;
  };
  languages: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    es: string;
  };
}

// 기본 번역 데이터 (한국어)
const DEFAULT_TRANSLATIONS: Translations = {
  header: {
    title: 'AI 가이드',
    language: '언어',
    login: '로그인',
    logout: '로그아웃',
    history: '히스토리',
    profile: '프로필',
    settings: '설정'
  },
  navigation: {
    home: '홈',
    guides: '가이드',
    favorites: '즐겨찾기',
    about: '소개',
    contact: '연락처'
  },
  home: {
    brandTitle: 'AI 여행 가이드',
    title: 'AI와 함께하는 스마트 여행',
    subtitle: '개인 맞춤형 가이드로 새로운 여행을 경험하세요',
    subtitle2: '어디든 검색하고 즉시 전문 가이드를 만나보세요',
    searchPlaceholder: '여행지를 검색하세요...',
    searchButton: '검색',
    popularDestinations: '인기 여행지',
    description: 'AI 기술로 생성되는 개인화된 여행 가이드',
    features: {
      personalizedGuides: '개인 맞춤 가이드',
      audioNarration: '음성 해설',
      offlineAccess: '오프라인 접근',
      multiLanguage: '다국어 지원'
    }
  },
  guide: {
    loading: '가이드 로딩 중...',
    error: '가이드를 불러올 수 없습니다',
    chapters: '챕터',
    duration: '소요시간',
    difficulty: '난이도',
    nextChapter: '다음 챕터',
    previousChapter: '이전 챕터',
    playAudio: '오디오 재생',
    pauseAudio: '오디오 일시정지',
    mapView: '지도 보기',
    listView: '목록 보기'
  },
  search: {
    placeholder: '검색어를 입력하세요',
    searching: '검색 중...',
    noResults: '검색 결과가 없습니다',
    tryAgain: '다시 시도',
    suggestions: '추천 검색어',
    recentSearches: '최근 검색'
  },
  errors: {
    networkError: '네트워크 오류가 발생했습니다',
    serverError: '서버 오류가 발생했습니다',
    notFound: '페이지를 찾을 수 없습니다',
    unauthorized: '인증이 필요합니다',
    forbidden: '접근 권한이 없습니다',
    generalError: '오류가 발생했습니다'
  },
  common: {
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    close: '닫기'
  },
  date: {
    today: '오늘',
    yesterday: '어제',
    tomorrow: '내일',
    thisWeek: '이번 주',
    lastWeek: '지난 주',
    thisMonth: '이번 달',
    lastMonth: '지난 달'
  },
  profile: {
    name: '이름',
    email: '이메일',
    preferences: '설정',
    language: '언어',
    notifications: '알림',
    privacy: '개인정보',
    account: '계정',
    logout: '로그아웃',
    mypage: '마이페이지'
  },
  mypage: {
    title: '마이페이지',
    overview: '개요',
    guides: '가이드',
    settings: '설정',
    recentGuides: '최근 가이드',
    favoriteGuides: '즐겨찾기 가이드',
    totalGuides: '전체 가이드',
    completedTours: '완료된 투어',
    savedLocations: '저장된 장소'
  },
  auth: {
    login: '로그인',
    register: '회원가입',
    email: '이메일',
    password: '비밀번호',
    confirmPassword: '비밀번호 확인',
    forgotPassword: '비밀번호 찾기',
    rememberMe: '로그인 상태 유지',
    loginWithGoogle: 'Google로 로그인',
    loginWithFacebook: 'Facebook으로 로그인',
    createAccount: '계정 만들기',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    noAccount: '계정이 없으신가요?',
    signin: '로그인',
    signout: '로그아웃'
  },
  buttons: {
    submit: '제출',
    continue: '계속',
    goBack: '돌아가기',
    tryAgain: '다시 시도',
    viewDetails: '자세히 보기'
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
  
  const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang?.code).filter(Boolean);
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

    // 통합 번역 파일에서 로드 (파일명: translations.json)
    const response = await fetch('/locales/translations.json', {
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      console.warn('번역 파일 로드 실패, 기본값 사용');
      return DEFAULT_TRANSLATIONS;
    }
    
    const allTranslations = await response.json();
    const translations = allTranslations[language] || allTranslations['ko'];
    
    // 안전성 보장 (모든 새로운 필드들 포함)
    const safeTranslations: Translations = {
      ...DEFAULT_TRANSLATIONS,
      ...translations,
      header: {
        ...DEFAULT_TRANSLATIONS.header,
        ...(translations?.header || {})
      },
      navigation: {
        ...DEFAULT_TRANSLATIONS.navigation,
        ...(translations?.navigation || {})
      },
      home: {
        ...DEFAULT_TRANSLATIONS.home,
        ...(translations?.home || {}),
        features: {
          ...DEFAULT_TRANSLATIONS.home.features,
          ...(translations?.home?.features || {})
        }
      },
      guide: {
        ...DEFAULT_TRANSLATIONS.guide,
        ...(translations?.guide || {})
      },
      search: {
        ...DEFAULT_TRANSLATIONS.search,
        ...(translations?.search || {})
      },
      errors: {
        ...DEFAULT_TRANSLATIONS.errors,
        ...(translations?.errors || {})
      },
      common: {
        ...DEFAULT_TRANSLATIONS.common,
        ...(translations?.common || {})
      },
      date: {
        ...DEFAULT_TRANSLATIONS.date,
        ...(translations?.date || {})
      },
      profile: {
        ...DEFAULT_TRANSLATIONS.profile,
        ...(translations?.profile || {})
      },
      mypage: {
        ...DEFAULT_TRANSLATIONS.mypage,
        ...(translations?.mypage || {})
      },
      auth: {
        ...DEFAULT_TRANSLATIONS.auth,
        ...(translations?.auth || {})
      },
      buttons: {
        ...DEFAULT_TRANSLATIONS.buttons,
        ...(translations?.buttons || {})
      },
      languages: {
        ...DEFAULT_TRANSLATIONS.languages,
        ...(translations?.languages || {})
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
      },
      mypage: {
        ...DEFAULT_TRANSLATIONS.mypage
      },
      auth: {
        ...DEFAULT_TRANSLATIONS.auth
      },
      buttons: {
        ...DEFAULT_TRANSLATIONS.buttons
      },
      languages: {
        ...DEFAULT_TRANSLATIONS.languages
      }
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  // 현재 언어 설정 가져오기 (안전한 접근)
  const currentConfig = SUPPORTED_LANGUAGES.find(lang => lang?.code === currentLanguage) || SUPPORTED_LANGUAGES[0] || {
    code: 'ko',
    name: '한국어',
    flag: '🇰🇷',
    nativeName: '한국어',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-kr)',
    ttsLang: 'ko-KR'
  };
  const isRTL = currentConfig?.dir === 'rtl';

  // 언어 변경 함수
  const setLanguage = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;
    
    setIsLoading(true);
    try {
      const newTranslations = await loadTranslations(language);
      setTranslations(newTranslations);
      setCurrentLanguage(language);
      
      // 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', language);
      }
      
      console.log(`언어 변경됨: ${language}`);
    } catch (error) {
      console.error('언어 변경 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 언어 설정
  useEffect(() => {
    const initializeLanguage = async () => {
      if (typeof window === 'undefined') return;
      
      // 저장된 언어 확인
      const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage;
      
      let initialLanguage: SupportedLanguage;
      if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        initialLanguage = savedLanguage;
      } else {
        initialLanguage = detectBrowserLanguage();
      }
      
      if (initialLanguage !== currentLanguage) {
        await setLanguage(initialLanguage);
      } else {
        // 초기 번역 로드
        const initialTranslations = await loadTranslations(currentLanguage);
        setTranslations(initialTranslations);
      }
    };

    initializeLanguage();
  }, []);

  const contextValue: LanguageContextType = {
    currentLanguage,
    currentConfig,
    setLanguage,
    t: translations,
    isLoading,
    isRTL,
    detectBrowserLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};