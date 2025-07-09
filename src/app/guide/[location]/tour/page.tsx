'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// 🔥 강력한 디버깅: 페이지 로드 확인
console.log('🚀 TourPage 파일 로드됨!');

// 동적 임포트로 클라이언트 전용 컴포넌트 로드
const TourContent = dynamic(() => import('./components/TourContent'), {
  ssr: false,
  loading: () => {
    console.log('⏳ TourContent 동적 로딩 중...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            콘텐츠 로딩 중...
          </h2>
        </div>
      </div>
    );
  }
});

export default function TourPage() {
  console.log('🎬 TourPage 컴포넌트 렌더링 시작!');
  
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [guideContent, setGuideContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locationName = params.location ? decodeURIComponent(params.location as string) : '';
  
  console.log('📍 URL 파라미터:', { params, locationName });

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

      console.log(`🚀 가이드 데이터 조회 시작: ${locationName}`);
      setIsLoading(true);
      setError(null);

      try {
        // 단일 엔드포인트로 통일: DB 조회+생성 모두 처리
        const response = await fetch('/api/node/ai/generate-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationName, language: 'ko', userProfile }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '가이드 생성에 실패했습니다.');
        }

        const data = await response.json();
        const content = data?.content;
        if (content) {
          setGuideContent(content);
        } else {
          console.error('❌ Failed to extract guide content from response:', data);
          setError(data.error || 'Failed to load guide data.');
        }
      } catch (err: any) {
        console.error('❌ 가이드 데이터 요청 오류:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuideData();
  }, [locationName, userProfile]);



  if (isLoading || !isMounted) {
    console.log('⏳ 아직 마운트되지 않음, 로딩 화면 표시');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            가이드 생성 중...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!guideContent) {
    // 이 상태는 보통 로딩중에 잠깐 보이거나, 데이터가 없을 때 표시됩니다.
    return null;
  }

  console.log('✅ 데이터 로드 완료, TourContent 렌더링!', { guideContent });

  return <TourContent guideContent={guideContent} />;
}