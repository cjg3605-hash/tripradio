// src/lib/multilang-guide-manager.ts
import { supabase } from '@/lib/supabaseClient';

export class MultiLangGuideManager {
  /**
   * 🔍 언어별 가이드 조회
   */
  static async getGuideByLanguage(locationName: string, language: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source: 'cache' | 'database';
  }> {
    try {
      console.log(`🔍 ${language} 가이드 조회:`, locationName);
      
      // 위치명 정규화 (한글 처리 개선)
      const normalizedLocation = locationName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s가-힣]/g, ''); // 특수문자 제거, 한글 유지
      
      console.log(`📍 정규화된 위치명: "${locationName}" → "${normalizedLocation}"`);
      
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('locationname', normalizedLocation)
        .eq('language', language)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📭 ${language} 가이드 없음:`, locationName);
          return { success: false, error: 'NOT_FOUND', source: 'database' };
        }
        console.error(`❌ ${language} 가이드 조회 실패:`, error);
        return { success: false, error: error.message, source: 'database' };
      }

      console.log(`✅ ${language} 가이드 발견:`, locationName);
      return { success: true, data: data.content, source: 'cache' };

    } catch (error) {
      console.error(`❌ ${language} 가이드 조회 중 오류:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        source: 'database'
      };
    }
  }

  /**
   * 🌍 모든 언어 버전 조회
   */
  static async getAllLanguageVersions(locationName: string): Promise<{
    success: boolean;
    data: string[];
    error?: string;
  }> {
    try {
      console.log(`🌍 모든 언어 버전 조회:`, locationName);
      
      const { data, error } = await supabase
        .from('guides')
        .select('language, updated_at')
        .eq('locationname', locationName.toLowerCase().trim());

      if (error) {
        console.error('❌ 다국어 조회 실패:', error);
        return { success: false, error: error.message, data: [] };
      }

      const languages = data?.map(item => item.language) || [];
      console.log(`✅ 다국어 조회 완료:`, languages);
      return { success: true, data: languages };

    } catch (error) {
      console.error('❌ 다국어 조회 중 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        data: []
      };
    }
  }

  /**
   * 💾 언어별 가이드 저장
   */
  static async saveGuideByLanguage({
    locationName,
    language,
    guideData,
    userProfile
  }: {
    locationName: string;
    language: string;
    guideData: any;
    userProfile?: any;
  }) {
    try {
      console.log(`💾 ${language} 가이드 저장 시작:`, locationName);

      const { data, error } = await supabase
        .from('guides')
        .upsert({
          locationname: locationName.toLowerCase().trim(),
          language: language,
          content: guideData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'locationname,language'
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ ${language} 가이드 저장 실패:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${language} 가이드 저장 완료:`, locationName);
      return { success: true, data };

    } catch (error) {
      console.error(`❌ ${language} 가이드 저장 중 오류:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 🎨 스마트 언어 전환 (기존 가이드가 없으면 생성)
   */
  static async smartLanguageSwitch(
    locationName: string, 
    targetLanguage: string, 
    userProfile?: any
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source?: 'cache' | 'generated';
  }> {
    try {
      console.log(`🔄 스마트 언어 전환: ${locationName} → ${targetLanguage}`);

      // 1단계: 기존 가이드 확인
      const existingGuide = await this.getGuideByLanguage(locationName, targetLanguage);
      
      if (existingGuide.success) {
        console.log(`✅ 기존 ${targetLanguage} 가이드 발견 - 반환`);
        return {
          success: true,
          data: existingGuide.data,
          source: 'cache'
        };
      }

      // 2단계: 가이드가 없으면 새로 생성
      console.log(`🎨 새로운 ${targetLanguage} 가이드 생성 중...`);
      
      const generateResult = await this.generateAndSaveGuide(
        locationName, 
        targetLanguage, 
        userProfile
      );

      if (generateResult.success) {
        console.log(`✅ ${targetLanguage} 가이드 생성 및 저장 완료`);
        return {
          success: true,
          data: generateResult.data,
          source: 'generated'
        };
      } else {
        console.error(`❌ ${targetLanguage} 가이드 생성 실패:`, generateResult.error);
        return generateResult;
      }

    } catch (error) {
      console.error(`❌ 스마트 언어 전환 실패:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 🤖 새로운 가이드 생성 및 저장
   */
  static async generateAndSaveGuide(
    locationName: string, 
    language: string, 
    userProfile?: any
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    
    try {
      console.log(`🤖 ${language} 가이드 생성 시작:`, locationName);

      // API 라우트를 통해 AI 가이드 생성 요청
      const response = await fetch('/api/ai/generate-multilang-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: locationName,
          language: language,
          userProfile: userProfile
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI 가이드 생성 실패');
      }

      const guideData = result.data;
      console.log(`📥 ${language} AI 가이드 수신: ${JSON.stringify(guideData).length}자`);

      // DB에 저장
      const saveResult = await this.saveGuideByLanguage({
        locationName,
        language,
        guideData,
        userProfile
      });

      if (saveResult.success) {
        console.log(`✅ ${language} 가이드 생성 및 저장 완료`);
        return { success: true, data: guideData };
      } else {
        return { success: false, error: saveResult.error };
      }

    } catch (error) {
      console.error(`❌ ${language} 가이드 생성 실패:`, error);
      return { success: false, error };
    }
  }

  /**
   * 📊 언어별 가이드 통계
   */
  static async getLanguageStats(locationName: string) {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('language, updated_at')
        .eq('locationname', locationName.toLowerCase().trim());

      if (error) {
        return { total: 0, languages: [] };
      }

      return {
        total: data?.length || 0,
        languages: data?.map(item => ({
          language: item.language,
          lastUpdated: item.updated_at
        })) || []
      };

    } catch (error) {
      return { total: 0, languages: [] };
    }
  }
}

// Backward compatibility - 기존 import를 위한 alias
export const MultiLanguageGuideManager = MultiLangGuideManager;