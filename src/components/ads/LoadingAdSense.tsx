'use client';

import { useEffect, useRef } from 'react';

interface LoadingAdSenseProps {
  className?: string;
  style?: React.CSSProperties;
  adTest?: boolean;
}

// AdSense가 로드되었는지 확인하는 타입 가드
declare global {
  interface Window {
    adsbygoogle: any[];
    adsensePageLevelEnabled?: boolean; // 페이지 레벨 광고 활성화 여부 확인
  }
}

export default function LoadingAdSense({
  className = '',
  style = {},
  adTest = process.env.NODE_ENV === 'development'
}: LoadingAdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // AdSense가 로드되었는지 확인하고 광고 초기화
      if (typeof window !== 'undefined') {
        // 페이지 레벨 광고가 이미 활성화된 경우 경고 로그만 출력
        if (window.adsensePageLevelEnabled) {
          console.log('ℹ️ 페이지 레벨 광고가 활성화된 상태에서 로딩화면 광고 로드');
        }
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense 로딩화면 광고 로드 오류:', error);
    }
  }, []);

  // AdSense 클라이언트 ID가 없으면 렌더링하지 않음
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !process.env.NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID) {
    console.warn('AdSense 환경 변수가 설정되지 않아 로딩화면 광고를 표시할 수 없습니다.');
    return null;
  }

  // 개발 환경에서는 플레이스홀더 표시
  if (adTest) {
    return (
      <div 
        className={`bg-green-50 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center min-h-[250px] p-4 ${className}`}
        style={style}
      >
        <div className="text-center text-green-600">
          <div className="text-lg font-medium mb-2">📢 로딩화면 광고</div>
          <div className="text-sm mb-1">개발 환경 - 실제 광고는 배포 후 표시</div>
          <div className="text-xs">슬롯 ID: 5109315234</div>
          <div className="text-xs mt-1">실제 AdSense 광고 단위</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* 사용자가 제공한 실제 AdSense 광고 코드 */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', maxHeight: '200px' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID}
        data-ad-format="rectangle"
        data-full-width-responsive="true"
      />
    </div>
  );
} 