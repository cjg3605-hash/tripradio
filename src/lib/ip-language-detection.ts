/**
 * IP 기반 언어 감지 시스템
 * Vercel Edge Network의 지리적 정보를 활용한 자동 언어 설정
 */

import { NextRequest } from 'next/server';
import type { SupportedLanguage } from '@/contexts/LanguageContext';

// 🌍 국가별 언어 매핑 테이블
export const COUNTRY_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // 🇰🇷 한국어권
  'KR': 'ko',
  
  // 🇯🇵 일본어권  
  'JP': 'ja',
  
  // 🇨🇳 중국어권
  'CN': 'zh',
  'TW': 'zh',
  'HK': 'zh',
  'MO': 'zh',
  'SG': 'zh', // 싱가포르는 다국어지만 중국어 사용자 많음
  
  // 🇪🇸 스페인어권
  'ES': 'es',
  'MX': 'es',
  'AR': 'es',
  'CO': 'es',
  'PE': 'es',
  'VE': 'es',
  'CL': 'es',
  'EC': 'es',
  'GT': 'es',
  'CU': 'es',
  'BO': 'es',
  'DO': 'es',
  'HN': 'es',
  'PY': 'es',
  'SV': 'es',
  'NI': 'es',
  'CR': 'es',
  'PA': 'es',
  'UY': 'es',
  'GQ': 'es',
  
  // 기타 모든 국가 → 영어 (기본값)
  // 명시적으로 설정하지 않음 (detectLanguageFromIP에서 fallback 처리)
};

// 🔍 언어 감지 소스 타입
export type LanguageDetectionSource = 'ip' | 'cookie' | 'url' | 'browser' | 'default';

// 📊 언어 감지 결과
export interface LanguageDetectionResult {
  language: SupportedLanguage;
  source: LanguageDetectionSource;
  country?: string;
  confidence: number; // 0-1 사이의 신뢰도
  timestamp: number;
}

/**
 * IP 주소를 기반으로 언어를 감지합니다
 * @param request - Next.js 요청 객체
 * @returns 감지된 언어 또는 null
 */
export function detectLanguageFromIP(request: NextRequest): LanguageDetectionResult | null {
  try {
    // ⚡ Vercel Edge Network의 지리적 정보 활용
    const geo = (request as any).geo;
    const country = geo?.country;
    
    if (!country) {
      console.warn('🌍 IP 기반 국가 정보 없음 (로컬 개발 환경일 가능성)');
      return null;
    }
    
    // 🎯 국가별 언어 매핑
    const language = COUNTRY_LANGUAGE_MAP[country];
    
    if (language) {
      const result: LanguageDetectionResult = {
        language,
        source: 'ip',
        country,
        confidence: 0.8, // IP 기반은 80% 신뢰도
        timestamp: Date.now()
      };
      
      console.log(`🌍 IP 언어 감지 성공: ${country} → ${language}`, {
        city: geo?.city,
        region: geo?.region,
        latitude: geo?.latitude,
        longitude: geo?.longitude
      });
      
      return result;
    }
    
    // 🔄 매핑되지 않은 국가는 영어로 fallback
    console.log(`🌍 IP 언어 감지 (fallback): ${country} → en (기본값)`);
    return {
      language: 'en',
      source: 'ip',
      country,
      confidence: 0.6, // fallback은 60% 신뢰도
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('❌ IP 언어 감지 오류:', error);
    return null;
  }
}

/**
 * Accept-Language 헤더를 기반으로 언어를 감지합니다
 * @param request - Next.js 요청 객체
 * @returns 감지된 언어 또는 null
 */
export function detectLanguageFromBrowser(request: NextRequest): LanguageDetectionResult | null {
  try {
    const acceptLanguage = request.headers.get('Accept-Language') || '';
    if (!acceptLanguage) return null;
    
    const supportedLocales = ['ko', 'en', 'ja', 'zh', 'es'];
    const detectedLang = acceptLanguage
      .split(',')[0]
      ?.split('-')[0]
      ?.toLowerCase();
    
    if (detectedLang && supportedLocales.includes(detectedLang)) {
      const result: LanguageDetectionResult = {
        language: detectedLang as SupportedLanguage,
        source: 'browser',
        confidence: 0.7, // 브라우저 설정은 70% 신뢰도
        timestamp: Date.now()
      };
      
      console.log(`🌐 브라우저 언어 감지: ${acceptLanguage} → ${detectedLang}`);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('❌ 브라우저 언어 감지 오류:', error);
    return null;
  }
}

/**
 * URL 파라미터에서 언어를 감지합니다
 * @param request - Next.js 요청 객체
 * @returns 감지된 언어 또는 null
 */
export function detectLanguageFromURL(request: NextRequest): LanguageDetectionResult | null {
  try {
    const urlLang = request.nextUrl.searchParams.get('lang');
    if (!urlLang) return null;
    
    const supportedLocales = ['ko', 'en', 'ja', 'zh', 'es'];
    if (supportedLocales.includes(urlLang)) {
      const result: LanguageDetectionResult = {
        language: urlLang as SupportedLanguage,
        source: 'url',
        confidence: 1.0, // URL 파라미터는 100% 신뢰도
        timestamp: Date.now()
      };
      
      console.log(`🔗 URL 언어 감지: ?lang=${urlLang}`);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('❌ URL 언어 감지 오류:', error);
    return null;
  }
}

/**
 * 통합 언어 감지 시스템
 * 우선순위: 쿠키 > IP > Accept-Language > 기본값
 * (URL 파라미터 제거 - 무한 리다이렉션 방지)
 * @param request - Next.js 요청 객체
 * @param cookieLanguage - 쿠키에서 가져온 언어 (optional)
 * @returns 최종 언어 감지 결과
 */
export function detectPreferredLanguageAdvanced(
  request: NextRequest,
  cookieLanguage?: string
): LanguageDetectionResult {
  const startTime = Date.now();
  
  try {
    // 1️⃣ 쿠키 기반 최우선 (재방문자는 이전 선택 유지)
    if (cookieLanguage && ['ko', 'en', 'ja', 'zh', 'es'].includes(cookieLanguage)) {
      const result: LanguageDetectionResult = {
        language: cookieLanguage as SupportedLanguage,
        source: 'cookie',
        confidence: 0.9, // 쿠키는 90% 신뢰도
        timestamp: Date.now()
      };
      
      console.log(`🍪 쿠키 언어 감지: ${cookieLanguage}`);
      console.log(`✅ 언어 감지 완료 (${Date.now() - startTime}ms):`, result);
      return result;
    }
    
    // 2️⃣ IP 기반 (첫 방문자 지역 맞춤 - 최우선)
    const ipResult = detectLanguageFromIP(request);
    if (ipResult) {
      console.log(`✅ 언어 감지 완료 (${Date.now() - startTime}ms):`, ipResult);
      return ipResult;
    }
    
    // 3️⃣ Accept-Language 헤더 (브라우저 설정)
    const browserResult = detectLanguageFromBrowser(request);
    if (browserResult) {
      console.log(`✅ 언어 감지 완료 (${Date.now() - startTime}ms):`, browserResult);
      return browserResult;
    }
    
    // 4️⃣ 기본값 (한국어)
    const defaultResult: LanguageDetectionResult = {
      language: 'ko',
      source: 'default',
      confidence: 0.5, // 기본값은 50% 신뢰도
      timestamp: Date.now()
    };
    
    console.log(`🔄 기본 언어 적용: ko (모든 감지 방법 실패)`);
    console.log(`✅ 언어 감지 완료 (${Date.now() - startTime}ms):`, defaultResult);
    return defaultResult;
    
  } catch (error) {
    console.error('❌ 통합 언어 감지 오류:', error);
    
    // 🚨 오류 시 안전한 기본값
    return {
      language: 'ko',
      source: 'default',
      confidence: 0.1,
      timestamp: Date.now()
    };
  }
}

/**
 * 개발 환경에서 IP 감지 시뮬레이션
 * @param mockCountry - 시뮬레이션할 국가 코드
 * @returns 시뮬레이션된 언어 감지 결과
 */
export function simulateIPDetection(mockCountry: string): LanguageDetectionResult | null {
  const language = COUNTRY_LANGUAGE_MAP[mockCountry];
  
  if (language) {
    return {
      language,
      source: 'ip',
      country: mockCountry,
      confidence: 0.8,
      timestamp: Date.now()
    };
  }
  
  return {
    language: 'en',
    source: 'ip',
    country: mockCountry,
    confidence: 0.6,
    timestamp: Date.now()
  };
}

/**
 * 언어 감지 결과를 사용자 친화적 메시지로 변환
 * @param result - 언어 감지 결과
 * @returns 사용자 표시용 메시지
 */
export function getDetectionSourceMessage(result: LanguageDetectionResult): string {
  const messages = {
    ip: `지역(${result.country})에 맞는 언어로 설정했습니다`,
    cookie: '이전 설정을 불러왔습니다',
    url: 'URL에서 지정한 언어를 적용했습니다',
    browser: '브라우저 설정에 맞는 언어로 설정했습니다',
    default: '기본 언어로 설정했습니다'
  };
  
  return messages[result.source] || '언어가 설정되었습니다';
}