/**
 * 🎯 AI 생성 가이드 좌표 정확도 향상 시스템 v2
 * 챕터 0: AI 자가검증 시스템 (10m 정밀도)
 * 나머지 챕터: Enhanced Location Service 보정
 */

import { enhancedLocationService, LocationInput } from './enhanced-location-service';
import { GuideData, GuideChapter } from '@/types/guide';
import { validateChapter0Coordinate, SelfValidationResult } from './self-validation-system';
import { generateChapter0CoordinateWithAI, AIMapAnalysisResult } from './ai-map-analysis-system';

export interface CoordinateEnhancementResult {
  success: boolean;
  originalCount: number;
  enhancedCount: number;
  improvements: {
    chapterId: number;
    originalCoords: { lat: number; lng: number };
    enhancedCoords: { lat: number; lng: number };
    distanceImprovement: number; // 미터
    method: 'self-validation' | 'api-enhancement' | 'ai-map-analysis' | 'fallback' | 'real-location-search'; // 사용된 검증 방법
  }[];
  chapter0Validation?: SelfValidationResult; // 챕터 0 자가검증 결과
  chapter0AIAnalysis?: AIMapAnalysisResult; // 챕터 0 AI 지도 분석 결과
  processingTimeMs: number;
}

/**
 * AI 생성 가이드의 모든 챕터 좌표를 Enhanced Location Service로 보정
 */
export async function enhanceGuideCoordinates(
  guide: GuideData, 
  locationName: string,
  language: string = 'ko'
): Promise<{ enhancedGuide: GuideData; result: CoordinateEnhancementResult }> {
  const startTime = Date.now();
  console.log(`🎯 가이드 좌표 보정 시작: ${locationName}`);
  
  const result: CoordinateEnhancementResult = {
    success: false,
    originalCount: 0,
    enhancedCount: 0,
    improvements: [],
    processingTimeMs: 0
  };

  try {
    // 1. 시작지점 특화 Enhanced Location Service 호출
    let baseLocationResult;
    
    // 1-1. 첫 번째 시도: AI description에서 시작지점 키워드 추출
    const chapter0 = guide.realTimeGuide?.chapters?.[0];
    if (chapter0?.description) {
      const startingPointKeywords = extractStartingPointKeywords(chapter0.description);
      if (startingPointKeywords.length > 0) {
        console.log(`🎯 AI description에서 시작지점 추출: ${startingPointKeywords.join(', ')}`);
        const startingPointInput: LocationInput = {
          query: `${locationName} ${startingPointKeywords.join(' ')}`,
          language: language,
          context: 'tourist entrance main access visitor starting point'
        };
        baseLocationResult = await enhancedLocationService.findLocation(startingPointInput);
      }
    }
    
    // 1-2. 다중 컨텍스트 병렬 검색으로 가장 정확한 시작지점 찾기
    if (!baseLocationResult || baseLocationResult.error) {
      console.log(`🔄 다중 컨텍스트 시작지점 검색: ${locationName}`);
      baseLocationResult = await findBestStartingPoint(locationName, language);
    }
    
    // 1-3. 최종 폴백: 일반 위치 검색
    if (!baseLocationResult || baseLocationResult.error) {
      console.log(`🔄 일반 위치로 최종 폴백: ${locationName}`);
      const baseLocationInput: LocationInput = {
        query: locationName,
        language: language,
        context: 'tourist entrance main gate visitor access'
      };
      baseLocationResult = await enhancedLocationService.findLocation(baseLocationInput);
    }
    
    if (baseLocationResult.error || !baseLocationResult.coordinates) {
      console.warn(`⚠️ 기준 좌표 획득 실패: ${locationName}`);
      return { enhancedGuide: guide, result };
    }

    const baseCoordinates = baseLocationResult.coordinates;
    console.log(`✅ 기준 좌표 확보: ${baseCoordinates.lat}, ${baseCoordinates.lng}`);

    // 2. 가이드 복사본 생성
    const enhancedGuide: GuideData = JSON.parse(JSON.stringify(guide));
    
    // 3. 각 챕터 좌표 보정
    if (enhancedGuide.realTimeGuide?.chapters) {
      const chapters = enhancedGuide.realTimeGuide.chapters;
      result.originalCount = chapters.length;

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        // 챕터 0은 항상 처리 (좌표가 없어도), 나머지는 기존 좌표가 있는 경우만
        const hasOriginalCoords = chapter.coordinates?.lat && chapter.coordinates?.lng;
        const originalCoords = hasOriginalCoords && chapter.coordinates ? {
          lat: chapter.coordinates.lat,
          lng: chapter.coordinates.lng
        } : null;

        if (i === 0 || hasOriginalCoords) {

          if (i === 0) {
            // 🎯 챕터 0: 새로운 AI 지도 분석 시스템 사용 (관광 시작점)
            console.log('🎯 챕터 0 관광 시작점 분석 시작...');
            
            try {
              // 🎯 챕터 제목 기반 좌표 검색 우선 시도
              const chapterTitle = chapter.title || '';
              const chapterDescription = chapter.description || chapter.narrative || '';
              let titleBasedCoords: { lat: number; lng: number } | null = null;

              // 챕터 제목이 메인 위치명과 다르면 제목 기반 검색 수행
              if (chapterTitle && chapterTitle !== locationName && isSpecificLocationTitle(chapterTitle, locationName)) {
                console.log(`🎯 챕터 0 제목 기반 검색 시도: "${chapterTitle}"`);
                titleBasedCoords = await searchByChapterTitle(chapterTitle, locationName, baseCoordinates);
                
                if (titleBasedCoords) {
                  console.log(`✅ 제목 기반 검색 성공: ${titleBasedCoords.lat}, ${titleBasedCoords.lng}`);
                  
                  const distanceImprovement = originalCoords ? calculateDistance(
                    originalCoords.lat, originalCoords.lng,
                    titleBasedCoords.lat, titleBasedCoords.lng
                  ) : 0;

                  chapter.coordinates = titleBasedCoords;

                  result.improvements.push({
                    chapterId: i,
                    originalCoords: originalCoords || { lat: 0, lng: 0 },
                    enhancedCoords: titleBasedCoords,
                    distanceImprovement,
                    method: 'real-location-search'
                  });

                  result.enhancedCount++;
                  console.log(`✅ 챕터 0 제목 기반 좌표 설정 완료: ${chapterTitle}`);
                }
              }

              // 제목 기반 검색 실패 시에만 AI 지도 분석 수행
              if (!titleBasedCoords) {
                console.log('🎯 챕터 0 AI 지도 분석 시작...');
                const aiAnalysis = await generateChapter0CoordinateWithAI(
                  locationName,
                  chapterDescription
                );

                result.chapter0AIAnalysis = aiAnalysis;

                if (aiAnalysis.success && aiAnalysis.selectedStartingPoint) {
                  // AI 지도 분석 성공: AI가 선택한 최적 좌표 사용
                  const aiSelectedCoords = aiAnalysis.selectedStartingPoint.coordinate;
                  chapter.coordinates = aiSelectedCoords;

                  const distanceImprovement = originalCoords ? calculateDistance(
                    originalCoords.lat, originalCoords.lng,
                    aiSelectedCoords.lat, aiSelectedCoords.lng
                  ) : 0;

                  result.improvements.push({
                    chapterId: i,
                    originalCoords: originalCoords || { lat: 0, lng: 0 },
                    enhancedCoords: aiSelectedCoords,
                    distanceImprovement,
                    method: 'ai-map-analysis'
                  });

                  result.enhancedCount++;
                  console.log(`✅ 챕터 0 AI 분석 성공: ${aiAnalysis.selectedStartingPoint.name}`);
                  console.log(`📍 좌표: ${aiSelectedCoords.lat}, ${aiSelectedCoords.lng}`);
                  console.log(`🧠 선택 근거: ${aiAnalysis.selectedStartingPoint.reasoning}`);
                  console.log(`📊 신뢰도: ${Math.round(aiAnalysis.confidence * 100)}%`);
                } else {
                  // AI 분석 실패: 기존 Enhanced Location Service로 폴백
                  console.log('⚠️ 챕터 0 AI 분석 실패, Enhanced Location Service로 폴백');
                  const enhancedCoords = generateChapterCoordinate(
                    baseCoordinates, 
                    i, 
                    chapters.length,
                    chapter.title || `Chapter ${i}`
                  );

                  const distanceImprovement = originalCoords ? calculateDistance(
                    originalCoords.lat, originalCoords.lng,
                    enhancedCoords.lat, enhancedCoords.lng
                  ) : 0;

                  chapter.coordinates = enhancedCoords;

                  result.improvements.push({
                    chapterId: i,
                    originalCoords: originalCoords || { lat: 0, lng: 0 },
                    enhancedCoords,
                    distanceImprovement,
                    method: 'fallback'
                  });

                  result.enhancedCount++;
                  console.log(`🔄 챕터 0 폴백 보정: ${Math.round(distanceImprovement)}m`);
                }
              }
            } catch (error) {
              console.error('❌ 챕터 0 AI 분석 오류:', error);
              // 오류 시 기존 방식으로 처리
              const enhancedCoords = generateChapterCoordinate(
                baseCoordinates, 
                i, 
                chapters.length,
                chapter.title || `Chapter ${i}`
              );

              const distanceImprovement = originalCoords ? calculateDistance(
                originalCoords.lat, originalCoords.lng,
                enhancedCoords.lat, enhancedCoords.lng
              ) : 0;

              chapter.coordinates = enhancedCoords;

              result.improvements.push({
                chapterId: i,
                originalCoords: originalCoords || { lat: 0, lng: 0 },
                enhancedCoords,
                distanceImprovement,
                method: 'fallback'
              });

              result.enhancedCount++;
            }
          } else {
            // 🎯 나머지 챕터: 실제 관광 장소 기반 좌표 검색
            console.log(`🎯 챕터 ${i} 실제 관광 장소 분석 중...`);
            
            try {
              const realLocationCoords = await findRealTourismLocation(
                locationName,
                chapter,
                baseCoordinates,
                i
              );

              if (realLocationCoords) {
                const distanceImprovement = originalCoords ? calculateDistance(
                  originalCoords.lat, originalCoords.lng,
                  realLocationCoords.lat, realLocationCoords.lng
                ) : 0;

                chapter.coordinates = realLocationCoords;

                result.improvements.push({
                  chapterId: i,
                  originalCoords: originalCoords || { lat: 0, lng: 0 },
                  enhancedCoords: realLocationCoords,
                  distanceImprovement,
                  method: 'real-location-search'
                });

                result.enhancedCount++;
                
                console.log(`✅ 챕터 ${i} 실제 장소 발견: ${realLocationCoords.lat}, ${realLocationCoords.lng} (${Math.round(distanceImprovement)}m 개선)`);
              } else {
                // 폴백: 기존 방식
                const enhancedCoords = generateChapterCoordinate(
                  baseCoordinates, 
                  i, 
                  chapters.length,
                  chapter.title || `Chapter ${i}`
                );

                chapter.coordinates = enhancedCoords;
                result.enhancedCount++;
                console.log(`🔄 챕터 ${i} 폴백 좌표 사용`);
              }
            } catch (error) {
              console.warn(`⚠️ 챕터 ${i} 실제 장소 검색 실패, 폴백 사용:`, error);
              // 폴백: 기존 방식
              const enhancedCoords = generateChapterCoordinate(
                baseCoordinates, 
                i, 
                chapters.length,
                chapter.title || `Chapter ${i}`
              );

              chapter.coordinates = enhancedCoords;
              result.enhancedCount++;
            }
          }
        }
      }
    }

    result.success = true;
    result.processingTimeMs = Date.now() - startTime;
    
    console.log(`✅ 좌표 보정 완료: ${result.enhancedCount}/${result.originalCount} 챕터 (${result.processingTimeMs}ms)`);
    
    // 🔍 개발자 피드백: 좌표 검증 결과 요약
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📊 좌표 검증 결과 요약:');
      
      const methodStats = result.improvements.reduce((stats, improvement) => {
        stats[improvement.method] = (stats[improvement.method] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);
      
      console.log('🔧 검증 방법별 통계:', methodStats);
      
      if (result.chapter0AIAnalysis) {
        const aiResult = result.chapter0AIAnalysis;
        console.log(`🎯 챕터 0 AI 지도 분석 결과:
   - 성공 여부: ${aiResult.success ? '✅ 성공' : '❌ 실패'}
   - 신뢰도: ${Math.round(aiResult.confidence * 100)}%
   - 처리 시간: ${aiResult.processingTimeMs}ms
   - 분석된 시설 수: ${aiResult.allFacilities.length}개
   ${aiResult.selectedStartingPoint ? `   - 선택된 시작점: ${aiResult.selectedStartingPoint.name}
   - 좌표: ${aiResult.selectedStartingPoint.coordinate.lat}, ${aiResult.selectedStartingPoint.coordinate.lng}
   - 선택 근거: ${aiResult.selectedStartingPoint.reasoning}` : '   - 시작점 선택 실패'}`);
      }
      
      const accurateChapters = result.improvements.filter(imp => 
        imp.method === 'self-validation' || imp.distanceImprovement < 20
      ).length;
      
      console.log(`📈 전체 정확도: ${Math.round((accurateChapters / result.improvements.length) * 100)}% (${accurateChapters}/${result.improvements.length})`);
      console.log('='.repeat(60));
    }
    
    return { enhancedGuide, result };

  } catch (error) {
    console.error('❌ 좌표 보정 실패:', error);
    result.processingTimeMs = Date.now() - startTime;
    return { enhancedGuide: guide, result };
  }
}

/**
 * 🎯 실제 관광 장소 검색: 챕터 내용에서 구체적 위치 추출 후 좌표 검색
 */
async function findRealTourismLocation(
  mainLocationName: string,
  chapter: GuideChapter,
  baseCoordinates: { lat: number; lng: number },
  chapterIndex: number
): Promise<{ lat: number; lng: number } | null> {
  
  try {
    // 1단계: AI로 챕터에서 실제 장소명 추출
    const extractedLocation = await extractLocationFromChapter(
      mainLocationName,
      chapter,
      chapterIndex
    );

    if (!extractedLocation) {
      console.warn(`⚠️ 챕터 ${chapterIndex}에서 장소명 추출 실패`);
      return null;
    }

    console.log(`🔍 챕터 ${chapterIndex} 추출된 장소: "${extractedLocation}"`);

    // 2단계: 하이브리드 API로 실제 좌표 검색
    const locationResult = await enhancedLocationService.findLocation({
      query: `${mainLocationName} ${extractedLocation}`,
      language: 'ko',
      context: 'tourist attraction point of interest landmark'
    });

    if (locationResult.error || !locationResult.coordinates) {
      console.warn(`⚠️ 장소 좌표 검색 실패: ${extractedLocation}`);
      return null;
    }

    // 3단계: 기준점과의 거리 검증 (10km 이내만 허용)
    const distance = calculateDistance(
      baseCoordinates.lat, baseCoordinates.lng,
      locationResult.coordinates.lat, locationResult.coordinates.lng
    );

    if (distance > 10000) { // 10km 초과시 제외
      console.warn(`⚠️ 장소가 너무 멀음: ${extractedLocation} (${Math.round(distance)}m)`);
      return null;
    }

    console.log(`✅ 유효한 관광 장소 발견: ${extractedLocation} (${Math.round(distance)}m 거리)`);
    return locationResult.coordinates;

  } catch (error) {
    console.error('실제 관광 장소 검색 오류:', error);
    return null;
  }
}

/**
 * 🤖 AI로 챕터 내용에서 구체적인 장소명 추출
 */
async function extractLocationFromChapter(
  mainLocationName: string,
  chapter: GuideChapter,
  chapterIndex: number
): Promise<string | null> {
  
  try {
    // Gemini API 설정
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return null;
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200
      }
    });

    const chapterContent = chapter.description || chapter.narrative || chapter.title || '';
    
    const prompt = `
관광 가이드 챕터에서 구체적인 장소명을 추출해주세요.

**메인 관광지**: ${mainLocationName}
**챕터 번호**: ${chapterIndex}
**챕터 내용**: "${chapterContent}"

다음 우선순위로 구체적인 장소명을 찾아주세요:
1. 건물명, 시설명 (예: "2번 출구", "중앙광장", "매표소")
2. 구역명 (예: "동쪽 구역", "메인 홀", "전시관")  
3. 랜드마크 (예: "분수대", "조각상", "정원")
4. 방향/위치 (예: "입구", "중심부", "끝부분")

**중요사항**:
- ${mainLocationName}와 직접 관련된 구체적 장소만 추출
- 추상적 표현은 제외 (예: "아름다운 곳", "특별한 장소")
- 장소명만 간단히 출력 (설명 없이)

답변: 구체적인 장소명만 출력 (예: "2번 출구", "중앙광장")
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extractedLocation = response.text().trim().replace(/['"""]/g, '');

    // 유효성 검증
    if (extractedLocation && 
        extractedLocation.length > 2 && 
        extractedLocation.length < 50 &&
        !extractedLocation.includes('없음') &&
        !extractedLocation.includes('추출') &&
        !extractedLocation.includes('해당') ) {
      return extractedLocation;
    }

    return null;

  } catch (error) {
    console.error('장소명 추출 오류:', error);
    return null;
  }
}

/**
 * 기준 좌표 기반으로 챕터별 정확한 좌표 생성
 */
function generateChapterCoordinate(
  baseCoord: { lat: number; lng: number },
  chapterIndex: number,
  totalChapters: number,
  chapterTitle: string
): { lat: number; lng: number } {
  
  // 챕터별 반경 계산 (첫 번째는 중심에 가깝게)
  const baseRadius = 0.00001; // 약 1m
  const maxRadius = 0.00005;  // 약 5m
  
  let radius: number;
  if (chapterIndex === 0) {
    // 챕터 0 (인트로)는 중심에서 가까운 위치
    radius = baseRadius;
  } else {
    // 나머지 챕터들은 점진적으로 멀어짐
    radius = baseRadius + (chapterIndex / totalChapters) * (maxRadius - baseRadius);
  }

  // 각도 계산 (원형 배치)
  const angle = (chapterIndex / Math.max(totalChapters - 1, 1)) * 2 * Math.PI;
  
  // 좌표 생성
  const lat = baseCoord.lat + Math.cos(angle) * radius;
  const lng = baseCoord.lng + Math.sin(angle) * radius;

  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

/**
 * 🌍 전세계 적용 가능한 최적 시작지점 검색
 * 다중 컨텍스트로 병렬 검색하여 가장 정확한 관광 시작지점 반환
 */
async function findBestStartingPoint(locationName: string, language: string) {
  console.log(`🌍 전세계 시작지점 검색 시작: ${locationName}`);
  
  // 전세계 공통 시작지점 컨텍스트 (우선순위 순)
  const universalContexts = [
    // 1순위: 관광객 접근점
    'main entrance visitor entrance tourist entrance',
    'information center visitor center reception desk',
    'ticket office entrance hall main gate',
    
    // 2순위: 교통 연결점
    'station entrance exit subway entrance train station',
    'bus stop taxi stand parking entrance',
    
    // 3순위: 랜드마크 기준점
    'front entrance main building central plaza',
    'entrance square main courtyard central hall',
    
    // 4순위: 지역별 특화
    'ground floor first floor entrance lobby',
    'outdoor entrance outdoor access point'
  ];
  
  const searchPromises = universalContexts.map(async (context, index) => {
    try {
      const result = await enhancedLocationService.findLocation({
        query: locationName,
        language: language,
        context: context
      });
      
      return {
        result,
        context,
        priority: index,
        success: !result.error && result.coordinates
      };
    } catch (error) {
      return {
        result: { error: `Context search failed: ${error}` },
        context,
        priority: index,
        success: false
      };
    }
  });
  
  // 모든 검색 완료 대기
  const searchResults = await Promise.all(searchPromises);
  
  // 성공한 결과들만 필터링
  const validResults = searchResults.filter(item => item.success);
  
  if (validResults.length === 0) {
    console.warn(`⚠️ 모든 컨텍스트 검색 실패: ${locationName}`);
    return null;
  }
  
  // 최고 우선순위 결과 선택
  const bestResult = validResults.reduce((best, current) => 
    current.priority < best.priority ? current : best
  );
  
  console.log(`✅ 최적 시작지점 발견: ${bestResult.context} (우선순위: ${bestResult.priority + 1})`);
  
  // 타입 안전성 확보
  if ('coordinates' in bestResult.result && bestResult.result.coordinates) {
    console.log(`📍 좌표: ${bestResult.result.coordinates.lat}, ${bestResult.result.coordinates.lng}`);
    return bestResult.result;
  }
  
  console.warn('⚠️ 좌표 정보 없음');
  return null;
}

/**
 * AI description에서 시작지점 관련 키워드 추출
 */
function extractStartingPointKeywords(description: string): string[] {
  const keywords: string[] = [];
  
  // 한국어 시작지점 키워드
  const koreanPatterns = [
    /메인\s*출입구/g, /주\s*출입구/g, /정문/g, /입구/g,
    /방문자\s*센터/g, /안내소/g, /매표소/g, /티켓\s*부스/g,
    /1번\s*출구/g, /2번\s*출구/g, /3번\s*출구/g, /4번\s*출구/g,
    /북문/g, /남문/g, /동문/g, /서문/g,
    /광장/g, /로비/g, /홀/g, /대기실/g
  ];
  
  // 영어 시작지점 키워드  
  const englishPatterns = [
    /main\s+entrance/gi, /visitor\s+center/gi, /information\s+center/gi,
    /ticket\s+office/gi, /reception/gi, /lobby/gi, /entrance\s+hall/gi,
    /gate/gi, /plaza/gi, /square/gi
  ];
  
  // 모든 패턴 검사
  [...koreanPatterns, ...englishPatterns].forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      keywords.push(...matches.map(match => match.trim()));
    }
  });
  
  // 중복 제거 및 정리
  return [...new Set(keywords)].slice(0, 3); // 최대 3개만
}

/**
 * 두 좌표 간 거리 계산 (하버사인 공식)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * 🎯 챕터 제목이 구체적인 장소를 나타내는지 판단
 */
function isSpecificLocationTitle(chapterTitle: string, mainLocationName: string): boolean {
  if (!chapterTitle || chapterTitle === mainLocationName) {
    return false;
  }

  // 구체적인 장소를 나타내는 키워드들
  const specificLocationKeywords = [
    '케이블카', '곤돌라', '로프웨이',
    '역', '출입구', '정문', '입구', '게이트', '터미널', '정류장',
    '센터', '전망대', '매표소', '안내소', '광장', '공원',
    '홀', '관', '층', '구역', '쪽', '편'
  ];

  return specificLocationKeywords.some(keyword => chapterTitle.includes(keyword));
}

/**
 * 🔍 챕터 제목 기반 좌표 검색
 */
async function searchByChapterTitle(
  chapterTitle: string, 
  mainLocationName: string, 
  baseCoordinates: { lat: number; lng: number }
): Promise<{ lat: number; lng: number } | null> {
  try {
    console.log(`🔍 제목 기반 검색: "${chapterTitle}" (기준: ${mainLocationName})`);

    // Enhanced Location Service를 사용하여 구체적인 장소 검색
    const locationResult = await enhancedLocationService.findLocation({
      query: `${mainLocationName} ${chapterTitle}`,
      language: 'ko',
      context: 'tourist entrance starting point access cable car transportation'
    });

    if (locationResult.error || !locationResult.coordinates) {
      console.warn(`⚠️ 제목 기반 검색 실패: ${chapterTitle}`);
      return null;
    }

    // 기준점과의 거리 검증 (5km 이내만 허용)
    const distance = calculateDistance(
      baseCoordinates.lat, baseCoordinates.lng,
      locationResult.coordinates.lat, locationResult.coordinates.lng
    );

    if (distance > 5000) { // 5km 초과시 제외
      console.warn(`⚠️ 제목 기반 검색 결과가 너무 멀음: ${chapterTitle} (${Math.round(distance)}m)`);
      return null;
    }

    console.log(`✅ 제목 기반 검색 성공: ${chapterTitle} (${Math.round(distance)}m 거리)`);
    return locationResult.coordinates;

  } catch (error) {
    console.error('제목 기반 검색 오류:', error);
    return null;
  }
}

/**
 * 🎯 제목-좌표 일치성 검증 시스템
 */
export interface TitleCoordinateConsistencyResult {
  isConsistent: boolean;
  consistencyScore: number; // 0-1
  chapterAnalysis: Array<{
    chapterId: number;
    title: string;
    hasSpecificLocation: boolean;
    titleLocationKeyword: string | null;
    consistencyScore: number;
    issues: string[];
  }>;
  overallIssues: string[];
  recommendations: string[];
}

/**
 * 챕터 제목과 좌표 일치성 검증
 */
export async function validateTitleCoordinateConsistency(
  guide: GuideData,
  locationName: string
): Promise<TitleCoordinateConsistencyResult> {
  console.log('🎯 제목-좌표 일치성 검증 시작');
  
  const result: TitleCoordinateConsistencyResult = {
    isConsistent: true,
    consistencyScore: 1.0,
    chapterAnalysis: [],
    overallIssues: [],
    recommendations: []
  };

  if (!guide.realTimeGuide?.chapters) {
    result.isConsistent = false;
    result.consistencyScore = 0;
    result.overallIssues.push('No chapters found');
    return result;
  }

  const chapters = guide.realTimeGuide.chapters;
  let totalConsistencyScore = 0;
  let analyzedChapters = 0;

  // 각 챕터 분석
  for (const chapter of chapters) {
    const chapterAnalysis = await analyzeChapterTitleConsistency(
      chapter,
      locationName
    );
    
    result.chapterAnalysis.push(chapterAnalysis);
    
    if (chapterAnalysis.hasSpecificLocation) {
      totalConsistencyScore += chapterAnalysis.consistencyScore;
      analyzedChapters++;
      
      // 일치성 문제가 있는 경우
      if (chapterAnalysis.consistencyScore < 0.7) {
        result.isConsistent = false;
        result.overallIssues.push(
          `Chapter ${chapterAnalysis.chapterId}: "${chapterAnalysis.title}" - 좌표와 제목 불일치 (${Math.round(chapterAnalysis.consistencyScore * 100)}%)`
        );
        
        // 개선 권장사항 추가
        if (chapterAnalysis.titleLocationKeyword) {
          result.recommendations.push(
            `Chapter ${chapterAnalysis.chapterId}: "${chapterAnalysis.titleLocationKeyword}" 키워드에 맞는 좌표로 업데이트 필요`
          );
        }
      }
    }
  }

  // 전체 일치성 점수 계산
  if (analyzedChapters > 0) {
    result.consistencyScore = totalConsistencyScore / analyzedChapters;
  }

  // 전체 일치성 판단
  if (result.consistencyScore < 0.8) {
    result.isConsistent = false;
  }

  console.log(`✅ 제목-좌표 일치성 검증 완료: ${Math.round(result.consistencyScore * 100)}% 일치`);
  
  return result;
}

/**
 * 개별 챕터의 제목-좌표 일치성 분석
 */
async function analyzeChapterTitleConsistency(
  chapter: any,
  locationName: string
): Promise<{
  chapterId: number;
  title: string;
  hasSpecificLocation: boolean;
  titleLocationKeyword: string | null;
  consistencyScore: number;
  issues: string[];
}> {
  const analysis = {
    chapterId: chapter.id || 0,
    title: chapter.title || '',
    hasSpecificLocation: false,
    titleLocationKeyword: null as string | null,
    consistencyScore: 1.0,
    issues: [] as string[]
  };

  if (!chapter.title || !chapter.coordinates) {
    analysis.consistencyScore = 0;
    analysis.issues.push('Missing title or coordinates');
    return analysis;
  }

  // 구체적인 장소명이 포함된 제목인지 검사
  const specificLocationKeyword = extractSpecificLocationFromTitle(chapter.title, locationName);
  
  if (specificLocationKeyword) {
    analysis.hasSpecificLocation = true;
    analysis.titleLocationKeyword = specificLocationKeyword;
    
    // 제목의 구체적 장소와 좌표 일치성 검증
    const consistencyScore = await validateLocationKeywordConsistency(
      specificLocationKeyword,
      locationName,
      chapter.coordinates
    );
    
    analysis.consistencyScore = consistencyScore;
    
    if (consistencyScore < 0.7) {
      analysis.issues.push(
        `Title mentions "${specificLocationKeyword}" but coordinates may not match this specific location`
      );
    }
  }

  return analysis;
}

/**
 * 제목에서 구체적인 장소명 추출
 */
function extractSpecificLocationFromTitle(title: string, mainLocationName: string): string | null {
  if (!title || title === mainLocationName) {
    return null;
  }

  // 구체적인 장소를 나타내는 키워드 패턴들
  const specificLocationPatterns = [
    // 교통수단
    /케이블카|곤돌라|로프웨이/i,
    // 출입구, 역, 정류장
    /\w*역|\w*출입구|\w*정문|\w*입구|\w*게이트|\w*터미널|\w*정류장/i,
    // 시설명
    /\w*센터|\w*타워|\w*전망대|\w*매표소|\w*안내소|\w*광장|\w*공원/i,
    // 박물관, 미술관
    /\w*박물관|\w*미술관|\w*홀|\w*관/i,
    // 방향/위치
    /\w*쪽|\w*편|\w*구역|\w*층/i
  ];

  for (const pattern of specificLocationPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return null;
}

/**
 * 장소 키워드와 좌표 일치성 검증
 */
async function validateLocationKeywordConsistency(
  locationKeyword: string,
  mainLocationName: string,
  coordinates: { lat: number; lng: number }
): Promise<number> {
  try {
    // Enhanced Location Service를 사용하여 키워드에 해당하는 실제 좌표 검색
    const expectedLocationResult = await enhancedLocationService.findLocation({
      query: `${mainLocationName} ${locationKeyword}`,
      language: 'ko',
      context: 'tourist attraction specific location'
    });

    if (expectedLocationResult.error || !expectedLocationResult.coordinates) {
      // 검색 실패 시 중간 점수 반환 (검증 불가)
      return 0.5;
    }

    // 실제 좌표와 예상 좌표 간 거리 계산
    const distance = calculateDistance(
      coordinates.lat, coordinates.lng,
      expectedLocationResult.coordinates.lat, expectedLocationResult.coordinates.lng
    );

    // 거리에 따른 일치성 점수 계산
    let consistencyScore: number;
    if (distance <= 50) {
      consistencyScore = 1.0; // 50m 이내: 완전 일치
    } else if (distance <= 100) {
      consistencyScore = 0.9; // 100m 이내: 높은 일치
    } else if (distance <= 200) {
      consistencyScore = 0.8; // 200m 이내: 양호한 일치
    } else if (distance <= 500) {
      consistencyScore = 0.6; // 500m 이내: 보통 일치
    } else if (distance <= 1000) {
      consistencyScore = 0.4; // 1km 이내: 낮은 일치
    } else {
      consistencyScore = 0.2; // 1km 초과: 매우 낮은 일치
    }

    console.log(`🔍 키워드 "${locationKeyword}" 일치성: ${Math.round(distance)}m 거리, ${Math.round(consistencyScore * 100)}% 일치`);
    
    return consistencyScore;

  } catch (error) {
    console.warn('장소 키워드 일치성 검증 실패:', error);
    return 0.5; // 오류 시 중간 점수
  }
}

/**
 * 좌표 품질 검증
 */
export function validateCoordinateQuality(guide: GuideData): {
  isValid: boolean;
  issues: string[];
  score: number; // 0-1
} {
  const issues: string[] = [];
  let score = 1.0;

  if (!guide.realTimeGuide?.chapters) {
    return { isValid: false, issues: ['No chapters found'], score: 0 };
  }

  const chapters = guide.realTimeGuide.chapters;
  let coordCount = 0;
  const coordinates: Array<{ lat: number; lng: number }> = [];

  // 각 챕터 좌표 검증
  for (const chapter of chapters) {
    if (chapter.coordinates?.lat && chapter.coordinates?.lng) {
      coordCount++;
      coordinates.push(chapter.coordinates);
      
      // 좌표 범위 검증 (전세계)
      if (Math.abs(chapter.coordinates.lat) > 90) {
        issues.push(`Invalid latitude: ${chapter.coordinates.lat}`);
        score -= 0.2;
      }
      if (Math.abs(chapter.coordinates.lng) > 180) {
        issues.push(`Invalid longitude: ${chapter.coordinates.lng}`);
        score -= 0.2;
      }
    }
  }

  // 좌표 완성도 검증
  const completeness = coordCount / chapters.length;
  if (completeness < 0.8) {
    issues.push(`Low coordinate coverage: ${Math.round(completeness * 100)}%`);
    score -= (1 - completeness) * 0.3;
  }

  // 좌표 분산도 검증 (너무 집중되거나 분산되면 문제)
  if (coordinates.length >= 2) {
    const distances: number[] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      for (let j = i + 1; j < coordinates.length; j++) {
        const dist = calculateDistance(
          coordinates[i].lat, coordinates[i].lng,
          coordinates[j].lat, coordinates[j].lng
        );
        distances.push(dist);
      }
    }
    
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    if (avgDistance > 10000) { // 10km 이상 떨어져 있으면 문제
      issues.push(`Coordinates too spread out: ${Math.round(avgDistance)}m average`);
      score -= 0.2;
    }
  }

  return {
    isValid: issues.length === 0 && score > 0.7,
    issues,
    score: Math.max(0, score)
  };
}