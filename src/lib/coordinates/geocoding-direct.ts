/**
 * 🎯 Google Geocoding API 직접 활용 좌표 검색
 * Plus Code 우회 없이 직접 정확한 좌표 획득
 */

import axios from 'axios';

export interface GeocodingResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  confidence: number; // 0-1 범위
  source: 'geocoding_api';
}

export interface LocationContext {
  locationName: string;
  region?: string;
  country?: string;
  language?: string;
}

/**
 * 🌍 Google Geocoding API 직접 검색
 * 지역명+장소명으로 정확한 좌표 획득
 */
export async function searchLocationDirect(
  locationName: string,
  context?: LocationContext
): Promise<GeocodingResult | null> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_PLACES_API_KEY 환경변수가 설정되지 않음');
      return null;
    }

    // 지역 컨텍스트를 활용한 검색 쿼리 생성
    const searchQueries = generateSearchQueries(locationName, context);
    
    console.log(`🔍 Geocoding API 직접 검색: ${locationName}`);
    console.log(`📍 검색 쿼리 (${searchQueries.length}개): ${searchQueries.slice(0, 3).join(', ')}...`);

    for (const query of searchQueries) {
      console.log(`  🌍 시도: "${query}"`);
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: query,
          key: apiKey,
          language: context?.language || 'en'
        },
        timeout: 10000
      });

      const data = response.data;
      console.log(`  📡 응답: ${data.status} (결과 ${data.results?.length || 0}개)`);
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // 결과 검증
        if (isValidResult(result, locationName, context)) {
          const geoResult: GeocodingResult = {
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            address: result.formatted_address,
            confidence: calculateConfidence(result, query, locationName),
            source: 'geocoding_api'
          };
          
          console.log(`✅ 검색 성공: ${result.formatted_address}`);
          console.log(`📍 좌표: ${geoResult.coordinates.lat}, ${geoResult.coordinates.lng}`);
          console.log(`🎯 신뢰도: ${(geoResult.confidence * 100).toFixed(1)}%`);
          
          return geoResult;
        } else {
          console.log(`  ⚠️ 검증 실패: 관련성 낮음`);
        }
      } else {
        console.log(`  ❌ 검색 실패: ${data.status}`);
        if (data.error_message) {
          console.log(`     오류: ${data.error_message}`);
        }
      }
      
      // API 호출 제한을 위한 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`❌ 모든 검색 시도 실패: ${locationName}`);
    return null;

  } catch (error) {
    console.error('Geocoding API 직접 검색 오류:', error);
    return null;
  }
}

/**
 * 🔍 지역 컨텍스트를 활용한 검색 쿼리 생성
 */
function generateSearchQueries(locationName: string, context?: LocationContext): string[] {
  const queries: string[] = [];
  const region = context?.region || '';
  const country = context?.country || '';
  
  // 1순위: 지역 + 장소명 조합
  if (region && country) {
    queries.push(`${locationName}, ${region}, ${country}`);
    queries.push(`${locationName} ${region} ${country}`);
  }
  
  if (region) {
    queries.push(`${locationName}, ${region}`);
    queries.push(`${locationName} ${region}`);
  }
  
  if (country) {
    queries.push(`${locationName}, ${country}`);
    queries.push(`${locationName} ${country}`);
  }
  
  // 2순위: 관광지 키워드 추가
  const tourismKeywords = getTourismKeywords(context?.language || 'en');
  tourismKeywords.forEach(keyword => {
    if (region) {
      queries.push(`${locationName} ${keyword}, ${region}`);
    }
    queries.push(`${locationName} ${keyword}`);
  });
  
  // 3순위: 기본 장소명
  queries.push(locationName);
  
  // 중복 제거
  return [...new Set(queries)];
}

/**
 * 🏛️ 언어별 관광지 키워드
 */
function getTourismKeywords(language: string): string[] {
  const keywords = {
    'ko': ['입구', '매표소', '관광지', '명소', '안내소'],
    'en': ['entrance', 'main entrance', 'visitor center', 'tourist attraction', 'landmark'],
    'zh': ['入口', '售票处', '旅游景点', '景点'],
    'ja': ['入口', '案内所', '観光地', '名所']
  };
  
  return keywords[language as keyof typeof keywords] || keywords['en'];
}

/**
 * ✅ 검색 결과 검증
 */
function isValidResult(result: any, originalName: string, context?: LocationContext): boolean {
  // 기본 필수 필드 확인
  if (!result.geometry?.location?.lat || !result.geometry?.location?.lng) {
    return false;
  }
  
  // 주소 관련성 확인
  if (!result.formatted_address) {
    return false;
  }
  
  // 지역 컨텍스트 검증
  if (context?.country) {
    const countryNames = getCountryNames(context.country);
    const hasCountryMatch = countryNames.some(name => 
      result.formatted_address.toLowerCase().includes(name.toLowerCase())
    );
    
    if (!hasCountryMatch) {
      console.log(`  ⚠️ 국가 불일치: ${context.country} vs ${result.formatted_address}`);
      return false;
    }
  }
  
  // 좌표 범위 검증
  const lat = result.geometry.location.lat;
  const lng = result.geometry.location.lng;
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.log(`  ⚠️ 좌표 범위 초과: ${lat}, ${lng}`);
    return false;
  }
  
  return true;
}

/**
 * 🎯 신뢰도 계산
 */
function calculateConfidence(result: any, searchQuery: string, originalName: string): number {
  let confidence = 0.7; // 기본 신뢰도
  
  // 장소명 유사도
  if (result.formatted_address) {
    const similarity = calculateNameSimilarity(result.formatted_address, originalName);
    confidence += similarity * 0.2;
  }
  
  // 검색 쿼리 정확도
  if (searchQuery.includes(',')) {
    confidence += 0.1; // 지역 정보 포함시 보너스
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * 📝 이름 유사도 계산 (간단한 버전)
 */
function calculateNameSimilarity(address: string, targetName: string): number {
  const cleanAddress = address.toLowerCase().replace(/[^\w가-힣]/g, '');
  const cleanTarget = targetName.toLowerCase().replace(/[^\w가-힣]/g, '');
  
  if (cleanAddress.includes(cleanTarget) || cleanTarget.includes(cleanAddress)) {
    return 1.0;
  }
  
  // 간단한 부분 매칭
  const commonChars = [...cleanTarget].filter(char => cleanAddress.includes(char)).length;
  return commonChars / Math.max(cleanTarget.length, 1);
}

/**
 * 🌍 국가 코드별 국가명 목록
 */
function getCountryNames(countryCode: string): string[] {
  const countryNames: { [key: string]: string[] } = {
    'KR': ['South Korea', 'Korea', '대한민국', '한국'],
    'CN': ['China', '중국', 'People\'s Republic of China'],
    'JP': ['Japan', '일본', 'Nippon'],
    'US': ['United States', 'USA', 'America', '미국'],
    'FR': ['France', '프랑스', 'République française'],
    'IT': ['Italy', '이탈리아', 'Italia'],
    'ES': ['Spain', '스페인', 'España'],
    'DE': ['Germany', '독일', 'Deutschland'],
    'GB': ['United Kingdom', 'UK', '영국', 'Britain']
  };
  
  return countryNames[countryCode] || [countryCode];
}

/**
 * 🎯 다중 위치 검색 (챕터별 사용)
 */
export async function searchMultipleLocations(
  baseLocation: string,
  chapterLocations: string[],
  context?: LocationContext
): Promise<GeocodingResult[]> {
  const results: GeocodingResult[] = [];
  
  console.log(`🎯 다중 위치 검색 시작: ${baseLocation} (${chapterLocations.length}개 챕터)`);
  
  for (let i = 0; i < chapterLocations.length; i++) {
    const chapterLocation = chapterLocations[i];
    
    console.log(`\n📍 챕터 ${i + 1}: "${chapterLocation}"`);
    
    // 챕터별 컨텍스트 생성
    const chapterContext: LocationContext = {
      locationName: `${baseLocation} ${chapterLocation}`,
      region: context?.region,
      country: context?.country,
      language: context?.language
    };
    
    const result = await searchLocationDirect(chapterLocation, chapterContext);
    
    if (result) {
      results.push(result);
      console.log(`✅ 챕터 ${i + 1} 성공`);
    } else {
      console.log(`❌ 챕터 ${i + 1} 실패`);
    }
    
    // API 호출 제한을 위한 대기
    if (i < chapterLocations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n🎉 다중 검색 완료: ${results.length}/${chapterLocations.length}개 성공`);
  return results;
}