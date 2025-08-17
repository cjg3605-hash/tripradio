import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { classifyLocation } from '@/lib/location/location-classification';
import { createClient } from '@supabase/supabase-js';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// Types
interface RegionData {
  name: string;
  country: string;
  description: string;
  highlights: string[];
  quickFacts: {
    area?: string;
    population?: string;
    bestTime?: string;
    timeZone?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  heroImage?: string;
}

interface RecommendedSpot {
  id: string;
  name: string;
  location: string;
  category: string;
  description: string;
  highlights: string[];
  estimatedDays: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  seasonality: string;
  popularity: number;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Initialize Supabase Client  
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// 🤖 Gemini 클라이언트는 공통 유틸리티에서 가져옴 (완전한 검증 포함)

// 기존 가이드 데이터를 RegionExploreHub 형식으로 변환
function convertGuideToRegionData(guideContent: any, locationName: string): { regionData: RegionData; recommendedSpots: RecommendedSpot[] } | null {
  try {
    console.log('🔄 가이드 데이터 변환 시작:', locationName);
    console.log('📊 원본 데이터 구조 분석:', {
      hasGuideContent: !!guideContent,
      hasRealTimeGuide: !!guideContent?.realTimeGuide,
      hasChapters: !!guideContent?.realTimeGuide?.chapters,
      chaptersType: Array.isArray(guideContent?.realTimeGuide?.chapters) ? 'array' : typeof guideContent?.realTimeGuide?.chapters,
      chaptersLength: guideContent?.realTimeGuide?.chapters?.length || 0,
      firstChapterKeys: guideContent?.realTimeGuide?.chapters?.[0] ? Object.keys(guideContent.realTimeGuide.chapters[0]) : []
    });
    
    // 데이터 구조 검증 및 다양한 패턴 지원
    let chapters: any[] = [];
    let mustVisitSpots = '';
    
    if (guideContent?.realTimeGuide?.chapters) {
      chapters = guideContent.realTimeGuide.chapters;
      mustVisitSpots = guideContent.realTimeGuide.mustVisitSpots || '';
    } else if (guideContent?.chapters) {
      // 대안 구조 1: 직접 chapters
      chapters = guideContent.chapters;
      mustVisitSpots = guideContent.mustVisitSpots || '';
    } else if (Array.isArray(guideContent)) {
      // 대안 구조 2: 배열 형태
      chapters = guideContent;
    }
    
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      console.log('❌ 변환 불가: 유효한 chapters 없음');
      return null;
    }

    console.log('✅ 변환 가능한 chapters 발견:', chapters.length);
    
    // RegionData 생성 - 더 강력한 데이터 추출
    const firstChapter = chapters[0];
    const regionData: RegionData = {
      name: locationName,
      country: locationName.includes('프랑스') || locationName.includes('France') ? '프랑스' : locationName,
      description: extractDescription(firstChapter, locationName),
      highlights: extractHighlights(mustVisitSpots, chapters),
      quickFacts: {
        bestTime: extractBestTime(chapters),
        timeZone: '현지 시간대'
      },
      coordinates: extractCoordinates(firstChapter, locationName)
    };

    // RecommendedSpots 생성 - 더 스마트한 추출
    const recommendedSpots: RecommendedSpot[] = chapters.slice(0, 6).map((chapter: any, index: number) => {
      const spotName = extractSpotName(chapter, index);
      const category = extractCategory(chapter, index);
      const description = extractSpotDescription(chapter);
      
      return {
        id: `spot-${index}`,
        name: spotName,
        location: locationName,
        category,
        description,
        highlights: extractSpotHighlights(chapter),
        estimatedDays: Math.min(Math.ceil((index + 1) / 2), 3),
        difficulty: 'easy',
        seasonality: '연중',
        popularity: Math.max(10 - index, 1),
        coordinates: extractCoordinates(chapter, locationName)
      };
    });

    console.log('✅ 가이드 데이터 변환 완료:', { 
      regionName: regionData.name, 
      spots: recommendedSpots.length,
      hasCoords: !!regionData.coordinates.lat
    });
    return { regionData, recommendedSpots };
    
  } catch (error) {
    console.error('❌ 가이드 데이터 변환 오류:', error);
    console.error('🔍 에러 상세:', {
      message: error instanceof Error ? error.message : String(error),
      guideContentType: typeof guideContent,
      guideContentKeys: guideContent ? Object.keys(guideContent) : []
    });
    return null;
  }
}

// 도우미 함수들
function extractDescription(chapter: any, locationName: string): string {
  const sources = [
    chapter?.narrative,
    chapter?.description,
    chapter?.content,
    chapter?.text
  ];
  
  for (const source of sources) {
    if (typeof source === 'string' && source.length > 50) {
      return source.substring(0, 150);
    }
  }
  
  return `${locationName}의 다채로운 매력을 탐험하세요`;
}

function extractHighlights(mustVisitSpots: string, chapters: any[]): string[] {
  const highlights: string[] = [];
  
  // mustVisitSpots에서 추출
  if (mustVisitSpots) {
    const spots = mustVisitSpots.split('#').filter(spot => spot.trim()).slice(0, 3);
    highlights.push(...spots);
  }
  
  // chapters에서 추가 추출
  chapters.slice(0, 5 - highlights.length).forEach(chapter => {
    const title = chapter?.title?.split(':')[0]?.trim();
    if (title && !highlights.includes(title)) {
      highlights.push(title);
    }
  });
  
  // 기본값으로 채우기
  while (highlights.length < 5) {
    const defaults = ['아름다운 풍경', '풍부한 역사', '독특한 문화', '맛있는 음식', '친절한 사람들'];
    const missing = defaults.find(def => !highlights.includes(def));
    if (missing) highlights.push(missing);
    else break;
  }
  
  return highlights.slice(0, 5);
}

function extractBestTime(chapters: any[]): string {
  // chapters에서 시즌 정보 찾기
  const seasonKeywords = ['봄', '여름', '가을', '겨울', 'spring', 'summer', 'fall', 'winter', 'autumn'];
  
  for (const chapter of chapters) {
    const text = chapter?.narrative || chapter?.description || '';
    for (const keyword of seasonKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        return '계절별 특색 있음';
      }
    }
  }
  
  return '연중 방문 가능';
}

function extractCoordinates(chapter: any, locationName: string): { lat: number; lng: number } {
  // chapter에서 좌표 추출
  if (chapter?.coordinates?.lat && chapter?.coordinates?.lng) {
    return chapter.coordinates;
  }
  
  if (chapter?.lat && chapter?.lng) {
    return { lat: chapter.lat, lng: chapter.lng };
  }
  
  // 기본 좌표 (위치별)
  const defaultCoords = {
    '프랑스': { lat: 46.2276, lng: 2.2137 },
    'France': { lat: 46.2276, lng: 2.2137 },
    '서울': { lat: 37.5665, lng: 126.9780 },
    '부산': { lat: 35.1796, lng: 129.0756 }
  };
  
  return defaultCoords[locationName] || null; // 🔥 기본값 제거: 폴백 좌표 없음
}

function extractSpotName(chapter: any, index: number): string {
  const sources = [
    chapter?.title?.split(':')[0]?.trim(),
    chapter?.name,
    chapter?.locationName,
    `명소 ${index + 1}`
  ];
  
  return sources.find(name => name && typeof name === 'string') || `명소 ${index + 1}`;
}

function extractCategory(chapter: any, index: number): string {
  const text = (chapter?.narrative || chapter?.description || '').toLowerCase();
  
  if (text.includes('음식') || text.includes('맛') || text.includes('레스토랑')) return 'food';
  if (text.includes('자연') || text.includes('공원') || text.includes('산')) return 'nature';
  if (text.includes('문화') || text.includes('박물관') || text.includes('역사')) return 'culture';
  if (text.includes('쇼핑') || text.includes('시장')) return 'shopping';
  
  return index % 2 === 0 ? 'city' : 'culture';
}

function extractSpotDescription(chapter: any): string {
  const sources = [
    chapter?.narrative,
    chapter?.description,
    chapter?.content
  ];
  
  for (const source of sources) {
    if (typeof source === 'string' && source.length > 30) {
      return source.substring(0, 200);
    }
  }
  
  return '특별한 경험이 기다리는 곳입니다';
}

function extractSpotHighlights(chapter: any): string[] {
  const text = chapter?.narrative || chapter?.description || '';
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10).slice(0, 3);
  
  if (sentences.length > 0) {
    return sentences.map(s => s.trim().substring(0, 100));
  }
  
  return ['특색 있는 장소', '방문 가치 있음'];
}

// 지역 탐색 허브 전문가 페르소나
const REGION_EXPLORE_PERSONA = `당신은 지역 탐색 및 여행 기획 전문가입니다.

전문 분야:
- 지역별 문화적 특성 및 역사적 배경 분석
- 사용자 호기심 유발을 위한 스토리텔링
- 계층적 여행지 추천 (쉬운 접근 → 깊은 탐험)
- 실용적 여행 정보 (최적 방문 시기, 소요 시간 등)

핵심 원칙:
1. 호기심 자극: "알려진 것 vs 숨겨진 것" 대비로 흥미 유발
2. 단계적 공개: 기본 정보 → 심화 정보 → 특별한 경험
3. 개인화 추천: 다양한 관심사와 여행 스타일 고려
4. 실행 가능성: 실제 방문 계획을 세울 수 있는 구체적 정보 제공
5. 감정적 연결: 각 장소만의 독특한 매력과 스토리 강조`;

// 지역 개요 생성 프롬프트
function createRegionOverviewPrompt(locationName: string, language: string): string {
  const prompts = {
    ko: `${REGION_EXPLORE_PERSONA}

"${locationName}"에 대한 매력적인 지역 탐색 허브 정보를 생성해주세요.

요청사항:
1. 지역 기본 정보 (설명, 특징, 통계)
2. 사용자 호기심을 자극하는 스토리텔링
3. 실용적인 방문 정보

JSON 형식으로 응답하세요:
{
  "regionData": {
    "name": "${locationName}",
    "country": "소속 국가",
    "description": "호기심을 자극하는 2-3줄 소개 (150자 내외)",
    "highlights": ["특징1", "특징2", "특징3", "특징4", "특징5"],
    "quickFacts": {
      "area": "면적 정보 (옵션)",
      "population": "인구 정보 (옵션)", 
      "bestTime": "최적 방문 시기",
      "timeZone": "시간대 (옵션)"
    },
    "coordinates": {
      "lat": 위도,
      "lng": 경도
    }
  }
}

주의사항:
- description은 호기심과 감정적 연결을 유발하는 내용으로
- highlights는 구체적이고 흥미로운 특징들로
- 정확한 지리적 좌표 제공`,

    en: `${REGION_EXPLORE_PERSONA}

Generate attractive regional exploration hub information for "${locationName}".

Requirements:
1. Basic regional information (description, features, statistics)
2. Storytelling that sparks user curiosity
3. Practical visiting information

Respond in JSON format:
{
  "regionData": {
    "name": "${locationName}",
    "country": "country",
    "description": "curiosity-sparking 2-3 line introduction (around 150 characters)",
    "highlights": ["feature1", "feature2", "feature3", "feature4", "feature5"],
    "quickFacts": {
      "area": "area information (optional)",
      "population": "population info (optional)",
      "bestTime": "best time to visit",
      "timeZone": "time zone (optional)"
    },
    "coordinates": {
      "lat": latitude,
      "lng": longitude
    }
  }
}

Notes:
- Description should evoke curiosity and emotional connection
- Highlights should be specific and interesting features
- Provide accurate geographical coordinates`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

// 추천 장소 생성 프롬프트
function createRecommendedSpotsPrompt(locationName: string, language: string): string {
  const prompts = {
    ko: `${REGION_EXPLORE_PERSONA}

"${locationName}" 지역의 매력적인 여행지 6개를 추천해주세요.

🚨 CRITICAL: name 필드는 반드시 구체적인 고유 장소명 사용
- ❌ 금지: "박물관", "시장", "공원", "성당", "타워" 등 일반적인 용어
- ✅ 필수: "전주한옥마을", "남대문시장", "경복궁", "명동성당", "N서울타워" 등 실제 고유명사
- ✅ 필수: 방문자가 구글 지도에서 검색할 수 있는 정확한 장소명
- ✅ 필수: "${locationName}" 지역에 실제로 존재하는 유명한 특정 장소들

🚨 CRITICAL: location 필드는 동일명 지역 혼동 방지를 위해 명확히 특정
- ❌ 금지: "뉴욕", "파리", "런던" 등 동일명이 여러 국가에 존재하는 모호한 표기
- ✅ 필수: "미국 뉴욕주", "프랑스 일드프랑스 파리", "영국 런던" 등 국가+주/지역 포함
- ✅ 필수: "${locationName}"이 국가인 경우 반드시 "국가명 주/도명" 형태로 작성
- ✅ 예시: 미국 → "미국 캘리포니아주", "미국 뉴욕주", 일본 → "일본 도쿄도", "일본 오사카부"

추천 기준:
1. 다양한 카테고리 (도시, 자연, 문화, 음식, 쇼핑 등)
2. 접근성과 난이도의 균형
3. 각기 다른 매력과 특징
4. 실제 방문 가능한 장소

JSON 배열로만 응답하세요:
[
  {
    "id": "unique-id-1",
    "name": "구체적인 고유 장소명 (예: 전주한옥마을, 남대문시장)",
    "location": "${locationName} [구체적 주/도/지역명] (예: 미국 캘리포니아주, 일본 도쿄도, 프랑스 일드프랑스)",
    "category": "city|nature|culture|food|shopping",
    "description": "매력적인 한 줄 소개 (80자 내외)",
    "highlights": ["특징1", "특징2", "특징3"],
    "estimatedDays": 추천일수(1-7),
    "difficulty": "easy|moderate|challenging",
    "seasonality": "방문 시기 (예: 연중, 봄-가을 등)",
    "popularity": 인기도점수(1-10),
    "coordinates": {
      "lat": 위도,
      "lng": 경도
    }
  }
]

주의사항:
- name은 절대로 일반명사가 아닌 구체적 고유명사여야 함
- 각 장소는 서로 다른 매력을 가져야 함
- description은 클릭하고 싶게 만드는 내용으로
- 실제 존재하는 좌표 제공`,

    en: `${REGION_EXPLORE_PERSONA}

Recommend 6 attractive travel destinations in "${locationName}" region.

🚨 CRITICAL: name field must use specific proper place names
- ❌ Forbidden: "museum", "market", "park", "cathedral", "tower" etc. generic terms
- ✅ Required: "Central Park", "Times Square", "Metropolitan Museum of Art", "Brooklyn Bridge" etc. actual proper nouns
- ✅ Required: Exact place names that visitors can search on Google Maps
- ✅ Required: Famous specific places that actually exist in "${locationName}" region

🚨 CRITICAL: location field must prevent confusion between same-named places
- ❌ Forbidden: "New York", "Paris", "London" etc. ambiguous names that exist in multiple countries
- ✅ Required: "USA New York State", "France Île-de-France Paris", "UK London" etc. with country+state/region
- ✅ Required: If "${locationName}" is a country, must use "Country State/Province" format
- ✅ Examples: USA → "USA California", "USA New York State", Japan → "Japan Tokyo", "Japan Osaka"

Recommendation criteria:
1. Various categories (city, nature, culture, food, shopping, etc.)
2. Balance of accessibility and difficulty
3. Each with unique charm and characteristics
4. Actually visitable places

Respond only as JSON array:
[
  {
    "id": "unique-id-1", 
    "name": "specific proper place name (e.g. Central Park, Brooklyn Bridge)",
    "location": "${locationName} [specific state/province/region] (e.g. USA California, Japan Tokyo, France Île-de-France)",
    "category": "city|nature|culture|food|shopping",
    "description": "attractive one-line introduction (around 80 characters)",
    "highlights": ["feature1", "feature2", "feature3"],
    "estimatedDays": recommended_days(1-7),
    "difficulty": "easy|moderate|challenging", 
    "seasonality": "visit timing (e.g. year-round, spring-fall etc)",
    "popularity": popularity_score(1-10),
    "coordinates": {
      "lat": latitude,
      "lng": longitude
    }
  }
]

Notes:
- name must be specific proper nouns, never generic terms
- Each place should have different unique attractions
- Description should make users want to click
- Provide actual existing coordinates`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

// JSON 응답 파싱 (개선된 버전)
function parseAIResponse<T>(text: string): T | null {
  try {
    console.log('🔍 JSON 파싱 시작, 원본 길이:', text.length);
    
    // JSON 추출 패턴 (더 포괄적)
    const patterns = [
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/s,
      /```(?:json)?\s*(\[[\s\S]*?\])\s*```/s,
      /(\{[\s\S]*\})/s,
      /(\[[\s\S]*\])/s,
      // 추가 패턴
      /\{[^}]*"regionData"[^}]*\{[\s\S]*?\}[\s\S]*?\}/s,
      /\[[\s\S]*?\{[\s\S]*?"id"[\s\S]*?\}[\s\S]*?\]/s
    ];

    let jsonString = text.trim();
    let patternUsed = 'none';
    
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = text.match(pattern);
      if (match) {
        jsonString = match[1] ? match[1].trim() : match[0].trim();
        patternUsed = `pattern-${i}`;
        console.log('✅ JSON 패턴 매치:', patternUsed);
        break;
      }
    }

    // 추가 정리: 불완전한 JSON 수정 시도
    jsonString = jsonString
      .replace(/```/g, '') // 마크다운 제거
      .replace(/,\s*([}\]])/g, '$1') // trailing comma 제거
      .trim();

    console.log('🧹 정리된 JSON (첫 200자):', jsonString.substring(0, 200));

    const result = JSON.parse(jsonString) as T;
    console.log('✅ JSON 파싱 성공:', patternUsed);
    return result;
    
  } catch (error) {
    console.error('❌ JSON 파싱 실패:', error);
    console.error('📝 원본 텍스트 (첫 500자):', text.substring(0, 500));
    
    // 마지막 시도: 단순 텍스트에서 JSON 객체 찾기
    try {
      const simpleMatch = text.match(/\{[\s\S]*\}/);
      if (simpleMatch) {
        const simpleJson = simpleMatch[0];
        console.log('🔄 단순 매치 시도:', simpleJson.substring(0, 100));
        return JSON.parse(simpleJson) as T;
      }
    } catch (e) {
      console.error('❌ 단순 매치도 실패');
    }
    
    return null;
  }
}

// 입력 검증 및 정제
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>\"']/g, '')
    .replace(/[^\w\s가-힣\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-.,!?]/gi, '')
    .trim()
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const { locationName, language = 'ko', routingResult } = await request.json();

    if (!locationName) {
      return NextResponse.json({
        success: false,
        error: '위치명이 필요합니다'
      }, { status: 400 });
    }

    const sanitizedLocation = sanitizeInput(locationName);
    const lang = ['ko', 'en', 'ja', 'zh', 'es'].includes(language) ? language : 'ko';

    console.log('🏞️ 지역 탐색 허브 생성 시작:', { 
      location: sanitizedLocation, 
      language: lang,
      routing: routingResult?.processingMethod 
    });

    // 1단계: DB에서 기존 가이드 데이터 확인
    console.log('🔍 DB에서 기존 가이드 데이터 확인 중...');
    console.log('📋 검색 조건:', { location: sanitizedLocation, language: lang });
    
    try {
      const supabase = getSupabaseClient();
      
      // 다양한 형태로 검색 시도
      const searchVariants = [
        sanitizedLocation,
        sanitizedLocation.toLowerCase(),
        sanitizedLocation.toUpperCase(),
        // 프랑스 => France 등의 번역 처리
        sanitizedLocation === '프랑스' ? 'France' : sanitizedLocation,
        sanitizedLocation === 'France' ? '프랑스' : sanitizedLocation
      ];
      
      console.log('🔍 검색 변형들:', searchVariants);
      
      let existingGuide: { content: any; location?: any } | null = null;
      let matchedLocation = '';
      
      for (const variant of searchVariants) {
        const { data, error } = await supabase
          .from('guides')
          .select('content, location')
          .eq('location', variant)
          .eq('language', lang)
          .single();
          
        if (data?.content && !error) {
          existingGuide = data;
          matchedLocation = variant;
          console.log('✅ 매치된 위치:', matchedLocation);
          break;
        }
      }

      if (existingGuide?.content) {
        console.log('✅ 기존 가이드 데이터 발견, 변환 시도...');
        console.log('📊 가이드 데이터 구조:', {
          hasRealTimeGuide: !!existingGuide.content.realTimeGuide,
          hasChapters: !!existingGuide.content.realTimeGuide?.chapters,
          chaptersLength: existingGuide.content.realTimeGuide?.chapters?.length || 0
        });
        
        const convertedData = convertGuideToRegionData(existingGuide.content, sanitizedLocation);
        
        if (convertedData) {
          console.log('🎯 기존 데이터 변환 성공, 즉시 반환');
          return NextResponse.json({
            success: true,
            regionData: convertedData.regionData,
            recommendedSpots: convertedData.recommendedSpots,
            cached: true,
            source: 'converted_guide_data',
            matchedLocation
          });
        } else {
          console.log('⚠️ 기존 데이터 변환 실패, AI 생성 진행');
        }
      } else {
        console.log('📭 기존 가이드 데이터 없음, AI 생성 진행');
        
        // DB에 있는 모든 location 목록 확인 (디버깅용)
        const { data: allLocations } = await supabase
          .from('guides')
          .select('location, language')
          .limit(10);
        console.log('📍 DB에 있는 위치들 (샘플):', allLocations);
      }
    } catch (dbError) {
      console.error('❌ DB 확인 중 오류:', dbError);
      console.log('🔄 DB 오류 무시하고 AI 생성 진행');
    }

    // 위치 정보 확인 (좌표 등 기본 정보)
    const locationData = classifyLocation(sanitizedLocation);
    console.log('📍 위치 분류 결과:', locationData);

    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500,
        topP: 0.9,
        topK: 20
      }
    });

    // 1단계: 지역 개요 생성
    console.log('🎯 지역 개요 생성 중...');
    const overviewPrompt = createRegionOverviewPrompt(sanitizedLocation, lang);
    const overviewResult = await model.generateContent(overviewPrompt);
    const overviewText = await overviewResult.response.text();
    
    console.log('🧠 지역 개요 AI 응답:', overviewText);
    
    const overviewData = parseAIResponse<{ regionData: RegionData }>(overviewText);
    
    if (!overviewData?.regionData) {
      console.error('❌ 지역 개요 파싱 실패');
      console.error('📝 AI 응답 원문:', overviewText);
      
      // 폴백: 기본 지역 데이터 생성
      const fallbackData = {
        regionData: {
          name: sanitizedLocation,
          country: "정보 불명",
          description: `${sanitizedLocation}에 대한 정보를 준비 중입니다. 잠시 후 다시 시도해주세요.`,
          highlights: ["아름다운 풍경", "풍부한 역사", "독특한 문화", "맛있는 음식", "친절한 사람들"],
          quickFacts: {
            bestTime: "연중"
          },
          coordinates: null // 🔥 기본 좌표 제거: 좌표 없음
        }
      };
      
      console.log('🔄 폴백 데이터 사용:', fallbackData);
      return NextResponse.json({
        success: true,
        regionData: fallbackData.regionData,
        recommendedSpots: [],
        generated: false,
        fallback: true,
        generatedAt: new Date().toISOString(),
        warning: 'AI 응답 파싱에 실패하여 기본 정보를 제공합니다.'
      });
    }

    // 2단계: 추천 장소 생성
    console.log('🗺️ 추천 장소 생성 중...');
    const spotsPrompt = createRecommendedSpotsPrompt(sanitizedLocation, lang);
    const spotsResult = await model.generateContent(spotsPrompt);
    const spotsText = await spotsResult.response.text();
    
    console.log('🎯 추천 장소 AI 응답:', spotsText);
    
    const spotsData = parseAIResponse<RecommendedSpot[]>(spotsText);
    
    if (!Array.isArray(spotsData)) {
      console.warn('⚠️ 추천 장소 파싱 실패, 빈 배열 사용');
    }

    // 좌표 보정 (분류된 위치 정보 활용)
    let finalRegionData = overviewData.regionData;
    if (locationData?.coordinates) {
      finalRegionData.coordinates = locationData.coordinates;
      console.log('📍 좌표 보정 완료:', locationData.coordinates);
    }

    const response = {
      success: true,
      regionData: finalRegionData,
      recommendedSpots: Array.isArray(spotsData) ? spotsData.slice(0, 6) : [],
      generated: true,
      generatedAt: new Date().toISOString(),
      processingMethod: routingResult?.processingMethod,
      debug: process.env.NODE_ENV === 'development' ? {
        locationData,
        overviewText: overviewText.length > 500 ? overviewText.substring(0, 500) + '...' : overviewText,
        spotsText: spotsText.length > 500 ? spotsText.substring(0, 500) + '...' : spotsText
      } : undefined
    };

    console.log('✅ 지역 탐색 허브 생성 완료:', {
      regionName: finalRegionData.name,
      spotsCount: Array.isArray(spotsData) ? spotsData.length : 0,
      hasCoordinates: !!finalRegionData.coordinates
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 지역 탐색 허브 생성 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '지역 정보 생성 중 오류가 발생했습니다',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    }, { status: 500 });
  }
}