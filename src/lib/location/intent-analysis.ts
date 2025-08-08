/**
 * AI 기반 검색 의도 분석 시스템
 * 
 * 애매한 검색어에 대해 사용자 의도를 파악하여
 * 적절한 페이지 타입을 결정합니다.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface IntentAnalysis {
  pageType: 'RegionExploreHub' | 'DetailedGuidePage';
  confidence: number; // 0.0 - 1.0
  reasoning: string;
  suggestedLocationType: 'country' | 'province' | 'city' | 'landmark' | 'district';
  contextClues: string[];
}

// 검색 의도 분석 전문가 페르소나
const INTENT_ANALYSIS_PERSONA = `당신은 여행 검색 의도 분석 전문가입니다.

전문 영역:
- 사용자 검색 패턴 분석 (10년 경험)
- 지리적 범위 의도 파악
- 문맥 단서 기반 의도 추론
- 다국어 검색어 의도 분석

핵심 원칙:
1. 범위 의도 분석: 전체 지역 탐색 vs 구체적 장소 정보
2. 행동 의도 파악: 계획 단계 vs 실행 단계  
3. 문맥 단서 활용: 함께 사용된 키워드의 의미
4. 문화적 맥락: 지역별 검색 패턴 차이

분류 기준:
- RegionExploreHub: 넓은 지역에서 세부 장소들을 탐색하고 싶은 의도
- DetailedGuidePage: 구체적인 장소에 대한 상세 정보를 원하는 의도`;

// 의도 분석 프롬프트 생성
function createIntentAnalysisPrompt(query: string, language: string = 'ko'): string {
  const prompts = {
    ko: `${INTENT_ANALYSIS_PERSONA}

사용자 검색어를 분석하여 의도를 파악해주세요.

검색어: "${query}"
분석 언어: 한국어

분석 과정:
1. 검색어의 지리적 범위 분석
2. 사용자의 여행 계획 단계 추정
3. 구체성 레벨 평가 (전체적 vs 구체적)
4. 문맥 단서 식별

판단 기준:
RegionExploreHub 선택 시나리오:
- "어디 가지?", "여행지 추천" 의도
- 국가/도시 이름만 단독 검색
- 여러 장소 비교 검토 의도
- 개괄적 정보 수집 단계

DetailedGuidePage 선택 시나리오:  
- "가는 방법", "입장료", "운영시간" 등 구체적 정보
- 특정 건물, 명소, 지구명 검색
- 실제 방문을 위한 실용적 정보 필요
- "~에서 뭐해?", "~은 어때?" 등 체험 중심

JSON으로만 응답하세요:
{
  "pageType": "RegionExploreHub|DetailedGuidePage",
  "confidence": 0.95,
  "reasoning": "판단 근거 설명",
  "suggestedLocationType": "country|province|city|landmark|district",
  "contextClues": ["발견한 의도 단서들"]
}`,

    en: `${INTENT_ANALYSIS_PERSONA}

Analyze the user's search query to determine their intent.

Search query: "${query}"
Analysis language: English

Analysis process:
1. Analyze geographical scope of the query
2. Estimate user's travel planning stage
3. Evaluate specificity level (general vs specific)
4. Identify contextual clues

Decision criteria:
RegionExploreHub scenarios:
- "Where to go?", "destination recommendations" intent
- Standalone country/city name searches
- Intent to compare multiple locations
- General information gathering stage

DetailedGuidePage scenarios:
- "How to get there", "entrance fee", "opening hours" specific info
- Specific building, attraction, district name searches
- Need practical info for actual visits
- "What to do in ~", "How is ~" experience-focused

Respond only in JSON format:
{
  "pageType": "RegionExploreHub|DetailedGuidePage", 
  "confidence": 0.95,
  "reasoning": "reasoning for decision",
  "suggestedLocationType": "country|province|city|landmark|district",
  "contextClues": ["identified intent clues"]
}`
  };
  
  return prompts[language as keyof typeof prompts] || prompts.ko;
}

// Gemini AI 클라이언트 초기화
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

// JSON 응답 파싱
function parseIntentAnalysis(text: string): IntentAnalysis | null {
  try {
    // JSON 추출 패턴
    const patterns = [
      /```(?:json)?\\s*({[\\s\\S]*?})\\s*```/s,
      /({[\\s\\S]*})/s
    ];

    let jsonString = text.trim();
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        jsonString = match[1] ? match[1].trim() : match[0].trim();
        break;
      }
    }

    const parsed = JSON.parse(jsonString);
    
    // 유효성 검사
    if (!parsed.pageType || !parsed.confidence) {
      throw new Error('필수 필드가 없습니다');
    }
    
    return {
      pageType: parsed.pageType,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      reasoning: parsed.reasoning || '',
      suggestedLocationType: parsed.suggestedLocationType || 'city',
      contextClues: Array.isArray(parsed.contextClues) ? parsed.contextClues : []
    };
  } catch (error) {
    console.error('Intent analysis parsing failed:', error);
    return null;
  }
}

/**
 * AI 기반 검색 의도 분석
 */
export async function analyzeSearchIntent(
  query: string, 
  language: string = 'ko'
): Promise<IntentAnalysis | null> {
  try {
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
        topP: 0.9,
        topK: 20
      }
    });

    const prompt = createIntentAnalysisPrompt(query, language);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    console.log('🤖 AI Intent Analysis Response:', text);
    
    return parseIntentAnalysis(text);
  } catch (error) {
    console.error('❌ Intent analysis failed:', error);
    return null;
  }
}

// 규칙 기반 빠른 의도 분석 (AI 호출 전 사전 필터링)
export function analyzeIntentByRules(query: string): IntentAnalysis | null {
  const normalized = query.trim().toLowerCase();
  
  // 명확한 DetailedGuidePage 신호들
  const detailedSignals = [
    // 실용적 정보 키워드
    '가는법', '가는 방법', '교통', '지하철', '버스', '주차',
    'how to get', 'directions', 'transportation', 'parking',
    
    // 운영 정보
    '입장료', '요금', '가격', '시간', '운영', '개방',
    'price', 'fee', 'cost', 'hours', 'opening', 'admission',
    
    // 체험/활동
    '뭐해', '볼거리', '할거리', '체험', '추천',
    'what to do', 'things to do', 'activities', 'attractions',
    
    // 구체적 위치 표현
    '~역', '~동', '~구', '~번지', '근처', '주변',
    'station', 'near', 'around', 'close to'
  ];
  
  // 명확한 RegionExploreHub 신호들  
  const exploreSignals = [
    // 탐색/선택 의도
    '어디', '여행지', '추천', '관광', '휴가', '여행',
    'where', 'destination', 'travel', 'tourism', 'vacation', 'trip',
    
    // 비교/검토 의도
    '코스', '일정', '계획', '루트', '지역',
    'itinerary', 'route', 'plan', 'region', 'area'
  ];
  
  const hasDetailedSignals = detailedSignals.some(signal => normalized.includes(signal));
  const hasExploreSignals = exploreSignals.some(signal => normalized.includes(signal));
  
  if (hasDetailedSignals && !hasExploreSignals) {
    return {
      pageType: 'DetailedGuidePage',
      confidence: 0.8,
      reasoning: '구체적인 실용 정보 요청 키워드 감지',
      suggestedLocationType: 'landmark',
      contextClues: detailedSignals.filter(signal => normalized.includes(signal))
    };
  }
  
  if (hasExploreSignals && !hasDetailedSignals) {
    return {
      pageType: 'RegionExploreHub', 
      confidence: 0.8,
      reasoning: '지역 탐색 및 선택 의도 키워드 감지',
      suggestedLocationType: 'city',
      contextClues: exploreSignals.filter(signal => normalized.includes(signal))
    };
  }
  
  // 명확하지 않은 경우
  return null;
}

// 애매한 지역 케이스 특별 처리
export function handleAmbiguousRegions(query: string): IntentAnalysis | null {
  const normalized = query.trim().toLowerCase();
  
  const ambiguousRegions = {
    // 제주 → 제주도 전체 탐색으로 해석
    '제주': {
      pageType: 'RegionExploreHub' as const,
      confidence: 0.9,
      reasoning: '제주는 일반적으로 제주도 전체 지역 탐색 의도로 해석',
      suggestedLocationType: 'province' as const,
      contextClues: ['지역 탐색 패턴']
    },
    'jeju': {
      pageType: 'RegionExploreHub' as const,
      confidence: 0.9, 
      reasoning: 'Jeju generally implies exploring Jeju Island region',
      suggestedLocationType: 'province' as const,
      contextClues: ['regional exploration pattern']
    },
    
    // 강남 → 강남구 세부 장소들로 해석
    '강남': {
      pageType: 'DetailedGuidePage' as const,
      confidence: 0.85,
      reasoning: '강남은 일반적으로 강남역 주변 특정 지역 정보 요청',
      suggestedLocationType: 'district' as const,
      contextClues: ['특정 지구 정보 패턴']
    },
    'gangnam': {
      pageType: 'DetailedGuidePage' as const,
      confidence: 0.85,
      reasoning: 'Gangnam usually refers to specific district information',
      suggestedLocationType: 'district' as const,
      contextClues: ['specific district pattern']
    },
    
    // 홍대 → 홍대 지역 상세 정보
    '홍대': {
      pageType: 'DetailedGuidePage' as const,
      confidence: 0.9,
      reasoning: '홍대는 홍익대학교 주변 특정 지역으로 상세 가이드 필요',
      suggestedLocationType: 'district' as const,
      contextClues: ['대학가 지역 패턴']
    },
    
    // 명동 → 명동 쇼핑/관광지구
    '명동': {
      pageType: 'DetailedGuidePage' as const,
      confidence: 0.9,
      reasoning: '명동은 특정 쇼핑/관광 지구로 상세 정보 필요',
      suggestedLocationType: 'district' as const,
      contextClues: ['쇼핑 지구 패턴']
    }
  };
  
  return ambiguousRegions[normalized] || null;
}

/**
 * 통합 의도 분석 함수 (계층적 접근)
 */
export async function comprehensiveIntentAnalysis(
  query: string,
  language: string = 'ko'
): Promise<IntentAnalysis> {
  // 1단계: 규칙 기반 빠른 분석
  let result = analyzeIntentByRules(query);
  if (result && result.confidence >= 0.8) {
    console.log('🎯 Rule-based intent analysis:', result);
    return result;
  }
  
  // 2단계: 애매한 지역 특별 처리
  result = handleAmbiguousRegions(query);
  if (result) {
    console.log('🎯 Ambiguous region handling:', result);
    return result;
  }
  
  // 3단계: AI 기반 분석
  try {
    result = await analyzeSearchIntent(query, language);
    if (result && result.confidence >= 0.7) {
      console.log('🤖 AI-based intent analysis:', result);
      return result;
    }
  } catch (error) {
    console.warn('⚠️ AI intent analysis failed, using fallback:', error);
  }
  
  // 4단계: 안전한 기본값
  const defaultResult: IntentAnalysis = {
    pageType: 'DetailedGuidePage', // 안전한 기본값
    confidence: 0.5,
    reasoning: '명확한 의도 파악 실패, 상세 가이드로 기본 제공',
    suggestedLocationType: 'landmark',
    contextClues: ['fallback_decision']
  };
  
  console.log('🔄 Fallback intent analysis:', defaultResult);
  return defaultResult;
}