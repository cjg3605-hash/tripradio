'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Users, Calendar, Clock, Star, ArrowRight, RefreshCw, Compass } from 'lucide-react';
import GuideLoading from '@/components/ui/GuideLoading';
import dynamic from 'next/dynamic';
import { GuideHeader } from '@/components/guide/GuideHeader';
import { GuideTitle } from '@/components/guide/GuideTitle';
import { supabase } from '@/lib/supabaseClient';

// 지도 컴포넌트 동적 로드
// GuideLoading을 위한 컴포넌트
const LoadingComponent = () => {
  return <GuideLoading message="지도 로딩 중..." />;
};

const RegionTouristMap = dynamic(() => import('@/components/guide/RegionTouristMap'), {
  loading: () => <LoadingComponent />,
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
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
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
  const [coordinatesData, setCoordinatesData] = useState<any>(null); // coordinates 칼럼 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  // 호버 기능 제거로 불필요한 상태 삭제
  // const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>(null);


  // 🔍 별도 coordinates 칼럼에서 좌표 데이터 가져오기
  const fetchCoordinatesData = useCallback(async () => {
    try {
      const normLocation = locationName.trim();
      
      const { data: coordinatesData, error: coordError } = await supabase
        .from('guides')
        .select('coordinates')
        .eq('locationname', normLocation)
        .eq('language', language.toLowerCase())
        .maybeSingle();

      if (coordError) {
        console.log('🗺️ coordinates 조회 실패:', coordError);
        return null;
      }

      if (coordinatesData?.coordinates && Array.isArray(coordinatesData.coordinates)) {
        console.log(`✅ coordinates 칼럼에서 ${coordinatesData.coordinates.length}개 좌표 조회 성공`);
        setCoordinatesData(coordinatesData.coordinates);
        return coordinatesData.coordinates;
      }

      console.log('🔍 coordinates 칼럼에 데이터 없음');
      return null;
    } catch (error) {
      console.error('❌ coordinates 조회 예외:', error);
      return null;
    }
  }, [locationName, language]);

  const loadRegionData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // 🗺️ 별도 coordinates 칼럼에서 좌표 데이터 가져오기
      const coordinatesFromDb = await fetchCoordinatesData();
      
      // 🔍 DEBUG: content 데이터 구조 확인
      console.log('🎯 RegionExploreHub content 확인:', {
        hasContent: !!content,
        contentKeys: content ? Object.keys(content) : 'undefined',
        content: content,
        contentType: typeof content
      });
      
      // 🔍 DEBUG: highlights 관련 구조 상세 확인
      console.log('🔍 Highlights 구조 상세 확인:', {
        exploreHubHighlights: content?.exploreHub?.highlights,
        overviewHighlights: content?.overview?.highlights,
        realTimeGuideMustVisitSpots: content?.realTimeGuide?.mustVisitSpots,
        hasExploreHub: !!content?.exploreHub,
        hasOverview: !!content?.overview,
        hasRealTimeGuide: !!content?.realTimeGuide
      });
      
      // 🔍 DEBUG: overview.keyFacts 구조 상세 확인
      if (content && content.overview && content.overview.keyFacts) {
        console.log('🔑 keyFacts 상세 구조:', {
          keyFacts: content.overview.keyFacts,
          isArray: Array.isArray(content.overview.keyFacts),
          length: content.overview.keyFacts.length,
          firstItem: content.overview.keyFacts[0],
          mappedTitles: content.overview.keyFacts.map((kf: any) => kf.title),
          mappedDescriptions: content.overview.keyFacts.map((kf: any) => kf.description)
        });
      }

      // content가 있으면 DB content에서 정보 추출 (DB 데이터 우선 사용)
      if (content) {
        // 🎯 DB content에서 정확한 지역 정보 추출 (올바른 필드명 사용)
        const overview = content.overview || {};
        
        // 🔍 DEBUG: overview 구조 상세 확인
        console.log('🎯 DB overview 구조 확인:', {
          hasOverview: !!overview,
          overviewKeys: Object.keys(overview),
          highlights: overview.highlights,
          highlightsType: typeof overview.highlights,
          highlightsLength: Array.isArray(overview.highlights) ? overview.highlights.length : 'not array',
          regionOverview: overview.regionOverview,
          keyFacts: overview.keyFacts,
          description: overview.description
        });
        
        // 🔍 DEBUG: content 전체 구조도 확인
        console.log('🎯 전체 content 구조:', {
          contentKeys: Object.keys(content),
          content: content
        });
        const realTimeGuide = content.realTimeGuide || {};
        
        // 🎯 DB에서 highlights 추출 (기존 구조 호환)
        const highlights = content?.highlights || content?.mustVisitSpots || [];
        console.log('🔍 highlights:', Array.isArray(highlights) ? highlights.length + '개' : 'not array');

        // 지역 데이터 설정 (DB의 실제 내용 사용)
        const actualRegionData = {
          name: locationName,
          country: overview.location || '',
          description: overview.description || overview.background || overview.keyFeatures || '',
          highlights: highlights,
          quickFacts: {
            area: overview.visitInfo?.area || '',
            population: overview.visitInfo?.population || '',
            bestTime: overview.visitInfo?.season || overview.visitInfo?.duration || content?.bestTimeToVisit || '',
            timeZone: overview.visitInfo?.timeZone || ''
          },
          coordinates: coordinatesFromDb?.[0] ? {
            lat: parseFloat(coordinatesFromDb[0].lat),
            lng: parseFloat(coordinatesFromDb[0].lng)
          } : null
        };
        
        setRegionData(actualRegionData);
        
        // DB에서 추천 장소 추출 (content.route.steps 사용)
        let spotsToAdd: RecommendedSpot[] = [];
        
        if (content?.route?.steps && Array.isArray(content.route.steps)) {
          spotsToAdd = content.route.steps.slice(0, 8).map((step: any, index: number) => ({
            id: `db-spot-${index}`,
            name: step.location || `장소 ${index + 1}`,
            location: locationName,
            category: step.category || 'attraction',
            description: step.title?.split(':')[1]?.trim() || '',
            highlights: step.highlights || [],
            estimatedDays: 1,
            difficulty: 'easy' as const,
            seasonality: t('common.yearRound'),
            popularity: Math.max(95 - (index * 3), 70),
            coordinates: coordinatesFromDb?.[index] ? {
              lat: parseFloat(coordinatesFromDb[index].lat),
              lng: parseFloat(coordinatesFromDb[index].lng)
            } : null
          }));
        }
        
        setRecommendedSpots(spotsToAdd);
        
      } else {
        // content가 완전히 없는 경우에만 API 호출 - DB 우선 정책
        console.log('📭 DB에 content 없음, 새로운 가이드 생성 필요');
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

        if (result.success && result.content) {
          // API 응답에서 새로운 개요 정보가 있으면 사용
          const newRegionData = {
            name: locationName,
            country: result.content.overview?.keyFacts?.find((kf: any) => kf.title === "국가")?.description || locationName,
            description: result.content.overview?.description || '',
            highlights: result.content.overview?.highlights || [],
            quickFacts: {
              bestTime: result.content.overview?.keyFacts?.find((kf: any) => kf.title === "최적 방문 시기")?.description || '',
              timeZone: '현지 시간대'
            },
            coordinates: coordinatesFromDb?.[0] ? {
              lat: parseFloat(coordinatesFromDb[0].lat),
              lng: parseFloat(coordinatesFromDb[0].lng)
            } : null
          };
          
          setRegionData(newRegionData);
          
          // 추천 장소도 API 응답에서 생성
          const newRecommendedSpots = result.content.route?.steps?.slice(0, 8).map((step: any, index: number) => ({
            id: `api-spot-${index}`,
            name: step.location || `추천지 ${index + 1}`,
            location: locationName,
            category: 'attraction',
            description: step.description || '',
            highlights: step.highlights || [],
            estimatedDays: 1,
            difficulty: 'easy' as const,
            seasonality: '연중',
            popularity: 90 - (index * 2),
            coordinates: coordinatesFromDb?.[index] ? {
              lat: parseFloat(coordinatesFromDb[index].lat),
              lng: parseFloat(coordinatesFromDb[index].lng)
            } : null
          })) || [];
          
          setRecommendedSpots(newRecommendedSpots);
        } else {
          setError(result.error || t('guide.cannotLoadInfo'));
        }
      }

    } catch (err) {
      console.error('지역 정보 로드 오류:', err);
      setError(t('guide.loadRegionError') as string);
    } finally {
      setIsLoading(false);
    }
  }, [locationName, language, routingResult, content, t, fetchCoordinatesData]);

  // 지역 정보 및 추천 장소 로드
  useEffect(() => {
    loadRegionData();
  }, [loadRegionData]);

  const handleSpotClick = (spot: RecommendedSpot) => {
    // 🎯 새로운 URL 구조: /guide/[language]/[location]
    const spotName = encodeURIComponent(spot.name);
    const targetUrl = `/guide/${language}/${spotName}`;
    
    // 🔄 세션 스토리지에 지역 컨텍스트 저장 (추가 보안)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('guideRegionalContext', JSON.stringify({
        parentRegion: locationName,
        spotName: spot.name,
        timestamp: Date.now()
      }));
    }
    
    console.log('🎯 지역 컨텍스트 포함 네비게이션:', {
      spot: spot.name,
      parent: locationName,
      url: targetUrl,
      location: spot.location
    });
    
    router.push(targetUrl);
  };

  // 🗺️ 마커 클릭 핸들러
  // 마커 클릭 기능 제거
  // const handleMarkerClick = (spotId: string, spotName: string) => {
  //   console.log('🗺️ 마커 클릭됨:', spotId, spotName);
  //   const spot = recommendedSpots.find(s => s.id === spotId || s.name === spotName);
  //   if (spot) {
  //     handleSpotClick(spot);
  //   }
  // };

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
      case 'easy': return t('common.easy');
      case 'moderate': return t('common.moderate');
      case 'challenging': return t('common.challenging');
      default: return t('common.moderate');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GuideLoading message={t('guide.loadingRegionInfo') as string} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-bold text-black mb-2">{t('guide.cannotLoadInfo')}</h2>
          <p className="text-sm font-medium text-black leading-relaxed mb-4">{error}</p>
          <button
            onClick={loadRegionData}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={t('guide.loadMapAriaLabel') as string}
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 고정된 상단 영역 - 헤더, 제목 (가이드 페이지와 동일한 구조) */}
      <div className="sticky top-0 z-50 bg-white">
        {/* 헤더 */}
        <GuideHeader 
          locationName={regionData?.name || locationName}
          variant="main"
        />
        
        {/* 타이틀 */}
        <GuideTitle 
          locationName={regionData?.name || locationName}
          variant="main"
        />
      </div>
      
      {/* 🎨 메인 콘텐츠 - 실시간 가이드 스타일 */}
      <div className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          

        {/* 🎨 하이라이트 카드 */}
        {regionData?.highlights && regionData.highlights.length > 0 && (
          <div className="card-base bg-white border border-gray-200 transition-all duration-300 overflow-hidden hover:shadow-card-hover">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-black flex items-center justify-center" style={{ borderRadius: '6px' }}>
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-black">{t('guide.keyFeatures')}</h2>
              </div>
              <div className="space-y-3">
                {regionData.highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-sm font-medium text-black leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {/* 🎨 추천 여행지 카드 */}
        <div className="card-base bg-white border border-gray-200 transition-all duration-300 overflow-hidden hover:shadow-card-hover">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-black flex items-center justify-center" style={{ borderRadius: '6px' }}>
                <Compass className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-black">
                {t('guide.recommendedSpots')} ({recommendedSpots.length})
              </h2>
            </div>
            
            {/* 🎨 추천 장소 리스트 */}
            {recommendedSpots.length > 0 ? (
              <div className="space-y-4">
                {recommendedSpots.map((spot, index) => (
                  <div 
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className="group flex items-center justify-between p-4 bg-black/2 border border-black/5 rounded-lg cursor-pointer transition-all duration-300 hover:border-black/20 hover:bg-black/5 active:scale-[0.99] focus:ring-2 focus:ring-black/30 focus:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSpotClick(spot);
                      }
                    }}
                    aria-label={`${spot.name}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-black text-white text-sm font-semibold flex items-center justify-center flex-shrink-0" style={{ borderRadius: '6px' }}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-black group-hover:text-black/80">
                          {spot.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Star className="w-4 h-4 fill-gray-600 text-gray-600" />
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
                <p className="text-sm font-medium text-black leading-relaxed">{t('guide.noRecommendedSpots')}</p>
              </div>
            )}
          </div>
        </div>

        {/* 🎨 지역 관광지 지도 카드 */}
        {recommendedSpots.length > 0 && (
          <div className="card-base bg-white border border-gray-200 transition-all duration-300 overflow-hidden hover:shadow-card-hover">
            <div className="p-0">
              <RegionTouristMap
                locationName={locationName}
                recommendedSpots={recommendedSpots
                  .filter(spot => spot.coordinates)
                  .map((spot) => ({
                    id: spot.id,
                    name: spot.name,
                    lat: spot.coordinates!.lat,
                    lng: spot.coordinates!.lng,
                    description: spot.description
                  }))}
                guideCoordinates={coordinatesData} // 별도 coordinates 칼럼 데이터 전달
                className="w-full rounded-md"
              />
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default RegionExploreHub;