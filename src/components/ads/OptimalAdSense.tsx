'use client';

import { useEffect } from 'react';

interface OptimalAdSenseProps {
  placement: 'homepage-hero' | 'homepage-countries' | 'guide-content' | 'mypage-tabs' | 'sidebar' | 'footer';
  className?: string;
}

// 🚨 AdSense 승인을 위해 개별 광고 단위 비활성화
// Auto Ads만 사용하여 가짜 Ad Slot ID 문제 해결
// 실제 광고 단위는 AdSense 대시보드에서 생성 후 추가 예정

export default function OptimalAdSense({ placement, className = '' }: OptimalAdSenseProps) {
  useEffect(() => {
    // 배치별 성과 추적 (Auto Ads 전용) - 승인 대기 중에는 오류 방지
    console.log(`📊 AdSense Auto 광고 영역: ${placement} (승인 후 표시됨)`);
    
    // Auto Ads 성과 추적 - 안전한 방식으로 처리
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'auto_ad_area_loaded', {
          placement_type: placement,
          approval_status: 'pending' // 승인 상태 추적
        });
      }
    } catch (error) {
      // Google Analytics 오류가 AdSense와 무관하게 발생할 수 있으므로 조용히 처리
      console.log('ℹ️ AdSense: Analytics 추적 건너뜀 (정상)');
    }
  }, [placement]);

  // 개발 환경에서는 플레이스홀더 표시
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-green-50 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center text-green-600">
          <div className="text-sm font-medium mb-1">🟢 AdSense Auto Ads 영역</div>
          <div className="text-xs">Auto Ads가 이 영역에 자동 배치됩니다</div>
          <div className="text-xs mt-1">배치: {placement}</div>
          <div className="text-xs text-green-500 mt-2">가짜 Ad Slot ID 문제 해결됨 ✅</div>
        </div>
      </div>
    );
  }

  // 프로덕션에서는 Auto Ads가 자동으로 배치되도록 빈 컨테이너만 제공
  // 승인 대기 중에는 빈 공간으로 표시됨 (정상)
  return (
    <div 
      className={`optimal-adsense-auto-container ${className}`}
      data-ad-placement={placement}
      data-adsense-status="pending-approval"
      style={{ 
        minHeight: '200px',
        // 승인 대기 중에는 최소 높이만 유지하고 숨김 처리
        visibility: 'hidden',
        height: '0px',
        overflow: 'hidden'
      }}
    >
      {/* AdSense 승인 후 이 영역에 Auto Ads가 자동으로 삽입됩니다 */}
    </div>
  );
}

// 타입 확장 (gtag)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}