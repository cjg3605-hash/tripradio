// 번역 유틸리티
import { SupportedLanguage } from '@/contexts/LanguageContext';

// 번역 데이터를 동적으로 로드
let translationsCache: Record<string, any> = {};

export async function loadTranslations(): Promise<Record<string, any>> {
  if (Object.keys(translationsCache).length === 0) {
    try {
      // 🔥 서버/클라이언트 환경 대응
      if (typeof window !== 'undefined') {
        // 브라우저 환경
        const response = await fetch('/locales/translations.json');
        translationsCache = await response.json();
      } else {
        // 서버 환경 (빌드 시점)
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'public', 'locales', 'translations.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        translationsCache = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      return {};
    }
  }
  return translationsCache;
}

// 동기식 번역 키 가져오기 (빌드 시점용)
export function getTranslation(
  key: string, 
  language: SupportedLanguage = 'ko', 
  params?: Record<string, string | number>
): string {
  // 🔥 캐시가 비어있으면 동기식으로 로드 (서버 환경)
  if (Object.keys(translationsCache).length === 0 && typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'locales', 'translations.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      translationsCache = JSON.parse(fileContent);
    } catch (error) {
      console.warn('Failed to load translations synchronously:', error);
    }
  }
  
  const translations = translationsCache[language] || {};
  
  // 중첩된 키 지원 (예: 'guide.overview')
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 빌드 시점에서만 경고 (런타임에서는 조용히)
      if (typeof window === 'undefined') {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
      }
      return key; // 키를 그대로 반환
    }
  }
  
  let result = typeof value === 'string' ? value : key;
  
  // 매개변수 치환
  if (params) {
    Object.entries(params).forEach(([param, val]) => {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
    });
  }
  
  return result;
}

// React 컴포넌트에서 사용할 훅
export function useTranslation(language: SupportedLanguage) {
  return {
    t: (key: string, params?: Record<string, string | number>) => 
      getTranslation(key, language, params)
  };
}

// 클라이언트 측 번역 초기화
export async function initializeTranslations() {
  if (typeof window !== 'undefined') {
    await loadTranslations();
  }
}