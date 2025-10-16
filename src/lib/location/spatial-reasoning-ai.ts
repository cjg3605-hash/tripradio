/**
 * 🧠 Spatial Reasoning AI
 * AI 기반 공간 추론 및 최적 좌표 선택 시스템
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SpecificStartingPoint } from './specific-starting-point-generator';
import { CoordinateCandidate } from './wikipedia-location-searcher';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PreciseLocationResult {
  coordinates: Coordinates;
  confidence: number;
  accuracy: 'high' | 'medium' | 'low';
  source: string;
  reasoning: SpatialAnalysisReasoning;
  metadata: {
    distanceFromMain: number; // 미터
    direction: string;
    expectedAccuracy: string;
    totalCandidates: number;
    processingTime: number;
    specificPoint: string;
  };
}

export interface SpatialAnalysisReasoning {
  primaryReason: string;
  spatialLogic: string;
  distanceJustification: string;
  featureAlignment: string;
  alternativeConsiderations?: string[];
}

export class SpatialReasoningAI {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache = new Map<string, PreciseLocationResult>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  private initialize() {
    if (this.model) return; // 이미 초기화됨
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, AI spatial reasoning disabled');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro', // 복잡한 공간 추론을 위해 Pro 모델 사용
      generationConfig: {
        temperature: 0.1, // 매우 일관된 결과 필요
        maxOutputTokens: 1024,
        topP: 0.8
      }
    });
  }

  /**
   * 🎯 메인 메서드: 최적 좌표 선택
   */
  async selectOptimalCoordinate(
    mainLocationCoords: Coordinates,
    candidateCoords: CoordinateCandidate[],
    specificPoint: SpecificStartingPoint,
    wikipediaContext?: any
  ): Promise<PreciseLocationResult> {
    const startTime = Date.now();

    // 런타임 초기화
    this.initialize();

    // 캐시 확인
    const cacheKey = this.generateCacheKey(mainLocationCoords, candidateCoords, specificPoint);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('💾 공간 추론 캐시 히트');
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          processingTime: Date.now() - startTime
        }
      };
    }

    // 후보가 없는 경우 폴백
    if (candidateCoords.length === 0) {
      console.log('🔄 후보 없음, 폴백 좌표 생성');
      return this.getFallbackCoordinate(mainLocationCoords, specificPoint, startTime);
    }

    try {
      // AI 분석 또는 규칙 기반 선택
      const result = this.model ? 
        await this.analyzeWithAI(mainLocationCoords, candidateCoords, specificPoint, wikipediaContext, startTime) :
        await this.analyzeWithRules(mainLocationCoords, candidateCoords, specificPoint, startTime);

      // 캐시 저장
      this.saveToCache(cacheKey, result);

      console.log('✅ 공간 추론 완료:', {
        selectedCoords: `${result.coordinates.lat}, ${result.coordinates.lng}`,
        confidence: result.confidence,
        expectedAccuracy: result.metadata.expectedAccuracy
      });

      return result;

    } catch (error) {
      console.error('❌ 공간 추론 실패, 폴백 사용:', error);
      return this.getFallbackCoordinate(mainLocationCoords, specificPoint, startTime);
    }
  }

  /**
   * 🤖 AI 기반 공간 추론
   */
  private async analyzeWithAI(
    mainLocationCoords: Coordinates,
    candidateCoords: CoordinateCandidate[],
    specificPoint: SpecificStartingPoint,
    wikipediaContext: any,
    startTime: number
  ): Promise<PreciseLocationResult> {
    const prompt = this.createSpatialAnalysisPrompt(
      mainLocationCoords,
      candidateCoords,
      specificPoint,
      wikipediaContext
    );

    try {
      console.log('🧠 AI 공간 추론 시작...');
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // JSON 응답 파싱
      const parsed = this.parseAIResponse(response);
      
      // 선택된 후보 검증
      const selectedCandidate = candidateCoords[parsed.selectedCoordinate.candidateIndex];
      if (!selectedCandidate) {
        throw new Error('잘못된 후보 인덱스');
      }

      return {
        coordinates: {
          lat: parsed.selectedCoordinate.lat,
          lng: parsed.selectedCoordinate.lng
        },
        confidence: parsed.selectedCoordinate.confidence,
        accuracy: this.determineAccuracy(parsed.selectedCoordinate.confidence),
        source: 'ai_spatial_reasoning',
        reasoning: parsed.reasoning,
        metadata: {
          distanceFromMain: parsed.metadata.distanceFromMain,
          direction: parsed.metadata.direction,
          expectedAccuracy: parsed.metadata.expectedAccuracy,
          totalCandidates: candidateCoords.length,
          processingTime: Date.now() - startTime,
          specificPoint: specificPoint.specificName
        }
      };

    } catch (error) {
      console.warn('AI 공간 추론 실패, 규칙 기반으로 폴백:', error);
      return await this.analyzeWithRules(mainLocationCoords, candidateCoords, specificPoint, startTime);
    }
  }

  /**
   * 📝 AI 공간 분석 프롬프트 생성
   */
  private createSpatialAnalysisPrompt(
    mainLocationCoords: Coordinates,
    candidateCoords: CoordinateCandidate[],
    specificPoint: SpecificStartingPoint,
    wikipediaContext?: any
  ): string {
    const contextSection = wikipediaContext ? `
## 📚 Wikipedia 컨텍스트
- 건물 배치: ${wikipediaContext.layout || '정보 없음'}
- 주요 시설: ${wikipediaContext.facilities || '정보 없음'}
- 접근 경로: ${wikipediaContext.accessRoutes || '정보 없음'}
    ` : '';

    return `
당신은 공간 분석 전문가입니다. 관광지의 구체적 시작점을 정확히 결정하세요.

## 🎯 목표 위치 분석
- **구체적 지점**: ${specificPoint.specificName}
- **예상 특징**: ${specificPoint.expectedFeatures.join(', ')}
- **상대적 위치**: ${specificPoint.relativePosition}
- **설명**: ${specificPoint.description}
- **접근성**: ${specificPoint.accessibilityNotes}

## 📍 기준점 (메인 위치)
**좌표**: ${mainLocationCoords.lat}, ${mainLocationCoords.lng}

## 🔍 후보 좌표들 세부 분석
${candidateCoords.map((coord, i) => {
  const distance = this.calculateDistance(mainLocationCoords, coord);
  const direction = this.getDirection(mainLocationCoords, coord);
  
  return `
**후보 ${i}** (인덱스: ${i}):
- 좌표: ${coord.lat}, ${coord.lng}
- 이름: ${coord.name}
- 출처: ${coord.source}
- 타입: ${coord.type}
- 신뢰도: ${coord.confidence}
- 메인으로부터: ${distance.toFixed(0)}m 떨어진 ${direction}
- 메타데이터: ${JSON.stringify(coord.metadata || {}, null, 2)}
  `;
}).join('\n')}

${contextSection}

## 🧠 공간 분석 기준
1. **위치적 논리성**: 각 후보가 "${specificPoint.specificName}"이라는 목표와 얼마나 논리적으로 일치하는가?
2. **거리 적합성**: 메인 위치로부터의 거리가 "${specificPoint.relativePosition}" 설명과 부합하는가?
3. **특징 일치도**: 후보의 이름/타입이 예상 특징 "${specificPoint.expectedFeatures.join(', ')}"과 얼마나 일치하는가?
4. **접근성 고려**: 관광객이 시작점으로 사용하기에 적합한 위치인가?
5. **신뢰도 가중**: 출처의 신뢰도(wikipedia vs wikidata)와 메타데이터 품질

## 📝 **반드시 JSON 형태로만** 응답하세요
{
  "selectedCoordinate": {
    "lat": 선택된_위도,
    "lng": 선택된_경도,
    "confidence": 0.90,
    "candidateIndex": 선택된_후보_번호
  },
  "reasoning": {
    "primaryReason": "선택한 주요 이유 (한 문장)",
    "spatialLogic": "공간적 논리성 설명",
    "distanceJustification": "거리 적합성 설명",
    "featureAlignment": "특징 일치도 평가",
    "alternativeConsiderations": ["고려했던 다른 옵션들과 배제 이유"]
  },
  "metadata": {
    "distanceFromMain": 거리_미터_숫자,
    "direction": "방향_설명",
    "expectedAccuracy": "예상_오차_범위_문자열"
  }
}

## 💡 결정 가이드라인
- 거리: 보통 관광지 시작점은 메인 건물로부터 50-200m 이내
- 특징 매칭: 이름에 "매표소", "입구", "센터" 등 키워드 포함 시 높은 점수
- 출처 신뢰도: wikidata > wikipedia > 기타 순서
- 접근성: 주차장이나 대중교통에서 가까운 지점 우선

가장 적합한 후보를 **반드시 하나만** 선택하고 상세한 분석을 JSON으로 제공하세요.
    `;
  }

  /**
   * 📊 규칙 기반 분석 (AI 폴백)
   */
  private async analyzeWithRules(
    mainLocationCoords: Coordinates,
    candidateCoords: CoordinateCandidate[],
    specificPoint: SpecificStartingPoint,
    startTime: number
  ): Promise<PreciseLocationResult> {
    console.log('📊 규칙 기반 공간 분석 시작...');

    // 1. 각 후보에 대해 점수 계산
    const scoredCandidates = candidateCoords.map((candidate, index) => ({
      ...candidate,
      index,
      totalScore: this.calculateRuleBasedScore(candidate, mainLocationCoords, specificPoint)
    }));

    // 2. 최고 점수 후보 선택
    const bestCandidate = scoredCandidates.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    );

    // 3. 결과 구성
    const distance = this.calculateDistance(mainLocationCoords, bestCandidate);
    const direction = this.getDirection(mainLocationCoords, bestCandidate);

    return {
      coordinates: {
        lat: bestCandidate.lat,
        lng: bestCandidate.lng
      },
      confidence: Math.min(bestCandidate.totalScore, 0.9), // 규칙 기반은 최대 0.9
      accuracy: this.determineAccuracy(bestCandidate.totalScore),
      source: 'rule_based_analysis',
      reasoning: {
        primaryReason: `가장 높은 종합 점수 (${bestCandidate.totalScore.toFixed(2)})를 받은 후보`,
        spatialLogic: `메인 위치로부터 ${distance.toFixed(0)}m 떨어진 적절한 거리`,
        distanceJustification: `${direction} 방향으로 일반적인 시작점 범위 내 위치`,
        featureAlignment: `이름 "${bestCandidate.name}"이 목표 지점과 유사성 보임`
      },
      metadata: {
        distanceFromMain: distance,
        direction,
        expectedAccuracy: distance < 50 ? '10-15m' : distance < 100 ? '15-25m' : '25-50m',
        totalCandidates: candidateCoords.length,
        processingTime: Date.now() - startTime,
        specificPoint: specificPoint.specificName
      }
    };
  }

  /**
   * 📊 규칙 기반 점수 계산
   */
  private calculateRuleBasedScore(
    candidate: CoordinateCandidate,
    mainCoords: Coordinates,
    specificPoint: SpecificStartingPoint
  ): number {
    let score = 0;

    // 1. 기본 신뢰도 (30%)
    score += candidate.confidence * 0.3;

    // 2. 거리 적합성 (25%)
    const distance = this.calculateDistance(mainCoords, candidate);
    const distanceScore = this.calculateDistanceScore(distance);
    score += distanceScore * 0.25;

    // 3. 이름 유사성 (25%)
    const nameScore = this.calculateNameSimilarity(candidate.name, specificPoint.specificName);
    score += nameScore * 0.25;

    // 4. 타입 일치도 (20%)
    const typeScore = this.calculateTypeAlignment(candidate.type, specificPoint.type);
    score += typeScore * 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * 📏 거리 점수 계산
   */
  private calculateDistanceScore(distance: number): number {
    if (distance <= 50) return 1.0;      // 50m 이내: 완벽
    if (distance <= 100) return 0.8;     // 100m 이내: 좋음
    if (distance <= 200) return 0.6;     // 200m 이내: 보통
    if (distance <= 500) return 0.4;     // 500m 이내: 나쁨
    return 0.2;                          // 500m 초과: 매우 나쁨
  }

  /**
   * 📝 이름 유사성 계산
   */
  private calculateNameSimilarity(candidateName: string, targetName: string): number {
    const candidate = candidateName.toLowerCase();
    const target = targetName.toLowerCase();

    // 완전 포함
    if (candidate.includes(target) || target.includes(candidate)) return 1.0;

    // 키워드 매칭
    const targetKeywords = ['매표소', '입구', '센터', 'ticket', 'entrance', 'center', 'gate'];
    const candidateKeywords = ['매표소', '입구', '센터', 'ticket', 'entrance', 'center', 'gate'];
    
    let keywordMatches = 0;
    for (const keyword of targetKeywords) {
      if (candidate.includes(keyword)) keywordMatches++;
    }
    for (const keyword of candidateKeywords) {
      if (target.includes(keyword)) keywordMatches++;
    }

    if (keywordMatches > 0) return Math.min(keywordMatches * 0.3, 0.8);

    // 단어 겹침
    const candidateWords = candidate.split(/\s+/);
    const targetWords = target.split(/\s+/);
    const commonWords = candidateWords.filter(word => targetWords.includes(word));
    
    return commonWords.length / Math.max(candidateWords.length, targetWords.length);
  }

  /**
   * 🏷️ 타입 일치도 계산
   */
  private calculateTypeAlignment(candidateType: string, targetType: string): number {
    if (candidateType === targetType) return 1.0;

    // 관련 타입 매핑
    const typeRelations: Record<string, string[]> = {
      'ticket_booth': ['facility', 'building'],
      'entrance_gate': ['entrance', 'gate'],
      'main_building_entrance': ['building', 'entrance'],
      'information_center': ['facility', 'building'],
      'courtyard_center': ['facility'],
      'parking_area': ['facility']
    };

    const relatedTypes = typeRelations[targetType] || [];
    return relatedTypes.includes(candidateType) ? 0.7 : 0.3;
  }

  /**
   * 🔄 폴백 좌표 생성
   */
  private getFallbackCoordinate(
    mainLocationCoords: Coordinates,
    specificPoint: SpecificStartingPoint,
    startTime: number
  ): PreciseLocationResult {
    console.log('🔄 폴백 좌표 생성');

    // 메인 좌표에서 약간 오프셋된 좌표 생성 (입구 추정)
    const offsetCoords = {
      lat: mainLocationCoords.lat + (Math.random() - 0.5) * 0.001, // 약 50-100m 오프셋
      lng: mainLocationCoords.lng + (Math.random() - 0.5) * 0.001
    };

    return {
      coordinates: offsetCoords,
      confidence: 0.5, // 낮은 신뢰도
      accuracy: 'low',
      source: 'fallback_generation',
      reasoning: {
        primaryReason: '후보가 없어 메인 좌표 기반 추정',
        spatialLogic: '메인 건물 주변 일반적인 입구 위치로 추정',
        distanceJustification: '50-100m 반경 내 임의 생성',
        featureAlignment: '실제 특징 검증 불가'
      },
      metadata: {
        distanceFromMain: 75, // 추정값
        direction: '추정 위치',
        expectedAccuracy: '50-100m',
        totalCandidates: 0,
        processingTime: Date.now() - startTime,
        specificPoint: specificPoint.specificName
      }
    };
  }

  /**
   * 🔍 AI 응답 파싱
   */
  private parseAIResponse(response: string): any {
    try {
      // JSON 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식이 아님');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // 필수 필드 검증
      if (!parsed.selectedCoordinate || 
          typeof parsed.selectedCoordinate.candidateIndex !== 'number') {
        throw new Error('필수 필드 누락');
      }
      
      return parsed;
      
    } catch (error) {
      console.warn('AI 응답 파싱 실패:', error);
      throw error;
    }
  }

  /**
   * 🧮 헬퍼 메서드들
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private getDirection(from: Coordinates, to: Coordinates): string {
    const dLat = to.lat - from.lat;
    const dLng = to.lng - from.lng;
    
    const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
    
    if (angle >= -22.5 && angle < 22.5) return '북쪽';
    if (angle >= 22.5 && angle < 67.5) return '북동쪽';
    if (angle >= 67.5 && angle < 112.5) return '동쪽';
    if (angle >= 112.5 && angle < 157.5) return '남동쪽';
    if (angle >= 157.5 || angle < -157.5) return '남쪽';
    if (angle >= -157.5 && angle < -112.5) return '남서쪽';
    if (angle >= -112.5 && angle < -67.5) return '서쪽';
    return '북서쪽';
  }

  private determineAccuracy(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * 💾 캐시 관리
   */
  private generateCacheKey(
    mainCoords: Coordinates,
    candidates: CoordinateCandidate[],
    specificPoint: SpecificStartingPoint
  ): string {
    const coordsHash = `${mainCoords.lat.toFixed(4)}_${mainCoords.lng.toFixed(4)}`;
    const candidatesHash = candidates.map(c => `${c.lat.toFixed(4)}_${c.lng.toFixed(4)}`).join('|');
    return `spatial:${coordsHash}:${specificPoint.specificName}:${candidatesHash.substring(0, 50)}`;
  }

  private getFromCache(key: string): PreciseLocationResult | null {
    const cached = this.cache.get(key) as any;
    if (cached && cached._timestamp && 
        Date.now() - cached._timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private saveToCache(key: string, data: PreciseLocationResult): void {
    this.cache.set(key, {
      data,
      _timestamp: Date.now()
    } as any);
  }

  /**
   * 📊 통계 및 관리
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).slice(0, 5) // 처음 5개만
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ 공간 추론 캐시 클리어됨');
  }
}

// 싱글톤 인스턴스
export const spatialReasoningAI = new SpatialReasoningAI();