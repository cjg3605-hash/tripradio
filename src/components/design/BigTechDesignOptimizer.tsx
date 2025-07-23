'use client';

import React, { useState, useEffect } from 'react';
import { 
  bigtechDesignSimulator, 
  COMPONENT_OPTIMAL_PATTERNS,
  DesignPattern 
} from '@/lib/design/bigtech-design-system';
import { TrendingUp, Users, Eye, Zap, Accessibility } from 'lucide-react';

interface BigTechDesignOptimizerProps {
  contentType: 'overview' | 'warning' | 'highlights' | 'navigation' | 'interactive';
  onPatternSelect: (pattern: DesignPattern) => void;
  showSimulation?: boolean;
}

const BigTechDesignOptimizer: React.FC<BigTechDesignOptimizerProps> = ({
  contentType,
  onPatternSelect,
  showSimulation = false
}) => {
  const [selectedPattern, setSelectedPattern] = useState<DesignPattern | null>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [abTestResults, setAbTestResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // 🚀 실시간 패턴 최적화
  useEffect(() => {
    const optimalPattern = bigtechDesignSimulator.selectOptimalPattern({
      contentType,
      priority: 'satisfaction',
      device: 'mobile',
      userDemographic: 'general'
    });
    
    setSelectedPattern(optimalPattern);
    onPatternSelect(optimalPattern);
  }, [contentType, onPatternSelect]);

  // 📊 시뮬레이션 실행
  const runSimulation = async () => {
    if (!selectedPattern) return;
    
    setIsSimulating(true);
    
    // 사용자 피드백 시뮬레이션
    const userFeedback = bigtechDesignSimulator.simulateUserFeedback(selectedPattern);
    setSimulationResults(userFeedback);
    
    // A/B 테스트 시뮬레이션 (현재 패턴 vs 랜덤 패턴)
    const randomPattern = bigtechDesignSimulator.selectOptimalPattern({
      contentType: contentType === 'overview' ? 'warning' : 'overview', // 다른 타입으로 비교
      priority: 'performance',
      device: 'mobile',
      userDemographic: 'tech-savvy'
    });
    
    const abTest = bigtechDesignSimulator.simulateABTest(selectedPattern, randomPattern);
    setAbTestResults(abTest);
    
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  if (!showSimulation) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">BigTech Design Simulator</h3>
          <p className="text-xs text-slate-600">실시간 UX 최적화</p>
        </div>
      </div>

      {selectedPattern && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">현재 패턴</span>
            <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
              {selectedPattern.company.toUpperCase()}
            </span>
          </div>
          <h4 className="font-semibold text-slate-900 mb-2">{selectedPattern.name}</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-600" />
              <span>만족도: {selectedPattern.userSatisfaction}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Accessibility className="w-3 h-3 text-slate-600" />
              <span>접근성: {selectedPattern.accessibility}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-600" />
              <span>시각적: {selectedPattern.visualAppeal}%</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-600" />
              <span>사용성: {selectedPattern.usability}%</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={runSimulation}
        disabled={isSimulating}
        className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium transition-all duration-200 hover:bg-slate-800 hover:shadow-lg disabled:opacity-50"
      >
        {isSimulating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            시뮬레이션 실행 중...
          </div>
        ) : (
          '10만명 UX 시뮬레이션 실행'
        )}
      </button>

      {simulationResults && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-slate-700" />
            <span className="font-medium text-slate-900">사용자 피드백</span>
          </div>
          <div className="text-sm text-slate-700 mb-2">
            <span className="font-semibold">{simulationResults.totalUsers.toLocaleString()}명</span> 참여
            • <span className="font-semibold text-slate-900">{Math.round(simulationResults.positiveRate * 100)}%</span> 긍정적
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-600">
              <strong>주요 피드백:</strong> {simulationResults.commonFeedback.join(', ')}
            </div>
          </div>
        </div>
      )}

      {abTestResults && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-700" />
            <span className="font-medium text-slate-900">A/B 테스트 결과</span>
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{abTestResults.winner.company.toUpperCase()}</span> 패턴 승리
            • <span className="font-semibold">{Math.round(abTestResults.confidence)}%</span> 신뢰도
          </div>
          <div className="text-xs text-slate-600 mt-1">
            만족도 개선: <span className="font-semibold">
              {abTestResults.metrics.userSatisfaction.improvement > 0 ? '+' : ''}
              {Math.round(abTestResults.metrics.userSatisfaction.improvement * 10) / 10}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigTechDesignOptimizer;