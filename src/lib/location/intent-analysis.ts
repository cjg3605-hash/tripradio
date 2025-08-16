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
const INTENT_ANALYSIS_PERSONA = `당신은 전 세계 여행 지리학 및 검색 의도 분석 최고 전문가입니다.

전문 영역:
- 글로벌 지리학 및 관광지 분석 (15년 경험)
- 전 세계 도시, 지역, 명소의 정확한 분류
- 사용자 여행 검색 패턴 분석
- 다국어/다문화 검색어 의도 분석
- 지리적 계층 구조 이해 (국가 → 주/지역 → 도시 → 구체적 장소)

핵심 분류 지식:
1. **국가 (Country)**: 프랑스, 스페인, 이탈리아, 독일, 일본, 한국, 미국 등
2. **주/지역 (Province/State)**: 토스카나, 안달루시아, 바이에른, 캘리포니아 등  
3. **도시 (City)**: 파리, 세비야, 바르셀로나, 마드리드, 로마, 피렌체, 뮌헨, 뉴욕, 도쿄, 서울 등
4. **구체적 장소 (Landmark)**: 에펠탑, 사그라다 파밀리아, 콜로세움, 경복궁, 루브르 박물관 등

**전 세계 주요 도시 분류 지식**:
- 유럽: 세비야, 바르셀로나, 파리, 로마, 베를린, 뮌헨, 런던, 프라하, 스톡홀름, 암스테르담
- 아시아: 서울, 도쿄, 방콕, 싱가포르, 뭄바이, 델리, 상하이, 베이징, 홍콩, 쿠알라룸푸르
- 북미: 뉴욕, 로스앤젤레스, 토론토, 밴쿠버, 멕시코시티
- 남미: 리오데자네이루, 상파울루, 부에노스아이레스, 리마, 카라카스
- 아프리카: 카이로, 카사블랑카, 케이프타운, 요하네스버그, 나이로비
- 오세아니아: 시드니, 멜버른, 오클랜드, 웰링턴

**도시 인식 패턴 (Universal)**:
- **수도 도시**: 카이로, 부에노스아이레스, 방콕 등 → RegionExploreHub
- **관광 도시**: 리오데자네이루, 시드니, 프라하 등 → RegionExploreHub
- **경제 도시**: 싱가포르, 홍콩, 상하이 등 → RegionExploreHub  
- **문화 도시**: 스톡홀름, 암스테르담, 케이프타운 등 → RegionExploreHub
- **도시 패턴**: "-시", "-도시", "City", "São", "Rio de", "Buenos", "New" 접두사

**일반화 규칙**:
- 도시로 알려진 모든 지명 → RegionExploreHub
- 구체적 건물/명소로 알려진 지명 → DetailedGuidePage
- 애매한 경우 → 더 넓은 지역(도시) 우선 선택

분류 원칙:
- **RegionExploreHub**: 도시, 지역, 국가 → 여러 장소를 탐색하고 비교 선택하려는 의도
- **DetailedGuidePage**: 구체적 명소, 건물, 지구 → 특정 장소의 상세 정보가 필요한 의도`;

// 의도 분석 프롬프트 생성
function createIntentAnalysisPrompt(query: string, language: string = 'ko'): string {
  const prompts = {
    ko: `${INTENT_ANALYSIS_PERSONA}

사용자 검색어를 정확히 분석하여 올바른 페이지 타입을 결정해주세요.

검색어: "${query}"
분석 언어: 한국어

**1단계: 지리적 엔티티 식별**
검색어가 다음 중 무엇인지 정확히 판단:
- 국가: 프랑스, 스페인, 독일, 이탈리아, 일본, 한국 등
- 도시: 세비야, 파리, 바르셀로나, 로마, 베를린, 뮌헨, 도쿄, 서울 등  
- 명소: 에펠탑, 사그라다 파밀리아, 콜로세움, 경복궁, 루브르 등
- 지구: 홍대, 명동, 시부야, 몽마르트 등

**2단계: 사용자 의도 분석**
- 탐색 의도: "세비야에는 뭐가 있지?", "어디 갈까?" → RegionExploreHub
- 구체적 정보: "에펠탑 입장료", "가는 방법" → DetailedGuidePage

**🚨 중요: 의심스러우면 DetailedGuidePage 우선 원칙**

**핵심 분류 규칙 (전세계 적용)**:

🏙️ **RegionExploreHub** (도시/지역 탐색) - 매우 엄격한 기준:
- **명확한 도시**: "서울", "파리", "뉴욕", "도쿄", "런던", "베를린", "마드리드" 등 **세계적으로 잘 알려진 도시명만**
- **명확한 국가**: "프랑스", "스페인", "이탈리아", "일본", "한국" 등 **명확한 국가명만**
- **명확한 지역**: "토스카나", "안달루시아", "캘리포니아" 등 **명확한 주/지역명만**

🏛️ **DetailedGuidePage** (구체적 장소) - 기본값 우선:
- **모든 건물명**: 궁전, 저택, 성당, 박물관, 타워, 다리 등
- **모든 명소**: 유적지, 관광지, 테마파크, 기념물 등  
- **애매한 이름**: 도시명인지 확실하지 않은 모든 것
- **신규/생소한 이름**: 정확히 모르는 모든 장소

**⚠️ 절대 원칙: 확실하지 않으면 DetailedGuidePage**
- 도시인지 명소인지 애매하면 → DetailedGuidePage
- 처음 들어본 이름이면 → DetailedGuidePage  
- 구체적인 건물명 패턴이면 → DetailedGuidePage
- 의심의 여지가 조금이라도 있으면 → DetailedGuidePage

**전세계 도시 분류 예시**:
- "리오데자네이루" → 브라질 도시 → RegionExploreHub
- "방콕" → 태국 도시 → RegionExploreHub  
- "프라하" → 체코 도시 → RegionExploreHub
- "마추픽추" → 페루의 구체적 유적 → DetailedGuidePage

**⚠️ 유사명 혼동 방지 규칙**:
- "붉은요새" = "Red Fort" = "Lal Qila" = "레드포트" = "赤い要塞" → 모두 인도 델리의 동일한 명소
- "대왕궁" = "Grand Palace" = "그랜드 팰리스" = "왕궁" = "방콕 대왕궁" → 모두 태국 방콕의 동일한 명소
- "타지마할" = "Taj Mahal" = "タージマハル" = "泰姬陵" → 모두 인도 아그라의 동일한 명소
- 번역/언어가 다르더라도 같은 명소를 가리키는 경우 동일하게 DetailedGuidePage로 분류

JSON으로만 응답:
{
  "pageType": "RegionExploreHub|DetailedGuidePage",
  "confidence": 0.95,
  "reasoning": "구체적 판단 근거",
  "suggestedLocationType": "country|province|city|landmark|district", 
  "contextClues": ["분석 근거"]
}`,

    en: `${INTENT_ANALYSIS_PERSONA}

Analyze the user's search query accurately to determine the correct page type.

Search query: "${query}"
Analysis language: English

**Step 1: Geographic Entity Identification**
Precisely identify what the search query is:
- Country: France, Spain, Germany, Italy, Japan, Korea, etc.
- City: Seville, Paris, Barcelona, Rome, Berlin, Munich, Tokyo, Seoul, etc.
- Landmark: Eiffel Tower, Sagrada Familia, Colosseum, Gyeongbokgung, Louvre, etc.
- District: Hongdae, Myeongdong, Shibuya, Montmartre, etc.

**Step 2: User Intent Analysis**
- Exploration intent: "What's in Seville?", "Where to go?" → RegionExploreHub
- Specific info: "Eiffel Tower tickets", "How to get there" → DetailedGuidePage

**🚨 Important: When in doubt, prioritize DetailedGuidePage**

**Core Classification Rules (Global Application)**:

🏙️ **RegionExploreHub** (City/Region Exploration) - Very Strict Criteria:
- **Clear Cities Only**: "Seoul", "Paris", "New York", "Tokyo", "London", "Berlin", "Madrid" etc. **Only globally well-known city names**
- **Clear Countries Only**: "France", "Spain", "Italy", "Japan", "Korea" etc. **Only clear country names**
- **Clear Regions Only**: "Tuscany", "Andalusia", "California" etc. **Only clear state/province names**

🏛️ **DetailedGuidePage** (Specific Places) - Default Priority:
- **All Building Names**: Palaces, mansions, cathedrals, museums, towers, bridges etc.
- **All Landmarks**: Historic sites, tourist attractions, theme parks, monuments etc.
- **Ambiguous Names**: Anything not clearly identifiable as a city
- **New/Unfamiliar Names**: Any place you're not completely sure about

**⚠️ Absolute Rule: When uncertain, choose DetailedGuidePage**
- City vs landmark ambiguous → DetailedGuidePage
- Never heard the name before → DetailedGuidePage
- Contains building name patterns → DetailedGuidePage
- Any doubt whatsoever → DetailedGuidePage

**Global City Classification Examples**:
- "Rio de Janeiro" → Brazilian city → RegionExploreHub
- "Bangkok" → Thai city → RegionExploreHub
- "Prague" → Czech city → RegionExploreHub  
- "Machu Picchu" → Specific Peruvian site → DetailedGuidePage

**⚠️ Similar Name Confusion Prevention Rules**:
- "Red Fort" = "Lal Qila" = "붉은요새" = "赤い要塞" → All refer to the same landmark in Delhi, India
- "Grand Palace" = "대왕궁" = "그랜드 팰리스" = "왕궁" → All refer to the same landmark in Bangkok, Thailand  
- "Taj Mahal" = "タージマハル" = "타지마할" = "泰姬陵" → All refer to the same landmark in Agra, India
- Even if translation/language differs, classify as DetailedGuidePage if referring to the same landmark

Respond only in JSON:
{
  "pageType": "RegionExploreHub|DetailedGuidePage",
  "confidence": 0.95,
  "reasoning": "specific reasoning",
  "suggestedLocationType": "country|province|city|landmark|district",
  "contextClues": ["analysis evidence"]
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
    'station', 'near', 'around', 'close to',
    
    // 구체적 건물/명소 패턴
    '저택', '궁전', '궁', '관', '별장', '성당', '사원', '교회', '박물관', '미술관', '타워', '다리', '문', '광장',
    'palace', 'mansion', 'house', 'villa', 'cathedral', 'temple', 'church', 'museum', 'gallery', 'tower', 'bridge', 'gate', 'square',
    'palau', 'casa', 'sagrada', 'basilica',
    
    // 가우디 관련 패턴  
    '구엘', 'güell', 'gaudi', '가우디', '바트요', 'batlló', '밀라', 'milà'
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