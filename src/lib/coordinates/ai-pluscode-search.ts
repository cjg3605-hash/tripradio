// src/lib/coordinates/ai-pluscode-search.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🎯 AI 기반 Plus Code 좌표 추출 시스템
 * Google Places API 없이 순수 AI로 좌표 검색
 */

export interface ChapterLocation {
  step: number;
  location: string;
  title?: string;
}

export interface CoordinateResult {
  lat: number;
  lng: number;
  source: 'ai_pluscode';
  confidence: number;
}

export interface ChapterCoordinate {
  id: number;
  lat: number;
  lng: number;
  step: number;
  title: string;
  chapterId: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * 🤖 AI를 활용한 Plus Code 좌표 검색
 */
async function getCoordinateFromAI(
  location: string,
  region: string,
  country: string
): Promise<CoordinateResult | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return null;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Plus Code 전용 프롬프트
    const coordinatePrompt = `
Please find the exact GPS coordinates for this specific location using Plus Code system:

Location: "${location}"
Region: "${region}"
Country: "${country}"

Context: This is a specific point or area within ${location} located in ${region}, ${country}.
Please search for the Plus Code and convert it to precise GPS coordinates.

IMPORTANT: 
- Use Plus Code system to find accurate coordinates
- Be as specific as possible for the exact location
- Consider the regional context for accuracy

Respond ONLY in this exact format:
LAT: [latitude with 4-6 decimal places]
LNG: [longitude with 4-6 decimal places]

Example format:
LAT: 40.431907
LNG: 116.570374
`;

    console.log(`🤖 AI Plus Code 요청: "${location}, ${region}, ${country}"`);
    
    const result = await model.generateContent(coordinatePrompt);
    const response = result.response.text();
    
    console.log(`🤖 AI Plus Code 응답: ${response.trim()}`);
    
    // 좌표 추출 (더 유연한 정규표현식)
    const latMatch = response.match(/LAT:\s*([-+]?\d{1,3}\.?\d*)/i);
    const lngMatch = response.match(/LNG:\s*([-+]?\d{1,3}\.?\d*)/i);
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // 좌표 유효성 검증
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log(`✅ AI Plus Code 성공: ${lat}, ${lng}`);
        return {
          lat,
          lng,
          source: 'ai_pluscode',
          confidence: 0.85
        };
      } else {
        console.log(`❌ AI Plus Code 범위 초과: lat=${lat}, lng=${lng}`);
      }
    } else {
      console.log(`❌ AI Plus Code 파싱 실패: ${response.trim()}`);
    }
    
    return null;
  } catch (error) {
    console.error('❌ AI Plus Code 추출 실패:', error);
    return null;
  }
}

/**
 * 🎯 챕터별 좌표 추출 메인 함수
 */
export async function extractChapterCoordinates(
  chapters: ChapterLocation[],
  region: string,
  country: string,
  baseTitle: string = "가이드"
): Promise<ChapterCoordinate[]> {
  console.log(`🎯 챕터별 좌표 추출 시작: ${chapters.length}개 챕터`);
  
  const coordinates: ChapterCoordinate[] = [];
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    
    try {
      console.log(`\n🔍 챕터 ${i + 1} 좌표 추출: "${chapter.location}"`);
      
      // AI Plus Code 좌표 검색
      const coordinateResult = await getCoordinateFromAI(
        chapter.location,
        region,
        country
      );
      
      if (coordinateResult) {
        const chapterCoord: ChapterCoordinate = {
          id: i,
          lat: coordinateResult.lat,
          lng: coordinateResult.lng,
          step: chapter.step || i,
          title: chapter.title || `${baseTitle}: ${chapter.location}`,
          chapterId: i,
          coordinates: {
            lat: coordinateResult.lat,
            lng: coordinateResult.lng
          }
        };
        
        coordinates.push(chapterCoord);
        console.log(`✅ 챕터 ${i + 1} 좌표 성공: ${coordinateResult.lat}, ${coordinateResult.lng}`);
      } else {
        console.log(`❌ 챕터 ${i + 1} 좌표 실패, 기본값 사용`);
        
        // 기본값 사용 (약간의 오프셋 적용)
        const offset = i * 0.001; // 1km 정도 간격
        const defaultLat = getDefaultLatByCountry(country) + offset;
        const defaultLng = getDefaultLngByCountry(country) + offset;
        
        const chapterCoord: ChapterCoordinate = {
          id: i,
          lat: defaultLat,
          lng: defaultLng,
          step: chapter.step || i,
          title: chapter.title || `${baseTitle}: ${chapter.location}`,
          chapterId: i,
          coordinates: {
            lat: defaultLat,
            lng: defaultLng
          }
        };
        
        coordinates.push(chapterCoord);
      }
      
      // API 호출 제한을 위한 짧은 대기
      if (i < chapters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.error(`❌ 챕터 ${i + 1} 처리 중 오류:`, error);
    }
  }
  
  console.log(`✅ 챕터별 좌표 추출 완료: ${coordinates.length}개 좌표 생성`);
  return coordinates;
}

/**
 * 🌍 국가별 기본 위도 반환
 */
function getDefaultLatByCountry(country: string): number {
  const countryDefaults: { [key: string]: number } = {
    '대한민국': 37.5665,
    'Korea': 37.5665,
    '중국': 39.9042,
    'China': 39.9042,
    '일본': 35.6762,
    'Japan': 35.6762,
    '미국': 39.8283,
    'United States': 39.8283,
    '프랑스': 48.8566,
    'France': 48.8566,
  };
  
  return countryDefaults[country] || countryDefaults['중국']; // 기본값: 베이징
}

/**
 * 🌍 국가별 기본 경도 반환
 */
function getDefaultLngByCountry(country: string): number {
  const countryDefaults: { [key: string]: number } = {
    '대한민국': 126.9780,
    'Korea': 126.9780,
    '중국': 116.4074,
    'China': 116.4074,
    '일본': 139.6503,
    'Japan': 139.6503,
    '미국': -98.5795,
    'United States': -98.5795,
    '프랑스': 2.3522,
    'France': 2.3522,
  };
  
  return countryDefaults[country] || countryDefaults['중국']; // 기본값: 베이징
}

/**
 * 🎯 가이드 데이터에서 챕터 정보 추출
 */
export function extractChaptersFromGuideData(guideData: any): ChapterLocation[] {
  const chapters: ChapterLocation[] = [];
  
  try {
    // route.steps에서 추출
    if (guideData?.route?.steps && Array.isArray(guideData.route.steps)) {
      guideData.route.steps.forEach((step: any, index: number) => {
        if (step.location) {
          chapters.push({
            step: step.step || index + 1,
            location: step.location,
            title: step.title || step.description || `스텝 ${index + 1}`
          });
        }
      });
    }
    
    // realTimeGuide.chapters에서 추가 추출
    if (guideData?.realTimeGuide?.chapters && Array.isArray(guideData.realTimeGuide.chapters)) {
      guideData.realTimeGuide.chapters.forEach((chapter: any, index: number) => {
        if (chapter.location && !chapters.find(c => c.location === chapter.location)) {
          chapters.push({
            step: chapter.id || chapters.length + 1,
            location: chapter.location,
            title: chapter.title || `챕터 ${index + 1}`
          });
        }
      });
    }
    
    console.log(`📊 가이드 데이터에서 ${chapters.length}개 챕터 추출 완료`);
    return chapters;
    
  } catch (error) {
    console.error('❌ 챕터 정보 추출 실패:', error);
    return [];
  }
}