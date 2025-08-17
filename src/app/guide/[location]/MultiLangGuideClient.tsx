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
import { parseSupabaseCoordinates, validateCoordinates } from '@/lib/coordinates/coordinate-common';

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

  // 🔗 좌표 데이터 보존 (다양한 경로에서 coordinates 찾기)
  const preserveCoordinates = () => {
    // 1. 원본 data에서 직접 coordinates 찾기
    if (data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
      console.log(`🎯 [좌표 보존] 원본 data에서 ${data.coordinates.length}개 좌표 발견`);
      return data.coordinates;
    }
    
    // 2. sourceData에서 coordinates 찾기  
    if (sourceData.coordinates && Array.isArray(sourceData.coordinates) && sourceData.coordinates.length > 0) {
      console.log(`🎯 [좌표 보존] sourceData에서 ${sourceData.coordinates.length}개 좌표 발견`);
      return sourceData.coordinates;
    }
    
    // 3. data.content에서 coordinates 찾기
    if (data.content?.coordinates && Array.isArray(data.content.coordinates) && data.content.coordinates.length > 0) {
      console.log(`🎯 [좌표 보존] data.content에서 ${data.content.coordinates.length}개 좌표 발견`);
      return data.content.coordinates;
    }
    
    console.log('🔍 [좌표 보존] coordinates를 찾을 수 없음');
    return null;
  };

  const coordinates = preserveCoordinates();
  if (coordinates) {
    (normalizedData as any).coordinates = coordinates;
  }

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
  
  // 🚀 좌표 상태 관리 (폴링 제거)
  const [coordinates, setCoordinates] = useState<any>(null);

  // 🔍 DB 좌표 조회 함수 - 의존성 최적화
  const checkDatabaseCoordinates = useCallback(async () => {
    const targetLocationName = guideData?.metadata?.originalLocationName || locationName;
    
    if (!targetLocationName || !currentLanguage) {
      return null;
    }

    try {
      const normLocation = normalizeLocationName(targetLocationName);
      
      const { data: fullData, error: fullError } = await supabase
        .from('guides')
        .select('id, locationname, language, coordinates')
        .eq('locationname', normLocation)
        .eq('language', currentLanguage.toLowerCase())
        .maybeSingle();

      if (fullError || !fullData?.coordinates) {
        return null;
      }

      // 좌표 검증
      const validation = validateCoordinates(fullData.coordinates);
      if (!validation.isValid) {
        return null;
      }

      console.log(`✅ [DB 조회] coordinates 발견: ${validation.count}개`);
      return fullData.coordinates;
    } catch (error) {
      console.error('❌ [DB 조회] 예외:', error);
      return null;
    }
  }, [locationName, currentLanguage, guideData?.metadata?.originalLocationName]);


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

  // 🌍 언어별 가이드 로드 - 의존성 최적화
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
          console.log('📭 SessionStorage에 자동완성 데이터 없음, Gemini API로 실시간 추출 시도');
          
          // 🚀 실시간 Gemini API 호출로 지역정보 추출
          try {
            console.log('🤖 실시간 Gemini API 지역정보 추출 시작:', locationName);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃 (가이드 페이지용)
            
            const geminiResponse = await fetch('/api/locations/extract-regional-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                placeName: locationName,
                language: language,
                detailed: false // DB용 간소화 정보만 요청
              }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            const geminiData = await geminiResponse.json();
            console.log('🤖 실시간 Gemini API 응답:', geminiData);

            if (geminiData?.success && geminiData?.data?.region && geminiData?.data?.countryCode) {
              // Gemini API로 추출된 정확한 지역정보 사용 (필수 필드 검증)
              enhancedRegionalContext = {
                region: geminiData.data.region,
                country: geminiData.data.country || '동적추출',
                countryCode: geminiData.data.countryCode,
                type: 'attraction'
              };
              
              console.log('✅ 실시간 Gemini로 지역 컨텍스트 생성:', enhancedRegionalContext);
            } else {
              console.warn('⚠️ 실시간 Gemini API 응답 무효:', {
                success: geminiData?.success,
                hasData: !!geminiData?.data,
                hasRegion: !!geminiData?.data?.region,
                hasCountryCode: !!geminiData?.data?.countryCode
              });
              console.log('🔄 기존 방식으로 폴백');
            }
          } catch (geminiError) {
            if (geminiError instanceof Error && geminiError.name === 'AbortError') {
              console.warn('⏰ 실시간 Gemini API 타임아웃 (8초), 기존 방식 사용');
            } else {
              console.warn('❌ 실시간 Gemini API 오류:', geminiError);
            }
            console.log('🔄 기존 방식으로 폴백');
          }
        }
      }

      let result;
      
      if (forceRegenerate) {
        // 강제 재생성 + 타임아웃 처리
        const forceRegeneratePromise = MultiLangGuideManager.forceRegenerateGuide(
          locationName,
          language,
          undefined,
          contextualParentRegion
        );

        const regenerateTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('가이드 재생성 요청 시간 초과 (60초)')), 60000)
        );

        result = await Promise.race([forceRegeneratePromise, regenerateTimeoutPromise]) as any;
      } else {
        // 🚀 스마트 언어 전환 (강화된 regionalContext 포함) + 타임아웃 처리
        const smartSwitchPromise = MultiLangGuideManager.smartLanguageSwitch(
          locationName,
          language,
          undefined,
          contextualParentRegion,
          enhancedRegionalContext // 자동완성 데이터로 강화된 지역 정보 전달
        );

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('가이드 로드 요청 시간 초과 (45초)')), 45000)
        );

        result = await Promise.race([smartSwitchPromise, timeoutPromise]) as any;
      }

      if (result.success && result.data) {
        // 🔥 핵심: data.data가 실제 가이드 데이터
        const guideResponse = result.data;
        
        // 🔍 [디버깅] result 전체 구조 확인
        console.log('🔍 [result 구조 분석]', {
          hasResult: !!result,
          resultKeys: Object.keys(result),
          hasData: !!result.data,
          hasCoordinates: !!(result as any).coordinates,
          coordinatesType: typeof (result as any).coordinates,
          coordinatesLength: Array.isArray((result as any).coordinates) ? (result as any).coordinates.length : 'Not array',
          resultStructure: result
        });
        
        // 정규화 함수에 위임 (coordinates 데이터도 전달)
        const normalizedData = normalizeGuideData(guideResponse, locationName);
        
        // coordinates 데이터가 있다면 normalizedData에 추가
        if ((result as any).coordinates) {
          console.log(`🔗 [좌표 연결] MultiLangGuideManager에서 받은 좌표 데이터:`, {
            coordinatesType: typeof (result as any).coordinates,
            coordinatesLength: Array.isArray((result as any).coordinates) ? (result as any).coordinates.length : 'Not array',
            coordinatesPreview: (result as any).coordinates
          });
          (normalizedData as any).coordinates = (result as any).coordinates;
        } else {
          console.warn('⚠️ [좌표 누락] MultiLangGuideManager에서 coordinates가 없음');
        }
        
        setGuideData(normalizedData);
        
        // 🎯 핵심: guideData 설정과 동시에 coordinates도 즉시 설정 (지도 즉시 표시)
        const parsedCoordinates = parseSupabaseCoordinates(normalizedData.coordinates);
        if (parsedCoordinates.length > 0) {
          console.log(`🔥 [즉시 설정] guideData 로드와 함께 coordinates 설정: ${parsedCoordinates.length}개 - 지도 즉시 표시`);
          setCoordinates(normalizedData.coordinates); // 원본 데이터 그대로 전달 (파싱은 컴포넌트에서)
        }
        setSource((result as any).source || 'unknown');

        // 히스토리 저장
        await saveToHistory(normalizedData);

        // 🎯 좌표 상태 설정 - AI 생성 시 이미 포함된 좌표 사용 (공통 유틸리티 검증)
        const coordinateValidation = validateCoordinates(normalizedData.coordinates);
        
        if (coordinateValidation.isValid) {
          console.log(`✅ [좌표 존재] "${locationName}" - ${coordinateValidation.count}개 좌표`);
          setCoordinates(normalizedData.coordinates);
        } else {
          console.log(`📍 [좌표 없음] "${locationName}" - 기본 지도 표시`);
        }
        
      } else {
        throw new Error((result as any).error?.message || result.error || '가이드 로드 실패');
      }

    } catch (err) {
      console.error('❌ 가이드 로드 오류:', err);
      
      // 🚨 에러 타입별 상세 처리
      let errorMessage = '가이드 로드 중 오류가 발생했습니다.';
      if (err instanceof Error) {
        if (err.message.includes('시간 초과')) {
          errorMessage = '가이드 생성에 시간이 오래 걸리고 있습니다. 새로고침하거나 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('네트워크') || err.message.includes('fetch')) {
          errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
        } else if (err.message.includes('NOT_FOUND')) {
          errorMessage = '해당 위치의 가이드를 찾을 수 없습니다. 새로 생성하겠습니다.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }, [locationName, regionalContext, saveToHistory]); // 🔥 의존성 최소화

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

  // 🔄 재생성 함수 - 의존성 최적화 + 무한 재시도 방지
  const regenerateRetryCountRef = useRef(0);
  const maxRetries = 3;
  
  const handleRegenerateGuide = useCallback(async () => {
    setIsRegenerating(true);
    setError(null);
    
    try {
      console.log(`🔄 ${currentLanguage} 가이드 재생성:`, locationName);
      
      // TODO(human): 무한 재시도 방지 로직 구현
      // 재시도 횟수 제한과 백오프 전략 추가
      
      await loadGuideForLanguage(currentLanguage, true);
      
      // 성공 시 재시도 카운터 리셋
      regenerateRetryCountRef.current = 0;
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

  // 🔥 개선된 초기 로드 - 의존성 최적화로 무한 루프 방지
  useEffect(() => {
    const initializeGuide = async () => {
      // 🎯 0단계: 세션 스토리지에서 지역 컨텍스트 확인
      let sessionRegionalContext = null;
      if (typeof window !== 'undefined') {
        try {
          const storedContext = sessionStorage.getItem('guideRegionalContext');
          if (storedContext) {
            sessionRegionalContext = JSON.parse(storedContext);
            
            // 타임스탬프 체크 (5분 이내의 것만 유효)
            const contextAge = Date.now() - ((sessionRegionalContext as any)?.timestamp || 0);
            if (contextAge > 5 * 60 * 1000) {
              sessionStorage.removeItem('guideRegionalContext');
              sessionRegionalContext = null;
            }
          }
        } catch (e) {
          console.warn('세션 컨텍스트 파싱 실패:', e);
        }
      }

      // 🎯 최종 지역 컨텍스트 결정
      let finalParentRegion = parentRegion;
      if (!finalParentRegion && sessionRegionalContext && 'parentRegion' in sessionRegionalContext) {
        finalParentRegion = (sessionRegionalContext as any).parentRegion;
      }

      // 🎯 1단계: 라우팅 분석
      await analyzeRouting();
      
      // 🎯 2단계: 언어 결정
      let targetLanguage: SupportedLanguage;
      
      if (requestedLanguage && requestedLanguage === currentLanguage) {
        targetLanguage = requestedLanguage as SupportedLanguage;
      } else if (requestedLanguage) {
        targetLanguage = requestedLanguage as SupportedLanguage;
      } else {
        targetLanguage = currentLanguage;
      }
      
      // 🎯 3단계: 가이드 처리
      if (shouldShowExploreHub) {
        if (initialGuide) {
          try {
            const normalizedData = normalizeGuideData(initialGuide, locationName);
            setGuideData(normalizedData);
            setSource('cache');
            await saveToHistory(normalizedData);
          } catch (error) {
            console.error('초기 가이드 처리 오류:', error);
            setGuideData(null);
          }
        }
        setIsLoading(false);
      } else {
        if (initialGuide) {
          try {
            const normalizedData = normalizeGuideData(initialGuide, locationName);
            setGuideData(normalizedData);
            setSource('cache');
            setIsLoading(false);
            await saveToHistory(normalizedData);
          } catch (error) {
            console.error('초기 가이드 처리 오류:', error);
            await loadGuideForLanguage(targetLanguage, false, finalParentRegion);
          }
        } else {
          await loadGuideForLanguage(targetLanguage, false, finalParentRegion);
        }
      }
      
      await loadAvailableLanguages();
    };

    initializeGuide();
  }, [locationName, initialGuide, requestedLanguage, currentLanguage, parentRegion]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🎯 좌표 상태 확인 - 즉시 지도 표시를 위한 상태 동기화 최적화
  useEffect(() => {
    if (!isLoading && guideData && !coordinates) {
      // 🔍 guideData 구조 디버깅
      console.log('🔍 [guideData 구조 분석]:', {
        hasGuideData: !!guideData,
        topLevelKeys: Object.keys(guideData || {}),
        hasCoordinatesTop: !!(guideData as any)?.coordinates,
        coordinatesAtTop: (guideData as any)?.coordinates,
        hasMetadata: !!(guideData as any)?.metadata,
        hasRealTimeGuide: !!(guideData as any)?.realTimeGuide,
        fullGuideData: guideData
      });
      
      const existingCoordinates = (guideData as any)?.coordinates;
      const coordinateValidation = validateCoordinates(existingCoordinates);
      
      if (coordinateValidation.isValid) {
        console.log(`✅ [기존 좌표 발견] ${coordinateValidation.count}개 좌표 - 지도 즉시 표시`);
        setCoordinates(existingCoordinates);
      } else {
        console.warn('❌ [좌표 없음] guideData에서 coordinates를 찾을 수 없음');
        // 데이터베이스에서 좌표 조회 시도
        (async () => {
          try {
            console.log('🔍 [좌표 조회] 데이터베이스에서 좌표 검색 시작...');
            const dbCoordinates = await checkDatabaseCoordinates();
            const dbValidation = validateCoordinates(dbCoordinates);
            
            if (dbValidation.isValid) {
              console.log(`✅ [DB 좌표 발견] ${dbValidation.count}개 좌표 로드 성공`);
              setCoordinates(dbCoordinates);
            } else {
              console.warn('❌ [DB 좌표 없음] 데이터베이스에서도 좌표를 찾을 수 없음');
            }
          } catch (error) {
            console.error('❌ [좌표 조회 실패] 데이터베이스 좌표 조회 중 오류:', error);
          }
        })();
      }
    }
  }, [isLoading, guideData, coordinates, checkDatabaseCoordinates]); // 의존성 추가

  // 🔍 coordinates 상태 변경 모니터링 - 로깅 간소화 (공통 유틸리티 사용)
  useEffect(() => {
    const validation = validateCoordinates(coordinates);
    if (validation.isValid) {
      console.log(`🔄 [좌표 업데이트] ${validation.count}개 좌표`);
    }
  }, [coordinates]); // 단순화된 로깅

  // 🔄 언어 변경 추적용 ref
  const lastLanguageRef = useRef<string | null>(null);
  const hasInitialLoadedRef = useRef(false);
  const languageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 디바운싱된 언어 변경 처리 함수 (타임아웃 및 에러 경계 포함)
  const debouncedLanguageChange = useCallback(async (newLanguage: string) => {
    console.log(`🌍 디바운싱된 언어 변경 실행: ${lastLanguageRef.current} → ${newLanguage}`);
    
    setIsLoading(true);
    setError(null);

    try {
      // 🔄 장소명 번역 처리 (guideData 의존성 없이)
      let translatedLocationName = locationName;

      // 🎯 언어 변경 시 지역 컨텍스트 확인
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

      // 🚨 타임아웃 처리 추가 (30초)
      const languageChangePromise = MultiLangGuideManager.smartLanguageSwitch(
        translatedLocationName,
        newLanguage,
        undefined,
        languageChangeParentRegion,
        regionalContext
      );

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('언어 변경 요청 시간 초과 (30초)')), 30000)
      );

      const result = await Promise.race([languageChangePromise, timeoutPromise]) as any;

      if (result.success && result.data) {
        const normalizedData = normalizeGuideData(result.data, locationName);
        setGuideData(normalizedData);
        setSource((result as any).source || 'unknown');
        await saveToHistory(normalizedData);
        console.log(`✅ ${newLanguage} 가이드 로드 완료`);
      } else {
        throw new Error((result as any).error?.message || result.error || '가이드 로드 실패');
      }
    } catch (err) {
      console.error('❌ 언어 변경 중 오류:', err);
      
      // 🚨 에러 타입별 처리
      let errorMessage = '언어 변경 중 오류가 발생했습니다.';
      if (err instanceof Error) {
        if (err.message.includes('시간 초과')) {
          errorMessage = '가이드 생성에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('네트워크')) {
          errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      // 에러 시 언어 상태 복원
      lastLanguageRef.current = lastLanguageRef.current;
    } finally {
      setIsLoading(false);
    }
  }, [locationName, parentRegion, regionalContext, saveToHistory]);

  // 언어 변경 감지 및 디바운싱 처리 - 무한 루프 완전 방지 버전
  useEffect(() => {
    // 초기 로드 완료 표시 (guideData 의존성 없이 처리)
    if (!isLoading && !hasInitialLoadedRef.current) {
      hasInitialLoadedRef.current = true;
      lastLanguageRef.current = currentLanguage;
      console.log(`✅ 초기 로드 완료: ${currentLanguage}`);
      return;
    }

    // 🔥 순환 참조 방지: guideData 의존성 제거하고 ref로 추적
    const shouldChangeLanguage = currentLanguage && 
                                hasInitialLoadedRef.current && 
                                !isLoading && 
                                !isRegenerating && // 재생성 중이 아닐 때만
                                lastLanguageRef.current !== currentLanguage; // 언어가 실제로 변경되었을 때만
    
    if (shouldChangeLanguage) {
      console.log(`🌍 언어 변경 감지 (디바운싱): ${lastLanguageRef.current} → ${currentLanguage}`);
      lastLanguageRef.current = currentLanguage; // 즉시 업데이트하여 중복 방지
      
      // 🎯 기존 타임아웃 취소
      if (languageChangeTimeoutRef.current) {
        clearTimeout(languageChangeTimeoutRef.current);
      }
      
      // 🎯 300ms 디바운싱 적용
      languageChangeTimeoutRef.current = setTimeout(() => {
        debouncedLanguageChange(currentLanguage);
      }, 300);
    }

    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (languageChangeTimeoutRef.current) {
        clearTimeout(languageChangeTimeoutRef.current);
      }
    };
  }, [currentLanguage, isLoading, isRegenerating, debouncedLanguageChange]); // 🔥 의존성 최소화

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

  // 에러 상태 (로딩 완료했는데 가이드가 없거나 명시적 에러)
  if ((!isLoading && !guideData) || error) {
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
          <div>챕터 수: {guideData?.realTimeGuide?.chapters?.length || 0}</div>
          <div>생성 시간: {guideData?.metadata?.generatedAt ? new Date(guideData.metadata.generatedAt).toLocaleTimeString() : 'N/A'}</div>
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
            {(() => {
              console.log('🔍 RegionExploreHub에 전달되는 데이터:', {
                guideData,
                coordinates: guideData?.coordinates,
                coordinatesType: typeof guideData?.coordinates,
                coordinatesIsArray: Array.isArray(guideData?.coordinates),
                coordinatesLength: guideData?.coordinates?.length,
                coordinatesFirstItem: guideData?.coordinates?.[0]
              });
              return null;
            })()}
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
              guide={guideData!}
              language={currentLanguage}
              guideCoordinates={(() => {
                const coordsToUse = coordinates || (guideData as any)?.coordinates;
                console.log('🎯 [TourContent 전달] guideCoordinates:', {
                  fromCoordinatesState: !!coordinates,
                  coordinatesLength: Array.isArray(coordinates) ? coordinates.length : null,
                  fromGuideData: !!(guideData as any)?.coordinates,
                  guideDataCoordsLength: Array.isArray((guideData as any)?.coordinates) ? (guideData as any).coordinates.length : null,
                  finalCoords: !!coordsToUse,
                  finalCoordsLength: Array.isArray(coordsToUse) ? coordsToUse.length : null,
                  finalCoordsPreview: Array.isArray(coordsToUse) ? coordsToUse.slice(0, 2) : coordsToUse
                });
                return coordsToUse;
              })()}
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