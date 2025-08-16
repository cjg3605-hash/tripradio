"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GuideData } from '@/types/guide';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

// 동적 import로 큰 컴포넌트 지연 로딩
const MinimalTourContent = dynamic(() => import('./tour/components/TourContent'), {
  loading: () => <GuideLoading message="투어 콘텐츠 로딩 중..." />,
  ssr: false
});

// AdSense 광고 컴포넌트 동적 로드
const OptimalAdSense = dynamic(() => import('@/components/ads/OptimalAdSense'), {
  loading: () => <div className="h-24 animate-pulse bg-gray-100 rounded"></div>,
  ssr: true
});
import { guideHistory } from '@/lib/cache/localStorage';
import { saveGuideHistoryToSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/guide';
import { MultiLangGuideManager } from '@/lib/multilang-guide-manager';
import { safeUserProfile, normalizeLocationName } from '@/lib/utils';
import GuideLoading from '@/components/ui/GuideLoading';
import { routeLocationQueryCached } from '@/lib/location/location-router';
import { supabase } from '@/lib/supabaseClient';
import { getAutocompleteData } from '@/lib/cache/autocompleteStorage';

// RegionExploreHub 동적 로드
const RegionExploreHub = dynamic(() => import('./RegionExploreHub'), {
  loading: () => <GuideLoading message="탐색 허브 로딩 중..." />,
  ssr: false
});

interface Props {
  locationName: string;
  initialGuide?: any;
  requestedLanguage?: string;
  parentRegion?: string;
  regionalContext?: {
    region?: string;
    country?: string;
    countryCode?: string;
    type?: 'location' | 'attraction';
  };
}

// 🔥 핵심 수정: content 래핑 구조 올바른 처리
const normalizeGuideData = (data: any, locationName: string): GuideData => {
  if (!data) {
    throw new Error('가이드 데이터가 없습니다.');
  }

  // 🔥 핵심 수정: content 래핑 구조 올바른 처리 (이중 래핑 지원)
  let sourceData = data;
  
  // data.content.content가 있으면 그것을 사용 (이중 래핑 케이스)
  if (data.content && data.content.content && typeof data.content.content === 'object') {
    sourceData = data.content.content;
    // 📦 content.content 필드에서 데이터 추출 (이중 래핑)
  }
  // data.content가 있고 overview, route, realTimeGuide 중 하나라도 있으면 사용
  else if (data.content && typeof data.content === 'object' && (data.content.overview || data.content.route || data.content.realTimeGuide)) {
    sourceData = data.content;
    // 📦 content 필드에서 데이터 추출
  }
  // data가 직접 overview, route, realTimeGuide를 가지면 직접 사용
  else if (data.overview || data.route || data.realTimeGuide) {
    sourceData = data;
    // 📦 직접 구조에서 데이터 추출
  }
  else {
    console.error('❌ 올바른 가이드 구조를 찾을 수 없음:', Object.keys(data));
    console.error('❌ data.content 구조:', data.content ? Object.keys(data.content) : 'undefined');
    throw new Error('올바른 가이드 데이터 구조가 아닙니다.');
  }

  // 🔍 mustVisitSpots 데이터 추적
  /*
  console.log('🎯 MultiLangGuideClient에서 sourceData 확인:', {
    hasSourceData: !!sourceData,
    sourceDataKeys: Object.keys(sourceData || {}),
    sourceMustVisitSpots: sourceData?.mustVisitSpots,
    keyHighlights: sourceData?.keyHighlights,
    highlights: sourceData?.highlights
  });
  */

  // 🎯 정규화된 GuideData 생성
  const normalizedData: GuideData = {
    overview: {
      title: sourceData.overview?.title || locationName,
      // 새로운 개요 필드들
      location: sourceData.overview?.location || '',
      keyFeatures: sourceData.overview?.keyFeatures || '',
      background: sourceData.overview?.background || '',
      // 기존 필드들 (호환성)
      summary: sourceData.overview?.summary || '',
      narrativeTheme: sourceData.overview?.narrativeTheme || '',
      keyFacts: Array.isArray(sourceData.overview?.keyFacts) ? sourceData.overview.keyFacts : [],
      visitingTips: sourceData.overview?.visitingTips,
      historicalBackground: sourceData.overview?.historicalBackground,
      visitInfo: sourceData.overview?.visitInfo || {}
    },
    route: {
      steps: Array.isArray(sourceData.route?.steps) ? sourceData.route.steps : []
    },
    realTimeGuide: {
      chapters: Array.isArray(sourceData.realTimeGuide?.chapters) ? sourceData.realTimeGuide.chapters : [],
      ...sourceData.realTimeGuide
    },
    safetyWarnings: sourceData.safetyWarnings || '', // 안전 주의사항 추가
    mustVisitSpots: sourceData.mustVisitSpots || sourceData.keyHighlights || sourceData.highlights || '', // 필수관람포인트 추가
    metadata: {
      originalLocationName: locationName,
      generatedAt: sourceData.metadata?.generatedAt || new Date().toISOString(),
      version: sourceData.metadata?.version || '1.0',
      language: sourceData.metadata?.language || 'ko',
      ...sourceData.metadata
    }
  };

  // 🔧 챕터 ID 정규화 (타입 요구사항 충족)
  if (normalizedData.realTimeGuide?.chapters) {
    normalizedData.realTimeGuide.chapters = normalizedData.realTimeGuide.chapters.map((chapter, index) => {
      // 챕터 데이터 정규화: 3개 필드를 narrative로 통합
      const normalizedChapter = {
        ...chapter,
        id: chapter.id !== undefined ? chapter.id : index,
        title: chapter.title || `챕터 ${index + 1}`,
        // narrative가 있으면 사용, 없으면 3개 필드 합치기
        narrative: chapter.narrative || 
          [chapter.sceneDescription, chapter.coreNarrative, chapter.humanStories]
            .filter(Boolean).join(' '),
        nextDirection: chapter.nextDirection || ''
      };
      
      return normalizedChapter;
    });
  }

  // 🔍 최종 정규화 결과 확인
  /*
  console.log('🎯 MultiLangGuideClient 최종 정규화 결과:', {
    hasMustVisitSpots: !!normalizedData.mustVisitSpots,
    mustVisitSpots: normalizedData.mustVisitSpots,
    mustVisitSpotsType: typeof normalizedData.mustVisitSpots,
    mustVisitSpotsLength: normalizedData.mustVisitSpots?.length
  });
  */

  return normalizedData;
};

export default function MultiLangGuideClient({ 
  locationName, 
  initialGuide, 
  requestedLanguage, 
  parentRegion, 
  regionalContext 
}: Props) {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const { data: session } = useSession();

  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'cache' | 'generated' | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [routingResult, setRoutingResult] = useState<any>(null);
  const [shouldShowExploreHub, setShouldShowExploreHub] = useState(false);
  
  // 🚀 좌표 상태 관리
  const [coordinates, setCoordinates] = useState<any>(null);
  const [isCoordinatesPolling, setIsCoordinatesPolling] = useState(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);

  // 🎯 좌표 상태 폴링 함수
  const pollCoordinates = useCallback(async () => {
    if (!guideData?.metadata?.originalLocationName || !currentLanguage || isCoordinatesPolling) {
      return;
    }

    setIsCoordinatesPolling(true);
    
    try {
      const normLocation = normalizeLocationName(guideData.metadata.originalLocationName);
      
      console.log('🔄 [좌표 폴링] DB에서 백그라운드 생성된 좌표 확인 중:', { 
        locationName: normLocation, 
        language: currentLanguage.toLowerCase(),
        attempt: pollingAttemptsRef.current + 1
      });

      const { data, error } = await supabase
        .from('guides')
        .select('coordinates')
        .eq('locationname', normLocation)
        .eq('language', currentLanguage.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('❌ 좌표 폴링 오류:', error);
        return;
      }

      if (data?.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
        console.log(`✅ [좌표 폴링] 성공: ${data.coordinates.length}개 챕터 좌표 발견 (백그라운드 생성 완료)`);
        setCoordinates(data.coordinates);
        setIsCoordinatesPolling(false);
        
        // 폴링 중단
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      } else {
        console.log(`⏳ [좌표 폴링] 백그라운드 좌표 생성 진행 중... 3초 후 재시도 (${pollingAttemptsRef.current + 1}/10)`);
        
        // 3초 후 재시도 (최대 5회 = 15초)
        pollingTimeoutRef.current = setTimeout(() => {
          if (isCoordinatesPolling) {
            pollCoordinates();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('❌ 좌표 폴링 예외:', error);
    } finally {
      // 폴링 상태는 성공 시에만 false로 변경 (재시도를 위해)
    }
  }, [guideData?.metadata?.originalLocationName, currentLanguage, isCoordinatesPolling]);

  // 🔄 폴링 정리 함수
  const stopCoordinatesPolling = useCallback(() => {
    setIsCoordinatesPolling(false);
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopCoordinatesPolling();
    };
  }, [stopCoordinatesPolling]);

  // 🎯 백그라운드 좌표 생성 함수 (Geocoding API 직접 활용)
  const generateCoordinatesForGuide = useCallback(async (guideId: string, locationName: string) => {
    try {
      console.log(`🗺️ [백그라운드 좌표 생성] 시작: "${locationName}" (guideId: ${guideId})`);
      console.log(`🔍 [백그라운드 좌표 생성] Geocoding API로 정확한 좌표 검색 중...`);
      
      const response = await fetch('/api/ai/generate-coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ [백그라운드 좌표 생성] 성공: ${result.coordinates?.length || 0}개 챕터 좌표 생성 완료`);
        console.log(`🎯 [백그라운드 좌표 생성] 방법: ${result.method || 'Geocoding API 직접 검색'}`);
        console.log(`⏱️ [백그라운드 좌표 생성] 소요시간: ${result.generationTime || 0}ms`);
        // 좌표 생성 완료 후 폴링 시작
        setIsCoordinatesPolling(true);
        pollingAttemptsRef.current = 0;
        pollCoordinates();
        return result.coordinates;
      } else {
        console.error(`❌ [백그라운드 좌표 생성] 실패: ${result.error}`);
        if (result.suggestion) {
          console.log(`💡 [백그라운드 좌표 생성] 제안: ${result.suggestion}`);
        }
        return null;
      }
    } catch (error) {
      console.error(`❌ [백그라운드 좌표 생성] 요청 실패:`, error);
      return null;
    }
  }, [pollCoordinates]);

  // 히스토리 저장 함수
  const saveToHistory = useCallback(async (guideData: GuideData) => {
    try {
      // 로컬 히스토리 저장 (userProfile 매개변수 확인 필요)
      guideHistory.saveGuide(
        guideData.metadata.originalLocationName,
        guideData
      );

      // 로그인한 사용자의 경우 Supabase에도 저장
      if (session?.user) {
        const userProfile: UserProfile = safeUserProfile({
          preferredLanguage: currentLanguage,
          interests: ['여행', '문화'],
          travelStyle: 'cultural' as const
        });

        await saveGuideHistoryToSupabase(session.user, guideData.metadata.originalLocationName, guideData, userProfile);
      }
    } catch (error) {
      console.warn('히스토리 저장 실패:', error);
    }
  }, [session, currentLanguage]);

  // 🌍 언어별 가이드 로드
  const loadGuideForLanguage = useCallback(async (language: SupportedLanguage, forceRegenerate = false, contextualParentRegion?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 🆕 SessionStorage에서 자동완성 데이터 우선 확인
      let enhancedRegionalContext = regionalContext;
      
      if (!forceRegenerate) {
        const autocompleteData = getAutocompleteData(locationName);
        
        if (autocompleteData) {
          console.log('✅ SessionStorage에서 자동완성 데이터 발견:', autocompleteData);
          
          // 자동완성 데이터로 regionalContext 강화
          enhancedRegionalContext = {
            region: autocompleteData.region,
            country: autocompleteData.country,
            countryCode: autocompleteData.countryCode,
            type: autocompleteData.type as 'location' | 'attraction'
          };
          
          console.log('🚀 자동완성 데이터로 지역 컨텍스트 강화:', enhancedRegionalContext);
        } else {
          console.log('📭 SessionStorage에 자동완성 데이터 없음, 기존 방식 사용');
        }
      }

      // 🔄 ${language} 가이드 로드: locationName, { forceRegenerate }

      let result;
      
      if (forceRegenerate) {
        // 강제 재생성
        result = await MultiLangGuideManager.forceRegenerateGuide(
          locationName,
          language,
          undefined,
          contextualParentRegion
        );
      } else {
        // 🚀 스마트 언어 전환 (강화된 regionalContext 포함)
        result = await MultiLangGuideManager.smartLanguageSwitch(
          locationName,
          language,
          undefined,
          contextualParentRegion,
          enhancedRegionalContext // 자동완성 데이터로 강화된 지역 정보 전달
        );
      }

      if (result.success && result.data) {
        // 🔥 핵심: data.data가 실제 가이드 데이터
        const guideResponse = result.data;
        
        // 정규화 함수에 위임 (coordinates 데이터도 전달)
        const normalizedData = normalizeGuideData(guideResponse, locationName);
        
        // coordinates 데이터가 있다면 normalizedData에 추가
        if ((result as any).coordinates) {
          (normalizedData as any).coordinates = (result as any).coordinates;
        }
        
        setGuideData(normalizedData);
        setSource((result as any).source || 'unknown');

        // 히스토리 저장
        await saveToHistory(normalizedData);

        // 🎯 새로운 가이드 생성 시 자동 좌표 생성
        const source = (result as any).source || 'unknown';
        if (source === 'new' && (result as any).guideId) {
          console.log(`🗺️ [가이드 생성 완료] "${locationName}" - 백그라운드 좌표 생성 시작`);
          // 백그라운드에서 좌표 생성 (페이지 렌더링과 독립적)
          generateCoordinatesForGuide((result as any).guideId, locationName).catch(error => {
            console.error('🗺️ [백그라운드 좌표 생성] 자동 시작 실패:', error);
          });
        } else {
          // 기존 가이드인 경우 좌표 확인 후 없으면 폴링 시작
          if (!normalizedData.coordinates || (normalizedData.coordinates as any)?.length === 0) {
            console.log(`🗺️ [기존 가이드] "${locationName}" 좌표 없음 - 백그라운드 생성 상태 확인 시작`);
            setIsCoordinatesPolling(true);
            pollingAttemptsRef.current = 0;
            pollCoordinates();
          }
        }

        // ✅ ${language} 가이드 로드 완료 (source: ${source})
      } else {
        throw new Error((result as any).error?.message || result.error || '가이드 로드 실패');
      }

    } catch (err) {
      console.error('❌ 가이드 로드 오류:', err);
      setError(err instanceof Error ? err.message : '가이드 로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }, [locationName, saveToHistory, regionalContext, generateCoordinatesForGuide, pollCoordinates]); // 좌표 관련 함수들 의존성 추가

  // 🌍 사용 가능한 언어 목록 로드
  const loadAvailableLanguages = useCallback(async () => {
    try {
      const versions = await MultiLangGuideManager.getAllLanguageVersions(locationName);
      if (versions.success && versions.data) {
        setAvailableLanguages(versions.data);
      }
    } catch (error) {
      console.warn('언어 목록 로드 실패:', error);
    }
  }, [locationName]);

  // 🎯 라우팅 분석 함수 (번역 컨텍스트 지원)
  const analyzeRouting = useCallback(async () => {
    try {
      // 세션 스토리지에서 번역 컨텍스트 확인
      let translationContext;
      if (typeof window !== 'undefined') {
        const storedContext = window.sessionStorage.getItem('translationContext');
        if (storedContext) {
          try {
            translationContext = JSON.parse(storedContext);
            console.log('🌐 번역 컨텍스트 발견:', translationContext);
          } catch (e) {
            console.warn('번역 컨텍스트 파싱 실패:', e);
          }
        }
      }
      
      // 🚀 위치 라우팅 분석 시작: locationName (번역 컨텍스트 포함)
      const result = await routeLocationQueryCached(
        locationName, 
        currentLanguage, 
        translationContext
      );
      setRoutingResult(result);
      
      // RegionExploreHub 페이지 여부 결정
      const shouldShowHub = result.pageType === 'RegionExploreHub';
      setShouldShowExploreHub(shouldShowHub);
      
      console.log('📍 라우팅 분석 완료:', { 
        pageType: result.pageType, 
        confidence: result.confidence, 
        showHub: shouldShowHub,
        hasTranslationContext: !!translationContext 
      });
    } catch (error) {
      console.warn('⚠️ 라우팅 분석 실패, 기본 가이드 페이지 사용:', error);
      setShouldShowExploreHub(false);
    }
  }, [locationName, currentLanguage]);

  // 🔄 재생성 함수
  const handleRegenerateGuide = useCallback(async () => {
    setIsRegenerating(true);
    setError(null);
    
    try {
      console.log(`🔄 ${currentLanguage} 가이드 재생성:`, locationName);
      
      await loadGuideForLanguage(currentLanguage, true);
      
      console.log('✅ 가이드 재생성 완료');
    } catch (error) {
      console.error('❌ 재생성 오류:', error);
      setError(error instanceof Error ? error.message : '재생성 중 오류 발생');
    }
  }, [currentLanguage, locationName, loadGuideForLanguage]);

  // 재생성 함수를 전역에 노출 (TourContent에서 사용)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleRegenerateGuide = handleRegenerateGuide;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleRegenerateGuide;
      }
    };
  }, [handleRegenerateGuide]);

  // 🔥 개선된 초기 로드 (라우팅 분석 + 서버-클라이언트 언어 동기화)
  useEffect(() => {
    const initializeGuide = async () => {
      // 🎯 0단계: 세션 스토리지에서 지역 컨텍스트 확인
      let sessionRegionalContext = null;
      if (typeof window !== 'undefined') {
        try {
          const storedContext = sessionStorage.getItem('guideRegionalContext');
          if (storedContext) {
            sessionRegionalContext = JSON.parse(storedContext);
            console.log('🎯 세션 스토리지에서 지역 컨텍스트 발견:', sessionRegionalContext);
            
            // 타임스탬프 체크 (5분 이내의 것만 유효)
            const contextAge = Date.now() - ((sessionRegionalContext as any)?.timestamp || 0);
            if (contextAge > 5 * 60 * 1000) {
              console.log('⚠️ 세션 컨텍스트가 너무 오래됨 - 무시');
              sessionStorage.removeItem('guideRegionalContext');
              sessionRegionalContext = null;
            }
          }
        } catch (e) {
          console.warn('세션 컨텍스트 파싱 실패:', e);
        }
      }

      // 🎯 최종 지역 컨텍스트 결정: URL 우선, 세션 스토리지 보조
      let finalParentRegion = parentRegion;
      if (!finalParentRegion && sessionRegionalContext && 'parentRegion' in sessionRegionalContext) {
        finalParentRegion = (sessionRegionalContext as any).parentRegion;
        console.log('🔄 세션 스토리지의 지역 컨텍스트 사용:', finalParentRegion);
      }

      // 🎯 1단계: 라우팅 분석 먼저 수행
      await analyzeRouting();
      
      // 🎯 2단계: 새로운 언어 우선순위: 
      // 1순위: 서버에서 감지된 언어 (requestedLanguage - 쿠키 기반)
      // 2순위: 현재 헤더 언어 (currentLanguage)
      let targetLanguage: SupportedLanguage;
      
      // 🔥 서버 감지 언어가 있고, 헤더 언어와 같다면 서버 언어 사용
      if (requestedLanguage && requestedLanguage === currentLanguage) {
        targetLanguage = requestedLanguage as SupportedLanguage;
        console.log(`🎯 서버-클라이언트 언어 일치: ${targetLanguage}`);
      } else if (requestedLanguage) {
        // 서버 언어는 있지만 헤더와 다를 때 - 서버 우선 (쿠키 기반)
        targetLanguage = requestedLanguage as SupportedLanguage;
        console.log(`🎯 서버 언어 우선 사용: ${targetLanguage} (헤더: ${currentLanguage})`);
      } else {
        // 서버 언어 없으면 헤더 언어 사용
        targetLanguage = currentLanguage;
        console.log(`🎯 헤더 언어 사용: ${targetLanguage}`);
      }
      
      // 🎯 3단계: 라우팅 결과에 따라 초기 가이드 사용 여부 결정
      // RegionExploreHub일 경우 초기 가이드를 무시하고 새로 로드하지 않음
      if (shouldShowExploreHub) {
        console.log('🏛️ RegionExploreHub 페이지 - 초기 가이드 사용하여 탐색 허브 표시');
        if (initialGuide) {
          try {
            const normalizedData = normalizeGuideData(initialGuide, locationName);
            setGuideData(normalizedData);
            setSource('cache');
            await saveToHistory(normalizedData);
          } catch (error) {
            console.error('초기 가이드 처리 오류:', error);
            // RegionExploreHub는 가이드 데이터 없이도 작동 가능
            setGuideData(null);
          }
        }
        setIsLoading(false);
      } else {
        // 일반 가이드 페이지 처리
        if (initialGuide) {
          console.log('🎯 서버에서 받은 초기 가이드 사용:', initialGuide);
          try {
            // 🔥 핵심: initialGuide를 정규화 함수로 처리
            const normalizedData = normalizeGuideData(initialGuide, locationName);
            setGuideData(normalizedData);
            setSource('cache');
            setIsLoading(false);
            await saveToHistory(normalizedData);
          } catch (error) {
            console.error('초기 가이드 처리 오류:', error);
            // 초기 가이드 처리 실패시 새로 로드
            await loadGuideForLanguage(targetLanguage, false, finalParentRegion);
          }
        } else {
          console.log(`🔄 새로운 가이드 로드 필요 (${targetLanguage})`);
          await loadGuideForLanguage(targetLanguage, false, finalParentRegion);
        }
      }
      
      await loadAvailableLanguages();
    };

    initializeGuide();
  }, [locationName, initialGuide, requestedLanguage, currentLanguage, loadAvailableLanguages, loadGuideForLanguage, saveToHistory, analyzeRouting, parentRegion, shouldShowExploreHub]); // 모든 의존성 추가

  // 🚀 좌표 폴링 시작 로직
  useEffect(() => {
    // 가이드 데이터가 로드되고 좌표가 없을 때 폴링 시작
    if (!isLoading && guideData && !coordinates) {
      // 기존 좌표 데이터 확인 (guideData에서)
      const existingCoordinates = (guideData as any)?.coordinates;
      
      if (existingCoordinates && Array.isArray(existingCoordinates) && existingCoordinates.length > 0) {
        // 이미 좌표가 있으면 상태 업데이트
        console.log(`✅ [기존 좌표 발견] ${existingCoordinates.length}개 챕터 좌표 (백그라운드 생성 완료)`);
        setCoordinates(existingCoordinates);
      } else {
        // 좌표가 없으면 폴링 시작
        console.log('🔍 [좌표 상태 확인] 백그라운드 생성 상태 폴링 시작');
        pollCoordinates();
      }
    }
  }, [isLoading, guideData, coordinates, pollCoordinates]);

  // 🔄 언어 변경 추적용 ref
  const lastLanguageRef = useRef<string | null>(null);
  const hasInitialLoadedRef = useRef(false);

  // 언어 변경 감지 및 자동 로드 (안정화된 버전)
  useEffect(() => {
    // 초기 로드 완료 표시
    if (!isLoading && guideData && !hasInitialLoadedRef.current) {
      hasInitialLoadedRef.current = true;
      const currentGuideLanguage = guideData.metadata?.language || currentLanguage;
      lastLanguageRef.current = currentGuideLanguage;
      console.log(`✅ 초기 로드 완료: ${currentGuideLanguage}`);
      return;
    }

    // 🔥 개선된 언어 변경 감지 (헤더 언어 설정 우선)
    const shouldChangeLanguage = currentLanguage && 
                                hasInitialLoadedRef.current && 
                                !isLoading && 
                                lastLanguageRef.current !== currentLanguage;
    
    // 🎯 핵심: 헤더 언어 설정이 가장 우선
    
    if (shouldChangeLanguage) {
      console.log(`🌍 언어 변경 감지: ${lastLanguageRef.current} → ${currentLanguage}`);
      lastLanguageRef.current = currentLanguage; // 즉시 업데이트하여 중복 방지
      
      // 직접 호출하여 dependency cycle 방지
      (async () => {
        setIsLoading(true);
        setError(null);

        try {
          // 🔄 장소명 번역 처리: URL의 장소명을 한국어로 역번역 후 사용
          let translatedLocationName = locationName;
          
          // 현재 가이드 데이터가 있고 해당 언어가 한국어가 아닌 경우
          if (guideData?.metadata?.language && guideData.metadata.language !== 'ko') {
            const { MicrosoftTranslator } = await import('@/lib/location/microsoft-translator');
            console.log(`🔄 장소명 역번역 시도: ${locationName} (${guideData.metadata.language} → ko)`);
            
            try {
              translatedLocationName = await MicrosoftTranslator.reverseTranslateLocationName(
                locationName, 
                guideData.metadata.language as any
              );
              console.log(`✅ 장소명 역번역 완료: ${locationName} → ${translatedLocationName}`);
            } catch (error) {
              console.error('❌ 장소명 역번역 실패:', error);
              // 실패 시 원본 사용
            }
          }

          // 🎯 언어 변경 시에도 지역 컨텍스트 확인
          let languageChangeParentRegion = parentRegion;
          if (!languageChangeParentRegion && typeof window !== 'undefined') {
            try {
              const storedContext = sessionStorage.getItem('guideRegionalContext');
              if (storedContext) {
                const parsedContext = JSON.parse(storedContext);
                const contextAge = Date.now() - parsedContext.timestamp;
                if (contextAge <= 5 * 60 * 1000) {
                  languageChangeParentRegion = parsedContext.parentRegion;
                }
              }
            } catch (e) {
              console.warn('언어 변경 시 세션 컨텍스트 확인 실패:', e);
            }
          }

          const result = await MultiLangGuideManager.smartLanguageSwitch(
            translatedLocationName,
            currentLanguage,
            undefined,
            languageChangeParentRegion,
            regionalContext // 🌍 언어 변경 시에도 지역정보 전달
          );

          if (result.success && result.data) {
            const normalizedData = normalizeGuideData(result.data, locationName);
            setGuideData(normalizedData);
            setSource((result as any).source || 'unknown');
            await saveToHistory(normalizedData);
            console.log(`✅ ${currentLanguage} 가이드 로드 완료`);
          } else {
            throw new Error((result as any).error?.message || result.error || '가이드 로드 실패');
          }
        } catch (err) {
          console.error('❌ 언어 변경 중 오류:', err);
          setError(err instanceof Error ? err.message : '언어 변경 중 오류가 발생했습니다.');
          // 에러 시 언어 상태 복원
          lastLanguageRef.current = guideData?.metadata?.language || lastLanguageRef.current;
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [currentLanguage, isLoading, guideData, locationName, saveToHistory, parentRegion, regionalContext]); // 모든 의존성 추가

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 mobile-touch-optimized"
           style={{
             padding: 'var(--space-4)'
           }}>
        <GuideLoading 
          type="fetching"
          message={currentLanguage === 'ko' 
            ? `"${locationName || '여행지'}" 가이드 불러오는 중` 
            : `Loading "${locationName || 'destination'}" guide`
          }
          subMessage={currentLanguage === 'ko' ? '다국어 가이드 데이터를 준비하고 있어요...' : 'Preparing multilingual guide data...'}
          showProgress={true}
        />
      </div>
    );
  }

  // 에러 상태 (가이드가 없는 경우)
  if (!guideData || error) {
    return (
      <div className="min-h-screen bg-gray-50 ios-viewport-fix">
        <div className="container-responsive"
             style={{
               padding: 'var(--space-4) var(--space-4) var(--space-16) var(--space-4)'
             }}>
          <div className="text-center">
            <div className="text-fluid-6xl"
                 style={{ marginBottom: 'var(--space-4)' }}>😕</div>
            <h1 className="heading-responsive text-gray-900"
                style={{ marginBottom: 'var(--space-4)' }}>
              {currentLanguage === 'ko' ? '가이드를 찾을 수 없습니다' : 'Guide not found'}
            </h1>
            <p className="body-responsive text-gray-600"
               style={{ marginBottom: 'var(--space-6)' }}>
              {error || (currentLanguage === 'ko' ? 
                '가이드 데이터를 찾을 수 없습니다.' : 'No guide data found.')}
            </p>
            <button
              onClick={handleRegenerateGuide}
              disabled={isRegenerating}
              className="btn-base btn-mobile-friendly bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mobile-touch-action safari-button-reset transition-compat"
              style={{
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {isRegenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {currentLanguage === 'ko' ? '생성 중...' : 'Generating...'}
                </div>
              ) : (
                currentLanguage === 'ko' ? '가이드 생성' : 'Generate Guide'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 정상적인 가이드 렌더링
  return (
    <div className="min-h-screen bg-gray-50 ios-viewport-fix safari-scroll-fix">
      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
          <div>언어: {currentLanguage}</div>
          <div>소스: {source}</div>
          <div>가능한 언어: {availableLanguages.join(', ')}</div>
          <div>챕터 수: {guideData.realTimeGuide?.chapters?.length || 0}</div>
          <div>생성 시간: {guideData.metadata.generatedAt ? new Date(guideData.metadata.generatedAt).toLocaleTimeString() : 'N/A'}</div>
        </div>
      )}

      {/* 오류 알림 (가이드는 있지만 오류가 발생한 경우) */}
      {error && guideData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-yellow-600 underline mt-1 hover:text-yellow-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 좌표 생성 실패 알림 - 재생성 시도 후에만 표시 */}
      {guideData?.coordinateGenerationFailed && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                {currentLanguage === 'ko' ? '지도 정보 제한' : 'Map Information Limited'}
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  {currentLanguage === 'ko' ? (
                    <>
                      AI가 이 위치의 정확한 좌표를 찾지 못했습니다. 
                      {guideData.missingCoordinatesCount && ` (${guideData.missingCoordinatesCount}개 챕터)`}
                      <br />
                      가이드 내용은 정상적으로 이용하실 수 있지만, 지도 기능은 제한될 수 있습니다.
                    </>
                  ) : (
                    <>
                      AI could not find exact coordinates for this location.
                      {guideData.missingCoordinatesCount && ` (${guideData.missingCoordinatesCount} chapters)`}
                      <br />
                      The guide content is available normally, but map functionality may be limited.
                    </>
                  )}
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={handleRegenerateGuide}
                    disabled={isRegenerating}
                    className="bg-orange-50 px-2 py-1.5 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-50 focus:ring-orange-600 disabled:opacity-50"
                  >
                    {isRegenerating ? 
                      (currentLanguage === 'ko' ? '다시 생성 중...' : 'Regenerating...') :
                      (currentLanguage === 'ko' ? '가이드 다시 생성' : 'Regenerate Guide')
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* 메인 가이드 컨텐츠 */}
      <div className="relative">
        {/* 로딩 오버레이 (재생성 중) */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 z-40 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">새로운 가이드를 생성하고 있습니다...</p>
              <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        )}
        
        {/* 🎯 라우팅 결과에 따른 컴포넌트 선택 */}
        {shouldShowExploreHub ? (
          <>
            <RegionExploreHub 
              locationName={locationName}
              routingResult={routingResult}
              language={currentLanguage}
              content={guideData}
            />
            
            {/* 광고 배치: 탐색 허브 하단 */}
            <div className="max-w-4xl mx-auto px-6 py-6">
              <OptimalAdSense 
                placement="guide-content" 
                className="text-center"
              />
            </div>
          </>
        ) : (
          <>
            <MinimalTourContent 
              guide={guideData}
              language={currentLanguage}
              guideCoordinates={coordinates || (guideData as any)?.coordinates}
            />
            
            {/* 광고 배치: 가이드 콘텐츠 하단 */}
            <div className="max-w-4xl mx-auto px-6 py-6">
              <OptimalAdSense 
                placement="guide-content" 
                className="text-center"
              />
            </div>
          </>
        )}
      </div>


      {/* 키보드 단축키 안내 (개발 환경) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded max-w-xs">
          <div className="font-medium mb-2">키보드 단축키</div>
          <div>R: 재생성</div>
          <div>D: 다운로드</div>
          <div>←/→: 챕터 이동</div>
          <div>Space: 오디오 재생/일시정지</div>
          <div>Esc: 뒤로가기</div>
        </div>
      )}
    </div>
  );
}

// 키보드 단축키 처리 (개발 환경)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return; // 입력 필드에서는 단축키 비활성화
    }

    switch (e.key.toLowerCase()) {
      case 'r':
        if (e.ctrlKey || e.metaKey) return; // 브라우저 새로고침과 충돌 방지
        // 재생성 버튼 클릭 시뮬레이션
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) return;
        // 다운로드 버튼 클릭 시뮬레이션
        break;
      case 'escape':
        window.history.back();
        break;
    }
  });
}