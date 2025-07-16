import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { createStructurePrompt, createChapterPrompt, getRecommendedSpotCount } from '@/lib/ai/prompts/korean';
import { supabase } from '@/lib/supabaseClient';
import { 
  saveGuideWithChapters, 
  getGuideWithDetailedChapters, 
  updateChapterDetails,
  hasChapterDetails 
} from '@/lib/supabaseGuideHistory';

export const runtime = 'nodejs';

function normalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s가-힣]/g, '');
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
  // 🚨 중요: 챕터 생성 모드일 때는 기존 챕터 내용 확인
  if (!forceRegenerate) {
    console.log('🔍 캐시 확인 중...');
    
    // 🚀 새로운 방식: 상세 챕터 포함 가이드 조회
    const detailedGuideResult = await getGuideWithDetailedChapters(normLocation, normLang);
    
    if (detailedGuideResult.success && detailedGuideResult.guide) {
      // 챕터 생성 모드에서 해당 챕터에 이미 내용이 있는지 확인
      if (generationMode === 'chapter' && targetChapter !== null) {
        const existingChapter = detailedGuideResult.guide?.realTimeGuide?.chapters?.[targetChapter];
        console.log('📖 기존 챕터 확인:', {
          targetChapter,
          hasChapter: !!existingChapter,
          hasNarrative: !!existingChapter?.narrative,
          hasLegacyContent: !!(existingChapter?.sceneDescription || existingChapter?.coreNarrative || existingChapter?.humanStories),
          narrativeLength: existingChapter?.narrative?.length || 0
        });
        
        // 챕터에 이미 충분한 내용이 있으면 생성하지 않고 반환
        if (existingChapter && (existingChapter.narrative || 
           (existingChapter.sceneDescription && existingChapter.coreNarrative && existingChapter.humanStories))) {
          console.log('✅ 챕터 내용이 이미 존재 - 기존 데이터 반환');
          return NextResponse.json({
            success: true,
            data: { content: detailedGuideResult.guide },
            cached: 'hit',
            language,
            message: '챕터 내용이 이미 존재합니다.'
          });
        }
      } else if (generationMode !== 'chapter') {
        // 일반 모드에서는 기존 로직 유지
        console.log('✅ 상세 가이드 캐시 반환');
        return NextResponse.json({
          success: true,
          data: { content: detailedGuideResult.guide },
          cached: 'hit',
          language
        });
      }
    }
    
    // 🔄 기존 방식으로 폴백 (호환성 유지)
    const { data: cached } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .maybeSingle();

    if (cached) {
      // 챕터 생성 모드에서 해당 챕터에 이미 내용이 있는지 확인
      if (generationMode === 'chapter' && targetChapter !== null) {
        const existingChapter = cached.content?.realTimeGuide?.chapters?.[targetChapter];
        console.log('📖 기존 챕터 확인:', {
          targetChapter,
          hasChapter: !!existingChapter,
          hasNarrative: !!existingChapter?.narrative,
          hasLegacyContent: !!(existingChapter?.sceneDescription || existingChapter?.coreNarrative || existingChapter?.humanStories),
          narrativeLength: existingChapter?.narrative?.length || 0
        });
        
        // 챕터에 이미 충분한 내용이 있으면 생성하지 않고 반환
        if (existingChapter && (existingChapter.narrative || 
           (existingChapter.sceneDescription && existingChapter.coreNarrative && existingChapter.humanStories))) {
          console.log('✅ 챕터 내용이 이미 존재 - 기존 데이터 반환');
          return NextResponse.json({
            success: true,
            data: { content: cached.content },
            cached: 'hit',
            language,
            message: '챕터 내용이 이미 존재합니다.'
          });
        }
      } else if (generationMode !== 'chapter') {
        // 일반 모드에서는 기존 로직 유지
        console.log('✅ 캐시된 데이터 반환');
        return NextResponse.json({
          success: true,
          data: { content: cached.content },
          cached: 'hit',
          language
        });
      }
    }
  }

  // 2. AI로 새 가이드 생성
  console.log('🤖 AI 가이드 생성 시작 - 모드:', generationMode);
  const genAI = getGeminiClient();
  if (genAI instanceof Response) return genAI;
  
  const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite-preview-06-17', // 2.5 플래시 라이트 재도전!
    generationConfig: { temperature: 0.3, maxOutputTokens: 65536 } // 단계별로 생성하므로 토큰 수 줄임
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
    
    // 챕터 데이터 유효성 검증 - narrative 필드 기준으로 강화
    if (!newChapter.narrative || newChapter.narrative.length < 1500) {
      console.error('❌ 챕터 narrative 내용 부족 - 재시도 필요:', {
        hasNarrative: !!newChapter.narrative,
        narrativeLength: newChapter.narrative?.length || 0,
        minRequired: 1500,
        chapterData: newChapter
      });
      
      // 기본 narrative 생성 (더 풍부하게)
      if (!newChapter.narrative || newChapter.narrative.length < 1500) {
        const fallbackNarrative = `${chapterTitle}에 도착하시면 가장 먼저 이 장소의 독특한 분위기가 느껴지실 거예요. 여기서 바라보는 풍경과 주변의 특징들이 이 장소만의 특별함을 보여주고 있습니다. 
        
        이곳은 ${locationName}의 중요한 장소 중 하나로, 깊은 역사적 의미와 문화적 가치를 담고 있습니다. 수많은 사람들이 이곳을 거쳐 갔고, 각자의 이야기를 남겨놓았습니다. 건축적으로도 뛰어난 특징을 보여주며, 당시의 기술력과 미적 감각을 엿볼 수 있는 소중한 유산이기도 합니다.
        
        특히 이곳과 관련된 인물들의 이야기는 정말 감동적입니다. 과거부터 현재까지 이 장소를 지키고 가꿔온 많은 사람들의 노력과 열정이 오늘날의 모습을 만들어냈습니다. 방문객들 역시 이곳에서 특별한 경험을 하며, 오랫동안 기억에 남을 인상을 받게 됩니다.
        
        이런 의미 깊은 장소에서 잠시 머물며 그 분위기를 충분히 느껴보시기 바랍니다. 다음 장소로 이동하면서도 이곳에서 얻은 감동을 마음에 간직해보세요.`;
        
        newChapter.narrative = fallbackNarrative;
        console.log('🔄 강화된 fallback narrative 생성:', { fallbackLength: fallbackNarrative.length });
      }
    }

    console.log('📖 새 챕터 데이터 상세:', {
      id: newChapter.id,
      title: newChapter.title,
      hasNarrative: !!newChapter.narrative,
      narrativeLength: newChapter.narrative?.length || 0,
      narrativePreview: newChapter.narrative?.substring(0, 200) + '...',
      hasNextDirection: !!newChapter.nextDirection,
      nextDirectionLength: newChapter.nextDirection?.length || 0,
      allChapterKeys: Object.keys(newChapter)
    });

    // 기존 가이드 복사하고 새 챕터 추가
    finalData = { ...existingGuide };
    if (!finalData.realTimeGuide) {
      finalData.realTimeGuide = { chapters: [] };
    }
    
    // 새 챕터를 해당 인덱스에 직접 할당
    finalData.realTimeGuide.chapters[targetChapter] = {
      ...finalData.realTimeGuide.chapters[targetChapter], // 기존 id, title 유지
      ...newChapter // 새로운 narrative, nextDirection 추가
    };
    
    console.log('📖 챕터 통합 완료:', {
      chapterIndex: targetChapter,
      chapterTitle: newChapter.title,
      totalChapters: finalData.realTimeGuide.chapters.length,
      updatedChapterHasNarrative: !!finalData.realTimeGuide.chapters[targetChapter]?.narrative,
      updatedChapterHasNextDirection: !!finalData.realTimeGuide.chapters[targetChapter]?.nextDirection,
      narrativeLength: finalData.realTimeGuide.chapters[targetChapter]?.narrative?.length || 0,
      nextDirectionLength: finalData.realTimeGuide.chapters[targetChapter]?.nextDirection?.length || 0,
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
  
  // 1. 기본 guides 테이블 업데이트
  const { error: updateError } = await supabase
    .from('guides')
    .update({
      content: finalData
    })
    .eq('locationname', normLocation)
    .eq('language', normLang);

  if (updateError) {
    console.error('❌ 가이드 업데이트 실패:', updateError);
  }

  // 2. 🚨 중요: guide_chapters 테이블에도 상세 내용 저장
  try {
    // 먼저 guide_id를 조회
    const { data: guideRecord, error: guideError } = await supabase
      .from('guides')
      .select('id')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .single();

    if (guideRecord && !guideError) {
      const chapterData = finalData.realTimeGuide?.chapters?.[targetChapter];
      
      if (chapterData) {
        // guide_chapters 테이블에 narrative, nextDirection 저장
        const { error: chapterError } = await supabase
          .from('guide_chapters')
          .upsert([{
            guide_id: guideRecord.id,
            chapter_index: targetChapter,
            title: chapterData.title,
            narrative: chapterData.narrative,
            next_direction: chapterData.nextDirection,
            scene_description: chapterData.sceneDescription,
            core_narrative: chapterData.coreNarrative,
            human_stories: chapterData.humanStories,
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'guide_id,chapter_index'
          });

        if (chapterError) {
          console.error('❌ 챕터 테이블 저장 실패:', chapterError);
        } else {
          console.log('✅ 챕터 테이블 저장 완료');
        }
      }
    }
  } catch (chapterSaveError) {
    console.error('❌ 챕터 저장 중 오류:', chapterSaveError);
  }
}
   else {
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
        JSON.stringify({ success: false, error: `가이드 저장 실패: ${insertError instanceof Error ? insertError.message : String(insertError)}`, language }),
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