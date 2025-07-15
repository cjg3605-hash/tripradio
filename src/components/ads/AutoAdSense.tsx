'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AutoAdSenseProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function AutoAdSense({
  className = '',
  style = {}
}: AutoAdSenseProps) {
  
  useEffect(() => {
    try {
      // 자동 광고 활성화
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        });
      }
    } catch (error) {
      console.error('자동 AdSense 광고 로드 오류:', error);
    }
  }, []);

  // 개발 환경에서는 플레이스홀더 표시
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center min-h-[280px] p-4 ${className}`}
        style={style}
      >
        <div className="text-center text-blue-600">
          <div className="text-lg font-medium mb-2">🚀 자동 AdSense 광고</div>
          <div className="text-sm mb-1">개발 환경 - 배포 후 자동 표시됩니다</div>
          <div className="text-xs text-blue-500">Google이 최적 위치에 광고를 자동 배치합니다</div>
        </div>
      </div>
    );
  }

  // 운영 환경에서는 빈 div (Google이 자동으로 광고 삽입)
  return (
    <div className={className} style={style}>
      {/* Google AdSense 자동 광고가 여기에 표시됩니다 */}
    </div>
  );
} 