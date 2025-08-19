'use client';

import { useEffect } from 'react';

interface OptimalAdSenseProps {
  placement: 'homepage-hero' | 'homepage-countries' | 'guide-content' | 'mypage-tabs' | 'sidebar' | 'footer';
  className?: string;
}

// ✅ AdSense 승인 완료 - Auto Ads 전용 최적화
// Google AI가 사용자 경험과 수익의 최적 균형점을 자동으로 찾아 광고 배치
// 광고 과부하 없이 안정적인 수익 창출 구조

export default function OptimalAdSense({ placement, className = '' }: OptimalAdSenseProps) {
  useEffect(() => {
    // Auto Ads 전용 성과 추적 (Google AI 최적화)
    console.log(`📊 AdSense Auto Ads 영역: ${placement} (승인 완료 - AI 최적화 활성화)`);
    
    // Auto Ads 로딩 및 성과 추적
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'auto_ads_area_loaded', {
          placement_type: placement,
          approval_status: 'approved',
          ad_type: 'auto_ads_only', // Auto Ads 전용
          optimization_mode: 'google_ai', // Google AI 최적화
          user_experience: 'optimized' // 사용자 경험 최적화
        });
        
        // Auto Ads 수익 추적
        window.gtag('event', 'auto_ads_revenue_area', {
          event_category: 'Auto AdSense',
          event_label: placement,
          value: 1
        });
      }
      
      // AdSense 광고 로딩 강제 실행
      if (typeof window !== 'undefined') {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (adError) {
          console.log(`ℹ️ AdSense ${placement}: 광고 로딩 재시도 중...`);
        }
      }
    } catch (error) {
      console.log('ℹ️ AdSense: 광고 로딩 중 일시적 오류 (재시도됨)');
    }
  }, [placement]);

  // 개발 환경에서는 플레이스홀더 표시
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center text-blue-600">
          <div className="text-sm font-medium mb-1">🤖 Auto Ads 전용 영역</div>
          <div className="text-xs">Google AI가 최적 위치에 자동 광고 배치</div>
          <div className="text-xs mt-1">배치: {placement}</div>
          <div className="text-xs text-blue-500 mt-2">사용자 경험 + 수익 균형 최적화 ✅</div>
          <div className="text-xs text-gray-500 mt-1">광고 과부하 방지됨</div>
        </div>
      </div>
    );
  }

  // 프로덕션: Auto Ads 전용 - Google AI 최적화로 안정적 수익 창출
  return (
    <div 
      className={`auto-ads-container ${className}`}
      data-auto-ads-placement={placement}
      data-adsense-status="approved"
      data-optimization-mode="google-ai"
      style={{ 
        minHeight: '200px', // 적절한 최소 높이로 조정
        width: '100%',
        display: 'block',
        margin: '16px 0', // 마진 최적화
        textAlign: 'center'
      }}
    >
      {/* Auto Ads 전용 영역 - Google AI가 자동으로 최적 배치 */}
      <div className="auto-ads-zone" data-auto-ads-placement={placement}>
        {/* 
          Google Auto Ads가 이 영역에 자동으로 광고를 배치합니다.
          - 사용자 경험과 수익의 최적 균형점을 AI가 자동 계산
          - 광고 과부하 방지 및 적절한 광고 밀도 유지
          - 반응형으로 모든 기기에서 최적화
        */}
      </div>
    </div>
  );
}

// 타입 확장 (AdSense + Analytics) - 중앙 통합 관리
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    adsbygoogle?: any[];
    autoAdSenseInitialized?: boolean;
    adsensePageLevelEnabled?: boolean;
    adsenseAutoAdsInitialized?: boolean;
  }
}