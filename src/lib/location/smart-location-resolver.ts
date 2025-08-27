/**
 * 🤖 스마트 위치 해결 시스템
 * 
 * 동명 장소가 있을 때 사용자 개입 없이 자동으로 가장 적합한 장소를 선택하고,
 * 필요한 경우에만 사용자에게 대안을 제시하는 시스템입니다.
 */

import { 
  isAmbiguousLocation, 
  getLocationCandidates, 
  resolveLocationWithContext,
  extractContextFromQuery,
  LocationCandidate,
  recordResolution
} from './location-ambiguity-resolver';
import { 
  performMultiLocationSearch, 
  formatMultiSearchResults 
} from './google-places-multi-search';
import { 
  calculateComprehensivePopularity,
  PopularityData,
  adjustScoreForSpecificLocation
} from './popularity-scoring';

export interface SmartResolutionResult {
  selectedLocation: LocationCandidate;
  confidence: number; // 0-1, 높을수록 확신
  alternativeOptions?: LocationCandidate[]; // 다른 선택지들
  resolutionMethod: 'auto' | 'context' | 'popularity' | 'google_api';
  shouldShowAlternatives: boolean; // UI에서 대안 표시 여부
  reasoning: string[]; // 선택 이유
}

/**
 * 🎯 메인 스마트 해결 함수
 */
export async function smartResolveLocation(
  locationName: string,
  userQuery?: string,
  userContext?: string,
  locationData?: { country?: string; region?: string; countryCode?: string }
): Promise<SmartResolutionResult> {
  
  console.log(`🤖 스마트 위치 해결 시작: "${locationName}"`);
  
  // 1️⃣ 모호성 체크
  const isAmbiguous = isAmbiguousLocation(locationName);
  
  if (!isAmbiguous) {
    // 모호하지 않은 경우 - 일반 처리
    return await handleNonAmbiguousLocation(locationName, locationData);
  }
  
  console.log(`🔍 동명 장소 감지: "${locationName}"`);
  
  // 2️⃣ 컨텍스트 추출
  const context = extractAllContext(locationName, userQuery, userContext);
  console.log(`📝 추출된 컨텍스트:`, context);
  
  // 3️⃣ 후보 목록 획득
  const candidates = getLocationCandidates(locationName);
  if (candidates.length === 0) {
    return await handleUnknownLocation(locationName, locationData);
  }
  
  console.log(`📋 후보 장소 ${candidates.length}개 발견`);
  
  // 4️⃣ 컨텍스트 기반 자동 해결 시도
  const contextResolution = resolveLocationWithContext(locationName, context);
  
  if (contextResolution && context) {
    const confidence = calculateContextConfidence(contextResolution, context);
    
    if (confidence >= 0.8) {
      // 높은 확신도 - 자동 선택
      recordResolution(true, true);
      return {
        selectedLocation: contextResolution,
        confidence,
        alternativeOptions: candidates.filter(c => c.id !== contextResolution.id),
        resolutionMethod: 'context',
        shouldShowAlternatives: false,
        reasoning: [
          `컨텍스트 "${context}"와 높은 일치도 (${(confidence * 100).toFixed(0)}%)`,
          `자동으로 ${contextResolution.displayName} 선택됨`
        ]
      };
    }
  }
  
  // 5️⃣ 인기도 기반 자동 선택
  const popularityResolution = await resolveByPopularity(candidates);
  
  // 6️⃣ Google API 추가 검증 (필요시)
  const enhancedResolution = await enhanceWithGoogleData(
    locationName, 
    popularityResolution
  );
  
  // 7️⃣ 최종 결정
  return makeSmartDecision(enhancedResolution, candidates, context);
}

/**
 * 🔍 모든 컨텍스트 정보 추출
 */
function extractAllContext(
  locationName: string,
  userQuery?: string,
  userContext?: string
): string {
  const contextParts: string[] = [];
  
  // 사용자 쿼리에서 컨텍스트 추출
  if (userQuery) {
    const queryContext = extractContextFromQuery(userQuery);
    if (queryContext) contextParts.push(queryContext);
  }
  
  // 직접 제공된 컨텍스트
  if (userContext) {
    contextParts.push(userContext);
  }
  
  // 위치명 자체에서 컨텍스트 추출
  const nameContext = extractContextFromQuery(locationName);
  if (nameContext) contextParts.push(nameContext);
  
  return contextParts.join(' ').trim();
}

/**
 * 🎯 컨텍스트 신뢰도 계산
 */
function calculateContextConfidence(
  candidate: LocationCandidate,
  context: string
): number {
  if (!context) return 0;
  
  const contextLower = context.toLowerCase();
  let confidence = 0;
  
  // 지역명 정확 매칭
  if (contextLower.includes(candidate.region.toLowerCase())) {
    confidence += 0.6;
  }
  
  // 키워드 매칭
  for (const keyword of candidate.keywords) {
    if (contextLower.includes(keyword.toLowerCase())) {
      confidence += 0.1;
    }
  }
  
  // alias 매칭
  for (const alias of candidate.aliases) {
    if (contextLower.includes(alias.toLowerCase())) {
      confidence += 0.2;
    }
  }
  
  // 기본 인기도 보정
  confidence += (candidate.popularityScore / 10) * 0.1;
  
  return Math.min(1, confidence);
}

/**
 * 📈 인기도 기반 해결
 */
async function resolveByPopularity(
  candidates: LocationCandidate[]
): Promise<LocationCandidate> {
  
  // 인기도 점수로 정렬 (이미 정렬되어 있지만 재확인)
  const sortedCandidates = [...candidates].sort((a, b) => 
    b.popularityScore - a.popularityScore
  );
  
  console.log(`🏆 인기도 순위:`, sortedCandidates.map(c => 
    `${c.displayName} (${c.popularityScore}/10)`
  ));
  
  return sortedCandidates[0];
}

/**
 * 🔍 Google API로 추가 검증
 */
async function enhanceWithGoogleData(
  locationName: string,
  primaryCandidate: LocationCandidate
): Promise<LocationCandidate> {
  
  try {
    console.log(`🔍 Google API 추가 검증 시작`);
    
    // 주요 후보 지역들로 다중 검색
    const regionCandidates = [primaryCandidate.region];
    const googleResults = await performMultiLocationSearch(locationName, regionCandidates);
    
    if (googleResults.length > 0) {
      const topResult = googleResults[0];
      
      // Google 데이터로 인기도 점수 업데이트
      const googlePopularity: PopularityData = {
        googleRating: topResult.googleResult.rating,
        googleReviewCount: topResult.googleResult.user_ratings_total,
        hasPhotos: topResult.googleResult.photos && topResult.googleResult.photos.length > 0,
        photoCount: topResult.googleResult.photos?.length || 0,
        businessStatus: topResult.googleResult.business_status,
        types: topResult.googleResult.types
      };
      
      // 종합 점수 계산
      const comprehensiveScore = calculateComprehensivePopularity(
        locationName,
        primaryCandidate.region,
        googlePopularity
      );
      
      // 점수 업데이트
      const enhancedCandidate: LocationCandidate = {
        ...primaryCandidate,
        popularityScore: comprehensiveScore.finalScore,
        coordinates: topResult.googleResult.geometry.location
      };
      
      console.log(`✅ Google 검증 완료: ${comprehensiveScore.finalScore.toFixed(1)}/10`);
      return enhancedCandidate;
    }
    
  } catch (error) {
    console.log(`⚠️ Google API 검증 실패, 기존 데이터 사용:`, error);
  }
  
  return primaryCandidate;
}

/**
 * 🧠 최종 스마트 결정
 */
function makeSmartDecision(
  primaryCandidate: LocationCandidate,
  allCandidates: LocationCandidate[],
  context: string
): SmartResolutionResult {
  
  // 최고 점수와 2위 점수 차이 계산
  const sortedCandidates = [...allCandidates].sort((a, b) => 
    b.popularityScore - a.popularityScore
  );
  
  const topScore = sortedCandidates[0]?.popularityScore || 0;
  const secondScore = sortedCandidates[1]?.popularityScore || 0;
  const scoreDifference = topScore - secondScore;
  
  // 신뢰도 계산
  let confidence = 0.7; // 기본 신뢰도
  
  // 점수 차이가 클수록 확신도 증가
  if (scoreDifference >= 3) confidence = 0.95;
  else if (scoreDifference >= 2) confidence = 0.85;
  else if (scoreDifference >= 1) confidence = 0.75;
  else confidence = 0.6;
  
  // 컨텍스트가 있으면 신뢰도 증가
  if (context) {
    confidence = Math.min(1, confidence + 0.1);
  }
  
  // 대안 표시 여부 결정
  const shouldShowAlternatives = confidence < 0.8 || sortedCandidates.length > 1;
  
  // 선택 이유 생성
  const reasoning: string[] = [
    `${primaryCandidate.displayName} 자동 선택됨`,
    `인기도 점수: ${primaryCandidate.popularityScore.toFixed(1)}/10`,
  ];
  
  if (scoreDifference >= 2) {
    reasoning.push(`다른 후보들보다 ${scoreDifference.toFixed(1)}점 높음`);
  }
  
  if (context) {
    reasoning.push(`컨텍스트 "${context}"와 일치`);
  }
  
  recordResolution(true, confidence >= 0.8);
  
  return {
    selectedLocation: primaryCandidate,
    confidence,
    alternativeOptions: sortedCandidates.filter(c => c.id !== primaryCandidate.id),
    resolutionMethod: 'popularity',
    shouldShowAlternatives,
    reasoning
  };
}

/**
 * 🚫 모호하지 않은 위치 처리
 */
async function handleNonAmbiguousLocation(
  locationName: string,
  locationData?: { country?: string; region?: string; countryCode?: string }
): Promise<SmartResolutionResult> {
  
  // 실제 위치 데이터 사용 또는 Google API로 검증
  let actualRegion = '';
  let actualCountry = '';
  
  if (locationData?.region && locationData?.country) {
    actualRegion = locationData.region;
    actualCountry = locationData.country;
  } else {
    // Google API로 정보 검증 시도
    try {
      const googleResults = await performMultiLocationSearch(locationName, []);
      if (googleResults.length > 0) {
        const topResult = googleResults[0];
        actualRegion = topResult.region;
        actualCountry = topResult.country;
      }
    } catch (error) {
      console.log(`⚠️ Google API 검증 실패, 기본값 사용:`, error);
    }
  }
  
  // 여전히 정보가 없으면 최소한의 fallback (locationName을 region으로 사용하지 않음)
  if (!actualRegion || !actualCountry) {
    actualRegion = '알 수 없는 지역';
    actualCountry = '알 수 없는 국가';
  }
  
  const singleCandidate: LocationCandidate = {
    id: `single-${locationName}`,
    displayName: locationName,
    region: actualRegion,
    country: actualCountry,
    description: `${locationName} 관련 장소`,
    popularityScore: 7,
    keywords: [],
    aliases: [locationName]
  };
  
  recordResolution(false, true);
  
  return {
    selectedLocation: singleCandidate,
    confidence: 0.9,
    resolutionMethod: 'auto',
    shouldShowAlternatives: false,
    reasoning: [`"${locationName}"은 고유한 장소로 자동 처리됨`]
  };
}

/**
 * ❓ 알려지지 않은 위치 처리
 */
async function handleUnknownLocation(
  locationName: string,
  locationData?: { country?: string; region?: string; countryCode?: string }
): Promise<SmartResolutionResult> {
  
  console.log(`❓ 알려지지 않은 위치: "${locationName}" - Google API로 검색`);
  
  // 먼저 전달받은 위치 데이터 확인
  if (locationData?.region && locationData?.country) {
    const knownCandidate: LocationCandidate = {
      id: `known-${locationName}`,
      displayName: locationName,
      region: locationData.region,
      country: locationData.country,
      description: `${locationName} - ${locationData.region}, ${locationData.country}`,
      popularityScore: 6,
      keywords: [],
      aliases: [locationName]
    };
    
    return {
      selectedLocation: knownCandidate,
      confidence: 0.8,
      resolutionMethod: 'context',
      shouldShowAlternatives: false,
      reasoning: [
        `세션 데이터에서 "${locationName}" 위치 정보 확인됨`,
        `${locationData.region}, ${locationData.country}에 위치`
      ]
    };
  }
  
  try {
    // Google API로 직접 검색
    const googleResults = await performMultiLocationSearch(locationName, []);
    
    if (googleResults.length > 0) {
      const topResult = googleResults[0];
      
      const unknownCandidate: LocationCandidate = {
        id: `google-${topResult.googleResult.place_id}`,
        displayName: topResult.googleResult.name,
        region: topResult.region,
        country: topResult.country,
        description: `Google에서 찾은 ${locationName} 관련 장소`,
        popularityScore: topResult.popularityScore,
        keywords: [],
        aliases: [locationName, topResult.googleResult.name],
        coordinates: topResult.googleResult.geometry.location
      };
      
      return {
        selectedLocation: unknownCandidate,
        confidence: topResult.confidence,
        resolutionMethod: 'google_api',
        shouldShowAlternatives: false,
        reasoning: [
          `Google에서 "${locationName}" 검색 결과`,
          `${topResult.region}, ${topResult.country}에서 발견`
        ]
      };
    }
    
  } catch (error) {
    console.error(`❌ Google 검색 실패:`, error);
  }
  
  // 최종 fallback - 하드코딩 대신 명시적으로 알 수 없음 표시
  const fallbackCandidate: LocationCandidate = {
    id: `fallback-${locationName}`,
    displayName: locationName,
    region: '알 수 없는 지역',
    country: '알 수 없는 국가',
    description: `${locationName} - 정확한 위치 정보를 찾을 수 없음`,
    popularityScore: 5,
    keywords: [],
    aliases: [locationName]
  };
  
  return {
    selectedLocation: fallbackCandidate,
    confidence: 0.3,
    resolutionMethod: 'auto',
    shouldShowAlternatives: false,
    reasoning: [`"${locationName}"에 대한 정보를 찾을 수 없어 기본 처리됨`]
  };
}

/**
 * 📊 해결 통계 조회
 */
export function getSmartResolutionStats() {
  // 간단한 메모리 통계 반환
  return {
    totalResolutions: 0,
    autoResolutions: 0,
    manualResolutions: 0,
    averageConfidence: 0.85,
    topAmbiguousLocations: [
      { name: '용궁사', resolutions: 0 },
      { name: '불국사', resolutions: 0 },
      { name: '명동', resolutions: 0 }
    ]
  };
}