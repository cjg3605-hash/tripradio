import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyLocation, determinePageType, ALL_LOCATIONS, ALIAS_TO_LOCATION } from '@/lib/location/location-classification';
// Google Geocoding API 제거 - Gemini로 대체

// 동적 렌더링 강제 (API는 동적이어야 함)
export const dynamic = 'force-dynamic';
export const maxDuration = 20; // Vercel Pro에서 최대 20초

// Types - 새로운 구조화된 위치 데이터 인터페이스
interface EnhancedLocationSuggestion {
  name: string;          // 장소명
  location: string;      // 상세 위치 (기존 호환성)
  region: string;        // 지역/도시
  country: string;       // 국가명 (기존 호환성)
  displayCountry: string;  // 화면 표시용 국가명 (현지 언어)
  apiCountry: string;      // API 호출용 국가명 (영어)
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

// 자동완성 프롬프트 최적화 (같은 도시 유명 관광지)
function createAutocompletePrompt(query: string, language: Language): string {
  const prompts = {
    ko: `"${query}" 관광지 자동완성:
[
{"name":"${query}","location":"${query}, 도시, 국가","displayCountry":"한국어국가명","apiCountry":"영어국가명","type":"location"},
{"name":"같은도시유명명소1","location":"명소1, 도시, 국가","displayCountry":"한국어국가명","apiCountry":"영어국가명","type":"attraction"},
{"name":"같은도시유명명소2","location":"명소2, 도시, 국가","displayCountry":"한국어국가명","apiCountry":"영어국가명","type":"attraction"},
{"name":"같은도시유명명소3","location":"명소3, 도시, 국가","displayCountry":"한국어국가명","apiCountry":"영어국가명","type":"attraction"}
]
중요: 같은 도시 유명관광지만. displayCountry=한국어(프랑스,일본,미국), apiCountry=영어(France,Japan,USA).`,

    en: `"${query}" travel autocomplete:
[
{"name":"${query}","location":"${query}, City, Country","displayCountry":"Country","apiCountry":"Country","type":"location"},
{"name":"famous_landmark1","location":"landmark1, City, Country","displayCountry":"Country","apiCountry":"Country","type":"attraction"},
{"name":"famous_landmark2","location":"landmark2, City, Country","displayCountry":"Country","apiCountry":"Country","type":"attraction"},
{"name":"famous_landmark3","location":"landmark3, City, Country","displayCountry":"Country","apiCountry":"Country","type":"attraction"}
]
Important: Same city famous attractions only. JSON only.`,

    ja: `"${query}" 観光地自動補完:
[
{"name":"${query}","location":"${query}, 都市, 国","displayCountry":"日本語国名","apiCountry":"英語国名","type":"location"},
{"name":"同都市有名名所1","location":"名所1, 都市, 国","displayCountry":"日本語国名","apiCountry":"英語国名","type":"attraction"},
{"name":"同都市有名名所2","location":"名所2, 都市, 国","displayCountry":"日本語国名","apiCountry":"英語国名","type":"attraction"},
{"name":"同都市有名名所3","location":"名所3, 都市, 国","displayCountry":"日本語国名","apiCountry":"英語国名","type":"attraction"}
]
重要: 同じ都市の有名観光地. displayCountry=日本語(フランス,日本,アメリカ), apiCountry=英語(France,Japan,USA).`,

    zh: `"${query}" 旅游地自动补全:
[
{"name":"${query}","location":"${query}, 城市, 国家","displayCountry":"中文国家名","apiCountry":"英文国家名","type":"location"},
{"name":"同城著名景点1","location":"景点1, 城市, 国家","displayCountry":"中文国家名","apiCountry":"英文国家名","type":"attraction"},
{"name":"同城著名景点2","location":"景点2, 城市, 国家","displayCountry":"中文国家名","apiCountry":"英文国家名","type":"attraction"},
{"name":"同城著名景点3","location":"景点3, 城市, 国家","displayCountry":"中文国家名","apiCountry":"英文国家名","type":"attraction"}
]
重要: 同城市著名景点. displayCountry=中文(法国,日本,美国), apiCountry=英文(France,Japan,USA).`,

    es: `"${query}" autocompletar turismo:
[
{"name":"${query}","location":"${query}, Ciudad, País","displayCountry":"PaísEspañol","apiCountry":"PaísInglés","type":"location"},
{"name":"atracción_famosa1","location":"atracción1, Ciudad, País","displayCountry":"PaísEspañol","apiCountry":"PaísInglés","type":"attraction"},
{"name":"atracción_famosa2","location":"atracción2, Ciudad, País","displayCountry":"PaísEspañol","apiCountry":"PaísInglés","type":"attraction"},
{"name":"atracción_famosa3","location":"atracción3, Ciudad, País","displayCountry":"PaísEspañol","apiCountry":"PaísInglés","type":"attraction"}
]
Importante: Misma ciudad atracciones famosas. displayCountry=español(Francia,Japón,Estados Unidos), apiCountry=inglés(France,Japan,USA).`
  };

  return prompts[language] || prompts.ko;
}

// 간단한 메모리 캐시
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10분으로 확장

// Sanitize input
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>\"\']/g, '')
    .replace(/[^\w\s가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-.,!?]/gi, '')
    .trim()
    .substring(0, 100);
}

// 최적화된 JSON 파싱
function parseAIResponse<T>(text: string): T | null {
  try {
    if (!text || text.trim().length === 0) {
      console.error('❌ 빈 AI 응답');
      return null;
    }

    const cleanText = text.trim();
    
    // 직접 JSON 파싱 시도
    try {
      return JSON.parse(cleanText) as T;
    } catch {
      // 배열 추출
      const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]) as T;
      }
      
      // 객체 추출
      const objectMatch = cleanText.match(/\{[\s\S]*?\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]) as T;
      }
      throw new Error('JSON 형태를 찾을 수 없음');
    }
  } catch (error) {
    console.error('JSON 파싱 실패:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }
) {
  console.log('🔍 API 호출 시작');
  try {
    const { searchParams } = new URL(request.nextUrl);
    const query = searchParams.get('q');
    console.log('📝 쿼리 파라미터:', query);
    
    const { language: languageParam } = await params;
    const language = languageParam as Language;
    console.log('🌍 언어 파라미터:', language);

    // 언어 유효성 검사
    if (!VALID_LANGUAGES.includes(language)) {
      console.log('❌ 지원하지 않는 언어:', language);
      return NextResponse.json({
        success: false,
        error: '지원하지 않는 언어입니다'
      }, { status: 400 });
    }

    if (!query || query.length < 1) {
      console.log('❌ 검색어 없음');
      return NextResponse.json({
        success: false,
        error: '검색어를 입력해주세요'
      }, { status: 400 });
    }

    const sanitizedQuery = sanitizeInput(query);
    console.log('🔍 AI 자동완성 시작:', { query: sanitizedQuery, language });

    // 캐시 확인
    const cacheKey = `${sanitizedQuery}-${language}`;
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

    // AI 자동완성 생성
    console.log('🤖 Gemini 클라이언트 생성 시작');
    const gemini = getGeminiClient();
    console.log('✅ Gemini 클라이언트 생성 완료');
    
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300, // 450 → 300으로 감소 (33% 절약)
        topP: 0.8,
        topK: 10,
        responseMimeType: "application/json",
      }
    });
    console.log('✅ Gemini 모델 설정 완료');

    // AI 자동완성 호출
    console.log('🚀 AI 자동완성 생성 시작');
    const autocompletePrompt = createAutocompletePrompt(sanitizedQuery, language);
    console.log('📝 프롬프트 생성 완료, 길이:', autocompletePrompt.length);
    
    try {
      console.log('⏱️ Gemini API 호출 시작 (1.8초 타임아웃)');
      // 1.8초 타임아웃으로 단축
      const autocompletePromise = model.generateContent(autocompletePrompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout')), 1800)
      );
      
      const autocompleteResult = await Promise.race([autocompletePromise, timeoutPromise]);
      console.log('✅ Gemini API 응답 받음');
      
      if (!autocompleteResult || typeof autocompleteResult !== 'object' || !('response' in autocompleteResult)) {
        console.log('⚠️ AI 자동완성 응답 형식 오류');
        return NextResponse.json({ suggestions: [] });
      }
      
      const autocompleteText = await (autocompleteResult as any).response.text();
      
      console.log('🧠 AI 응답:', autocompleteText.substring(0, 200));
      const suggestions = parseAIResponse<EnhancedLocationSuggestion[]>(autocompleteText);
      
      if (suggestions && suggestions.length > 0) {
        console.log('✅ AI 자동완성 성공:', suggestions.length, '개');
        
        // AI 분류 결과 그대로 사용 (4개로 제한)
        const basicSuggestions = suggestions.slice(0, 4).map((suggestion, index) => {
          return {
            name: suggestion.name,
            location: suggestion.location,
            displayCountry: suggestion.displayCountry,
            apiCountry: suggestion.apiCountry,
            type: 'location',
            category: 'location',
            confidence: 0.9 - (index * 0.1)
          };
        });
        
        console.log('🚀 자동완성 완료 (1+3 구조):', basicSuggestions.map(s => s.name));

        // 캐시에 저장
        cache.set(cacheKey, {
          data: basicSuggestions,
          timestamp: Date.now()
        });
        
        return NextResponse.json({
          success: true,
          data: basicSuggestions,
          source: 'ai_autocomplete',
          enhanced: false,
          fallback: false
        });
      }
    } catch (aiError) {
      console.warn('❌ AI 자동완성 실패:', aiError);
    }

    // AI 실패 시 빈 결과 반환
    console.warn('❌ AI 자동완성 실패, 빈 결과 반환');
    
    return NextResponse.json({
      success: true,
      data: [],
      source: 'ai_failed',
      enhanced: false,
      fallback: false,
      message: 'AI 자동완성을 사용할 수 없습니다. 검색어를 직접 입력해주세요.'
    });

  } catch (error) {
    console.error('❌ API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다'
    }, { status: 500 });
  }
}