// 🔧 AdSense 중복 초기화 문제 해결
// src/components/ads/AutoAdSense.tsx

'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
    autoAdSenseInitialized?: boolean;
    adsensePageLevelEnabled?: boolean;
  }
}

const AutoAdSense = () => {
  useEffect(() => {
    // 🚨 중복 초기화 방지 강화
    if (
      process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED === 'true' && 
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      
      // 이미 초기화되었는지 확인
      if (window.autoAdSenseInitialized || window.adsensePageLevelEnabled) {
        console.log('ℹ️ AdSense가 이미 초기화됨 - 중복 초기화 방지');
        return;
      }

      // DOM에서 기존 페이지 레벨 광고 스크립트 확인
      const existingPageLevelAds = document.querySelector('[data-ad-client][data-ad-format="auto"]');
      if (existingPageLevelAds) {
        console.log('ℹ️ 기존 페이지 레벨 광고 감지 - 중복 방지');
        window.adsensePageLevelEnabled = true;
        return;
      }

      try {
        // 자동 광고 초기화
        (window.adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        });
        
        // 초기화 완료 플래그 설정
        window.autoAdSenseInitialized = true;
        window.adsensePageLevelEnabled = true;
        
        console.log('🚀 AdSense 자동 광고 초기화됨');
      } catch (error) {
        console.error('❌ AdSense 자동 광고 초기화 실패:', error);
      }
    }
  }, []);

  return null;
};

export default AutoAdSense;