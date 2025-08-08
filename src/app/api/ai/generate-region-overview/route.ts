import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyLocation } from '@/lib/location/location-classification';

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

// Initialize Gemini AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
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

추천 기준:
1. 다양한 카테고리 (도시, 자연, 문화, 음식, 쇼핑 등)
2. 접근성과 난이도의 균형
3. 각기 다른 매력과 특징
4. 실제 방문 가능한 장소

JSON 배열로만 응답하세요:
[
  {
    "id": "unique-id-1",
    "name": "장소명",
    "location": "상세 위치 (${locationName} 내)",
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
- 각 장소는 서로 다른 매력을 가져야 함
- description은 클릭하고 싶게 만드는 내용으로
- 실제 존재하는 좌표 제공`,

    en: `${REGION_EXPLORE_PERSONA}

Recommend 6 attractive travel destinations in "${locationName}" region.

Recommendation criteria:
1. Various categories (city, nature, culture, food, shopping, etc.)
2. Balance of accessibility and difficulty
3. Each with unique charm and characteristics
4. Actually visitable places

Respond only as JSON array:
[
  {
    "id": "unique-id-1", 
    "name": "place name",
    "location": "detailed location (within ${locationName})",
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
- Each place should have different unique attractions
- Description should make users want to click
- Provide actual existing coordinates`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

// JSON 응답 파싱
function parseAIResponse<T>(text: string): T | null {
  try {
    // JSON 추출 패턴
    const patterns = [
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/s,
      /```(?:json)?\s*(\[[\s\S]*?\])\s*```/s,
      /(\{[\s\S]*\})/s,
      /(\[[\s\S]*\])/s
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
    console.error('원본 텍스트:', text);
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
      throw new Error('지역 개요 생성에 실패했습니다');
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