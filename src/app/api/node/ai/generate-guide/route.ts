import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { createStructurePrompt, createChapterPrompt, getRecommendedSpotCount } from '@/lib/ai/prompts/korean';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

// 간단한 정규화 함수
function normalize(str: string): string {
  return str.trim().toLowerCase();
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

// parseJsonResponse는 utils.ts의 validateJsonResponse로 대체됨
import { validateJsonResponse, createErrorResponse, createSuccessResponse } from '@/lib/utils';

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

  const { 
    locationName, 
    language = 'ko', 
    userProfile, 
    forceRegenerate = false,
    generationMode = 'auto', // 'auto' | 'structure' | 'chapter'
    existingGuide = null,
    targetChapter = null,
    maxChapters
  } = requestBody;
  
  // 위치 유형별 권장 스팟 수 동적 계산
  const spotCount = getRecommendedSpotCount(locationName);
  const finalMaxChapters = maxChapters || spotCount.default;
  console.log('📝 요청 파라미터:', { 
    locationName, 
    language, 
    forceRegenerate, 
    generationMode, 
    targetChapter,
    spotCountInfo: spotCount,
    finalMaxChapters 
  });
  
  if (!locationName || typeof locationName !== 'string') {
    console.error('❌ 위치 정보 누락:', locationName);
    return new Response(
      JSON.stringify({ success: false, error: '유효한 위치 정보가 필요합니다.' }),
      { status: 400, headers }
    );
  }

  const normLocation = normalize(locationName);
  const normLang = normalize(language);
  console.log('🔄 정규화된 파라미터:', { 
    original: { locationName, language }, 
    normalized: { normLocation, normLang },
    lengths: { normLocation: normLocation.length, normLang: normLang.length }
  });

  // 1. 캐시 확인 (강제 재생성이 아닌 경우에만)
  // 🚨 중요: 챕터 생성 모드일 때는 캐시를 사용하지 않음
  if (!forceRegenerate && generationMode !== 'chapter') {
    console.log('🔍 캐시 확인 중...');
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
        cached: 'hit',
        language
      });
    }
  }

  // 2. AI로 새 가이드 생성
  console.log('🤖 AI 가이드 생성 시작 - 모드:', generationMode);
  const genAI = getGeminiClient();
  if (genAI instanceof Response) return genAI;
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: { temperature: 0.3, maxOutputTokens: 16384 } // 단계별로 생성하므로 토큰 수 줄임
  });

  let responseText: string;
  let prompt: string;

  // 생성 모드에 따른 프롬프트 선택
  if (generationMode === 'structure') {
    // 구조만 생성
    console.log('🏗️ 구조 생성 모드');
    prompt = createStructurePrompt(locationName, language, userProfile);
  } else if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
    // 특정 챕터 생성
    console.log('📖 챕터 생성 모드 상세:', {
      targetChapter,
      hasExistingGuide: !!existingGuide,
      hasRealTimeGuide: !!existingGuide.realTimeGuide,
      hasChapters: !!existingGuide.realTimeGuide?.chapters,
      chaptersLength: existingGuide.realTimeGuide?.chapters?.length || 0,
      targetChapterExists: !!existingGuide.realTimeGuide?.chapters?.[targetChapter],
      allChapterTitles: existingGuide.realTimeGuide?.chapters?.map((ch: any) => ch.title) || []
    });
    const chapterTitle = existingGuide.realTimeGuide?.chapters?.[targetChapter]?.title || `챕터 ${targetChapter + 1}`;
    console.log('📖 챕터 제목 확정:', chapterTitle);
    prompt = createChapterPrompt(locationName, targetChapter, chapterTitle, existingGuide, language, userProfile);
    console.log('📝 챕터 프롬프트 생성 완료:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 300) + '...',
      chapterTitle,
      targetChapter
    });
  } else {
    // 기존 방식 (자동 완성 시도)
    console.log('🔄 자동 완성 모드');
    prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
  }
  
  try {
    console.log('🚀 AI 요청 시작:', { 
      mode: generationMode, 
      targetChapter, 
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 200) + '...' 
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = await response.text();
    console.log('🤖 AI 응답 수신:', {
      mode: generationMode,
      responseLength: responseText.length,
      responseStart: responseText.substring(0, 200) + '...',
      responseEnd: responseText.slice(-200)
    });
    
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

  // 🔍 AI 응답 전체 로깅 (디버깅용)
  console.log('🤖 AI 전체 응답 로깅:', {
    fullResponse: responseText,
    responseLength: responseText.length,
    containsChapter: responseText.includes('chapter'),
    containsNarrative: responseText.includes('narrative'),
    containsCodeBlock: responseText.includes('```'),
    startsWithBrace: responseText.trim().startsWith('{'),
    endsWithBrace: responseText.trim().endsWith('}'),
    responsePreview: responseText.substring(0, 500) + '...',
    responseEnding: '...' + responseText.substring(Math.max(0, responseText.length - 200))
  });

  const parsed = validateJsonResponse(responseText);
  if (!parsed.success) {
    console.error('❌ JSON 파싱 실패:', {
      error: parsed.error,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 1000) + '...',
      fullResponse: responseText
    });
    return new Response(
      JSON.stringify(createErrorResponse(parsed.error, 'JSON_PARSE_ERROR')),
      { status: 500, headers }
    );
  }

  console.log('✅ JSON 파싱 성공:', {
    dataKeys: Object.keys(parsed.data),
    hasContent: !!parsed.data.content,
    dataStructure: JSON.stringify(parsed.data, null, 2).substring(0, 500) + '...'
  });

  let finalData;

  // 생성 모드에 따른 데이터 처리
  if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
    // 챕터 생성 모드: 기존 가이드에 새 챕터 추가
    console.log('📖 챕터 통합 시작:', {
      parsedDataKeys: Object.keys(parsed.data),
      hasChapter: !!parsed.data.chapter,
      chapterStructure: parsed.data.chapter ? Object.keys(parsed.data.chapter) : [],
      chapterContent: parsed.data.chapter,
      fullParsedData: JSON.stringify(parsed.data, null, 2)
    });
    const newChapter = parsed.data.chapter;
    
    if (!newChapter) {
      console.error('❌ 챕터 데이터 없음:', { 
        parsedData: parsed.data,
        fullResponse: responseText.substring(0, 2000) + '...',
        expectedStructure: "{ chapter: { id, title, narrative, nextDirection } }"
      });
      return new Response(
        JSON.stringify({ success: false, error: '챕터 데이터가 생성되지 않았습니다. AI 응답 구조가 올바르지 않습니다.' }),
        { status: 500, headers }
      );
    }

    // 챕터 제목 추출
    const chapterTitle = existingGuide.realTimeGuide?.chapters?.[targetChapter]?.title || `챕터 ${targetChapter + 1}`;
    
    // 챕터 데이터 유효성 검증 - 더 관대하게 수정
    if (!newChapter.narrative || newChapter.narrative.length < 300) {
      console.error('❌ 챕터 narrative 부족 - 재시도 필요:', {
        hasNarrative: !!newChapter.narrative,
        narrativeLength: newChapter.narrative?.length || 0,
        minRequired: 300,
        chapterData: newChapter
      });
      
      // 일단 기본 narrative라도 생성해서 저장
      if (!newChapter.narrative) {
        const fallbackNarrative = `${chapterTitle}에 대한 상세한 가이드입니다. 이곳은 ${locationName}의 중요한 장소 중 하나로, 방문객들에게 특별한 경험을 제공합니다. 역사적 의미와 문화적 가치가 깊은 이 장소에서는 다양한 이야기들이 펼쳐집니다. 잠시 후 더 상세한 내용이 추가될 예정입니다.`;
        newChapter.narrative = fallbackNarrative;
        console.log('🔄 임시 narrative 생성:', { fallbackLength: fallbackNarrative.length });
      }
    }

    console.log('📖 새 챕터 데이터 상세:', {
      id: newChapter.id,
      title: newChapter.title,
      hasNarrative: !!newChapter.narrative,
      narrativeLength: newChapter.narrative?.length || 0,
      narrativePreview: newChapter.narrative?.substring(0, 200) + '...',
      hasNextDirection: !!newChapter.nextDirection,
      allChapterKeys: Object.keys(newChapter)
    });

    // 기존 가이드 복사하고 새 챕터 추가
    finalData = { ...existingGuide };
    if (!finalData.realTimeGuide) {
      finalData.realTimeGuide = { chapters: [] };
    }
    
    // 새 챕터를 해당 인덱스에 직접 할당 (Object.assign 대신 직접 교체)
    finalData.realTimeGuide.chapters[targetChapter] = {
      ...finalData.realTimeGuide.chapters[targetChapter], // 기존 id, title 유지
      ...newChapter // 새로운 narrative, nextDirection 등 추가
    };
    
    console.log('📖 챕터 통합 완료:', {
      chapterIndex: targetChapter,
      chapterTitle: newChapter.title,
      totalChapters: finalData.realTimeGuide.chapters.length,
      updatedChapterHasNarrative: !!finalData.realTimeGuide.chapters[targetChapter]?.narrative,
      updatedNarrativeLength: finalData.realTimeGuide.chapters[targetChapter]?.narrative?.length || 0,
      updatedChapterKeys: Object.keys(finalData.realTimeGuide.chapters[targetChapter] || {}),
      finalChapterData: finalData.realTimeGuide.chapters[targetChapter]
    });
  } else {
    // 구조 생성 또는 전체 생성 모드
    finalData = normalizeGuideData(parsed.data, language);
  }

  console.log('📊 최종 데이터:', {
    hasOverview: !!finalData.overview,
    hasRoute: !!finalData.route,
    hasRealTimeGuide: !!finalData.realTimeGuide,
    routeSteps: finalData.route?.steps?.length || 0,
    chapters: finalData.realTimeGuide?.chapters?.length || 0,
    chaptersDetail: finalData.realTimeGuide?.chapters?.map((ch: any, idx: number) => ({
      index: idx,
      title: ch.title,
      // ✅ narrative 필드도 포함하여 체크 (중요한 수정!)
      hasContent: !!(ch.narrative || ch.sceneDescription || ch.coreNarrative || ch.humanStories || ch.nextDirection),
      hasNarrative: !!ch.narrative,
      narrativeLength: ch.narrative?.length || 0,
      hasLegacyFields: !!(ch.sceneDescription || ch.coreNarrative || ch.humanStories),
      allKeys: Object.keys(ch || {})
    })) || [],
    generationMode
  });

  // 3. 데이터 저장 처리
  if (generationMode === 'chapter') {
    // 챕터 생성 모드: 기존 데이터 업데이트
    console.log('💾 기존 가이드 업데이트');
    const { error: updateError } = await supabase
      .from('guides')
      .update({
        content: finalData,
        updated_at: new Date().toISOString()
      })
      .eq('locationname', normLocation)
      .eq('language', normLang);

    if (updateError) {
      console.error('❌ 가이드 업데이트 실패:', updateError);
      // 업데이트 실패해도 결과는 반환 (임시 데이터로)
    }
  } else {
    // 구조 생성 또는 전체 생성 모드: 새로 저장
    console.log('💾 새 가이드 저장 시도');
    const { error: insertError } = await supabase
      .from('guides')
      .insert([{
        locationname: normLocation,
        language: normLang,
        content: finalData,
        created_at: new Date().toISOString()
      }]);

    // 중복 키 에러 시 기존 데이터 조회하여 반환
    if (insertError && insertError.code === '23505') {
      console.log('🔍 중복 키 감지 - 기존 데이터 조회');
      const { data: existing, error: fetchError } = await supabase
        .from('guides')
        .select('content')
        .eq('locationname', normLocation)
        .eq('language', normLang)
        .maybeSingle();

      if (fetchError || !existing) {
        return new Response(
          JSON.stringify({ success: false, error: `기존 가이드 조회 실패: ${fetchError?.message || '데이터를 찾을 수 없습니다'}`, language }),
          { status: 500, headers }
        );
      }

      console.log('✅ 기존 데이터 반환');
      return NextResponse.json({
        success: true,
        data: { content: existing.content },
        cached: 'existing',
        language
      });
    }

    // 다른 insert 에러 처리
    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, error: `가이드 저장 실패: ${insertError.message}`, language }),
        { status: 500, headers }
      );
    }

    console.log('✅ 새 가이드 저장 완료');
  }
  return NextResponse.json({
    success: true,
    data: { content: finalData },
    cached: generationMode === 'chapter' ? 'updated' : 'new',
    language,
    generationMode,
    targetChapter: generationMode === 'chapter' ? targetChapter : undefined
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