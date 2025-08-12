import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyLocation, determinePageType, ALL_LOCATIONS, ALIAS_TO_LOCATION } from '@/lib/location/location-classification';

// 동적 렌더링 강제 (API는 동적이어야 함)
export const dynamic = 'force-dynamic';
export const maxDuration = 20; // Vercel Pro에서 최대 20초

// Types - 새로운 구조화된 위치 데이터 인터페이스
interface EnhancedLocationSuggestion {
  name: string;          // 장소명
  location: string;      // 상세 위치 (기존 호환성)
  region: string;        // 지역/도시
  country: string;       // 국가명  
  countryCode: string;   // 국가 코드 (KR, US, FR 등)
  type: 'location' | 'attraction'; // 위치 타입
  isMainLocation?: boolean;
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

// 기존 호환성을 위한 레거시 인터페이스 유지
interface LocationSuggestion extends EnhancedLocationSuggestion {}

// 🗑️ 사용하지 않는 타입들 제거됨 (AI 자동완성만 사용)

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

/**
 * 🌍 AI 응답에서 지역 정보 추출
 */
function extractRegionalInfo(locationString: string, placeName: string): { region: string; country: string; countryCode: string } {
  const location = locationString.toLowerCase();
  
  // 국가 패턴 매칭
  const countryPatterns = {
    'KR': { 
      keywords: ['korea', '한국', '대한민국', '서울', '부산', '제주', '경주', '인천', '대전', '대구', '광주', '울산'],
      name: '대한민국'
    },
    'CN': { 
      keywords: ['china', '중국', '베이징', 'beijing', '상하이', 'shanghai', '만리장성', 'great wall', '자금성'],
      name: '중국'
    },
    'JP': { 
      keywords: ['japan', '일본', '도쿄', 'tokyo', '오사카', 'osaka', '교토', 'kyoto'],
      name: '일본'
    },
    'FR': { 
      keywords: ['france', '프랑스', 'paris', '파리', '루브르', 'louvre', '에펠'],
      name: '프랑스'
    },
    'GB': { 
      keywords: ['england', 'uk', '영국', 'london', '런던', '빅벤', 'big ben'],
      name: '영국'
    },
    'US': { 
      keywords: ['usa', 'america', '미국', '뉴욕', 'new york', '자유의 여신'],
      name: '미국'
    },
    'IT': { 
      keywords: ['italy', '이탈리아', 'rome', '로마', '콜로세움', 'colosseum'],
      name: '이탈리아'
    },
    'DE': { 
      keywords: ['germany', '독일', 'berlin', '베를린', 'munich', '뮌헨'],
      name: '독일'
    },
    'ES': { 
      keywords: ['spain', '스페인', 'madrid', '마드리드', 'barcelona', '바르셀로나'],
      name: '스페인'
    },
    'TH': { 
      keywords: ['thailand', '태국', 'bangkok', '방콕', '치앙마이'],
      name: '태국'
    }
  };

  // 매칭되는 국가 찾기
  let matchedCountry = 'KR'; // 기본값
  let matchedCountryName = '대한민국';
  
  for (const [code, data] of Object.entries(countryPatterns)) {
    if (data.keywords.some(keyword => location.includes(keyword) || placeName.toLowerCase().includes(keyword))) {
      matchedCountry = code;
      matchedCountryName = data.name;
      break;
    }
  }

  // 지역명 추출 (location string에서 국가 이후 부분)
  let region = '';
  if (location.includes(',')) {
    const parts = location.split(',').map(part => part.trim());
    if (parts.length >= 2) {
      region = parts[parts.length - 2]; // 국가 바로 앞 부분
    }
  }
  
  // 지역명이 없으면 장소명에서 추출 시도
  if (!region) {
    const placeNameLower = placeName.toLowerCase();
    if (matchedCountry === 'CN' && (placeNameLower.includes('베이징') || placeNameLower.includes('beijing'))) {
      region = '베이징';
    } else if (matchedCountry === 'KR' && placeNameLower.includes('서울')) {
      region = '서울특별시';
    } else if (matchedCountry === 'FR' && (placeNameLower.includes('파리') || placeNameLower.includes('paris'))) {
      region = '파리';
    } else if (matchedCountry === 'GB' && (placeNameLower.includes('런던') || placeNameLower.includes('london'))) {
      region = '런던';
    } else if (matchedCountry === 'US' && (placeNameLower.includes('뉴욕') || placeNameLower.includes('new york'))) {
      region = '뉴욕';
    } else {
      region = '미분류';
    }
  }

  return {
    region: region || '미분류',
    country: matchedCountryName,
    countryCode: matchedCountry
  };
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

// 🚀 초효율 자동완성 프롬프트 (도시/국가 우선 + 관광명소)
function createAutocompletePrompt(query: string, language: Language): string {
  const prompts = {
    ko: `중요: 첫 번째 결과는 반드시 사용자가 입력한 장소명 자체여야 함. location 필드에는 "구체적인 도시명, 국가명" 형태로 정확히 작성.

"${query}" 검색 결과 6개를 JSON 형태로:

1단계: 입력된 장소명 분석 및 정확한 위치 파악
- "${query}"가 도시/국가/지역명인가? → 첫 번째는 반드시 "${query}, 국가명" 형태
- "${query}"가 관광명소인가? → 첫 번째는 "${query}"이 위치한 정확한 "도시명, 국가명"으로

2단계: location 필드 정확성 확보
- 모든 장소의 location은 "구체적인 도시명, 국가명" 형태 (예: "베이징, 중국", "서울, 대한민국")
- 지역/주 단위가 아닌 실제 도시명 사용 필수

3단계: 결과 구성 (순서 엄수)
1. 첫 번째: "${query}"의 정식명칭 (정확한 도시 위치 포함)
2-6. 해당 지역의 주요 관광명소

[{"name":"장소명","location":"구체적도시명, 국가명","isMainLocation":true/false}]

예시:
- "서울" → [{"name":"서울","location":"대한민국","isMainLocation":true}, {"name":"경복궁","location":"서울, 대한민국","isMainLocation":false}...]
- "경복궁" → [{"name":"경복궁","location":"서울, 대한민국","isMainLocation":true}...]
- "만리장성" → [{"name":"만리장성","location":"베이징, 중국","isMainLocation":true}...]
- "에펠탑" → [{"name":"에펠탑","location":"파리, 프랑스","isMainLocation":true}...]`,

    en: `CRITICAL: First result MUST be the exact location name the user typed. Location field must be in "Specific City, Country" format exactly.

Provide 6 results for "${query}" in JSON format:

Step 1: Analyze input location and determine precise location
- Is "${query}" a city/country/region? → First result MUST be "${query}, CountryName" format
- Is "${query}" an attraction? → First result with precise "CityName, CountryName" where it's located

Step 2: Ensure location field accuracy
- ALL location fields must be "Specific City Name, Country Name" format (e.g., "Beijing, China", "Seoul, South Korea")
- Use actual city names, not regions/states

Step 3: Results structure (strict order)
1. First: Official name of "${query}" (with precise city location)
2-6. Major attractions in that area

[{"name":"place","location":"SpecificCity, Country","isMainLocation":true/false}]

Examples:
- "Paris" → [{"name":"Paris","location":"France","isMainLocation":true}, {"name":"Eiffel Tower","location":"Paris, France","isMainLocation":false}...]
- "Eiffel Tower" → [{"name":"Eiffel Tower","location":"Paris, France","isMainLocation":true}...]
- "Great Wall" → [{"name":"Great Wall of China","location":"Beijing, China","isMainLocation":true}...]`,

    ja: `重要：最初の結果は、ユーザーが入力した場所名そのものでなければならない。

「${query}」の検索結果6個をJSON形式で：

ステップ1：入力場所名の分析
- 「${query}」は都市/国/地域名か？ → 最初は必ず「${query}、国名」形式
- 「${query}」は観光名所か？ → 最初は「${query}」そのまま

ステップ2：結果構成（順序厳守）
1. 最初：「${query}」の正式名称（都市なら「都市、国」、名所なら名所名）
2-6. その地域の主要観光名所

[{"name":"場所名","location":"詳細位置","isMainLocation":true/false}]`,

    zh: `重要：第一个结果必须是用户输入的地点名称本身。

提供"${query}"搜索结果6个，JSON格式：

步骤1：分析输入地点名
- "${query}"是城市/国家/地区名？→ 第一个必须是"${query}，国家名"格式
- "${query}"是旅游景点？→ 第一个是"${query}"原样

步骤2：结果构成（严格顺序）
1. 第一个："${query}"的正式名称（如果是城市→"城市，国家"，如果是景点→景点名）
2-6. 该地区的主要旅游景点

[{"name":"地点名","location":"详细位置","isMainLocation":true/false}]`,

    es: `CRÍTICO: El primer resultado DEBE ser exactamente el nombre del lugar que escribió el usuario.

Proporciona 6 resultados para "${query}" en formato JSON:

Paso 1: Analizar ubicación ingresada
- ¿Es "${query}" una ciudad/país/región? → Primer resultado DEBE ser formato "${query}, NombrePaís"
- ¿Es "${query}" una atracción? → Primer resultado es "${query}" tal como está

Paso 2: Estructura de resultados (orden estricto)
1. Primero: Nombre oficial de "${query}" (si ciudad → "Ciudad, País", si atracción → nombre atracción)
2-6. Principales atracciones de esa área

[{"name":"lugar","location":"ubicación detallada","isMainLocation":true/false}]`
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

// 간단한 메모리 캐시 (개발환경용)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// Sanitize input
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>\"\']/g, '')
    .replace(/[^\w\s가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-.,!?]/gi, '')
    .trim()
    .substring(0, 100);
}

// 🚀 개선된 JSON 파싱 (Gemini JSON 모드 최적화)
function parseAIResponse<T>(text: string): T | null {
  try {
    // 빈 응답 체크
    if (!text || text.trim().length === 0) {
      console.error('❌ 빈 AI 응답');
      return null;
    }

    const cleanText = text.trim();
    console.log('🔍 파싱 시도할 텍스트:', cleanText.substring(0, 200));
    
    // 이미 JSON인지 직접 파싱 시도
    try {
      return JSON.parse(cleanText) as T;
    } catch {
      // JSON 추출 시도
      const jsonMatch = cleanText.match(/\[[\s\S]*?\]|\{[\s\S]*?\}/);
      if (jsonMatch) {
        console.log('🎯 추출된 JSON:', jsonMatch[0].substring(0, 100));
        return JSON.parse(jsonMatch[0]) as T;
      }
      throw new Error('JSON 형태를 찾을 수 없음');
    }
  } catch (error) {
    console.error('JSON 파싱 실패:', error);
    console.error('📝 원본 텍스트 길이:', text.length);
    console.error('📝 원본 텍스트:', text.substring(0, 500));
    return null;
  }
}

/**
 * 🔧 검색 결과 후처리 - 새로운 구조화된 데이터 생성
 */
function postProcessSearchResults(
  query: string, 
  suggestions: {name: string, location: string, isMainLocation?: boolean}[]
): EnhancedLocationSuggestion[] {
  if (!suggestions || suggestions.length === 0) return [];
  
  console.log('🔧 검색 결과 후처리 시작:', { query, suggestionsCount: suggestions.length });
  
  // 1단계: 입력된 query가 우리가 알고 있는 도시/국가인지 확인
  const queryClassification = classifyLocation(query);
  console.log('🏷️ Query 분류 결과:', queryClassification);
  
  const processedResults: EnhancedLocationSuggestion[] = [];
  
  for (let index = 0; index < suggestions.length; index++) {
    const suggestion = suggestions[index];
    
    // 지역 정보 추출
    const regionalInfo = extractRegionalInfo(suggestion.location, suggestion.name);
    console.log(`🌍 ${suggestion.name}의 지역 정보:`, regionalInfo);
    
    // 위치 타입 결정
    let locationType: 'location' | 'attraction' = 'attraction';
    const suggestionClassification = classifyLocation(suggestion.name);
    
    if (index === 0 || suggestion.isMainLocation || 
        (suggestionClassification && ['country', 'province', 'city'].includes(suggestionClassification.type))) {
      locationType = 'location';
    }
    
    const enhancedSuggestion: EnhancedLocationSuggestion = {
      name: suggestion.name,
      location: suggestion.location,
      region: regionalInfo.region,
      country: regionalInfo.country,
      countryCode: regionalInfo.countryCode,
      type: locationType,
      isMainLocation: index === 0 || suggestion.isMainLocation === true,
      category: locationType === 'location' ? 'location' : 'attraction',
      confidence: 0.9 - (index * 0.1), // 순서에 따른 신뢰도
      metadata: {
        isOfficial: index === 0 || suggestion.isMainLocation === true,
        category: locationType,
        popularity: Math.max(10 - index, 1)
      }
    };
    
    processedResults.push(enhancedSuggestion);
  }
  
  // 2단계: 첫 번째 결과가 올바른 위치 타입인지 확인
  if (queryClassification && ['country', 'province', 'city'].includes(queryClassification.type)) {
    const firstResult = processedResults[0];
    
    // 첫 번째 결과가 도시/지역이 아니라면 올바른 순서로 재정렬
    if (firstResult.type !== 'location') {
      console.log('⚠️ 첫 번째 결과가 도시/지역이 아님, 재정렬 시작');
      
      const correctLocationIndex = processedResults.findIndex(result => 
        result.type === 'location' &&
        (result.name.toLowerCase().includes(query.toLowerCase()) || 
         query.toLowerCase().includes(result.name.toLowerCase()))
      );
      
      if (correctLocationIndex > 0) {
        // 올바른 위치를 첫 번째로 이동
        const correctLocation = { ...processedResults[correctLocationIndex], isMainLocation: true };
        const reorderedResults = [
          correctLocation,
          ...processedResults.slice(0, correctLocationIndex),
          ...processedResults.slice(correctLocationIndex + 1)
        ];
        
        // isMainLocation 플래그 재설정
        reorderedResults.forEach((result, idx) => {
          result.isMainLocation = idx === 0;
        });
        
        console.log('✅ 재정렬 완료:', {
          original: processedResults.map(s => s.name),
          reordered: reorderedResults.map(s => s.name)
        });
        
        return reorderedResults;
      }
    }
  }
  
  console.log('✅ 후처리 완료:', {
    results: processedResults.length,
    firstResult: processedResults[0]?.name,
    firstRegion: processedResults[0]?.region,
    firstCountry: processedResults[0]?.country
  });
  
  return processedResults;
}

// 🗑️ 사용하지 않는 함수 제거됨 (AI 자동완성만 사용)

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

    console.log('🔍 AI 자동완성 시작:', { query: sanitizedQuery, language: lang });

    // 캐시 확인
    const cacheKey = `${sanitizedQuery}-${lang}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('💾 캐시에서 반환:', cached.data.length, '개');
      return NextResponse.json({
        success: true,
        data: cached.data,
        source: 'cache',
        enhanced: true,
        fallback: false
      });
    }

    // 🚀 AI 자동완성 직접 생성 (초효율 JSON 모드)
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.5-flash-lite', // 초고속 경량 모델
      generationConfig: {
        temperature: 0.1, // 정확성 우선
        maxOutputTokens: 250, // 최소한으로 줄임
        topP: 0.9,
        topK: 5, // 더 focused
        responseMimeType: "application/json", // JSON 강제
      }
    });

    // 🚀 AI 자동완성 1회 호출 (빠른 응답)
    console.log('🚀 AI 자동완성 생성 시작');
    const autocompletePrompt = createAutocompletePrompt(sanitizedQuery, lang);
    
    try {
      // 10초 타임아웃 설정
      const autocompletePromise = model.generateContent(autocompletePrompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
      );
      
      const autocompleteResult = await Promise.race([autocompletePromise, timeoutPromise]);
      const autocompleteText = await autocompleteResult.response.text();
      
      console.log('🧠 AI 응답:', autocompleteText.substring(0, 200));
      const suggestions = parseAIResponse<{name: string, location: string, isMainLocation?: boolean}[]>(autocompleteText);
      
      if (suggestions && suggestions.length > 0) {
        console.log('✅ AI 자동완성 성공:', suggestions.length, '개');
        
        // 🔧 위치 분류 시스템을 활용한 결과 후처리
        const processedSuggestions = postProcessSearchResults(sanitizedQuery, suggestions.slice(0, 6));
        
        console.log('🔧 후처리 완료:', {
          original: suggestions.slice(0, 6).map(s => s.name),
          processed: processedSuggestions.map(s => s.name),
          firstIsMainLocation: processedSuggestions[0]?.isMainLocation
        });

        // 캐시에 저장
        cache.set(cacheKey, {
          data: processedSuggestions,
          timestamp: Date.now()
        });
        
        return NextResponse.json({
          success: true,
          data: processedSuggestions,
          source: 'ai_autocomplete',
          enhanced: true,
          fallback: false,
          postProcessed: true
        });
      }
    } catch (aiError) {
      console.warn('❌ AI 자동완성 실패:', aiError);
    }

    // 🚨 AI 실패 시 빈 결과 반환 (잘못된 정보보다 나음)
    console.warn('❌ AI 자동완성 실패, 빈 결과 반환');
    
    return NextResponse.json({
      success: true,
      data: [], // 빈 배열 반환
      source: 'ai_failed',
      enhanced: false,
      fallback: false,
      message: 'AI 자동완성을 사용할 수 없습니다. 검색어를 직접 입력해주세요.'
    });

  } catch (error) {
    console.error('❌ 위치 검색 완전 실패:', error);
    
    // 최종 실패 시에도 빈 결과 반환 (잘못된 정보 방지)
    return NextResponse.json({
      success: false,
      data: [],
      source: 'server_error',
      enhanced: false,
      fallback: false,
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : '서버 오류가 발생했습니다.',
      message: '검색을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.'
    });
  }
}