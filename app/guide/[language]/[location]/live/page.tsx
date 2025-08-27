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
  ArrowUp,
  AlertTriangle,
  Heart,
  Download
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { MicrosoftTranslator } from '@/lib/location/microsoft-translator';

// 동적 import로 코드 스플리팅 적용
const LiveLocationTracker = dynamic(() => import('@/components/location/LiveLocationTracker'), {
  loading: () => <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>
});

const SimpleAudioPlayer = dynamic(() => import('@/components/audio/SimpleAudioPlayer'), {
  loading: () => <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
});

const ChapterAudioPlayer = dynamic(() => import('@/components/audio/ChapterAudioPlayer'), {
  loading: () => <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
});

// 직접 import로 변경하여 중복 초기화 방지
import MapWithRoute from '@/components/guide/MapWithRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { AudioChapter } from '@/types/audio';
import { enhanceGuideCoordinates } from '@/lib/coordinates/guide-coordinate-enhancer';
import { GuideHeader } from '@/components/guide/GuideHeader';
import { GuideTitle } from '@/components/guide/GuideTitle';
import { LiveAudioPlayer } from '@/components/guide/LiveAudioPlayer';

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
  
  const locationName = typeof params.location === 'string' 
    ? decodeURIComponent(params.location) 
    : decodeURIComponent(String(params.location));
  
  console.log('🔍 URL 파라미터 디버그:', {
    rawParam: params.location,
    decodedLocationName: locationName
  });
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  // mapCenter state 제거 - MapWithRoute가 자체적으로 좌표 관리
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // POI와 챕터 상태 관리
  const [poisWithChapters, setPoisWithChapters] = useState<POI[]>([]);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [poisError, setPoisError] = useState<string | null>(null);
  const [actualGuideId, setActualGuideId] = useState<string | null>(null);
  
  // 오디오 연동 상태
  const [chapterControls, setChapterControls] = useState<Map<string | number, any>>(new Map());
  const [isPlayingFromTop, setIsPlayingFromTop] = useState(false);
  const [chapterRefs, setChapterRefs] = useState<Map<string | number, any>>(new Map());




  // 직접 DB에서 가이드 데이터 로딩
  useEffect(() => {
    const loadGuideDataDirectly = async () => {
      setIsLoadingPOIs(true);
      setPoisError(null);
      
      try {
        console.log('🔍 직접 DB 조회 시작:', locationName);
        
        // 먼저 전역 데이터 확인 (빠른 경로)
        const globalGuideData = (window as any).currentGuideData;
        if (globalGuideData) {
          console.log('📦 전역 데이터 사용 - coordinates 별도 조회 필요');
          
          // 전역 데이터에는 coordinates가 없으므로 별도 조회
          const { supabase } = await import('@/lib/supabaseClient');
          const normalizedLocation = locationName.trim().toLowerCase().replace(/\s+/g, ' ');
          
          const { data: coordsData } = await supabase
            .from('guides')
            .select('id, coordinates')
            .eq('locationname', normalizedLocation)
            .eq('language', currentLanguage)
            .maybeSingle();
          
          console.log('📍 전역 데이터용 coordinates 별도 조회 완료');
          if (coordsData?.id) {
            setActualGuideId(coordsData.id);
            console.log(`🆔 실제 가이드 ID 설정: ${coordsData.id}`);
          }
          await processGuideData(globalGuideData, coordsData?.coordinates);
          return;
        }
        
        // DB에서 직접 조회 (안전한 경로)
        const { supabase } = await import('@/lib/supabaseClient');
        
        // 🌐 다국어 장소명 처리: 현재 언어가 한국어가 아니면 한국어로 역번역
        let dbLocationName = locationName;
        if (currentLanguage !== 'ko') {
          try {
            dbLocationName = await MicrosoftTranslator.reverseTranslateLocationName(
              locationName, 
              currentLanguage
            );
            console.log(`🔄 DB 조회용 역번역: ${locationName} → ${dbLocationName} (${currentLanguage} → ko)`);
          } catch (error) {
            console.warn('⚠️ 역번역 실패, 원본 사용:', error);
            dbLocationName = locationName;
          }
        }
        
        const normalizedLocation = dbLocationName.trim().toLowerCase().replace(/\s+/g, ' ');
        
        const { data, error } = await supabase
          .from('guides')
          .select('id, content, coordinates')
          .eq('locationname', normalizedLocation)
          .eq('language', currentLanguage)
          .maybeSingle();
        
        if (error) {
          console.error('DB 조회 오류:', error);
          setPoisError('가이드 데이터 조회 실패');
          return;
        }
        
        if (data?.content) {
          console.log('🗄️ DB에서 데이터 로드 성공');
          if (data.id) {
            setActualGuideId(data.id);
            console.log(`🆔 실제 가이드 ID 설정: ${data.id}`);
          }
          await processGuideData(data.content, data.coordinates);
        } else {
          setPoisError('해당 위치의 가이드 데이터가 없습니다');
        }
        
      } catch (error) {
        console.error('가이드 데이터 로딩 실패:', error);
        setPoisError('데이터 로딩 중 오류가 발생했습니다');
      } finally {
        setIsLoadingPOIs(false);
      }
    };
    
    const processGuideData = async (guideData: any, coordinatesFromDB?: any) => {
      const personalities = ['agreeableness', 'openness', 'conscientiousness'];
      const pois: POI[] = [];

      // 다양한 데이터 구조에서 챕터 찾기
      let chapters: any[] = [];
      
      if (guideData.realTimeGuide?.chapters) {
        chapters = guideData.realTimeGuide.chapters;
      } else if (guideData.realTimeGuide && Array.isArray(guideData.realTimeGuide)) {
        chapters = guideData.realTimeGuide;
      } else if (guideData.chapters) {
        chapters = guideData.chapters;
      }

      console.log(`🔍 찾은 챕터: ${chapters.length}개`);

      // 🎯 새로운 AI 자가검증 시스템으로 좌표 정확도 향상
      try {
        console.log('🎯 AI 자가검증 시스템으로 좌표 보정 시작...');
        
        // GuideData 형식으로 변환
        const guideDataForEnhancement = {
          overview: {
            title: locationName,
            description: '',
            totalDuration: '',
            highlights: [],
            keyFacts: []
          },
          route: {
            description: '',
            estimatedTime: '',
            steps: []
          },
          metadata: {
            createdAt: new Date(),
            lastUpdated: new Date(),
            version: '1.0',
            originalLocationName: locationName
          },
          realTimeGuide: {
            chapters: chapters
          }
        };

        // 🚨 중요: 좌표 보정 시스템 비활성화 - 라우터에서 이미 정확한 좌표 검색 완료
        console.log('🎯 Live 페이지에서도 좌표 보정 비활성화 - 라우터 좌표 사용');
        
        // 좌표 보정 없이 원본 가이드 데이터 사용
        const enhancedGuide = guideDataForEnhancement;
        const result = {
          success: true,
          originalCount: 0,
          enhancedCount: 0,
          improvements: [],
          processingTimeMs: 0
        };

        if (result.success) {
          console.log(`✅ 좌표 보정 완료: ${result.enhancedCount}/${result.originalCount} 챕터`);
          
          // 개발환경에서 상세 결과 출력
          if (process.env.NODE_ENV === 'development' && 'chapter0Validation' in result && result.chapter0Validation) {
            const validation = result.chapter0Validation as any;
            console.log(`🎯 챕터 0 자가검증 결과:
   - 정확도: ${validation.isAccurate ? '✅ 승인' : '❌ 부정확'}
   - 신뢰도: ${Math.round(validation.confidence * 100)}%
   - 거리: ${Math.round(validation.distanceFromTarget)}m`);
          }
          
          // 보정된 챕터 사용
          chapters = enhancedGuide.realTimeGuide?.chapters || chapters;
        } else {
          console.warn('⚠️ 좌표 보정 실패, 원본 좌표 사용');
        }
      } catch (error) {
        console.error('❌ 좌표 보정 오류:', error);
        console.log('📍 원본 좌표로 계속 진행');
      }

      // 🎯 좌표는 coordinates 칼럼에서 직접 가져오기 (DB 조회 결과에서)
      const coordinatesArray = coordinatesFromDB || [];
      console.log(`📍 DB coordinates 칼럼에서 ${coordinatesArray.length}개 좌표 발견`);

      // POI 생성 - coordinates 칼럼 우선 사용
      if (coordinatesArray.length > 0) {
        coordinatesArray.forEach((coordItem: any, index: number) => {
          // 좌표 추출 - coordinates 객체 우선, 최상위 폴백
          let lat: number, lng: number;
          
          if (coordItem.coordinates?.lat && coordItem.coordinates?.lng) {
            // coordinates 객체 안의 좌표 사용 (우선순위 1)
            lat = parseFloat(coordItem.coordinates.lat);
            lng = parseFloat(coordItem.coordinates.lng);
          } else if (coordItem.lat && coordItem.lng) {
            // 최상위 좌표 사용 (폴백)
            lat = parseFloat(coordItem.lat);
            lng = parseFloat(coordItem.lng);
          } else {
            console.warn(`⚠️ 좌표 ${index + 1}에서 유효한 좌표를 찾을 수 없음:`, coordItem);
            return; // 이 항목을 건너뜀
          }

          // 유효한 좌표가 있는 경우 POI 생성
          if (!isNaN(lat) && !isNaN(lng) &&
              lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            // POI 생성
            const poi: POI = {
              id: `poi_${index}`,
              name: coordItem.title || `스팟 ${index + 1}`,
              lat,
              lng,
              radius: 50, // 오디오 가이드 반경 50m
              description: coordItem.description || coordItem.title || '',
              audioChapter: coordItem.audioUrl ? {
                id: index,
                title: coordItem.title || `챕터 ${index + 1}`,
                audioUrl: coordItem.audioUrl,
                duration: coordItem.duration || 120,
                text: coordItem.description || coordItem.title || ''
              } : undefined
            };
            
            pois.push(poi);
            console.log(`✅ POI 생성: ${coordItem.title || `챕터 ${index + 1}`} (${lat}, ${lng})`);
          } else {
            console.warn(`⚠️ 좌표 ${index + 1} 무효:`, { title: coordItem.title, lat, lng });
          }
        });
      } else {
        console.warn('📍 coordinates 칼럼이 비어있음. content의 잘못된 좌표는 사용하지 않음');
        setPoisError('정확한 좌표 데이터가 없습니다');
      }

      if (pois.length > 0) {
        console.log(`✅ ${pois.length}개 유효한 POI 생성 완료`);
        setPoisWithChapters(pois);
      } else {
        setPoisError('유효한 좌표를 가진 챕터가 없습니다');
      }
    };

    loadGuideDataDirectly();
  }, [locationName, currentLanguage]);

  // 중복된 mapCenter 업데이트 로직 제거 - MapWithRoute가 POI 데이터에서 직접 중심점 계산

  const audioChapters: AudioChapter[] = poisWithChapters
    .filter(poi => poi.audioChapter)
    .map(poi => poi.audioChapter!);

  // Handle location updates from tracker
  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    // setMapCenter 제거 - MapWithRoute가 currentLocation을 사용하여 직접 처리
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
    
    // 지도 중심 이동은 MapWithRoute가 activeChapter 변경에 따라 자동 처리
  };

  // 챕터 오디오 컨트롤 등록
  const handleRegisterControls = (chapterId: string | number, controls: any) => {
    setChapterControls(prev => {
      const newMap = new Map(prev);
      newMap.set(chapterId, controls);
      return newMap;
    });
    console.log(`🎛️ [Live] 챕터 ${chapterId} 오디오 컨트롤 등록 완료`);
  };

  // 상단 LiveAudioPlayer에서 하단 챕터 오디오 요청
  const handleAudioRequest = async (chapterId: string | number): Promise<string | null> => {
    console.log(`🎧 [Live] 상단에서 챕터 ${chapterId} 오디오 요청`);
    
    // 해당 챕터의 오디오 URL이 있으면 반환
    const chapter = audioChapters.find(ch => ch.id === chapterId);
    if (chapter?.audioUrl) {
      console.log(`✅ [Live] 기존 오디오 URL 반환: ${chapterId}`);
      return chapter.audioUrl;
    }
    
    // 오디오가 없으면 하단 컴포넌트에서 TTS 생성 대기
    console.log(`🎵 [Live] 챕터 ${chapterId}의 TTS 생성 대기 중...`);
    
    // 하단 컴포넌트에 TTS 생성 신호를 보내기 위해 특수 이벤트 발생
    const triggerEvent = new CustomEvent('triggerChapterTTS', { 
      detail: { chapterId, fromTopPlayer: true } 
    });
    window.dispatchEvent(triggerEvent);
    
    // 잠시 대기 후 다시 확인 (하단에서 TTS가 생성될 때까지)
    return new Promise((resolve) => {
      let checkCount = 0;
      const maxChecks = 100; // 100 * 100ms = 10초
      
      const checkAudio = () => {
        checkCount++;
        
        // audioChapters 상태를 실시간으로 다시 가져오기
        const currentAudioChapters = poisWithChapters
          .filter(poi => poi.audioChapter)
          .map(poi => poi.audioChapter!);
          
        const updatedChapter = currentAudioChapters.find(ch => ch.id === chapterId);
        
        if (updatedChapter?.audioUrl) {
          console.log(`✅ [Live] 하단에서 생성된 오디오 URL 획득: ${chapterId}`);
          resolve(updatedChapter.audioUrl);
          return;
        }
        
        if (checkCount >= maxChecks) {
          console.log(`⏰ [Live] TTS 생성 타임아웃 (${checkCount}회 체크): ${chapterId}`);
          resolve(null);
          return;
        }
        
        // 100ms 후 다시 체크
        setTimeout(checkAudio, 100);
      };
      
      // 첫 번째 체크
      checkAudio();
    });
  };

  // 상단 재생 상태 변경 처리
  const handlePlayStateChange = (isPlaying: boolean, currentTime?: number, duration?: number) => {
    setIsPlayingFromTop(isPlaying);
    console.log(`🎵 [Live] 상단 재생 상태 변경: ${isPlaying}`);
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
          title: String(t('live.shareTitle')),
          text: String(t('live.shareText')),
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
    // 지도 중심 이동은 MapWithRoute가 activeChapter 변경에 따라 자동 처리
  };

  // Get current POI info
  const currentPOI = poisWithChapters[currentChapter];


  // 좌표 정보 추출 함수
  const extractCoordinatesInfo = () => {
    const coordinates: Array<{
      index: number;
      name: string;
      lat: number;
      lng: number;
      description: string;
      isStartPoint: boolean;
    }> = [];
    
    poisWithChapters.forEach((poi, index) => {
      if (poi.lat && poi.lng) {
        coordinates.push({
          index: index + 1,
          name: poi.name,
          lat: poi.lat,
          lng: poi.lng,
          description: poi.description || '',
          isStartPoint: index === 0
        });
      }
    });
    
    return coordinates;
  };

  const coordinatesInfo = extractCoordinatesInfo();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <GuideHeader 
        locationName={locationName}
        onShare={handleShare}
        variant="live"
      />

      {/* 제목 섹션 - 헤더와 붙어있게 */}
      <GuideTitle locationName={locationName} variant="live" />

      {/* 오디오 플레이어 - 제목 섹션과 붙어있게 */}
      {audioChapters.length > 0 && (
        <LiveAudioPlayer
          chapters={audioChapters}
          locationName={locationName}
          onChapterChange={handleChapterChange}
          onAudioRequest={handleAudioRequest}
          onPlayStateChange={handlePlayStateChange}
          activeChapterControls={audioChapters[currentChapter] ? chapterControls.get(audioChapters[currentChapter].id) : null}
        />
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* 개요 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black">{t('guide.overview')}</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-800 leading-relaxed">
              GPS를 기반으로 현재 위치에서 가장 적합한 관람 코스를 실시간으로 안내합니다. 
              각 지점에 도착하면 자동으로 해당 위치의 상세 정보와 오디오 가이드가 제공됩니다.
            </p>
          </div>
        </div>

        {/* 필수관람포인트 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">{t('guide.mustSeePoints')}</h2>
            {poisWithChapters.length > 0 && (
              <span className="text-xs text-gray-500">{poisWithChapters.length}개 지점</span>
            )}
          </div>
          
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
          
          <div className="space-y-3">
            {poisWithChapters.map((poi, index) => (
              <div key={poi.id} className="bg-white border border-gray-200 rounded-xl p-4 overflow-hidden">
                <div className="flex items-start gap-3 mb-3">
                  {/* 트랙 번호 - 디자인 시안 스타일 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    {index === 0 ? (
                      <span className="text-white text-xs font-semibold">🎯</span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-700">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-black">{poi.name}</h3>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {t('guide.startLocation') || '시작지점'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{poi.description}</p>
                    
                    {/* 좌표 정보 표시 */}
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono">
                          위도: {poi.lat.toFixed(6)}, 경도: {poi.lng.toFixed(6)}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${poi.lat}, ${poi.lng}`);
                            alert('좌표가 클립보드에 복사되었습니다!');
                          }}
                          className="ml-auto text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          복사
                        </button>
                      </div>
                    </div>
                    
                    {/* 인트로가 아닌 경우 방향 안내 강조 */}
                    {index > 0 && poi.audioChapter?.text && (
                      <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <div className="flex items-start gap-2">
                          <Compass className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              {t('guide.directionGuidance') || '방향 안내'}
                            </h4>
                            <p className="text-sm text-gray-700">
                              이전 위치에서 방향 안내를 따라 이동하세요
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                      onRegisterControls={handleRegisterControls}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 좌표 정보 요약 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-black">좌표 정보 요약</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid gap-3">
              {coordinatesInfo.map((coord, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${coord.isStartPoint ? 'bg-blue-600' : 'bg-gray-100'} text-sm rounded-full flex items-center justify-center`}>
                      {coord.isStartPoint ? (
                        <span className="text-white font-semibold">🎯</span>
                      ) : (
                        <span className="text-gray-700 font-semibold">{coord.index}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-black">
                        {coord.name}
                        {coord.isStartPoint && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            시작지점
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-mono text-gray-600">
                        {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${coord.lat}, ${coord.lng}`);
                        alert('좌표가 클립보드에 복사되었습니다!');
                      }}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      복사
                    </button>
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://maps.google.com/?q=${coord.lat},${coord.lng}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      지도보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 전체 좌표 복사 버튼 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const allCoords = coordinatesInfo.map(coord => 
                    `${coord.name}: ${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`
                  ).join('\n');
                  navigator.clipboard.writeText(allCoords);
                  alert('모든 좌표가 클립보드에 복사되었습니다!');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                📋 전체 좌표 복사
              </button>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-black">{t('guide.precautions')}</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="space-y-2">
              <p className="text-sm text-blue-800 leading-relaxed">• {t('guide.precaution1')}</p>
              <p className="text-sm text-blue-800 leading-relaxed">• {t('guide.precaution2')}</p>
              <p className="text-sm text-blue-800 leading-relaxed">• {t('guide.precaution3')}</p>
              <p className="text-sm text-blue-800 leading-relaxed">• {t('guide.precaution4')}</p>
            </div>
          </div>
        </div>

        {/* 관람순서 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black">{t('guide.viewingOrder')}</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  <span className="font-semibold">1</span>
                </div>
                <p className="text-sm text-gray-800">{t('guide.step1')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  <span className="font-semibold">2</span>
                </div>
                <p className="text-sm text-gray-800">{t('guide.step2')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  <span className="font-semibold">3</span>
                </div>
                <p className="text-sm text-gray-800">{t('guide.step3')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  <span className="font-semibold">4</span>
                </div>
                <p className="text-sm text-gray-800">{t('guide.step4')}</p>
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
            className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm font-semibold"
          >
            {t('guide.startRealtimeGuide')}
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

        {/* 추천 시작지점 지도 (시작 후에만 표시) - 인트로 챕터만 */}
        {showMap && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">{t('guide.recommendedStartPoint') || '추천 시작지점'}</h2>
                <p className="text-xs text-gray-600">{t('guide.accurateIntroLocation') || '정확한 인트로 위치'}</p>
              </div>
            </div>
            
            <div className="h-64 bg-white border border-gray-200 rounded-xl overflow-hidden">
              {poisWithChapters.length > 0 ? (
                <MapWithRoute
                  pois={poisWithChapters
                    .filter((poi, index) => index === 0) // 🎯 인트로 POI만 표시 (첫 번째만)
                    .map(poi => ({
                      id: poi.id,
                      name: poi.name,
                      lat: poi.lat,
                      lng: poi.lng,
                      description: poi.description || ''
                    }))}
                  currentLocation={currentLocation}
                  center={undefined} // MapWithRoute가 POI 데이터에서 자체적으로 중심점 계산
                  zoom={16} // 더 확대된 뷰
                  showRoute={false} // 루트 표시 안 함
                  showUserLocation={true}
                  onPoiClick={(poiId) => {
                    const poiIndex = poisWithChapters.findIndex(poi => poi.id === poiId);
                    if (poiIndex !== -1) {
                      setCurrentChapter(poiIndex);
                    }
                  }}
                  className="w-full h-full"
                  locationName={locationName}
                  guideCoordinates={undefined} // live 페이지에서는 POI 데이터 사용
                  guideId={actualGuideId || `guide_${locationName}`} // 실시간 좌표 감지를 위한 실제 가이드 ID 전달
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-3"></div>
                    <div className="text-gray-600 font-medium">지도 준비 중...</div>
                    <div className="text-gray-500 text-sm mt-1">정확한 위치를 확인하고 있습니다</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 하단 액션 버튼들 - 디자인 시안 스타일 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3" style={{ zIndex: 'var(--z-sticky)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                // 즐겨찾기 기능
                console.log('즐겨찾기 추가');
                alert('즐겨찾기에 추가되었습니다!');
              }}
              className="flex flex-col items-center space-y-1 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-4 h-4 text-gray-700" />
              <span className="text-xs text-gray-700">즐겨찾기</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex flex-col items-center space-y-1 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
              <span className="text-xs text-gray-700">공유</span>
            </button>
            
            <button
              onClick={() => {
                // 저장 기능
                console.log('가이드 저장');
                alert('가이드가 저장되었습니다!');
              }}
              className="flex flex-col items-center space-y-1 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-700" />
              <span className="text-xs text-gray-700">저장</span>
            </button>
            
            <button
              onClick={() => {
                // 재생성 기능
                console.log('가이드 재생성');
                if (confirm('가이드를 새로 생성하시겠습니까?')) {
                  window.location.reload();
                }
              }}
              className="flex flex-col items-center space-y-1 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-700" />
              <span className="text-xs text-gray-700">재생성</span>
            </button>
          </div>
        </div>
      </div>

      {/* 하단 버튼 여백 확보 */}
      <div className="h-20"></div>
    </div>
  );
};

export default LiveTourPage;