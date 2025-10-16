// src/app/test-guide-simple/page.tsx - 간단한 가이드 페이지 테스트
"use client";

import { useState } from 'react';

// 간단한 테스트 데이터
const sampleGuideData = {
  content: {
    route: {
      steps: [
        { step: 1, title: "광화문", location: "광화문" },
        { step: 2, title: "근정전", location: "근정전" }
      ]
    },
    overview: {
      title: "경복궁",
      location: "서울 종로구",
      keyFeatures: "조선 법궁 건축",
      background: "조선 왕조의 정궁"
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "광화문 테스트",
          narrative: "테스트 내용입니다.",
          coordinates: { lat: 37.5758, lng: 126.9766 }
        }
      ]
    }
  }
};

export default function TestGuideSimplePage() {
  const [error, setError] = useState<string | null>(null);

  try {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">간단한 가이드 테스트</h1>
        
        <div className="mb-4">
          <strong>테스트 데이터:</strong>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-sm">
            {JSON.stringify(sampleGuideData, null, 2)}
          </pre>
        </div>

        <div className="mb-4">
          <strong>상태:</strong> 컴포넌트가 정상적으로 렌더링되었습니다.
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>오류:</strong> {error}
          </div>
        )}
      </div>
    );
  } catch (err) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">오류 발생!</h1>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>캐치된 오류:</strong> {(err as any)?.message || '알 수 없는 오류'}
        </div>
      </div>
    );
  }
}