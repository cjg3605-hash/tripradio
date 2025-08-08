import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
interface LocationSuggestion {
  name: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: string;
  confidence: number;
  aliases?: string[];
  metadata?: {
    isOfficial?: boolean;
    popularity?: number;
    accessibility?: 'good' | 'moderate' | 'difficult';
  };
}

interface LocationAnalysis {
  originalQuery: string;
  correctedQuery?: string;
  locationType: 'country' | 'province' | 'city' | 'district' | 'landmark' | 'multiple' | 'unknown';
  confidence: number;
  suggestions: LocationSuggestion[];
}

// Valid languages
const VALID_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es'] as const;
type Language = typeof VALID_LANGUAGES[number];

// Initialize Gemini AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

// 위치 인식 전문가 페르소나
const LOCATION_EXPERT_PERSONA = `당신은 전세계 지리 및 위치 정보 전문가입니다.

핵심 원칙:
1. 정확성 우선: 모호한 추측보다는 정확한 위치만 제안
2. 지리적 계층 구조 준수: 국가 > 주/도 > 시/군/구 > 구체적 장소
3. 문화적 맥락 고려: 현지 명칭과 국제적 명칭 모두 인식
4. 철자 오류 보정: 유사한 발음이나 철자의 실제 위치 매칭
5. 동명이지역 구분: 같은 이름의 다른 지역들을 명확히 구분

전문 지식:
- 전세계 도시, 지역, 관광지의 정확한 위치
- 다국어 지명의 올바른 번역과 표기
- 지리적 좌표와 행정구역 정보
- 관광지의 실제 중요도와 접근성`;

// 1단계: 위치 분석 프롬프트
function createLocationAnalysisPrompt(query: string, language: Language): string {
  const prompts = {
    ko: `${LOCATION_EXPERT_PERSONA}

검색어를 분석하여 정확한 위치를 파악해주세요.

검색어: "${query}"
분석 언어: 한국어

분석 과정:
1. 검색어의 정확한 지리적 의미 파악
2. 철자 오류나 오타 확인 및 보정
3. 동일 명칭의 여러 지역이 있는 경우 주요 지역들 식별
4. 적절한 지리적 계층 수준 결정 (국가/도시/관광지 등)

JSON 형식으로만 응답하세요:
{
  "originalQuery": "${query}",
  "correctedQuery": "보정된 검색어 (필요한 경우만)",
  "locationType": "country|province|city|district|landmark|multiple|unknown",
  "confidence": 0.95,
  "suggestions": [
    {
      "name": "정확한 위치명",
      "location": "상위 지역, 국가",
      "category": "도시|관광지|지역|국가",
      "confidence": 0.95,
      "aliases": ["다른 이름들"]
    }
  ]
}`,

    en: `${LOCATION_EXPERT_PERSONA}

Analyze the search query to identify the exact location.

Search query: "${query}"
Analysis language: English

Analysis process:
1. Identify the exact geographical meaning of the search query
2. Check and correct spelling errors or typos
3. Identify major regions if multiple locations have the same name
4. Determine appropriate geographical hierarchy level

Respond only in JSON format:
{
  "originalQuery": "${query}",
  "correctedQuery": "corrected query (if needed)",
  "locationType": "country|province|city|district|landmark|multiple|unknown",
  "confidence": 0.95,
  "suggestions": [
    {
      "name": "exact location name",
      "location": "parent region, country",
      "category": "city|attraction|region|country",
      "confidence": 0.95,
      "aliases": ["alternative names"]
    }
  ]
}`,

    ja: `${LOCATION_EXPERT_PERSONA}

検索クエリを分析して正確な場所を特定してください。

検索クエリ: "${query}"
分析言語: 日本語

分析プロセス:
1. 検索クエリの正確な地理的意味を把握
2. スペルミスや誤字の確認と修正
3. 同名の複数の地域がある場合、主要地域を特定
4. 適切な地理的階層レベルの決定

JSON形式でのみ回答してください:
{
  "originalQuery": "${query}",
  "correctedQuery": "修正されたクエリ（必要な場合のみ）",
  "locationType": "country|province|city|district|landmark|multiple|unknown",
  "confidence": 0.95,
  "suggestions": [
    {
      "name": "正確な場所名",
      "location": "上位地域、国",
      "category": "都市|観光地|地域|国",
      "confidence": 0.95,
      "aliases": ["別名"]
    }
  ]
}`,

    zh: `${LOCATION_EXPERT_PERSONA}

分析搜索查询以确定准确位置。

搜索查询: "${query}"
分析语言: 中文

分析过程:
1. 识别搜索查询的准确地理含义
2. 检查和纠正拼写错误或错字
3. 如果有多个同名地区，识别主要地区
4. 确定适当的地理层次级别

仅以JSON格式回复:
{
  "originalQuery": "${query}",
  "correctedQuery": "纠正的查询（如果需要）",
  "locationType": "country|province|city|district|landmark|multiple|unknown",
  "confidence": 0.95,
  "suggestions": [
    {
      "name": "准确的位置名称",
      "location": "上级地区，国家",
      "category": "城市|景点|地区|国家",
      "confidence": 0.95,
      "aliases": ["其他名称"]
    }
  ]
}`,

    es: `${LOCATION_EXPERT_PERSONA}

Analiza la consulta de búsqueda para identificar la ubicación exacta.

Consulta de búsqueda: "${query}"
Idioma de análisis: Español

Proceso de análisis:
1. Identificar el significado geográfico exacto de la consulta
2. Verificar y corregir errores ortográficos o tipográficos
3. Identificar regiones principales si existen múltiples ubicaciones con el mismo nombre
4. Determinar el nivel de jerarquía geográfica apropiado

Responde solo en formato JSON:
{
  "originalQuery": "${query}",
  "correctedQuery": "consulta corregida (si es necesario)",
  "locationType": "country|province|city|district|landmark|multiple|unknown",
  "confidence": 0.95,
  "suggestions": [
    {
      "name": "nombre exacto del lugar",
      "location": "región superior, país",
      "category": "ciudad|atracción|región|país",
      "confidence": 0.95,
      "aliases": ["nombres alternativos"]
    }
  ]
}`
  };

  return prompts[language] || prompts.ko;
}

// 2단계: 관광 추천 프롬프트
function createTravelRecommendationPrompt(confirmedLocation: string, language: Language): string {
  const prompts = {
    ko: `${LOCATION_EXPERT_PERSONA}

확정된 위치에 대한 여행 추천을 해주세요.

위치: "${confirmedLocation}"
추천 언어: 한국어

추천 기준:
1. 주요 관광 명소 (유명도 및 중요도 순)
2. 지역을 대표하는 장소들
3. 접근성이 좋은 곳
4. 문화적/역사적 의미가 있는 곳
5. 현지인과 관광객 모두에게 인기인 곳

최대 5개의 추천을 JSON 배열로만 제공하세요:
[
  {
    "name": "장소명",
    "location": "${confirmedLocation}",
    "category": "관광지|문화유산|자연|쇼핑|음식",
    "confidence": 0.95,
    "metadata": {
      "popularity": 9,
      "accessibility": "good"
    }
  }
]`,

    en: `${LOCATION_EXPERT_PERSONA}

Please provide travel recommendations for the confirmed location.

Location: "${confirmedLocation}"
Recommendation language: English

Recommendation criteria:
1. Major tourist attractions (by fame and importance)
2. Places representing the region
3. Easily accessible locations
4. Places with cultural/historical significance
5. Popular among both locals and tourists

Provide up to 5 recommendations in JSON array format only:
[
  {
    "name": "place name",
    "location": "${confirmedLocation}",
    "category": "attraction|heritage|nature|shopping|food",
    "confidence": 0.95,
    "metadata": {
      "popularity": 9,
      "accessibility": "good"
    }
  }
]`,

    ja: `${LOCATION_EXPERT_PERSONA}

確定した場所の旅行推奨をしてください。

場所: "${confirmedLocation}"
推奨言語: 日本語

推奨基準:
1. 主要観光名所（知名度と重要度順）
2. 地域を代表する場所
3. アクセスの良い場所
4. 文化的・歴史的意義のある場所
5. 地元の人と観光客の両方に人気の場所

最大5つの推奨をJSON配列形式でのみ提供してください:
[
  {
    "name": "場所名",
    "location": "${confirmedLocation}",
    "category": "観光地|文化遺産|自然|ショッピング|グルメ",
    "confidence": 0.95,
    "metadata": {
      "popularity": 9,
      "accessibility": "good"
    }
  }
]`,

    zh: `${LOCATION_EXPERT_PERSONA}

请为确认的位置提供旅行推荐。

位置: "${confirmedLocation}"
推荐语言: 中文

推荐标准:
1. 主要旅游景点（按知名度和重要性排序）
2. 代表该地区的地方
3. 交通便利的地方
4. 具有文化/历史意义的地方
5. 受当地人和游客欢迎的地方

仅以JSON数组格式提供最多5个推荐:
[
  {
    "name": "地点名称",
    "location": "${confirmedLocation}",
    "category": "景点|文化遗产|自然|购物|美食",
    "confidence": 0.95,
    "metadata": {
      "popularity": 9,
      "accessibility": "good"
    }
  }
]`,

    es: `${LOCATION_EXPERT_PERSONA}

Proporciona recomendaciones de viaje para la ubicación confirmada.

Ubicación: "${confirmedLocation}"
Idioma de recomendación: Español

Criterios de recomendación:
1. Principales atracciones turísticas (por fama e importancia)
2. Lugares que representan la región
3. Ubicaciones de fácil acceso
4. Lugares con significado cultural/histórico
5. Popular entre locales y turistas

Proporciona hasta 5 recomendaciones solo en formato JSON array:
[
  {
    "name": "nombre del lugar",
    "location": "${confirmedLocation}",
    "category": "atracción|patrimonio|naturaleza|compras|comida",
    "confidence": 0.95,
    "metadata": {
      "popularity": 9,
      "accessibility": "good"
    }
  }
]`
  };

  return prompts[language] || prompts.ko;
}

// Sanitize input
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>\"\']/g, '')
    .replace(/[^\w\s가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-.,!?]/gi, '')
    .trim()
    .substring(0, 100);
}

// Parse JSON response with error handling
function parseAIResponse<T>(text: string): T | null {
  try {
    // Extract JSON from various formats
    const patterns = [
      /```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/s,
      /(\[[\s\S]*?\]|\{[\s\S]*?\})/s
    ];

    let jsonString = text.trim();
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        jsonString = match[1] ? match[1].trim() : match[0].trim();
        break;
      }
    }

    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON 파싱 실패:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = (searchParams.get('lang') || 'ko') as Language;

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: false,
        error: '검색어를 입력해주세요'
      }, { status: 400 });
    }

    const sanitizedQuery = sanitizeInput(query);
    const lang = VALID_LANGUAGES.includes(language) ? language : 'ko';

    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-1219',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
        topP: 0.9,
        topK: 20
      }
    });

    // 1단계: 위치 분석
    console.log('🔍 위치 분석 시작:', sanitizedQuery);
    const analysisPrompt = createLocationAnalysisPrompt(sanitizedQuery, lang);
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = await analysisResult.response.text();
    
    console.log('🧠 AI 위치 분석 응답:', analysisText);
    
    const analysis = parseAIResponse<LocationAnalysis>(analysisText);
    
    if (!analysis || !analysis.suggestions || analysis.suggestions.length === 0) {
      console.warn('⚠️ 위치 분석 실패, 기본 검색으로 폴백');
      
      // 폴백: 기본 검색 로직
      const fallbackPrompt = createTravelRecommendationPrompt(sanitizedQuery, lang);
      const fallbackResult = await model.generateContent(fallbackPrompt);
      const fallbackText = await fallbackResult.response.text();
      
      const fallbackSuggestions = parseAIResponse<LocationSuggestion[]>(fallbackText) || [];
      
      return NextResponse.json({
        success: true,
        data: fallbackSuggestions.slice(0, 5),
        cached: false,
        enhanced: false,
        fallback: true
      });
    }

    // 2단계: 확정된 위치 기반 관광 추천
    const primaryLocation = analysis.suggestions[0];
    console.log('🎯 확정된 위치:', primaryLocation.name, primaryLocation.location);
    
    const recommendationPrompt = createTravelRecommendationPrompt(
      `${primaryLocation.name}, ${primaryLocation.location}`,
      lang
    );
    
    const recommendationResult = await model.generateContent(recommendationPrompt);
    const recommendationText = await recommendationResult.response.text();
    
    console.log('🏛️ 관광 추천 응답:', recommendationText);
    
    const recommendations = parseAIResponse<LocationSuggestion[]>(recommendationText) || [];
    
    // 결과 조합: 분석된 위치 + 관광 추천
    const finalSuggestions = [
      ...analysis.suggestions.slice(0, 2), // 분석된 주요 위치 최대 2개
      ...recommendations.slice(0, 3)       // 관광 추천 최대 3개
    ].slice(0, 5);

    return NextResponse.json({
      success: true,
      data: finalSuggestions,
      cached: false,
      enhanced: true,
      debug: process.env.NODE_ENV === 'development' ? {
        originalQuery: query,
        analysisConfidence: analysis.confidence,
        locationType: analysis.locationType,
        correctedQuery: analysis.correctedQuery
      } : undefined
    });

  } catch (error) {
    console.error('❌ Enhanced 위치 검색 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '위치 검색 중 오류가 발생했습니다',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    }, { status: 500 });
  }
}