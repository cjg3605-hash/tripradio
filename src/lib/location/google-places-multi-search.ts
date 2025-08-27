/**
 * 🔍 Google Places API 다중 검색 시스템
 * 
 * 동명 장소에 대해 여러 검색어로 동시에 검색하여
 * 가장 적합한 결과를 찾아내는 시스템입니다.
 */

import { LocationCandidate } from './location-ambiguity-resolver';

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: any[];
  types: string[];
  business_status?: string;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface EnhancedLocationResult {
  originalQuery: string;
  googleResult: GooglePlaceResult;
  popularityScore: number;
  confidence: number;
  region: string;
  country: string;
  isRecommended: boolean;
}

/**
 * 🎯 동명 장소에 대한 다중 검색 실행
 */
export async function performMultiLocationSearch(
  baseName: string,
  regionCandidates: string[] = []
): Promise<EnhancedLocationResult[]> {
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_PLACES_API_KEY 환경변수가 설정되지 않음');
    return [];
  }

  console.log(`🔍 다중 검색 시작: "${baseName}" with candidates:`, regionCandidates);

  // 🎯 검색 쿼리 생성
  const searchQueries = generateMultiSearchQueries(baseName, regionCandidates);
  console.log(`📋 생성된 검색 쿼리들:`, searchQueries);

  const results: EnhancedLocationResult[] = [];

  // 🚀 병렬 검색 실행
  const searchPromises = searchQueries.map(async (query, index) => {
    try {
      // API 호출 제한을 위한 지연 (각 요청마다 200ms씩 지연)
      await new Promise(resolve => setTimeout(resolve, index * 200));
      
      console.log(`🔎 검색 중: "${query}"`);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
        `query=${encodeURIComponent(query)}&` +
        `key=${apiKey}&` +
        `language=ko&` +
        `fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,photos,types,business_status`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.log(`⚠️ 검색 실패: "${query}" → ${data.status}`);
        return null;
      }

      if (!data.results || data.results.length === 0) {
        console.log(`📭 결과 없음: "${query}"`);
        return null;
      }

      // 가장 관련성 높은 첫 번째 결과 처리
      const googleResult = data.results[0];
      console.log(`✅ 검색 성공: "${query}" → ${googleResult.name}`);

      return processSearchResult(query, googleResult, baseName);

    } catch (error) {
      console.error(`❌ 검색 오류 (${query}):`, error);
      return null;
    }
  });

  // 🎯 모든 검색 결과 수집
  const searchResults = await Promise.all(searchPromises);
  
  // null 제거 및 결과 정리
  const validResults = searchResults.filter((result): result is EnhancedLocationResult => 
    result !== null
  );

  console.log(`🎉 다중 검색 완료: ${validResults.length}개 유효 결과`);

  // 🏆 결과 정렬 및 중복 제거
  return deduplicateAndRankResults(validResults);
}

/**
 * 🔧 다중 검색 쿼리 생성
 */
function generateMultiSearchQueries(baseName: string, regionCandidates: string[]): string[] {
  const queries: string[] = [];
  
  // 1️⃣ 기본 검색어
  queries.push(baseName);
  
  // 2️⃣ 지역 조합 검색어
  for (const region of regionCandidates) {
    queries.push(`${baseName} ${region}`);
    queries.push(`${region} ${baseName}`);
  }
  
  // 3️⃣ 특수 키워드 조합 (장소 유형별)
  const specialKeywords = getSpecialKeywords(baseName);
  for (const keyword of specialKeywords) {
    queries.push(`${baseName} ${keyword}`);
  }
  
  // 4️⃣ 중복 제거 및 정리
  return [...new Set(queries)].slice(0, 8); // 최대 8개로 제한
}

/**
 * 🎨 장소별 특수 키워드 반환
 */
function getSpecialKeywords(placeName: string): string[] {
  const keywords: string[] = [];
  
  // 사찰 관련
  if (placeName.includes('사') || placeName.includes('temple')) {
    keywords.push('절', 'temple', '사찰', '불교');
  }
  
  // 궁전 관련
  if (placeName.includes('궁') || placeName.includes('palace')) {
    keywords.push('궁전', 'palace', '왕궁');
  }
  
  // 산 관련
  if (placeName.includes('산') || placeName.includes('mountain')) {
    keywords.push('산', 'mountain', '등산', 'hiking');
  }
  
  // 바다/해안 관련
  if (placeName.includes('해') || placeName.includes('바다')) {
    keywords.push('바다', 'sea', 'beach', '해안');
  }
  
  return keywords;
}

/**
 * 🏗️ 검색 결과 처리 및 점수 계산
 */
async function processSearchResult(
  originalQuery: string,
  googleResult: GooglePlaceResult,
  baseName: string
): Promise<EnhancedLocationResult> {
  
  // 📊 인기도 점수 계산
  const popularityScore = calculatePopularityScore(googleResult);
  
  // 🎯 신뢰도 점수 계산
  const confidence = calculateConfidenceScore(googleResult, baseName);
  
  // 🗺️ 지역 정보 추출
  const { region, country } = extractRegionInfo(googleResult.formatted_address);
  
  // 🏆 추천 여부 결정
  const isRecommended = popularityScore >= 6 && confidence >= 0.7;
  
  console.log(`📊 결과 처리: ${googleResult.name}`, {
    popularity: popularityScore,
    confidence: confidence.toFixed(2),
    region,
    recommended: isRecommended
  });

  return {
    originalQuery,
    googleResult,
    popularityScore,
    confidence,
    region,
    country,
    isRecommended
  };
}

/**
 * 📈 인기도 점수 계산 (1-10)
 */
function calculatePopularityScore(result: GooglePlaceResult): number {
  let score = 5; // 기본 점수
  
  // 평점 기반 점수
  if (result.rating) {
    score += (result.rating - 3) * 2; // 3점 기준으로 정규화
  }
  
  // 리뷰 수 기반 점수
  if (result.user_ratings_total) {
    if (result.user_ratings_total > 10000) score += 2;
    else if (result.user_ratings_total > 5000) score += 1.5;
    else if (result.user_ratings_total > 1000) score += 1;
    else if (result.user_ratings_total > 100) score += 0.5;
  }
  
  // 사진 수 기반 점수
  if (result.photos && result.photos.length > 0) {
    score += Math.min(result.photos.length * 0.1, 1);
  }
  
  // 장소 유형 기반 점수
  if (result.types) {
    if (result.types.includes('tourist_attraction')) score += 1;
    if (result.types.includes('establishment')) score += 0.5;
    if (result.types.includes('point_of_interest')) score += 0.5;
  }
  
  // 운영 상태 확인
  if (result.business_status === 'OPERATIONAL') {
    score += 0.5;
  } else if (result.business_status === 'CLOSED_PERMANENTLY') {
    score -= 2;
  }
  
  return Math.max(1, Math.min(10, score));
}

/**
 * 🎯 신뢰도 점수 계산 (0-1)
 */
function calculateConfidenceScore(result: GooglePlaceResult, baseName: string): number {
  let confidence = 0.8; // 기본 신뢰도
  
  // 이름 유사도
  const nameSimilarity = calculateNameSimilarity(result.name, baseName);
  confidence *= nameSimilarity;
  
  // 주소 정보 완성도
  if (result.formatted_address && result.formatted_address.length > 10) {
    confidence += 0.1;
  }
  
  // 좌표 정보 유무
  if (result.geometry && result.geometry.location) {
    confidence += 0.1;
  }
  
  return Math.min(1, confidence);
}

/**
 * 📝 이름 유사도 계산
 */
function calculateNameSimilarity(googleName: string, baseName: string): number {
  const normalizedGoogle = googleName.toLowerCase().replace(/\s+/g, '');
  const normalizedBase = baseName.toLowerCase().replace(/\s+/g, '');
  
  // 정확히 일치하는 경우
  if (normalizedGoogle === normalizedBase) return 1.0;
  
  // 포함 관계 확인
  if (normalizedGoogle.includes(normalizedBase) || normalizedBase.includes(normalizedGoogle)) {
    return 0.9;
  }
  
  // 레벤슈타인 거리 기반 유사도 (간단 버전)
  const maxLen = Math.max(normalizedGoogle.length, normalizedBase.length);
  const minLen = Math.min(normalizedGoogle.length, normalizedBase.length);
  
  return minLen / maxLen;
}

/**
 * 🗺️ 주소에서 지역 정보 추출
 */
function extractRegionInfo(address: string): { region: string; country: string } {
  if (!address) {
    return { region: '미분류', country: '미분류' };
  }
  
  const parts = address.split(',').map(part => part.trim());
  
  // 한국 주소 패턴 처리
  if (address.includes('대한민국') || address.includes('South Korea')) {
    const region = parts.find(part => 
      part.includes('시') || part.includes('도') || part.includes('구')
    ) || parts[1] || '미분류';
    
    return { region: region.replace(/\s+(시|도|구)$/, ''), country: '한국' };
  }
  
  // 기타 국가 처리
  const country = parts[parts.length - 1] || '미분류';
  const region = parts[parts.length - 2] || '미분류';
  
  return { region, country };
}

/**
 * 🔄 결과 중복 제거 및 순위 결정
 */
function deduplicateAndRankResults(results: EnhancedLocationResult[]): EnhancedLocationResult[] {
  // 1️⃣ place_id 기준 중복 제거
  const uniqueResults = results.reduce((acc, current) => {
    const existingIndex = acc.findIndex(item => 
      item.googleResult.place_id === current.googleResult.place_id
    );
    
    if (existingIndex === -1) {
      acc.push(current);
    } else {
      // 더 높은 신뢰도를 가진 결과로 교체
      if (current.confidence > acc[existingIndex].confidence) {
        acc[existingIndex] = current;
      }
    }
    
    return acc;
  }, [] as EnhancedLocationResult[]);
  
  // 2️⃣ 종합 점수 계산 및 정렬
  const rankedResults = uniqueResults.map(result => ({
    ...result,
    totalScore: (result.popularityScore * 0.6) + (result.confidence * 4) // confidence는 0-1 범위이므로 4배
  })).sort((a, b) => b.totalScore - a.totalScore);
  
  console.log(`🏆 최종 순위:`, rankedResults.map(r => ({
    name: r.googleResult.name,
    region: r.region,
    popularity: r.popularityScore,
    confidence: r.confidence.toFixed(2),
    total: r.totalScore.toFixed(2)
  })));
  
  return rankedResults;
}

/**
 * 🎨 사용자 UI용 결과 포맷팅
 */
export function formatMultiSearchResults(results: EnhancedLocationResult[]) {
  return results.map((result, index) => ({
    id: `multi-search-${index}`,
    name: result.googleResult.name,
    region: result.region,
    country: result.country,
    address: result.googleResult.formatted_address,
    coordinates: result.googleResult.geometry.location,
    rating: result.googleResult.rating,
    reviewCount: result.googleResult.user_ratings_total,
    popularityScore: result.popularityScore,
    confidence: result.confidence,
    isRecommended: result.isRecommended,
    searchQuery: result.originalQuery
  }));
}