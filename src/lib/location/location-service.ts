// 📍 Phase 3: 실시간 위치 기반 추천 시스템
// 사용자 위치에 따른 스마트 콘텐츠 추천 및 실시간 업데이트

import { useState, useEffect } from 'react';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface LocationContext {
  currentLocation: LocationCoordinates;
  nearbyPlaces: NearbyPlace[];
  weatherConditions?: WeatherInfo;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  crowdLevel?: 'low' | 'medium' | 'high';
  travelMode?: 'walking' | 'driving' | 'public_transport';
}

interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  coordinates: LocationCoordinates;
  distance: number; // meters
  estimatedWalkTime: number; // minutes
  rating?: number;
  openNow?: boolean;
  popularity?: number;
  personalityFit?: number; // 0-1, based on user personality
}

interface WeatherInfo {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  windSpeed: number;
  visibility: number;
}

export interface LocationRecommendation {
  place: NearbyPlace;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  adaptedContent: string;
  estimatedVisitDuration: number;
  bestTimeToVisit: string;
  personalityInsights: string[];
}

/**
 * 📍 실시간 위치 기반 추천 서비스
 */
export class LocationService {
  
  private currentLocation: LocationCoordinates | null = null;
  private watchId: number | null = null;
  private locationUpdateCallbacks: ((location: LocationCoordinates) => void)[] = [];
  private lastRecommendations: LocationRecommendation[] = [];
  private cache = new Map<string, any>();
  
  /**
   * 🚀 위치 추적 시작
   */
  public startLocationTracking(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1분 캐시
      };
      
      // 현재 위치 가져오기
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          
          this.currentLocation = location;
          console.log('📍 현재 위치 획득:', location);
          resolve(location);
          
          // 위치 변경 감시 시작
          this.watchId = navigator.geolocation.watchPosition(
            (position) => {
              const newLocation: LocationCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
              };
              
              this.handleLocationUpdate(newLocation);
            },
            (error) => {
              console.error('❌ 위치 추적 오류:', error);
            },
            options
          );
        },
        (error) => {
          console.error('❌ 초기 위치 획득 실패:', error);
          reject(error);
        },
        options
      );
    });
  }
  
  /**
   * 📍 위치 업데이트 처리
   */
  private handleLocationUpdate(newLocation: LocationCoordinates) {
    const oldLocation = this.currentLocation;
    this.currentLocation = newLocation;
    
    // 이동 거리 계산 (최소 10m 이상 이동시에만 업데이트)
    if (oldLocation) {
      const distance = this.calculateDistance(oldLocation, newLocation);
      if (distance < 10) {
        return; // 너무 작은 이동은 무시
      }
      
      console.log(`📍 위치 업데이트: ${distance.toFixed(0)}m 이동`);
    }
    
    // 등록된 콜백 실행
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(newLocation);
      } catch (error) {
        console.error('❌ 위치 업데이트 콜백 오류:', error);
      }
    });
    
    // 자동 추천 업데이트
    this.updateRecommendations();
  }
  
  /**
   * 🎯 실시간 위치 기반 추천 생성
   */
  public async generateLocationRecommendations(
    userPersonality?: string,
    preferences?: string[]
  ): Promise<LocationRecommendation[]> {
    
    if (!this.currentLocation) {
      throw new Error('위치 정보를 먼저 활성화해주세요');
    }
    
    console.log('🎯 위치 기반 추천 생성 시작...');
    
    try {
      // 1. 위치 컨텍스트 수집
      const locationContext = await this.gatherLocationContext();
      
      // 2. 주변 장소 검색
      const nearbyPlaces = await this.findNearbyPlaces(1000); // 1km 반경
      
      // 3. 성격 기반 필터링 및 점수화
      const personalizedPlaces = this.applyPersonalityScoring(
        nearbyPlaces, 
        userPersonality,
        preferences
      );
      
      // 4. 추천 생성
      const recommendations = await this.createRecommendations(
        personalizedPlaces,
        locationContext,
        userPersonality
      );
      
      // 5. 우선순위 정렬
      const sortedRecommendations = this.sortRecommendationsByPriority(
        recommendations,
        locationContext
      );
      
      this.lastRecommendations = sortedRecommendations;
      console.log(`✅ ${sortedRecommendations.length}개 추천 생성 완료`);
      
      return sortedRecommendations;
      
    } catch (error) {
      console.error('❌ 위치 추천 생성 실패:', error);
      return [];
    }
  }
  
  /**
   * 📊 위치 컨텍스트 수집
   */
  private async gatherLocationContext(): Promise<LocationContext> {
    if (!this.currentLocation) {
      throw new Error('현재 위치 정보 없음');
    }
    
    const nearbyPlaces = await this.findNearbyPlaces(500);
    const timeOfDay = this.getTimeOfDay();
    const weatherConditions = await this.getWeatherInfo();
    
    return {
      currentLocation: this.currentLocation,
      nearbyPlaces,
      weatherConditions,
      timeOfDay,
      crowdLevel: this.estimateCrowdLevel(),
      travelMode: 'walking' // 기본값
    };
  }
  
  /**
   * 🔍 주변 장소 검색 (시뮬레이션)
   */
  private async findNearbyPlaces(radiusMeters: number): Promise<NearbyPlace[]> {
    if (!this.currentLocation) return [];
    
    // 실제로는 Google Places API, Foursquare API 등을 사용
    // 여기서는 시뮬레이션 데이터
    
    const mockPlaces: NearbyPlace[] = [
      {
        id: '1',
        name: '경복궁',
        type: 'palace',
        coordinates: { 
          latitude: this.currentLocation.latitude + 0.001, 
          longitude: this.currentLocation.longitude + 0.001 
        },
        distance: 150,
        estimatedWalkTime: 2,
        rating: 4.7,
        openNow: true,
        popularity: 0.9
      },
      {
        id: '2',
        name: '인사동 전통차집',
        type: 'cafe',
        coordinates: { 
          latitude: this.currentLocation.latitude - 0.001, 
          longitude: this.currentLocation.longitude + 0.002 
        },
        distance: 300,
        estimatedWalkTime: 4,
        rating: 4.3,
        openNow: true,
        popularity: 0.6
      },
      {
        id: '3',
        name: '국립현대미술관',
        type: 'museum',
        coordinates: { 
          latitude: this.currentLocation.latitude + 0.002, 
          longitude: this.currentLocation.longitude - 0.001 
        },
        distance: 500,
        estimatedWalkTime: 6,
        rating: 4.5,
        openNow: true,
        popularity: 0.7
      }
    ];
    
    return mockPlaces.filter(place => place.distance <= radiusMeters);
  }
  
  /**
   * 🎭 성격 기반 장소 점수화
   */
  private applyPersonalityScoring(
    places: NearbyPlace[],
    userPersonality?: string,
    preferences?: string[]
  ): NearbyPlace[] {
    
    if (!userPersonality) {
      return places;
    }
    
    return places.map(place => {
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
          if (place.type === 'historical' || place.type === 'educational') {
            personalityScore = 0.9;
          } else if (place.rating && place.rating >= 4.5) {
            personalityScore = 0.8;
          }
          break;
          
        case 'extraversion':
          if (place.type === 'market' || place.type === 'festival' || place.popularity && place.popularity > 0.7) {
            personalityScore = 0.9;
          } else if (place.type === 'restaurant' || place.type === 'cafe') {
            personalityScore = 0.7;
          }
          break;
          
        case 'agreeableness':
          if (place.type === 'park' || place.type === 'garden' || place.type === 'peaceful') {
            personalityScore = 0.9;
          } else if (place.type === 'cultural' || place.type === 'religious') {
            personalityScore = 0.8;
          }
          break;
          
        case 'neuroticism':
          if (place.type === 'quiet' || place.type === 'nature' || place.popularity && place.popularity < 0.5) {
            personalityScore = 0.9;
          } else if (place.type === 'cafe' && place.rating && place.rating >= 4.0) {
            personalityScore = 0.7;
          }
          break;
      }
      
      // 사용자 선호도 적용
      if (preferences) {
        preferences.forEach(pref => {
          if (place.type.includes(pref) || place.name.toLowerCase().includes(pref)) {
            personalityScore = Math.min(1.0, personalityScore + 0.2);
          }
        });
      }
      
      return {
        ...place,
        personalityFit: personalityScore
      };
    });
  }
  
  /**
   * 🎯 추천 생성
   */
  private async createRecommendations(
    places: NearbyPlace[],
    context: LocationContext,
    userPersonality?: string
  ): Promise<LocationRecommendation[]> {
    
    return places.map(place => {
      const reason = this.generateRecommendationReason(place, context, userPersonality);
      const urgency = this.calculateUrgency(place, context);
      const adaptedContent = this.generateAdaptedContent(place, userPersonality);
      const bestTimeToVisit = this.calculateBestVisitTime(place, context);
      const personalityInsights = this.generatePersonalityInsights(place, userPersonality);
      
      return {
        place,
        reason,
        urgency,
        adaptedContent,
        estimatedVisitDuration: this.estimateVisitDuration(place),
        bestTimeToVisit,
        personalityInsights
      };
    });
  }
  
  /**
   * 📝 추천 이유 생성
   */
  private generateRecommendationReason(
    place: NearbyPlace, 
    context: LocationContext, 
    userPersonality?: string
  ): string {
    const reasons: string[] = [];
    
    // 거리 기반
    if (place.distance < 100) {
      reasons.push('바로 근처에 있어요');
    } else if (place.distance < 300) {
      reasons.push('도보 5분 거리에 있어요');
    }
    
    // 시간대 기반
    if (context.timeOfDay === 'morning' && place.type === 'cafe') {
      reasons.push('아침 시간에 좋은 카페예요');
    } else if (context.timeOfDay === 'afternoon' && place.type === 'museum') {
      reasons.push('오후에 방문하기 좋은 박물관이에요');
    }
    
    // 성격 기반
    if (userPersonality === 'openness' && (place.type === 'museum' || place.type === 'gallery')) {
      reasons.push('새로운 예술 작품을 만날 수 있어요');
    } else if (userPersonality === 'agreeableness' && place.type === 'park') {
      reasons.push('평화로운 휴식을 즐길 수 있어요');
    }
    
    // 평점 기반
    if (place.rating && place.rating >= 4.5) {
      reasons.push('방문객들의 평가가 매우 좋아요');
    }
    
    return reasons.join(' • ') || '주변 인기 장소예요';
  }
  
  /**
   * ⚡ 우선순위 정렬
   */
  private sortRecommendationsByPriority(
    recommendations: LocationRecommendation[],
    context: LocationContext
  ): LocationRecommendation[] {
    
    return recommendations.sort((a, b) => {
      // 성격 적합도 (40%)
      const personalityWeight = 0.4;
      const personalityScore = ((b.place.personalityFit || 0.5) - (a.place.personalityFit || 0.5)) * personalityWeight;
      
      // 거리 (30% - 가까울수록 좋음)
      const distanceWeight = 0.3;
      const distanceScore = (a.place.distance - b.place.distance) / 1000 * distanceWeight;
      
      // 평점 (20%)
      const ratingWeight = 0.2;
      const ratingScore = ((b.place.rating || 0) - (a.place.rating || 0)) * ratingWeight;
      
      // 긴급도 (10%)
      const urgencyWeight = 0.1;
      const urgencyScores = { high: 1, medium: 0.5, low: 0 };
      const urgencyScore = (urgencyScores[b.urgency] - urgencyScores[a.urgency]) * urgencyWeight;
      
      return personalityScore + distanceScore + ratingScore + urgencyScore;
    });
  }
  
  /**
   * 🔧 헬퍼 메서드들
   */
  private calculateDistance(loc1: LocationCoordinates, loc2: LocationCoordinates): number {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = loc1.latitude * Math.PI/180;
    const φ2 = loc2.latitude * Math.PI/180;
    const Δφ = (loc2.latitude-loc1.latitude) * Math.PI/180;
    const Δλ = (loc2.longitude-loc1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
  
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }
  
  private estimateCrowdLevel(): 'low' | 'medium' | 'high' {
    // 시간대와 요일을 기반으로 추정
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    if (day === 0 || day === 6) { // 주말
      if (hour >= 10 && hour <= 16) return 'high';
      if (hour >= 17 && hour <= 20) return 'medium';
      return 'low';
    } else { // 평일
      if (hour >= 11 && hour <= 14) return 'medium';
      if (hour >= 17 && hour <= 19) return 'high';
      return 'low';
    }
  }
  
  private async getWeatherInfo(): Promise<WeatherInfo | undefined> {
    // 실제로는 날씨 API 호출
    // 여기서는 시뮬레이션
    return {
      temperature: 22,
      condition: 'sunny',
      humidity: 60,
      windSpeed: 5,
      visibility: 10
    };
  }
  
  private calculateUrgency(place: NearbyPlace, context: LocationContext): 'low' | 'medium' | 'high' {
    // 영업 종료 임박시 높은 긴급도
    if (place.type === 'museum' && context.timeOfDay === 'evening') {
      return 'high';
    }
    
    // 날씨가 좋고 야외 활동에 적합한 경우
    if (place.type === 'park' && context.weatherConditions?.condition === 'sunny') {
      return 'medium';
    }
    
    return 'low';
  }
  
  private generateAdaptedContent(place: NearbyPlace, userPersonality?: string): string {
    // 성격에 맞는 콘텐츠 생성 (간략화)
    return `${place.name}은/는 ${userPersonality || '모든 분'}에게 추천하는 장소입니다.`;
  }
  
  private calculateBestVisitTime(place: NearbyPlace, context: LocationContext): string {
    if (place.type === 'museum') return '오전 10시-12시 (한적함)';
    if (place.type === 'cafe') return '오후 2시-4시 (여유로운 시간)';
    if (place.type === 'park') return '오전 7시-9시 또는 오후 5시-7시';
    return '언제든지';
  }
  
  private generatePersonalityInsights(place: NearbyPlace, userPersonality?: string): string[] {
    if (!userPersonality) return [];
    
    const insights: Record<string, string[]> = {
      openness: ['새로운 경험을 제공합니다', '창의성을 자극합니다', '독특한 관점을 얻을 수 있습니다'],
      conscientiousness: ['체계적으로 둘러볼 수 있습니다', '정확한 정보를 제공합니다', '계획적 방문이 가능합니다'],
      extraversion: ['다른 사람들과 소통할 기회가 있습니다', '활발한 분위기를 즐길 수 있습니다', '사회적 경험을 제공합니다'],
      agreeableness: ['평화로운 분위기입니다', '조화로운 경험을 제공합니다', '마음의 안정을 찾을 수 있습니다'],
      neuroticism: ['조용하고 안전한 환경입니다', '스트레스를 해소할 수 있습니다', '차분한 시간을 보낼 수 있습니다']
    };
    
    return insights[userPersonality] || [];
  }
  
  private estimateVisitDuration(place: NearbyPlace): number {
    const durations: Record<string, number> = {
      museum: 120, // 2시간
      palace: 90, // 1.5시간
      cafe: 45, // 45분
      park: 60, // 1시간
      restaurant: 60, // 1시간
      shop: 30 // 30분
    };
    
    return durations[place.type] || 60;
  }
  
  /**
   * 🔄 자동 추천 업데이트
   */
  private async updateRecommendations() {
    if (this.lastRecommendations.length > 0) {
      console.log('🔄 위치 변경으로 인한 추천 업데이트...');
      // 실제로는 새로운 추천을 생성하고 콜백을 통해 UI 업데이트
    }
  }
  
  /**
   * 📞 위치 업데이트 콜백 등록
   */
  public onLocationUpdate(callback: (location: LocationCoordinates) => void) {
    this.locationUpdateCallbacks.push(callback);
  }
  
  /**
   * 🛑 위치 추적 중지
   */
  public stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('📍 위치 추적 중지');
    }
  }
  
  /**
   * 📊 현재 상태 조회
   */
  public getStatus() {
    return {
      isTracking: this.watchId !== null,
      currentLocation: this.currentLocation,
      lastRecommendations: this.lastRecommendations,
      cacheSize: this.cache.size
    };
  }
  
  /**
   * 🧹 캐시 정리
   */
  public clearCache() {
    this.cache.clear();
    console.log('🧹 위치 서비스 캐시 정리 완료');
  }
}

/**
 * 🚀 전역 위치 서비스 인스턴스
 */
export const locationService = new LocationService();

/**
 * 📍 위치 기반 추천 훅
 */
export function useLocationRecommendations() {
  const [recommendations, setRecommendations] = useState<LocationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  
  useEffect(() => {
    // 위치 추적 시작
    locationService.startLocationTracking()
      .then(location => {
        setCurrentLocation(location);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        console.error('위치 추적 시작 실패:', err);
      });
    
    // 위치 업데이트 콜백 등록
    locationService.onLocationUpdate((location) => {
      setCurrentLocation(location);
    });
    
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);
  
  const generateRecommendations = async (userPersonality?: string, preferences?: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newRecommendations = await locationService.generateLocationRecommendations(
        userPersonality, 
        preferences
      );
      setRecommendations(newRecommendations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '추천 생성 실패';
      setError(errorMessage);
      console.error('추천 생성 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    recommendations,
    currentLocation,
    isLoading,
    error,
    generateRecommendations,
    refreshRecommendations: generateRecommendations
  };
}