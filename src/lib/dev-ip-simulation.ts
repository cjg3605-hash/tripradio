/**
 * 개발 환경 IP 시뮬레이션 헬퍼
 * Vercel Edge가 없는 로컬 환경에서 IP 기반 언어 감지 테스트
 */

import { NextRequest } from 'next/server';

// 개발 환경에서 시뮬레이션할 국가 코드
const DEV_COUNTRY = process.env.NEXT_PUBLIC_DEV_COUNTRY || 'KR';

/**
 * 개발 환경에서 Vercel geo 객체 시뮬레이션
 */
export function attachDevGeo(request: NextRequest): NextRequest {
  if (process.env.NODE_ENV === 'development') {
    // 쿼리 파라미터로 국가 코드 오버라이드 확인
    const testCountry = getTestCountry(request);
    const country = testCountry || DEV_COUNTRY;
    
    // 개발 환경에서만 geo 객체 추가
    (request as any).geo = {
      country: country,
      city: 'Development',
      region: 'dev',
      latitude: '37.5665',
      longitude: '126.9780'
    };
    
    console.log(`🔧 개발 환경 IP 시뮬레이션: ${country}${testCountry ? ' (쿼리 파라미터)' : ''}`);
  }
  
  return request;
}

/**
 * 쿼리 파라미터로 국가 코드 오버라이드 (테스트용)
 * 예: ?dev_country=JP
 */
export function getTestCountry(request: NextRequest): string | null {
  if (process.env.NODE_ENV === 'development') {
    const testCountry = request.nextUrl.searchParams.get('dev_country');
    if (testCountry) {
      console.log(`🧪 테스트 국가 코드: ${testCountry}`);
      return testCountry.toUpperCase();
    }
  }
  return null;
}