'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Users, Calendar, Clock, Star, ArrowRight, RefreshCw, Info, Compass } from 'lucide-react';
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
  content?: any; // content 데이터 추가
}

const RegionExploreHub = ({ locationName, routingResult, language, content }: RegionExploreHubProps) => {
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

  const loadRegionData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // content가 있는 경우 DB 데이터 직접 사용 (서울+ko 정확한 내용)
      if (content) {
        // 🎯 DB content에서 정확한 지역 정보 추출
        const regionInfo = content.regionInfo || {};
        const realTimeGuide = content.realTimeGuide || {};
        
        // 지역 데이터 설정 (DB의 실제 내용 사용)
        const actualRegionData = {
          name: locationName,
          country: regionInfo.location || '대한민국',
          description: regionInfo.introduction || '서울에 대한 정보를 준비 중입니다. 잠시 후 다시 시도해주세요.',
          highlights: regionInfo.highlights?.map((h: any) => h.title || h.description || h) || [
            '역사와 현대의 조화',
            '풍부한 문화유산',
            '다양한 미식 체험',
            '편리한 대중교통',
            '활기찬 도시 분위기'
          ],
          quickFacts: {
            area: regionInfo.visitInfo?.area || '605.21 km²',
            population: regionInfo.visitInfo?.population || '약 950만명',
            bestTime: regionInfo.visitInfo?.season || '사계절',
            timeZone: regionInfo.visitInfo?.timeZone || 'KST (UTC+9)'
          },
          coordinates: regionInfo.coordinates || { lat: 37.5665, lng: 126.9780 }
        };
        
        setRegionData(actualRegionData);
        
        // 🎯 content.route.steps[].location에서 정확한 추천 장소 추출
        let spotsToAdd: RecommendedSpot[] = [];
        
        if (content?.route?.steps && Array.isArray(content.route.steps)) {
          const stepSpots = content.route.steps.slice(0, 8).map((step: any, index: number) => {
            const stepLocation = step?.location;
            
            if (!stepLocation) return null;
            
            // 🎯 좌표는 content.chapters에서 id로 매칭해서 가져오기
            // step의 index와 chapter의 id가 매칭됨 (step 0 → chapter id: 0)
            let coordinates = null;
            if (content.chapters && Array.isArray(content.chapters)) {
              const matchingChapter = content.chapters.find((chapter: any) => chapter.id === index);
              if (matchingChapter?.coordinates?.lat && matchingChapter?.coordinates?.lng) {
                coordinates = {
                  lat: parseFloat(matchingChapter.coordinates.lat),
                  lng: parseFloat(matchingChapter.coordinates.lng)
                };
              }
            }
            
            // 장소명 추출
            const placeName = stepLocation?.name || stepLocation?.title || `${locationName} 명소 ${index + 1}`;
            
            // 카테고리 추론 (장소명 기반)
            const nameText = placeName.toLowerCase();
            let category = 'city';
            if (nameText.includes('궁') || nameText.includes('문') || nameText.includes('탑') || nameText.includes('박물관')) category = 'culture';
            else if (nameText.includes('공원') || nameText.includes('산') || nameText.includes('강') || nameText.includes('호수')) category = 'nature';
            else if (nameText.includes('시장') || nameText.includes('거리') || nameText.includes('타운')) category = 'shopping';
            else if (nameText.includes('맛') || nameText.includes('음식')) category = 'food';
            
            // 설명 추출
            const description = stepLocation?.description || stepLocation?.summary || `${placeName}에서 특별한 경험을 만나보세요.`;
            
            return {
              id: `route-step-${index}`,
              name: placeName,
              location: locationName,
              category,
              description,
              highlights: [], // 하이라이트는 비워둠
              estimatedDays: Math.min(Math.ceil((index + 1) / 3), 2),
              difficulty: 'easy' as const,
              seasonality: '연중',
              popularity: Math.max(95 - (index * 3), 70),
              coordinates
            };
          }).filter(Boolean); // null 값 제거
          
          spotsToAdd = stepSpots;
        }
        
        setRecommendedSpots(spotsToAdd);
        
      } else {
        // content가 없는 경우에만 API 호출
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
      }

    } catch (err) {
      console.error('지역 정보 로드 오류:', err);
      setError('지역 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [locationName, language, routingResult, content]);

  // 지역 정보 및 추천 장소 로드
  useEffect(() => {
    loadRegionData();
  }, [loadRegionData]);

  const handleSpotClick = (spot: RecommendedSpot) => {
    router.push('/guide/' + encodeURIComponent(spot.name) + '?lang=ko');
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
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="지역 정보 다시 불러오기"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
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
            <div className="text-center">
              <h1 className="text-3xl font-bold text-black tracking-tight">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-black">지역 소개</h2>
              </div>
              <p className="text-black/70 leading-relaxed text-lg">{regionData.description}</p>
            </div>
          </div>
        )}

        {/* 🎨 하이라이트 카드 */}
        {regionData?.highlights && regionData.highlights.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-black">주요 특징</h2>
              </div>
              <div className="space-y-3">
                {regionData.highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-black/80 font-medium leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* 🎨 카테고리 필터 카드 */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-black">
                추천 여행지 ({filteredSpots.length})
              </h2>
            </div>
            
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 active:scale-95 focus:ring-2 focus:ring-black/30 focus:ring-offset-2 ${
                    selectedCategory === category.id
                      ? 'bg-black text-white border-2 border-black'
                      : 'bg-white border-2 border-black/10 text-black hover:border-black/30 hover:bg-black/5'
                  }`}
                  aria-pressed={selectedCategory === category.id}
                  aria-label={`${category.name} 카테고리 필터`}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            
            {/* 🎨 추천 장소 리스트 */}
            {filteredSpots.length > 0 ? (
              <div className="space-y-4">
                {filteredSpots.map((spot, index) => (
                  <div 
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className="group flex items-center justify-between p-4 bg-black/2 border border-black/5 rounded-2xl cursor-pointer transition-all duration-300 hover:border-black/20 hover:bg-black/5 active:scale-[0.99] focus:ring-2 focus:ring-black/30 focus:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSpotClick(spot);
                      }
                    }}
                    aria-label={`${spot.name} 여행지 정보 보기`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-black text-white text-sm font-semibold rounded-xl flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black group-hover:text-black/80">
                          {spot.description}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-black/60 text-sm">
                        <Star className="w-4 h-4 fill-black/60 text-black/60" />
                        <span className="font-medium">{Math.floor(spot.popularity/10)}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black/60 transition-colors" />
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

        {/* 🎨 추천시작지점 지도 카드 */}
        {(regionData?.coordinates || (content?.chapters && content.chapters.length > 0)) && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-black">추천시작지점</h2>
              </div>
              <div className="h-80 bg-black/2 border border-black/5 rounded-2xl overflow-hidden">
                <StartLocationMap
                  locationName={regionData?.name || locationName}
                  startPoint={
                    regionData?.coordinates
                      ? {
                          lat: regionData.coordinates.lat,
                          lng: regionData.coordinates.lng,
                          name: regionData.name || locationName
                        }
                      : content?.chapters?.[0]?.lat && content?.chapters?.[0]?.lng
                        ? {
                            lat: parseFloat(content.chapters[0].lat),
                            lng: parseFloat(content.chapters[0].lng),
                            name: content.chapters[0].title || locationName
                          }
                        : {
                            lat: 37.5665,
                            lng: 126.9780,
                            name: locationName
                          }
                  }
                  pois={recommendedSpots
                    .filter(spot => spot.coordinates)
                    .map(spot => ({
                      id: spot.id,
                      name: spot.name,
                      lat: spot.coordinates!.lat,
                      lng: spot.coordinates!.lng,
                      description: spot.description
                    }))
                  }
                  showIntroOnly={true}
                />
              </div>
            </div>
          </div>
        )}

          
      </div>
    </div>
  );
};

export default RegionExploreHub;