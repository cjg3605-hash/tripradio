'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Users, Calendar, Clock, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, PageHeader, Stack, Flex } from '@/components/layout/ResponsiveContainer';
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
  routingResult: any; // 라우팅 결과
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

      if (!response.ok) {
        throw new Error('지역 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.success) {
        setRegionData(data.regionData);
        setRecommendedSpots(data.recommendedSpots || []);
      } else {
        throw new Error(data.error || '데이터 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('Region data loading error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      
      // 폴백 데이터
      setRegionData({
        name: locationName,
        country: '정보 없음',
        description: `${locationName}에 대한 정보를 준비중입니다.`,
        highlights: [],
        quickFacts: {},
        coordinates: { lat: 37.5665, lng: 126.9780 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotClick = (spot: RecommendedSpot) => {
    // 추천 장소 클릭 시 상세 가이드로 이동
    router.push(`/guide/${encodeURIComponent(spot.name)}`);
  };

  const handleRetryGeneration = () => {
    loadRegionData();
  };

  const filteredSpots = selectedCategory === 'all' 
    ? recommendedSpots
    : recommendedSpots.filter(spot => spot.category.toLowerCase() === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'challenging': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'moderate': return '보통'; 
      case 'challenging': return '어려움';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GuideLoading message={`${locationName} 탐색 정보를 준비중입니다...`} />
      </div>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="min-h-screen bg-white">
        
        {/* 헤더 섹션 */}
        <div className="max-w-4xl mx-auto p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{regionData?.country}</span>
          </div>
          
          <h1 className="text-2xl font-light text-gray-900 mb-4">
            {regionData?.name}
          </h1>
          
          <p className="text-gray-600 leading-relaxed max-w-3xl">
            {regionData?.description}
          </p>
          
          {/* 빠른 정보 */}
          {regionData?.quickFacts && Object.keys(regionData.quickFacts).length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6">
              {regionData.quickFacts.area && (
                <div className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full text-sm">
                  <span className="font-medium text-gray-600">면적:</span>
                  <span className="text-gray-500">{regionData.quickFacts.area}</span>
                </div>
              )}
              {regionData.quickFacts.population && (
                <div className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">{regionData.quickFacts.population}</span>
                </div>
              )}
              {regionData.quickFacts.bestTime && (
                <div className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">{regionData.quickFacts.bestTime}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 하이라이트 섹션 */}
          {regionData?.highlights && regionData.highlights.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                주요 특징
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regionData.highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full flex-shrink-0 mt-2" />
                    <span className="text-sm text-gray-600">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 인터랙티브 지도 */}
          {regionData?.coordinates && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                탐색 지도
              </h2>
              <div className="h-80 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
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

          {/* 추천 여행지 그리드 */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                추천 여행지 ({filteredSpots.length})
              </h2>
              
              {/* 카테고리 필터 */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 text-xs border border-gray-200 rounded-full transition-all ${
                      selectedCategory === category.id 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {category.emoji} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">{error}</p>
                  <button 
                    onClick={handleRetryGeneration}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    다시 시도
                  </button>
                </div>
              </div>
            )}

            {filteredSpots.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>해당 카테고리의 추천 장소가 없습니다.</p>
                <p className="text-sm mt-1">다른 카테고리를 선택해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpots.map((spot, index) => (
                  <div
                    key={spot.id}
                    className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all"
                    onClick={() => handleSpotClick(spot)}
                  >
                    {/* 이미지 영역 */}
                    <div className="h-48 bg-gray-50 relative overflow-hidden">
                      {spot.image ? (
                        <img 
                          src={spot.image} 
                          alt={spot.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* 인기도 배지 */}
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/90 border border-gray-200 rounded-full text-xs">
                          <Star className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-600">{spot.popularity}/10</span>
                        </div>
                      </div>
                    </div>

                    {/* 콘텐츠 영역 */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-black transition-colors">
                          {spot.name}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">{spot.location}</p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{spot.description}</p>
                      
                      {/* 메타 정보 */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs px-2 py-1 border border-gray-200 text-gray-600 rounded-full">
                          {getDifficultyLabel(spot.difficulty)}
                        </span>
                        <span className="text-xs px-2 py-1 border border-gray-200 text-gray-600 rounded-full">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {spot.estimatedDays}일
                        </span>
                        <span className="text-xs px-2 py-1 border border-gray-200 text-gray-600 rounded-full">
                          {spot.seasonality}
                        </span>
                      </div>
                      
                      {/* 하이라이트 */}
                      {spot.highlights && spot.highlights.length > 0 && (
                        <div className="space-y-1">
                          {spot.highlights.slice(0, 2).map((highlight, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                              <div className="w-1 h-1 bg-gray-900 rounded-full flex-shrink-0 mt-1.5" />
                              <span className="line-clamp-1">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default RegionExploreHub;