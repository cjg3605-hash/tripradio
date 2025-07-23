// 🎭 성격 감지 및 표시 컴포넌트
// Phase 1 Task 1.3: UI에 개인화 상태 표시

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PersonalityCalculationResult } from '../lib/personality/personality-calculator';
import { personalityAdapter } from '../lib/adaptation/personality-adapter';

interface PersonalityIndicatorProps {
  personalityResult: PersonalityCalculationResult | null;
  showDetails?: boolean;
  showAdaptationStatus?: boolean;
  onPersonalityUpdate?: (result: PersonalityCalculationResult) => void;
  className?: string;
}

interface PersonalityDisplayData {
  trait: string;
  traitKorean: string;
  score: number;
  confidence: number;
  color: string;
  icon: string;
  description: string;
  characteristics: string[];
}

const PERSONALITY_INFO = {
  openness: {
    korean: '개방성',
    color: 'from-purple-500 to-pink-500',
    icon: '🎨',
    description: '새로운 경험과 창의적 아이디어를 추구합니다',
    shortDesc: '창의적이고 호기심이 많음'
  },
  conscientiousness: {
    korean: '성실성',
    color: 'from-blue-500 to-indigo-600',
    icon: '📋',
    description: '체계적이고 계획적으로 일을 처리합니다',
    shortDesc: '체계적이고 신뢰할 수 있음'
  },
  extraversion: {
    korean: '외향성',
    color: 'from-orange-500 to-red-500',
    icon: '🎉',
    description: '사교적이고 활발한 상호작용을 선호합니다',
    shortDesc: '사교적이고 에너지가 넘침'
  },
  agreeableness: {
    korean: '친화성',
    color: 'from-green-500 to-emerald-500',
    icon: '💝',
    description: '협력적이고 타인을 배려하는 성향입니다',
    shortDesc: '친화적이고 협력적임'
  },
  neuroticism: {
    korean: '신경성',
    color: 'from-gray-500 to-slate-600',
    icon: '🕊️',
    description: '안정감과 평온함을 추구합니다',
    shortDesc: '안정성과 평온함을 선호'
  }
} as const;

/**
 * 🎯 성격 표시 컴포넌트
 */
const PersonalityIndicator: React.FC<PersonalityIndicatorProps> = ({
  personalityResult,
  showDetails = true,
  showAdaptationStatus = true,
  onPersonalityUpdate,
  className = ''
}) => {
  const [displayData, setDisplayData] = useState<PersonalityDisplayData | null>(null);
  const [adaptationReport, setAdaptationReport] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // 성격 데이터 업데이트
  useEffect(() => {
    if (personalityResult) {
      const primary = personalityResult.finalPersonality.primary;
      const info = PERSONALITY_INFO[primary.trait];
      
      setDisplayData({
        trait: primary.trait,
        traitKorean: info.korean,
        score: primary.score,
        confidence: personalityResult.finalPersonality.confidence,
        color: info.color,
        icon: info.icon,
        description: info.description,
        characteristics: primary.characteristics
      });

      // 애니메이션 효과
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      // 적응 리포트 업데이트
      if (showAdaptationStatus) {
        setAdaptationReport(personalityAdapter.getAdaptationReport());
      }
    }
  }, [personalityResult, showAdaptationStatus]);

  // 신뢰도에 따른 스타일 조정
  const getConfidenceStyle = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'border-green-400 bg-green-50';
    if (confidence >= 0.6) return 'border-yellow-400 bg-yellow-50';
    return 'border-red-400 bg-red-50';
  }, []);

  // 점수를 백분율로 표시
  const formatScore = (score: number) => `${(score * 100).toFixed(0)}%`;

  if (!personalityResult || !displayData) {
    return (
      <div className={`personality-indicator detecting ${className}`}>
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="animate-spin text-2xl">🧠</div>
          <div>
            <div className="font-medium text-gray-700">성격 분석 중...</div>
            <div className="text-sm text-gray-500">행동 패턴을 분석하고 있습니다</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`personality-indicator ${className}`}>
      {/* 메인 성격 표시 */}
      <div className={`
        personality-main 
        ${isAnimating ? 'scale-105 transition-transform duration-300' : ''}
        p-4 rounded-lg border-2 ${getConfidenceStyle(displayData.confidence)}
        bg-gradient-to-r ${displayData.color} bg-opacity-10
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{displayData.icon}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {displayData.traitKorean}형
                </h3>
                <div className="px-2 py-1 bg-white bg-opacity-80 rounded-full text-sm font-medium">
                  {formatScore(displayData.score)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {PERSONALITY_INFO[displayData.trait].shortDesc}
              </p>
            </div>
          </div>
          
          {/* 신뢰도 표시 */}
          <div className="text-right">
            <div className="text-xs text-gray-500">신뢰도</div>
            <div className={`text-sm font-medium ${
              displayData.confidence >= 0.8 ? 'text-green-600' :
              displayData.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {formatScore(displayData.confidence)}
            </div>
          </div>
        </div>

        {/* 하이브리드 성격 표시 */}
        {personalityResult.finalPersonality.hybrid && personalityResult.finalPersonality.secondary && (
          <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">부차적 성격:</div>
              <div className="flex items-center space-x-1">
                <span className="text-lg">
                  {PERSONALITY_INFO[personalityResult.finalPersonality.secondary.trait].icon}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {PERSONALITY_INFO[personalityResult.finalPersonality.secondary.trait].korean}
                </span>
                <span className="text-xs text-gray-500">
                  ({formatScore(personalityResult.finalPersonality.secondary.score)})
                </span>
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              🌀 혼합형 성격으로 다양한 스타일 적용
            </div>
          </div>
        )}
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="mt-4 space-y-3">
          {/* 성격 특성 */}
          <div className="personality-characteristics p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">주요 특성</h4>
            <div className="flex flex-wrap gap-2">
              {displayData.characteristics.map((trait, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 shadow-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* 적응 현황 */}
          {showAdaptationStatus && adaptationReport && (
            <div className="adaptation-status p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <span className="mr-2">⚙️</span>
                개인화 적용 현황
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-600">적응 품질:</span>
                  <span className="ml-1 font-medium">
                    {(adaptationReport.qualityScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-blue-600">평균 속도:</span>
                  <span className="ml-1 font-medium">
                    {adaptationReport.averageAdaptationTime}ms
                  </span>
                </div>
              </div>
              
              {adaptationReport.adaptationHistory?.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-blue-600 mb-1">최근 적응:</div>
                  <div className="text-xs text-gray-600">
                    {adaptationReport.adaptationHistory[adaptationReport.adaptationHistory.length - 1]?.adjustment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 상세 정보 토글 */}
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            {showFullDetails ? '▲ 간단히 보기' : '▼ 자세히 보기'}
          </button>

          {/* 확장 상세 정보 */}
          {showFullDetails && (
            <div className="space-y-3 mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* 성격 점수 분포 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">성격 점수 분포</h5>
                <div className="space-y-2">
                  {Object.entries(personalityResult.finalPersonality.primary.score ? personalityResult.calculationDetails.scoreCalculation.confidenceWeightedScores : {}).map(([trait, score]) => (
                    <div key={trait} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{PERSONALITY_INFO[trait as keyof typeof PERSONALITY_INFO]?.icon}</span>
                        <span className="text-sm text-gray-600">
                          {PERSONALITY_INFO[trait as keyof typeof PERSONALITY_INFO]?.korean}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${
                              PERSONALITY_INFO[trait as keyof typeof PERSONALITY_INFO]?.color
                            }`}
                            style={{ width: `${Math.min(100, (score as number) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {formatScore(score as number)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 신뢰도 메트릭 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">신뢰도 분석</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500">데이터 품질</div>
                    <div className="font-medium">
                      {formatScore(personalityResult.calculationDetails.confidenceCalculation.dataConfidence)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">시간적 일관성</div>
                    <div className="font-medium">
                      {formatScore(personalityResult.calculationDetails.confidenceCalculation.temporalConsistency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">교차 검증</div>
                    <div className="font-medium">
                      {formatScore(personalityResult.calculationDetails.confidenceCalculation.crossValidation)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">전체 신뢰도</div>
                    <div className="font-medium">
                      {formatScore(personalityResult.calculationDetails.confidenceCalculation.overallConfidence)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 불확실성 정보 */}
              {personalityResult.uncertaintyHandling.uncertaintyLevel > 0.3 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">불확실성 요인</h5>
                  <div className="space-y-1">
                    {personalityResult.uncertaintyHandling.causes.map((cause, index) => (
                      <div key={index} className="text-xs text-orange-600 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {cause}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">완화 전략:</div>
                    {personalityResult.uncertaintyHandling.mitigationStrategies.map((strategy, index) => (
                      <div key={index} className="text-xs text-blue-600 flex items-center">
                        <span className="mr-1">💡</span>
                        {strategy}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 개인화 추천 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">개인화 전략</h5>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-500">콘텐츠 접근:</span>
                    <span className="ml-1">{personalityResult.recommendations.contentStrategy.primaryApproach}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">상호작용:</span>
                    <span className="ml-1">
                      {personalityResult.recommendations.interactionStyle.responseExpectation} 응답, 
                      {personalityResult.recommendations.interactionStyle.feedbackFrequency} 피드백
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">개인화 수준:</span>
                    <span className="ml-1">
                      {formatScore(personalityResult.recommendations.interactionStyle.personalizedLevel)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 개발자 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && showFullDetails && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">개발 정보</h5>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>세션 ID: {personalityResult.calculationDetails.inputMetrics.behaviorDataPoints}개 데이터 포인트</div>
            <div>관찰 시간: {personalityResult.calculationDetails.inputMetrics.timeSpan.toFixed(1)}분</div>
            <div>상호작용 유형: {personalityResult.calculationDetails.inputMetrics.interactionTypes.join(', ')}</div>
            <div>
              계산 세부사항: {JSON.stringify(personalityResult.calculationDetails.finalDecisionLogic.decisionReasoning)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 🎯 간단한 성격 표시 컴포넌트 (헤더용)
 */
export const PersonalityBadge: React.FC<{
  personalityResult: PersonalityCalculationResult | null;
  onClick?: () => void;
}> = ({ personalityResult, onClick }) => {
  if (!personalityResult) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full cursor-pointer" onClick={onClick}>
        <div className="animate-pulse text-sm">🧠</div>
        <span className="text-xs text-gray-600">분석중...</span>
      </div>
    );
  }

  const primary = personalityResult.finalPersonality.primary;
  const info = PERSONALITY_INFO[primary.trait];
  const confidence = personalityResult.finalPersonality.confidence;

  return (
    <div 
      className={`
        flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer transition-all duration-200
        ${confidence >= 0.8 ? 'bg-green-100 hover:bg-green-200' :
          confidence >= 0.6 ? 'bg-yellow-100 hover:bg-yellow-200' : 
          'bg-red-100 hover:bg-red-200'}
      `}
      onClick={onClick}
      title={`${info.korean}형 (${(primary.score * 100).toFixed(0)}% 신뢰도: ${(confidence * 100).toFixed(0)}%)`}
    >
      <span className="text-sm">{info.icon}</span>
      <span className="text-xs font-medium text-gray-700">{info.korean}</span>
      {personalityResult.finalPersonality.hybrid && (
        <span className="text-xs text-blue-600">🌀</span>
      )}
    </div>
  );
};

export default PersonalityIndicator;