'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Headphones, 
  ArrowLeft,
  Share2,
  RotateCcw,
  Compass,
  Home,
  ArrowUp
} from 'lucide-react';
import LiveLocationTracker from '@/components/location/LiveLocationTracker';
import SimpleAudioPlayer from '@/components/audio/SimpleAudioPlayer';
import ChapterAudioPlayer from '@/components/audio/ChapterAudioPlayer';
import MapWithRoute from '@/components/guide/MapWithRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { AudioChapter } from '@/types/audio';

interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius?: number;
  description?: string;
  audioChapter?: AudioChapter;
}

const LiveTourPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  const locationName = typeof params.location === 'string' ? params.location : String(params.location);
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  
  // POI와 챕터 상태 관리
  const [poisWithChapters, setPoisWithChapters] = useState<POI[]>([]);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [poisError, setPoisError] = useState<string | null>(null);

  // 기존 가이드 데이터에서 POI 생성하는 함수  
  const fetchGuideBasedPOIs = async (locationName: string): Promise<POI[]> => {
    try {
      console.log('📚 기존 가이드 기반 POI 생성 시작:', locationName);
      console.log('🔍 URL에서 받은 원본 위치명:', {
        locationName,
        urlDecoded: decodeURIComponent(locationName),
        type: typeof locationName
      });
      
      // 기존 가이드 데이터 가져오기
      const { MultiLangGuideManager } = await import('@/lib/multilang-guide-manager');
      
      // 위치명 정규화 시도 (다양한 형태로 검색)
      const searchTerms = [
        locationName,
        decodeURIComponent(locationName),
        locationName.replace(/-/g, ' ').replace(/_/g, ' ')
      ];
      
      console.log('🔍 가이드 검색 시도 위치명들:', searchTerms);
      
      let guideResult: any = null;
      for (const searchTerm of searchTerms) {
        console.log(`📖 가이드 검색 시도: "${searchTerm}"`);
        guideResult = await MultiLangGuideManager.getGuideByLanguage(searchTerm, currentLanguage === 'ko' ? 'ko' : 'en');
        console.log(`📊 검색 결과:`, {
          searchTerm,
          success: guideResult.success,
          hasData: !!guideResult.data,
          error: guideResult.error,
          source: guideResult.source
        });
        if (guideResult.success) {
          console.log(`✅ 가이드 발견: "${searchTerm}"`);
          break;
        }
      }
      
      if (!guideResult || !guideResult.success || !guideResult.data) {
        console.log('❌ 가이드 검색 실패:', {
          guideResult,
          hasResult: !!guideResult,
          success: guideResult?.success,
          hasData: !!guideResult?.data,
          error: guideResult?.error
        });
        throw new Error(guideResult?.error || '가이드 데이터를 찾을 수 없습니다');
      }
      
      const guideData = guideResult.data;
      
      console.log('📖 가이드 데이터 확인:', {
        hasGuide: !!guideData,
        hasRealTimeGuide: !!guideData?.realTimeGuide,
        realTimeGuideType: typeof guideData?.realTimeGuide,
        realTimeGuideLength: guideData?.realTimeGuide?.length || 0,
        guideDataKeys: Object.keys(guideData || {}),
        sampleRealTimeGuide: guideData?.realTimeGuide?.[0] // 첫 번째 챕터 샘플
      });

      // realTimeGuide.chapters 구조 확인
      const chapters = guideData?.realTimeGuide?.chapters || guideData?.realTimeGuide || [];
      
      console.log('🔍 챕터 데이터 구조 분석:', {
        hasRealTimeGuide: !!guideData?.realTimeGuide,
        isRealTimeGuideArray: Array.isArray(guideData?.realTimeGuide),
        hasChapters: !!guideData?.realTimeGuide?.chapters,
        isChaptersArray: Array.isArray(guideData?.realTimeGuide?.chapters),
        chaptersLength: chapters.length,
        chaptersStructure: chapters[0] ? Object.keys(chapters[0]) : []
      });

      if (chapters && Array.isArray(chapters) && chapters.length > 0) {
        console.log('🎯 실시간 가이드 챕터 데이터 사용');
        
        const personalities = ['agreeableness', 'openness', 'conscientiousness'];
        const guidePOIs: POI[] = [];

        for (let i = 0; i < chapters.length; i++) {
          const chapter = chapters[i];
          console.log(`📍 챕터 ${i + 1} 분석:`, {
            title: chapter.title || chapter.name,
            hasCoordinates: !!(chapter.coordinates || chapter.lat),
            coordinates: chapter.coordinates,
            lat: chapter.lat,
            lng: chapter.lng
          });

          let lat: number, lng: number;

          // 1. 챕터에 이미 좌표가 있는지 확인 (AI가 생성한 좌표)
          if (chapter.coordinates) {
            lat = chapter.coordinates.lat;
            lng = chapter.coordinates.lng;
            console.log(`✅ AI 생성 좌표 사용: ${lat}, ${lng}`);
          } 
          // 2. 직접 lat/lng 필드가 있는지 확인
          else if (chapter.lat && chapter.lng) {
            lat = chapter.lat;
            lng = chapter.lng;
            console.log(`✅ 직접 좌표 사용: ${lat}, ${lng}`);
          }
          // 3. 좌표가 없으면 Enhanced Location Service로 검색
          else {
            console.log(`🔍 좌표 없음, 위치 검색 시도: ${chapter.title || chapter.name}`);
            try {
              const locationPOI = await fetchLocationCoordinates(chapter.title || chapter.name || `${locationName} ${i + 1}`, i);
              if (locationPOI) {
                lat = locationPOI.lat;
                lng = locationPOI.lng;
                console.log(`✅ 검색된 좌표 사용: ${lat}, ${lng}`);
              } else {
                continue; // 좌표를 찾을 수 없으면 건너뛰기
              }
            } catch (error) {
              console.error(`❌ 좌표 검색 실패:`, error);
              continue;
            }
          }

          // POI 생성
          const poi: POI = {
            id: `poi_guide_${i + 1}`,
            name: chapter.title || chapter.name || `${locationName} ${i + 1}`,
            lat,
            lng,
            radius: 100,
            description: chapter.content || chapter.description || `${chapter.title || chapter.name}에 대한 상세한 설명입니다.`,
            audioChapter: {
              id: i + 1,
              title: chapter.title || chapter.name || `${locationName} ${i + 1}`,
              text: chapter.content || chapter.description || `${chapter.title || chapter.name}에 오신 것을 환영합니다.`,
              duration: chapter.duration ? chapter.duration * 60 : 120 + (i * 30),
              language: 'ko-KR',
              personality: personalities[i % personalities.length] as any
            }
          };

          guidePOIs.push(poi);
        }

        console.log('✅ 가이드 기반 POI 생성 완료:', guidePOIs.length);
        return guidePOIs;
      }
      
      throw new Error('실시간 가이드 데이터가 없습니다');

    } catch (error) {
      console.error('❌ 가이드 기반 POI 생성 실패:', error);
      throw error;
    }
  };

  // 개별 위치의 좌표를 가져오는 함수
  const fetchLocationCoordinates = async (placeName: string, index: number): Promise<POI | null> => {
    try {
      const { enhancedLocationService } = await import('@/lib/location/enhanced-location-utils');
      const locationResult = await enhancedLocationService.findLocation(placeName, {
        preferStatic: false,
        language: currentLanguage === 'ko' ? 'ko' : 'en'
      });

      const personalities = ['agreeableness', 'openness', 'conscientiousness'];
      
      return {
        id: `poi_guide_${index + 1}`,
        name: placeName,
        lat: locationResult.center.lat,
        lng: locationResult.center.lng,
        radius: 100,
        description: `${placeName}에 대한 상세한 설명입니다.`,
        audioChapter: {
          id: index + 1,
          title: placeName,
          text: `${placeName}에 오신 것을 환영합니다. 이곳의 특별한 이야기를 들려드리겠습니다.`,
          duration: 120 + (index * 30),
          language: 'ko-KR',
          personality: personalities[index % personalities.length] as any
        }
      };
    } catch (error) {
      console.error(`❌ ${placeName} 좌표 가져오기 실패:`, error);
      return null;
    }
  };

  // AI 가이드 데이터에서 POI 생성하는 함수 (fallback)
  const fetchAIGeneratedPOIs = async (locationName: string): Promise<POI[]> => {
    try {
      console.log('🤖 AI 가이드 기반 POI 생성 시작:', locationName);
      
      // AI 가이드 생성 API 호출
      console.log('📡 AI API 호출 준비:', {
        location: locationName,
        language: currentLanguage
      });
      
      const requestBody = {
        location: locationName,
        userProfile: {
          interests: ['문화', '역사'],
          tourDuration: 90,
          preferredStyle: '친근함',
          language: currentLanguage === 'ko' ? 'ko' : 'en'
        }
      };
      
      console.log('📦 요청 데이터:', requestBody);
      
      const response = await fetch('/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`AI 가이드 생성 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎯 AI 가이드 생성 결과:', result);
      console.log('🔍 결과 분석:', {
        success: result.success,
        hasData: !!result.data,
        hasStops: !!result.data?.detailedStops,
        stopsCount: result.data?.detailedStops?.length || 0
      });

      if (!result.success || !result.data?.detailedStops) {
        console.error('❌ AI 가이드 데이터 검증 실패:', {
          success: result.success,
          data: result.data,
          error: result.error
        });
        throw new Error(`AI 가이드 데이터가 없습니다: ${result.error || '알 수 없는 오류'}`);
      }

      // AI 생성 데이터에서 POI 생성
      const personalities = ['agreeableness', 'openness', 'conscientiousness'];
      const aiPOIs: POI[] = result.data.detailedStops.map((stop: any, index: number) => {
        return {
          id: `poi_ai_${stop.order || index + 1}`,
          name: stop.name || `${locationName} ${index + 1}번째 명소`,
          lat: stop.coordinates?.lat || 0,
          lng: stop.coordinates?.lng || 0,
          radius: 100,
          description: stop.content || stop.guideNote || '특별한 장소입니다.',
          audioChapter: {
            id: stop.order || index + 1,
            title: stop.name || `${locationName} ${index + 1}번째 명소`,
            text: stop.content || stop.guideNote || `${locationName}의 ${stop.name}에 대한 상세한 설명입니다.`,
            duration: stop.duration ? stop.duration * 60 : 120 + (index * 30),
            language: 'ko-KR',
            personality: personalities[index % personalities.length] as any
          }
        };
      });

      // 좌표가 유효한지 확인
      const validPOIs = aiPOIs.filter(poi => poi.lat !== 0 && poi.lng !== 0);
      
      if (validPOIs.length > 0) {
        console.log('✅ AI 생성 POI 개수:', validPOIs.length);
        return validPOIs;
      } else {
        console.log('⚠️ AI 생성 좌표가 유효하지 않아 fallback 사용');
        throw new Error('AI 생성 좌표가 유효하지 않습니다');
      }

    } catch (error) {
      console.error('❌ AI POI 생성 실패:', error);
      throw error;
    }
  };

  // 실제 위치 데이터를 가져오는 함수 (fallback)
  const fetchLocationPOIs = async (locationName: string): Promise<POI[]> => {
    try {
      console.log('🔍 실제 위치 데이터 검색 시작:', locationName);
      
      // Enhanced Location Service를 사용하여 실제 좌표 가져오기
      const { enhancedLocationService } = await import('@/lib/location/enhanced-location-utils');
      const locationResult = await enhancedLocationService.findLocation(locationName, {
        preferStatic: false, // 동적 데이터 우선
        language: currentLanguage === 'ko' ? 'ko' : 'en'
      });

      console.log('📍 위치 검색 결과:', locationResult);

      // 간단한 POI 생성
      
      // 기본 챕터 데이터 생성 (실제로는 AI가 생성하거나 DB에서 가져옴)
      const baseChapters = [
        {
          id: 1,
          title: `${locationName} 주요 관광지`,
          text: `${locationName}의 대표적인 관광 명소를 소개합니다. 이곳은 역사와 문화가 살아 숨쉬는 특별한 장소입니다.`
        },
        {
          id: 2, 
          title: `${locationName} 문화 유산`,
          text: `${locationName}에서 만날 수 있는 소중한 문화유산들을 탐방해보세요. 각각의 이야기가 담겨있습니다.`
        },
        {
          id: 3,
          title: `${locationName} 현지 체험`,
          text: `${locationName}에서만 경험할 수 있는 특별한 문화와 전통을 직접 체험해보세요.`
        }
      ];

      // Smart Mapping은 복잡하므로 간단한 방식으로 대체
      console.log('🎯 위치 기반 POI 생성 시작:', locationName);
      
      const personalities = ['agreeableness', 'openness', 'conscientiousness'];
      const simplePOIs: POI[] = baseChapters.map((chapter, index) => {
        // 중심점 주변에 약간의 오프셋을 주어 POI 생성
        const offset = 0.002 * (index + 1);
        return {
          id: `poi_${chapter.id}`,
          name: chapter.title,
          lat: locationResult.center.lat + (index === 0 ? 0 : offset * (index % 2 === 0 ? 1 : -1)),
          lng: locationResult.center.lng + (index === 0 ? 0 : offset * (index % 2 === 1 ? 1 : -1)),
          radius: 100,
          description: chapter.text,
          audioChapter: {
            id: chapter.id,
            title: chapter.title,
            text: chapter.text,
            duration: 120 + (index * 30),
            language: 'ko-KR',
            personality: personalities[index % personalities.length] as any
          }
        };
      });
      
      console.log('📍 생성된 POI 개수:', simplePOIs.length);
      console.log('🗺️ 중심 좌표:', locationResult.center);
      
      return simplePOIs;

    } catch (error) {
      console.error('❌ 위치 데이터 가져오기 실패:', error);
      
      // 폴백: 기본 서울 데이터
      const fallbackPOIs: POI[] = [
        {
          id: 'poi_fallback',
          name: `${locationName} (검색 실패)`,
          lat: 37.5665,
          lng: 126.9780,
          radius: 100,
          description: `${locationName}의 위치를 찾을 수 없어 기본 위치를 표시합니다.`,
          audioChapter: {
            id: 1,
            title: `${locationName} 정보`,
            text: `죄송합니다. ${locationName}의 정확한 위치 정보를 찾을 수 없습니다. 다른 위치를 검색해보시거나 잠시 후 다시 시도해주세요.`,
            duration: 90,
            language: 'ko-KR',
            personality: 'agreeableness'
          }
        }
      ];
      return fallbackPOIs;
    }
  };

  // POI 데이터 로딩 (AI 우선, fallback으로 위치 서비스)
  useEffect(() => {
    if (locationName) {
      setIsLoadingPOIs(true);
      setPoisError(null);

      // 먼저 기존 가이드 데이터로 시도
      console.log('🚀 POI 데이터 로딩 시작 - 기존 가이드 우선 모드');
      fetchGuideBasedPOIs(locationName)
        .then(pois => {
          console.log('✅ 가이드 기반 POI 데이터 로딩 완료:', pois);
          console.log('📊 가이드 기반 POI 개수:', pois.length);
          setPoisWithChapters(pois);
        })
        .catch(error => {
          console.error('❌ 가이드 기반 POI 실패, AI로 fallback:', error);
          console.error('❌ 가이드 실패 상세:', error.message, error.stack);
          
          // 가이드 실패 시 AI로 fallback
          return fetchAIGeneratedPOIs(locationName)
            .then(pois => {
              console.log('✅ AI Fallback POI 데이터 로딩 완료:', pois);
              console.log('📊 AI Fallback POI 개수:', pois.length);
              setPoisWithChapters(pois);
            })
            .catch(aiError => {
              console.error('❌ AI도 실패, 기존 방식으로 최종 fallback:', aiError);
              
              // 최종 fallback
              return fetchLocationPOIs(locationName)
                .then(pois => {
                  console.log('✅ 최종 Fallback POI 데이터 로딩 완료:', pois);
                  console.log('📊 최종 Fallback POI 개수:', pois.length);
                  setPoisWithChapters(pois);
                })
                .catch(fallbackError => {
                  console.error('❌ 모든 POI 데이터 로딩 실패:', fallbackError);
                  setPoisError(fallbackError.message);
                });
            });
        })
        .finally(() => {
          setIsLoadingPOIs(false);
        });
    }
  }, [locationName, currentLanguage]);

  const audioChapters: AudioChapter[] = poisWithChapters
    .filter(poi => poi.audioChapter)
    .map(poi => poi.audioChapter!);

  // Handle location updates from tracker
  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    setMapCenter(location);
  };

  // Handle POI reached events
  const handlePOIReached = (poiId: string, poiName: string) => {
    const poiIndex = poisWithChapters.findIndex(poi => poi.id === poiId);
    if (poiIndex !== -1 && audioChapters[poiIndex]) {
      setCurrentChapter(poiIndex);
      // Show notification or modal for new chapter
      console.log(`Reached ${poiName}, playing chapter ${poiIndex + 1}`);
    }
  };

  // Handle chapter updates from audio player
  const handleChapterUpdate = (poiId: string, updatedChapter: AudioChapter) => {
    setPoisWithChapters(prev => 
      prev.map(poi => 
        poi.id === poiId 
          ? { ...poi, audioChapter: updatedChapter }
          : poi
      )
    );
  };

  // Handle chapter changes from audio player
  const handleChapterChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    
    // Center map on the corresponding POI
    if (poisWithChapters[chapterIndex]) {
      setMapCenter({
        lat: poisWithChapters[chapterIndex].lat,
        lng: poisWithChapters[chapterIndex].lng
      });
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Share current location
  const handleShare = async () => {
    if (navigator.share && currentLocation) {
      try {
        await navigator.share({
          title: t('live.shareTitle'),
          text: t('live.shareText'),
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  // Reset tour
  const handleReset = () => {
    setCurrentChapter(0);
    if (poisWithChapters[0]) {
      setMapCenter({
        lat: poisWithChapters[0].lat,
        lng: poisWithChapters[0].lng
      });
    }
  };

  // Get current POI info
  const currentPOI = poisWithChapters[currentChapter];

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setCurrentScrollY(scrolled);
      const shouldShow = scrolled > 300;
      console.log('스크롤 이벤트:', { scrolled, shouldShow, currentState: showScrollButtons });
      setShowScrollButtons(shouldShow);
    };

    console.log('스크롤 리스너 등록');
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 상태 확인
    
    return () => {
      console.log('스크롤 리스너 해제');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 스크롤 투 탑 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 홈으로 이동 함수
  const goToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">{/* 내부 헤더 삭제됨 */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            {params.location} {t('guide.realTimeGuideTitle')}
          </h1>
          <p className="text-gray-500">
            현재 위치 기반 맞춤 안내
          </p>
        </div>

        {/* 개요 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">{t('guide.overview')}</h2>
          <p className="text-gray-600 leading-relaxed">
            GPS를 기반으로 현재 위치에서 가장 적합한 관람 코스를 실시간으로 안내합니다. 
            각 지점에 도착하면 자동으로 해당 위치의 상세 정보와 오디오 가이드가 제공됩니다.
          </p>
        </div>

        {/* 필수관람포인트 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('guide.mustSeePoints')}</h2>
          
          {/* 로딩 상태 */}
          {isLoadingPOIs && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
              <span className="text-gray-600">📍 {locationName}의 관광지 정보를 검색하고 있습니다...</span>
            </div>
          )}
          
          {/* 에러 상태 */}
          {poisError && !isLoadingPOIs && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-800 font-medium">위치 정보 로딩 실패</div>
              <div className="text-red-600 text-sm mt-1">{poisError}</div>
            </div>
          )}
          
          {/* POI 목록 */}
          {!isLoadingPOIs && poisWithChapters.length === 0 && !poisError && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">📍</div>
              <div>검색된 관광지가 없습니다</div>
              <div className="text-sm mt-1">다른 위치를 검색해보세요</div>
            </div>
          )}
          
          <div className="space-y-6">
            {poisWithChapters.map((poi, index) => (
              <div key={poi.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{poi.name}</h3>
                    <p className="text-sm text-gray-600">{poi.description}</p>
                  </div>
                </div>
                
                {/* 해당 챕터의 오디오 플레이어 */}
                {poi.audioChapter && (showMap || showAudioPlayer) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{t('guide.audioGuide')}</span>
                    </div>
                    <ChapterAudioPlayer
                      chapter={poi.audioChapter}
                      className="w-full"
                      onChapterUpdate={(updatedChapter) => handleChapterUpdate(poi.id, updatedChapter)}
                      locationName={locationName}
                      guideId={`guide_${locationName}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('guide.precautions')}</h2>
          <div className="space-y-2 text-gray-600">
            <p>• GPS 신호가 약한 지역에서는 위치 정확도가 떨어질 수 있습니다</p>
            <p>• 이어폰 착용을 권장하며, 주변 상황을 주의깊게 살펴보세요</p>
            <p>• 배터리 소모가 많으니 보조배터리를 준비하시기 바랍니다</p>
            <p>• 실내나 지하에서는 GPS 기능이 제한될 수 있습니다</p>
          </div>
        </div>

        {/* 관람순서 */}
        <div className="pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('guide.viewingOrder')}</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  1
                </div>
                <p className="text-gray-700">위치 권한 허용 및 GPS 활성화</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  2
                </div>
                <p className="text-gray-700">시작점으로 이동하여 투어 시작</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  3
                </div>
                <p className="text-gray-700">각 지점 도착 시 자동 오디오 가이드 재생</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  4
                </div>
                <p className="text-gray-700">제안된 순서대로 이동하여 완주</p>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="text-center pt-4">
          <button
            onClick={() => {
              // 실제 실시간 가이드 기능 시작
              setShowMap(true);
              setShowAudioPlayer(true);
            }}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('guide.realTimeGuideTitle')} 시작
          </button>
        </div>

        {/* Location Tracker (시작 후에만 표시) */}
        {(showMap || showAudioPlayer) && (
          <div className="mt-8">
            <LiveLocationTracker
              pois={poisWithChapters}
              onLocationUpdate={handleLocationUpdate}
              onPOIReached={handlePOIReached}
              showStats={false}
              showProgress={true}
              className="w-full"
            />
          </div>
        )}

        {/* Map (시작 후에만 표시) */}
        {showMap && (
          <div className="h-96 bg-white border border-gray-100 rounded-lg overflow-hidden">
            <MapWithRoute
              pois={poisWithChapters.map(poi => ({
                id: poi.id,
                name: poi.name,
                lat: poi.lat,
                lng: poi.lng,
                description: poi.description || ''
              }))}
              currentLocation={currentLocation}
              center={mapCenter}
              zoom={15}
              showRoute={true}
              showUserLocation={true}
              onPoiClick={(poiId) => {
                const poiIndex = poisWithChapters.findIndex(poi => poi.id === poiId);
                if (poiIndex !== -1) {
                  setCurrentChapter(poiIndex);
                }
              }}
              className="w-full h-full"
              // Enhanced Coordinate System (Phase 1-4) - 임시 비활성화
              locationName={locationName}
              enableEnhancedCoordinateSystem={false}
              enableSmartMapping={false}
              coordinatePackageOptions={{
                enableAnalytics: true,
                enableCaching: true,
                qualityThreshold: 0.6,
                region: 'KR',
                language: 'ko'
              }}
            />
          </div>
        )}

        {/* 디버깅용 추가 콘텐츠 - 스크롤 테스트를 위한 높이 확보 */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">스크롤 테스트용 콘텐츠</h3>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-700">
                스크롤 테스트를 위한 콘텐츠 #{i + 1}. 이 콘텐츠는 페이지의 높이를 늘려서 스크롤이 가능하도록 합니다.
                300px 이상 스크롤하면 하단에 네비게이션 버튼이 나타나야 합니다.
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* 스크롤 네비게이션 버튼들 */}
      {/* 항상 보이는 테스트 버튼 (임시) */}
      <div className="fixed bottom-20 left-6 right-6 flex justify-between items-center z-50">
        <button
          onClick={goToHome}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
          aria-label="테스트 홈 버튼"
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"
          aria-label="테스트 스크롤 버튼"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* 조건부 스크롤 버튼들 */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none z-50">
        {/* 홈 버튼 (왼쪽 하단) */}
        <button
          onClick={goToHome}
          className={`w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all duration-300 pointer-events-auto flex items-center justify-center ${
            showScrollButtons 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="홈으로 이동"
        >
          <Home className="w-6 h-6" />
        </button>

        {/* 스크롤 투 탑 버튼 (오른쪽 하단) */}
        <button
          onClick={scrollToTop}
          className={`w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all duration-300 pointer-events-auto flex items-center justify-center ${
            showScrollButtons 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="맨 위로 스크롤"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>

      {/* 강화된 디버깅 정보 */}
      <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded text-xs z-50 max-w-xs">
        <div>showScrollButtons: {showScrollButtons.toString()}</div>
        <div>currentScrollY: {currentScrollY}</div>
        <div>scrollY &gt; 300: {(currentScrollY > 300).toString()}</div>
        <div>Buttons should show: {showScrollButtons ? 'YES' : 'NO'}</div>
        <div>Page height: {typeof document !== 'undefined' ? document.body.scrollHeight : 'N/A'}</div>
      </div>
    </div>
  );
};

export default LiveTourPage;