/**
 * 🎯 Google Places API 직접 통합 - 정확한 좌표 확보
 * 기존 Enhanced Location Service와 연동하여 최고 정확도 달성
 */

import axios from 'axios';

export interface GooglePlacesResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  name: string;
  placeId: string;
  confidence: number; // 0-1 범위
}

export interface PlacesSearchInput {
  query: string;
  language?: string;
  region?: string; // 'KR', 'US' 등 국가 코드
  locationBias?: {
    lat: number;
    lng: number;
    radius: number; // 미터 단위
  };
}

/**
 * Google Places API Find Place from Text 검색
 */
export async function findPlaceFromText(
  input: PlacesSearchInput
): Promise<GooglePlacesResult | null> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_PLACES_API_KEY 환경변수가 설정되지 않음');
      return null;
    }

    console.log(`🔍 Google Places API 검색: "${input.query}"`);
    
    // URL 파라미터 구성
    const params = new URLSearchParams({
      input: input.query,
      inputtype: 'textquery',
      fields: 'place_id,formatted_address,geometry,name,rating',
      key: apiKey,
      language: input.language || 'ko'
    });

    // 지역 바이어스 추가 (선택사항)
    if (input.locationBias) {
      const { lat, lng, radius } = input.locationBias;
      params.append('locationbias', `circle:${radius}@${lat},${lng}`);
    }

    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`;

    const response = await axios.get(url, {
      timeout: 10000 // 10초 타임아웃
    });

    const data = response.data;
    console.log(`📡 API 응답 상태: ${data.status}`);

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      const result: GooglePlacesResult = {
        coordinates: {
          lat: candidate.geometry.location.lat,
          lng: candidate.geometry.location.lng
        },
        address: candidate.formatted_address,
        name: candidate.name,
        placeId: candidate.place_id,
        confidence: calculateConfidence(candidate, input.query)
      };

      console.log(`✅ 장소 발견: ${result.name}`);
      console.log(`📍 좌표: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      console.log(`🎯 신뢰도: ${(result.confidence * 100).toFixed(1)}%`);

      return result;
    } else {
      console.log(`❌ 검색 결과 없음: ${data.status}`);
      if (data.error_message) {
        console.log(`   오류: ${data.error_message}`);
      }
      return null;
    }

  } catch (error) {
    console.error('Google Places API 오류:', error);
    return null;
  }
}

/**
 * 스마트 다중 검색 - 여러 검색어로 시도하여 가장 정확한 결과 반환
 */
export async function smartPlacesSearch(
  locationName: string,
  language: string = 'ko',
  context?: string
): Promise<GooglePlacesResult | null> {
  // 검색 전략 정의 (우선순위 순)
  const searchQueries = generateSearchQueries(locationName, context);
  
  console.log(`🎯 ${locationName}에 대한 스마트 검색 시작`);
  console.log(`🔍 검색 전략 (${searchQueries.length}개): ${searchQueries.map(q => `"${q}"`).join(', ')}`);

  let bestResult: GooglePlacesResult | null = null;
  let bestScore = 0;

  for (const query of searchQueries) {
    console.log(`\n📍 검색 시도: "${query}"`);
    
    const result = await findPlaceFromText({
      query,
      language,
      region: language === 'ko' ? 'KR' : undefined
    });

    if (result) {
      const score = calculateSearchScore(result, locationName, query);
      console.log(`📊 검색 점수: ${score.toFixed(2)} (신뢰도: ${(result.confidence * 100).toFixed(1)}%)`);
      
      if (score > bestScore) {
        bestResult = result;
        bestScore = score;
        console.log(`🏆 현재 최고 결과 업데이트`);
      }
    }

    // API 호출 제한을 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (bestResult) {
    console.log(`\n🎉 최종 선택: "${bestResult.name}" (점수: ${bestScore.toFixed(2)})`);
  } else {
    console.log(`\n❌ 모든 검색 시도 실패: ${locationName}`);
  }

  return bestResult;
}

/**
 * 검색어 생성 전략
 */
function generateSearchQueries(locationName: string, context?: string): string[] {
  const queries: string[] = [];

  // 1. 기본 장소명
  queries.push(locationName);

  // 2. 시설명 조합 (우리가 테스트에서 효과적이었던 것들)
  const facilities = ['매표소', '입구', '안내소', '방문자센터', '주차장'];
  facilities.forEach(facility => {
    queries.push(`${locationName} ${facility}`);
  });

  // 3. 영어 검색 (한국 장소의 경우)
  if (locationName.match(/[가-힣]/)) {
    // 한국어 장소명인 경우 영어 검색도 추가
    const englishNames = getEnglishName(locationName);
    englishNames.forEach(name => queries.push(name));
  }

  // 4. 컨텍스트 기반 (관광, 문화재 등)
  if (context) {
    queries.push(`${locationName} ${context}`);
  }

  // 중복 제거 및 정렬 (짧은 것부터)
  return [...new Set(queries)].sort((a, b) => a.length - b.length);
}

/**
 * 검색 결과 신뢰도 계산
 */
function calculateConfidence(candidate: any, originalQuery: string): number {
  let confidence = 0.5; // 기본값

  // 이름 유사도
  if (candidate.name) {
    const nameSimilarity = calculateNameSimilarity(candidate.name, originalQuery);
    confidence += nameSimilarity * 0.3;
  }

  // 평점이 있으면 신뢰도 증가
  if (candidate.rating && candidate.rating > 3.0) {
    confidence += 0.1;
  }

  // 주소 정확도
  if (candidate.formatted_address && candidate.formatted_address.includes('대한민국')) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * 검색 결과 점수 계산 (최고 결과 선택용)
 */
function calculateSearchScore(result: GooglePlacesResult, originalName: string, searchQuery: string): number {
  let score = result.confidence * 100; // 기본 신뢰도 점수

  // 이름 매칭 보너스
  const nameMatch = calculateNameSimilarity(result.name, originalName);
  score += nameMatch * 50;

  // 검색어 길이 패널티 (짧은 검색어가 더 정확할 가능성)
  score -= searchQuery.length * 0.1;

  // 한국 주소 보너스
  if (result.address.includes('대한민국')) {
    score += 10;
  }

  return score;
}

/**
 * 이름 유사도 계산 (간단한 버전)
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const clean1 = name1.replace(/[^\w가-힣]/g, '').toLowerCase();
  const clean2 = name2.replace(/[^\w가-힣]/g, '').toLowerCase();
  
  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    return 1.0;
  }
  
  // 간단한 편집 거리 기반 유사도 (추후 개선 가능)
  const longer = clean1.length > clean2.length ? clean1 : clean2;
  const shorter = clean1.length > clean2.length ? clean2 : clean1;
  
  if (longer.length === 0) return 0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return 1.0 - editDistance / longer.length;
}

/**
 * 편집 거리 계산
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * 한국 장소명의 영어명 추정 (간단한 매핑)
 */
function getEnglishName(koreanName: string): string[] {
  const nameMap: { [key: string]: string[] } = {
    '자갈치시장': ['Jagalchi Market', 'Jagalchi Fish Market'],
    '부산역': ['Busan Station', 'Busan Railway Station'],
    '해운대해수욕장': ['Haeundae Beach', 'Haeundae'],
    '광안리해수욕장': ['Gwangalli Beach', 'Gwangalli'],
    '감천문화마을': ['Gamcheon Culture Village', 'Gamcheon Village'],
    '태종대': ['Taejongdae Park', 'Taejongdae'],
    // 필요에 따라 확장 가능
  };

  return nameMap[koreanName] || [];
}

export { smartPlacesSearch as default };