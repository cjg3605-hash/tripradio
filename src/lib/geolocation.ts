// IP 기반 지역화 및 언어 감지 시스템
import { SupportedLanguage } from '@/contexts/LanguageContext';

// 국가 코드 → 언어 매핑 테이블
export const COUNTRY_TO_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // 한국어
  'KR': 'ko',
  'KP': 'ko',

  // 영어권 국가
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'NZ': 'en',
  'IE': 'en',
  'ZA': 'en',
  'IN': 'en',
  'SG': 'en',
  'PH': 'en',
  'MY': 'en',
  'HK': 'en',
  'NG': 'en',
  'KE': 'en',
  'GH': 'en',
  'UG': 'en',
  'ZW': 'en',
  'BW': 'en',
  'JM': 'en',
  'TT': 'en',
  'BB': 'en',
  'BS': 'en',
  'BZ': 'en',
  'GY': 'en',
  'LC': 'en',
  'VC': 'en',
  'GD': 'en',
  'AG': 'en',
  'DM': 'en',
  'KN': 'en',
  'MT': 'en',
  'CY': 'en',

  // 일본어
  'JP': 'ja',

  // 중국어 (간체)
  'CN': 'zh',
  'TW': 'zh',
  'MO': 'zh',

  // 스페인어권 국가
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
  'PR': 'es',
  'GQ': 'es',

  // 기타 주요 국가들 (영어로 폴백)
  'FR': 'en', // 프랑스 → 영어 (프랑스어 미지원)
  'DE': 'en', // 독일 → 영어 (독일어 미지원)
  'IT': 'en', // 이탈리아 → 영어 (이탈리아어 미지원)
  'PT': 'en', // 포르투갈 → 영어 (포르투갈어 미지원)
  'BR': 'en', // 브라질 → 영어 (포르투갈어 미지원)
  'RU': 'en', // 러시아 → 영어 (러시아어 미지원)
  'TR': 'en', // 터키 → 영어 (터키어 미지원)
  'TH': 'en', // 태국 → 영어 (태국어 미지원)
  'VN': 'en', // 베트남 → 영어 (베트남어 미지원)
  'ID': 'en', // 인도네시아 → 영어 (인도네시아어 미지원)
};

// IP 주소에서 국가 코드 추출 (CloudFlare 헤더 우선)
export function getCountryFromRequest(request: Request): string | null {
  // CloudFlare CF-IPCountry 헤더 확인
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry.toUpperCase();
  }

  // CloudFlare를 사용하지 않는 경우는 null 반환 (후속 처리에서 ip-api.com 사용)
  return null;
}

// 국가 코드에서 언어 추출
export function getLanguageFromCountry(countryCode: string): SupportedLanguage {
  const language = COUNTRY_TO_LANGUAGE_MAP[countryCode.toUpperCase()];
  return language || 'ko'; // 기본값: 한국어
}

// IP 주소에서 직접 언어 추출
export function getLanguageFromRequest(request: Request): SupportedLanguage {
  const country = getCountryFromRequest(request);
  if (country) {
    return getLanguageFromCountry(country);
  }
  return 'ko'; // CloudFlare 헤더가 없는 경우 기본값
}

// ip-api.com을 사용한 백업 IP 조회 (Vercel Edge Runtime 최적화)
export async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    // 개발/테스트 환경에서 로컬 IP 처리
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return 'KR'; // 로컬 환경에서는 한국으로 설정
    }

    // Vercel Edge Runtime에서는 AbortController 사용
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초로 단축

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,status`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GuideAI/1.0', // API 제공자를 위한 식별
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.countryCode) {
      return data.countryCode.toUpperCase();
    }

    return null;
  } catch (error) {
    // Vercel에서는 더 조용한 로깅
    if (process.env.NODE_ENV === 'development') {
      console.warn('IP geolocation failed:', error);
    }
    return null;
  }
}

// 브라우저 정보에서 언어 추정 (클라이언트 사이드)
export function getLanguageFromBrowser(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'ko';
  }

  // 브라우저 언어 설정 확인
  const browserLanguage = navigator.language.split('-')[0];
  
  // 지원하는 언어인지 확인
  const supportedLanguages: SupportedLanguage[] = ['ko', 'en', 'ja', 'zh', 'es'];
  if (supportedLanguages.includes(browserLanguage as SupportedLanguage)) {
    return browserLanguage as SupportedLanguage;
  }

  // 타임존에서 지역 추정
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // 주요 타임존 → 국가 매핑
    const timezoneToCountry: Record<string, string> = {
      'Asia/Seoul': 'KR',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Hong_Kong': 'HK',
      'Asia/Taipei': 'TW',
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'Europe/London': 'GB',
      'Europe/Madrid': 'ES',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Rome': 'IT',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
    };

    const country = timezoneToCountry[timezone];
    if (country) {
      return getLanguageFromCountry(country);
    }
  } catch (error) {
    console.warn('Timezone detection failed:', error);
  }

  return 'ko'; // 최종 폴백
}

// 언어 감지 우선순위 체인 (Vercel 최적화)
export interface LanguageDetectionResult {
  language: SupportedLanguage;
  source: 'user-preference' | 'cloudflare' | 'vercel' | 'ip-api' | 'browser' | 'default';
  confidence: number; // 0-1
}

export async function detectLanguage(
  request: Request,
  userPreference?: SupportedLanguage
): Promise<LanguageDetectionResult> {
  // 1순위: 사용자 설정 (쿠키/로컬 스토리지)
  if (userPreference) {
    return {
      language: userPreference,
      source: 'user-preference',
      confidence: 1.0
    };
  }

  // 2순위: CloudFlare CF-IPCountry 헤더
  const cfCountry = getCountryFromRequest(request);
  if (cfCountry) {
    return {
      language: getLanguageFromCountry(cfCountry),
      source: 'cloudflare',
      confidence: 0.9
    };
  }

  // 3순위: Vercel IP 추출 (여러 헤더 시도)
  const clientIP = 
    request.headers.get('x-vercel-forwarded-for') ||  // Vercel 우선
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||  // CloudFlare
    request.headers.get('x-client-ip') ||
    '127.0.0.1';

  // Vercel 지역 정보 헤더도 확인
  const vercelRegion = request.headers.get('x-vercel-ip-country');
  if (vercelRegion) {
    return {
      language: getLanguageFromCountry(vercelRegion),
      source: 'vercel',
      confidence: 0.85
    };
  }

  try {
    const ipCountry = await getCountryFromIP(clientIP);
    if (ipCountry) {
      return {
        language: getLanguageFromCountry(ipCountry),
        source: 'ip-api',
        confidence: 0.8
      };
    }
  } catch (error) {
    // Vercel에서는 조용한 로깅
    if (process.env.NODE_ENV === 'development') {
      console.warn('IP-based detection failed:', error);
    }
  }

  // 4순위: 브라우저 Accept-Language 헤더
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',')
      .map(lang => lang.trim().split(';')[0].split('-')[0])
      .filter(lang => ['ko', 'en', 'ja', 'zh', 'es'].includes(lang));
    
    if (languages.length > 0) {
      return {
        language: languages[0] as SupportedLanguage,
        source: 'browser',
        confidence: 0.6
      };
    }
  }

  // 최종 폴백: 한국어
  return {
    language: 'ko',
    source: 'default',
    confidence: 0.1
  };
}