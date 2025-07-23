// 📍 Phase 3: 실시간 위치 기반 추천 컴포넌트

'use client';

import React, { useState, useEffect } from 'react';
import { locationService, LocationRecommendation, LocationCoordinates } from '@/lib/location/location-service';

interface LocationRecommendationsProps {
  userPersonality?: string;
  preferences?: string[];
  onRecommendationSelect?: (recommendation: LocationRecommendation) => void;
  maxRecommendations?: number;
  autoUpdate?: boolean;
}

interface LocationStatus {
  isTracking: boolean;
  hasPermission: boolean;
  accuracy?: number;
  lastUpdate?: number;
}

/**
 * 📍 실시간 위치 기반 추천 컴포넌트
 * Phase 3: 사용자 위치에 따른 스마트 콘텐츠 추천
 */
export default function LocationRecommendations({
  userPersonality = 'agreeableness',
  preferences = [],
  onRecommendationSelect,
  maxRecommendations = 5,
  autoUpdate = true
}: LocationRecommendationsProps) {
  
  const [recommendations, setRecommendations] = useState<LocationRecommendation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    isTracking: false,
    hasPermission: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  
  useEffect(() => {
    initializeLocationTracking();
    
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);
  
  useEffect(() => {
    if (currentLocation && autoUpdate) {
      generateRecommendations();
    }
  }, [currentLocation, userPersonality, preferences, autoUpdate]);
  
  /**
   * 🚀 위치 추적 초기화
   */
  const initializeLocationTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const location = await locationService.startLocationTracking();
      
      setCurrentLocation(location);
      setLocationStatus({
        isTracking: true,
        hasPermission: true,
        accuracy: location.accuracy,
        lastUpdate: Date.now()
      });
      
      // 위치 업데이트 콜백 등록
      locationService.onLocationUpdate((newLocation) => {
        setCurrentLocation(newLocation);
        setLocationStatus(prev => ({
          ...prev,
          accuracy: newLocation.accuracy,
          lastUpdate: Date.now()
        }));
        
        if (autoUpdate) {
          generateRecommendations();
        }
      });
      
      console.log('📍 위치 추적 초기화 완료');
      
    } catch (error) {
      const message = error instanceof Error ? error.message : '위치 접근 권한이 필요합니다';
      setError(message);
      setLocationStatus({
        isTracking: false,
        hasPermission: false
      });
      console.error('❌ 위치 추적 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 🎯 추천 생성
   */
  const generateRecommendations = async () => {
    if (!currentLocation) {
      setError('위치 정보를 먼저 확인해주세요');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newRecommendations = await locationService.generateLocationRecommendations(
        userPersonality,
        preferences
      );
      
      const limitedRecommendations = newRecommendations.slice(0, maxRecommendations);
      setRecommendations(limitedRecommendations);
      setLastUpdateTime(new Date());
      
      console.log(`✅ ${limitedRecommendations.length}개 추천 생성 완료`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : '추천 생성에 실패했습니다';
      setError(message);
      console.error('❌ 추천 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 🎭 성격별 아이콘 반환
   */
  const getPersonalityIcon = (personality: string): string => {
    const icons: Record<string, string> = {
      openness: '🎨',
      conscientiousness: '📋',
      extraversion: '🎉',
      agreeableness: '🤝',
      neuroticism: '🌸'
    };
    return icons[personality] || '🎯';
  };
  
  /**
   * 📍 장소 타입별 아이콘 반환
   */
  const getPlaceTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      palace: '🏰',
      museum: '🏛️',
      cafe: '☕',
      restaurant: '🍽️',
      park: '🌳',
      gallery: '🎨',
      market: '🛒',
      historical: '📚',
      cultural: '🎭',
      nature: '🌿'
    };
    return icons[type] || '📍';
  };
  
  /**
   * ⚡ 긴급도별 색상 반환
   */
  const getUrgencyColor = (urgency: string): string => {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-orange-600 bg-orange-50 border-orange-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[urgency] || colors.low;
  };
  
  /**
   * 📏 거리 포맷팅
   */
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };
  
  /**
   * ⏰ 시간 포맷팅
   */
  const formatWalkTime = (minutes: number): string => {
    if (minutes < 60) {
      return `도보 ${minutes}분`;
    }
    return `도보 ${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
  };
  
  if (error && !locationStatus.hasPermission) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">위치 권한 필요</h3>
          <p className="text-gray-600 mb-4">
            실시간 위치 기반 추천을 받으려면 위치 접근 권한을 허용해주세요.
          </p>
          <button
            onClick={initializeLocationTracking}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            위치 권한 요청
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📍</span>
            <h3 className="text-lg font-bold text-gray-800">실시간 위치 추천</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Phase 3</span>
          </div>
          <div className="flex items-center space-x-2">
            {locationStatus.isTracking && (
              <div className="flex items-center text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                추적 중
              </div>
            )}
            <button
              onClick={generateRecommendations}
              disabled={isLoading || !currentLocation}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {isLoading ? '생성 중...' : '새로고침'}
            </button>
          </div>
        </div>
        
        {/* 위치 상태 정보 */}
        {currentLocation && (
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>현재 위치: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</span>
              {locationStatus.accuracy && (
                <span>정확도: {Math.round(locationStatus.accuracy)}m</span>
              )}
              {lastUpdateTime && (
                <span>업데이트: {lastUpdateTime.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}
        
        {/* 성격 정보 */}
        <div className="mt-2 flex items-center text-xs text-gray-600">
          <span className="mr-2">{getPersonalityIcon(userPersonality)} {userPersonality}</span>
          {preferences.length > 0 && (
            <span>선호: {preferences.join(', ')}</span>
          )}
        </div>
      </div>
      
      {/* 추천 목록 */}
      <div className="p-4">
        {isLoading && recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">주변 추천 장소를 찾고 있습니다...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-600 font-medium">오류 발생</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-600">주변에 추천할 장소가 없습니다</p>
            <p className="text-gray-500 text-sm mt-1">다른 지역으로 이동해보세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div
                key={recommendation.place.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onRecommendationSelect?.(recommendation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getPlaceTypeIcon(recommendation.place.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{recommendation.place.name}</h4>
                      <div className="text-sm text-gray-600 flex items-center space-x-3">
                        <span>{formatDistance(recommendation.place.distance)}</span>
                        <span>{formatWalkTime(recommendation.place.estimatedWalkTime)}</span>
                        {recommendation.place.rating && (
                          <span className="flex items-center">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            {recommendation.place.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full border ${getUrgencyColor(recommendation.urgency)}`}>
                    {recommendation.urgency === 'high' ? '높음' : 
                     recommendation.urgency === 'medium' ? '보통' : '낮음'}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{recommendation.reason}</p>
                
                {recommendation.personalityInsights.length > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-50 rounded p-2 mb-2">
                    <div className="font-medium mb-1">🎭 성격 맞춤 포인트:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendation.personalityInsights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>예상 소요시간: {Math.floor(recommendation.estimatedVisitDuration / 60)}시간</span>
                  <span>추천 방문시간: {recommendation.bestTimeToVisit}</span>
                  {recommendation.place.personalityFit !== undefined && (
                    <span className="text-green-600">
                      적합도: {Math.round(recommendation.place.personalityFit * 100)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 푸터 정보 */}
      {recommendations.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            📍 실시간 위치 기반으로 {recommendations.length}개 장소를 추천했습니다
            {autoUpdate && ' • 위치 변경시 자동 업데이트됩니다'}
          </div>
        </div>
      )}
      
      {/* 디버그 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="p-4 border-t border-gray-100">
          <summary className="text-xs text-gray-400 cursor-pointer">디버그 정보</summary>
          <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({
              locationStatus,
              currentLocation,
              recommendationsCount: recommendations.length,
              userPersonality,
              preferences,
              lastUpdate: lastUpdateTime?.toISOString()
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * 🎯 간단한 위치 추천 버튼 컴포넌트
 */
export function LocationQuickActions({ 
  onRecommendationRequest 
}: { 
  onRecommendationRequest?: () => void 
}) {
  const [isNearby, setIsNearby] = useState(false);
  
  useEffect(() => {
    // 주변에 추천할 장소가 있는지 빠르게 확인
    locationService.startLocationTracking()
      .then(() => {
        setIsNearby(true);
      })
      .catch(() => {
        setIsNearby(false);
      });
  }, []);
  
  if (!isNearby) {
    return null;
  }
  
  return (
    <button
      onClick={onRecommendationRequest}
      className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      title="주변 추천 장소 보기"
    >
      <span className="text-xl">📍</span>
    </button>
  );
}