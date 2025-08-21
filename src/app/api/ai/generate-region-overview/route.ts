import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { classifyLocation } from '@/lib/location/location-classification';
import { createClient } from '@supabase/supabase-js';
import { generateCoordinatesForGuideCommon, StandardLocationInfo } from '@/lib/coordinates/coordinate-common';
import { createQuickPrompt } from '@/lib/ai/prompt-utils';
import { getAutocompleteData } from '@/lib/cache/autocompleteStorage';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// Types
interface RegionData {
  name: string;
  country: string;
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
  country: string;
  category?: string;
  description?: string;
  highlights?: string[];
  estimatedDays?: number;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  seasonality?: string;
  popularity?: number;
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
      highlights: extractHighlights(mustVisitSpots, chapters),
      quickFacts: {
        bestTime: extractBestTime(chapters),
        timeZone: '현지 시간대'
      },
      coordinates: extractCoordinates(firstChapter, locationName)
    };

    // RecommendedSpots 생성 - 더 스마트한 추출 (10개 이상 제공)
    const recommendedSpots: RecommendedSpot[] = chapters.slice(0, 12).map((chapter: any, index: number) => {
      const spotName = extractSpotName(chapter, index);
      const category = extractCategory(chapter, index);
      const description = extractSpotDescription(chapter);
      
      return {
        id: `spot-${index}`,
        name: spotName,
        location: locationName,
        country: locationName, // country 필드 추가
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

// 🌍 지역/국가 탐색 전문 페르소나 - 국가 단위 정보 제공
const REGION_EXPLORE_PERSONA = `당신은 지역/국가 탐색 및 문화 해설 전문가입니다.

🎯 국가/지역 단위 검색 시 핵심 원칙:
- 국가 전체의 문화, 역사, 지리적 특징 설명 (특정 관광지 X)
- 국가를 대표하는 여러 지역들과 도시들 소개
- 국가의 전반적인 매력과 다양성 강조
- 여행자가 국가 내에서 선택할 수 있는 다양한 옵션 제시

전문 분야:
- 국가별 문화적 정체성 및 역사적 배경 분석
- 지역 간 차이점과 각 지역의 특색 설명
- 국가 전체를 아우르는 종합적 여행 가이드
- 계절별, 테마별 국가 탐험 방법 제안

🚨 중요: 국가명 검색 시 특정 관광지가 아닌 국가 전체 소개에 집중하세요.`;

// 🌍 국가/지역 개요 생성 프롬프트 - 기존 가이드 JSON 구조와 호환
function createRegionOverviewPrompt(locationName: string, language: string): string {
  const prompts = {
    ko: `"${locationName}"에 대한 정확하고 실용적인 여행 정보를 JSON으로 생성하세요.

🎯 품질 요구사항:
- 실제 존재하는 정확한 지명과 특징만 사용
- 구체적이고 검증 가능한 정보 제공
- 여행자에게 실질적으로 도움이 되는 내용
- 모호하거나 일반적인 표현 지양

🔍 highlights 작성 지침:
- 해당 지역의 독특하고 실제적인 특징 5개
- "다양한", "풍부한" 등 모호한 표현 대신 구체적 내용
- 실제 경험할 수 있는 것들로 구성

📋 JSON 응답 형식 (정확히 이 구조로):
- 코드블록이나 추가 설명 없이 순수 JSON만
- 모든 필드 필수 입력

{
  "regionData": {
    "name": "${locationName}",
    "country": "정확한 국가명",
    "highlights": ["구체적 특징1", "구체적 특징2", "구체적 특징3", "구체적 특징4", "구체적 특징5"],
    "quickFacts": {
      "bestTime": "구체적인 최적 방문 시기 (계절, 월 포함)",
      "timeZone": "정확한 시간대"
    }
  }
}`,

    en: `Generate practical travel information about "${locationName}" as JSON. Focus on specific, useful details that travelers should know rather than generic descriptions.

{
  "regionData": {
    "name": "${locationName}",
    "country": "country name",
    "highlights": ["feature1", "feature2", "feature3", "feature4", "feature5"],
    "quickFacts": {
      "bestTime": "best time to visit",
      "timeZone": "time zone"
    },
    "coordinates": {
      "lat": latitude,
      "lng": longitude
    }
  }
}`,

    ja: `"${locationName}"の実用的な旅行情報をJSONで生成してください。一般的な説明ではなく、旅行者が実際に知っていると役立つ具体的な情報を提供してください。

{
  "regionData": {
    "name": "${locationName}",
    "country": "国名",
    "highlights": ["特徴1", "特徴2", "特徴3", "特徴4", "特徴5"],
    "quickFacts": {
      "bestTime": "最適な訪問時期",
      "timeZone": "時間帯"
    },
    "coordinates": {
      "lat": 緯度,
      "lng": 経度
    }
  }
}`,

    zh: `生成"${locationName}"的实用旅行信息JSON。请提供具体实用的信息，而非一般性描述，帮助旅行者实际了解有用信息。

{
  "regionData": {
    "name": "${locationName}",
    "country": "国家名",
    "highlights": ["特色1", "特色2", "特色3", "特色4", "特色5"],
    "quickFacts": {
      "bestTime": "最佳访问时间",
      "timeZone": "时区"
    },
    "coordinates": {
      "lat": 纬度,
      "lng": 经度
    }
  }
}`,

    es: `Genera información práctica de viaje sobre "${locationName}" como JSON. Enfócate en detalles específicos y útiles que los viajeros deberían saber, en lugar de descripciones genéricas.

{
  "regionData": {
    "name": "${locationName}",
    "country": "nombre del país",
    "highlights": ["característica1", "característica2", "característica3", "característica4", "característica5"],
    "quickFacts": {
      "bestTime": "mejor época para visitar",
      "timeZone": "zona horaria"
    },
    "coordinates": {
      "lat": latitud,
      "lng": longitud
    }
  }
}`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

// 전세계 범용 추천 장소 생성 프롬프트 (위치 레벨에 따라 다른 추천)
function createRecommendedSpotsPrompt(locationName: string, language: string, isCountry: boolean = false): string {
  const prompts = {
    ko: isCountry ? 
      `🎯 ${locationName}의 실제 인기 도시 8개를 정확히 인기순으로 정렬하여 JSON 배열로만 응답하세요.

품질 요구사항:
- 실제 존재하는 정확한 도시명만 사용 (영문명/현지명 정확히)
- 관광객 방문 통계 기준 인기순 정렬
- 가상이나 부정확한 도시명 절대 금지

[{"name":"실제도시명1"},{"name":"실제도시명2"},{"name":"실제도시명3"},{"name":"실제도시명4"},{"name":"실제도시명5"},{"name":"실제도시명6"},{"name":"실제도시명7"},{"name":"실제도시명8"}]` : 
      `🎯 ${locationName}의 실제 인기 관광명소 8개를 정확히 인기순으로 정렬하여 JSON 배열로만 응답하세요.

품질 요구사항:
- 실제 존재하는 정확한 명소명만 사용 (현지명/공식명)
- 방문객 수 기준 실제 인기순 정렬
- 박물관, 랜드마크, 역사적 장소 등 실제 관광지만
- 가상이나 부정확한 명소명 절대 금지

📋 JSON 응답 형식 (정확히):
- 순수 JSON 배열만, 코드블록이나 설명 없이
- 정확히 8개 항목
- 각 name은 실제 명소의 정확한 이름

[{"name":"실제명소명1"},{"name":"실제명소명2"},{"name":"실제명소명3"},{"name":"실제명소명4"},{"name":"실제명소명5"},{"name":"실제명소명6"},{"name":"실제명소명7"},{"name":"실제명소명8"}]`,

    en: isCountry ?
      `${locationName} top 8 cities by popularity. JSON array only with real city names.
[{"name":"city1"},{"name":"city2"},{"name":"city3"},{"name":"city4"},{"name":"city5"},{"name":"city6"},{"name":"city7"},{"name":"city8"}]` :
      `${locationName} top 8 attractions by popularity. JSON array only with real attraction names.
[{"name":"attraction1"},{"name":"attraction2"},{"name":"attraction3"},{"name":"attraction4"},{"name":"attraction5"},{"name":"attraction6"},{"name":"attraction7"},{"name":"attraction8"}]`,

    ja: isCountry ?
      `${locationName} 人気都市8個を人気順でJSON配列のみ。実際の都市名を使用。
[{"name":"都市名1"},{"name":"都市名2"},{"name":"都市名3"},{"name":"都市名4"},{"name":"都市名5"},{"name":"都市名6"},{"name":"都市名7"},{"name":"都市名8"}]` :
      `${locationName} 人気観光地8個を人気順でJSON配列のみ。実際の名所名を使用。
[{"name":"観光地名1"},{"name":"観光地名2"},{"name":"観光地名3"},{"name":"観光地名4"},{"name":"観光地名5"},{"name":"観光地名6"},{"name":"観光地名7"},{"name":"観光地名8"}]`,

    zh: isCountry ?
      `${locationName} 热门城市8个按人气排序JSON数组。使用真实城市名。
[{"name":"城市名1"},{"name":"城市名2"},{"name":"城市名3"},{"name":"城市名4"},{"name":"城市名5"},{"name":"城市名6"},{"name":"城市名7"},{"name":"城市名8"}]` :
      `${locationName} 热门景点8个按人气排序JSON数组。使用真实景点名。
[{"name":"景点名1"},{"name":"景点名2"},{"name":"景点名3"},{"name":"景点名4"},{"name":"景点名5"},{"name":"景点名6"},{"name":"景点名7"},{"name":"景点名8"}]`,

    es: isCountry ?
      `${locationName} 8 ciudades populares por popularidad JSON array. Usar nombres reales.
[{"name":"ciudad1"},{"name":"ciudad2"},{"name":"ciudad3"},{"name":"ciudad4"},{"name":"ciudad5"},{"name":"ciudad6"},{"name":"ciudad7"},{"name":"ciudad8"}]` :
      `${locationName} 8 atracciones populares por popularidad JSON array. Usar nombres reales.
[{"name":"atracción1"},{"name":"atracción2"},{"name":"atracción3"},{"name":"atracción4"},{"name":"atracción5"},{"name":"atracción6"},{"name":"atracción7"},{"name":"atracción8"}]`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

// JSON 응답 파싱 (개선된 버전) - 불완전한 JSON 자동 복구 기능 추가
function parseAIResponse<T>(text: string): T | null {
  try {
    console.log('🔍 JSON 파싱 시작, 원본 길이:', text.length);
    
    // 1단계: ```json 코드블록 찾기
    let jsonString = text.trim();
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
      console.log('✅ 코드블록에서 추출');
    }
    
    // 2단계: JSON 시작/끝 찾기 - 개선된 로직 (배열 우선)
    const arrayStart = jsonString.indexOf('[');
    const objectStart = jsonString.indexOf('{');
    const startIdx = arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart) ? arrayStart : objectStart;
    
    if (startIdx !== -1) {
      // 배열인지 객체인지 확인
      if (jsonString[startIdx] === '[') {
        // 배열인 경우: 마지막 ]를 찾되, 없으면 자동 추가
        let endIdx = jsonString.lastIndexOf(']');
        if (endIdx === -1 || endIdx < startIdx) {
          console.log('🔧 배열 종료 ] 없음, 자동 추가');
          jsonString = jsonString.substring(startIdx) + ']';
        } else {
          jsonString = jsonString.substring(startIdx, endIdx + 1);
        }
      } else {
        // 객체인 경우: 마지막 }를 찾되, 없으면 자동 추가
        let endIdx = jsonString.lastIndexOf('}');
        if (endIdx === -1 || endIdx < startIdx) {
          console.log('🔧 객체 종료 } 없음, 자동 추가');
          jsonString = jsonString.substring(startIdx) + '}';
        } else {
          jsonString = jsonString.substring(startIdx, endIdx + 1);
        }
      }
      console.log('✅ JSON 경계 자동 감지 및 복구');
    }
    
    // 3단계: 불완전한 JSON 복구 시도 (완전한 JSON인 경우 스킵)
    if (!jsonString.endsWith('}') && !jsonString.endsWith(']')) {
      console.log('🔧 불완전한 JSON 감지, 복구 시도...');
      
      // 배열인 경우
      if (jsonString.startsWith('[')) {
        // 마지막 완전한 객체 찾기 - 개선된 알고리즘
        const objects: string[] = [];
        let depth = 0;
        let currentObj = '';
        let inString = false;
        let escapeNext = false;
        
        for (let i = 1; i < jsonString.length; i++) {
          const char = jsonString[i];
          
          if (escapeNext) {
            escapeNext = false;
            currentObj += char;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            currentObj += char;
            continue;
          }
          
          if (char === '"' && !escapeNext) inString = !inString;
          
          if (!inString) {
            if (char === '{') depth++;
            if (char === '}') depth--;
            
            if (depth === 0 && char === '}') {
              objects.push('{' + currentObj);
              console.log(`✅ 객체 ${objects.length} 복구: ${objects[objects.length-1].substring(0, 50)}...`);
              currentObj = '';
              
              // 다음 객체 시작까지 스킵 (쉼표와 공백 포함)
              while (i + 1 < jsonString.length && !['{'].includes(jsonString[i + 1])) {
                i++;
                if (jsonString[i] === '{') {
                  i--; // 다음 루프에서 '{'를 처리하도록
                  break;
                }
              }
            } else {
              currentObj += char;
            }
          } else {
            currentObj += char;
          }
        }
        
        if (objects.length > 0) {
          jsonString = '[' + objects.join(',') + ']';
          console.log('✅ 불완전한 배열 복구 완료:', objects.length, '개 객체');
        }
      }
      
      // 객체인 경우
      else if (jsonString.startsWith('{')) {
        const lastCompleteField = jsonString.lastIndexOf(',');
        if (lastCompleteField !== -1) {
          jsonString = jsonString.substring(0, lastCompleteField) + '}';
          console.log('✅ 불완전한 객체 복구');
        }
      }
    }
    
    // 4단계: 파싱 시도
    jsonString = jsonString
      .replace(/,\s*([}\]])/g, '$1') // trailing comma 제거
      .trim();

    console.log('🧹 정리된 JSON (첫 200자):', jsonString.substring(0, 200));

    const result = JSON.parse(jsonString) as T;
    console.log('✅ JSON 파싱 성공');
    return result;
    
  } catch (error) {
    console.error('❌ JSON 파싱 실패:', error);
    console.error('📝 원본 텍스트 (첫 500자):', text.substring(0, 500));
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
    const { locationName, language = 'ko', routingResult, regionalContext, sessionLocationInfo } = await request.json();

    if (!locationName) {
      return NextResponse.json({
        success: false,
        error: '위치명이 필요합니다'
      }, { status: 400 });
    }

    const sanitizedLocation = sanitizeInput(locationName);
    const lang = ['ko', 'en', 'ja', 'zh', 'es'].includes(language) ? language : 'ko';
    
    // 📍 세션 위치 정보 변수 (좌표 생성과 DB 저장에서 공통 사용)
    let cachedLocationInfo: any = sessionLocationInfo;

    console.log('🏞️ 지역 탐색 허브 생성 시작:', { 
      location: sanitizedLocation, 
      language: lang,
      routing: routingResult?.processingMethod,
      hasSessionData: !!sessionLocationInfo,
      hasRegionalContext: !!regionalContext
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
        console.log('✅ 기존 가이드 데이터 발견 - DB 데이터 우선 사용 정책');
        console.log('📊 기존 데이터 구조:', {
          hasRealTimeGuide: !!existingGuide.content.realTimeGuide,
          hasChapters: !!existingGuide.content.realTimeGuide?.chapters,
          chaptersLength: existingGuide.content.realTimeGuide?.chapters?.length || 0
        });
        
        // 🔄 DB 데이터 우선 정책: 기존 데이터가 있으면 그것을 그대로 반환
        console.log('📦 기존 DB 데이터 그대로 반환, 새로운 AI 생성 스킵');
        
        // 기존 데이터를 RegionExploreHub 호환 형식으로 바로 반환
        const existingContent = existingGuide.content;
        
        // overview 데이터 추출
        let highlights: string[] = [];
        if (existingContent?.exploreHub?.highlights && Array.isArray(existingContent.exploreHub.highlights)) {
          highlights = existingContent.exploreHub.highlights;
        } else if (existingContent?.overview?.highlights && Array.isArray(existingContent.overview.highlights)) {
          highlights = existingContent.overview.highlights;
        } else if (existingContent?.realTimeGuide?.mustVisitSpots) {
          highlights = existingContent.realTimeGuide.mustVisitSpots.split('#').filter((s: string) => s.trim()).slice(0, 5);
        }
        
        // route.steps 데이터 추출
        let steps: any[] = [];
        if (existingContent?.route?.steps && Array.isArray(existingContent.route.steps)) {
          steps = existingContent.route.steps;
        } else if (existingContent?.realTimeGuide?.chapters && Array.isArray(existingContent.realTimeGuide.chapters)) {
          steps = existingContent.realTimeGuide.chapters.slice(0, 8).map((chapter: any, index: number) => ({
            location: chapter.title?.split(':')[0]?.trim() || `장소 ${index + 1}`,
            title: chapter.title || `장소 ${index + 1}`,
            description: chapter.narrative?.substring(0, 100) || '',
            estimatedTime: "2-3시간",
            category: 'attraction',
            highlights: [],
            popularity: 90 - (index * 2)
          }));
        }
        
        return NextResponse.json({
          success: true,
          content: {
            overview: {
              keyFacts: [
                { title: "지역명", description: sanitizedLocation },
                { title: "최적 방문 시기", description: "연중" }
              ],
              highlights: highlights
            },
            route: { steps: steps }
          },
          coordinates: null, // 기존 coordinates 사용
          generated: false, // 기존 데이터 사용
          dbSaved: true,
          generatedAt: new Date().toISOString(),
          processingMethod: 'existing-data-reuse',
          spotsCount: steps.length
        });
      } else {
        console.log('📭 기존 가이드 데이터 없음, 새로운 AI 생성 진행');
        
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
        maxOutputTokens: 64000, // AI 응답이 잘리지 않도록 대폭 증가
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
      console.error('📝 AI 응답 원문:', overviewText.substring(0, 500));
      
      return NextResponse.json({
        success: false,
        error: 'AI가 지역 정보를 올바른 형식으로 생성하지 못했습니다.',
        details: {
          stage: 'region_overview_parsing',
          aiResponse: overviewText.substring(0, 200),
          location: sanitizedLocation,
          language: lang,
          expectedFormat: 'regionData object with name, country, description, highlights, quickFacts, coordinates'
        }
      }, { status: 500 });
    }

    // 2단계: 위치 레벨 판단 및 추천 여행지 생성
    console.log('🏞️ 추천 여행지 8개 생성 중...');
    
    // 국가인지 지역/도시인지 판단
    const locationClassification = classifyLocation(sanitizedLocation);
    const isCountryLevel = Boolean(locationClassification && locationClassification.level <= 1); // Level 0-1은 국가
    
    console.log(`🎯 위치 분류: ${sanitizedLocation} → Level ${locationClassification?.level} → ${isCountryLevel ? '국가 (도시 추천)' : '지역/도시 (관광지 추천)'}`);
    
    const spotsPrompt = createRecommendedSpotsPrompt(sanitizedLocation, lang, isCountryLevel);
    console.log('📝 추천지 프롬프트:', spotsPrompt.substring(0, 200) + '...');
    
    const spotsResult = await model.generateContent(spotsPrompt);
    const spotsText = await spotsResult.response.text();
    
    console.log('🧠 추천지 AI 응답 (첫 200자):', spotsText.substring(0, 200));
    
    if (!spotsText || spotsText.trim().length === 0) {
      console.error('❌ AI가 추천지 데이터를 생성하지 않았습니다');
      return NextResponse.json({
        success: false,
        error: 'AI가 추천 여행지를 생성하지 못했습니다. 다시 시도해주세요.',
        details: {
          stage: 'spots_generation',
          location: sanitizedLocation,
          language: lang
        }
      }, { status: 500 });
    }
    
    const spotsData = parseAIResponse<RecommendedSpot[]>(spotsText);
    console.log('✅ 추천지 파싱 결과:', spotsData ? `${spotsData.length}개` : '실패');
    
    if (!spotsData || !Array.isArray(spotsData) || spotsData.length === 0) {
      console.error('❌ 추천지 JSON 파싱 실패 또는 빈 배열');
      console.error('📝 AI 응답 원문:', spotsText.substring(0, 500));
      return NextResponse.json({
        success: false,
        error: 'AI 응답을 파싱하지 못했습니다. JSON 형식이 올바르지 않습니다.',
        details: {
          stage: 'spots_parsing',
          aiResponse: spotsText.substring(0, 200),
          location: sanitizedLocation,
          language: lang
        }
      }, { status: 500 });
    }
    
    // 인기도 순으로 정렬 (높은 점수부터 낮은 점수 순)
    spotsData.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    console.log('🏆 인기도 순 정렬 완료:', spotsData.map(spot => `${spot.name} (${spot.popularity}점)`).slice(0, 3));

    // 3단계: 통합 가이드 데이터 구성 (AI 추천지 기반)
    console.log('🧩 통합 데이터 구성 중...', spotsData ? `${spotsData.length}개 spots 사용` : 'spots 없음');
    
    // ✅ 중복 제거된 가이드 데이터 구조 (기존 가이드와 호환)
    const guideData = {
      title: overviewData.regionData.name + ' 완전 탐험 가이드',
      location: overviewData.regionData.name,
      estimatedTime: '7-14일',
      difficulty: 'easy',
      tags: ['문화', '역사', '자연', '음식', '도시'],
      safetyWarnings: '여행 시 유의사항을 확인하세요',
      bestTimeToVisit: overviewData.regionData.quickFacts?.bestTime || '연중',
      // 🔥 수정: 기존 가이드와 동일한 구조로 highlights 저장
      highlights: overviewData.regionData.highlights, // 루트 레벨에 저장
      exploreHub: {
        lastUpdated: new Date().toISOString()
      },
      // route.steps만 저장 (realTimeGuide.chapters 중복 제거)
      route: {
        totalDuration: '7-14일 권장',
        steps: spotsData?.slice(0, 8).map((spot, index) => ({
          id: index,
          location: spot.name,
          title: `${spot.name}: ${spot.description || '추천 여행지'}`,
          description: spot.description || '',
          estimatedTime: `${spot.estimatedDays || 1}일`,
          category: spot.category || 'attraction',
          highlights: spot.highlights || [],
          popularity: spot.popularity || 50
        })) || []
      },
      // 좌표 생성용으로만 사용 (간소화)
      realTimeGuide: {
        chapters: spotsData?.slice(0, 8).map((spot, index) => ({
          id: index,
          title: spot.name
        })) || []
      }
    };
    
    console.log('📍 좌표 생성용 챕터 제목들:', guideData.realTimeGuide.chapters.map(c => c.title));

    // 4단계: 좌표 생성
    console.log('📍 좌표 생성 중...');
    let coordinates: any = null;
    
    try {
      // locationName이 undefined가 되는 문제 해결
      const validLocationName = guideData?.location || sanitizedLocation || 'Korea';
      console.log('🔍 좌표 생성용 위치명:', validLocationName);
      
      // ✅ 클라이언트에서 전달받은 세션스토리지 데이터 우선 사용
      // cachedLocationInfo는 이미 함수 상단에서 선언됨
      if (cachedLocationInfo) {
        console.log('✅ 클라이언트에서 세션스토리지 정보 전달받음:', {
          region: cachedLocationInfo.region,
          country: cachedLocationInfo.country,
          countryCode: cachedLocationInfo.countryCode
        });
      } else {
        // 백업: 서버사이드에서 세션스토리지 접근 시도 (작동 안함)
        try {
          cachedLocationInfo = getAutocompleteData(sanitizedLocation, false);
          console.log('⚠️ 서버사이드 세션스토리지 접근 시도 (실패 예상)');
        } catch (error) {
          console.log('⚠️ 서버사이드 세션스토리지 접근 실패 (예상됨):', error);
        }
      }
      
      // ✅ StandardLocationInfo 객체 구성 (SessionStorage > AI > 기본값 우선순위)
      const locationInfo: StandardLocationInfo = {
        name: validLocationName,
        location: validLocationName,
        region: cachedLocationInfo?.region || overviewData.regionData.country || sanitizedLocation,
        country: cachedLocationInfo?.country || overviewData.regionData.country || sanitizedLocation,
        countryCode: cachedLocationInfo?.countryCode || getCountryCode(overviewData.regionData.country || sanitizedLocation),
        type: 'location',
        coordinates: overviewData.regionData.coordinates ? {
          lat: overviewData.regionData.coordinates.lat,
          lng: overviewData.regionData.coordinates.lng
        } : undefined
      };
      
      console.log('🌍 최종 좌표 검색용 지역 컨텍스트:', {
        region: locationInfo.region,
        country: locationInfo.country,
        countryCode: locationInfo.countryCode,
        source: cachedLocationInfo ? 'SessionStorage' : 'AI+기본값'
      });
      
      // ✅ 올바른 매개변수 순서로 함수 호출
      coordinates = await generateCoordinatesForGuideCommon(
        locationInfo,     // StandardLocationInfo 객체
        guideData,        // 가이드 컨텐츠
        {
          maxChapters: 8, // 추천지 8개에 맞춤
          delay: 500,     // API 제한 고려
          language: lang
        }
      );
      
      if (coordinates && Array.isArray(coordinates)) {
        console.log('✅ 좌표 생성 완료:', coordinates.length, '개 좌표');
      }
    } catch (coordError) {
      console.warn('⚠️ 좌표 생성 실패:', coordError);
      coordinates = null;
    }

    // 3단계: DB에 저장 (일반 가이드와 동일한 스키마 사용)
    console.log('💾 DB 저장 중...');
    let dbSaved = false;
    
    try {
      const supabase = getSupabaseClient();
      
      // ✅ 일반 가이드와 동일한 스키마 구조 사용
      const { data, error } = await supabase
        .from('guides')
        .upsert({
          locationname: sanitizedLocation,
          language: lang.toLowerCase(),
          content: guideData, // content에는 좌표 제외
          coordinates: coordinates, // coordinates 칼럼에 별도 저장
          location_region: cachedLocationInfo?.region || overviewData.regionData.country || sanitizedLocation,
          country_code: cachedLocationInfo?.countryCode || getCountryCode(overviewData.regionData.country || sanitizedLocation),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'locationname,language',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error('❌ DB 저장 오류:', error);
      } else {
        console.log('✅ DB 저장 완료');
        dbSaved = true;
      }
    } catch (dbError) {
      console.error('❌ DB 저장 실패:', dbError);
    }

    // 4단계: RegionExploreHub 호환 형식으로 변환 (프론트엔드가 기대하는 구조)
    console.log('🏗️ RegionExploreHub 형식으로 변환 중...');
    
    const response = {
      success: true,
      // ✅ 프론트엔드가 기대하는 content 구조로 변환
      content: {
        overview: {
          keyFacts: [
            {
              title: "지역명",
              description: overviewData.regionData.name
            },
            {
              title: "국가",
              description: overviewData.regionData.country
            },
            {
              title: "최적 방문 시기",
              description: overviewData.regionData.quickFacts.bestTime || "연중"
            }
          ],
          highlights: overviewData.regionData.highlights
        },
        route: {
          steps: spotsData?.slice(0, 8).map((spot, index) => ({
            location: spot.name, // ✅ RegionExploreHub가 step.location을 읽음
            title: `${spot.name}: ${spot.name}에서 즐길 수 있는 특별한 경험`,
            description: `${spot.name}의 매력적인 여행 경험을 만나보세요`,
            estimatedTime: "2-3시간",
            category: 'attraction',
            highlights: ['추천 명소', '인기 관광지'],
            popularity: 90 - (index * 2) // 90, 88, 86, 84, 82, 80, 78, 76
          })) || []
        }
      },
      coordinates: coordinates, // ✅ 일반 가이드와 동일하게 별도 필드로 반환
      generated: true,
      dbSaved,
      generatedAt: new Date().toISOString(),
      processingMethod: 'region-overview-specialized',
      spotsCount: spotsData?.length || 0
    };

    // highlights는 이미 guideData.exploreHub에 포함되어 저장됨 (중복 제거)

    console.log('✅ 지역 탐색 허브 생성 완료:', {
      regionName: overviewData.regionData.name,
      spotsCount: spotsData?.length || 0,
      hasCoordinates: !!coordinates,
      dbSaved
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


// 🌍 국가 코드 추출 헬퍼 함수
function getCountryCode(locationName: string): string {
  const countryCodeMap: { [key: string]: string } = {
    'Korea': 'KR',
    '한국': 'KR',
    '대한민국': 'KR',
    'France': 'FR',
    '프랑스': 'FR',
    'Japan': 'JP',
    '일본': 'JP',
    'China': 'CN',
    '중국': 'CN',
    'USA': 'US',
    '미국': 'US',
    'Germany': 'DE',
    '독일': 'DE',
    'Italy': 'IT',
    '이탈리아': 'IT',
    'Spain': 'ES',
    '스페인': 'ES'
  };
  
  return countryCodeMap[locationName] || 'XX';
}