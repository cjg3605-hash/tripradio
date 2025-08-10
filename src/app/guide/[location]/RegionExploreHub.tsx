'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Users, Calendar, Clock, Star, ArrowRight, RefreshCw, Info, Compass } from 'lucide-react';
import GuideLoading from '@/components/ui/GuideLoading';
import dynamic from 'next/dynamic';

// 지도 컴포넌트 동적 로드
const StartLocationMap = dynamic(() => import('@/components/guide/StartLocationMap'), {
  loading: () => <GuideLoading message="Loading map..." />,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');


  const loadRegionData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // 🔍 DEBUG: content 데이터 구조 확인
      console.log('🎯 RegionExploreHub content 확인:', {
        hasContent: !!content,
        contentKeys: content ? Object.keys(content) : 'undefined',
        content: content,
        contentType: typeof content
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

      // content가 있는 경우 DB 데이터 직접 사용 (서울+ko 정확한 내용)
      if (content) {
        // 🎯 DB content에서 정확한 지역 정보 추출 (올바른 필드명 사용)
        const overview = content.overview || {};
        const realTimeGuide = content.realTimeGuide || {};
        
        // 지역 데이터 설정 (DB의 실제 내용만 사용, 하드코딩 제거)
        const actualRegionData = {
          name: locationName,
          country: overview.location || '',
          description: overview.background || overview.keyFeatures || '',
          highlights: overview.keyFacts && Array.isArray(overview.keyFacts) 
            ? overview.keyFacts.map((kf: any) => kf.description || kf.title || kf.toString()) 
            : [],
          quickFacts: {
            area: overview.visitInfo?.area || '',
            population: overview.visitInfo?.population || '',
            bestTime: overview.visitInfo?.season || overview.visitInfo?.duration || '',
            timeZone: overview.visitInfo?.timeZone || ''
          },
          coordinates: realTimeGuide.chapters?.[0]?.coordinates || null
        };
        
        setRegionData(actualRegionData);
        
        // 🎯 실제 DB 구조에 맞게 추천 장소 추출 
        let spotsToAdd: RecommendedSpot[] = [];
        
        // ✅ 실제 DB 구조: content.route.steps에서 추천 장소 추출
        if (content?.route?.steps && Array.isArray(content.route.steps)) {
          const stepSpots = content.route.steps.slice(0, 8).map((step: any, index: number) => {
            // ✅ DB에서 location 필드가 정확히 존재함: "시테 섬", "루브르 박물관" 등
            const placeName = step?.location;
            
            if (!placeName) return null;
            
            // ✅ 좌표는 realTimeGuide.chapters에서 매칭해서 가져오기
            let coordinates: { lat: number; lng: number; } | null = null;
            if (realTimeGuide.chapters && Array.isArray(realTimeGuide.chapters)) {
              const matchingChapter = realTimeGuide.chapters.find((chapter: any) => chapter.id === index);
              if (matchingChapter?.coordinates?.lat && matchingChapter?.coordinates?.lng) {
                coordinates = {
                  lat: parseFloat(matchingChapter.coordinates.lat),
                  lng: parseFloat(matchingChapter.coordinates.lng)
                };
              }
            }
            
            // ✅ 설명은 step.title에서 콜론 뒤 부분만 사용 (하드코딩 메시지 제거)
            let description = '';
            
            // step.title에서 콜론 뒤 설명 부분 추출: "루브르 박물관: 세계적인 예술 작품의 향연" → "세계적인 예술 작품의 향연"
            if (step.title && step.title.includes(':')) {
              const titleDescription = step.title.split(':')[1]?.trim();
              if (titleDescription && titleDescription.length > 5) {
                description = titleDescription;
              }
            }
            
            return {
              id: `route-step-${index}`,
              name: placeName, // ✅ DB의 location 필드 직접 사용: "시테 섬", "루브르 박물관" 등
              location: locationName,
              category: 'travel',
              description,
              highlights: [],
              estimatedDays: Math.min(Math.ceil((index + 1) / 3), 2),
              difficulty: 'easy' as const,
              seasonality: t('common.yearRound'),
              popularity: Math.max(95 - (index * 3), 70),
              coordinates
            };
          }).filter(Boolean);
          
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
          setError(result.error || t('guide.cannotLoadInfo'));
        }
      }

    } catch (err) {
      console.error('지역 정보 로드 오류:', err);
      setError(t('guide.loadRegionError') as string);
    } finally {
      setIsLoading(false);
    }
  }, [locationName, language, routingResult, content, t]);

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
          <h2 className="text-xl font-medium text-gray-900 mb-2">{t('guide.cannotLoadInfo')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="min-h-screen bg-white">
      {/* 🎨 모던 미니멀 헤더 */}
      <div className="border-b border-black/8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 hover:bg-black/5 rounded-2xl transition-colors"
              aria-label={t('common.goBack') as string}
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
                <h2 className="text-xl font-semibold text-black">{t('guide.regionIntroduction')}</h2>
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
                <h2 className="text-xl font-semibold text-black">{t('guide.keyFeatures')}</h2>
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


        {/* 🎨 추천 여행지 카드 */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-black">
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
                    className="group flex items-center justify-between p-4 bg-black/2 border border-black/5 rounded-2xl cursor-pointer transition-all duration-300 hover:border-black/20 hover:bg-black/5 active:scale-[0.99] focus:ring-2 focus:ring-black/30 focus:ring-offset-2"
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
                      <div className="w-8 h-8 bg-black text-white text-sm font-semibold rounded-xl flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black group-hover:text-black/80">
                          {spot.name}
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
                <p className="text-black/60 text-lg">{t('guide.noRecommendedSpots')}</p>
              </div>
            )}
          </div>
        </div>

        {/* 🎨 추천시작지점 지도 카드 */}
        {(regionData?.coordinates || (content?.realTimeGuide?.chapters && content.realTimeGuide.chapters.length > 0)) && (
          <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-black">{t('guide.mapTitle')}</h2>
              </div>
              <div className="h-80 bg-black/2 border border-black/5 rounded-2xl overflow-hidden">
                <StartLocationMap
                  locationName={locationName}
                  startPoint={{
                    lat: regionData?.coordinates?.lat || 
                         (content?.realTimeGuide?.chapters?.[0]?.coordinates?.lat ? parseFloat(content.realTimeGuide.chapters[0].coordinates.lat) : 37.5665),
                    lng: regionData?.coordinates?.lng || 
                         (content?.realTimeGuide?.chapters?.[0]?.coordinates?.lng ? parseFloat(content.realTimeGuide.chapters[0].coordinates.lng) : 126.9780),
                    name: `${locationName} ${t('guide.regionSuffix')}`
                  }}
                  chapters={content?.realTimeGuide?.chapters?.map((chapter: any, index: number) => ({
                    id: index,
                    title: chapter.title || `${t('guide.chapterPrefix')} ${index + 1}`,
                    lat: chapter.coordinates?.lat ? parseFloat(chapter.coordinates.lat) : undefined,
                    lng: chapter.coordinates?.lng ? parseFloat(chapter.coordinates.lng) : undefined,
                    narrative: chapter.narrative || chapter.description || '',
                    originalIndex: index
                  })).filter((chapter: any) => chapter.lat && chapter.lng) || []}
                  pois={recommendedSpots.filter(spot => spot.coordinates).map(spot => ({
                    id: spot.id,
                    name: spot.name,
                    lat: spot.coordinates!.lat,
                    lng: spot.coordinates!.lng,
                    description: spot.description
                  }))}
                  showIntroOnly={true}
                  className="w-full h-full"
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