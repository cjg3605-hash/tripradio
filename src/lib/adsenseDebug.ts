// 🔧 AdSense 디버그 및 정리 유틸리티
// src/lib/adsenseDebug.ts

export class AdSenseDebugger {
    // 🔍 현재 AdSense 상태 확인
    static checkStatus() {
      if (typeof window === 'undefined') return;
  
      console.group('🔍 AdSense 상태 점검');
      
      // 1. 전역 변수 확인
      console.log('전역 변수:', {
        adsbygoogle: !!window.adsbygoogle,
        autoAdSenseInitialized: window.autoAdSenseInitialized,
        adsensePageLevelEnabled: window.adsensePageLevelEnabled,
        adsbygoogleLength: window.adsbygoogle?.length || 0
      });
  
      // 2. DOM에서 AdSense 요소 확인
      const adsenseElements = document.querySelectorAll('.adsbygoogle');
      console.log('DOM의 AdSense 요소:', {
        총개수: adsenseElements.length,
        요소들: Array.from(adsenseElements).map(el => ({
          className: el.className,
          dataAdClient: el.getAttribute('data-ad-client'),
          dataAdSlot: el.getAttribute('data-ad-slot'),
          dataAdFormat: el.getAttribute('data-ad-format')
        }))
      });
  
      // 3. 페이지 레벨 광고 확인
      const pageLevelAds = document.querySelectorAll('[data-ad-format="auto"]');
      console.log('페이지 레벨 광고:', {
        개수: pageLevelAds.length,
        요소들: Array.from(pageLevelAds)
      });
  
      console.groupEnd();
    }
  
    // 🧹 AdSense 상태 초기화
    static resetAdSense() {
      if (typeof window === 'undefined') return;
  
      console.log('🧹 AdSense 상태 초기화 중...');
  
      // 전역 변수 초기화
      window.autoAdSenseInitialized = false;
      window.adsensePageLevelEnabled = false;
      
      // adsbygoogle 배열 초기화 (기존 요소 유지하되 플래그만 리셋)
      if (window.adsbygoogle) {
        // 완전히 초기화하지 말고 상태만 리셋
        console.log('기존 adsbygoogle 배열 유지, 상태만 리셋');
      }
  
      console.log('✅ AdSense 상태 초기화 완료');
    }
  
    // 🔧 AdSense 에러 수집
    static collectErrors() {
      const errors: string[] = [];
  
      // 페이지 레벨 광고 중복 확인
      const pageLevelCount = document.querySelectorAll('[data-ad-format="auto"]').length;
      if (pageLevelCount > 1) {
        errors.push(`페이지 레벨 광고가 ${pageLevelCount}개 발견됨 (1개여야 함)`);
      }
  
      // 초기화 플래그 확인
      if (typeof window !== 'undefined') {
        if (window.autoAdSenseInitialized && window.adsensePageLevelEnabled) {
          // 정상
        } else if (window.adsbygoogle && window.adsbygoogle.length > 0) {
          errors.push('adsbygoogle 배열에 요소가 있지만 초기화 플래그가 설정되지 않음');
        }
      }
  
      return errors;
    }
  }
  
  // 개발 환경에서 자동 디버깅
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // 페이지 로드 후 상태 확인
    window.addEventListener('load', () => {
      setTimeout(() => {
        AdSenseDebugger.checkStatus();
        const errors = AdSenseDebugger.collectErrors();
        if (errors.length > 0) {
          console.warn('⚠️ AdSense 문제 발견:', errors);
        }
      }, 2000);
    });
  }