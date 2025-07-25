'use client';

import React, { useState } from 'react';
import { 
  Route, 
  MapPin, 
  Clock, 
  Navigation, 
  Settings,
  Zap,
  TrendingUp,
  Users,
  Star,
  Shuffle,
  Share2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { useRouteOptimization } from '@/hooks/useRouteOptimization';
import { RouteWaypoint } from '@/lib/ai/route-optimizer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RouteOptimizerProps {
  waypoints: RouteWaypoint[];
  onRouteSelect?: (route: any) => void;
  onWaypointUpdate?: (waypoints: RouteWaypoint[]) => void;
  className?: string;
}

const WaypointCard: React.FC<{
  waypoint: RouteWaypoint;
  index: number;
  onRemove?: () => void;
  onPrioritize?: () => void;
}> = ({ waypoint, index, onRemove, onPrioritize }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'start': return <Play className="w-4 h-4 text-green-600" />;
      case 'poi': return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'rest': return <Pause className="w-4 h-4 text-orange-600" />;
      case 'viewpoint': return <Target className="w-4 h-4 text-purple-600" />;
      case 'end': return <Star className="w-4 h-4 text-red-600" />;
      default: return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {getTypeIcon(waypoint.type)}
              <h4 className="font-medium text-gray-900">{waypoint.name}</h4>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{waypoint.estimatedDuration}분</span>
              </div>
              <Badge className={getPriorityColor(waypoint.priority)}>
                {waypoint.priority}
              </Badge>
              <Badge variant="outline">
                {waypoint.difficulty}
              </Badge>
            </div>
            {waypoint.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {waypoint.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          {waypoint.priority !== 'essential' && (
            <Button
              onClick={onPrioritize}
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          )}
          {waypoint.type !== 'start' && waypoint.type !== 'end' && (
            <Button
              onClick={onRemove}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const RouteStatsCard: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <BarChart3 className="w-5 h-5" />
        <span>경로 통계</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalWaypoints}</div>
          <div className="text-sm text-gray-500">총 지점</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(stats.totalDuration)}</div>
          <div className="text-sm text-gray-500">예상 시간(분)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalDistance)}m</div>
          <div className="text-sm text-gray-500">총 거리</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.qualityScore}</div>
          <div className="text-sm text-gray-500">품질 점수</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>평균 난이도</span>
            <span>{stats.averageDifficulty.toFixed(1)}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(stats.averageDifficulty / 3) * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>최적화 신뢰도</span>
            <span>{Math.round(stats.confidence * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.round(stats.confidence * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        알고리즘: {stats.algorithm} | 처리시간: {stats.optimizationTime}ms
      </div>
    </Card>
  );
};

const AlternativeRoutesCard: React.FC<{ 
  alternatives: any[]; 
  onSelect: (route: any) => void;
}> = ({ alternatives, onSelect }) => {
  if (alternatives.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Shuffle className="w-5 h-5" />
        <span>대안 경로</span>
      </h3>
      
      <div className="space-y-3">
        {alternatives.map((route, index) => (
          <div
            key={route.id}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(route)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">
                대안 {index + 1} ({route.id.includes('fast') ? '빠른' : '여유로운'} 경로)
              </h4>
              <Badge variant="outline">
                품질 {route.quality.score}
              </Badge>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(route.totalDuration)}분</span>
              <span>{Math.round(route.totalDistance)}m</span>
              <span>{route.waypoints.length}개 지점</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  waypoints,
  onRouteSelect,
  onWaypointUpdate,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('waypoints');
  const [optimizationSettings, setOptimizationSettings] = useState({
    maxDuration: 180,
    preferredPace: 'moderate' as const,
    avoidCrowds: false,
    accessibilityNeeds: false,
    interests: ['culture', 'history']
  });

  const {
    optimizedRoute,
    alternatives,
    isOptimizing,
    error,
    progress,
    routeStats,
    optimizeRoute,
    adjustRouteForWaypoint,
    generateShareableRoute,
    hasOptimizedRoute,
    hasAlternatives,
    canOptimize
  } = useRouteOptimization(waypoints, optimizationSettings);

  const handleWaypointRemove = (waypointId: string) => {
    adjustRouteForWaypoint(waypointId, 'remove');
    const updatedWaypoints = waypoints.filter(w => w.id !== waypointId);
    onWaypointUpdate?.(updatedWaypoints);
  };

  const handleWaypointPrioritize = (waypointId: string) => {
    adjustRouteForWaypoint(waypointId, 'prioritize');
  };

  const handleRouteShare = () => {
    const shareableRoute = generateShareableRoute();
    if (shareableRoute) {
      if (navigator.share) {
        navigator.share({
          title: shareableRoute.title,
          text: shareableRoute.description,
          url: shareableRoute.shareUrl
        });
      } else {
        // 폴백: 클립보드 복사
        navigator.clipboard.writeText(shareableRoute.shareUrl);
        alert('경로 링크가 클립보드에 복사되었습니다!');
      }
    }
  };

  const handleAlternativeSelect = (route: any) => {
    onRouteSelect?.(route);
  };

  if (waypoints.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <Card className="p-8 text-center">
          <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">경로 최적화</h3>
          <p className="text-gray-500">
            방문하고 싶은 지점을 추가하면 최적의 경로를 자동으로 생성해드립니다.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            <span>AI 경로 최적화</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {waypoints.length}개 지점을 최적의 순서로 배치합니다
          </p>
        </div>
        
        <div className="flex space-x-2">
          {hasOptimizedRoute && (
            <Button onClick={handleRouteShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </Button>
          )}
          <Button 
            onClick={() => optimizeRoute(true)} 
            disabled={!canOptimize}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isOptimizing ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                최적화 중...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                경로 최적화
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 진행률 표시 */}
      {isOptimizing && (
        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-500 animate-spin" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>경로 최적화 진행 중...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 오류 표시 */}
      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <div className="text-red-700">{error}</div>
          <Button 
            onClick={() => optimizeRoute(true)} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            다시 시도
          </Button>
        </Card>
      )}

      {/* 탭 네비게이션 */}
      <div className="w-full">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'waypoints', label: '지점 목록' },
              { id: 'route', label: '최적 경로' },
              { id: 'alternatives', label: '대안 경로' },
              { id: 'settings', label: '설정' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'waypoints' && (
          <div className="space-y-4">
          <div className="space-y-3">
            {waypoints.map((waypoint, index) => (
              <WaypointCard
                key={waypoint.id}
                waypoint={waypoint}
                index={index}
                onRemove={() => handleWaypointRemove(waypoint.id)}
                onPrioritize={() => handleWaypointPrioritize(waypoint.id)}
              />
            ))}
          </div>
          </div>
        )}

        {activeTab === 'route' && (
          <div className="space-y-4">
          {hasOptimizedRoute ? (
            <>
              <RouteStatsCard stats={routeStats} />
              
              {optimizedRoute && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">최적화된 경로</h3>
                  <div className="space-y-3">
                    {optimizedRoute.waypoints.map((waypoint, index) => (
                      <div key={waypoint.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{waypoint.name}</div>
                          <div className="text-sm text-gray-500">
                            {waypoint.estimatedDuration}분 • {waypoint.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">경로 최적화를 실행하여 최적의 순서를 확인하세요.</p>
            </Card>
          )}
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-4">
          <AlternativeRoutesCard 
            alternatives={alternatives}
            onSelect={handleAlternativeSelect}
          />
          
          {!hasAlternatives && hasOptimizedRoute && (
            <Card className="p-8 text-center">
              <Shuffle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">현재 경로가 이미 최적입니다.</p>
            </Card>
          )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>최적화 설정</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 소요 시간 (분)
                </label>
                <input
                  type="range"
                  min="60"
                  max="480"
                  step="30"
                  value={optimizationSettings.maxDuration}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    maxDuration: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {optimizationSettings.maxDuration}분 ({Math.round(optimizationSettings.maxDuration / 60 * 10) / 10}시간)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선호 페이스
                </label>
                <select
                  value={optimizationSettings.preferredPace}
                  onChange={(e) => setOptimizationSettings(prev => ({
                    ...prev,
                    preferredPace: e.target.value as any
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="slow">느긋하게</option>
                  <option value="moderate">보통</option>
                  <option value="fast">빠르게</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={optimizationSettings.avoidCrowds}
                    onChange={(e) => setOptimizationSettings(prev => ({
                      ...prev,
                      avoidCrowds: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">혼잡한 장소 피하기</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={optimizationSettings.accessibilityNeeds}
                    onChange={(e) => setOptimizationSettings(prev => ({
                      ...prev,
                      accessibilityNeeds: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">접근성 고려</span>
                </label>
              </div>
            </div>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteOptimizer;