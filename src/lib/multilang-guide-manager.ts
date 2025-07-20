// src/lib/multilang-guide-manager.ts
import { supabase } from '@/lib/supabaseClient';
import { createAutonomousGuidePrompt } from './ai/prompts/index';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini 클라이언트 초기화 함수
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error('Failed to initialize AI service');
  }
};

export class MultiLangGuideManager {
  /**
   * 🔍 언어별 가이드 조회
   */
  static async getGuideByLanguage(locationName: string, language: string) {
    try {
      console.log(`🔍 ${language} 가이드 조회:`, locationName);
      
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('locationname', locationName.toLowerCase().trim())
        .eq('language', language)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📭 ${language} 가이드 없음:`, locationName);
          return { success: false, error: 'NOT_FOUND' };
        }
        console.error(`❌ ${language} 가이드 조회 실패:`, error);
        return { success: false, error: error.message };
      }

      console.log(`✅ ${language} 가이드 발견:`, locationName);
      return { success: true, data: data.guide_data };

    } catch (error) {
      console.error(`❌ ${language} 가이드 조회 중 오류:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 🌍 모든 언어 버전 조회
   */
  static async getAllLanguageVersions(locationName: string) {
    try {
      console.log(`🌍 모든 언어 버전 조회:`, locationName);
      
      const { data, error } = await supabase
        .from('guides')
        .select('language, updated_at')
        .eq('locationname', locationName.toLowerCase().trim());

      if (error) {
        console.error('❌ 다국어 조회 실패:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ 다국어 조회 완료:`, data);
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('❌ 다국어 조회 중 오류:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류'
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
          guide_data: guideData,
          user_profile: userProfile || {},
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
  static async smartLanguageSwitch(locationName: string, targetLanguage: string, userProfile?: any) {
    try {
      console.log(`🔄 스마트 언어 전환: ${locationName} → ${targetLanguage}`);

      // 1단계: 기존 가이드 확인
      const existingGuide = await this.getGuideByLanguage(locationName, targetLanguage);
      
      if (existingGuide.success) {
        console.log(`✅ 기존 ${targetLanguage} 가이드 발견 - 반환`);
        return existingGuide;
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
        return generateResult;
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
   * 🤖 새로운 가이드 생성 및 저장 (수정된 버전)
   */
  static async generateAndSaveGuide(
    locationName: string, 
    language: string, 
    userProfile?: any
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    
    try {
      // 기존 프롬프트 시스템 활용 (품질 보장)
      const prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
      
      console.log(`📝 ${language} 프롬프트 준비 완료: ${prompt.length}자`);

      // ✅ 수정된 부분: Gemini 라이브러리 사용
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite-preview-06-17',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
          topK: 40,
          topP: 0.9,
        }
      });

      console.log(`🤖 ${language} 가이드 생성 중...`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      
      if (!text) {
        throw new Error('AI 응답이 비어있습니다');
      }

      console.log(`📥 ${language} AI 응답 수신: ${text.length}자`);

      // JSON 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('유효한 JSON을 찾을 수 없습니다');
      }

      const guideData = JSON.parse(jsonMatch[0]);

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