import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Vercel Edge Network geo 타입 정의
interface VercelGeo {
  country?: string;
  city?: string;
  region?: string;
  latitude?: string;
  longitude?: string;
}

// NextRequest 타입 확장
interface ExtendedNextRequest extends NextRequest {
  geo?: VercelGeo;
}

// 🌍 지원 언어 목록
const SUPPORTED_LANGUAGES = ['ko', 'ja', 'en'];

// 🌍 국가별 언어 매핑 (간소화: 한국, 일본만 매핑, 나머지는 영어)
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'KR': 'ko', // 한국 → 한국어
  'JP': 'ja', // 일본 → 일본어
  // 기타 모든 국가 → 영어 (기본값)
};

// 🔍 Accept-Language 헤더에서 지원 언어 추출
function detectLanguageFromHeader(acceptLanguageHeader: string): string | null {
  if (!acceptLanguageHeader) return null;
  
  // Accept-Language 헤더 파싱: "ko-KR,ko;q=0.9,en;q=0.8" → ["ko-KR", "ko", "en"]
  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => lang.split(';')[0].trim()) // q값 제거
    .map(lang => lang.split('-')[0].toLowerCase()) // 국가 코드 제거
    .filter(lang => SUPPORTED_LANGUAGES.includes(lang)); // 지원 언어만 필터링
  
  // 첫 번째 지원 언어 반환
  return languages[0] || null;
}

export default function middleware(req: ExtendedNextRequest) {
  // 🔀 도메인 리다이렉트: navidocent.com → tripradio.shop
  const hostname = req.headers.get('host') || '';
  if (hostname.includes('navidocent.com')) {
    const url = req.nextUrl.clone();
    url.host = 'tripradio.shop';
    url.protocol = 'https';

    console.log(`🔀 리다이렉트: ${hostname}${url.pathname} → tripradio.shop${url.pathname}`);

    return NextResponse.redirect(url, {
      status: 301, // Permanent redirect for SEO
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // 🔍 Accept-Language 헤더 및 지리 정보 획득
  const acceptLanguageHeader = req.headers.get('accept-language') || '';
  const country = req.geo?.country || req.headers.get('x-vercel-ip-country');
  
  // 🍪 기존 언어 설정 확인
  const existingLang = req.cookies.get('language-preference')?.value;
  const isFirstVisit = !req.cookies.get('language-detection-done');
  
  // 📝 개발 환경 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log('🌍 Middleware - 언어 감지 정보:', { 
      acceptLanguageHeader,
      country, 
      existingLang, 
      isFirstVisit
    });
  }
  
  // ✨ 첫 방문이고 언어 설정이 없는 경우에만 자동 감지
  if (isFirstVisit && !existingLang) {
    let detectedLang = 'en'; // 기본값: 영어
    let detectionSource = 'default';
    let confidence = 0.5;
    
    // 🥇 1순위: Accept-Language 헤더 (사용자가 브라우저에서 설정한 언어)
    const headerLang = detectLanguageFromHeader(acceptLanguageHeader);
    if (headerLang) {
      detectedLang = headerLang;
      detectionSource = 'browser';
      confidence = 0.9;
      console.log(`🥇 Accept-Language 헤더 감지: ${acceptLanguageHeader} → ${headerLang}`);
    }
    // 🥈 2순위: IP 기반 지역 감지 (한국, 일본만)
    else if (country && COUNTRY_LANGUAGE_MAP[country]) {
      detectedLang = COUNTRY_LANGUAGE_MAP[country];
      detectionSource = 'ip';
      confidence = country === 'KR' ? 0.9 : 0.8;
      console.log(`🥈 IP 지역 감지: ${country} → ${detectedLang}`);
    }
    // 🥉 3순위: 기본값 (영어)
    else {
      console.log(`🥉 기본값 적용: en (헤더 감지 실패, IP: ${country || '없음'})`);
    }
    
    const response = NextResponse.next();
    
    // 🎯 감지된 언어 쿠키 설정
    response.cookies.set('language-preference', detectedLang, {
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // 📊 감지 정보 쿠키 설정 (클라이언트 알림용)
    response.cookies.set('language-detection-info', JSON.stringify({
      language: detectedLang,
      source: detectionSource,
      country,
      confidence,
      timestamp: Date.now()
    }), {
      maxAge: 5 * 60, // 5분 (알림 표시용)
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // ✅ 감지 완료 플래그 설정
    response.cookies.set('language-detection-done', 'true', {
      maxAge: 365 * 24 * 60 * 60, // 1년
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    console.log(`🎯 최종 언어 설정: ${detectedLang} (출처: ${detectionSource})`);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 모든 페이지에서 언어 감지 실행
     * API routes, static files, 내부 Next.js 파일은 제외
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};