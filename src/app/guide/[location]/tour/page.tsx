'use client';

import { useState, useEffect } from 'react';
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

  const locationName = params.location ? decodeURIComponent(params.location as string) : '';
  
  console.log('📍 URL 파라미터:', { params, locationName });

  // Hydration 완료 감지
  useEffect(() => {
    console.log('🔄 useEffect: isMounted 설정');
    setIsMounted(true);
  }, []);

  // 기본 사용자 프로필
  const userProfile = {
    interests: ['문화', '역사'],
    knowledgeLevel: '중급',
    ageGroup: '30대',
    preferredStyle: '친근함'
  };

  // 서버 사이드에서는 기본 로딩 화면만 렌더링
  if (!isMounted) {
    console.log('⏳ 아직 마운트되지 않음, 로딩 화면 표시');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            페이지 초기화 중...
          </h2>
        </div>
      </div>
    );
  }

  console.log('✅ 마운트 완료, TourContent 렌더링!', { locationName, userProfile });

  return (
    <TourContent
      locationName={locationName}
      userProfile={userProfile}
    />
  );
} 