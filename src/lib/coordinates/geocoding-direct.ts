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
  fullGoogleResult?: any; // 전체 Google API 응답 (지역 정보 추출용)
}

export interface LocationContext {
  locationName: string;
  region?: string;
  country?: string;
  language?: string;
  parentRegion?: string;
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
        
        // 🎯 Google API 신뢰 우선: 기본 검증만 수행
        if (result.geometry?.location?.lat && result.geometry?.location?.lng) {
          const geoResult: GeocodingResult = {
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            address: result.formatted_address,
            confidence: calculateConfidence(result, query, locationName),
            source: 'geocoding_api',
            // 🎯 전체 Google API 응답 데이터 포함 (지역 정보 추출용)
            fullGoogleResult: result
          };
          
          console.log(`✅ 검색 성공: ${result.formatted_address}`);
          console.log(`📍 좌표: ${geoResult.coordinates.lat}, ${geoResult.coordinates.lng}`);
          console.log(`🎯 신뢰도: ${(geoResult.confidence * 100).toFixed(1)}%`);
          console.log(`📊 address_components: ${result.address_components?.length || 0}개`);
          
          return geoResult;
        } else {
          console.log(`  ⚠️ 좌표 데이터 없음`);
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
  
  // 🎯 동적 관광지 패턴 인식 및 검색어 최적화
  const optimizedQueries = generateOptimizedQueries(locationName, region, country, context?.language);
  queries.push(...optimizedQueries);
  
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
 * 🎯 동적 관광지 패턴 인식 및 검색어 최적화
 */
function generateOptimizedQueries(locationName: string, region: string, country: string, language?: string): string[] {
  const queries: string[] = [];
  const name = locationName.toLowerCase();
  
  // 🏯 종교 건물 패턴 인식 및 최적화
  if (name.includes('사') || name.includes('절') || name.includes('temple')) {
    // 유명 관광지가 있는 지역 우선
    const majorTouristCities = ['부산', '서울', '경주', '제주', 'busan', 'seoul', 'gyeongju', 'jeju'];
    const hasMajorCity = majorTouristCities.some(city => 
      region.toLowerCase().includes(city) || country.toLowerCase().includes(city)
    );
    
    if (hasMajorCity && language === 'ko') {
      // 한국 사찰의 경우 관광지 중심의 검색어 추가
      queries.push(`${locationName} 관광명소`);
      queries.push(`${locationName} 템플스테이`);
      queries.push(`${locationName} 문화재`);
    }
    
    // 영문명 추가 (국제 관광객용)
    if (language === 'ko') {
      queries.push(`${locationName} temple`);
    }
  }
  
  // 🏰 궁궐 패턴 인식
  if (name.includes('궁') || name.includes('palace')) {
    queries.push(`${locationName} 궁궐`);
    queries.push(`${locationName} palace`);
    if (language === 'ko') {
      queries.push(`${locationName} 관람`);
      queries.push(`${locationName} 문화재`);
    }
  }
  
  // 🏖️ 해변/바다 관련 패턴
  if (name.includes('해수욕장') || name.includes('해변') || name.includes('beach')) {
    queries.push(`${locationName} 해수욕장`);
    queries.push(`${locationName} beach`);
    if (region.includes('부산') || region.includes('busan')) {
      queries.push(`${locationName} 부산`);
    }
  }
  
  // 🗻 산/공원 패턴
  if (name.includes('산') || name.includes('공원') || name.includes('mountain') || name.includes('park')) {
    queries.push(`${locationName} 등산`);
    queries.push(`${locationName} 국립공원`);
    queries.push(`${locationName} mountain`);
    queries.push(`${locationName} national park`);
  }
  
  return queries;
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
    // 국가 코드 또는 국가명을 국가 코드로 변환
    const countryCode = normalizeCountryToCode(context.country);
    const countryNames = getCountryNames(countryCode);
    const hasCountryMatch = countryNames.some(name => 
      result.formatted_address.toLowerCase().includes(name.toLowerCase())
    );
    
    console.log(`  🔍 국가 검증: ${context.country} → ${countryCode} → [${countryNames.join(', ')}]`);
    console.log(`  📍 주소에서 확인: ${result.formatted_address}`);
    
    if (!hasCountryMatch) {
      console.log(`  ⚠️ 국가 불일치: ${context.country} vs ${result.formatted_address}`);
      return false;
    } else {
      console.log(`  ✅ 국가 일치 확인됨`);
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
 * 🌍 국가명을 ISO 3166-1 alpha-3 코드로 정규화
 */
function normalizeCountryToCode(country: string): string {
  const countryMappings: { [key: string]: string } = {
    // 한국
    'South Korea': 'KOR',
    'Korea': 'KOR', 
    '대한민국': 'KOR',
    '한국': 'KOR',
    'KR': 'KOR',
    'KOR': 'KOR',
    
    // 중국
    'China': 'CHN',
    '중국': 'CHN',
    'People\'s Republic of China': 'CHN',
    'CN': 'CHN',
    'CHN': 'CHN',
    
    // 일본
    'Japan': 'JPN',
    '일본': 'JPN',
    'Nippon': 'JPN',
    'JP': 'JPN',
    'JPN': 'JPN',
    
    // 미국
    'United States': 'USA',
    'USA': 'USA',
    'America': 'USA',
    '미국': 'USA',
    'US': 'USA',
    
    // 프랑스
    'France': 'FRA',
    '프랑스': 'FRA',
    'République française': 'FRA',
    'FR': 'FRA',
    'FRA': 'FRA',
    
    // 이탈리아
    'Italy': 'ITA',
    '이탈리아': 'ITA',
    'Italia': 'ITA',
    'IT': 'ITA',
    'ITA': 'ITA',
    
    // 스페인
    'Spain': 'ESP',
    '스페인': 'ESP',
    'España': 'ESP',
    'ES': 'ESP',
    'ESP': 'ESP',
    
    // 독일
    'Germany': 'DEU',
    '독일': 'DEU',
    'Deutschland': 'DEU',
    'DE': 'DEU',
    'DEU': 'DEU',
    
    // 영국
    'United Kingdom': 'GBR',
    'UK': 'GBR',
    '영국': 'GBR',
    'Britain': 'GBR',
    'GB': 'GBR',
    'GBR': 'GBR',
    
    // 추가 주요 국가들
    'Australia': 'AUS',
    '호주': 'AUS',
    'AU': 'AUS',
    'AUS': 'AUS',
    
    'Canada': 'CAN',
    '캐나다': 'CAN',
    'CA': 'CAN',
    'CAN': 'CAN',
    
    'India': 'IND',
    '인도': 'IND',
    'IN': 'IND',
    'IND': 'IND',
    
    'Brazil': 'BRA',
    '브라질': 'BRA',
    'BR': 'BRA',
    'BRA': 'BRA',
    
    'Russia': 'RUS',
    '러시아': 'RUS',
    'RU': 'RUS',
    'RUS': 'RUS',
    
    'Mexico': 'MEX',
    '멕시코': 'MEX',
    'MX': 'MEX',
    'MEX': 'MEX',
    
    'Thailand': 'THA',
    '태국': 'THA',
    'TH': 'THA',
    'THA': 'THA',
    
    'Vietnam': 'VNM',
    '베트남': 'VNM',
    'VN': 'VNM',
    'VNM': 'VNM',
    
    'Indonesia': 'IDN',
    '인도네시아': 'IDN',
    'ID': 'IDN',
    'IDN': 'IDN',
    
    'Malaysia': 'MYS',
    '말레이시아': 'MYS',
    'MY': 'MYS',
    'MYS': 'MYS',
    
    'Singapore': 'SGP',
    '싱가포르': 'SGP',
    'SG': 'SGP',
    'SGP': 'SGP'
  };
  
  return countryMappings[country] || country;
}

/**
 * 🌍 ISO 3166-1 alpha-3 국가 코드별 국가명 목록
 */
function getCountryNames(countryCode: string): string[] {
  const countryNames: { [key: string]: string[] } = {
    'KOR': ['South Korea', 'Korea', '대한민국', '한국', 'Republic of Korea'],
    'CHN': ['China', '중국', 'People\'s Republic of China', '중화인민공화국'],
    'JPN': ['Japan', '일본', 'Nippon', '日本'],
    'USA': ['United States', 'USA', 'America', '미국', 'United States of America'],
    'FRA': ['France', '프랑스', 'République française'],
    'ITA': ['Italy', '이탈리아', 'Italia'],
    'ESP': ['Spain', '스페인', 'España'],
    'DEU': ['Germany', '독일', 'Deutschland'],
    'GBR': ['United Kingdom', 'UK', '영국', 'Britain', 'Great Britain'],
    'AUS': ['Australia', '호주', 'Commonwealth of Australia'],
    'CAN': ['Canada', '캐나다'],
    'IND': ['India', '인도', 'Republic of India', '인디아'],
    'BRA': ['Brazil', '브라질', 'Brasil'],
    'RUS': ['Russia', '러시아', 'Russian Federation'],
    'MEX': ['Mexico', '멕시코', 'México'],
    'THA': ['Thailand', '태국', 'Kingdom of Thailand'],
    'VNM': ['Vietnam', '베트남', 'Viet Nam', 'Socialist Republic of Vietnam'],
    'IDN': ['Indonesia', '인도네시아', 'Republic of Indonesia'],
    'MYS': ['Malaysia', '말레이시아'],
    'SGP': ['Singapore', '싱가포르', 'Republic of Singapore']
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