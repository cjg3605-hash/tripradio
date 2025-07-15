import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

function normalizeString(str: string): string {
  // lib/utils.ts와 동일한 로직으로 통일
  return decodeURIComponent(str || '').trim().toLowerCase();
}

function getGeminiClient(): GoogleGenerativeAI | Response {
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

function parseJsonResponse(jsonString: string): { success: true; data: any } | { success: false; response: Response } {
  if (!jsonString || jsonString === 'undefined' || jsonString.trim() === '' || jsonString === undefined || jsonString === null) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'AI 응답이 비어있거나 undefined/null입니다.',
        }),
        { status: 500 }
      )
    };
  }
  const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let cleanedString = codeBlockMatch ? codeBlockMatch[1] : jsonString;
  const jsonStart = cleanedString.indexOf('{');
  const jsonEnd = cleanedString.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: '응답에서 JSON 시작(`{`) 또는 끝(`}`)을 찾을 수 없습니다.',
        }),
        { status: 500 }
      )
    };
  }
  cleanedString = cleanedString.substring(jsonStart, jsonEnd + 1);
  cleanedString = cleanedString.replace(/^[\uFEFF\s]+/, '');
  cleanedString = cleanedString.replace(/\/\/.*$/gm, '');
  try {
    return { success: true, data: JSON.parse(cleanedString) };
  } catch (error) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'JSON 파싱 실패',
        }),
        { status: 500 }
      )
    };
  }
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
  console.log('📍 /api/node/ai/generate-guide POST 호출됨');
  
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
  console.log('📝 요청 파라미터:', { locationName, language, forceRegenerate });
  
  if (!locationName || typeof locationName !== 'string') {
    console.error('❌ 위치 정보 누락:', locationName);
    return new Response(
      JSON.stringify({ success: false, error: '유효한 위치 정보가 필요합니다.' }),
      { status: 400, headers }
    );
  }

  const normLocation = normalizeString(locationName);
  const normLang = normalizeString(language);
  console.log('🔄 정규화된 파라미터:', { 
    original: { locationName, language }, 
    normalized: { normLocation, normLang },
    lengths: { normLocation: normLocation.length, normLang: normLang.length }
  });

  // guides 테이블에서 locationname+language로 캐시(중복) 조회
  // 먼저 기존 데이터 조회
  console.log('🔍 DB 조회 시작:', { locationname: normLocation, language: normLang });
  const { data: cached, error: cacheError } = await supabase
    .from('guides')
    .select('content')
    .eq('locationname', normLocation)
    .eq('language', normLang)
    .maybeSingle();

  console.log('🔍 DB 조회 결과:', { cached: !!cached, error: cacheError?.message || 'none' });

  // 에러가 발생했지만 레코드가 없다는 에러가 아니라면 실제 에러
  if (cacheError && cacheError.code !== 'PGRST116') {
    console.error('❌ DB 조회 에러:', cacheError);
    return new Response(
      JSON.stringify({ success: false, error: `데이터베이스 조회 실패: ${cacheError.message}` }),
      { status: 500, headers }
    );
  }

  // 캐시된 데이터가 있고 강제 재생성이 아니면 반환
  if (cached && cached.content && !forceRegenerate) {
    console.log('✅ 캐시된 데이터 반환');
    return NextResponse.json({
      success: true,
      data: { content: cached.content },
      cached: 'file',
      language
    });
  }

  // 강제 재생성인 경우에만 기존 데이터 삭제
  if (forceRegenerate && cached) {
    await supabase
      .from('guides')
      .delete()
      .eq('locationname', normLocation)
      .eq('language', normLang);
  }

  // AI로 생성 후 insert
  console.log('🤖 AI 가이드 생성 시작');
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
  console.log('🤖 프롬프트 생성 완료, AI 호출 중...');
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

  const parsed = parseJsonResponse(responseText);
  if (!parsed.success) {
    return parsed.response;
  }
  const normalizedData = normalizeGuideData(parsed.data, language);
  
  // Race condition 방지: AI 생성 완료 후 한 번 더 중복 검사
  console.log('🔄 AI 생성 완료 후 최종 중복 검사');
  const { data: raceCheck, error: raceError } = await supabase
    .from('guides')
    .select('content')
    .eq('locationname', normLocation)
    .eq('language', normLang)
    .maybeSingle();

  if (raceError && raceError.code !== 'PGRST116') {
    console.error('❌ 최종 중복 검사 에러:', raceError);
    return new Response(
      JSON.stringify({ success: false, error: `최종 검사 실패: ${raceError.message}` }),
      { status: 500, headers }
    );
  }

  // 동시 요청으로 인해 이미 데이터가 생성된 경우
  if (raceCheck && raceCheck.content) {
    console.log(`🔄 Race condition 감지: ${normLocation} (${normLang}) - 기존 데이터 반환`);
    return NextResponse.json({
      success: true,
      data: { content: raceCheck.content },
      cached: 'race_prevented',
      language
    });
  }
  
  // 중복 키 처리를 위한 insert 시도
  const insertData = {
    locationname: normLocation,
    language: normLang,
    content: normalizedData,
    created_at: new Date().toISOString()
  };
  
  console.log('📥 DB INSERT 시도:', {
    locationname: insertData.locationname,
    language: insertData.language,
    locationname_bytes: Buffer.from(insertData.locationname).toString('hex'),
    language_bytes: Buffer.from(insertData.language).toString('hex')
  });
  
  const { error: insertError } = await supabase
    .from('guides')
    .insert([insertData]);

  // 중복 키 에러(23505)인 경우 처리
  if (insertError && insertError.code === '23505') {
    console.log(`중복 키 감지: ${normLocation} (${normLang}) - 기존 레코드 조회`);
    
    // 잠시 대기 후 재조회 (race condition 대응)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data: existing, error: fetchError } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .maybeSingle();

    if (fetchError) {
      console.error(`기존 레코드 조회 에러:`, fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `기존 가이드 조회 실패: ${fetchError.message}`,
          language
        }),
        { status: 500, headers }
      );
    }

    if (existing && existing.content) {
      console.log(`✅ 기존 레코드 발견 및 반환: ${normLocation} (${normLang})`);
      return NextResponse.json({
        success: true,
        data: { content: existing.content },
        cached: 'existing',
        language
      });
    }

    // 중복 키 오류가 발생했지만 레코드를 찾을 수 없는 경우
    // 이는 데이터베이스 일관성 문제이므로 문제 레코드를 삭제하고 재시도
    console.warn(`🔧 일관성 문제 감지: ${normLocation} (${normLang}) - 문제 레코드 정리 시도`);
    
    try {
      // 문제가 되는 레코드 삭제 시도
      await supabase
        .from('guides')
        .delete()
        .eq('locationname', normLocation)
        .eq('language', normLang);
      
      // 정리 후 다시 insert 시도
      const { error: retryInsertError } = await supabase
        .from('guides')
        .insert([
          {
            locationname: normLocation,
            language: normLang,
            content: normalizedData,
            created_at: new Date().toISOString()
          }
        ]);

      if (retryInsertError) {
        console.error(`재시도 insert 실패:`, retryInsertError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `데이터 저장 재시도 실패: ${retryInsertError.message}`,
            language
          }),
          { status: 500, headers }
        );
      }

      console.log(`✅ 문제 해결 및 저장 완료: ${normLocation} (${normLang})`);
      return NextResponse.json({
        success: true,
        data: { content: normalizedData },
        cached: 'recovery_insert',
        language
      });

    } catch (recoveryError) {
      console.error(`복구 과정 실패:`, recoveryError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `데이터베이스 일관성 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`,
          language
        }),
        { status: 500, headers }
      );
    }
  }

  // 다른 insert 에러인 경우 실패 처리
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

  // 정상적으로 insert 된 경우, 새로 생성된 데이터 반환
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