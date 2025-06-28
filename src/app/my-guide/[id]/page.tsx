"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// TourContent를 동적 import (서버 fetch 방지)
const TourContent = dynamic(() => import("../../guide/[location]/tour/components/TourContent"), { ssr: false });

export default function MyGuidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guide, setGuide] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    try {
      const guides = JSON.parse(localStorage.getItem("myGuides") || "[]");
      const found = guides.find((g: any) => encodeURIComponent(g.metadata?.originalLocationName) === params.id);
      if (found) {
        setGuide(found);
      } else {
        alert("오프라인 가이드 데이터를 찾을 수 없습니다.");
        router.push("/mypage");
      }
    } catch (e) {
      alert("오프라인 가이드 데이터를 불러오는 중 오류가 발생했습니다.");
      router.push("/mypage");
    } finally {
      setLoading(false);
    }
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">로딩 중...</div>
    );
  }
  if (!guide) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <TourContent locationName={guide.metadata?.originalLocationName} userProfile={guide.userProfile} offlineData={guide} />
    </div>
  );
}
