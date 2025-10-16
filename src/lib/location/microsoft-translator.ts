// Microsoft Translator 기반 장소명 번역 시스템
import { SupportedLanguage } from '@/contexts/LanguageContext';

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  fallback: boolean;
  error?: string;
}

/**
 * Microsoft Translator 기반 장소명 번역기
 */
export class MicrosoftTranslator {
  
  /**
   * 장소명 번역 (한국어 → 다른 언어)
   */
  static async translateLocationName(
    koreanName: string, 
    targetLanguage: SupportedLanguage
  ): Promise<string> {
    // 한국어인 경우 원본 반환
    if (targetLanguage === 'ko') {
      return koreanName;
    }
    
    try {
      console.log(`🌐 장소명 번역 시도: ${koreanName} (ko → ${targetLanguage})`);
      
      const response = await fetch('/api/translate-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: koreanName,
          sourceLanguage: 'ko',
          targetLanguage: targetLanguage
        })
      });
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const data: TranslationResponse = await response.json();
      
      if (data.fallback) {
        console.warn(`⚠️ 번역 폴백: ${koreanName} → ${data.translatedText} (${data.error || '번역 실패'})`);
        return koreanName; // 원본 반환
      }
      
      console.log(`✅ 번역 성공: ${koreanName} → ${data.translatedText}`);
      return data.translatedText;
      
    } catch (error) {
      console.error(`❌ 번역 실패: ${koreanName} (${targetLanguage})`, error);
      return koreanName; // 실패 시 원본 반환
    }
  }
  
  /**
   * 역번역 (다른 언어 → 한국어)
   */
  static async reverseTranslateLocationName(
    translatedName: string, 
    fromLanguage: SupportedLanguage
  ): Promise<string> {
    // 이미 한국어인 경우 원본 반환
    if (fromLanguage === 'ko') {
      return translatedName;
    }
    
    try {
      console.log(`🔄 장소명 역번역 시도: ${translatedName} (${fromLanguage} → ko)`);
      
      const response = await fetch('/api/translate-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translatedName,
          sourceLanguage: fromLanguage,
          targetLanguage: 'ko'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const data: TranslationResponse = await response.json();
      
      if (data.fallback) {
        console.warn(`⚠️ 역번역 폴백: ${translatedName} → ${data.translatedText} (${data.error || '번역 실패'})`);
        return translatedName; // 원본 반환
      }
      
      console.log(`✅ 역번역 성공: ${translatedName} → ${data.translatedText}`);
      return data.translatedText;
      
    } catch (error) {
      console.error(`❌ 역번역 실패: ${translatedName} (${fromLanguage})`, error);
      return translatedName; // 실패 시 원본 반환
    }
  }
  
  /**
   * URL 친화적인 형태로 변환
   */
  static toUrlFriendly(locationName: string): string {
    return encodeURIComponent(locationName.trim());
  }
  
  /**
   * URL에서 디코딩
   */
  static fromUrlFriendly(encodedName: string): string {
    return decodeURIComponent(encodedName);
  }
  
  /**
   * Microsoft Translator 서비스 상태 확인
   */
  static async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch('/api/translate-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '테스트',
          sourceLanguage: 'ko',
          targetLanguage: 'en'
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Microsoft Translator 서비스 상태 확인 실패:', error);
      return false;
    }
  }
}