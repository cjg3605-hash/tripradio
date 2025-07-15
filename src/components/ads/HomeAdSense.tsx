'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface HomeAdSenseProps {
  className?: string;
}

const HomeAdSense: React.FC<HomeAdSenseProps> = ({ className = '' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense 홈페이지 광고 로드 오류:', error);
    }
  }, []);

  // 개발 환경에서는 플레이스홀더 표시
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center ${className}`}>
        <p className="text-blue-500 text-sm">
          🏠 홈페이지 광고 영역<br />
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
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_LOADING_AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default HomeAdSense; 