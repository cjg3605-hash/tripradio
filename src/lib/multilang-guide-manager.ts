// src/lib/multilang-guide-manager.ts
// 🌍 다국어 가이드 DB 관리 시스템

import { supabase } from '@/lib/supabaseClient';
import type { SupportedLanguage } from '@/contexts/LanguageContext';
import { createAutonomousGuidePrompt } from './ai/prompts';

interface MultiLangGuideData {
  locationName: string;
  language: SupportedLanguage;
  guideData: any;
  userProfile?: any;
}

interface SmartLanguageSwitchResult {
  success: boolean;
  data?: any;
  source: 'cache' | 'generated';
  error?: any;
}

/**
 * 🎯 언어별 가이드 저장/조회 관리자
 */
export class MultiLanguageGuideManager {
  
  /**
   * 📝 언어별 가이드 저장 (기존 DB 구조 활용)
   */
  static async saveGuideByLanguage({
    locationName,
    language,
    guideData,
    userProfile
  }: MultiLangGuideData): Promise<{ success: boolean; error?: any }> {
    
    try {
      console.log(`💾 ${language} 가이드 저장:`, locationName);
      
      // 기존 guides 테이블 구조 그대로 사용
      const { data, error } = await supabase
        .from('guides')
        .upsert([{
          locationname: locationName.toLowerCase().trim(),
          language: language.toLowerCase(), // 언어 코드만 변경
          content: guideData,
          user_profile: userProfile,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'locationname,language' // 복합 키로 중복 방지
        })
        .select('id')
        .single();

      if (error) {
        console.error(`❌ ${language} 가이드 저장 실패:`, error);
        return { success: false, error };
      }

      console.log(`✅ ${language} 가이드 저장 완료:`, data.id);
      return { success: true };

    } catch (error) {
      console.error(`❌ ${language} 가이드 저장 중 오류:`, error);
      return { success: false, error };
    }
  }

  /**
   * 🔍 언어별 가이드 조회
   */
  static async getGuideByLanguage(
    locationName: string, 
    language: SupportedLanguage
  ): Promise<{ exists: boolean; data?: any; error?: any }> {
    
    try {
      console.log(`🔍 ${language} 가이드 조회:`, locationName);
      
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('locationname', locationName.toLowerCase().trim())
        .eq('language', language.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 데이터 없음 (정상)
          console.log(`📭 ${language} 가이드 없음:`, locationName);
          return { exists: false };
        }
        console.error(`❌ ${language} 가이드 조회 실패:`, error);
        return { exists: false, error };
      }

      console.log(`✅ ${language} 가이드 발견:`, data.id);
      return { exists: true, data: data.content };

    } catch (error) {
      console.error(`❌ ${language} 가이드 조회 중 오류:`, error);
      return { exists: false, error };
    }
  }

  /**
   * 🌍 해당 위치의 모든 언어 버전 조회
   */
  static async getAllLanguageVersions(
    locationName: string
  ): Promise<{ [key in SupportedLanguage]?: any }> {
    
    try {
      console.log(`🌍 모든 언어 버전 조회:`, locationName);
      
      const { data, error } = await supabase
        .from('guides')
        .select('language, content')
        .eq('locationname', locationName.toLowerCase().trim());

      if (error) {
        console.error('❌ 다국어 조회 실패:', error);
        return {};
      }

      // 언어별로 정리
      const result: { [key in SupportedLanguage]?: any } = {};
      data?.forEach(item => {
        if (['ko', 'en', 'ja', 'zh', 'es'].includes(item.language)) {
          result[item.language as SupportedLanguage] = item.content;
        }
      });

      console.log(`✅ 다국어 조회 완료:`, Object.keys(result));
      return result;

    } catch (error) {
      console.error('❌ 다국어 조회 중 오류:', error);
      return {};
    }
  }

  /**
   * 🚀 스마트 언어 전환 (캐시 우선)
   */
  static async smartLanguageSwitch(
    locationName: string,
    targetLanguage: SupportedLanguage,
    userProfile?: any
  ): Promise<SmartLanguageSwitchResult> {
    
    try {
      console.log(`🔄 스마트 언어 전환: ${locationName} → ${targetLanguage}`);
      
      // 1. 캐시 확인 (DB에서 기존 데이터)
      const cached = await this.getGuideByLanguage(locationName, targetLanguage);
      
      if (cached.exists && cached.data) {
        console.log(`⚡ 캐시된 ${targetLanguage} 가이드 반환`);
        return { 
          success: true, 
          data: cached.data, 
          source: 'cache' 
        };
      }

      // 2. 캐시 미스 - 새로 생성
      console.log(`🎨 새로운 ${targetLanguage} 가이드 생성 중...`);
      
      const newGuide = await this.generateAndSaveGuide(
        locationName, 
        targetLanguage, 
        userProfile
      );

      if (newGuide.success) {
        return { 
          success: true, 
          data: newGuide.data, 
          source: 'generated' 
        };
      } else {
        return { 
          success: false, 
          source: 'generated',
          error: newGuide.error 
        };
      }

    } catch (error) {
      console.error('❌ 스마트 언어 전환 실패:', error);
      return { 
        success: false, 
        source: 'generated',
        error 
      };
    }
  }

  /**
   * 🎨 새 가이드 생성 및 저장
   */
  static async generateAndSaveGuide(
    locationName: string,
    language: SupportedLanguage,
    userProfile?: any
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    
    try {
      // 기존 프롬프트 시스템 활용 (품질 보장)
      const prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
      
      console.log(`📝 ${language} 프롬프트 준비 완료: ${prompt.length}자`);

      // Gemini API 호출
      const response = await fetch(`${process.env.GEMINI_API_BASE_URL}/v1beta/models/gemini-pro:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
            topK: 40,
            topP: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API 오류: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('AI 응답이 비어있습니다');
      }

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