// 장소명 번역과 URL 라우팅을 위한 커스텀 훅 (Microsoft Translator 기반)
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { SupportedLanguage } from '@/contexts/LanguageContext';
import { MicrosoftTranslator } from '@/lib/location/microsoft-translator';

export function useLocationTranslation() {
  const router = useRouter();
  const pathname = usePathname();
  
  /**
   * 언어 변경 시 현재 위치의 장소명을 번역하여 URL 업데이트
   */
  const changeLanguageWithLocationTranslation = useCallback(async (
    newLanguage: SupportedLanguage,
    currentLanguage: SupportedLanguage
  ) => {
    console.log('🌐 언어 변경 시작:', { currentLanguage, newLanguage, pathname });
    
    // 가이드 페이지 패턴 확인: /guide/[location], /guide/[location]/live, /guide/[location]/tour
    const guidePageMatch = pathname.match(/^\/guide\/([^\/]+)(?:\/(live|tour))?$/);
    
    if (guidePageMatch) {
      const [, encodedLocationName, pageType] = guidePageMatch;
      const currentLocationName = MicrosoftTranslator.fromUrlFriendly(encodedLocationName);
      
      console.log('📍 가이드 페이지 감지:', { 
        encodedLocationName, 
        currentLocationName, 
        pageType 
      });
      
      try {
        // 1. 현재 언어가 한국어가 아니라면, 한국어로 역번역
        let koreanLocationName = currentLocationName;
        if (currentLanguage !== 'ko') {
          koreanLocationName = await MicrosoftTranslator.reverseTranslateLocationName(
            currentLocationName, 
            currentLanguage
          );
          console.log(`🔄 역번역: ${currentLocationName} → ${koreanLocationName}`);
        }
        
        // 2. 한국어 장소명을 새 언어로 번역
        const translatedLocationName = await MicrosoftTranslator.translateLocationName(
          koreanLocationName, 
          newLanguage
        );
        
        // 3. URL 업데이트
        if (translatedLocationName !== currentLocationName) {
          const newEncodedName = MicrosoftTranslator.toUrlFriendly(translatedLocationName);
          const newPath = pageType 
            ? `/guide/${newEncodedName}/${pageType}`
            : `/guide/${newEncodedName}`;
          
          console.log('🔄 URL 업데이트:', {
            from: pathname,
            to: newPath,
            translation: `${currentLocationName} → ${translatedLocationName}`
          });
          
          // 페이지 새로고침 없이 URL 변경
          router.push(newPath);
          return true; // 번역 및 라우팅 완료
        } else {
          console.log('📍 번역 결과가 동일하여 URL 변경 불필요');
          return false;
        }
        
      } catch (error) {
        console.error('❌ 장소명 번역 실패:', error);
        return false; // 번역 실패
      }
    }
    
    return false; // 가이드 페이지가 아니거나 번역 불필요
  }, [router, pathname]);
  
  /**
   * 현재 페이지가 가이드 페이지인지 확인
   */
  const isGuidePage = useCallback(() => {
    return /^\/guide\/[^\/]+(?:\/(live|tour))?$/.test(pathname);
  }, [pathname]);
  
  /**
   * 현재 장소명 추출
   */
  const getCurrentLocationName = useCallback(() => {
    const guidePageMatch = pathname.match(/^\/guide\/([^\/]+)(?:\/(live|tour))?$/);
    if (guidePageMatch) {
      const [, encodedLocationName] = guidePageMatch;
      return MicrosoftTranslator.fromUrlFriendly(encodedLocationName);
    }
    return null;
  }, [pathname]);
  
  /**
   * Microsoft Translator 서비스 상태 확인
   */
  const checkTranslationServer = useCallback(async () => {
    return await MicrosoftTranslator.checkServerStatus();
  }, []);
  
  return {
    changeLanguageWithLocationTranslation,
    isGuidePage,
    getCurrentLocationName,
    checkTranslationServer
  };
}