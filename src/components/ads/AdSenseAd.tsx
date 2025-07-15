'use client';

import { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  className?: string;
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adLayout?: 'in-article' | 'display';
  style?: React.CSSProperties;
  adTest?: boolean; // 개발 환경에서 테스트 광고 사용
}

// AdSense가 로드되었는지 확인하는 타입 가드
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSenseAd({
  className = '',
  adSlot,
  adFormat = 'auto',
  adLayout = 'display',
  style = {},
  adTest = process.env.NODE_ENV === 'development'
}: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // AdSense가 로드되었는지 확인
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense 광고 로드 오류:', error);
    }
  }, []);

  // 개발 환경에서는 플레이스홀더 표시
  if (adTest) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center min-h-[250px] ${className}`}
        style={style}
      >
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium mb-1">📢 AdSense 광고 영역</div>
          <div className="text-xs">개발 환경 - 테스트 광고</div>
          <div className="text-xs mt-1">슬롯: {adSlot}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  );
} 