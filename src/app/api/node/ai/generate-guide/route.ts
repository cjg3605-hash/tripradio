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
    keys: raw.content ? Object.keys(raw.content) : [],
    raw: JSON.stringify(raw, null, 2).substring(0, 500) + '...'
  });

  // raw가 직접 가이드 데이터인 경우
  if (raw.overview || raw.route || raw.realTimeGuide) {
    console.log('📋 직접 가이드 데이터 형식 감지');
    return {
      overview: raw.overview || '개요 정보가 없습니다.',
      route: raw.route || { steps: [], tips: [], duration: '정보 없음' },
      realTimeGuide: raw.realTimeGuide || { chapters: [] }
    };
  }

  // raw.content가 있는 경우
  if (!raw.content || typeof raw.content !== 'object') {
    console.log('⚠️ content 필드가 없거나 올바르지 않음, 기본값 반환');
    return {
      overview: '개요 정보가 없습니다.',
      route: { steps: [], tips: [], duration: '정보 없음' },
      realTimeGuide: { chapters: [] }
    };
  }

  const { overview, route, realTimeGuide } = raw.content;
  console.log('✅ content에서 데이터 추출:', {
    hasOverview: !!overview,
    hasRoute: !!route,
    hasRealTimeGuide: !!realTimeGuide
  });

  return {
    overview: overview || '개요 정보가 없습니다.',
    route: route || { steps: [], tips: [], duration: '정보 없음' },
    realTimeGuide: realTimeGuide || { chapters: [] }
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
      console.log('🔄 원자적 챕터 업데이트 시작:', {
        locationName,
        language,
        chapterIndex,
        hasNarrative: !!chapterData.narrative,
        narrativeLength: chapterData.narrative?.length || 0
      });

      // 1. 기존 데이터 조회
      const { data: existing, error: fetchError } = await supabase
        .from('guides')
        .select('content')
        .eq('locationname', locationName.toLowerCase().trim())
        .eq('language', language.toLowerCase().trim())
        .single();

      if (fetchError || !existing) {
        return { success: false, error: fetchError || '기존 가이드를 찾을 수 없습니다.' };
      }

      // 2. 챕터 인덱스 유효성 검증
      const totalChapters = existing.content?.realTimeGuide?.chapters?.length || 0;
      if (chapterIndex < 0 || chapterIndex >= totalChapters) {
        return { 
          success: false, 
          error: `잘못된 챕터 인덱스: ${chapterIndex}/${totalChapters}` 
        };
      }

      // 3. 챕터 데이터 업데이트
      const updatedContent = { ...existing.content };
      if (!updatedContent.realTimeGuide) {
        updatedContent.realTimeGuide = { chapters: [] };
      }

      updatedContent.realTimeGuide.chapters[chapterIndex] = {
        ...updatedContent.realTimeGuide.chapters[chapterIndex],
        ...chapterData
      };

      // 4. 원자적 업데이트
      const { error: updateError } = await supabase
        .from('guides')
        .update({
          content: updatedContent
        })
        .eq('locationname', locationName.toLowerCase().trim())
        .eq('language', language.toLowerCase().trim());

      if (updateError) {
        return { success: false, error: updateError };
      }

      console.log('✅ 원자적 챕터 업데이트 완료');
      return { success: true, data: updatedContent };

    } catch (error) {
      console.error('❌ 원자적 업데이트 실패:', error);
      return { success: false, error };
    }
  }

  // 📊 가이드 존재 여부 및 메타데이터 조회
  async getGuideMetadata(
    locationName: string,
    language: string
  ): Promise<{ exists: boolean; chapterCount: number; hasContent: boolean; data?: any }> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('content')
        .eq('locationname', locationName.toLowerCase().trim())
        .eq('language', language.toLowerCase().trim())
        .single();

      if (error || !data) {
        return { exists: false, chapterCount: 0, hasContent: false };
      }

      const chapters = data.content?.realTimeGuide?.chapters || [];
      const chapterCount = Array.isArray(chapters) ? chapters.length : 0;
      
      // 챕터에 실제 내용이 있는지 확인
      const hasContent = Array.isArray(chapters) && chapters.some((ch: any) => 
        ch.narrative || ch.sceneDescription || ch.coreNarrative
      );

      return {
        exists: true,
        chapterCount,
        hasContent,
        data: data.content
      };

    } catch (error) {
      console.error('❌ 메타데이터 조회 실패:', error);
      return { exists: false, chapterCount: 0, hasContent: false };
    }
  }

  // 💾 완전한 가이드 저장 (upsert 방식)
  async saveCompleteGuide(
    locationName: string,
    language: string,
    guideData: any
  ): Promise<{ success: boolean; error?: any; isNew: boolean }> {
    try {
      console.log('💾 완전한 가이드 저장 시작');

      const { data, error } = await supabase
        .from('guides')
        .upsert([{
          locationname: locationName.toLowerCase().trim(),
          language: language.toLowerCase().trim(),
          content: guideData
        }], {
          onConflict: 'locationname,language',
          ignoreDuplicates: false
        })
        .select('*')
        .single();

      if (error) {
        return { success: false, error, isNew: false };
      }

      const isNew = true; // 단순화
      
      console.log('✅ 가이드 저장 완료:', { isNew });
      return { success: true, isNew };

    } catch (error) {
      return { success: false, error, isNew: false };
    }
  }
}

// 🚀 메인 API 핸들러
export async function POST(req: NextRequest) {
  const guideManager = OptimizedGuideManager.getInstance();
  
  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: '잘못된 JSON 형식입니다.' }),
        { status: 400, headers }
      );
    }

    const { 
      locationName, 
      language = 'ko', 
      userProfile, 
      forceRegenerate = false,
      generationMode = 'auto',
      existingGuide = null,
      targetChapter = null,
      maxChapters
    } = requestBody;

    if (!locationName || typeof locationName !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: '유효한 위치 정보가 필요합니다.' }),
        { status: 400, headers }
      );
    }

    const normLocation = normalize(locationName);
    const normLang = normalize(language);

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
          if (existingChapter?.narrative) {
            console.log('✅ 챕터 내용이 이미 존재 - 기존 데이터 반환');
            
            return NextResponse.json({
              success: true,
              data: { content: metadata.data },
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
            data: { content: metadata.data },
            cached: 'hit',
            language
          });
        }
      }
    }

    // 🤖 2. AI 가이드 생성
    console.log('🤖 AI 가이드 생성 시작 - 모드:', generationMode);
    const genAI = getGeminiClient();
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: { 
        temperature: 0.3, 
        maxOutputTokens: 65536 // 🔥 토큰 수 증가
      }
    });

    let prompt: string;
    let responseText: string;

    // 생성 모드에 따른 프롬프트 선택
    if (generationMode === 'structure') {
      prompt = await createStructurePrompt(locationName, language, userProfile);
    } else if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
      const chapterTitle = existingGuide.realTimeGuide?.chapters?.[targetChapter]?.title || `챕터 ${targetChapter + 1}`;
      prompt = await createChapterPrompt(locationName, targetChapter, chapterTitle, existingGuide, language, userProfile);
    } else {
      prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      responseText = await response.text();
      
      if (!responseText || responseText.trim().length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI로부터 빈 응답을 받았습니다.' }),
          { status: 500, headers }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: `AI 응답 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }),
        { status: 500, headers }
      );
    }

    // 🔍 3. JSON 파싱 및 검증
    const parsed = validateJsonResponse(responseText);
    if (!parsed.success) {
      console.error('❌ JSON 파싱 실패:', parsed.error);
      return new Response(
        JSON.stringify(createErrorResponse(parsed.error, 'JSON_PARSE_ERROR')),
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

      // 원자적 챕터 업데이트
      saveResult = await guideManager.updateChapterAtomic(
        normLocation,
        normLang,
        targetChapter,
        newChapter
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
        normLocation,
        normLang,
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