// 파일 경로: src/app/guide/[location]/layout.tsx
// 이 파일을 새로 생성하세요!

import { generateGuideMetadata } from '@/lib/seo/metadata';
import { Viewport } from 'next';

interface GuideLayoutProps {
  children: React.ReactNode;
  params: { location: string };
}

// viewport를 별도 export로 분리
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// metadata 생성 (viewport 제외)
export async function generateMetadata({ params }: { params: { location: string } }) {
  const locationName = decodeURIComponent(params.location);
  
  return generateGuideMetadata(locationName, 'ko', {
    description: `${locationName}의 상세한 AI 오디오 가이드입니다.`,
    duration: '약 1-2시간',
  });
}

export default function GuideLayout({ children }: GuideLayoutProps) {
  return (
    <div className="guide-layout">
      {children}
    </div>
  );
}