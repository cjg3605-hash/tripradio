/**
 * 🏆 인기도 기반 우선순위 점수 시스템
 * 
 * 다양한 데이터 소스를 종합하여 장소의 실제 인기도와 
 * 관광 가치를 정확하게 평가하는 시스템입니다.
 */

export interface PopularityData {
  googleRating?: number;
  googleReviewCount?: number;
  hasPhotos?: boolean;
  photoCount?: number;
  isVerified?: boolean;
  businessStatus?: string;
  openingHours?: boolean;
  websiteExists?: boolean;
  types?: string[];
}

export interface TourismMetrics {
  accessibility: number; // 접근성 점수 (1-10)
  infrastructure: number; // 관광 인프라 점수 (1-10)
  culturalSignificance: number; // 문화적 중요성 (1-10)
  seasonalPopularity: number; // 계절별 인기도 (1-10)
  internationalAppeal: number; // 국제적 어필 (1-10)
}

export interface ComprehensiveScore {
  popularityScore: number; // Google 데이터 기반 (1-10)
  tourismScore: number; // 관광 가치 점수 (1-10)
  finalScore: number; // 최종 종합 점수 (1-10)
  confidence: number; // 점수 신뢰도 (0-1)
  reasoning: string[]; // 점수 산정 근거
}

/**
 * 🎯 종합 인기도 점수 계산
 */
export function calculateComprehensivePopularity(
  locationName: string,
  region: string,
  popularityData: PopularityData,
  tourismMetrics?: Partial<TourismMetrics>
): ComprehensiveScore {
  
  console.log(`📊 종합 인기도 계산 시작: ${locationName} (${region})`);
  
  // 1️⃣ Google 데이터 기반 인기도
  const popularityScore = calculateGooglePopularityScore(popularityData);
  
  // 2️⃣ 관광 가치 점수
  const tourismScore = calculateTourismScore(locationName, region, tourismMetrics);
  
  // 3️⃣ 지역별 가중치 적용
  const regionalWeight = getRegionalWeight(region);
  
  // 4️⃣ 최종 점수 계산 (가중 평균)
  const finalScore = calculateFinalScore(popularityScore, tourismScore, regionalWeight);
  
  // 5️⃣ 신뢰도 계산
  const confidence = calculateScoreConfidence(popularityData, tourismMetrics);
  
  // 6️⃣ 점수 산정 근거 생성
  const reasoning = generateScoreReasoning(
    locationName, 
    popularityScore, 
    tourismScore, 
    regionalWeight, 
    popularityData
  );
  
  const result: ComprehensiveScore = {
    popularityScore,
    tourismScore,
    finalScore,
    confidence,
    reasoning
  };
  
  console.log(`✅ 종합 점수 완료:`, {
    location: `${locationName} (${region})`,
    final: finalScore.toFixed(1),
    confidence: (confidence * 100).toFixed(1) + '%'
  });
  
  return result;
}

/**
 * 📈 Google 데이터 기반 인기도 점수 (1-10)
 */
function calculateGooglePopularityScore(data: PopularityData): number {
  let score = 5; // 기본 점수
  const factors: string[] = [];
  
  // 🌟 평점 기반 점수 (가장 중요한 지표)
  if (data.googleRating && data.googleRating > 0) {
    const ratingScore = ((data.googleRating - 2.5) / 2.5) * 3; // 2.5-5.0을 0-3점으로 변환
    score += ratingScore;
    factors.push(`평점 ${data.googleRating.toFixed(1)} (+${ratingScore.toFixed(1)})`);
  }
  
  // 📝 리뷰 수 기반 점수
  if (data.googleReviewCount && data.googleReviewCount > 0) {
    let reviewScore = 0;
    if (data.googleReviewCount > 10000) reviewScore = 2.0;
    else if (data.googleReviewCount > 5000) reviewScore = 1.5;
    else if (data.googleReviewCount > 1000) reviewScore = 1.2;
    else if (data.googleReviewCount > 500) reviewScore = 1.0;
    else if (data.googleReviewCount > 100) reviewScore = 0.7;
    else if (data.googleReviewCount > 50) reviewScore = 0.5;
    else reviewScore = 0.2;
    
    score += reviewScore;
    factors.push(`리뷰 ${data.googleReviewCount}개 (+${reviewScore})`);
  }
  
  // 📸 사진 관련 점수
  if (data.hasPhotos && data.photoCount) {
    const photoScore = Math.min(data.photoCount * 0.05, 1.0); // 최대 1점
    score += photoScore;
    factors.push(`사진 ${data.photoCount}개 (+${photoScore.toFixed(1)})`);
  }
  
  // ✅ 검증 상태
  if (data.isVerified) {
    score += 0.5;
    factors.push('검증됨 (+0.5)');
  }
  
  // 🏢 비즈니스 상태
  if (data.businessStatus === 'OPERATIONAL') {
    score += 0.3;
    factors.push('운영중 (+0.3)');
  } else if (data.businessStatus === 'CLOSED_PERMANENTLY') {
    score -= 2.0;
    factors.push('영구폐쇄 (-2.0)');
  }
  
  // 🕒 운영시간 정보
  if (data.openingHours) {
    score += 0.2;
    factors.push('운영시간 정보 (+0.2)');
  }
  
  // 🌐 웹사이트 존재
  if (data.websiteExists) {
    score += 0.3;
    factors.push('웹사이트 (+0.3)');
  }
  
  // 🏷️ 장소 유형별 보너스
  if (data.types) {
    if (data.types.includes('tourist_attraction')) {
      score += 1.0;
      factors.push('관광명소 (+1.0)');
    }
    if (data.types.includes('museum')) {
      score += 0.5;
      factors.push('박물관 (+0.5)');
    }
    if (data.types.includes('amusement_park')) {
      score += 0.7;
      factors.push('놀이공원 (+0.7)');
    }
    if (data.types.includes('natural_feature')) {
      score += 0.6;
      factors.push('자연명소 (+0.6)');
    }
  }
  
  console.log(`📊 Google 인기도 점수: ${score.toFixed(1)}`, factors);
  
  return Math.max(1, Math.min(10, score));
}

/**
 * 🏛️ 관광 가치 점수 계산 (1-10)
 */
function calculateTourismScore(
  locationName: string, 
  region: string, 
  metrics?: Partial<TourismMetrics>
): number {
  
  // 기본 메트릭스 (사용자 제공 데이터가 없을 때의 추정값)
  const defaultMetrics = estimateDefaultTourismMetrics(locationName, region);
  const finalMetrics = { ...defaultMetrics, ...metrics };
  
  // 가중 평균 계산 (각 요소의 중요도 반영)
  const weights = {
    accessibility: 0.25,      // 접근성 25%
    infrastructure: 0.20,     // 인프라 20%
    culturalSignificance: 0.25, // 문화적 중요성 25%
    seasonalPopularity: 0.15,   // 계절성 15%
    internationalAppeal: 0.15   // 국제적 어필 15%
  };
  
  const score = 
    finalMetrics.accessibility * weights.accessibility +
    finalMetrics.infrastructure * weights.infrastructure +
    finalMetrics.culturalSignificance * weights.culturalSignificance +
    finalMetrics.seasonalPopularity * weights.seasonalPopularity +
    finalMetrics.internationalAppeal * weights.internationalAppeal;
  
  console.log(`🏛️ 관광 가치 점수: ${score.toFixed(1)}`, finalMetrics);
  
  return Math.max(1, Math.min(10, score));
}

/**
 * 📍 기본 관광 메트릭스 추정
 */
function estimateDefaultTourismMetrics(locationName: string, region: string): TourismMetrics {
  const name = locationName.toLowerCase();
  
  let accessibility = 5;
  let infrastructure = 5;
  let culturalSignificance = 5;
  let seasonalPopularity = 6;
  let internationalAppeal = 5;
  
  // 🏛️ 문화재/역사 유적지
  if (name.includes('궁') || name.includes('palace')) {
    culturalSignificance = 9;
    internationalAppeal = 8;
    infrastructure = 8;
  }
  
  if (name.includes('사') || name.includes('temple')) {
    culturalSignificance = 8;
    accessibility = 7;
    internationalAppeal = 7;
  }
  
  // 🌊 자연/바다 관련
  if (name.includes('해') || name.includes('바다') || name.includes('beach')) {
    seasonalPopularity = 9; // 계절성 높음
    internationalAppeal = 8;
    accessibility = 6;
  }
  
  // 🏔️ 산/자연
  if (name.includes('산') || name.includes('mountain')) {
    culturalSignificance = 7;
    seasonalPopularity = 8;
    accessibility = 4; // 등산 필요
  }
  
  // 🌆 대도시 지역 보정
  if (['서울', '부산', '대구', '인천'].includes(region)) {
    accessibility += 2;
    infrastructure += 2;
    internationalAppeal += 1;
  }
  
  // 🏞️ 제주도 특별 보정
  if (region === '제주') {
    seasonalPopularity += 2;
    internationalAppeal += 2;
    accessibility += 1;
  }
  
  // 🏛️ 경주 문화재 특별 보정
  if (region === '경주') {
    culturalSignificance += 2;
    internationalAppeal += 1;
  }
  
  return {
    accessibility: Math.min(10, accessibility),
    infrastructure: Math.min(10, infrastructure),
    culturalSignificance: Math.min(10, culturalSignificance),
    seasonalPopularity: Math.min(10, seasonalPopularity),
    internationalAppeal: Math.min(10, internationalAppeal)
  };
}

/**
 * 🗺️ 지역별 가중치 계산
 */
function getRegionalWeight(region: string): number {
  const regionWeights: { [key: string]: number } = {
    // 특별시/광역시 (높은 관광 인프라)
    '서울': 1.2,
    '부산': 1.15,
    '대구': 1.05,
    '인천': 1.1,
    '광주': 1.0,
    '대전': 1.0,
    '울산': 1.0,
    
    // 특별 관광지역
    '제주': 1.3,
    '경주': 1.25,
    '강릉': 1.1,
    '속초': 1.1,
    
    // 일반 도시
    '수원': 1.05,
    '성남': 1.0,
    '고양': 1.0,
    
    // 기본값
    '기타': 1.0
  };
  
  return regionWeights[region] || regionWeights['기타'];
}

/**
 * 🧮 최종 점수 계산
 */
function calculateFinalScore(
  popularityScore: number, 
  tourismScore: number, 
  regionalWeight: number
): number {
  // 인기도 60%, 관광가치 40% 비율로 계산
  const weightedScore = (popularityScore * 0.6) + (tourismScore * 0.4);
  
  // 지역 가중치 적용
  const finalScore = weightedScore * regionalWeight;
  
  return Math.max(1, Math.min(10, finalScore));
}

/**
 * 🎯 점수 신뢰도 계산
 */
function calculateScoreConfidence(
  popularityData: PopularityData,
  tourismMetrics?: Partial<TourismMetrics>
): number {
  let confidence = 0.5; // 기본 신뢰도
  
  // Google 데이터 완성도
  if (popularityData.googleRating) confidence += 0.2;
  if (popularityData.googleReviewCount && popularityData.googleReviewCount > 10) confidence += 0.2;
  if (popularityData.hasPhotos) confidence += 0.1;
  if (popularityData.businessStatus) confidence += 0.1;
  
  // 관광 메트릭스 제공 여부
  if (tourismMetrics && Object.keys(tourismMetrics).length > 0) {
    confidence += 0.1;
  }
  
  return Math.min(1, confidence);
}

/**
 * 📝 점수 산정 근거 생성
 */
function generateScoreReasoning(
  locationName: string,
  popularityScore: number,
  tourismScore: number,
  regionalWeight: number,
  popularityData: PopularityData
): string[] {
  const reasoning: string[] = [];
  
  // 전체 점수 요약
  reasoning.push(`📊 종합 평가: 인기도 ${popularityScore.toFixed(1)}/10, 관광가치 ${tourismScore.toFixed(1)}/10`);
  
  // Google 데이터 근거
  if (popularityData.googleRating && popularityData.googleReviewCount) {
    reasoning.push(
      `⭐ Google 평점 ${popularityData.googleRating.toFixed(1)}/5.0 (리뷰 ${popularityData.googleReviewCount.toLocaleString()}개)`
    );
  }
  
  // 지역 가중치
  if (regionalWeight !== 1.0) {
    const bonus = ((regionalWeight - 1) * 100).toFixed(0);
    reasoning.push(`📍 지역 보너스: +${bonus}% (관광 인프라 우수)`);
  }
  
  // 특별 요소들
  if (popularityData.types?.includes('tourist_attraction')) {
    reasoning.push(`🎯 공식 관광명소로 지정됨`);
  }
  
  if (popularityData.isVerified) {
    reasoning.push(`✅ Google 검증 완료`);
  }
  
  return reasoning;
}

/**
 * 🔍 장소별 맞춤 점수 조정
 */
export function adjustScoreForSpecificLocation(
  locationName: string,
  baseScore: number
): number {
  let adjustedScore = baseScore;
  const name = locationName.toLowerCase();
  
  // 🏆 세계적으로 유명한 장소들
  const worldFamousPlaces = [
    '에펠탑', '루브르', '콜로세움', '타지마할', '만리장성',
    '자유의여신상', '시드니오페라하우스', '마추픽추'
  ];
  
  if (worldFamousPlaces.some(place => name.includes(place.toLowerCase()))) {
    adjustedScore = Math.min(10, adjustedScore + 1);
  }
  
  // 🇰🇷 한국 대표 관광지
  const koreanLandmarks = [
    '경복궁', '불국사', '제주도', '한라산', '설악산', '부산타워'
  ];
  
  if (koreanLandmarks.some(place => name.includes(place))) {
    adjustedScore = Math.min(10, adjustedScore + 0.5);
  }
  
  return adjustedScore;
}

/**
 * 📈 실시간 인기도 데이터 업데이트 (향후 구현용)
 */
export interface RealTimePopularityData {
  searchTrends: number; // 검색 트렌드 점수
  socialMediaMentions: number; // 소셜미디어 언급량
  currentEvents: string[]; // 현재 관련 이벤트들
  seasonalAdjustment: number; // 계절 조정 계수
}

export function updateWithRealTimeData(
  baseScore: ComprehensiveScore,
  realTimeData: RealTimePopularityData
): ComprehensiveScore {
  // 실시간 데이터를 반영한 점수 조정 로직
  // 향후 구현 예정
  return baseScore;
}