// 장소명 번역과 URL 라우팅을 위한 커스텀 훅 (Microsoft Translator 기반)
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { SupportedLanguage, useLanguage } from '@/contexts/LanguageContext';
import { MicrosoftTranslator } from '@/lib/location/microsoft-translator';

export function useLocationTranslation() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLanguage, currentLanguage } = useLanguage();
  
  /**
   * 언어 변경 시 현재 위치의 장소명을 번역하여 URL 업데이트
   * 이제 LanguageContext와 통합되어 번역 로딩도 함께 처리
   */
  const changeLanguageWithLocationTranslation = useCallback(async (
    newLanguage: SupportedLanguage,
    currentLangOverride?: SupportedLanguage // 옵셔널로 변경
  ) => {
    const currentLang = currentLangOverride || currentLanguage;
    console.log('🌐 Location 번역 시작:', { currentLang, newLanguage, pathname });
    
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
        if (currentLang !== 'ko') {
          koreanLocationName = await MicrosoftTranslator.reverseTranslateLocationName(
            currentLocationName, 
            currentLang
          );
          console.log(`🔄 역번역: ${currentLocationName} → ${koreanLocationName}`);
        }
        
        // 2. 한국어 장소명을 새 언어로 번역
        const translatedLocationName = await MicrosoftTranslator.translateLocationName(
          koreanLocationName, 
          newLanguage
        );
        
        // 3. URL 업데이트 (언어 매개변수 포함)
        if (translatedLocationName !== currentLocationName || newLanguage !== 'ko') {
          const newEncodedName = MicrosoftTranslator.toUrlFriendly(translatedLocationName);
          
          // 새 URL 구조: /guide/언어코드/장소명
          const newPath = pageType 
            ? `/guide/${newLanguage}/${newEncodedName}/${pageType}`
            : `/guide/${newLanguage}/${newEncodedName}`;
          
          console.log('🔄 URL 업데이트 (Location 번역):', {
            from: pathname,
            to: newPath,
            translation: `${currentLocationName} → ${translatedLocationName}`,
            language: newLanguage,
            koreanBaseName: koreanLocationName
          });
          
          // 브라우저 히스토리에 한국어 베이스 이름과 원본 분류 정보 저장
          const stateData = {
            koreanLocationName,
            originalLocationName: currentLocationName,
            translatedLocationName,
            targetLanguage: newLanguage,
            isTranslatedRoute: true
          };
          
          // 페이지 새로고침 없이 URL 변경 (상태 정보 포함)
          router.push(newPath, { scroll: false });
          
          // 브라우저 세션 스토리지에 번역 컨텍스트 저장
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('translationContext', JSON.stringify(stateData));
          }
          
          return true; // 번역 및 라우팅 완료
        } else {
          console.log('📍 번역 결과가 동일하여 URL 변경 불필요');
          return false;
        }
        
      } catch (error) {
        console.error('❌ 장소명 번역 실패:', error);
        throw error; // 에러를 상위로 전파하여 Header에서 처리
      }
    }
    
    return false; // 가이드 페이지가 아니거나 번역 불필요
  }, [router, pathname, currentLanguage]);
  
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