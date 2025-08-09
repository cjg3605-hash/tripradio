// src/lib/multilang-guide-manager.ts
import { supabase } from '@/lib/supabaseClient';
import { normalizeLocationName } from '@/lib/utils';

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
      // 🔥 통일된 위치명 정규화 사용 (page.tsx와 동일)
      const normalizedLocation = normalizeLocationName(locationName);
      
      console.log(`🔍 DB 조회: "${locationName}" → "${normalizedLocation}" (${language})`);
      
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('locationname', normalizedLocation)
        .eq('language', language.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ DB에서 가이드 없음: "${normalizedLocation}" (${language})`);
          return { success: false, error: 'NOT_FOUND', source: 'database' };
        }
        console.error(`❌ DB 조회 오류:`, error);
        return { success: false, error: error.message, source: 'database' };
      }

      console.log(`✅ DB에서 가이드 발견: "${normalizedLocation}" (${language})`);
      return { success: true, data: data.content, source: 'cache' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        source: 'database'
      };
    }
  }

  /**
   * 📋 모든 가이드 목록 조회 (디버깅용)
   */
  static async getAllGuides(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('id, locationname, language, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ 전체 가이드 목록 조회 실패:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ 전체 가이드 목록 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 🔍 향상된 가이드 검색 (여러 패턴으로 시도)
   */
  static async findGuideWithVariations(locationName: string, language: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source: 'cache' | 'database';
    matchedTerm?: string;
  }> {
    try {
      console.log(`🔍 향상된 검색 시작: "${locationName}" (${language})`);
      
      // 🔥 통일된 정규화 사용하여 검색 패턴 생성
      const normalizedBase = normalizeLocationName(locationName);
      const searchPatterns = [
        normalizedBase, // 표준 정규화
        locationName.toLowerCase().trim().replace(/\s+/g, ''), // 모든 공백 제거
        locationName.toLowerCase().trim().replace(/[^\w\s가-힣]/g, ''), // 특수문자 제거
        // 추가 한글-영어 매핑
        ...(locationName === '에펠탑' ? ['eiffel tower', 'eiffeltower'] : []),
        ...(locationName === '스핑크스' ? ['sphinx', 'great sphinx'] : [])
      ];

      console.log(`🔍 "${locationName}" 검색 패턴들:`, searchPatterns);

      for (const pattern of searchPatterns) {
        console.log(`🔎 패턴 시도: "${pattern}"`);
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .eq('locationname', pattern)
          .eq('language', language.toLowerCase())
          .single();

        if (!error && data) {
          console.log(`✅ 가이드 발견: "${pattern}"`);
          return { 
            success: true, 
            data: data.content, 
            source: 'cache',
            matchedTerm: pattern
          };
        }
      }

      console.log(`📭 모든 패턴 실패: ${locationName}`);
      return { success: false, error: 'NOT_FOUND', source: 'database' };

    } catch (error) {
      console.error(`❌ 향상된 검색 중 오류:`, error);
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
        .eq('locationname', normalizeLocationName(locationName));

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
          locationname: normalizeLocationName(locationName),
          language: language.toLowerCase(),
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
        return {
          success: false,
          error: generateResult.error
        };
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
   * 🤖 새로운 가이드 생성 및 저장 (강제 재생성용)
   */
  static async generateAndSaveGuide(
    locationName: string, 
    language: string, 
    userProfile?: any
  ): Promise<{ success: boolean; data?: any; error?: any; source?: string }> {
    
    try {
      console.log(`🤖 ${language} 가이드 생성 시작:`, locationName);

      // ⚠️ 중복 체크: 기존 가이드가 있으면 반환 (강제 재생성이 아닌 경우)
      const existingGuide = await this.getGuideByLanguage(locationName, language);
      if (existingGuide.success) {
        console.log(`✅ 기존 ${language} 가이드 발견 - 중복 생성 방지`);
        return {
          success: true,
          data: existingGuide.data,
          source: 'cache'
        };
      }

      console.log(`🎨 ${language} 가이드가 없음 - 새로 생성`);

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
   * 🔄 강제 재생성 (기존 가이드 무시하고 새로 생성)
   */
  static async forceRegenerateGuide(
    locationName: string, 
    language: string, 
    userProfile?: any
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    
    try {
      console.log(`🔄 ${language} 가이드 강제 재생성:`, locationName);

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
      console.log(`📥 ${language} AI 가이드 재생성 수신: ${JSON.stringify(guideData).length}자`);

      // DB에 저장 (덮어쓰기)
      const saveResult = await this.saveGuideByLanguage({
        locationName,
        language,
        guideData,
        userProfile
      });

      if (saveResult.success) {
        console.log(`✅ ${language} 가이드 강제 재생성 완료`);
        return { success: true, data: guideData };
      } else {
        return { success: false, error: saveResult.error };
      }

    } catch (error) {
      console.error(`❌ ${language} 가이드 강제 재생성 실패:`, error);
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