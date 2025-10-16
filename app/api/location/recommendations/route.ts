// 📍 Phase 3: 실시간 위치 기반 추천 API
// src/app/api/location/recommendations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { locationService } from '@/lib/location/location-service';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

/**
 * 📍 실시간 위치 기반 추천 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📍 위치 기반 추천 API 요청 시작');
    
    const body = await request.json();
    const {
      latitude,
      longitude,
      accuracy,
      userPersonality = 'agreeableness',
      preferences = [],
      radius = 1000, // 기본 1km 반경
      maxRecommendations = 5
    } = body;
    
    // 입력 검증
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '유효한 위도와 경도를 제공해주세요.' 
        }),
        { status: 400, headers }
      );
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '위도는 -90~90, 경도는 -180~180 범위여야 합니다.' 
        }),
        { status: 400, headers }
      );
    }
    
    console.log(`📍 위치: ${latitude}, ${longitude} (반경: ${radius}m)`);
    console.log(`🎭 성격: ${userPersonality}, 선호: ${preferences.join(', ')}`);
    
    // 위치 정보 설정 (시뮬레이션)
    const mockCurrentLocation = {
      latitude,
      longitude,
      accuracy,
      timestamp: Date.now()
    };
    
    // Phase 3: 위치 기반 추천 생성
    const startTime = performance.now();
    
    try {
      // 실제로는 locationService를 사용하지만, API에서는 직접 로직 구현
      const recommendations = await generateLocationBasedRecommendations(
        mockCurrentLocation,
        userPersonality,
        preferences,
        radius,
        maxRecommendations
      );
      
      const processingTime = performance.now() - startTime;
      
      console.log(`✅ ${recommendations.length}개 위치 추천 생성 완료 (${processingTime.toFixed(0)}ms)`);
      
      return NextResponse.json({
        success: true,
        data: {
          recommendations,
          location: {
            latitude,
            longitude,
            accuracy
          },
          context: {
            radius,
            maxRecommendations,
            userPersonality,
            preferences,
            processingTime: Math.round(processingTime)
          }
        },
        // Phase 3 메타데이터
        phase3_location_system: {
          location_tracking: 'active',
          recommendation_engine: 'enabled',
          personality_integration: 'active',
          real_time_updates: 'supported',
          processing_time: Math.round(processingTime),
          recommendations_count: recommendations.length,
          search_radius: radius,
          accuracy_level: accuracy ? Math.round(accuracy) : 'unknown'
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (recommendationError) {
      console.error('❌ 추천 생성 실패:', recommendationError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '위치 기반 추천 생성에 실패했습니다.',
          details: recommendationError instanceof Error ? recommendationError.message : 'Unknown error'
        }),
        { status: 500, headers }
      );
    }
    
  } catch (error) {
    console.error('❌ 위치 추천 API 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'API 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
}

/**
 * 📍 위치 기반 추천 생성 로직
 */
async function generateLocationBasedRecommendations(
  location: { latitude: number; longitude: number; accuracy?: number; timestamp: number },
  userPersonality: string,
  preferences: string[],
  radius: number,
  maxRecommendations: number
) {
  // 1. 시뮬레이션 데이터: 실제로는 Google Places API, Foursquare 등 사용
  const mockNearbyPlaces = [
    {
      id: 'place_1',
      name: '경복궁',
      type: 'palace',
      coordinates: { 
        latitude: location.latitude + 0.001, 
        longitude: location.longitude + 0.001 
      },
      distance: 150,
      estimatedWalkTime: 2,
      rating: 4.7,
      openNow: true,
      popularity: 0.9,
      description: '조선 왕조의 대표적인 궁궐로 한국의 전통 건축미를 감상할 수 있습니다.'
    },
    {
      id: 'place_2',
      name: '인사동 전통차집',
      type: 'cafe',
      coordinates: { 
        latitude: location.latitude - 0.001, 
        longitude: location.longitude + 0.002 
      },
      distance: 300,
      estimatedWalkTime: 4,
      rating: 4.3,
      openNow: true,
      popularity: 0.6,
      description: '전통 한국 차와 디저트를 즐길 수 있는 아늑한 차집입니다.'
    },
    {
      id: 'place_3',
      name: '국립현대미술관',
      type: 'museum',
      coordinates: { 
        latitude: location.latitude + 0.002, 
        longitude: location.longitude - 0.001 
      },
      distance: 500,
      estimatedWalkTime: 6,
      rating: 4.5,
      openNow: true,
      popularity: 0.7,
      description: '현대미술 작품을 감상하며 예술적 영감을 얻을 수 있는 공간입니다.'
    },
    {
      id: 'place_4',
      name: '남산서울타워',
      type: 'landmark',
      coordinates: { 
        latitude: location.latitude + 0.003, 
        longitude: location.longitude + 0.002 
      },
      distance: 800,
      estimatedWalkTime: 10,
      rating: 4.4,
      openNow: true,
      popularity: 0.95,
      description: '서울의 야경을 한눈에 볼 수 있는 대표적인 전망대입니다.'
    },
    {
      id: 'place_5',
      name: '청계천',
      type: 'nature',
      coordinates: { 
        latitude: location.latitude - 0.002, 
        longitude: location.longitude - 0.001 
      },
      distance: 400,
      estimatedWalkTime: 5,
      rating: 4.2,
      openNow: true,
      popularity: 0.8,
      description: '도심 속 자연을 느끼며 산책할 수 있는 도시 하천입니다.'
    }
  ];
  
  // 2. 거리 필터링
  const nearbyPlaces = mockNearbyPlaces.filter(place => place.distance <= radius);
  
  // 3. 성격 기반 점수화
  const personalizedPlaces = nearbyPlaces.map(place => {
    let personalityScore = 0.5; // 기본 점수
    
    // 성격별 장소 선호도 매핑
    switch (userPersonality) {
      case 'openness':
        if (place.type === 'museum' || place.type === 'gallery' || place.type === 'cultural') {
          personalityScore = 0.9;
        } else if (place.type === 'cafe' || place.type === 'unique') {
          personalityScore = 0.7;
        }
        break;
        
      case 'conscientiousness':
        if (place.type === 'palace' || place.type === 'historical' || place.type === 'educational') {
          personalityScore = 0.9;
        } else if (place.rating >= 4.5) {
          personalityScore = 0.8;
        }
        break;
        
      case 'extraversion':
        if (place.type === 'landmark' || place.type === 'market' || place.popularity > 0.7) {
          personalityScore = 0.9;
        } else if (place.type === 'restaurant' || place.type === 'cafe') {
          personalityScore = 0.7;
        }
        break;
        
      case 'agreeableness':
        if (place.type === 'nature' || place.type === 'park' || place.type === 'garden') {
          personalityScore = 0.9;
        } else if (place.type === 'cultural' || place.type === 'peaceful') {
          personalityScore = 0.8;
        }
        break;
        
      case 'neuroticism':
        if (place.type === 'cafe' || place.type === 'nature' || place.popularity < 0.5) {
          personalityScore = 0.9;
        } else if (place.rating >= 4.0 && place.type === 'quiet') {
          personalityScore = 0.7;
        }
        break;
    }
    
    // 사용자 선호도 적용
    preferences.forEach(pref => {
      if (place.type.includes(pref) || place.name.toLowerCase().includes(pref.toLowerCase())) {
        personalityScore = Math.min(1.0, personalityScore + 0.2);
      }
    });
    
    return {
      ...place,
      personalityFit: personalityScore
    };
  });
  
  // 4. 추천 객체 생성
  const recommendations = personalizedPlaces.map(place => {
    const reason = generateRecommendationReason(place, userPersonality);
    const urgency = calculateUrgency(place);
    const personalityInsights = generatePersonalityInsights(place.type, userPersonality);
    
    return {
      place,
      reason,
      urgency,
      adaptedContent: `${place.description} ${reason}`,
      estimatedVisitDuration: getEstimatedVisitDuration(place.type),
      bestTimeToVisit: getBestTimeToVisit(place.type),
      personalityInsights,
      score: calculateOverallScore(place, userPersonality)
    };
  });
  
  // 5. 점수 기반 정렬 후 상위 추천 반환
  const sortedRecommendations = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations);
  
  return sortedRecommendations;
}

/**
 * 🔧 헬퍼 함수들
 */
function generateRecommendationReason(place: any, userPersonality: string): string {
  const reasons: string[] = [];
  
  // 거리 기반
  if (place.distance < 200) {
    reasons.push('바로 근처에 있어요');
  } else if (place.distance < 500) {
    reasons.push('도보 5분 거리에 있어요');
  }
  
  // 성격 기반
  if (userPersonality === 'openness' && (place.type === 'museum' || place.type === 'gallery')) {
    reasons.push('새로운 예술 작품을 만날 수 있어요');
  } else if (userPersonality === 'agreeableness' && place.type === 'nature') {
    reasons.push('평화로운 휴식을 즐길 수 있어요');
  } else if (userPersonality === 'extraversion' && place.popularity > 0.8) {
    reasons.push('많은 사람들이 방문하는 인기 장소예요');
  }
  
  // 평점 기반
  if (place.rating >= 4.5) {
    reasons.push('방문객들의 평가가 매우 좋아요');
  }
  
  return reasons.join(' • ') || '주변 추천 장소예요';
}

function calculateUrgency(place: any): 'low' | 'medium' | 'high' {
  const hour = new Date().getHours();
  
  // 영업 시간 기반
  if (place.type === 'museum' && hour >= 16) {
    return 'high'; // 박물관은 보통 오후 6시에 닫음
  }
  
  // 인기도 기반
  if (place.popularity > 0.9 && hour >= 10 && hour <= 16) {
    return 'medium'; // 인기 장소는 낮 시간에 붐빔
  }
  
  return 'low';
}

function generatePersonalityInsights(placeType: string, userPersonality: string): string[] {
  const insights: Record<string, Record<string, string[]>> = {
    openness: {
      museum: ['새로운 문화적 경험을 제공합니다', '창의성을 자극하는 작품들이 있어요'],
      gallery: ['독특한 예술 작품을 감상할 수 있어요', '예술적 영감을 얻을 수 있습니다'],
      cafe: ['특별한 분위기의 카페예요', '새로운 맛을 경험할 수 있어요']
    },
    agreeableness: {
      nature: ['평화로운 분위기에서 휴식을 취할 수 있어요', '자연과 함께하는 시간을 보낼 수 있습니다'],
      park: ['조용하고 편안한 환경이에요', '마음의 평화를 찾을 수 있습니다'],
      cafe: ['아늑하고 편안한 분위기예요', '조용히 시간을 보내기 좋아요']
    },
    extraversion: {
      landmark: ['많은 사람들과 함께 즐길 수 있어요', '활발한 분위기를 느낄 수 있습니다'],
      market: ['다양한 사람들과 소통할 기회가 있어요', '에너지 넘치는 분위기예요'],
      cafe: ['사람들과 만나기 좋은 장소예요', '사회적 활동을 즐길 수 있습니다']
    }
  };
  
  return insights[userPersonality]?.[placeType] || ['즐거운 경험을 할 수 있어요'];
}

function getEstimatedVisitDuration(placeType: string): number {
  const durations: Record<string, number> = {
    museum: 120, // 2시간
    palace: 90, // 1.5시간
    cafe: 45, // 45분
    nature: 60, // 1시간
    landmark: 60, // 1시간
    restaurant: 60 // 1시간
  };
  
  return durations[placeType] || 60;
}

function getBestTimeToVisit(placeType: string): string {
  const times: Record<string, string> = {
    museum: '오전 10시-12시 (한적함)',
    palace: '오전 9시-11시 (아침 햇살)',
    cafe: '오후 2시-4시 (여유로운 시간)',
    nature: '오전 7시-9시 (상쾌한 공기)',
    landmark: '오후 5시-7시 (석양 풍경)',
    restaurant: '오후 12시-2시 또는 오후 6시-8시'
  };
  
  return times[placeType] || '언제든지';
}

function calculateOverallScore(place: any, userPersonality: string): number {
  // 성격 적합도 (40%)
  const personalityWeight = 0.4;
  const personalityScore = (place.personalityFit || 0.5) * personalityWeight;
  
  // 거리 (30% - 가까울수록 좋음)
  const distanceWeight = 0.3;
  const distanceScore = Math.max(0, (1000 - place.distance) / 1000) * distanceWeight;
  
  // 평점 (20%)
  const ratingWeight = 0.2;
  const ratingScore = ((place.rating || 0) / 5) * ratingWeight;
  
  // 인기도 (10%)
  const popularityWeight = 0.1;
  const popularityScore = (place.popularity || 0.5) * popularityWeight;
  
  return personalityScore + distanceScore + ratingScore + popularityScore;
}

/**
 * OPTIONS 메서드 핸들러
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}

/**
 * GET 메서드 핸들러 (API 정보)
 */
export async function GET() {
  return NextResponse.json({
    api: 'Location Recommendations API',
    phase: 'Phase 3',
    description: '실시간 위치 기반 개인화 추천 시스템',
    endpoints: {
      POST: '위치 기반 추천 생성',
      OPTIONS: 'CORS preflight'
    },
    parameters: {
      latitude: 'number (required) - 위도',
      longitude: 'number (required) - 경도',
      accuracy: 'number (optional) - GPS 정확도',
      userPersonality: 'string (optional) - 사용자 성격 유형',
      preferences: 'array (optional) - 선호 카테고리',
      radius: 'number (optional) - 검색 반경 (미터, 기본: 1000)',
      maxRecommendations: 'number (optional) - 최대 추천 수 (기본: 5)'
    },
    features: [
      '실시간 위치 추적',
      '성격 기반 개인화 추천',
      '거리 및 시간 계산',
      '우선순위 기반 정렬',
      '문화적 맥락 고려'
    ]
  });
}