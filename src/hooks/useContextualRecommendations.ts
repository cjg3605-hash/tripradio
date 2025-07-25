/**
 * 🎯 실시간 맥락적 추천 React 훅
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from './useGeolocation';
import { 
  ContextualRecommendation, 
  UserContext, 
  RealtimeRecommendationService 
} from '@/lib/ai/contextual-recommendation';

interface UseContextualRecommendationsOptions {
  enableRealtimeUpdates?: boolean;
  updateInterval?: number; // minutes
  personalityType?: string;
  interests?: string[];
}

interface RecommendationState {
  recommendations: ContextualRecommendation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useContextualRecommendations = (
  options: UseContextualRecommendationsOptions = {}
) => {
  const {
    enableRealtimeUpdates = true,
    updateInterval = 5,
    personalityType = 'balanced',
    interests = []
  } = options;

  const [state, setState] = useState<RecommendationState>({
    recommendations: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const serviceRef = useRef<RealtimeRecommendationService | null>(null);
  const { currentLocation, getCurrentPosition } = useGeolocation({
    enableTracking: false,
    enablePrecisionMode: true
  });

  /**
   * 🌤️ 날씨 정보 가져오기
   */
  const fetchWeatherData = useCallback(async (location: { lat: number; lng: number }) => {
    try {
      // 실제 날씨 API 호출 (예: OpenWeatherMap)
      // 현재는 모의 데이터 반환
      return {
        condition: 'sunny' as const,
        temperature: 22,
        humidity: 60
      };
    } catch (error) {
      console.warn('날씨 정보 가져오기 실패:', error);
      return {
        condition: 'sunny' as const,
        temperature: 20,
        humidity: 50
      };
    }
  }, []);

  /**
   * 🏢 주변 POI 데이터 가져오기
   */
  const fetchNearbyPOIs = useCallback(async (location: { lat: number; lng: number }) => {
    try {
      // 실제 POI API 호출 또는 데이터베이스 쿼리
      // 현재는 모의 데이터 반환
      return [
        {
          id: 'poi_1',
          name: '역사박물관',
          type: 'museum',
          distance: 150,
          rating: 4.5
        },
        {
          id: 'poi_2',
          name: '중앙공원',
          type: 'park',
          distance: 300,
          rating: 4.2
        },
        {
          id: 'poi_3',
          name: '전통시장',
          type: 'market',
          distance: 450,
          rating: 4.0
        }
      ];
    } catch (error) {
      console.warn('주변 POI 정보 가져오기 실패:', error);
      return [];
    }
  }, []);

  /**
   * 📊 사용자 행동 히스토리 가져오기
   */
  const getBehaviorHistory = useCallback(() => {
    // LocalStorage 또는 서버에서 사용자 행동 데이터 가져오기
    const stored = localStorage.getItem('navi-user-behavior');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // 파싱 실패 시 기본값 반환
      }
    }

    return {
      visitedLocations: [],
      preferredDuration: 60,
      averageRating: 4.0,
      completionRate: 0.7
    };
  }, []);

  /**
   * 🎯 사용자 맥락 생성
   */
  const createUserContext = useCallback(async (location: { lat: number; lng: number }): Promise<UserContext> => {
    const now = new Date();
    const hour = now.getHours();
    
    const timeOfDay = hour < 12 ? 'morning' : 
                     hour < 17 ? 'afternoon' : 
                     hour < 21 ? 'evening' : 'night';
    
    const dayOfWeek = [0, 6].includes(now.getDay()) ? 'weekend' : 'weekday';

    const [weather, nearbyPOIs] = await Promise.all([
      fetchWeatherData(location),
      fetchNearbyPOIs(location)
    ]);

    const behaviorHistory = getBehaviorHistory();

    return {
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        timestamp: Date.now()
      },
      nearbyPOIs,
      currentTime: now,
      timeOfDay,
      dayOfWeek,
      weather,
      personality: {
        type: personalityType,
        preferences: {
          pace: 'moderate',
          interests,
          activityLevel: 'medium'
        }
      },
      behaviorHistory
    };
  }, [personalityType, interests, fetchWeatherData, fetchNearbyPOIs, getBehaviorHistory]);

  /**
   * 🔄 추천 업데이트
   */
  const updateRecommendations = useCallback(async (forceUpdate = false) => {
    if (state.isLoading && !forceUpdate) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let location = currentLocation;
      
      // 현재 위치가 없으면 새로 가져오기
      if (!location) {
        location = await getCurrentPosition();
        if (!location) {
          throw new Error('위치 정보를 가져올 수 없습니다');
        }
      }

      const userContext = await createUserContext(location);
      
      if (!serviceRef.current) {
        serviceRef.current = new RealtimeRecommendationService();
        
        // 추천 업데이트 리스너 등록
        serviceRef.current.addRecommendationListener((recommendations) => {
          setState(prev => ({
            ...prev,
            recommendations,
            isLoading: false,
            lastUpdated: new Date()
          }));
        });
      }

      // 맥락 업데이트로 새 추천 요청
      await serviceRef.current.updateContext(userContext);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '추천을 가져오는 중 오류가 발생했습니다'
      }));
    }
  }, [currentLocation, getCurrentPosition, createUserContext, state.isLoading]);

  /**
   * 📍 위치 변경 시 추천 업데이트
   */
  useEffect(() => {
    if (currentLocation && enableRealtimeUpdates) {
      updateRecommendations();
    }
  }, [currentLocation, updateRecommendations, enableRealtimeUpdates]);

  /**
   * ⏰ 주기적 업데이트
   */
  useEffect(() => {
    if (!enableRealtimeUpdates) return;

    const interval = setInterval(() => {
      updateRecommendations();
    }, updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [enableRealtimeUpdates, updateInterval, updateRecommendations]);

  /**
   * 🧹 정리
   */
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        // 리스너 정리는 서비스 내부에서 처리
        serviceRef.current = null;
      }
    };
  }, []);

  /**
   * 🎯 특정 추천 수락
   */
  const acceptRecommendation = useCallback((recommendationId: string) => {
    const recommendation = state.recommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;

    // 사용자 행동 히스토리 업데이트
    const behaviorHistory = getBehaviorHistory();
    behaviorHistory.acceptedRecommendations = behaviorHistory.acceptedRecommendations || [];
    behaviorHistory.acceptedRecommendations.push({
      id: recommendationId,
      type: recommendation.type,
      timestamp: Date.now()
    });

    localStorage.setItem('navi-user-behavior', JSON.stringify(behaviorHistory));

    // 추천 수락 이벤트 발생
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'recommendation_accepted', {
        recommendation_id: recommendationId,
        recommendation_type: recommendation.type,
        confidence: recommendation.context.confidence
      });
    }
  }, [state.recommendations, getBehaviorHistory]);

  /**
   * 🚫 추천 거부
   */
  const dismissRecommendation = useCallback((recommendationId: string) => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter(r => r.id !== recommendationId)
    }));

    // 거부된 추천 기록
    const behaviorHistory = getBehaviorHistory();
    behaviorHistory.dismissedRecommendations = behaviorHistory.dismissedRecommendations || [];
    behaviorHistory.dismissedRecommendations.push({
      id: recommendationId,
      timestamp: Date.now()
    });

    localStorage.setItem('navi-user-behavior', JSON.stringify(behaviorHistory));
  }, [getBehaviorHistory]);

  /**
   * 🔄 수동 새로고침
   */
  const refreshRecommendations = useCallback(() => {
    updateRecommendations(true);
  }, [updateRecommendations]);

  return {
    // 상태
    recommendations: state.recommendations,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // 액션
    acceptRecommendation,
    dismissRecommendation,
    refreshRecommendations,
    
    // 유틸리티
    hasRecommendations: state.recommendations.length > 0,
    urgentRecommendations: state.recommendations.filter(r => r.context.urgency === 'high'),
    highConfidenceRecommendations: state.recommendations.filter(r => r.context.confidence > 0.8)
  };
};