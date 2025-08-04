'use client';

import { useEffect } from 'react';
import AdSenseAd from './AdSenseAd';

interface OptimalAdSenseProps {
  placement: 'homepage-hero' | 'homepage-countries' | 'guide-content' | 'mypage-tabs' | 'sidebar' | 'footer';
  className?: string;
}

// 배치별 최적화된 광고 설정
const AD_CONFIGS = {
  'homepage-hero': {
    adSlot: '1234567890', // 홈페이지 상단 - 가장 높은 수익
    adFormat: 'auto' as const,
    adLayout: 'display' as const,
    style: { minHeight: '280px', margin: '20px 0' }
  },
  'homepage-countries': {
    adSlot: '2345678901', // 홈페이지 지역별 국가 섹션
    adFormat: 'rectangle' as const,
    adLayout: 'display' as const,
    style: { minHeight: '250px', margin: '15px 0' }
  },
  'guide-content': {
    adSlot: '3456789012', // 가이드 콘텐츠 중간
    adFormat: 'auto' as const,
    adLayout: 'in-article' as const,
    style: { minHeight: '200px', margin: '25px 0' }
  },
  'mypage-tabs': {
    adSlot: '4567890123', // 마이페이지 탭 사이
    adFormat: 'horizontal' as const,
    adLayout: 'display' as const,
    style: { minHeight: '120px', margin: '10px 0' }
  },
  'sidebar': {
    adSlot: '5678901234', // 사이드바 (세로형)
    adFormat: 'vertical' as const,
    adLayout: 'display' as const,
    style: { minHeight: '600px', margin: '10px 0' }
  },
  'footer': {
    adSlot: '6789012345', // 푸터 영역
    adFormat: 'horizontal' as const,
    adLayout: 'display' as const,
    style: { minHeight: '100px', margin: '15px 0' }
  }
};

export default function OptimalAdSense({ placement, className = '' }: OptimalAdSenseProps) {
  const config = AD_CONFIGS[placement];

  useEffect(() => {
    // 배치별 성과 추적
    console.log(`📊 AdSense 광고 배치: ${placement}`);
    
    // 성과 추적을 위한 이벤트 전송 (선택사항)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_placement_loaded', {
        placement_type: placement,
        ad_slot: config.adSlot
      });
    }
  }, [placement, config.adSlot]);

  return (
    <div className={`optimal-adsense-container ${className}`}>
      <AdSenseAd
        adSlot={config.adSlot}
        adFormat={config.adFormat}
        adLayout={config.adLayout}
        style={config.style}
        className="w-full"
      />
      
      {/* 개발 환경에서만 표시되는 배치 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 text-center mt-2">
          배치: {placement} | 슬롯: {config.adSlot}
        </div>
      )}
    </div>
  );
}

// 타입 확장 (gtag)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}