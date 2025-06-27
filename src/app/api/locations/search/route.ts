import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경 변수 확인
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('GEMINI_API_KEY is not set');
}

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// 서버 측 메모리 캐시 (Note: In serverless functions, this will be per-instance)
const searchCache = new Map<string, { suggestions: any[], timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30분

// 언어별 검색 프롬프트 생성
function createSearchPrompt(query: string, language: string): string {
  const prompts = {
    ko: `"${query}"와 관련된 유명한 관광명소 5개를 JSON 배열로만 답하세요.

중요 지시사항:
1. 검색어 자체가 명소명이라면 반드시 첫 번째로 포함하세요
2. 같은 도시/지역의 다른 주요 명소들을 포함하세요
3. 유사한 유형의 명소들을 포함하세요

형식: [{"name":"명소명","location":"국가, 도시"}]
예: [{"name":"세비야 대성당","location":"스페인, 세비야"}]
모든 답변을 한국어로 작성하세요.`,

    en: `Suggest 5 famous tourist attractions related to "${query}" in JSON array format only.

Important instructions:
1. If the search term is already an attraction name, include it as the first result
2. Include other major attractions in the same city/region
3. Include similar types of attractions

Format: [{"name":"attraction name","location":"country, city"}]
Example: [{"name":"Seville Cathedral","location":"Spain, Seville"}]
Write all responses in English.`,

    ja: `"${query}"に関連する有名な観光地5つをJSON配列形式のみで答えてください。

重要な指示:
1. 検索語が既に観光地名の場合、最初の結果として含めてください
2. 同じ都市/地域の他の主要な観光地を含めてください
3. 似たタイプの観光地を含めてください

形式: [{"name":"観光地名","location":"国、都市"}]
例: [{"name":"セビリア大聖堂","location":"スペイン、セビリア"}]
すべての回答を日本語で書いてください。`,

    zh: `请提供5个与"${query}"相关的著名旅游景点，仅用JSON数组格式回答。

重要指示:
1. 如果搜索词本身就是景点名称，请将其作为第一个结果
2. 包含同一城市/地区的其他主要景点
3. 包含类似类型的景点

格式: [{"name":"景点名称","location":"国家, 城市"}]
例如: [{"name":"塞维利亚大教堂","location":"西班牙, 塞维利亚"}]
请用中文回答所有内容。`,

    es: `Sugiere 5 atracciones turísticas famosas relacionadas con "${query}" solo en formato de array JSON.

Instrucciones importantes:
1. Si el término de búsqueda ya es un nombre de atracción, inclúyelo como primer resultado
2. Incluye otras atracciones principales en la misma ciudad/región
3. Incluye atracciones de tipo similar

Formato: [{"name":"nombre de la atracción","location":"país, ciudad"}]
Ejemplo: [{"name":"Catedral de Sevilla","location":"España, Sevilla"}]
Escribe todas las respuestas en español.`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

export async function GET(request: NextRequest) {
  try {
    // API 키 확인
    if (!genAI) {
      console.error('Gemini API key is not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang') || 'ko';

    // 쿼리 유효성 검사
    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: true, suggestions: [] },
        { status: 200 }
      );
    }

    // 언어별 캐시 키 생성 (서버리스 환경에서는 인스턴스당 별도로 동작함을 유의)
    const cacheKey = `${query.toLowerCase()}-${language}`;
    const cached = searchCache.get(cacheKey);

    // 캐시 확인 및 반환
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return NextResponse.json(
        { success: true, suggestions: cached.suggestions },
        { status: 200 }
      );
    }

    try {
      // Gemini 모델 설정
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.3,
          topK: 10,
          topP: 0.7,
          maxOutputTokens: 512,
          candidateCount: 1,
        }
      });

      // 언어별 프롬프트 생성 및 API 호출
      const prompt = createSearchPrompt(query, language);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // 응답에서 JSON 추출
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        return NextResponse.json(
          { success: true, suggestions: [] },
          { status: 200 }
        );
      }

      // 응답 파싱 및 유효성 검사
      let suggestions = [];
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestions = Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        suggestions = [];
      }

      // 캐시에 저장 (서버리스 환경에서는 인스턴스당 별도로 유지됨)
      searchCache.set(cacheKey, { suggestions, timestamp: Date.now() });
      
      return NextResponse.json(
        { success: true, suggestions },
        { status: 200, 
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
          }
        }
      );

    } catch (apiError: unknown) {
      console.error('Gemini API Error:', apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process your request',
          ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Search API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}