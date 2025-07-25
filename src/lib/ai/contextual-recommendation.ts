/**
 * 🧠 실시간 맥락적 추천 엔진
 * 사용자 위치, 시간, 날씨, 성향을 종합하여 지능형 추천 제공
 */

import { LocationPoint } from '@/types/location';

export interface UserContext {
  // 위치 정보
  currentLocation: LocationPoint;
  nearbyPOIs: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
    rating: number;
  }>;
  
  // 시간 맥락
  currentTime: Date;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  
  // 환경 정보
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    temperature: number;
    humidity: number;
  };
  
  // 사용자 프로필
  personality: {
    type: string;
    preferences: {
      pace: 'slow' | 'moderate' | 'fast';
      interests: string[];
      activityLevel: 'low' | 'medium' | 'high';
    };
  };
  
  // 행동 히스토리
  behaviorHistory: {
    visitedLocations: string[];
    preferredDuration: number; // minutes
    averageRating: number;
    completionRate: number;
  };
}

export interface RecommendationContext {
  confidence: number; // 0-1
  reasoning: string[];
  adaptations: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface ContextualRecommendation {
  id: string;
  type: 'location' | 'content' | 'route' | 'timing' | 'activity';
  title: string;
  description: string;
  location?: LocationPoint;
  estimatedDuration: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  context: RecommendationContext;
  metadata: {
    tags: string[];
    season?: string;
    crowdLevel?: 'low' | 'medium' | 'high';
    accessibility?: boolean;
  };
}

class ContextualRecommendationEngine {
  private weatherApiKey?: string;
  private crowdDataCache = new Map<string, any>();
  
  constructor(config?: { weatherApiKey?: string }) {
    this.weatherApiKey = config?.weatherApiKey;
  }

  /**
   * 🎯 메인 추천 생성 함수
   */
  async generateRecommendations(userContext: UserContext): Promise<ContextualRecommendation[]> {
    const recommendations: ContextualRecommendation[] = [];
    
    // 1. 위치 기반 추천
    const locationRecs = await this.generateLocationRecommendations(userContext);
    recommendations.push(...locationRecs);
    
    // 2. 시간 기반 추천
    const timeRecs = this.generateTimeBasedRecommendations(userContext);
    recommendations.push(...timeRecs);
    
    // 3. 날씨 기반 추천
    const weatherRecs = this.generateWeatherRecommendations(userContext);
    recommendations.push(...weatherRecs);
    
    // 4. 개인화 추천
    const personalRecs = this.generatePersonalizedRecommendations(userContext);
    recommendations.push(...personalRecs);
    
    // 5. 우선순위 정렬 및 필터링
    return this.prioritizeAndFilter(recommendations, userContext);
  }

  /**
   * 📍 위치 기반 추천
   */
  private async generateLocationRecommendations(context: UserContext): Promise<ContextualRecommendation[]> {
    const recommendations: ContextualRecommendation[] = [];
    
    for (const poi of context.nearbyPOIs) {
      // 거리 기반 적합성 계산
      const distanceScore = this.calculateDistanceScore(poi.distance, context.personality.preferences.activityLevel);
      
      if (distanceScore > 0.3) {
        recommendations.push({
          id: `location_${poi.id}`,
          type: 'location',
          title: `${poi.name} 방문`,
          description: this.generateLocationDescription(poi, context),
          location: {
            lat: context.currentLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: context.currentLocation.lng + (Math.random() - 0.5) * 0.01,
            timestamp: Date.now()
          },
          estimatedDuration: this.estimateDuration(poi, context),
          difficulty: this.assessDifficulty(poi, context),
          context: {
            confidence: distanceScore,
            reasoning: [
              `${poi.distance}m 거리로 접근 용이`,
              `${poi.rating}/5 높은 평점`,
              `${context.personality.type} 성향에 적합`
            ],
            adaptations: this.generateLocationAdaptations(poi, context),
            urgency: poi.distance < 200 ? 'high' : 'medium'
          },
          metadata: {
            tags: [poi.type, 'nearby', 'popular'],
            crowdLevel: await this.estimateCrowdLevel(poi.id),
            accessibility: true
          }
        });
      }
    }
    
    return recommendations;
  }

  /**
   * ⏰ 시간 기반 추천
   */
  private generateTimeBasedRecommendations(context: UserContext): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];
    const { timeOfDay, dayOfWeek } = context;
    
    // 시간대별 맞춤 추천
    switch (timeOfDay) {
      case 'morning':
        recommendations.push({
          id: 'time_morning_walk',
          type: 'activity',
          title: '아침 산책 코스',
          description: '상쾌한 아침 공기를 마시며 주변을 탐방해보세요',
          estimatedDuration: 30,
          difficulty: 'easy',
          context: {
            confidence: 0.8,
            reasoning: ['아침 시간대 최적', '적당한 활동량'],
            adaptations: ['느긋한 페이스 추천'],
            urgency: 'low'
          },
          metadata: {
            tags: ['morning', 'wellness', 'nature'],
            season: this.getCurrentSeason()
          }
        });
        break;
        
      case 'afternoon':
        if (dayOfWeek === 'weekend') {
          recommendations.push({
            id: 'time_afternoon_explore',
            type: 'activity',
            title: '오후 탐험 투어',
            description: '주말 오후, 새로운 장소를 깊이 있게 탐험해보세요',
            estimatedDuration: 90,
            difficulty: 'moderate',
            context: {
              confidence: 0.9,
              reasoning: ['주말 오후 충분한 시간', '높은 에너지 레벨'],
              adaptations: ['상세한 설명 포함', '사진 촬영 포인트 제공'],
              urgency: 'medium'
            },
            metadata: {
              tags: ['afternoon', 'weekend', 'exploration'],
              crowdLevel: 'medium'
            }
          });
        }
        break;
        
      case 'evening':
        recommendations.push({
          id: 'time_evening_sunset',
          type: 'content',
          title: '일몰 명소 가이드',
          description: '황금빛 일몰을 감상할 수 있는 최고의 장소를 안내합니다',
          estimatedDuration: 45,
          difficulty: 'easy',
          context: {
            confidence: 0.85,
            reasoning: ['일몰 시간 접근', '로맨틱한 분위기'],
            adaptations: ['일몰 시간 정보 제공', '사진 팁 포함'],
            urgency: 'high'
          },
          metadata: {
            tags: ['evening', 'sunset', 'photography'],
            season: this.getCurrentSeason()
          }
        });
        break;
    }
    
    return recommendations;
  }

  /**
   * 🌤️ 날씨 기반 추천
   */
  private generateWeatherRecommendations(context: UserContext): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];
    const { weather } = context;
    
    switch (weather.condition) {
      case 'sunny':
        if (weather.temperature > 25) {
          recommendations.push({
            id: 'weather_sunny_hot',
            type: 'content',
            title: '그늘진 산책로',
            description: '따뜻한 날씨, 시원한 그늘에서 편안한 투어를 즐겨보세요',
            estimatedDuration: 60,
            difficulty: 'easy',
            context: {
              confidence: 0.9,
              reasoning: ['맑은 날씨', '그늘 필요', '적당한 활동'],
              adaptations: ['그늘진 경로 우선', '수분 보충 안내'],
              urgency: 'medium'
            },
            metadata: {
              tags: ['sunny', 'shade', 'comfortable'],
              accessibility: true
            }
          });
        }
        break;
        
      case 'rainy':
        recommendations.push({
          id: 'weather_rainy_indoor',
          type: 'location',
          title: '실내 문화 투어',
          description: '비 오는 날엔 실내에서 문화와 역사를 만나보세요',
          estimatedDuration: 120,
          difficulty: 'easy',
          context: {
            confidence: 0.95,
            reasoning: ['비 오는 날씨', '실내 활동 적합'],
            adaptations: ['실내 경로 위주', '대중교통 정보 제공'],
            urgency: 'high'
          },
          metadata: {
            tags: ['rainy', 'indoor', 'culture'],
            accessibility: true
          }
        });
        break;
    }
    
    return recommendations;
  }

  /**
   * 👤 개인화 추천
   */
  private generatePersonalizedRecommendations(context: UserContext): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];
    const { personality, behaviorHistory } = context;
    
    // 성향 기반 추천
    const personalityRecs = this.getPersonalityBasedRecommendations(personality);
    recommendations.push(...personalityRecs);
    
    // 행동 히스토리 기반 추천
    if (behaviorHistory.completionRate > 0.8) {
      recommendations.push({
        id: 'personal_detailed',
        type: 'content',
        title: '심층 탐구 가이드',
        description: '높은 완주율을 보이시는군요! 더 깊이 있는 내용을 준비했습니다',
        estimatedDuration: Math.max(behaviorHistory.preferredDuration * 1.2, 90),
        difficulty: 'moderate',
        context: {
          confidence: 0.85,
          reasoning: ['높은 완주율', '상세 콘텐츠 선호'],
          adaptations: ['상세한 설명', '추가 정보 제공'],
          urgency: 'low'
        },
        metadata: {
          tags: ['detailed', 'comprehensive', 'personalized']
        }
      });
    }
    
    return recommendations;
  }

  /**
   * 🧭 성향별 추천 생성
   */
  private getPersonalityBasedRecommendations(personality: UserContext['personality']): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];
    
    // 관심사 기반 추천
    personality.preferences.interests.forEach(interest => {
      recommendations.push({
        id: `interest_${interest}`,
        type: 'content',
        title: `${interest} 전문 가이드`,
        description: `${interest}에 특화된 맞춤 정보를 제공합니다`,
        estimatedDuration: 60,
        difficulty: personality.preferences.activityLevel === 'high' ? 'moderate' : 'easy',
        context: {
          confidence: 0.8,
          reasoning: [`${interest} 관심사 매칭`],
          adaptations: [`${interest} 관련 상세 정보`],
          urgency: 'low'
        },
        metadata: {
          tags: [interest, 'personalized', 'interest-based']
        }
      });
    });
    
    return recommendations;
  }

  /**
   * 📊 추천 우선순위 정렬 및 필터링
   */
  private prioritizeAndFilter(
    recommendations: ContextualRecommendation[], 
    context: UserContext
  ): ContextualRecommendation[] {
    // 신뢰도 기반 정렬
    recommendations.sort((a, b) => b.context.confidence - a.context.confidence);
    
    // 중복 제거
    const uniqueRecs = recommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.type === rec.type && r.title === rec.title)
    );
    
    // 상위 5개 추천만 반환
    return uniqueRecs.slice(0, 5);
  }

  /**
   * 🛠️ 유틸리티 함수들
   */
  
  private calculateDistanceScore(distance: number, activityLevel: string): number {
    const maxDistance = activityLevel === 'high' ? 1000 : activityLevel === 'medium' ? 500 : 200;
    return Math.max(0, 1 - (distance / maxDistance));
  }
  
  private generateLocationDescription(poi: any, context: UserContext): string {
    const timeContext = context.timeOfDay === 'morning' ? '아침에' : 
                       context.timeOfDay === 'afternoon' ? '오후에' : '저녁에';
    return `${timeContext} 방문하기 좋은 ${poi.type} 장소입니다. ${poi.distance}m 거리에 위치해 있습니다.`;
  }
  
  private estimateDuration(poi: any, context: UserContext): number {
    const baseTime = 30;
    const paceMultiplier = context.personality.preferences.pace === 'slow' ? 1.5 : 
                          context.personality.preferences.pace === 'fast' ? 0.7 : 1.0;
    return Math.round(baseTime * paceMultiplier);
  }
  
  private assessDifficulty(poi: any, context: UserContext): 'easy' | 'moderate' | 'challenging' {
    const activityLevel = context.personality.preferences.activityLevel;
    if (poi.distance > 500) return activityLevel === 'high' ? 'moderate' : 'challenging';
    return 'easy';
  }
  
  private generateLocationAdaptations(poi: any, context: UserContext): string[] {
    const adaptations: string[] = [];
    
    if (context.weather.condition === 'rainy') {
      adaptations.push('우산 지참 권장');
    }
    
    if (context.personality.preferences.pace === 'slow') {
      adaptations.push('여유로운 페이스로 진행');
    }
    
    return adaptations;
  }
  
  private async estimateCrowdLevel(poiId: string): Promise<'low' | 'medium' | 'high'> {
    // 실제 구현에서는 실시간 데이터를 활용
    const cached = this.crowdDataCache.get(poiId);
    if (cached) return cached;
    
    // 시간대 기반 예상 혼잡도
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 16) return 'high';
    if (hour >= 17 && hour <= 19) return 'medium';
    return 'low';
  }
  
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}

/**
 * 🎯 실시간 추천 훅
 */
export class RealtimeRecommendationService {
  private engine: ContextualRecommendationEngine;
  private updateInterval: number = 5 * 60 * 1000; // 5분
  private listeners: Set<(recommendations: ContextualRecommendation[]) => void> = new Set();
  
  constructor() {
    this.engine = new ContextualRecommendationEngine();
  }
  
  /**
   * 실시간 추천 시작
   */
  startRealtimeRecommendations(initialContext: UserContext) {
    // 초기 추천 생성
    this.generateAndNotify(initialContext);
    
    // 주기적 업데이트
    setInterval(() => {
      this.generateAndNotify(initialContext);
    }, this.updateInterval);
  }
  
  /**
   * 추천 리스너 추가
   */
  addRecommendationListener(listener: (recommendations: ContextualRecommendation[]) => void) {
    this.listeners.add(listener);
  }
  
  /**
   * 추천 리스너 제거
   */
  removeRecommendationListener(listener: (recommendations: ContextualRecommendation[]) => void) {
    this.listeners.delete(listener);
  }
  
  /**
   * 맥락 변화 감지 시 즉시 업데이트
   */
  async updateContext(newContext: UserContext) {
    await this.generateAndNotify(newContext);
  }
  
  private async generateAndNotify(context: UserContext) {
    try {
      const recommendations = await this.engine.generateRecommendations(context);
      this.listeners.forEach(listener => listener(recommendations));
    } catch (error) {
      console.error('실시간 추천 생성 오류:', error);
    }
  }
}

export { ContextualRecommendationEngine };
export default RealtimeRecommendationService;