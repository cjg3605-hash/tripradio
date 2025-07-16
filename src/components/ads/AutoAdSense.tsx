'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
    autoAdSenseInitialized?: boolean;
    adsensePageLevelEnabled?: boolean; // 추가: 페이지 레벨 광고 활성화 여부
  }
}

const AutoAdSense = () => {
  useEffect(() => {
    // 자동 광고가 활성화되어 있고 프로덕션 환경인 경우에만 실행
    if (
      process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED === 'true' && 
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      !window.autoAdSenseInitialized &&  // 중복 초기화 방지
      !window.adsensePageLevelEnabled     // 페이지 레벨 광고 중복 방지 강화
    ) {
      try {
        // 자동 광고 초기화
        (window.adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        });
        
        // 초기화 완료 플래그 설정
        window.autoAdSenseInitialized = true;
        window.adsensePageLevelEnabled = true; // 페이지 레벨 광고 활성화 플래그
        
        console.log('🚀 AdSense 자동 광고 초기화됨');
      } catch (error) {
        console.error('❌ AdSense 자동 광고 초기화 실패:', error);
      }
    } else if (window.adsensePageLevelEnabled) {
      console.log('ℹ️ AdSense 페이지 레벨 광고가 이미 활성화됨 - 중복 초기화 방지');
    }
  }, []);

  return null;
};

export default AutoAdSense; 