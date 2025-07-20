// src/lib/multilang-guide-manager.ts
import { supabase } from '@/lib/supabaseClient';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini 클라이언트 초기화 함수
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
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
  static async getGuideByLanguage(locationName: string, language: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    source: 'cache' | 'database';
  }> {
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
          return { success: false, error: 'NOT_FOUND', source: 'database' };
        }
        console.error(`❌ ${language} 가이드 조회 실패:`, error);
        return { success: false, error: error.message, source: 'database' };
      }

      console.log(`✅ ${language} 가이드 발견:`, locationName);
      return { success: true, data: data.guide_data, source: 'cache' };

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

      // 기본 가이드 프롬프트 생성 (간단한 버전)
      const prompt = `# "${locationName}" 가이드 생성
언어: ${language}

다음 JSON 형식으로 가이드를 생성해주세요:

{
  "overview": {
    "title": "${locationName}",
    "summary": "상세한 설명",
    "keyFacts": ["중요한 사실들"],
    "visitInfo": {},
    "narrativeTheme": "테마"
  },
  "route": {
    "steps": []
  },
  "realTimeGuide": {
    "chapters": [
      {
        "number": 1,
        "title": "챕터 제목",
        "content": "상세한 내용",
        "duration": "5분",
        "narrative": "오디오 가이드 내용"
      }
    ]
  }
}

${locationName}에 대한 상세하고 흥미로운 가이드를 ${language}로 작성해주세요.`;
      
      console.log(`📝 ${language} 프롬프트 준비 완료: ${prompt.length}자`);

      // Gemini 클라이언트 초기화
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
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
      const text = response.text();
      
      if (!text) {
        throw new Error('AI 응답이 비어있습니다');
      }

      console.log(`📥 ${language} AI 응답 수신: ${text.length}자`);

      // JSON 파싱 시도
      let guideData;
      try {
        // JSON 블록 추출 시도
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          guideData = JSON.parse(jsonMatch[0]);
        } else {
          // JSON 블록이 없으면 전체 텍스트를 기본 구조로 래핑
          guideData = {
            overview: {
              title: locationName,
              summary: text.substring(0, 500),
              keyFacts: [],
              visitInfo: {},
              narrativeTheme: ''
            },
            route: { steps: [] },
            realTimeGuide: { chapters: [] }
          };
        }
      } catch (parseError) {
        console.warn('JSON 파싱 실패, 기본 구조 사용:', parseError);
        guideData = {
          overview: {
            title: locationName,
            summary: text.substring(0, 500),
            keyFacts: [],
            visitInfo: {},
            narrativeTheme: ''
          },
          route: { steps: [] },
          realTimeGuide: { chapters: [] }
        };
      }

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