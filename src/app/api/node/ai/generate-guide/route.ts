// 🚀 기존 프로젝트와 호환되는 성능 최적화된 API 라우트
// src/app/api/node/ai/generate-guide/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { 
  createAutonomousGuidePrompt, 
  createStructurePrompt, 
  createChapterPrompt, 
  getRecommendedSpotCount 
} from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';
import { 
  saveGuideWithChapters, 
  getGuideWithDetailedChapters, 
  updateChapterDetails,
  hasChapterDetails 
} from '@/lib/supabaseGuideHistory';
import { validateJsonResponse, createErrorResponse } from '@/lib/utils';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// 🔧 유틸리티 함수들
function normalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s가-힣]/g, '');
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Server configuration error: Missing API key');
  }
  return new GoogleGenerativeAI(apiKey);
}

function normalizeGuideData(raw: any, language?: string) {
  console.log('🔍 원본 데이터 구조 확인:', {
    hasContent: !!raw.content,
    contentType: typeof raw.content,
    directKeys: Object.keys(raw || {}),
    contentKeys: raw.content ? Object.keys(raw.content) : []
  });

  // AI가 생성한 실제 데이터 구조 확인
  let sourceData = raw;
  
  // raw.content가 있으면 그것을 사용, 없으면 raw 직접 사용
  if (raw.content && typeof raw.content === 'object') {
    sourceData = raw.content;
    console.log('📦 content 필드에서 데이터 추출');
  } else if (raw.overview || raw.route || raw.realTimeGuide) {
    sourceData = raw;
    console.log('📦 직접 구조에서 데이터 추출');
  } else {
    console.error('❌ 올바른 가이드 구조를 찾을 수 없음:', raw);
    throw new Error('AI가 생성한 가이드 데이터 구조가 올바르지 않습니다');
  }

  // ✅ 실제 AI 데이터에서 필요한 부분만 추출 (더미 데이터 없음)
  return {
    overview: sourceData.overview || { 
      title: '가이드', 
      summary: '', 
      keyFacts: [], 
      visitInfo: {} 
    },
    route: sourceData.route || { steps: [] },
    realTimeGuide: sourceData.realTimeGuide || { chapters: [] }
  };
}

// 🚀 성능 최적화된 가이드 관리 클래스
class OptimizedGuideManager {
  private static instance: OptimizedGuideManager;
  
  static getInstance(): OptimizedGuideManager {
    if (!OptimizedGuideManager.instance) {
      OptimizedGuideManager.instance = new OptimizedGuideManager();
    }
    return OptimizedGuideManager.instance;
  }

  // 🎯 원자적 챕터 업데이트 (단일 JSONB 방식)
  async updateChapterAtomic(
    locationName: string,
    language: string,
    chapterIndex: number,
    chapterData: any
  ): Promise<{ success: boolean; error?: any; data?: any }> {
    try {
      const normLocation = normalize(locationName);
      const key = `${normLocation}_${language}`;

      // 기존 가이드 조회
      const { data: existing, error: fetchError } = await supabase
        .from('guides')
        .select('content')
        .eq('location_key', key)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existing?.content) {
        throw new Error('기존 가이드를 찾을 수 없습니다');
      }

      // 챕터 업데이트
      const updatedContent = { ...existing.content };
      if (!updatedContent.realTimeGuide) {
        updatedContent.realTimeGuide = { chapters: [] };
      }
      if (!updatedContent.realTimeGuide.chapters) {
        updatedContent.realTimeGuide.chapters = [];
      }

      // 챕터 배열 확장 (필요시)
      while (updatedContent.realTimeGuide.chapters.length <= chapterIndex) {
        updatedContent.realTimeGuide.chapters.push({
          id: updatedContent.realTimeGuide.chapters.length,
          title: `챕터 ${updatedContent.realTimeGuide.chapters.length + 1}`,
          content: []
        });
      }

      // 챕터 데이터 업데이트
      updatedContent.realTimeGuide.chapters[chapterIndex] = {
        ...updatedContent.realTimeGuide.chapters[chapterIndex],
        ...chapterData,
        id: chapterIndex
      };

      // 데이터베이스 업데이트
      const { error: updateError } = await supabase
        .from('guides')
        .update({ 
          content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('location_key', key);

      if (updateError) throw updateError;

      return { success: true, data: updatedContent };

    } catch (error) {
      console.error('❌ 챕터 업데이트 실패:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 🎯 완전한 가이드 저장
  async saveCompleteGuide(
    locationName: string,
    language: string,
    guideData: any
  ): Promise<{ success: boolean; error?: any; isNew?: boolean }> {
    try {
      const normLocation = normalize(locationName);
      const key = `${normLocation}_${language}`;

      // 기존 가이드 확인
      const { data: existing, error: fetchError } = await supabase
        .from('guides')
        .select('id')
        .eq('location_key', key)
        .single();

      const isNew = !existing;

      if (isNew) {
        // 새로운 가이드 생성
        const { error: insertError } = await supabase
          .from('guides')
          .insert({
            location_key: key,
            location_name: locationName,
            language: language,
            content: guideData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      } else {
        // 기존 가이드 업데이트
        const { error: updateError } = await supabase
          .from('guides')
          .update({ 
            content: guideData,
            updated_at: new Date().toISOString()
          })
          .eq('location_key', key);

        if (updateError) throw updateError;
      }

      return { success: true, isNew };

    } catch (error) {
      console.error('❌ 가이드 저장 실패:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      };
    }
  }

  // 🎯 가이드 메타데이터 조회
  async getGuideMetadata(
    locationName: string,
    language: string
  ): Promise<{ exists: boolean; hasContent: boolean; chapterCount: number; data?: any }> {
    try {
      const normLocation = normalize(locationName);
      const key = `${normLocation}_${language}`;

      const { data, error } = await supabase
        .from('guides')
        .select('content')
        .eq('location_key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data?.content) {
        return { exists: false, hasContent: false, chapterCount: 0 };
      }

      const chapterCount = data.content.realTimeGuide?.chapters?.length || 0;
      const hasContent = !!(data.content.overview && data.content.route && data.content.realTimeGuide);

      return { 
        exists: true, 
        hasContent, 
        chapterCount, 
        data: data.content 
      };

    } catch (error) {
      console.error('❌ 메타데이터 조회 실패:', error);
      return { exists: false, hasContent: false, chapterCount: 0 };
    }
  }
}

// POST 메서드 핸들러
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 최적화된 가이드 생성 API 시작');

    const body = await request.json();
    const { 
      locationName, 
      language = 'ko', 
      userProfile,
      forceRegenerate = false,
      generationMode = 'autonomous',
      targetChapter = null
    } = body;

    // 입력 검증
    if (!locationName?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: '위치 이름을 입력해주세요.' }),
        { status: 400, headers }
      );
    }

    const guideManager = OptimizedGuideManager.getInstance();
    const normLocation = normalize(locationName);
    const normLang = normalize(language);

    // 기존 가이드 확인
    let existingGuide: any = null;
    if (generationMode === 'chapter') {
      const metadata = await guideManager.getGuideMetadata(normLocation, normLang);
      if (metadata.exists && metadata.data) {
        existingGuide = metadata.data;
      }
    }

    // 🔍 1. 성능 최적화된 캐시 확인
    if (!forceRegenerate) {
      const metadata = await guideManager.getGuideMetadata(normLocation, normLang);
      
      if (metadata.exists) {
        // 챕터 생성 모드인 경우 특정 챕터 확인
        if (generationMode === 'chapter' && targetChapter !== null) {
          if (targetChapter < 0 || targetChapter >= metadata.chapterCount) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `잘못된 챕터 인덱스: ${targetChapter}/${metadata.chapterCount}` 
              }),
              { status: 400, headers }
            );
          }

          const existingChapter = metadata.data?.realTimeGuide?.chapters?.[targetChapter];
          if (existingChapter?.sceneDescription) {
            console.log('✅ 챕터 내용이 이미 존재 - 기존 데이터 반환');
            
            return NextResponse.json({
              success: true,
              data: metadata.data,
              cached: 'hit',
              language,
              message: '챕터 내용이 이미 존재합니다.'
            });
          }
        } else if (metadata.hasContent) {
          // 일반 모드에서 내용이 있으면 반환
          console.log('✅ 캐시된 가이드 반환');
          
          return NextResponse.json({
            success: true,
            data: metadata.data,
            cached: 'hit',
            language
          });
        }
      }
    }

    // 🤖 2. AI 가이드 생성
    console.log('🤖 AI 가이드 생성 시작 - 모드:', generationMode);

    let prompt: string;

    // 생성 모드에 따른 프롬프트 선택 (await 사용)
    if (generationMode === 'structure') {
      prompt = await createStructurePrompt(locationName, language, userProfile);
    } else if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
      const chapterTitle = existingGuide.realTimeGuide?.chapters?.[targetChapter]?.title || `챕터 ${targetChapter + 1}`;
      prompt = await createChapterPrompt(locationName, targetChapter, chapterTitle, existingGuide, language, userProfile);
    } else {
      prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
    }

    // 재시도 로직이 포함된 AI 응답 생성
    const generateWithRetry = async (): Promise<string> => {
      const genAI = getGeminiClient();
      const config = {
        temperature: 0.3,
        maxOutputTokens: generationMode === 'chapter' ? 8000 : 16384, // 대폭 증가
        topP: 0.8,
        topK: 40
      };

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite-preview-06-17",
        generationConfig: config
      });

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 AI 생성 시도 ${attempt}/3`);
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          if (!text?.trim()) {
            throw new Error('빈 응답');
          }

          return text;
        } catch (error) {
          console.error(`❌ 시도 ${attempt} 실패:`, error);
          
          if (attempt === 3) {
            throw new Error(`3회 시도 후 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
          }
          
          // 재시도 전 대기
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      throw new Error('모든 재시도 실패');
    };

    const aiResponse = await generateWithRetry();

    // 🔍 3. JSON 응답 검증 및 파싱
    let parsed: { success: boolean; data?: any; error?: string };
    
    try {
      // AI 응답에서 JSON 추출
      const jsonMatch = aiResponse.match(/\{.*\}/s);
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      parsed = { success: true, data: jsonData };
    } catch (error) {
      parsed = { 
        success: false, 
        error: error instanceof Error ? error.message : '파싱 실패' 
      };
    }

    if (!parsed.success || !parsed.data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `AI 응답 파싱 실패: ${parsed.error}`,
          rawResponse: aiResponse.substring(0, 500)
        }),
        { status: 500, headers }
      );
    }

    // 🎯 4. 성능 최적화된 데이터 저장
    let finalData;
    let saveResult;

    if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
      // 챕터 생성 모드: 원자적 업데이트
      const newChapter = parsed.data.chapter;
      
      if (!newChapter) {
        return new Response(
          JSON.stringify({ success: false, error: '챕터 데이터가 생성되지 않았습니다.' }),
          { status: 500, headers }
        );
      }

      // 🔥 AI 응답 정규화: 3개 필드를 narrative로 통합
      const normalizedChapter = {
        id: newChapter.id,
        title: newChapter.title,
        narrative: newChapter.narrative || 
          [newChapter.sceneDescription, newChapter.coreNarrative, newChapter.humanStories]
            .filter(Boolean).join(' '),
        nextDirection: newChapter.nextDirection || ''
      };

      // 원자적 챕터 업데이트
      saveResult = await guideManager.updateChapterAtomic(
        locationName,
        language,
        targetChapter,
        normalizedChapter
      );

      if (!saveResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `챕터 업데이트 실패: ${saveResult.error}` 
          }),
          { status: 500, headers }
        );
      }

      finalData = saveResult.data;

    } else {
      // 구조 생성 또는 전체 생성: 완전한 가이드 저장
      finalData = normalizeGuideData(parsed.data, language);
      
      saveResult = await guideManager.saveCompleteGuide(
        locationName,
        language,
        finalData
      );

      if (!saveResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `가이드 저장 실패: ${saveResult.error}` 
          }),
          { status: 500, headers }
        );
      }
    }

    console.log('✅ 최적화된 가이드 생성 및 저장 완료');

    return NextResponse.json({
      success: true,
      data: { content: finalData },
      cached: generationMode === 'chapter' ? 'updated' : (saveResult?.isNew ? 'new' : 'existing'),
      language,
      generationMode,
      targetChapter: generationMode === 'chapter' ? targetChapter : undefined
    });

  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `API 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}

// GET 메서드 추가 (디버깅용)
export async function GET() {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'GET 메서드는 지원하지 않습니다. POST 메서드를 사용해주세요.',
      allowedMethods: ['POST', 'OPTIONS']
    }),
    { 
      status: 405, 
      headers: {
        ...headers,
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}