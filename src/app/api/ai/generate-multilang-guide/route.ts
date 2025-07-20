import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';

export const runtime = 'nodejs';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName, language, userProfile } = body;

    if (!locationName || !language) {
      return NextResponse.json(
        { 
          success: false, 
          error: '위치명과 언어는 필수입니다.' 
        },
        { status: 400 }
      );
    }

    console.log(`🤖 ${language} 가이드 생성 시작:`, locationName);

    // 언어별 정교한 프롬프트 생성
    const prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
    
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
        
        // 🔥 핵심: 3개 필드를 narrative로 통합하는 정규화
        if (guideData.realTimeGuide?.chapters) {
          guideData.realTimeGuide.chapters = guideData.realTimeGuide.chapters.map((chapter: any) => {
            // narrative가 있으면 그대로 사용
            if (chapter.narrative) {
              return chapter;
            }
            
            // narrative가 없으면 3개 필드를 합쳐서 narrative로 생성
            const sceneDescription = chapter.sceneDescription || '';
            const coreNarrative = chapter.coreNarrative || '';
            const humanStories = chapter.humanStories || '';
            
            const combinedNarrative = [sceneDescription, coreNarrative, humanStories]
              .filter(Boolean)
              .join(' ');
            
            return {
              ...chapter,
              narrative: combinedNarrative || chapter.title || '',
              // 3개 필드는 제거 (narrative로 통합됨)
              sceneDescription: undefined,
              coreNarrative: undefined,
              humanStories: undefined
            };
          });
        }
        
        // 🔥 새로운 개요 양식 정규화
        if (guideData.overview) {
          // 새로운 필드들이 없으면 기존 summary를 사용
          if (!guideData.overview.location && !guideData.overview.keyFeatures && !guideData.overview.background) {
            // 기존 summary가 있으면 그대로 유지 (호환성)
            if (guideData.overview.summary) {
              console.log(`📝 ${language} 기존 개요 구조 유지`);
            } else {
              // 기본 개요 구조 생성
              guideData.overview = {
                ...guideData.overview,
                location: `${locationName}의 정확한 위치`,
                keyFeatures: `${locationName}의 주요 특징`,
                background: `${locationName}의 역사적 배경`
              };
            }
          } else {
            console.log(`✅ ${language} 새로운 개요 양식 적용`);
          }
        }
        
        console.log(`✅ ${language} 가이드 정규화 완료: ${guideData.realTimeGuide?.chapters?.length || 0}개 챕터`);
      } else {
        // JSON 블록이 없으면 전체 텍스트를 기본 구조로 래핑
        guideData = {
          overview: {
            title: locationName,
            location: `${locationName}의 정확한 위치`,
            keyFeatures: `${locationName}의 주요 특징`,
            background: `${locationName}의 역사적 배경`,
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
          location: `${locationName}의 정확한 위치`,
          keyFeatures: `${locationName}의 주요 특징`,
          background: `${locationName}의 역사적 배경`,
          keyFacts: [],
          visitInfo: {},
          narrativeTheme: ''
        },
        route: { steps: [] },
        realTimeGuide: { chapters: [] }
      };
    }

    console.log(`✅ ${language} 가이드 생성 완료`);
    
    return NextResponse.json({
      success: true,
      data: guideData
    });

  } catch (error) {
    console.error(`❌ 가이드 생성 실패:`, error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `가이드 생성 실패: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}