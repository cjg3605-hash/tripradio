'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function TourPage() {
  const params = useParams();
  const { currentLanguage } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [guideContent, setGuideContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              다시 시도
            </button>
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

  return <MinimalTourContent guide={guideContent} language={currentLanguage} />;
}