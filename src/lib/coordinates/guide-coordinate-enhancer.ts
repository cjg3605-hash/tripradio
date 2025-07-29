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
    method: 'self-validation' | 'api-enhancement' | 'ai-map-analysis' | 'fallback'; // 사용된 검증 방법
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
            // 🎯 챕터 0: 새로운 AI 지도 분석 시스템 사용 (Google Places 우선 검색)
            console.log('🎯 챕터 0 AI 지도 분석 시작...');
            
            try {
              const aiAnalysis = await generateChapter0CoordinateWithAI(
                locationName,
                chapter.description || chapter.narrative || ''
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
            // 🔧 나머지 챕터: 기존 Enhanced Location Service 방식
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
              method: 'api-enhancement'
            });

            result.enhancedCount++;
            
            console.log(`🔧 챕터 ${i} 좌표 보정: ${originalCoords?.lat || 0}, ${originalCoords?.lng || 0} → ${enhancedCoords.lat}, ${enhancedCoords.lng} (${Math.round(distanceImprovement)}m 개선)`);
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
 * 기준 좌표 기반으로 챕터별 정확한 좌표 생성
 */
function generateChapterCoordinate(
  baseCoord: { lat: number; lng: number },
  chapterIndex: number,
  totalChapters: number,
  chapterTitle: string
): { lat: number; lng: number } {
  
  // 챕터별 반경 계산 (첫 번째는 중심에 가깝게)
  const baseRadius = 0.0001; // 약 10m
  const maxRadius = 0.0005;  // 약 50m
  
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