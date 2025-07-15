'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface TourAdSenseProps {
  className?: string;
}

const TourAdSense: React.FC<TourAdSenseProps> = ({ className = '' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense 광고 로드 오류:', error);
    }
  }, []);

  // AdSense 클라이언트 ID가 없으면 렌더링하지 않음
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_TOUR_AD_SLOT) {
    console.warn('AdSense 환경 변수가 설정되지 않아 투어페이지 광고를 표시할 수 없습니다.');
    return null;
  }

  // 개발 환경에서는 플레이스홀더 표시
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-500 text-sm">
          📱 투어페이지 광고 영역<br />
          (개발 환경에서는 표시되지 않음)
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_TOUR_AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default TourAdSense; 