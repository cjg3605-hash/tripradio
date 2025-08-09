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
    router.push('/guide/' + encodeURIComponent(spot.name) + '?from=' + encodeURIComponent(locationName));
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
    <div className="min-h-screen bg-white">
      {/* 🎨 모노크롬 모던 헤더 */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="뒤로 가기"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-light text-gray-900">
                {regionData?.name || locationName}
              </h1>
              {regionData?.country && (
                <p className="text-gray-500 mt-1">{regionData.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 🎨 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
          
        {/* 🎨 개요 (실시간 가이드 스타일) */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">개요</h2>
          <p className="text-gray-600 leading-relaxed">
            {regionData?.description}
          </p>
        </div>

        {/* 🎨 기본 정보 */}
        {regionData?.quickFacts && Object.keys(regionData.quickFacts).length > 0 && (
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {regionData.quickFacts.area && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-gray-700"><strong>면적:</strong> {regionData.quickFacts.area}</p>
                  </div>
                )}
                {regionData.quickFacts.population && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-gray-700"><strong>인구:</strong> {regionData.quickFacts.population}</p>
                  </div>
                )}
                {regionData.quickFacts.bestTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-gray-700"><strong>최적 시기:</strong> {regionData.quickFacts.bestTime}</p>
                  </div>
                )}
                {regionData.quickFacts.timeZone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-gray-700"><strong>시간대:</strong> {regionData.quickFacts.timeZone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🎨 주요 특징 (실시간 가이드 스타일) */}
        {regionData?.highlights && regionData.highlights.length > 0 && (
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">주요 특징</h2>
            <div className="space-y-2 text-gray-600">
              {regionData.highlights.map((highlight, index) => (
                <p key={index}>• {highlight}</p>
              ))}
            </div>
          </div>
        )}

        {/* 🎨 탐색 지도 (실시간 가이드 스타일) */}
        {regionData?.coordinates && (
          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-medium">탐색 지도</h2>
                <p className="text-sm text-gray-600">지역 전체 위치 정보</p>
              </div>
            </div>
            <div className="h-64 bg-white border border-gray-100 rounded-lg overflow-hidden">
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

        {/* 🎨 추천 여행지 (실시간 가이드 스타일) */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            추천 여행지 ({filteredSpots.length})
          </h2>
          
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1.5">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* 추천 장소 목록 */}
          {filteredSpots.length > 0 ? (
            <div className="space-y-6">
              {filteredSpots.map((spot, index) => (
                <div key={spot.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      index === 0 ? 'bg-blue-600' : 'bg-black'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="font-medium text-gray-900 cursor-pointer hover:text-gray-700"
                          onClick={() => handleSpotClick(spot)}
                        >
                          {spot.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(spot.difficulty)}`}>
                            {getDifficultyText(spot.difficulty)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {spot.estimatedDays}일
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{spot.popularity}/10</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{spot.description}</p>
                    </div>
                    <button
                      onClick={() => handleSpotClick(spot)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">🗺️</div>
              <div>이 카테고리에 추천 장소가 없습니다</div>
            </div>
          )}
        </div>

        {/* 🎨 가이드 시작 버튼 */}
        <div className="text-center pt-4">
          <button
            onClick={() => router.push('/guide/' + encodeURIComponent(locationName))}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            가이드 시작하기
          </button>
        </div>
          
      </div>
    </div>
  );
};

export default RegionExploreHub;