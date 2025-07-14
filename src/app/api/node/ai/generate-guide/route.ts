import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server configuration error: Missing API key',
      }),
      { status: 500 }
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function parseJsonResponse(jsonString: string) {
  if (!jsonString || jsonString === 'undefined' || jsonString.trim() === '' || jsonString === undefined || jsonString === null) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'AI 응답이 비어있거나 undefined/null입니다.',
      }),
      { status: 500 }
    );
  }
  const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let cleanedString = codeBlockMatch ? codeBlockMatch[1] : jsonString;
  const jsonStart = cleanedString.indexOf('{');
  const jsonEnd = cleanedString.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '응답에서 JSON 시작(`{`) 또는 끝(`}`)을 찾을 수 없습니다.',
      }),
      { status: 500 }
    );
  }
  cleanedString = cleanedString.substring(jsonStart, jsonEnd + 1);
  cleanedString = cleanedString.replace(/^[\uFEFF\s]+/, '');
  cleanedString = cleanedString.replace(/\/\/.*$/gm, '');
  return JSON.parse(cleanedString);
}

function normalizeGuideData(raw: any, language?: string) {
  if (!raw.content || typeof raw.content !== 'object') {
    return {
      overview: '개요 정보가 없습니다.',
      route: { steps: [], tips: [], duration: '정보 없음' },
      realTimeGuide: { chapters: [] }
    };
  }
  const { overview, route, realTimeGuide } = raw.content;
  return {
    overview: overview || '개요 정보가 없습니다.',
    route: route || { steps: [], tips: [], duration: '정보 없음' },
    realTimeGuide: realTimeGuide || { chapters: [] }
  };
}

export async function POST(req: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: '잘못된 JSON 형식입니다.' }),
      { status: 400, headers }
    );
  }

  const { locationName, language = 'ko', userProfile, forceRegenerate = false } = requestBody;
  if (!locationName || typeof locationName !== 'string') {
    return new Response(
      JSON.stringify({ success: false, error: '유효한 위치 정보가 필요합니다.' }),
      { status: 400, headers }
    );
  }

  const normLocation = normalizeString(locationName);
  const normLang = normalizeString(language);

  // guides 테이블에서 locationname+language로 캐시(중복) 조회
  const { data: cached } = await supabase
    .from('guides')
    .select('content')
    .eq('locationname', normLocation)
    .eq('language', normLang)
    .maybeSingle();

  if (cached && cached.content && !forceRegenerate) {
    return NextResponse.json({
      success: true,
      data: { content: cached.content },
      cached: 'file',
      language
    });
  }

  if (forceRegenerate) {
    await supabase
      .from('guides')
      .delete()
      .filter('locationname', 'eq', normLocation)
      .filter('language', 'eq', normLang);
  }

  // AI로 생성 후 insert
  const genAI = getGeminiClient();
  if (genAI instanceof Response) return genAI;
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192
    }
  });
  const autonomousPrompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
  let responseText: string;
  try {
    const result = await model.generateContent(autonomousPrompt);
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
  let parsedData;
  try {
    parsedData = parseJsonResponse(responseText);
  } catch (parseError) {
    return new Response(
      JSON.stringify({ success: false, error: `AI 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 파싱 오류'}` }),
      { status: 500, headers }
    );
  }
  const normalizedData = normalizeGuideData(parsedData, language);
  const { error: insertError } = await supabase
    .from('guides')
    .insert([
      {
        locationname: normLocation,
        language: normLang,
        content: normalizedData,
        created_at: new Date().toISOString()
      }
    ], { onConflict: ['locationname', 'language'] });
  if (insertError && insertError.code !== '23505') {
    return new Response(
      JSON.stringify({
        success: false,
        error: `가이드 저장 실패: ${insertError.message}`,
        language
      }),
      { status: 500, headers }
    );
  }
  const { data: selected, error: selectError } = await supabase
    .from('guides')
    .select('content')
    .eq('locationname', normLocation)
    .eq('language', normLang)
    .maybeSingle();

  if (selectError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `가이드 조회 실패: ${selectError.message}`,
        language
      }),
      { status: 500, headers }
    );
  }
  if (!selected) {
    return NextResponse.json({
      success: false,
      error: '가이드 데이터가 존재하지 않습니다.',
      language
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: { content: selected.content },
    cached: 'miss',
    language
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}