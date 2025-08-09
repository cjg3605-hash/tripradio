'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Users, Calendar, Clock, Star, ArrowRight, RefreshCw } from 'lucide-react';
import GuideLoading from '@/components/ui/GuideLoading';
import dynamic from 'next/dynamic';

// 지도 컴포넌트 동적 로드
const StartLocationMap = dynamic(() => import('@/components/guide/StartLocationMap'), {
  loading: () => <GuideLoading message="지도 로딩 중..." />,
  ssr: false
});

interface RegionData {
  name: string;
  country: string;
  description: string;
  highlights: string[];
  quickFacts: {
    area?: string;
    population?: string;
    bestTime?: string;
    timeZone?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  heroImage?: string;
}

interface RecommendedSpot {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  highlights: string[];
  estimatedDays: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  seasonality: string;
  popularity: number;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface RegionExploreHubProps {
  locationName: string;
  routingResult: any;
  language: string;
}

const RegionExploreHub = ({ locationName, routingResult, language }: RegionExploreHubProps) => {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [regionData, setRegionData] = useState<RegionData | null>(null);
  const [recommendedSpots, setRecommendedSpots] = useState<RecommendedSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string>('');

  const categories = [
    { id: 'all', name: '전체', emoji: '🌟' },
    { id: 'city', name: '도시', emoji: '🏙️' },
    { id: 'nature', name: '자연', emoji: '🌿' },
    { id: 'culture', name: '문화', emoji: '🏛️' },
    { id: 'food', name: '음식', emoji: '🍜' },
    { id: 'shopping', name: '쇼핑', emoji: '🛍️' }
  ];

  // 필터링된 추천 장소
  const filteredSpots = recommendedSpots.filter(spot => 
    selectedCategory === 'all' || spot.category === selectedCategory
  );

  // 지역 정보 및 추천 장소 로드
  useEffect(() => {
    loadRegionData();
  }, [locationName]);

  const loadRegionData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 지역 정보 생성 API 호출
      const response = await fetch(`/api/ai/generate-region-overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          language,
          routingResult
        })
      });

      const result = await response.json();

      if (result.success) {
        setRegionData(result.regionData);
        setRecommendedSpots(result.recommendedSpots || []);
      } else {
        setError(result.error || '지역 정보를 불러올 수 없습니다.');
      }

    } catch (err) {
      console.error('지역 정보 로드 오류:', err);
      setError('지역 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotClick = (spot: RecommendedSpot) => {
    router.push(`/guide/${encodeURIComponent(spot.name)}?from=${encodeURIComponent(locationName)}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'challenging': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'moderate': return '보통';
      case 'challenging': return '도전적';
      default: return '보통';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GuideLoading message="지역 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">정보를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRegionData}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎨 미니멀 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 group"
                aria-label="뒤로 가기"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-light text-gray-900 tracking-tight">
                  {regionData?.name || locationName}
                </h1>
                {regionData?.country && (
                  <p className="text-sm text-gray-500 mt-0.5">{regionData.country}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          
          {/* 🎨 지역 소개 섹션 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="max-w-4xl">
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                {regionData?.description}
              </p>
              
              {/* 빠른 정보 태그 */}
              {regionData?.quickFacts && Object.keys(regionData.quickFacts).length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {regionData.quickFacts.area && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm bg-gray-50">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{regionData.quickFacts.area}</span>
                    </div>
                  )}
                  {regionData.quickFacts.population && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm bg-gray-50">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{regionData.quickFacts.population}</span>
                    </div>
                  )}
                  {regionData.quickFacts.bestTime && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm bg-gray-50">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{regionData.quickFacts.bestTime}</span>
                    </div>
                  )}
                  {regionData.quickFacts.timeZone && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm bg-gray-50">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{regionData.quickFacts.timeZone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 🎨 주요 특징 그리드 */}
          {regionData?.highlights && regionData.highlights.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-light text-gray-900 mb-4 pb-3 border-b border-gray-100">
                주요 특징
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regionData.highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-2.5" />
                    <span className="text-sm text-gray-700 leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🎨 인터랙티브 지도 */}
          {regionData?.coordinates && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-light text-gray-900 mb-4 pb-3 border-b border-gray-100">
                탐색 지도
              </h2>
              <div className="h-80 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <StartLocationMap
                  locationName={regionData.name}
                  startPoint={{
                    lat: regionData.coordinates.lat,
                    lng: regionData.coordinates.lng,
                    name: regionData.name
                  }}
                  pois={recommendedSpots.filter(spot => spot.coordinates).map(spot => ({
                    id: spot.id,
                    name: spot.name,
                    lat: spot.coordinates!.lat,
                    lng: spot.coordinates!.lng,
                    description: spot.description
                  }))}
                  showIntroOnly={true}
                />
              </div>
            </div>
          )}

          {/* 🎨 추천 여행지 섹션 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-light text-gray-900">
                추천 여행지 ({filteredSpots.length})
              </h2>
              
              {/* 카테고리 필터 */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 text-xs border rounded-full transition-all ${
                      selectedCategory === category.id 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-white text-gray-600 hover:border-gray-300 border-gray-200'
                    }`}
                  >
                    <span className="mr-1.5">{category.emoji}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 추천 장소 그리드 */}
            {filteredSpots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className="group border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                        {spot.name}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {spot.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs border rounded-full ${getDifficultyColor(spot.difficulty)}`}>
                          {getDifficultyText(spot.difficulty)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {spot.estimatedDays}일
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{spot.popularity}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🗺️</div>
                <p className="text-gray-600">이 카테고리에 추천 장소가 없습니다.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default RegionExploreHub;