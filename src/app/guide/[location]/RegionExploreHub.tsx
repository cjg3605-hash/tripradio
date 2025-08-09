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
      case 'easy': return 'bg-black/5 text-black/80 border border-black/10';
      case 'moderate': return 'bg-black/10 text-black/90 border border-black/20';
      case 'challenging': return 'bg-black text-white border border-black';
      default: return 'bg-black/5 text-black/70 border border-black/10';
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
      {/* 🎨 모던 미니멀 헤더 */}
      <div className="border-b border-black/8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 hover:bg-black/5 rounded-2xl transition-colors"
              aria-label="뒤로 가기"
            >
              <svg className="w-5 h-5 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-light text-black tracking-tight">
                {regionData?.name || locationName}
              </h1>
              {regionData?.country && (
                <p className="text-black/60 mt-1 font-medium">{regionData.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 🎨 메인 콘텐츠 - 실시간 가이드 스타일 */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
          
        {/* 🎨 지역 소개 카드 */}
        {regionData?.description && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-black mb-4">지역 소개</h2>
              <p className="text-black/70 leading-relaxed text-lg">{regionData.description}</p>
            </div>
          </div>
        )}

        {/* 🎨 하이라이트 카드 */}
        {regionData?.highlights && regionData.highlights.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-black mb-6">주요 특징</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regionData.highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 bg-black/2 rounded-2xl border border-black/5"
                  >
                    <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                    <span className="text-black/80 font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 🎨 탐색 지도 카드 */}
        {regionData?.coordinates && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black">탐색 지도</h2>
                  <p className="text-black/60">지역 전체 위치 정보</p>
                </div>
              </div>
              <div className="h-80 bg-black/2 border border-black/5 rounded-2xl overflow-hidden">
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
          </div>
        )}

        {/* 🎨 카테고리 필터 카드 */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-black mb-6">
              추천 여행지 ({filteredSpots.length})
            </h2>
            
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 active:scale-95 ${
                    selectedCategory === category.id
                      ? 'bg-black text-white border-2 border-black'
                      : 'bg-white border-2 border-black/10 text-black hover:border-black/30 hover:bg-black/5'
                  }`}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            
            {/* 🎨 추천 장소 리스트 */}
            {filteredSpots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSpots.map((spot, index) => (
                  <div 
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className="group relative overflow-hidden rounded-2xl bg-black/2 border border-black/5 p-6 cursor-pointer transition-all duration-300 hover:border-black/20 hover:bg-black/5 active:scale-95"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black text-white text-sm font-semibold rounded-xl flex items-center justify-center">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-black group-hover:text-black/80">
                          {spot.name}
                        </h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black/60 transition-colors" />
                    </div>
                    
                    <p className="text-black/70 leading-relaxed mb-4">
                      {spot.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${getDifficultyColor(spot.difficulty)}`}>
                          {getDifficultyText(spot.difficulty)}
                        </span>
                        <div className="flex items-center gap-1 text-black/60 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{spot.estimatedDays}일</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-black text-black" />
                        <span className="text-sm font-medium text-black">{spot.popularity}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-black/60 text-lg">이 카테고리에 추천 장소가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 🎨 가이드 시작 버튼 카드 */}
        <div className="relative overflow-hidden rounded-3xl bg-black border border-black shadow-lg shadow-black/20 transition-all duration-500 hover:shadow-xl hover:shadow-black/30">
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-3">
              {regionData?.name || locationName} 상세 가이드
            </h2>
            <p className="text-white/80 mb-6">
              AI 도슨트와 함께 더 깊이 있는 여행을 시작해보세요
            </p>
            <button
              onClick={() => router.push('/guide/' + encodeURIComponent(locationName))}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-2xl transition-all duration-300 hover:bg-white/90 active:scale-95 mx-auto"
            >
              <span>가이드 시작하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
          
      </div>
    </div>
  );
};

export default RegionExploreHub;