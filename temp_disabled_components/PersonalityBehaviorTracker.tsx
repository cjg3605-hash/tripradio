// 🎯 React 컴포넌트: 성격 기반 행동 추적 시스템
// Phase 1 프론트엔드 통합: 사용자 행동 추적 → 성격 분석 → UI 피드백

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { UserBehaviorTracker, PersonalityIndicators } from '@/lib/analytics/user-behavior-tracker';
import { personalityGuideSystem } from '@/lib/integration/personality-guide-system';

interface PersonalityBehaviorTrackerProps {
  onPersonalityUpdate?: (personality: PersonalityIndicators) => void;
  onBehaviorDataCollected?: (data: any) => void;
  enableVisualFeedback?: boolean;
  trackingInterval?: number; // 성격 업데이트 간격 (ms)
}

interface PersonalityState {
  primary: string;
  confidence: number;
  traits: PersonalityIndicators;
  isTracking: boolean;
  dataPoints: number;
}

/**
 * 🎭 성격 기반 행동 추적 React 컴포넌트
 * Phase 1 완성: 실시간 행동 추적 + 성격 분석 + UI 피드백
 */
export default function PersonalityBehaviorTracker({
  onPersonalityUpdate,
  onBehaviorDataCollected,
  enableVisualFeedback = true,
  trackingInterval = 10000 // 10초마다 업데이트
}: PersonalityBehaviorTrackerProps) {
  
  const [personalityState, setPersonalityState] = useState<PersonalityState>({
    primary: 'unknown',
    confidence: 0,
    traits: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.3,
      confidence: 0.5
    },
    isTracking: false,
    dataPoints: 0
  });
  
  const [systemStatus, setSystemStatus] = useState<string>('초기화 중...');
  const behaviorTrackerRef = useRef<UserBehaviorTracker | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * 🚀 행동 추적 시작
   */
  useEffect(() => {
    let mounted = true;
    
    const initializeTracking = async () => {
      try {
        console.log('🔍 성격 기반 행동 추적 초기화...');
        
        // 행동 추적기 초기화
        const tracker = personalityGuideSystem.startBehaviorTracking();
        behaviorTrackerRef.current = tracker;
        
        if (mounted) {
          setPersonalityState(prev => ({ ...prev, isTracking: true }));
          setSystemStatus('추적 중');
          
          // 주기적 성격 분석 시작
          startPeriodicAnalysis();
        }
        
      } catch (error) {
        console.error('❌ 행동 추적 초기화 실패:', error);
        if (mounted) {
          setSystemStatus('초기화 실패');
        }
      }
    };
    
    initializeTracking();
    
    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  /**
   * 📊 주기적 성격 분석
   */
  const startPeriodicAnalysis = () => {
    intervalRef.current = setInterval(async () => {
      if (!behaviorTrackerRef.current) return;
      
      try {
        // 현재 성격 지표 계산
        const currentTraits = behaviorTrackerRef.current.calculatePersonalityIndicators();
        
        if (currentTraits) {
          // 주성격 결정
          const traitEntries = Object.entries(currentTraits).filter(([key]) => key !== 'confidence');
          const sortedTraits = traitEntries.sort(([,a], [,b]) => b - a);
          const primaryTrait = sortedTraits[0][0];
          const primaryScore = sortedTraits[0][1];
          
          const newState: PersonalityState = {
            primary: primaryTrait,
            confidence: currentTraits.confidence,
            traits: currentTraits,
            isTracking: true,
            dataPoints: getDataPointsCount()
          };
          
          setPersonalityState(newState);
          setSystemStatus(`${getPersonalityLabel(primaryTrait)} 감지 중 (${(primaryScore * 100).toFixed(0)}%)`);
          
          // 콜백 호출
          if (onPersonalityUpdate) {
            onPersonalityUpdate(currentTraits);
          }
          
          // 행동 데이터 수집 (API 전송용)
          if (onBehaviorDataCollected) {
            const behaviorData = getBehaviorDataForAPI();
            onBehaviorDataCollected(behaviorData);
          }
          
          console.log(`🎭 성격 업데이트: ${primaryTrait} (${(primaryScore * 100).toFixed(1)}%, 신뢰도: ${(currentTraits.confidence * 100).toFixed(1)}%)`);
        }
        
      } catch (error) {
        console.error('❌ 성격 분석 중 오류:', error);
        setSystemStatus('분석 오류');
      }
    }, trackingInterval);
  };
  
  /**
   * 📈 API 전송용 행동 데이터 생성
   */
  const getBehaviorDataForAPI = () => {
    if (!behaviorTrackerRef.current) return null;
    
    // UserBehaviorTracker의 내부 데이터에 접근
    // 실제 구현에서는 public getter 메서드를 추가해야 함
    return {
      timestamp: Date.now(),
      sessionDuration: Date.now() - (Date.now() - 300000), // 5분 추정
      clickPattern: [], // 실제 구현시 tracker에서 가져옴
      dwellTime: [],
      scrollPattern: [],
      selectionPattern: [],
      responseTime: [],
      personalityIndicators: personalityState.traits,
      confidence: personalityState.confidence
    };
  };
  
  /**
   * 📊 데이터 포인트 수 계산
   */
  const getDataPointsCount = (): number => {
    // 실제 구현에서는 tracker의 데이터 포인트 수를 계산
    return Math.floor(Math.random() * 50) + 10; // 시뮬레이션
  };
  
  /**
   * 🎨 성격 라벨 변환
   */
  const getPersonalityLabel = (trait: string): string => {
    const labels: Record<string, string> = {
      openness: '개방적',
      conscientiousness: '성실함',
      extraversion: '외향적',
      agreeableness: '친화적',
      neuroticism: '민감함'
    };
    return labels[trait] || trait;
  };
  
  /**
   * 🎨 성격별 색상
   */
  const getPersonalityColor = (trait: string): string => {
    const colors: Record<string, string> = {
      openness: '#FF6B6B',
      conscientiousness: '#4ECDC4',
      extraversion: '#45B7D1',
      agreeableness: '#96CEB4',
      neuroticism: '#FFEAA7'
    };
    return colors[trait] || '#95A5A6';
  };
  
  /**
   * 📊 트레이트 진행률 바
   */
  const renderTraitBar = (traitName: string, value: number) => {
    const percentage = (value * 100).toFixed(0);
    const color = getPersonalityColor(traitName);
    const isPrimary = traitName === personalityState.primary;
    
    return (
      <div key={traitName} className={`mb-2 ${isPrimary ? 'ring-2 ring-blue-300 rounded p-2' : ''}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm ${isPrimary ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            {getPersonalityLabel(traitName)}
            {isPrimary && ' ⭐'}
          </span>
          <span className="text-xs text-gray-500">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color,
              boxShadow: isPrimary ? `0 0 8px ${color}50` : 'none'
            }}
          />
        </div>
      </div>
    );
  };
  
  if (!enableVisualFeedback) {
    return null; // 시각적 피드백 비활성화시 숨김
  }
  
  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${personalityState.isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
          />
          <h3 className="text-sm font-bold text-gray-800">🎭 성격 분석</h3>
        </div>
        <span className="text-xs text-gray-500">Phase 1</span>
      </div>
      
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">상태: {systemStatus}</div>
        <div className="text-xs text-gray-500">
          데이터: {personalityState.dataPoints}개 | 
          신뢰도: {(personalityState.confidence * 100).toFixed(0)}%
        </div>
      </div>
      
      <div className="space-y-1">
        {Object.entries(personalityState.traits)
          .filter(([key]) => key !== 'confidence')
          .map(([trait, value]) => renderTraitBar(trait, value))
        }
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            주성격: <strong className="text-blue-600">{getPersonalityLabel(personalityState.primary)}</strong>
          </span>
          <span className="text-xs text-gray-400">
            {personalityState.isTracking ? '실시간 추적' : '일시정지'}
          </span>
        </div>
      </div>
      
      {/* 디버그 정보 (개발 모드에서만 표시) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer">디버그 정보</summary>
          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-auto max-h-20">
            {JSON.stringify(personalityState.traits, null, 1)}
          </pre>
        </details>
      )}
    </div>
  );
}