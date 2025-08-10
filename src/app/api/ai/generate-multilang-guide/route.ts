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

    console.log(`🤖 ${language} 가이드 생성 시작:`, {
      locationName,
      parentRegion: parentRegion || 'none',
      regionalContext: regionalContext || 'none'
    });

    // 🎯 지역 컨텍스트를 포함한 언어별 정교한 프롬프트 생성
    const contextualLocationName = parentRegion 
      ? `${locationName} (${parentRegion} 지역)`
      : locationName;
    const prompt = await createAutonomousGuidePrompt(contextualLocationName, language, userProfile);
    
    console.log(`📝 ${language} 프롬프트 준비 완료: ${prompt.length}자`);

    // Gemini 클라이언트 초기화
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384, // 대폭 증가: 8000 → 16384
        topK: 40,
        topP: 0.9,
      }
    });

    console.log(`🤖 ${language} 가이드 생성 중...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('AI 응답이 비어있습니다');
    }

    console.log(`📥 ${language} AI 응답 수신: ${text.length}자`);

    // JSON 파싱 시도
    let guideData;
    try {
      // JSON 블록 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        guideData = JSON.parse(jsonMatch[0]);
        
        // 🔥 디버깅: 챕터 제목 및 3개 필드 데이터 확인
        if (guideData.realTimeGuide?.chapters) {
          console.log(`🔍 ${language} 챕터 제목 및 필드 확인:`);
          guideData.realTimeGuide.chapters.forEach((chapter: any, index: number) => {
            console.log(`  챕터 ${index + 1}: "${chapter.title}"`);
            console.log(`    narrative: ${chapter.narrative ? `${chapter.narrative.substring(0, 100)}...` : 'MISSING'}`);
            console.log(`    sceneDescription: ${chapter.sceneDescription ? `${chapter.sceneDescription.substring(0, 50)}...` : 'MISSING'}`);
            console.log(`    coreNarrative: ${chapter.coreNarrative ? `${chapter.coreNarrative.substring(0, 50)}...` : 'MISSING'}`);
            console.log(`    humanStories: ${chapter.humanStories ? `${chapter.humanStories.substring(0, 50)}...` : 'MISSING'}`);
            console.log(`    coordinates: ${JSON.stringify(chapter.coordinates || 'MISSING')}`);
          });
        }
        
        // 🔥 핵심: 좌표 데이터 추출 및 narrative 정리
        if (guideData.realTimeGuide?.chapters) {
          guideData.realTimeGuide.chapters = guideData.realTimeGuide.chapters.map((chapter: any) => {
            // 🚨 narrative 통합 및 좌표 데이터 추출
            // 3개 필드를 합쳐서 narrative로 생성 (AI가 생성했든 안했든)
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
            console.log(`  기존 narrative: ${existingNarrative ? existingNarrative.length + '글자' : '없음'}`);
            
            // 🔥 최종 narrative 사용 (이미 통합 완료)
            let cleanNarrative = combinedNarrative;
            console.log(`📝 최종 narrative: ${cleanNarrative.length}글자`);
            let extractedCoordinates: { lat: number; lng: number; description: string } | null = null;
            
            // 🔍 AI 응답에서 실제 좌표 데이터 패턴 찾기
            const coordinatePatterns = [
              // 위도/경도 패턴 (48.8584, 2.2945 형태)
              /(?:위도|lat|latitude)[\s:：]*(\d{1,2}\.\d{4,8})[,，\s]*(?:경도|lng|longitude)[\s:：]*(\d{1,3}\.\d{4,8})/gi,
              // 좌표 JSON 형태 {"lat": 48.8584, "lng": 2.2945}
              /\{\s*["']?(?:lat|latitude)["']?\s*:\s*(\d{1,2}\.\d{4,8})\s*,\s*["']?(?:lng|longitude)["']?\s*:\s*(\d{1,3}\.\d{4,8})\s*\}/gi,
              // 좌표 배열 형태 [48.8584, 2.2945]
              /\[\s*(\d{1,2}\.\d{4,8})\s*,\s*(\d{1,3}\.\d{4,8})\s*\]/g,
              // 일반적인 숫자 좌표 (48.8584, 2.2945)
              /(\d{1,2}\.\d{4,8})[,，\s]+(\d{1,3}\.\d{4,8})/g
            ];
            
            // narrative에서 좌표 추출 시도
            let foundCoordinates = false;
            for (const pattern of coordinatePatterns) {
              const matches = cleanNarrative.match(pattern);
              if (matches && matches.length > 0) {
                const coordMatch = matches[0].match(/(\d{1,2}\.\d{4,8})/g);
                if (coordMatch && coordMatch.length >= 2) {
                  const lat = parseFloat(coordMatch[0]);
                  const lng = parseFloat(coordMatch[1]);
                  
                  // 유효한 좌표인지 확인 (전 세계 범위)
                  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    extractedCoordinates = {
                      lat: lat,
                      lng: lng,
                      description: chapter.title || `챕터 ${chapter.id}`
                    };
                    foundCoordinates = true;
                    console.log(`🎯 좌표 추출 성공: ${lat}, ${lng} from "${matches[0]}"`);
                    
                    // narrative에서 좌표 정보 제거
                    cleanNarrative = cleanNarrative.replace(matches[0], '').trim();
                    break;
                  }
                }
              }
            }
            
            // 좌표를 찾지 못한 경우 처리
            if (!foundCoordinates) {
              console.log(`⚠️ 챕터 ${chapter.id} 좌표 추출 실패 - AI가 좌표를 생성하지 못함`);
              // 좌표가 없음을 명시적으로 표시
              extractedCoordinates = null;
            }
            
            // narrative 텍스트 정리
            cleanNarrative = cleanNarrative
              .replace(/\s+/g, ' ') // 여러 공백을 하나로
              .replace(/^\s*[,，.。]\s*/, '') // 시작 구두점 제거
              .replace(/\s*[,，.。]\s*$/, '') // 끝 구두점 정리
              .trim();
            
            console.log(`  ✅ 챕터 ${chapter.id} 좌표 처리: ${JSON.stringify(extractedCoordinates)}`);
            
            return {
              ...chapter,
              narrative: cleanNarrative,
              coordinates: extractedCoordinates,
              lat: extractedCoordinates?.lat,
              lng: extractedCoordinates?.lng,
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
        
        console.log(`✅ ${language} 가이드 정규화 완료: ${guideData.realTimeGuide?.chapters?.length || 0}개 챕터`);
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

    // 🎯 좌표 검증 및 재생성 로직
    let missingCoordinatesCount = 0;
    if (guideData.realTimeGuide?.chapters) {
      missingCoordinatesCount = guideData.realTimeGuide.chapters.filter(
        (chapter: any) => !chapter.coordinates || (!chapter.lat && !chapter.lng)
      ).length;
    }

    // 좌표가 없는 챕터가 있으면 재생성 시도
    if (missingCoordinatesCount > 0) {
      console.log(`⚠️ ${missingCoordinatesCount}개 챕터에 좌표 누락 - 좌표 재생성 시도`);
      
      let coordinateRegenerateSuccess = false;
      
      try {
        const coordinatePrompt = `
Location: ${contextualLocationName}

Please provide the exact coordinates (latitude, longitude) for this location.
Respond ONLY in this format:

Coordinates: [latitude], [longitude]
Example: Coordinates: 40.4319, 116.5704

If you cannot find exact coordinates, respond with "Coordinates not found".
`;

        const coordinateResponse = await genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
          .generateContent(coordinatePrompt);
        
        const coordinateText = coordinateResponse.response.text();
        console.log(`🔍 좌표 재생성 응답: ${coordinateText}`);

        // 좌표 추출 시도 (영어 형식)
        const coordMatch = coordinateText.match(/Coordinates:\s*(-?\d{1,2}\.\d{1,8}),\s*(-?\d{1,3}\.\d{1,8})/i);
        
        if (coordMatch) {
          const baseLat = parseFloat(coordMatch[1]);
          const baseLng = parseFloat(coordMatch[2]);
          
          if (baseLat >= -90 && baseLat <= 90 && baseLng >= -180 && baseLng <= 180) {
            console.log(`✅ 좌표 재생성 성공: ${baseLat}, ${baseLng} (언어 무관 - 모든 버전에서 사용)`);
            
            // 누락된 좌표 채우기 (챕터별 약간의 오프셋)
            guideData.realTimeGuide.chapters = guideData.realTimeGuide.chapters.map((chapter: any, index: number) => {
              if (!chapter.coordinates || (!chapter.lat && !chapter.lng)) {
                const offset = index * 0.0005;
                const newCoords = {
                  lat: baseLat + offset,
                  lng: baseLng + offset,
                  description: chapter.title || `Chapter ${index + 1}`
                };
                
                return {
                  ...chapter,
                  coordinates: newCoords,
                  lat: newCoords.lat,
                  lng: newCoords.lng
                };
              }
              return chapter;
            });
            
            coordinateRegenerateSuccess = true;
            console.log(`🎯 좌표 재생성으로 ${missingCoordinatesCount}개 챕터 좌표 복구 완료 (위치 기반 - 언어 무관)`);
          } else {
            console.log(`❌ 유효하지 않은 좌표 범위: ${baseLat}, ${baseLng}`);
          }
        } else if (coordinateText.toLowerCase().includes('coordinates not found')) {
          console.log(`❌ AI가 좌표를 찾을 수 없다고 명시적으로 응답함`);
        } else {
          console.log(`❌ 좌표 형식을 인식할 수 없음: ${coordinateText}`);
        }
        
      } catch (coordError) {
        console.error(`❌ 좌표 재생성 API 호출 실패:`, coordError);
      }
      
      // 재생성 실패 시에만 실패 정보 설정
      if (!coordinateRegenerateSuccess) {
        console.log(`🚫 좌표 재생성 최종 실패 - 사용자에게 알림`);
        guideData.coordinateGenerationFailed = true;
        guideData.coordinateFailureReason = "AI가 해당 위치의 정확한 좌표를 찾지 못했습니다.";
        guideData.missingCoordinatesCount = missingCoordinatesCount;
        
        // 좌표 실패 정보를 위치 기반으로 저장 (다른 언어에서도 참조 가능)
        guideData.locationCoordinateStatus = {
          locationName: locationName,
          coordinateSearchAttempted: true,
          coordinateFound: false,
          lastAttempt: new Date().toISOString()
        };
      } else {
        // 좌표 성공 정보 저장
        guideData.locationCoordinateStatus = {
          locationName: locationName,
          coordinateSearchAttempted: true,
          coordinateFound: true,
          lastAttempt: new Date().toISOString()
        };
      }
    }

    console.log(`✅ ${language} 가이드 생성 완료`);
    
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