'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 지원 언어 타입
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh' | 'es';

// 언어 설정 인터페이스
interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  flag: string;
  nativeName: string;
}

// 지원 언어 목록
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
];

// 번역 데이터 타입
interface Translations {
  header: {
    title: string;
    language: string;
    login: string;
    logout: string;
    history: string;
  };
  home: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    popularDestinations: string;
    description: string;
  };
  guide: {
    overview: string;
    route: string;
    realTimeGuide: string;
    play: string;
    pause: string;
    startingLocation: string;
    viewOnGoogleMaps: string;
    keyFacts: string;
    duration: string;
    difficulty: string;
    season: string;
    nextMove: string;
  };
  languages: Record<SupportedLanguage, string>;
}

// 기본 번역 데이터 (SSR 및 fallback용)
const DEFAULT_TRANSLATIONS: Translations = {
  header: {
    title: 'AI 가이드',
    language: '언어',
    login: '로그인',
    logout: '로그아웃',
    history: '검색 기록'
  },
  home: {
    title: 'AI와 함께하는 가이드 투어',
    subtitle: '개인 맞춤형 여행 가이드를 AI가 실시간으로 생성해드립니다',
    searchPlaceholder: '어디로 떠나고 싶으신가요?',
    searchButton: '가이드 생성',
    popularDestinations: '인기 여행지',
    description: 'AI가 실시간으로 생성하는 독특한 여행 가이드를 만나보세요'
  },
  guide: {
    overview: '투어 개요',
    route: '추천 관람순서',
    realTimeGuide: '실시간 오디오 가이드',
    play: '재생',
    pause: '일시정지',
    startingLocation: '시작 위치',
    viewOnGoogleMaps: '구글맵에서 보기',
    keyFacts: '핵심 정보',
    duration: '소요시간',
    difficulty: '난이도',
    season: '추천 계절',
    nextMove: '다음으로 이동'
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
  setLanguage: (language: SupportedLanguage) => void;
  t: Translations;
  isLoading: boolean;
}

// Context 생성
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 번역 데이터 로드 함수
async function loadTranslations(language: SupportedLanguage): Promise<Translations> {
  try {
    const response = await fetch(`/locales/${language}/common.json`);
    if (!response.ok) {
      console.warn(`Failed to load translations for ${language}, using defaults`);
      return DEFAULT_TRANSLATIONS;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Error loading translations for ${language}:`, error);
    return DEFAULT_TRANSLATIONS;
  }
}

// Provider 컴포넌트
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('ko');
  const [translations, setTranslations] = useState<Translations>(DEFAULT_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

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
      }
      
      console.log(`✅ 언어 변경 완료: ${language}`);
    } catch (error) {
      console.error('언어 변경 실패:', error);
      // 실패 시 기본 번역 사용
      setTranslations(DEFAULT_TRANSLATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 언어 설정 및 번역 로드
  useEffect(() => {
    if (!isClient) return;

    const initializeLanguage = async () => {
      let initialLanguage: SupportedLanguage = 'ko';
      
      // 클라이언트 사이드에서만 localStorage 확인
      if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage;
        if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
          initialLanguage = savedLanguage;
        }
      }

      await setLanguage(initialLanguage);
    };

    initializeLanguage();
  }, [isClient]);

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t: translations,
    isLoading: isLoading && isClient // 클라이언트에서만 로딩 표시
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