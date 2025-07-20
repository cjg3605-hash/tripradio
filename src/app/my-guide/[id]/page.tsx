"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import GuideLoading from '@/components/ui/GuideLoading';

// MinimalTourContent를 동적 import (서버 fetch 방지)
const MinimalTourContent = dynamic(() => import("../../guide/[location]/tour/components/TourContent"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <GuideLoading 
        type="loading"
        message="저장된 가이드 로딩 중"
        subMessage="가이드를 불러오고 있어요..."
        showProgress={true}
      />
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
    console.log('✅ content 필드에서 데이터 추출');
  }
  // data가 직접 overview, route, realTimeGuide를 가지면 직접 사용
  else if (data.overview || data.route || data.realTimeGuide) {
    sourceData = data;
    console.log('✅ 직접 구조에서 데이터 추출');
  }
  else {
    console.error('❌ 올바른 가이드 구조를 찾을 수 없음:', Object.keys(data));
    throw new Error('올바른 가이드 데이터 구조가 아닙니다.');
  }

  // 🔥 정규화된 GuideData 생성
  const normalizedData = {
    overview: {
      title: sourceData.overview?.title || locationName,
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
    metadata: {
      originalLocationName: locationName,
      generatedAt: sourceData.metadata?.generatedAt || new Date().toISOString(),
      version: sourceData.metadata?.version || '1.0',
      language: sourceData.metadata?.language || 'ko',
      ...sourceData.metadata
    }
  };

  // 🔥 챕터 ID 정규화 (타입 요구사항 충족)
  if (normalizedData.realTimeGuide?.chapters) {
    normalizedData.realTimeGuide.chapters = normalizedData.realTimeGuide.chapters.map((chapter, index) => {
      // 🔥 챕터 데이터 정규화: 3개 필드를 narrative로 통합
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

  return normalizedData;
};

export default function MyGuidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const [guide, setGuide] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    
    try {
      const guides = JSON.parse(localStorage.getItem("myGuides") || "[]");
      const found = guides.find((g: any) => encodeURIComponent(g.metadata?.originalLocationName) === params.id);
      
      if (found) {
        // 🔥 핵심: 저장된 가이드 데이터 정규화
        const locationName = found.metadata?.originalLocationName || 'Unknown Location';
        const normalizedGuide = normalizeGuideData(found, locationName);
        setGuide(normalizedGuide);
      } else {
        setError('저장된 가이드를 찾을 수 없습니다.');
      }
    } catch (e) {
      console.error('가이드 로드 오류:', e);
      setError('가이드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <GuideLoading 
          type="loading"
          message="마이 가이드 로딩 중"
          subMessage="저장된 가이드를 불러오고 있어요..."
          showProgress={true}
        />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">가이드를 찾을 수 없습니다</h2>
            <p className="text-gray-600 text-sm mb-6">
              {error || '요청하신 가이드가 존재하지 않습니다.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/")}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                홈으로
              </button>
              <button
                onClick={() => router.push("/mypage")}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                내 가이드
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <MinimalTourContent guide={guide} language={currentLanguage} />;
}