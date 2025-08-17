'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import QualityFeedback from '@/components/QualityFeedback';

// 동적 임포트로 클라이언트 전용 컴포넌트 로드
const MinimalTourContent = dynamic(() => import('./components/TourContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">콘텐츠 로딩 중</h2>
          <p className="text-gray-600 text-sm">잠시만 기다려주세요...</p>
        </div>
      </div>
    </div>
  )
});

// 🔥 핵심: 정규화 함수 추가
const normalizeGuideData = (data: any, locationName: string) => {
  if (!data) {
    throw new Error('가이드 데이터가 없습니다.');
  }

  // 🔥 핵심: content 래핑 구조 올바른 처리
  let sourceData = data;
  
  // data.content가 있으면 그것을 사용 (가장 일반적인 케이스)
  if (data.content && typeof data.content === 'object') {
    sourceData = data.content;
    console.log('📦 content 필드에서 데이터 추출');
  }
  // data가 직접 overview, route, realTimeGuide를 가지면 직접 사용
  else if (data.overview || data.route || data.realTimeGuide) {
    sourceData = data;
    console.log('📦 직접 구조에서 데이터 추출');
  }
  else {
    console.error('❌ 올바른 가이드 구조를 찾을 수 없음:', Object.keys(data));
    throw new Error('올바른 가이드 데이터 구조가 아닙니다.');
  }

  // 🔍 mustVisitSpots 데이터 추적
  console.log('🎯 normalizeGuideData에서 sourceData 확인:', {
    hasSourceData: !!sourceData,
    sourceDataKeys: Object.keys(sourceData || {}),
    sourceMustVisitSpots: sourceData?.mustVisitSpots,
    keyHighlights: sourceData?.keyHighlights
  });

  //  정규화된 GuideData 생성
  const normalizedData = {
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
    mustVisitSpots: sourceData.mustVisitSpots || sourceData.keyHighlights || sourceData.highlights || '', // 필수관람포인트 추가 (백업 필드들 포함)
    metadata: {
      originalLocationName: locationName,
      generatedAt: sourceData.metadata?.generatedAt || new Date().toISOString(),
      version: sourceData.metadata?.version || '1.0',
      language: sourceData.metadata?.language || 'ko',
      ...sourceData.metadata
    }
  };

  //  챕터 ID 정규화 (타입 요구사항 충족)
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
  console.log('🎯 normalizeGuideData 최종 결과:', {
    hasMustVisitSpots: !!normalizedData.mustVisitSpots,
    mustVisitSpots: normalizedData.mustVisitSpots,
    mustVisitSpotsType: typeof normalizedData.mustVisitSpots,
    mustVisitSpotsLength: normalizedData.mustVisitSpots?.length
  });

  return normalizedData;
};

export default function TourPage() {
  const params = useParams();
  const { currentLanguage } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [guideContent, setGuideContent] = useState<any>(null);
  const [guideCoordinates, setGuideCoordinates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideId, setGuideId] = useState<string>('');
  const [key, setKey] = useState<number>(0); // 강제 리렌더링용

  const locationName = params.location ? decodeURIComponent(params.location as string) : '';

  const userProfile = useMemo(() => ({
    interests: ['문화', '역사'],
    knowledgeLevel: '중급',
    ageGroup: '30대',
    preferredStyle: '친근함'
  }), []);

  useEffect(() => {
    setIsMounted(true);
    const fetchGuideData = async () => {
      if (!locationName) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 tour/page.tsx DB 조회 시작:', locationName);
        
        // 🎯 DB에서 직접 조회 (live/page.tsx와 동일한 방식)
        const { supabase } = await import('@/lib/supabaseClient');
        
        // 🌐 다국어 장소명 처리: 현재 언어가 한국어가 아니면 한국어로 역번역
        let dbLocationName = locationName;
        if (currentLanguage !== 'ko') {
          try {
            const { MicrosoftTranslator } = await import('@/lib/location/microsoft-translator');
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
        
        const { data, error: dbError } = await supabase
          .from('guides')
          .select('id, content, coordinates')
          .eq('locationname', normalizedLocation)
          .eq('language', currentLanguage)
          .maybeSingle();
        
        if (dbError) {
          console.error('DB 조회 오류:', dbError);
          setError('가이드 데이터 조회 실패');
          return;
        }
        
        if (data?.content) {
          console.log('🗄️ DB에서 데이터 로드 성공');
          
          // coordinates 칼럼 데이터 검증 및 전달
          if (data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
            console.log(`📍 coordinates 칼럼에서 ${data.coordinates.length}개 좌표 발견`);
            setGuideCoordinates(data.coordinates);
          } else {
            console.warn('⚠️ coordinates 칼럼이 비어있음 또는 유효하지 않음');
            setGuideCoordinates(null);
          }
          
          // 핵심: 정규화된 데이터로 설정
          const normalizedContent = normalizeGuideData(data.content, locationName);
          console.log('🔍 정규화된 데이터:', normalizedContent);
          console.log('🔍 정규화된 mustVisitSpots:', normalizedContent.mustVisitSpots);
          setGuideContent(normalizedContent);
          
          // 품질 피드백을 위한 고유 ID 생성 (실제 DB ID 사용)
          const uniqueId = data.id || `${locationName}_${currentLanguage}_${Date.now()}`;
          setGuideId(uniqueId);
          
          // 강제 리렌더링을 위한 key 업데이트
          setKey(prev => prev + 1);
        } else {
          console.error('❌ DB에 해당 가이드 데이터가 없음');
          setError('해당 위치의 가이드 데이터가 없습니다. 먼저 가이드를 생성해주세요.');
        }
      } catch (err: any) {
        console.error('❌ 가이드 데이터 요청 오류:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuideData();
  }, [locationName, userProfile, currentLanguage]);

  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">가이드 로딩 중</h2>
            <p className="text-gray-600 text-sm">가이드를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                이전 페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!guideContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-xl">?</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">데이터 없음</h2>
            <p className="text-gray-600 text-sm mb-6">가이드 데이터를 찾을 수 없습니다.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFeedbackSubmit = (feedback: any) => {
    console.log('📝 품질 피드백 받음:', feedback);
    // 피드백 처리 로직은 QualityFeedback 컴포넌트에서 API 호출로 처리됨
  };

  return (
    <>
      <MinimalTourContent 
        key={key}
        guide={guideContent} 
        language={currentLanguage}
        guideCoordinates={guideCoordinates}
      />
      
      {/* 🎯 품질 피드백 시스템 통합 */}
      {guideContent && guideId && (
        <QualityFeedback
          key={`feedback-${key}`}
          guideId={guideId}
          locationName={locationName}
          onFeedbackSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}