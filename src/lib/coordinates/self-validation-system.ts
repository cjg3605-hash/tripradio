/**
 * 🎯 AI 자가검증 기반 챕터 0 좌표 정밀도 시스템
 * AI가 자신이 생성한 좌표를 Google Maps에서 직접 확인하고 10m 이내 정확도 보장
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SelfValidationResult {
  isAccurate: boolean;
  confidence: number;
  distanceFromTarget: number;
  correctedCoordinate?: { lat: number; lng: number };
  reasoning: string;
  nearestFacility?: {
    name: string;
    distance: number;
    coordinate: { lat: number; lng: number };
  };
  validationDetails: {
    totalNearbyFacilities: number;
    relevantFacilities: number;
    accuracyScore: number;
  };
}

export interface NearbyFacility {
  name: string;
  types: string[];
  coordinate: { lat: number; lng: number };
  placeId: string;
  distanceFromAI: number;
  relevanceScore: number;
}

export interface GooglePlacesResult {
  results: Array<{
    name: string;
    types: string[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
  }>;
}

/**
 * 🧠 AI 자가검증 시스템 메인 클래스
 */
export class SelfValidationSystem {
  private gemini: GoogleGenerativeAI | null = null;
  private model: any = null;
  private googleApiKey: string = '';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Gemini 초기화
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.model = this.gemini.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
          topP: 0.8
        }
      });
    }

    // Google API 키 설정
    this.googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
  }

  /**
   * 🎯 챕터 0 좌표 자가검증 메인 함수
   */
  async validateChapter0WithSelfCheck(
    locationName: string,
    aiGeneratedCoordinate: { lat: number; lng: number },
    expectedDescription: string
  ): Promise<SelfValidationResult> {
    console.log(`🎯 AI 자가검증 시작: ${locationName} at ${aiGeneratedCoordinate.lat}, ${aiGeneratedCoordinate.lng}`);

    try {
      // 1. Google Places로 주변 시설 검색
      const nearbyFacilities = await this.searchNearbyFacilities(aiGeneratedCoordinate, locationName);
      
      if (nearbyFacilities.length === 0) {
        console.warn('⚠️ 주변 시설을 찾을 수 없음');
        return {
          isAccurate: false,
          confidence: 0.1,
          distanceFromTarget: 999,
          reasoning: 'No nearby facilities found for verification',
          validationDetails: {
            totalNearbyFacilities: 0,
            relevantFacilities: 0,
            accuracyScore: 0.1
          }
        };
      }

      // 2. AI 자가분석 수행
      const analysisResult = await this.performSelfAnalysis(
        locationName,
        aiGeneratedCoordinate,
        expectedDescription,
        nearbyFacilities
      );

      // 3. 10m 정확도 검증
      const finalResult = this.validateAccuracy(analysisResult, nearbyFacilities);

      console.log(`✅ 자가검증 완료: ${finalResult.isAccurate ? '승인' : '수정 필요'} (정확도: ${Math.round(finalResult.confidence * 100)}%)`);
      
      return finalResult;

    } catch (error) {
      console.error('❌ 자가검증 실패:', error);
      return {
        isAccurate: false,
        confidence: 0,
        distanceFromTarget: 999,
        reasoning: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        validationDetails: {
          totalNearbyFacilities: 0,
          relevantFacilities: 0,
          accuracyScore: 0
        }
      };
    }
  }

  /**
   * 🔍 Google Places API로 주변 시설 검색
   */
  private async searchNearbyFacilities(
    coordinate: { lat: number; lng: number },
    locationName: string
  ): Promise<NearbyFacility[]> {
    if (!this.googleApiKey) {
      console.warn('Google API key not available, skipping nearby search');
      return [];
    }

    try {
      // 50m 반경 내 관련 시설 검색
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinate.lat},${coordinate.lng}&radius=50&type=establishment&key=${this.googleApiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data: GooglePlacesResult = await response.json();
      
      // 결과 처리 및 관련성 점수 계산
      const facilities: NearbyFacility[] = data.results.map(place => ({
        name: place.name,
        types: place.types,
        coordinate: place.geometry.location,
        placeId: place.place_id,
        distanceFromAI: this.calculateDistance(
          coordinate.lat, coordinate.lng,
          place.geometry.location.lat, place.geometry.location.lng
        ),
        relevanceScore: this.calculateRelevanceScore(place.name, place.types, locationName)
      }));

      // 거리순 정렬
      facilities.sort((a, b) => a.distanceFromAI - b.distanceFromAI);

      console.log(`🔍 주변 시설 ${facilities.length}개 발견 (50m 반경)`);
      facilities.slice(0, 5).forEach(f => {
        console.log(`   - ${f.name}: ${Math.round(f.distanceFromAI)}m (관련성: ${Math.round(f.relevanceScore * 100)}%)`);
      });

      return facilities;

    } catch (error) {
      console.error('Google Places 검색 실패:', error);
      return [];
    }
  }

  /**
   * 🧠 AI 자가분석 수행
   */
  private async performSelfAnalysis(
    locationName: string,
    aiCoordinate: { lat: number; lng: number },
    expectedDescription: string,
    nearbyFacilities: NearbyFacility[]
  ): Promise<any> {
    if (!this.model) {
      throw new Error('Gemini model not available');
    }

    const facilitiesInfo = nearbyFacilities.slice(0, 10).map(f => 
      `- ${f.name} (${f.types.slice(0, 3).join(', ')}): ${Math.round(f.distanceFromAI)}m 거리, 관련성 ${Math.round(f.relevanceScore * 100)}%`
    ).join('\n');

    const prompt = `# 🎯 AI 좌표 자가검증 분석

당신이 생성한 좌표: ${aiCoordinate.lat}, ${aiCoordinate.lng}
대상 장소: ${locationName}
예상 설명: ${expectedDescription}

## 주변 시설 분석 (50m 반경)
${facilitiesInfo}

## 분석 요청
1. 생성한 좌표가 실제 관광객 시작지점(메인 입구, 방문자센터 등)에 정확히 위치하는가?
2. 가장 가까운 관련 시설은 무엇이며, 몇 미터 떨어져 있는가?
3. 10m 이내에 적절한 관광 관련 시설이 있는가?
4. 좌표를 수정해야 한다면 어느 시설의 좌표를 사용해야 하는가?

## 분석 기준
- 관광객이 실제 도착하는 지점이 최우선
- 메인 입구, 방문자센터, 안내소, 티켓 부스 등이 이상적
- 10m 이내 정확도가 오디오 가이드에 필수

다음 JSON 형식으로 정확히 답변하세요:

{
  "isAccurate": true 또는 false,
  "confidence": 0.0-1.0 사이 신뢰도,
  "nearestRelevantFacility": "가장 관련 있는 시설명",
  "distanceToNearest": 가장 가까운 관련 시설까지 거리(미터),
  "shouldCorrect": true 또는 false,
  "correctedCoordinate": { "lat": 위도, "lng": 경도 } 또는 null,
  "reasoning": "분석 근거 설명",
  "accuracyAssessment": "정확도 평가 설명"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = await result.response.text();
      
      // JSON 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 분석 결과에서 JSON을 찾을 수 없음');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      console.log('🧠 AI 자가분석 완료:', {
        accurate: analysis.isAccurate,
        confidence: analysis.confidence,
        nearest: analysis.nearestRelevantFacility,
        distance: analysis.distanceToNearest
      });

      return analysis;

    } catch (error) {
      console.error('AI 자가분석 실패:', error);
      throw error;
    }
  }

  /**
   * ✅ 10m 정확도 검증 및 최종 결과 생성
   */
  private validateAccuracy(
    analysis: any,
    nearbyFacilities: NearbyFacility[]
  ): SelfValidationResult {
    const nearestFacility = nearbyFacilities.length > 0 ? nearbyFacilities[0] : null;
    
    // 10m 정확도 검증
    const within10m = analysis.distanceToNearest <= 10;
    const highConfidence = analysis.confidence >= 0.8;

    let finalResult: SelfValidationResult = {
      isAccurate: false,
      confidence: analysis.confidence || 0,
      distanceFromTarget: analysis.distanceToNearest || 999,
      reasoning: analysis.reasoning || 'No analysis available',
      validationDetails: {
        totalNearbyFacilities: nearbyFacilities.length,
        relevantFacilities: nearbyFacilities.filter(f => f.relevanceScore > 0.5).length,
        accuracyScore: analysis.confidence || 0
      }
    };

    if (nearestFacility) {
      finalResult.nearestFacility = {
        name: nearestFacility.name,
        distance: nearestFacility.distanceFromAI,
        coordinate: nearestFacility.coordinate
      };
    }

    // 정확도 판정 로직
    if (within10m && highConfidence) {
      // ✅ 10m 이내 + 높은 신뢰도: 승인
      finalResult.isAccurate = true;
      finalResult.reasoning += ' | 10m 이내 정확도 달성, 승인';
      
    } else if (analysis.shouldCorrect && analysis.correctedCoordinate) {
      // 🔧 수정 제안이 있는 경우
      const correctedDistance = nearestFacility ? 
        this.calculateDistance(
          analysis.correctedCoordinate.lat, analysis.correctedCoordinate.lng,
          nearestFacility.coordinate.lat, nearestFacility.coordinate.lng
        ) : 999;

      if (correctedDistance <= 10) {
        finalResult.isAccurate = true;
        finalResult.correctedCoordinate = analysis.correctedCoordinate;
        finalResult.distanceFromTarget = correctedDistance;
        finalResult.reasoning += ' | 좌표 수정으로 10m 정확도 달성';
      }
    }

    return finalResult;
  }

  /**
   * 📏 두 좌표 간 거리 계산 (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  /**
   * 🎯 시설과 대상 장소 간 관련성 점수 계산
   */
  private calculateRelevanceScore(facilityName: string, facilityTypes: string[], locationName: string): number {
    let score = 0;

    // 이름 유사성 점수 (0-0.5)
    const nameSimilarity = this.calculateStringSimilarity(
      facilityName.toLowerCase(),
      locationName.toLowerCase()
    );
    score += nameSimilarity * 0.5;

    // 시설 타입 점수 (0-0.5)
    const relevantTypes = [
      'tourist_attraction', 'point_of_interest', 'establishment',
      'museum', 'amusement_park', 'zoo', 'aquarium', 'park',
      'train_station', 'subway_station', 'transit_station'
    ];

    const typeScore = facilityTypes.some(type => relevantTypes.includes(type)) ? 0.5 : 0;
    score += typeScore;

    return Math.min(score, 1.0);
  }

  /**
   * 📝 문자열 유사성 계산 (간단한 구현)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // 포함 관계 확인
    if (longer.includes(shorter) || shorter.includes(longer)) {
      return 0.8;
    }
    
    // 단어 단위 매칭
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}

// 싱글톤 인스턴스
export const selfValidationSystem = new SelfValidationSystem();

/**
 * 🎯 편의 함수: 챕터 0 좌표 검증
 */
export async function validateChapter0Coordinate(
  locationName: string,
  aiGeneratedCoordinate: { lat: number; lng: number },
  expectedDescription: string
): Promise<SelfValidationResult> {
  return await selfValidationSystem.validateChapter0WithSelfCheck(
    locationName,
    aiGeneratedCoordinate,
    expectedDescription
  );
}