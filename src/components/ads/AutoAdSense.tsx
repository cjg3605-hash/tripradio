// 🔧 AdSense 중복 초기화 문제 해결
// src/components/ads/AutoAdSense.tsx

'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
    autoAdSenseInitialized?: boolean;
    adsensePageLevelEnabled?: boolean;
    adsenseAutoAdsInitialized?: boolean;
  }
}

const AutoAdSense = () => {
  useEffect(() => {
    // 🚨 layout.tsx에서 AdSense 초기화를 처리하므로 이 컴포넌트는 비활성화
    if (typeof window !== 'undefined' && (window.adsenseAutoAdsInitialized || window.autoAdSenseInitialized)) {
      console.log('AutoAdSense: layout.tsx에서 이미 초기화됨 - 중복 방지');
      return;
    }
    console.log('AutoAdSense: 컴포넌트 로드됨 (비활성 상태)');
    return;
    
    // 아래 코드는 비활성화됨 (layout.tsx에서 처리)
    if (
      process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED === 'true' && 
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      !window.autoAdSenseInitialized
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

      // Publisher ID 확인
      if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID) {
        console.warn('⚠️ AdSense Publisher ID가 설정되지 않았습니다.');
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
    } else if (process.env.NODE_ENV === 'development') {
      console.log('🔧 개발 환경에서는 AdSense를 로드하지 않습니다.');
    }
  }, []);

  // 개발 환경에서는 아무것도 렌더링하지 않음
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // 프로덕션 환경에서도 컴포넌트 자체는 렌더링하지 않음 (스크립트만 로드)
  return null;
};

export default AutoAdSense;