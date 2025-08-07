import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
interface Suggestion {
  name: string;
  location: string;
  metadata?: {
    isOfficial?: boolean;
    category?: string;
    popularity?: number;
  };
}

// Valid languages
const VALID_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es'] as const;
type Language = typeof VALID_LANGUAGES[number];

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize Gemini AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Create search prompt
function createSearchPrompt(query: string, language: Language): string {
  const prompts = {
    ko: `'${query}' 관련 관광지 3개 추천. JSON만: [{"name": "장소명", "location": "도시, 국가", "metadata": {"isOfficial": true, "category": "관광지", "popularity": 8}}]`,
    en: `Suggest 3 places for '${query}'. JSON only: [{"name": "place name", "location": "city, country", "metadata": {"isOfficial": true, "category": "tourist", "popularity": 8}}]`,
    ja: `'${query}' 関連地点3件. JSON: [{"name": "場所名", "location": "都市, 国", "metadata": {"isOfficial": true, "category": "観光地", "popularity": 8}}]`,
    zh: `'${query}' 相关地点3个. JSON: [{"name": "地点名", "location": "城市, 国家", "metadata": {"isOfficial": true, "category": "旅游", "popularity": 8}}]`,
    es: `3 lugares para '${query}'. JSON: [{"name": "lugar", "location": "ciudad, país", "metadata": {"isOfficial": true, "category": "turístico", "popularity": 8}}]`
  };
  return prompts[language] || prompts.ko;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API 요청 받음:', request.url);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = (searchParams.get('lang') || 'ko') as Language;

    console.log('📝 쿼리 파라미터:', { query, language });

    // Validate input
    if (!query || typeof query !== 'string') {
      console.log('❌ 유효하지 않은 검색어:', query);
      return NextResponse.json({ 
        success: false, 
        error: '유효한 검색어를 입력해주세요' 
      }, { status: 400 });
    }

    // Validate query length
    if (query.length < 1 || query.length > 100) {
      console.log('❌ 검색어 길이 오류:', query.length);
      return NextResponse.json({ 
        success: false, 
        error: '검색어는 1자 이상 100자 이하로 입력해주세요' 
      }, { status: 400 });
    }

    // Validate language
    const lang = VALID_LANGUAGES.includes(language) ? language : 'ko';
    
    console.log('🤖 Gemini AI 요청 시작');

    // Generate response using Gemini AI
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
        topP: 0.9,
        topK: 20
      }
    });
    
    const prompt = createSearchPrompt(query, lang);
    console.log('📤 프롬프트:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    console.log('📥 AI 응답:', text);

    // Parse response
    let suggestions: Suggestion[] = [];
    
    try {
      // Extract JSON from response
      let jsonString = text.trim();
      
      // Try to extract JSON array
      const arrayMatch = text.match(/\[(.*?)\]/s);
      if (arrayMatch) {
        jsonString = arrayMatch[0];
      }
      
      const parsed = JSON.parse(jsonString);
      
      if (Array.isArray(parsed)) {
        suggestions = parsed.filter(item => item.name && item.location).slice(0, 5);
      }
      
      console.log('✅ 파싱된 제안사항:', suggestions);

    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      
      // Fallback suggestions
      suggestions = [
        { name: '서울', location: '대한민국', metadata: { isOfficial: true, category: '도시', popularity: 9 }},
        { name: '부산', location: '대한민국', metadata: { isOfficial: true, category: '도시', popularity: 8 }},
        { name: '제주도', location: '대한민국', metadata: { isOfficial: true, category: '관광지', popularity: 9 }}
      ];
    }

    const responseData = { 
      success: true, 
      data: suggestions,
      cached: false
    };

    console.log('📤 최종 응답:', responseData);

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: '서버 내부 오류가 발생했습니다',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}