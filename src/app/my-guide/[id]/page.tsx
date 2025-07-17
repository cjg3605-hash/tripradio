"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from '@/contexts/LanguageContext';

// MinimalTourContent를 동적 import (서버 fetch 방지)
const MinimalTourContent = dynamic(() => import("../../guide/[location]/tour/components/TourContent"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">가이드 로딩 중</h2>
          <p className="text-gray-600 text-sm">저장된 가이드를 불러오는 중입니다...</p>
        </div>
      </div>
    </div>
  )
});

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
        setGuide(found);
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
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">로딩 중</h2>
            <p className="text-gray-600 text-sm">저장된 가이드를 불러오는 중입니다...</p>
          </div>
        </div>
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