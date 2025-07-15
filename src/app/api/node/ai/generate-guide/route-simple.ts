import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

// 간단한 정규화 함수
function normalize(str: string): string {
  return str.trim().toLowerCase();
}

// AI 생성 함수
async function generateGuideWithAI(locationName: string, language: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
  });

  const prompt = await createAutonomousGuidePrompt(locationName, language);
  const result = await model.generateContent(prompt);
  const responseText = await result.response.text();

  // JSON 파싱
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const cleanedString = codeBlockMatch ? codeBlockMatch[1] : responseText;
  const jsonStart = cleanedString.indexOf('{');
  const jsonEnd = cleanedString.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('Invalid JSON response');
  }

  const jsonContent = cleanedString.substring(jsonStart, jsonEnd + 1);
  const parsed = JSON.parse(jsonContent);
  
  return parsed.content || parsed;
}

export async function POST(req: NextRequest) {
  console.log('📍 Simple API 호출');
  
  try {
    const { locationName, language = 'ko', forceRegenerate = false } = await req.json();
    
    if (!locationName) {
      return NextResponse.json({ success: false, error: '위치 정보가 필요합니다' }, { status: 400 });
    }

    const normLocation = normalize(locationName);
    const normLang = normalize(language);
    
    console.log('🔍 정규화된 파라미터:', { normLocation, normLang });

    // 1. 캐시 확인 (강제 재생성이 아닌 경우에만)
    if (!forceRegenerate) {
      const { data: cached } = await supabase
        .from('guides')
        .select('content')
        .eq('locationname', normLocation)
        .eq('language', normLang)
        .maybeSingle();

      if (cached) {
        console.log('✅ 캐시된 데이터 반환');
        return NextResponse.json({
          success: true,
          data: { content: cached.content },
          cached: 'hit'
        });
      }
    }

    // 2. AI로 새 가이드 생성
    console.log('🤖 AI 가이드 생성 시작');
    const aiContent = await generateGuideWithAI(locationName, language);

    // 3. UPSERT로 저장 (중복 키 문제 없음!)
    console.log('💾 UPSERT로 저장');
    const { data: saved, error } = await supabase
      .from('guides')
      .upsert({
        locationname: normLocation,
        language: normLang,
        content: aiContent,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'locationname,language' 
      })
      .select('content')
      .single();

    if (error) {
      console.error('❌ 저장 에러:', error);
      return NextResponse.json({ success: false, error: `저장 실패: ${error.message}` }, { status: 500 });
    }

    console.log('✅ 저장 완료');
    return NextResponse.json({
      success: true,
      data: { content: saved.content },
      cached: 'miss'
    });

  } catch (error) {
    console.error('❌ API 에러:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
} 