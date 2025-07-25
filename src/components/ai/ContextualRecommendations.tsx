'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Star, 
  Navigation, 
  Lightbulb,
  Zap,
  X,
  RefreshCw,
  TrendingUp,
  Calendar,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useContextualRecommendations } from '@/hooks/useContextualRecommendations';
import { ContextualRecommendation } from '@/lib/ai/contextual-recommendation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContextualRecommendationsProps {
  personalityType?: string;
  interests?: string[];
  onRecommendationSelect?: (recommendation: ContextualRecommendation) => void;
  className?: string;
}

const RecommendationCard: React.FC<{
  recommendation: ContextualRecommendation;
  onAccept: () => void;
  onDismiss: () => void;
  onSelect?: () => void;
}> = ({ recommendation, onAccept, onDismiss, onSelect }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'content': return <Eye className="w-4 h-4" />;
      case 'route': return <Navigation className="w-4 h-4" />;
      case 'timing': return <Clock className="w-4 h-4" />;
      case 'activity': return <Zap className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'challenging': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            {getTypeIcon(recommendation.type)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className={getUrgencyColor(recommendation.context.urgency)}>
                {recommendation.context.urgency}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(recommendation.difficulty)}>
                {recommendation.difficulty}
              </Badge>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4">{recommendation.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{recommendation.estimatedDuration}분</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>{Math.round(recommendation.context.confidence * 100)}% 확신</span>
          </div>
        </div>
      </div>

      {/* 추천 근거 */}
      {recommendation.context.reasoning.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">추천 이유:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {recommendation.context.reasoning.map((reason, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 적응 사항 */}
      {recommendation.context.adaptations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">맞춤 조정:</h4>
          <div className="flex flex-wrap gap-2">
            {recommendation.context.adaptations.map((adaptation, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {adaptation}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 태그 */}
      {recommendation.metadata.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {recommendation.metadata.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex space-x-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          className="flex-1"
          size="sm"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          선택하기
        </Button>
      </div>
    </Card>
  );
};

const ContextualRecommendations: React.FC<ContextualRecommendationsProps> = ({
  personalityType = 'balanced',
  interests = [],
  onRecommendationSelect,
  className = ''
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const {
    recommendations,
    isLoading,
    error,
    lastUpdated,
    acceptRecommendation,
    dismissRecommendation,
    refreshRecommendations,
    hasRecommendations,
    urgentRecommendations,
    highConfidenceRecommendations
  } = useContextualRecommendations({
    personalityType,
    interests,
    enableRealtimeUpdates: true,
    updateInterval: 5
  });

  const handleAcceptRecommendation = (recommendation: ContextualRecommendation) => {
    acceptRecommendation(recommendation.id);
    onRecommendationSelect?.(recommendation);
  };

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-500" />
            <span className="text-red-700">추천을 불러오는 중 오류가 발생했습니다: {error}</span>
          </div>
          <Button 
            onClick={refreshRecommendations}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>맞춤 추천</span>
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              마지막 업데이트: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {urgentRecommendations.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              긴급 {urgentRecommendations.length}
            </Badge>
          )}
          <Button
            onClick={refreshRecommendations}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 통계 */}
      {hasRecommendations && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-sm text-gray-500">전체 추천</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{highConfidenceRecommendations.length}</div>
            <div className="text-sm text-gray-500">고신뢰도</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{urgentRecommendations.length}</div>
            <div className="text-sm text-gray-500">긴급</div>
          </Card>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && recommendations.length === 0 && (
        <Card className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">맞춤 추천을 생성하고 있습니다...</p>
        </Card>
      )}

      {/* 추천 목록 */}
      {hasRecommendations && (
        <div className="space-y-4">
          {/* 긴급 추천 */}
          {urgentRecommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>긴급 추천</span>
              </h3>
              <div className="space-y-3">
                {urgentRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAccept={() => handleAcceptRecommendation(recommendation)}
                    onDismiss={() => dismissRecommendation(recommendation.id)}
                    onSelect={() => setExpandedCard(
                      expandedCard === recommendation.id ? null : recommendation.id
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 일반 추천 */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>추천 목록</span>
            </h3>
            <div className="space-y-3">
              {recommendations
                .filter(r => r.context.urgency !== 'high')
                .map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onAccept={() => handleAcceptRecommendation(recommendation)}
                    onDismiss={() => dismissRecommendation(recommendation.id)}
                    onSelect={() => setExpandedCard(
                      expandedCard === recommendation.id ? null : recommendation.id
                    )}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 추천 없음 */}
      {!isLoading && !hasRecommendations && !error && (
        <Card className="p-8 text-center">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">추천을 준비하고 있습니다</h3>
          <p className="text-gray-500 mb-4">
            현재 위치와 상황을 분석하여 맞춤 추천을 생성하고 있습니다.
          </p>
          <Button onClick={refreshRecommendations} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            추천 요청
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ContextualRecommendations;