/**
 * 🧭 경로 최적화 React 훅
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useGeolocation } from './useGeolocation';
import { 
  RouteOptimizer, 
  RouteWaypoint, 
  RouteConstraints, 
  OptimizedRoute 
} from '@/lib/ai/route-optimizer';

interface UseRouteOptimizationOptions {
  autoOptimize?: boolean;
  maxDuration?: number; // minutes
  preferredPace?: 'slow' | 'moderate' | 'fast';
  interests?: string[];
  avoidCrowds?: boolean;
  accessibilityNeeds?: boolean;
}

interface RouteOptimizationState {
  optimizedRoute: OptimizedRoute | null;
  isOptimizing: boolean;
  error: string | null;
  progress: number; // 0-100
  alternatives: OptimizedRoute[];
}

export const useRouteOptimization = (
  waypoints: RouteWaypoint[],
  options: UseRouteOptimizationOptions = {}
) => {
  const {
    autoOptimize = true,
    maxDuration = 180, // 3 hours default
    preferredPace = 'moderate',
    interests = [],
    avoidCrowds = false,
    accessibilityNeeds = false
  } = options;

  const [state, setState] = useState<RouteOptimizationState>({
    optimizedRoute: null,
    isOptimizing: false,
    error: null,
    progress: 0,
    alternatives: []
  });

  const { currentLocation, getCurrentPosition } = useGeolocation({
    enableTracking: false,
    enablePrecisionMode: true
  });

  const optimizer = useMemo(() => new RouteOptimizer(), []);

  /**
   * 🎯 경로 제약 조건 생성
   */
  const createConstraints = useCallback((): RouteConstraints => {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      maxDuration,
      maxDistance: maxDuration * 100, // 대략적 추정 (100m/min)
      maxDifficulty: accessibilityNeeds ? 'easy' : 'challenging',
      preferredPace,
      avoidCrowds,
      weatherSensitive: true,
      accessibilityNeeds,
      interests,
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night',
      dayType: [0, 6].includes(now.getDay()) ? 'weekend' : 'weekday',
      groupSize: 1, // 기본값
      energyLevel: 'medium'
    };
  }, [maxDuration, preferredPace, avoidCrowds, accessibilityNeeds, interests]);

  /**
   * 🔄 대안 경로 생성
   */
  const generateAlternativeRoutes = useCallback(async (
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: any,
    mainRoute: OptimizedRoute
  ): Promise<OptimizedRoute[]> => {
    const alternatives: OptimizedRoute[] = [];

    try {
      // 빠른 경로 (시간 최적화)
      const fastConstraints = { 
        ...constraints, 
        preferredPace: 'fast' as const,
        maxDuration: constraints.maxDuration * 0.8 
      };
      const fastRoute = await optimizer.optimizeRoute(waypoints, fastConstraints, startLocation);
      if (fastRoute.id !== mainRoute.id) {
        alternatives.push({ ...fastRoute, id: `${fastRoute.id}_fast` });
      }

      // 여유로운 경로 (품질 최적화)
      const relaxedConstraints = { 
        ...constraints, 
        preferredPace: 'slow' as const,
        maxDuration: constraints.maxDuration * 1.5 
      };
      const relaxedRoute = await optimizer.optimizeRoute(waypoints, relaxedConstraints, startLocation);
      if (relaxedRoute.id !== mainRoute.id) {
        alternatives.push({ ...relaxedRoute, id: `${relaxedRoute.id}_relaxed` });
      }

    } catch (error) {
      console.warn('대안 경로 생성 실패:', error);
    }

    return alternatives.slice(0, 2); // 최대 2개 대안
  }, [optimizer]);

  /**
   * 🚀 경로 최적화 실행
   */
  const optimizeRoute = useCallback(async (forceOptimize = false) => {
    if (state.isOptimizing && !forceOptimize) return;
    if (waypoints.length === 0) return;

    setState(prev => ({ 
      ...prev, 
      isOptimizing: true, 
      error: null, 
      progress: 0 
    }));

    try {
      // 현재 위치 확보
      let startLocation = currentLocation;
      if (!startLocation) {
        setState(prev => ({ ...prev, progress: 10 }));
        startLocation = await getCurrentPosition();
        if (!startLocation) {
          throw new Error('현재 위치를 확인할 수 없습니다');
        }
      }

      setState(prev => ({ ...prev, progress: 20 }));

      // 제약 조건 생성
      const constraints = createConstraints();
      
      setState(prev => ({ ...prev, progress: 30 }));

      // 경로 최적화 실행
      const optimizedRoute = await optimizer.optimizeRoute(
        waypoints,
        constraints,
        startLocation
      );

      setState(prev => ({ ...prev, progress: 80 }));

      // 대안 경로 생성 (간소화)
      const alternatives = await generateAlternativeRoutes(
        waypoints,
        constraints,
        startLocation,
        optimizedRoute
      );

      setState(prev => ({
        ...prev,
        optimizedRoute,
        alternatives,
        isOptimizing: false,
        progress: 100
      }));

      // 진행률 초기화
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }));
      }, 2000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: error instanceof Error ? error.message : '경로 최적화에 실패했습니다',
        progress: 0
      }));
    }
  }, [waypoints, currentLocation, getCurrentPosition, createConstraints, optimizer, state.isOptimizing, generateAlternativeRoutes]);


  /**
   * 📊 경로 통계 계산
   */
  const routeStats = useMemo(() => {
    if (!state.optimizedRoute) return null;

    const route = state.optimizedRoute;
    const waypointsByType = route.waypoints.reduce((acc, waypoint) => {
      acc[waypoint.type] = (acc[waypoint.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityBreakdown = route.waypoints.reduce((acc, waypoint) => {
      acc[waypoint.priority] = (acc[waypoint.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWaypoints: route.waypoints.length,
      totalDuration: route.totalDuration,
      totalDistance: route.totalDistance,
      estimatedWalkingTime: route.estimatedWalkingTime,
      averageDifficulty: route.averageDifficulty,
      qualityScore: route.quality.score,
      waypointsByType,
      priorityBreakdown,
      optimizationTime: route.metadata.optimizationTime,
      algorithm: route.metadata.algorithm,
      confidence: route.metadata.confidence
    };
  }, [state.optimizedRoute]);

  /**
   * 🎯 특정 웨이포인트로 경로 조정
   */
  const adjustRouteForWaypoint = useCallback((waypointId: string, action: 'add' | 'remove' | 'prioritize') => {
    if (!state.optimizedRoute) return;

    const currentWaypoints = [...state.optimizedRoute.waypoints];
    
    switch (action) {
      case 'remove':
        const filteredWaypoints = currentWaypoints.filter(w => w.id !== waypointId);
        // 새로운 웨이포인트 배열로 재최적화
        setTimeout(() => optimizeRoute(true), 100);
        break;
        
      case 'prioritize':
        const waypointIndex = currentWaypoints.findIndex(w => w.id === waypointId);
        if (waypointIndex > -1) {
          currentWaypoints[waypointIndex].priority = 'high';
          setTimeout(() => optimizeRoute(true), 100);
        }
        break;
    }
  }, [state.optimizedRoute, optimizeRoute]);

  /**
   * 🔄 실시간 경로 업데이트
   */
  const updateRouteProgress = useCallback((completedWaypointIds: string[]) => {
    if (!state.optimizedRoute) return;

    const remainingWaypoints = state.optimizedRoute.waypoints.filter(
      waypoint => !completedWaypointIds.includes(waypoint.id)
    );

    if (remainingWaypoints.length !== state.optimizedRoute.waypoints.length) {
      // 남은 웨이포인트로 경로 재최적화
      setTimeout(() => optimizeRoute(true), 100);
    }
  }, [state.optimizedRoute, optimizeRoute]);

  /**
   * 🌍 경로 공유 데이터 생성
   */
  const generateShareableRoute = useCallback(() => {
    if (!state.optimizedRoute) return null;

    return {
      id: state.optimizedRoute.id,
      title: `NAVI 추천 경로 (${Math.round(state.optimizedRoute.totalDuration)}분)`,
      description: `${state.optimizedRoute.waypoints.length}개 지점을 포함한 최적화된 여행 경로`,
      waypoints: state.optimizedRoute.waypoints.map(w => ({
        name: w.name,
        location: w.location,
        type: w.type,
        duration: w.estimatedDuration
      })),
      totalDuration: state.optimizedRoute.totalDuration,
      totalDistance: state.optimizedRoute.totalDistance,
      quality: state.optimizedRoute.quality.score,
      shareUrl: `${window.location.origin}/shared-route/${state.optimizedRoute.id}`,
      createdAt: new Date().toISOString()
    };
  }, [state.optimizedRoute]);

  /**
   * 🚀 자동 최적화 (웨이포인트 변경 시)
   */
  useEffect(() => {
    if (autoOptimize && waypoints.length > 0 && currentLocation) {
      const delayTimer = setTimeout(() => {
        optimizeRoute();
      }, 1000); // 1초 디바운스

      return () => clearTimeout(delayTimer);
    }
    // 조건에 맞지 않는 경우 명시적으로 undefined 반환
    return undefined;
  }, [waypoints, currentLocation, autoOptimize, optimizeRoute]);

  return {
    // 상태
    optimizedRoute: state.optimizedRoute,
    alternatives: state.alternatives,
    isOptimizing: state.isOptimizing,
    error: state.error,
    progress: state.progress,
    
    // 통계
    routeStats,
    
    // 액션
    optimizeRoute,
    adjustRouteForWaypoint,
    updateRouteProgress,
    
    // 유틸리티
    generateShareableRoute,
    hasOptimizedRoute: !!state.optimizedRoute,
    hasAlternatives: state.alternatives.length > 0,
    canOptimize: waypoints.length > 0 && !state.isOptimizing
  };
};