'use client';

import { useEffect } from 'react';

interface TourAdSenseProps {
  className?: string;
}

const TourAdSense: React.FC<TourAdSenseProps> = ({ className = '' }) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense 광고 로드 오류:', error);
    }
  }, []);

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
        data-ad-client="ca-pub-8225961966676319"
        data-ad-slot="8122491387"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default TourAdSense; 