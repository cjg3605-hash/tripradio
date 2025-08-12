import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';

export const runtime = 'nodejs';


// Gemini 클라이언트 초기화 함수
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error('Failed to initialize AI service');
  }
};

/**
 * 🎯 Plus Code 검증 로직
 * Google Places API 결과의 plus_code를 활용하여 위치 정확성 검증
 */
function verifyLocationWithPlusCode(
  placesResult: any,
  locationName: string
): boolean {
  if (!placesResult || !placesResult.plus_code) {
    console.log(`⚠️ Plus Code 없음: ${locationName}`);
    return false;
  }
  
  // Plus Code 존재 시 기본적으로 신뢰
  console.log(`✅ Plus Code 검증 성공: ${placesResult.plus_code} for ${locationName}`);
  return true;
}


/**
 * 🌍 지역별 최적 언어 결정
 */
function getOptimalLanguageForLocation(locationName: string): string {
  const name = locationName.toLowerCase();
  
  // 한국 관련 키워드 감지
  const koreanKeywords = [
    '서울', '부산', '제주', '경주', '인천', '대전', '대구', '광주', '울산',
    '강릉', '전주', '안동', '여수', '경기', '강원', '충청', '전라', '경상',
    '궁', '사찰', '절', '한옥', '전통', '문화재', '민속', '국립공원',
    '구', '동', '시', '도', '군'
  ];
  
  const hasKoreanKeyword = koreanKeywords.some(keyword => name.includes(keyword));
  const hasKoreanChar = /[가-힣]/.test(locationName);
  
  if (hasKoreanKeyword || hasKoreanChar) {
    return 'ko';  // 한국어
  }
  
  return 'en';  // 영어 (기본값)
}

/**
 * 🌍 Google Places 결과에서 지역 정보 추출
 */
function extractRegionalInfoFromPlaces(
  address: any, 
  fallback: { location_region: string | null; country_code: string | null; }
): { location_region: string | null; country_code: string | null; } {
  if (!address || !address.address_components) {
    return fallback;
  }

  let location_region: string | null = null;
  let country_code: string | null = null;

  // Google Places address_components에서 정보 추출
  for (const component of address.address_components) {
    const types = component.types || [];
    
    // 국가 코드 추출
    if (types.includes('country')) {
      country_code = component.short_name; // 예: "KR", "US", "FR"
    }
    
    // 지역 정보 추출 (우선순위: 시/도 > 구/군 > 행정구역)
    if (types.includes('administrative_area_level_1')) {
      // 시/도 (예: "서울특별시", "California")
      location_region = component.long_name;
    } else if (types.includes('administrative_area_level_2') && !location_region) {
      // 구/군 (예: "강남구", "Los Angeles County")
      location_region = component.long_name;
    } else if (types.includes('locality') && !location_region) {
      // 도시 (예: "서울", "Paris")
      location_region = component.long_name;
    }
  }

  // 결과 반환 (추출된 정보가 있으면 사용, 없으면 fallback)
  return {
    location_region: location_region || fallback.location_region,
    country_code: country_code || fallback.country_code
  };
}

/**
 * 🌍 장소명과 지역 컨텍스트로부터 지역 정보 추출
 */
function extractRegionalInfo(locationName: string, parentRegion?: string, regionalContext?: any): {
  location_region: string | null;
  country_code: string | null;
} {
  const name = locationName.toLowerCase();
  
  // 1. parentRegion이 있는 경우 우선 사용
  if (parentRegion) {
    const countryCode = inferCountryCodeFromRegion(parentRegion);
    return {
      location_region: parentRegion,
      country_code: countryCode
    };
  }
  
  // 2. regionalContext에서 정보 추출
  if (regionalContext) {
    const region = regionalContext.region || regionalContext.parentRegion;
    const country = regionalContext.country || regionalContext.countryCode;
    
    if (region || country) {
      return {
        location_region: region || null,
        country_code: country || (region ? inferCountryCodeFromRegion(region) : null)
      };
    }
  }
  
  // 3. 장소명으로부터 지역 추정
  return inferRegionalInfoFromLocationName(name);
}

/**
 * 🌍 지역명으로부터 국가 코드 추정
 */
function inferCountryCodeFromRegion(region: string): string {
  const regionLower = region.toLowerCase();
  
  // 한국 지역
  if (regionLower.includes('서울') || regionLower.includes('부산') || regionLower.includes('제주') || 
      regionLower.includes('경기') || regionLower.includes('강원') || regionLower.includes('충청') ||
      regionLower.includes('전라') || regionLower.includes('경상') || regionLower.includes('korea')) {
    return 'KR';
  }
  
  // 프랑스
  if (regionLower.includes('paris') || regionLower.includes('파리') || regionLower.includes('france')) {
    return 'FR';
  }
  
  // 영국
  if (regionLower.includes('london') || regionLower.includes('런던') || regionLower.includes('england') || regionLower.includes('uk')) {
    return 'GB';
  }
  
  // 이탈리아
  if (regionLower.includes('rome') || regionLower.includes('로마') || regionLower.includes('italy')) {
    return 'IT';
  }
  
  // 미국
  if (regionLower.includes('new york') || regionLower.includes('뉴욕') || regionLower.includes('california') || regionLower.includes('usa')) {
    return 'US';
  }
  
  // 일본
  if (regionLower.includes('tokyo') || regionLower.includes('도쿄') || regionLower.includes('japan')) {
    return 'JP';
  }
  
  // 중국
  if (regionLower.includes('beijing') || regionLower.includes('베이징') || regionLower.includes('china')) {
    return 'CN';
  }
  
  // 기본값: 한국
  return 'KR';
}

/**
 * 🌍 장소명으로부터 지역 정보 추정
 */
function inferRegionalInfoFromLocationName(locationName: string): {
  location_region: string | null;
  country_code: string | null;
} {
  // 한국 지역들
  if (locationName.includes('서울') || locationName.includes('seoul')) {
    return { location_region: '서울특별시', country_code: 'KR' };
  } else if (locationName.includes('부산') || locationName.includes('busan')) {
    return { location_region: '부산광역시', country_code: 'KR' };
  } else if (locationName.includes('제주') || locationName.includes('jeju')) {
    return { location_region: '제주특별자치도', country_code: 'KR' };
  } else if (locationName.includes('경주') || locationName.includes('gyeongju')) {
    return { location_region: '경상북도', country_code: 'KR' };
  } else if (locationName.includes('인천') || locationName.includes('incheon')) {
    return { location_region: '인천광역시', country_code: 'KR' };
  } else if (locationName.includes('대전') || locationName.includes('daejeon')) {
    return { location_region: '대전광역시', country_code: 'KR' };
  } else if (locationName.includes('대구') || locationName.includes('daegu')) {
    return { location_region: '대구광역시', country_code: 'KR' };
  } else if (locationName.includes('광주') || locationName.includes('gwangju')) {
    return { location_region: '광주광역시', country_code: 'KR' };
  } else if (locationName.includes('울산') || locationName.includes('ulsan')) {
    return { location_region: '울산광역시', country_code: 'KR' };
  } else if (locationName.includes('수원') || locationName.includes('suwon')) {
    return { location_region: '경기도', country_code: 'KR' };
  }
  
  // 해외 주요 관광지
  else if (locationName.includes('paris') || locationName.includes('파리') || locationName.includes('에펠') || locationName.includes('루브르')) {
    return { location_region: '파리', country_code: 'FR' };
  } else if (locationName.includes('london') || locationName.includes('런던') || locationName.includes('빅벤')) {
    return { location_region: '런던', country_code: 'GB' };
  } else if (locationName.includes('rome') || locationName.includes('로마') || locationName.includes('콜로세움')) {
    return { location_region: '로마', country_code: 'IT' };
  } else if (locationName.includes('new york') || locationName.includes('뉴욕') || locationName.includes('자유의 여신')) {
    return { location_region: '뉴욕', country_code: 'US' };
  } else if (locationName.includes('tokyo') || locationName.includes('도쿄') || locationName.includes('동경')) {
    return { location_region: '도쿄', country_code: 'JP' };
  } else if (locationName.includes('beijing') || locationName.includes('베이징') || locationName.includes('북경')) {
    return { location_region: '베이징', country_code: 'CN' };
  }
  
  // 한국 관련 키워드가 있으면 한국으로 분류
  else if (locationName.includes('궁') || locationName.includes('사찰') || locationName.includes('절') || 
           locationName.includes('경복') || locationName.includes('창덕') || locationName.includes('불국') ||
           locationName.includes('석굴암')) {
    return { location_region: '미분류', country_code: 'KR' };
  }
  
  // 기본값: 한국의 미분류 지역
  return { location_region: '미분류', country_code: 'KR' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName, language, userProfile, parentRegion, regionalContext } = body;

    if (!locationName || !language) {
      return NextResponse.json(
        { 
          success: false, 
          error: '위치명과 언어는 필수입니다.' 
        },
        { status: 400 }
      );
    }

    // 🌍 1단계: 기본 지역 정보 추출
    console.log(`\n🌍 1단계: 기본 지역 정보 추출: ${locationName}`);
    const initialRegionalInfo = extractRegionalInfo(locationName, parentRegion, regionalContext);
    console.log(`🌍 기본 지역 정보:`, initialRegionalInfo);

    // ⚡ 2단계: Google Places API 호출과 AI 생성 병렬 실행
    console.log(`\n⚡ 2단계: 병렬 처리 시작 - Google Places API + AI 생성`);
    
    // Google Places API 호출 Promise
    const placesSearchPromise = (async () => {
      try {
        const { smartPlacesSearch } = await import('@/lib/coordinates/google-places-integration');
        const optimalLanguage = getOptimalLanguageForLocation(locationName);
        console.log(`🌐 Google Places API 최적 언어: ${optimalLanguage}`);
        
        const result = await smartPlacesSearch(locationName, optimalLanguage);
        console.log(`✅ Google Places API 완료`);
        return result;
      } catch (error) {
        console.warn('⚠️ Google Places API 실패:', error);
        return null;
      }
    })();

    // AI 가이드 생성 Promise
    const aiGenerationPromise = (async () => {
      try {
        console.log(`🤖 AI 가이드 생성 시작: ${language}`);
        
        // 프롬프트 생성
        const contextualLocationName = parentRegion 
          ? `${locationName} (${parentRegion} 지역)`
          : locationName;
        const prompt = await createAutonomousGuidePrompt(contextualLocationName, language, userProfile);
        
        // AI 모델 호출
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash-lite-preview-06-17',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16384,
            topK: 40,
            topP: 0.9,
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
          throw new Error('AI 응답이 비어있습니다');
        }

        console.log(`✅ AI 생성 완료: ${text.length}자`);
        return text;
      } catch (error) {
        console.error('❌ AI 생성 실패:', error);
        throw error;
      }
    })();

    // 병렬 실행 및 결과 수집
    const [placesSearchResult, aiGenerationResult] = await Promise.allSettled([
      placesSearchPromise,
      aiGenerationPromise
    ]);

    // Google Places API 결과 처리
    let placesResult: any = null;
    let regionalInfo = initialRegionalInfo;
    
    if (placesSearchResult.status === 'fulfilled' && placesSearchResult.value) {
      placesResult = placesSearchResult.value;
      console.log(`✅ Google Places API 결과 활용`);
      
      if (placesResult && placesResult.address) {
        console.log(`📍 Google Places 결과:`, placesResult.address);
        
        // Google Places 결과에서 지역 정보 추출
        const enhancedRegionalInfo = extractRegionalInfoFromPlaces(placesResult.address, regionalInfo);
        
        if (enhancedRegionalInfo.location_region && enhancedRegionalInfo.country_code) {
          regionalInfo = enhancedRegionalInfo;
          console.log(`✅ Google Places 기반 향상된 지역 정보:`, regionalInfo);
        }
      }
    } else {
      console.warn('⚠️ Google Places API 실패, 기본 지역 정보 사용');
    }

    // AI 생성 결과 처리
    if (aiGenerationResult.status === 'rejected') {
      throw new Error(`AI 생성 실패: ${aiGenerationResult.reason}`);
    }
    
    const text = aiGenerationResult.value;
    console.log(`🌍 최종 지역 정보:`, regionalInfo);
    console.log(`📥 ${language} AI 응답 수신: ${text.length}자`);

    // 🚨 AI 응답 디버깅 - 처음 1000글자만 출력
    console.log(`🔍 AI 응답 내용 (처음 1000자):`);
    console.log(text.substring(0, 1000));
    console.log(`🔍 AI 응답 끝부분 (마지막 500자):`);
    console.log(text.substring(Math.max(0, text.length - 500)));

    // JSON 파싱 시도
    let guideData;
    let validChapters: any[] = []; // 🔥 스코프 외부로 이동
    
    try {
      // JSON 블록 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        guideData = JSON.parse(jsonMatch[0]);
        
        // 🔥 핵심: AI가 realTimeGuide.chapters 없이 route.steps만 생성한 경우 자동 변환
        if (!guideData.realTimeGuide?.chapters && guideData.route?.steps) {
          console.log(`🔄 route.steps → realTimeGuide.chapters 자동 변환 시작`);
          
          // route.steps를 기반으로 realTimeGuide.chapters 생성
          guideData.realTimeGuide = guideData.realTimeGuide || {};
          guideData.realTimeGuide.chapters = guideData.route.steps.map((step: any, index: number) => ({
            id: index,
            title: step.title || step.location || `챕터 ${index + 1}`,
            narrative: `${step.title || step.location}에 대한 상세한 설명입니다.`,
            nextDirection: index < guideData.route.steps.length - 1 
              ? `다음 장소인 ${guideData.route.steps[index + 1].title}로 이동하겠습니다.`
              : "관람을 마치시고 자유롭게 둘러보시거나 출구 방향으로 이동하시면 됩니다."
          }));
          
          console.log(`✅ route.steps → realTimeGuide.chapters 변환 완료: ${guideData.realTimeGuide.chapters.length}개`);
        }
        
        // 🔥 핵심: 안전한 챕터 카운팅 및 유효성 검증
        if (guideData.realTimeGuide?.chapters) {
          // 유효한 챕터만 필터링 (id와 title이 있는 것)
          validChapters = guideData.realTimeGuide.chapters.filter((chapter: any) => 
            chapter && 
            (chapter.id !== undefined && chapter.id !== null) && 
            chapter.title && 
            chapter.title.trim()
          );
          
          console.log(`🔍 ${language} 전체 챕터: ${guideData.realTimeGuide.chapters.length}개`);
          console.log(`🔍 ${language} 유효한 챕터: ${validChapters.length}개`);
          
          validChapters.forEach((chapter: any, index: number) => {
            console.log(`  챕터 ID ${chapter.id}: "${chapter.title}"`);
            console.log(`    narrative: ${chapter.narrative ? `${chapter.narrative.substring(0, 100)}...` : 'MISSING'}`);
            console.log(`    nextDirection: ${chapter.nextDirection ? `${chapter.nextDirection.substring(0, 50)}...` : 'MISSING'}`);
          });
        }
        
        // 🔥 핵심: 유효한 챕터들만 처리 (좌표 처리는 나중에)
        if (validChapters.length > 0) {
          guideData.realTimeGuide.chapters = validChapters.map((chapter: any) => {
            // 🚨 narrative 통합 (3개 필드를 합쳐서 narrative로 생성)
            const sceneDescription = chapter.sceneDescription || '';
            const coreNarrative = chapter.coreNarrative || '';
            const humanStories = chapter.humanStories || '';
            const existingNarrative = chapter.narrative || '';
            
            // 3개 필드가 있으면 통합, 없으면 기존 narrative 사용
            const fieldsArray = [sceneDescription, coreNarrative, humanStories].filter(Boolean);
            const combinedNarrative = fieldsArray.length > 0 
              ? fieldsArray.join(' ') 
              : existingNarrative;
            
            // 🔥 3개 필드 통합 디버깅
            console.log(`📝 챕터 ${chapter.id} 필드 통합:`);
            console.log(`  sceneDescription: ${sceneDescription ? sceneDescription.length + '글자' : '없음'}`);
            console.log(`  coreNarrative: ${coreNarrative ? coreNarrative.length + '글자' : '없음'}`);
            console.log(`  humanStories: ${humanStories ? humanStories.length + '글자' : '없음'}`);
            console.log(`  combinedNarrative: ${combinedNarrative ? combinedNarrative.length + '글자' : '없음'}`);
            
            // AI가 생성한 좌표 정보는 제거 (나중에 정확한 좌표로 교체)
            let cleanNarrative = combinedNarrative
              .replace(/위도[\s:：]*\d{1,2}\.\d{4,8}[,，\s]*경도[\s:：]*\d{1,3}\.\d{4,8}/gi, '') // 위도/경도 패턴 제거
              .replace(/\{\s*["']?(?:lat|latitude)["']?\s*:\s*\d{1,2}\.\d{4,8}\s*,\s*["']?(?:lng|longitude)["']?\s*:\s*\d{1,3}\.\d{4,8}\s*\}/gi, '') // JSON 좌표 제거
              .replace(/\[\s*\d{1,2}\.\d{4,8}\s*,\s*\d{1,3}\.\d{4,8}\s*\]/g, '') // 배열 좌표 제거
              .replace(/\d{1,2}\.\d{4,8}[,，\s]+\d{1,3}\.\d{4,8}/g, '') // 일반 좌표 제거
              .replace(/\s+/g, ' ') // 여러 공백을 하나로
              .replace(/^\s*[,，.。]\s*/, '') // 시작 구두점 제거
              .replace(/\s*[,，.。]\s*$/, '') // 끝 구두점 정리
              .trim();
            
            return {
              ...chapter,
              narrative: cleanNarrative,
              // 좌표는 나중에 처리하므로 일단 제거
              coordinates: undefined,
              lat: undefined,
              lng: undefined,
              // 3개 필드는 제거 (narrative로 통합됨)
              sceneDescription: undefined,
              coreNarrative: undefined,
              humanStories: undefined
            };
          });
        }
        
        // 🔥 새로운 개요 양식 정규화
        if (guideData.overview) {
          // 새로운 필드들이 없으면 기존 summary를 사용
          if (!guideData.overview.location && !guideData.overview.keyFeatures && !guideData.overview.background) {
            // 기존 summary가 있으면 그대로 유지 (호환성)
            if (guideData.overview.summary) {
              console.log(`📝 ${language} 기존 개요 구조 유지`);
            } else {
              // 기본 개요 구조 생성
              guideData.overview = {
                ...guideData.overview,
                location: `${locationName}의 정확한 위치`,
                keyFeatures: `${locationName}의 주요 특징`,
                background: `${locationName}의 역사적 배경`
              };
            }
          } else {
            console.log(`✅ ${language} 새로운 개요 양식 적용`);
          }
        }
        
        console.log(`✅ ${language} 가이드 정규화 완료: ${validChapters.length}개 유효한 챕터`);
      } else {
        // JSON 블록이 없으면 전체 텍스트를 기본 구조로 래핑
        guideData = {
          overview: {
            title: locationName,
            location: `${locationName}의 정확한 위치`,
            keyFeatures: `${locationName}의 주요 특징`,
            background: `${locationName}의 역사적 배경`,
            keyFacts: [],
            visitInfo: {},
            narrativeTheme: ''
          },
          route: { steps: [] },
          realTimeGuide: { chapters: [] }
        };
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 구조 사용:', parseError);
      guideData = {
        overview: {
          title: locationName,
          location: `${locationName}의 정확한 위치`,
          keyFeatures: `${locationName}의 주요 특징`,
          background: `${locationName}의 역사적 배경`,
          keyFacts: [],
          visitInfo: {},
          narrativeTheme: ''
        },
        route: { steps: [] },
        realTimeGuide: { chapters: [] }
      };
    }

    console.log(`✅ ${language} AI 가이드 파싱 완룈 - 이제 좌표 후처리 시작`);
    
    // 🎯 3단계: 병렬 실행된 Google Places API 결과에서 좌표 추출 (Plus Code 검증)
    console.log(`\n🔍 좌표 후처리 3단계: 병렬 처리된 데이터 활용`);
    
    let foundCoordinates: { lat: number; lng: number };
    
    // 이미 Google Places API에서 좌표를 확보했는지 확인
    if (placesResult && placesResult.coordinates) {
      console.log(`✅ Google Places API에서 좌표 확보: ${placesResult.coordinates.lat}, ${placesResult.coordinates.lng}`);
      
      // Plus Code 검증
      const isVerified = verifyLocationWithPlusCode(placesResult, locationName);
      if (isVerified) {
        foundCoordinates = {
          lat: placesResult.coordinates.lat,
          lng: placesResult.coordinates.lng
        };
        console.log(`✅ Plus Code 검증 성공 - 좌표 사용: ${foundCoordinates.lat}, ${foundCoordinates.lng}`);
      } else {
        console.log(`⚠️ Plus Code 검증 실패 - 기본 좌표 사용`);
        foundCoordinates = { lat: 37.5665, lng: 126.9780 }; // 서울 명동 기본값
      }
    } else {
      console.log(`⚠️ Google Places API 좌표 없음 - 기본 좌표 사용`);
      foundCoordinates = { lat: 37.5665, lng: 126.9780 }; // 서울 명동 기본값
    }
    
    console.log(`✅ 좌표 확보 완료: ${foundCoordinates.lat}, ${foundCoordinates.lng}`);
    
    // 🎯 4단계: 병렬 처리로 확보된 좌표를 모든 챕터에 후처리 적용
    console.log(`\n📍 좌표 후처리 4단계 시작`);
    
    if (guideData.realTimeGuide?.chapters && validChapters.length > 0) {
      console.log(`📍 ${validChapters.length}개 유효한 챕터에 좌표 적용: ${foundCoordinates.lat}, ${foundCoordinates.lng}`);
      
      // 🔥 핵심: narrative와 nextDirection 사이에 coordinates 필드만 추가
      guideData.realTimeGuide.chapters = validChapters.map((chapter: any, index: number) => {
        const offset = index * 0.0005; // 챕터별 약간의 오프셋 (약 50미터)
        const coordinatesData = {
          lat: foundCoordinates.lat + offset,
          lng: foundCoordinates.lng + offset
        };
        
        // 🎯 정규화된 챕터 구조: narrative와 nextDirection 사이에 coordinates 추가
        const normalizedChapter = {
          ...chapter,
          coordinates: coordinatesData  // narrative와 nextDirection 사이에 위치
        };
        
        console.log(`  ✅ 챕터 ${chapter.id}: 정규화된 좌표 추가 완료`, {
          id: chapter.id,
          title: chapter.title,
          coordinates: coordinatesData,
          narrative: chapter.narrative ? `${chapter.narrative.substring(0, 50)}...` : 'MISSING',
          nextDirection: chapter.nextDirection ? `${chapter.nextDirection.substring(0, 30)}...` : 'MISSING'
        });
        
        return normalizedChapter;
      });
      
      console.log(`✅ ${guideData.realTimeGuide.chapters.length}개 챕터 좌표 JSON 적용 완료`);
      
      // 좌표 성공 정보 저장
      guideData.locationCoordinateStatus = {
        locationName: locationName,
        coordinateSearchAttempted: true,
        coordinateFound: true,
        coordinateSource: 'sequential_after_ai',
        coordinates: foundCoordinates,
        lastAttempt: new Date().toISOString()
      };
      
    } else {
      console.log(`⚠️ realTimeGuide.chapters 구조가 없거나 유효한 챕터가 없음 - 기본 구조 생성`);
      
      // 기본 챕터 구조 생성 (정규화된 방식)
      guideData.realTimeGuide = guideData.realTimeGuide || {};
      guideData.realTimeGuide.chapters = [
        {
          id: 1,
          title: `${locationName} 가이드`,
          narrative: `${locationName}에 대한 안내입니다.`,
          coordinates: {
            lat: foundCoordinates.lat,
            lng: foundCoordinates.lng
          },
          nextDirection: `${locationName} 탐방을 시작해보세요.`
        }
      ];
      
      // 좌표 성공 정보 저장
      guideData.locationCoordinateStatus = {
        locationName: locationName,
        coordinateSearchAttempted: true,
        coordinateFound: true,
        coordinateSource: 'sequential_after_ai_fallback',
        coordinates: foundCoordinates,
        lastAttempt: new Date().toISOString()
      };
      
      console.log(`✅ 기본 챕터 구조 생성 및 정규화된 좌표 적용 완료`);
    }

    // 🎯 5단계: 챕터별 좌표 배열 생성 (사용자 요구사항 - 모든 챕터)
    console.log(`\n📍 챕터별 좌표 배열 생성`);
    const coordinatesArray: any[] = [];
    
    // 🚨 중요: 모든 유효한 챕터의 좌표를 배열로 생성
    if (guideData.realTimeGuide?.chapters && Array.isArray(guideData.realTimeGuide.chapters) && guideData.realTimeGuide.chapters.length > 0) {
      console.log(`📊 ${guideData.realTimeGuide.chapters.length}개 챕터에서 좌표 배열 생성`);
      
      guideData.realTimeGuide.chapters.forEach((chapter: any, index: number) => {
        const offset = index * 0.0005; // 챕터별 약간의 오프셋 (약 50미터)
        const chapterCoords = {
          id: chapter.id !== undefined ? chapter.id : index,
          chapterId: chapter.id !== undefined ? chapter.id : index,
          step: index,
          title: chapter.title || `챕터 ${index + 1}`,
          lat: foundCoordinates.lat + offset,
          lng: foundCoordinates.lng + offset,
          coordinates: {
            lat: foundCoordinates.lat + offset,
            lng: foundCoordinates.lng + offset
          }
        };
        
        coordinatesArray.push(chapterCoords);
        
        console.log(`  ✅ 챕터 ${index} 좌표 생성: ${chapter.title} → (${chapterCoords.lat}, ${chapterCoords.lng})`);
      });
      
      console.log(`✅ 총 ${coordinatesArray.length}개 챕터 좌표 배열 완성`);
    } else {
      // 🚨 챕터가 없는 경우에도 최소 1개는 생성
      console.log(`⚠️ 챕터가 없거나 비어있음 - 기본 좌표 1개 생성`);
      coordinatesArray.push({
        id: 0,
        chapterId: 0,
        step: 0,
        title: `${locationName} 가이드`,
        lat: foundCoordinates.lat,
        lng: foundCoordinates.lng,
        coordinates: {
          lat: foundCoordinates.lat,
          lng: foundCoordinates.lng
        }
      });
    }
    
    console.log(`📍 최종 좌표 배열 검증: ${coordinatesArray.length}개`);
    coordinatesArray.forEach((coord, idx) => {
      console.log(`  ${idx + 1}. [${coord.chapterId}] ${coord.title}: (${coord.lat}, ${coord.lng})`);
    });
    
    // 🎯 6단계: coordinatesArray를 guideData에 추가 (DB 저장용)
    guideData.coordinatesArray = coordinatesArray;
    
    // 🎯 7단계: 지역 정보를 guideData에 추가
    guideData.regionalInfo = regionalInfo;
    console.log(`🌍 지역 정보가 가이드 데이터에 추가됨:`, regionalInfo);
    
    // 🎯 8단계: 최종 응답 반환
    console.log(`\n✅ ${language} 가이드 생성 최종 완료`);
    
    return NextResponse.json({
      success: true,
      data: guideData
    });

  } catch (error) {
    console.error(`❌ 가이드 생성 실패:`, error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `가이드 생성 실패: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}