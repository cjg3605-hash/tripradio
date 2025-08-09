import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { routeLocationQueryCached, LocationRoutingResult } from '@/lib/location/location-router';
import { PageType } from '@/lib/location/location-classification';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

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
  explorationSuggestions?: ExplorationSuggestion[];
  routingResult?: LocationRoutingResult; // 라우팅 결과 추가
  recommendedPageType?: PageType; // 추천 페이지 타입 추가
}

interface ExplorationSuggestion {
  title: string;
  items: LocationSuggestion[];
  searchable: boolean;
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

// 자동완성 최적화 프롬프트 (간소화)
function createAutocompletePrompt(query: string, language: Language): string {
  // 입력 길이별 최적화
  const isShortQuery = query.length <= 2;
  
  const prompts = {
    ko: isShortQuery ? 
    `"${query}"로 시작하는 세계적으로 유명한 관광지나 도시 5개를 JSON 배열로 제공하세요:
[{"name": "장소명", "location": "위치"}]

예시: [{"name": "에펠탑", "location": "파리, 프랑스"}]` :
    `"${query}"와 관련된 유명한 관광지나 도시 5개를 JSON 배열로 제공하세요:
[{"name": "장소명", "location": "위치"}]`,

    en: isShortQuery ?
    `Provide 5 world-famous tourist attractions or cities starting with "${query}" in JSON array format:
[{"name": "place name", "location": "location"}]

Example: [{"name": "Eiffel Tower", "location": "Paris, France"}]` :
    `Provide 5 famous tourist attractions or cities related to "${query}" in JSON array format:
[{"name": "place name", "location": "location"}]`,

    ja: isShortQuery ?
    `「${query}」で始まる世界的に有名な観光地や都市5つをJSON配列形式で提供してください:
[{"name": "場所名", "location": "場所"}]

例: [{"name": "エッフェル塔", "location": "パリ、フランス"}]` :
    `「${query}」に関連する有名な観光地や都市5つをJSON配列形式で提供してください:
[{"name": "場所名", "location": "場所"}]`,

    zh: isShortQuery ?
    `提供5个以"${query}"开头的世界著名旅游景点或城市，JSON数组格式:
[{"name": "地点名称", "location": "位置"}]

示例: [{"name": "埃菲尔铁塔", "location": "巴黎，法国"}]` :
    `提供5个与"${query}"相关的著名旅游景点或城市，JSON数组格式:
[{"name": "地点名称", "location": "位置"}]`,

    es: isShortQuery ?
    `Proporciona 5 atracciones turísticas o ciudades mundialmente famosas que comiencen con "${query}" en formato JSON array:
[{"name": "nombre del lugar", "location": "ubicación"}]

Ejemplo: [{"name": "Torre Eiffel", "location": "París, Francia"}]` :
    `Proporciona 5 atracciones turísticas o ciudades famosas relacionadas con "${query}" en formato JSON array:
[{"name": "nombre del lugar", "location": "ubicación"}]`
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

// 3단계: 탐색 유도 프롬프트 (계층적 추천)
function createExplorationPrompt(locationInfo: LocationSuggestion, language: Language): string {
  const prompts = {
    ko: `${LOCATION_EXPERT_PERSONA}

사용자가 "${locationInfo.name}"를 검색했습니다. 
위치 유형: ${locationInfo.category}

사용자의 탐색을 유도하기 위해 다음 카테고리별로 추천을 제공해주세요:

1. 주변 지역 (인근 도시나 지역)
2. 주요 명소 (꼭 가봐야 할 곳들)  
3. 숨은 보석 (현지인 추천 장소)
4. 관련 지역 (비슷한 성격의 다른 지역)

각 카테고리별로 3-4개씩 추천해주세요. JSON 형식으로 응답:

{
  "explorationSuggestions": [
    {
      "title": "🌏 주변 지역",
      "searchable": true,
      "items": [
        {
          "name": "지역명",
          "location": "상세 위치",
          "category": "지역",
          "confidence": 0.9,
          "metadata": {
            "popularity": 8,
            "accessibility": "good"
          }
        }
      ]
    },
    {
      "title": "🏛️ 주요 명소", 
      "searchable": true,
      "items": [...]
    },
    {
      "title": "💎 숨은 보석",
      "searchable": true, 
      "items": [...]
    },
    {
      "title": "🔗 관련 지역",
      "searchable": true,
      "items": [...]
    }
  ]
}`,

    en: `${LOCATION_EXPERT_PERSONA}

User searched for "${locationInfo.name}".
Location type: ${locationInfo.category}

To encourage user exploration, provide recommendations in these categories:

1. Nearby Areas (adjacent cities or regions)
2. Major Attractions (must-visit places)
3. Hidden Gems (local recommendations)
4. Related Regions (similar character areas)

Recommend 3-4 items per category. Respond in JSON format:

{
  "explorationSuggestions": [
    {
      "title": "🌏 Nearby Areas",
      "searchable": true,
      "items": [
        {
          "name": "area name",
          "location": "detailed location",
          "category": "region",
          "confidence": 0.9,
          "metadata": {
            "popularity": 8,
            "accessibility": "good"
          }
        }
      ]
    },
    {
      "title": "🏛️ Major Attractions",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "💎 Hidden Gems",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "🔗 Related Regions", 
      "searchable": true,
      "items": [...]
    }
  ]
}`,

    ja: `${LOCATION_EXPERT_PERSONA}

ユーザーが「${locationInfo.name}」を検索しました。
場所タイプ: ${locationInfo.category}

ユーザーの探索を促すため、以下のカテゴリ別に推奨を提供してください:

1. 周辺エリア（近隣の都市や地域）
2. 主要観光地（必見スポット）
3. 隠れた名所（地元おすすめ）
4. 関連地域（似た性格の他地域）

各カテゴリ3-4個ずつ推奨してください。JSON形式で回答:

{
  "explorationSuggestions": [
    {
      "title": "🌏 周辺エリア",
      "searchable": true,
      "items": [
        {
          "name": "エリア名",
          "location": "詳細位置",
          "category": "地域",
          "confidence": 0.9,
          "metadata": {
            "popularity": 8,
            "accessibility": "good"
          }
        }
      ]
    },
    {
      "title": "🏛️ 主要観光地",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "💎 隠れた名所",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "🔗 関連地域",
      "searchable": true,
      "items": [...]
    }
  ]
}`,

    zh: `${LOCATION_EXPERT_PERSONA}

用户搜索了"${locationInfo.name}"。
位置类型: ${locationInfo.category}

为了鼓励用户探索，请按以下类别提供推荐:

1. 周边地区（邻近城市或地区）
2. 主要景点（必游之地）
3. 隐藏瑰宝（当地推荐）
4. 相关地区（性质相似的其他地区）

每个类别推荐3-4个。以JSON格式回复:

{
  "explorationSuggestions": [
    {
      "title": "🌏 周边地区",
      "searchable": true,
      "items": [
        {
          "name": "地区名",
          "location": "详细位置",
          "category": "地区",
          "confidence": 0.9,
          "metadata": {
            "popularity": 8,
            "accessibility": "good"
          }
        }
      ]
    },
    {
      "title": "🏛️ 主要景点",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "💎 隐藏瑰宝",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "🔗 相关地区",
      "searchable": true,
      "items": [...]
    }
  ]
}`,

    es: `${LOCATION_EXPERT_PERSONA}

El usuario buscó "${locationInfo.name}".
Tipo de ubicación: ${locationInfo.category}

Para fomentar la exploración del usuario, proporciona recomendaciones en estas categorías:

1. Áreas Cercanas (ciudades o regiones adyacentes)
2. Atracciones Principales (lugares imperdibles)
3. Joyas Ocultas (recomendaciones locales)
4. Regiones Relacionadas (áreas de carácter similar)

Recomienda 3-4 elementos por categoría. Responde en formato JSON:

{
  "explorationSuggestions": [
    {
      "title": "🌏 Áreas Cercanas",
      "searchable": true,
      "items": [
        {
          "name": "nombre del área",
          "location": "ubicación detallada",
          "category": "región",
          "confidence": 0.9,
          "metadata": {
            "popularity": 8,
            "accessibility": "good"
          }
        }
      ]
    },
    {
      "title": "🏛️ Atracciones Principales",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "💎 Joyas Ocultas",
      "searchable": true,
      "items": [...]
    },
    {
      "title": "🔗 Regiones Relacionadas",
      "searchable": true,
      "items": [...]
    }
  ]
}`
  };

  return prompts[language] || prompts.ko;
}

// 폴백 데이터 생성 함수
function generateFallbackSuggestions(query: string): {name: string, location: string}[] {
  const firstChar = query.charAt(0).toLowerCase();
  
  // 자주 검색되는 명소들 (글자별)
  const suggestions = {
    '에': [
      {name: '에펠탑', location: '파리, 프랑스'}, 
      {name: '에든버러', location: '스코틀랜드'},
      {name: '에르미타주', location: '상트페테르부르크, 러시아'},
      {name: '에기나섬', location: '그리스'},
      {name: '에스토니아', location: '발트해 연안'}
    ],
    'e': [
      {name: '에펠탑', location: '파리, 프랑스'},
      {name: '에든버러', location: '스코틀랜드'},
      {name: '이집트', location: '중동/아프리카'},
      {name: '에스파냐', location: '유럽'},
      {name: '에쿠아도르', location: '남미'}
    ],
    'ㅅ': [
      {name: '서울', location: '한국'},
      {name: '상하이', location: '중국'},
      {name: '시드니', location: '호주'},
      {name: '산토리니', location: '그리스'},
      {name: '샌프란시스코', location: '미국'}
    ],
    's': [
      {name: '서울', location: '한국'},
      {name: '싱가포르', location: '동남아시아'},
      {name: '시드니', location: '호주'},
      {name: '스위스', location: '유럽'},
      {name: '스페인', location: '유럽'}
    ]
  };
  
  return suggestions[firstChar] || [
    {name: query || '명소', location: '위치 정보'},
    {name: '파리', location: '프랑스'},
    {name: '도쿄', location: '일본'},
    {name: '뉴욕', location: '미국'},
    {name: '런던', location: '영국'}
  ];
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
    console.error('📝 원본 텍스트 길이:', text.length);
    console.error('📝 원본 텍스트 내용:', text.substring(0, 200));
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl);
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

    // 🎯 새로운 라우팅 시스템 통합
    console.log('🚀 통합 라우팅 시스템 시작:', sanitizedQuery);
    const routingResult = await routeLocationQueryCached(sanitizedQuery, lang);
    console.log('📍 라우팅 결과:', routingResult);

    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.5-flash-lite', // Flash-Lite로 변경: 1.5배 빠른 응답
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 400, // 최적화: 2000 -> 400 (자동완성용)
        topP: 0.9,
        topK: 20
      }
    });

    // 🚀 단순화된 자동완성 요청
    console.log('🔍 자동완성 요청 시작:', sanitizedQuery);
    const autocompletePrompt = createAutocompletePrompt(sanitizedQuery, lang);
    const autocompleteResult = await model.generateContent(autocompletePrompt);
    const autocompleteText = await autocompleteResult.response.text();
    
    console.log('🧠 AI 자동완성 응답 길이:', autocompleteText.length);
    console.log('🧠 AI 자동완성 응답 전체:', autocompleteText);
    
    // 직접 배열 파싱 시도
    const suggestions = parseAIResponse<{name: string, location: string}[]>(autocompleteText);
    
    if (!suggestions || suggestions.length === 0) {
      console.warn('⚠️ 자동완성 파싱 실패, 폴백 로직 실행');
      
      // 폴백: 기본 데이터 생성
      const defaultData = generateFallbackSuggestions(sanitizedQuery);
      
      console.log('🔄 폴백 데이터 사용:', defaultData);
      
      return NextResponse.json({
        success: true,
        data: defaultData,
        cached: false,
        enhanced: false,
        fallback: true
      });
    }

    // 성공: 자동완성 결과 반환
    console.log('✅ 자동완성 성공:', suggestions.length, '개 결과');
    
    // 최대 5개 보장 및 결과 보장 로직  
    let finalSuggestions = suggestions.slice(0, 5);
    
    // 5개 미만이면 추가 데이터 채우기
    if (finalSuggestions.length < 5) {
      const additionalData = generateFallbackSuggestions(sanitizedQuery);
      const needed = 5 - finalSuggestions.length;
      finalSuggestions = [...finalSuggestions, ...additionalData.slice(0, needed)];
    }
    
    console.log('📊 최종 자동완성 결과:', finalSuggestions.length, '개');
    
    return NextResponse.json({
      success: true,
      data: finalSuggestions,
      cached: false,
      enhanced: true,
      autocomplete: true
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