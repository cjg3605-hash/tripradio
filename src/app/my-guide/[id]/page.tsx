"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';

// TourContent를 동적 import (서버 fetch 방지)
const TourContent = dynamic(() => import("../../guide/[location]/tour/components/TourContent"), { ssr: false });

export default function MyGuidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useTranslation('common');
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
        alert(t('offline_guide_not_found'));
        router.push("/mypage");
      }
    } catch (e) {
      alert(t('offline_guide_load_error'));
      router.push("/mypage");
    } finally {
      setLoading(false);
    }
  }, [params?.id, router, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">{t('loading')}</div>
    );
  }
  if (!guide) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <TourContent locationName={guide.metadata?.originalLocationName} userProfile={guide.userProfile} offlineData={guide} />
    </div>
  );
}
