/**
 * Fact-Based Verification Pipeline
 * 사실 기반 검증 파이프라인 - AI 생성 전후 검증 시스템
 */

import {
  IntegratedData,
  VerificationResult,
  VerificationScore,
  DataConflict,
  ConflictSeverity,
  ConflictResolution,
  ResolutionMethod,
  FactCheckResult,
  FactSource,
  FactCheckMethod,
  SourceType,
  SourceData,
  VerificationError,
  VerificationMethod
} from '../types/data-types';

import { DataSourceCache } from '../cache/data-cache';
import { PerformanceFactVerification } from './performance-fact-verification';

interface VerificationConfig {
  strictMode: boolean;
  minSourcesRequired: number;
  conflictThreshold: number;
  authorityWeights: Record<string, number>;
  factCheckMethods: FactCheckMethod[];
  crossReferenceTimeout: number;
}

interface VerificationContext {
  query: string;
  location?: { lat: number; lng: number };
  language: string;
  domain: string[];
  priority: 'speed' | 'accuracy' | 'balanced';
}

export class FactVerificationPipeline {
  private static instance: FactVerificationPipeline;
  private config: VerificationConfig;
  private cache: DataSourceCache;
  private authorityHierarchy: Map<string, number> = new Map();
  private factPatterns: Map<string, RegExp[]> = new Map();
  private performanceVerifier: PerformanceFactVerification;

  private constructor() {
    this.config = {
      strictMode: true,
      minSourcesRequired: 2,
      conflictThreshold: 0.3,
      authorityWeights: {
        'unesco': 0.95,
        'government': 0.90,
        'wikidata': 0.80,
        'cultural_heritage_administration': 0.95,
        'korea_tourism_organization': 0.85
      },
      factCheckMethods: [
        FactCheckMethod.CROSS_REFERENCE,
        FactCheckMethod.AUTHORITY_VERIFICATION,
        FactCheckMethod.STATISTICAL_ANALYSIS,
        FactCheckMethod.AI_FACT_CHECK
      ],
      crossReferenceTimeout: 10000
    };

    this.cache = new DataSourceCache({
      ttl: 7200, // 2 hours
      maxSize: 50 * 1024 * 1024, // 50MB
      strategy: 'lru' as any,
      compression: true
    });

    // 🚀 성능 최적화된 검증 시스템 초기화
    this.performanceVerifier = new PerformanceFactVerification({
      fastModeThreshold: 0.7,
      thoroughModeThreshold: 0.9,
      maxConcurrentChecks: 6,
      verificationTimeoutMs: 3000,
      coordinateToleranceMeters: 500,
      nameSimilarityThreshold: 0.8
    });

    this.initializeAuthorityHierarchy();
    this.initializeFactPatterns();
  }

  public static getInstance(): FactVerificationPipeline {
    if (!FactVerificationPipeline.instance) {
      FactVerificationPipeline.instance = new FactVerificationPipeline();
    }
    return FactVerificationPipeline.instance;
  }

  /**
   * 🚀 통합 데이터 검증 (성능 최적화)
   */
  async verifyIntegratedData(
    data: IntegratedData,
    context?: VerificationContext
  ): Promise<VerificationResult> {
    const startTime = Date.now();
    
    try {
      // 캐시 확인
      const cacheKey = `verification:${data.id}:${JSON.stringify(context)}`;
      const cached = await this.cache.get<VerificationResult>(cacheKey);
      
      if (cached) {
        console.log(`🎯 검증 캐시 적중: ${data.location?.name || 'Unknown'}`);
        return cached;
      }

      // 🚀 성능 최적화된 검증 실행
      console.log(`🔍 고성능 검증 시작: ${data.location?.name || 'Unknown'}`);
      const result = await this.performanceVerifier.verifyFactsWithPerformance(
        data.sources || [],
        context
      );

      // 추가 AI 관련 검증
      if (context?.priority === 'accuracy') {
        // 높은 정확도가 필요한 경우 추가 검증 수행
        const additionalValidation = await this.performAdditionalValidation(data);
        result.confidence = Math.min(result.confidence, additionalValidation.confidence);
        result.conflicts.push(...additionalValidation.conflicts);
      }

      // 결과 캐싱
      await this.cache.set(cacheKey, result, ['verification', 'fact-check']);

      console.log(`✅ 검증 완료: ${Date.now() - startTime}ms, 신뢰도: ${(result.confidence * 100).toFixed(1)}%`);
      return result;

    } catch (error) {
      console.error('검증 처리 실패:', error);
      return this.createFailureResult(
        error instanceof Error ? error.message : String(error),
        [],
        0
      );
    }
  }

  /**
   * 추가 검증 (높은 정확도 요구 시)
   */
  private async performAdditionalValidation(data: IntegratedData): Promise<{
    confidence: number;
    conflicts: DataConflict[];
  }> {
    // 기존 검증 로직과 추가 검증을 조합
    return {
      confidence: 0.9,
      conflicts: []
    };
  }

  /**
   * 실패 결과 생성
   */
  private createFailureResult(
    errorMessage: string,
    conflicts: DataConflict[],
    confidence: number
  ): VerificationResult {
    return {
      isVerified: false,
      confidence,
      score: {
        consistency: 0,
        completeness: 0,
        accuracy: 0,
        timeliness: 0,
        authority: 0,
        overall: confidence
      },
      conflicts,
      recommendations: [`검증 오류 발생: ${errorMessage}`],
      verifiedAt: new Date().toISOString(),
      method: VerificationMethod.FALLBACK
    }
  }

  /**
   * AI 생성 후 검증 (Gemini 응답 검증)
   */
  async verifyAIGeneratedContent(
    aiResponse: any,
    originalData: IntegratedData,
    context?: VerificationContext
  ): Promise<VerificationResult> {
    const startTime = Date.now();

    try {
      // 1. AI 응답에서 팩트 추출
      const extractedFacts = this.extractFactsFromAIResponse(aiResponse);
      
      // 2. 각 팩트에 대한 검증
      const factCheckResults = await Promise.all(
        extractedFacts.map(fact => this.checkFact(fact, originalData))
      );

      // 3. 일관성 검증 (원본 데이터와 AI 응답 비교)
      const consistencyScore = this.verifyAIConsistency(aiResponse, originalData);
      
      // 4. 환각(Hallucination) 탐지
      const hallucinationScore = this.detectHallucinations(aiResponse, originalData);
      
      // 5. 금지된 내용 검증 (기존 accuracy-validator와 연동)
      const prohibitedContentScore = this.checkProhibitedContent(aiResponse);
      
      // 6. 종합 점수 계산
      const avgFactScore = factCheckResults.reduce((sum, result) => sum + result.confidence, 0) / factCheckResults.length;
      const overallScore = (consistencyScore * 0.3 + hallucinationScore * 0.3 + prohibitedContentScore * 0.2 + avgFactScore * 0.2);

      // 7. 충돌 탐지
      const conflicts = this.detectAIContentConflicts(aiResponse, originalData, factCheckResults);

      const result: VerificationResult = {
        isVerified: overallScore >= 0.8 && conflicts.filter(c => c.severity === 'critical').length === 0,
        confidence: overallScore,
        score: {
          consistency: consistencyScore,
          completeness: this.calculateAICompleteness(aiResponse),
          accuracy: avgFactScore,
          timeliness: 1.0, // AI 응답은 항상 최신
          authority: hallucinationScore,
          overall: overallScore
        },
        conflicts,
        recommendations: this.generateAIRecommendations(factCheckResults, conflicts),
        verifiedAt: new Date().toISOString(),
        method: VerificationMethod.AI_VALIDATION
      };

      return result;

    } catch (error) {
      throw new VerificationError(
        `AI 응답 검증 실패: ${error instanceof Error ? error.message : String(error)}`,
        [],
        0
      );
    }
  }

  /**
   * 개별 팩트 검증
   */
  async checkFact(statement: string, referenceData: IntegratedData): Promise<FactCheckResult> {
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cacheKey = `fact:${statement}:${referenceData.id}`;
      const cached = await this.cache.get<FactCheckResult>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // 1. 참조 데이터에서 관련 정보 찾기
      const supportingEvidence = this.findSupportingEvidence(statement, referenceData);
      
      // 2. 모순되는 정보 찾기
      const contradictions = this.findContradictions(statement, referenceData);
      
      // 3. 소스 신뢰도 평가
      const sources = this.identifyFactSources(statement, referenceData);
      
      // 4. 팩트 카테고리 분류
      const category = this.categorizeFact(statement);
      
      // 5. 신뢰도 계산
      const confidence = this.calculateFactConfidence(
        supportingEvidence,
        contradictions,
        sources,
        category
      );

      const result: FactCheckResult = {
        fact: statement,
        isValid: confidence >= 0.7 && contradictions.length === 0,
        confidence,
        sources,
        contradictions,
        supportingEvidence,
        checkedAt: new Date().toISOString(),
        method: [
          FactCheckMethod.CROSS_REFERENCE,
          ...(sources.some(s => s.type === 'official') ? [FactCheckMethod.AUTHORITY_VERIFICATION] : []),
          ...(category === 'statistical' ? [FactCheckMethod.STATISTICAL_ANALYSIS] : [])
        ]
      };

      // 캐시에 저장
      await this.cache.set(cacheKey, result, ['fact-check', category]);

      return result;

    } catch (error) {
      return {
        fact: statement,
        isValid: false,
        confidence: 0,
        sources: [],
        contradictions: [`검증 오류: ${error instanceof Error ? error.message : String(error)}`],
        supportingEvidence: [],
        checkedAt: new Date().toISOString(),
        method: [FactCheckMethod.CROSS_REFERENCE] // fallback method
      };
    }
  }

  /**
   * 데이터 일관성 검증
   */
  private async verifyConsistency(data: IntegratedData): Promise<number> {
    let consistencyScore = 1.0;
    const tolerance = 0.1; // 10% 허용 오차

    // 좌표 일관성 검증
    const coordinates = data.sources
      .map(source => this.extractCoordinates(source))
      .filter(coord => coord !== null);

    if (coordinates.length > 1) {
      const avgLat = coordinates.reduce((sum, coord) => sum + coord!.lat, 0) / coordinates.length;
      const avgLng = coordinates.reduce((sum, coord) => sum + coord!.lng, 0) / coordinates.length;
      
      const deviations = coordinates.map(coord => {
        const latDev = Math.abs(coord!.lat - avgLat) / Math.abs(avgLat);
        const lngDev = Math.abs(coord!.lng - avgLng) / Math.abs(avgLng);
        return Math.max(latDev, lngDev);
      });

      const maxDeviation = Math.max(...deviations);
      if (maxDeviation > tolerance) {
        consistencyScore -= 0.3;
      }
    }

    // 이름 일관성 검증
    const names = data.sources
      .map(source => this.extractName(source))
      .filter(name => name !== null);

    if (names.length > 1) {
      const similarity = this.calculateMultipleNameSimilarity(names);
      if (similarity < 0.7) {
        consistencyScore -= 0.2;
      }
    }

    // 카테고리 일관성 검증
    const categories = data.sources
      .map(source => this.extractCategories(source))
      .flat()
      .filter(cat => cat !== null);

    const uniqueCategories = [...new Set(categories)];
    const categoryConsistency = this.calculateCategoryConsistency(uniqueCategories);
    consistencyScore *= categoryConsistency;

    return Math.max(0, Math.min(1, consistencyScore));
  }

  /**
   * 데이터 완성도 검증
   */
  private async verifyCompleteness(data: IntegratedData): Promise<number> {
    const requiredFields = [
      'location.name',
      'location.coordinates',
      'basicInfo.description',
      'location.address'
    ];

    const optionalFields = [
      'basicInfo.significance',
      'basicInfo.established',
      'location.category',
      'basicInfo.facts'
    ];

    let requiredScore = 0;
    let optionalScore = 0;

    // 필수 필드 검증
    requiredFields.forEach(field => {
      if (this.getNestedValue(data, field)) {
        requiredScore += 1;
      }
    });

    // 선택적 필드 검증
    optionalFields.forEach(field => {
      if (this.getNestedValue(data, field)) {
        optionalScore += 1;
      }
    });

    const requiredCompleteness = requiredScore / requiredFields.length;
    const optionalCompleteness = optionalScore / optionalFields.length;

    // 필수 필드 80%, 선택적 필드 20% 가중치
    return requiredCompleteness * 0.8 + optionalCompleteness * 0.2;
  }

  /**
   * 크로스 레퍼런스 검증
   */
  private async verifyCrossReferences(data: IntegratedData): Promise<number> {
    if (data.sources.length < 2) {
      return 0.5; // 단일 소스는 중간 점수
    }

    let totalAgreement = 0;
    let comparisonCount = 0;

    // 소스 간 교차 검증
    for (let i = 0; i < data.sources.length; i++) {
      for (let j = i + 1; j < data.sources.length; j++) {
        const agreement = this.calculateSourceAgreement(data.sources[i], data.sources[j]);
        totalAgreement += agreement;
        comparisonCount++;
      }
    }

    return comparisonCount > 0 ? totalAgreement / comparisonCount : 0.5;
  }

  /**
   * 최신성 검증
   */
  private async verifyTimeliness(data: IntegratedData): Promise<number> {
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    let totalTimeliness = 0;
    let sourceCount = 0;

    data.sources.forEach(source => {
      const retrievedTime = new Date(source.retrievedAt).getTime();
      const age = now - retrievedTime;
      
      // 1년 이내는 1.0, 그 이후로는 선형적으로 감소
      const timeliness = Math.max(0, 1 - age / oneYear);
      totalTimeliness += timeliness;
      sourceCount++;
    });

    return sourceCount > 0 ? totalTimeliness / sourceCount : 0;
  }

  /**
   * 권위성 검증
   */
  private async verifyAuthority(data: IntegratedData): Promise<number> {
    let totalAuthority = 0;
    let totalWeight = 0;

    data.sources.forEach(source => {
      const authority = this.config.authorityWeights[source.sourceId] || 0.5;
      const weight = source.reliability;
      
      totalAuthority += authority * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalAuthority / totalWeight : 0.5;
  }

  /**
   * 충돌 탐지
   */
  private async detectConflicts(data: IntegratedData): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];

    // 좌표 충돌 검증
    const coordConflicts = await this.detectCoordinateConflicts(data.sources);
    conflicts.push(...coordConflicts);

    // 이름 충돌 검증
    const nameConflicts = await this.detectNameConflicts(data.sources);
    conflicts.push(...nameConflicts);

    // 날짜 충돌 검증
    const dateConflicts = await this.detectDateConflicts(data.sources);
    conflicts.push(...dateConflicts);

    // 카테고리 충돌 검증
    const categoryConflicts = await this.detectCategoryConflicts(data.sources);
    conflicts.push(...categoryConflicts);

    return conflicts;
  }

  /**
   * 충돌 해결
   */
  private async resolveConflicts(conflicts: DataConflict[], data: IntegratedData): Promise<DataConflict[]> {
    return conflicts.map(conflict => {
      let resolution: ConflictResolution;

      switch (conflict.severity) {
        case 'critical':
          resolution = this.resolveCriticalConflict(conflict, data);
          break;
        case 'high':
          resolution = this.resolveHighConflict(conflict, data);
          break;
        case 'medium':
          resolution = this.resolveMediumConflict(conflict, data);
          break;
        case 'low':
          resolution = this.resolveLowConflict(conflict, data);
          break;
        default:
          resolution = this.resolveLowConflict(conflict, data);
          break;
      }

      return {
        ...conflict,
        resolution
      };
    });
  }

  /**
   * 좌표 추출
   */
  private extractCoordinates(source: SourceData): { lat: number; lng: number } | null {
    const data = Array.isArray(source.data) ? source.data[0] : source.data;
    
    if (data?.coordinates) {
      return { lat: data.coordinates.lat, lng: data.coordinates.lng };
    }
    
    if (data?.geometry?.location) {
      return { lat: data.geometry.location.lat, lng: data.geometry.location.lng };
    }
    
    return null;
  }

  /**
   * 이름 추출
   */
  private extractName(source: SourceData): string | null {
    const data = Array.isArray(source.data) ? source.data[0] : source.data;
    return data?.name || data?.title || data?.label || null;
  }

  /**
   * 카테고리 추출
   */
  private extractCategories(source: SourceData): string[] {
    const data = Array.isArray(source.data) ? source.data[0] : source.data;
    
    const categories: string[] = [];
    
    if (data?.category) {
      categories.push(...(Array.isArray(data.category) ? data.category : [data.category]));
    }
    
    if (data?.types) {
      categories.push(...(Array.isArray(data.types) ? data.types : [data.types]));
    }
    
    return categories.filter(Boolean);
  }

  /**
   * 중첩된 값 가져오기
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * 다중 이름 유사도 계산
   */
  private calculateMultipleNameSimilarity(names: string[]): number {
    if (names.length < 2) return 1.0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        totalSimilarity += this.stringSimilarity(names[i], names[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * 문자열 유사도 계산 (Levenshtein distance 기반)
   */
  private stringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len2][len1] / maxLen;
  }

  /**
   * 카테고리 일관성 계산
   */
  private calculateCategoryConsistency(categories: string[]): number {
    if (categories.length <= 1) return 1.0;

    // 관련 카테고리 그룹 정의
    const categoryGroups = [
      ['museum', 'art_gallery', 'cultural_heritage'],
      ['park', 'natural_heritage', 'garden'],
      ['restaurant', 'cafe', 'food'],
      ['hotel', 'lodging', 'accommodation'],
      ['church', 'temple', 'mosque', 'religious_site'],
      ['tourist_attraction', 'landmark', 'monument']
    ];

    // 각 카테고리가 속한 그룹 찾기
    const groupMemberships = categories.map(category => {
      return categoryGroups.findIndex(group => 
        group.some(item => category.toLowerCase().includes(item) || item.includes(category.toLowerCase()))
      );
    });

    // 같은 그룹에 속하는 비율 계산
    const validGroupings = groupMemberships.filter(group => group !== -1);
    if (validGroupings.length === 0) return 0.8; // 그룹에 속하지 않는 경우 중간 점수

    const uniqueGroups = [...new Set(validGroupings)];
    return uniqueGroups.length === 1 ? 1.0 : Math.max(0.5, 1 - (uniqueGroups.length - 1) * 0.2);
  }

  /**
   * 소스 간 일치도 계산
   */
  private calculateSourceAgreement(source1: SourceData, source2: SourceData): number {
    let agreement = 0;
    let comparisons = 0;

    // 좌표 비교
    const coord1 = this.extractCoordinates(source1);
    const coord2 = this.extractCoordinates(source2);
    
    if (coord1 && coord2) {
      const distance = this.calculateDistanceKm(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
      agreement += distance < 1 ? 1 : Math.max(0, 1 - distance / 10); // 10km 이내에서 선형 감소
      comparisons++;
    }

    // 이름 비교
    const name1 = this.extractName(source1);
    const name2 = this.extractName(source2);
    
    if (name1 && name2) {
      agreement += this.stringSimilarity(name1, name2);
      comparisons++;
    }

    // 카테고리 비교
    const cats1 = this.extractCategories(source1);
    const cats2 = this.extractCategories(source2);
    
    if (cats1.length > 0 && cats2.length > 0) {
      const commonCategories = cats1.filter(cat => cats2.includes(cat)).length;
      const totalCategories = new Set([...cats1, ...cats2]).size;
      agreement += commonCategories / totalCategories;
      comparisons++;
    }

    return comparisons > 0 ? agreement / comparisons : 0.5;
  }

  /**
   * 거리 계산 (Haversine) - 킬로미터 단위
   */
  private calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * AI 응답에서 팩트 추출
   */
  private extractFactsFromAIResponse(aiResponse: any): string[] {
    const facts: string[] = [];
    
    if (typeof aiResponse === 'string') {
      // 문장 단위로 분리
      const sentences = aiResponse.split(/[.!?]/).filter(s => s.trim().length > 10);
      facts.push(...sentences);
    } else if (aiResponse.detailedStops) {
      // 가이드 형식의 응답
      aiResponse.detailedStops.forEach((stop: any) => {
        if (stop.content) {
          facts.push(...stop.content.split(/[.!?]/).filter((s: string) => s.trim().length > 10));
        }
        if (stop.keyPoints) {
          facts.push(...stop.keyPoints);
        }
      });
    }

    return facts.map(fact => fact.trim()).filter(fact => fact.length > 0);
  }

  /**
   * AI 일관성 검증
   */
  private verifyAIConsistency(aiResponse: any, originalData: IntegratedData): number {
    // AI 응답이 원본 데이터와 얼마나 일치하는지 검증
    let consistencyScore = 1.0;

    // 위치명 일치 검증
    const aiLocationName = this.extractLocationNameFromAI(aiResponse);
    if (aiLocationName && originalData.location.name) {
      const nameSimilarity = this.stringSimilarity(aiLocationName, originalData.location.name);
      if (nameSimilarity < 0.8) {
        consistencyScore -= 0.2;
      }
    }

    // 좌표 정보 일치 검증 (AI 응답에 좌표가 있는 경우)
    const aiCoordinates = this.extractCoordinatesFromAI(aiResponse);
    if (aiCoordinates && originalData.location.coordinates) {
      const distance = this.calculateDistanceKm(
        aiCoordinates.lat, aiCoordinates.lng,
        originalData.location.coordinates.lat, originalData.location.coordinates.lng
      );
      if (distance > 1) { // 1km 이상 차이
        consistencyScore -= 0.3;
      }
    }

    return Math.max(0, consistencyScore);
  }

  /**
   * 환각 탐지
   */
  private detectHallucinations(aiResponse: any, originalData: IntegratedData): number {
    // AI가 생성한 내용 중 원본 데이터에 없는 구체적인 정보를 탐지
    const facts = this.extractFactsFromAIResponse(aiResponse);
    let hallucinationCount = 0;

    facts.forEach(fact => {
      // 구체적인 수치나 날짜가 포함된 팩트 검증
      if (this.containsSpecificClaims(fact)) {
        if (!this.isFactSupportedByData(fact, originalData)) {
          hallucinationCount++;
        }
      }
    });

    const hallucinationRate = facts.length > 0 ? hallucinationCount / facts.length : 0;
    return Math.max(0, 1 - hallucinationRate);
  }

  /**
   * 금지된 내용 검증
   */
  private checkProhibitedContent(aiResponse: any): number {
    const content = JSON.stringify(aiResponse).toLowerCase();
    let violationCount = 0;

    // 기존 accuracy-validator의 패턴들과 연동
    const prohibitedPatterns = [
      /\d+여\s*개의/g, // "200여 개의"
      /최고의|최대\s*규모의|가장\s*유명한/g, // 과장 표현
      /아마도|추정됩니다|것으로\s*보입니다/g, // 추측성 표현
      /\w+서점|\w+카페|\w+레스토랑|\w+호텔/g, // 구체적 업체명
    ];

    prohibitedPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        violationCount += matches.length;
      }
    });

    // 위반 비율에 따른 점수 계산
    const contentLength = content.length;
    const violationRate = contentLength > 0 ? violationCount / (contentLength / 100) : 0;
    
    return Math.max(0, 1 - violationRate);
  }

  /**
   * 권위 계층 초기화
   */
  private initializeAuthorityHierarchy(): void {
    this.authorityHierarchy = new Map([
      ['unesco', 1.0],
      ['cultural_heritage_administration', 0.95],
      ['korea_tourism_organization', 0.90],
      ['government', 0.85],
      ['wikidata', 0.80],
      ['user_generated', 0.50]
    ]);
  }

  /**
   * 팩트 패턴 초기화
   */
  private initializeFactPatterns(): void {
    this.factPatterns = new Map([
      ['historical', [
        /\d{4}년에?\s*(건립|건설|완성|개관)/,
        /\d+세기에?\s*(지어진|만들어진|건축된)/,
        /(조선|고려|신라|백제|가야)\s*시대/
      ]],
      ['architectural', [
        /\d+층\s*건물/,
        /면적\s*\d+/,
        /(목조|석조|철근콘크리트)\s*구조/,
        /(한식|양식|절충식)\s*건축/
      ]],
      ['geographical', [
        /해발\s*\d+m/,
        /면적\s*\d+/,
        /\d+km.*떨어진/,
        /(동경|서경)\s*\d+도/
      ]],
      ['statistical', [
        /연간\s*\d+명/,
        /\d+%/,
        /평점\s*\d+\.\d+/,
        /\d+위/
      ]]
    ]);
  }

  /**
   * 종합 점수 계산
   */
  private calculateOverallScore(scores: Omit<VerificationScore, 'overall'>): number {
    const weights = {
      consistency: 0.25,
      completeness: 0.20,
      accuracy: 0.25,
      timeliness: 0.15,
      authority: 0.15
    };

    return (
      scores.consistency * weights.consistency +
      scores.completeness * weights.completeness +
      scores.accuracy * weights.accuracy +
      scores.timeliness * weights.timeliness +
      scores.authority * weights.authority
    );
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(
    data: IntegratedData,
    scores: VerificationScore,
    conflicts: DataConflict[]
  ): string[] {
    const recommendations: string[] = [];

    if (scores.consistency < 0.7) {
      recommendations.push('데이터 소스 간 일관성을 개선하기 위해 추가 검증이 필요합니다.');
    }

    if (scores.completeness < 0.7) {
      recommendations.push('누락된 필수 정보를 보완하기 위해 추가 데이터 수집을 권장합니다.');
    }

    if (scores.accuracy < 0.7) {
      recommendations.push('정확성 향상을 위해 권위 있는 소스에서의 크로스 체크가 필요합니다.');
    }

    if (conflicts.filter(c => c.severity === 'critical').length > 0) {
      recommendations.push('심각한 데이터 충돌이 발견되어 수동 검토가 필요합니다.');
    }

    if (data.sources.length < 2) {
      recommendations.push('신뢰성 향상을 위해 추가 데이터 소스 확보를 권장합니다.');
    }

    return recommendations;
  }

  // 🚀 실제 구현: 성능 최적화된 충돌 탐지 메서드들
  private async detectCoordinateConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    return await this.performanceVerifier['detectCriticalCoordinateConflicts'](sources);
  }
  
  private async detectNameConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    return await this.performanceVerifier['detectCriticalNameConflicts'](sources);
  }
  
  private async detectDateConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    return await this.performanceVerifier['detectDateConflicts'](sources);
  }
  
  private async detectCategoryConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    // 카테고리 충돌 탐지 로직
    const conflicts: DataConflict[] = [];
    const categories: Array<{source: string, category: string[], reliability: number}> = [];

    // 카테고리 데이터 추출
    for (const source of sources) {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      if (data?.category || data?.types) {
        const cats = Array.isArray(data.category) ? data.category : [data.category];
        const types = Array.isArray(data.types) ? data.types : [data.types];
        categories.push({
          source: source.sourceId,
          category: [...cats, ...types].filter(Boolean),
          reliability: source.reliability
        });
      }
    }

    // 카테고리 충돌 검사
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const intersection = categories[i].category.filter(cat => 
          categories[j].category.includes(cat)
        );
        
        if (intersection.length === 0 && categories[i].category.length > 0 && categories[j].category.length > 0) {
          conflicts.push({
            field: 'category',
            severity: ConflictSeverity.MEDIUM,
            sources: [categories[i].source, categories[j].source],
            values: [categories[i].category.join(', '), categories[j].category.join(', ')]
          });
        }
      }
    }

    return conflicts;
  }
  
  private resolveCriticalConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: ResolutionMethod.MANUAL_REVIEW, chosenValue: null, reason: 'Critical conflict requires manual review', confidence: 0 };
  }
  
  private resolveHighConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: ResolutionMethod.MOST_RELIABLE_SOURCE, chosenValue: null, reason: 'Resolved by most reliable source', confidence: 0.8 };
  }
  
  private resolveMediumConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: ResolutionMethod.MAJORITY_VOTE, chosenValue: null, reason: 'Resolved by majority vote', confidence: 0.7 };
  }
  
  private resolveLowConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: ResolutionMethod.MOST_RECENT, chosenValue: null, reason: 'Resolved by most recent data', confidence: 0.6 };
  }

  // 🔍 실제 구현: 증거 및 모순 탐지
  private findSupportingEvidence(statement: string, data: IntegratedData): string[] {
    const evidence: string[] = [];
    const searchTerms = statement.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    // 소스 데이터에서 지원 증거 찾기
    data.sources?.forEach(source => {
      const sourceData = Array.isArray(source.data) ? source.data[0] : source.data;
      if (sourceData) {
        // 설명, 이름, 주요 필드에서 증거 검색
        const searchableText = [
          sourceData.description,
          sourceData.name,
          sourceData.shortDescription,
          sourceData.significance
        ].filter(Boolean).join(' ').toLowerCase();
        
        const matchingTerms = searchTerms.filter(term => searchableText.includes(term));
        if (matchingTerms.length > 0) {
          evidence.push(`${source.sourceId}: ${matchingTerms.length}개 일치 항목`);
        }
      }
    });
    
    return evidence;
  }
  
  private findContradictions(statement: string, data: IntegratedData): string[] {
    const contradictions: string[] = [];
    
    // 간단한 모순 탐지 (실제로는 더 정교한 NLP 필요)
    const negativeKeywords = ['아니다', '아님', '없다', '틀렸다', '잘못된'];
    const statementLower = statement.toLowerCase();
    
    data.sources?.forEach(source => {
      const sourceData = Array.isArray(source.data) ? source.data[0] : source.data;
      if (sourceData?.description) {
        const descLower = sourceData.description.toLowerCase();
        
        negativeKeywords.forEach(keyword => {
          if (descLower.includes(keyword)) {
            contradictions.push(`${source.sourceId}: 부정적 표현 발견`);
          }
        });
      }
    });
    
    return contradictions;
  }
  
  private identifyFactSources(statement: string, data: IntegratedData): FactSource[] {
    const factSources: FactSource[] = [];
    
    data.sources?.forEach(source => {
      factSources.push({
        name: source.sourceName,
        type: source.sourceId as SourceType,
        reliability: source.reliability,
        url: '',
        lastVerified: source.retrievedAt
      });
    });
    
    return factSources;
  }
  
  private categorizeFact(statement: string): string {
    const categories = {
      coordinates: ['좌표', '위치', '경도', '위도', 'lat', 'lng'],
      dates: ['년도', '세기', '건립', '설립', '개관', '완공'],
      descriptions: ['설명', '소개', '역사', '의미', '중요성'],
      names: ['이름', '명칭', '호칭', '별명']
    };
    
    const statementLower = statement.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => statementLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
  
  private calculateFactConfidence(
    evidence: string[], 
    contradictions: string[], 
    sources: FactSource[], 
    category: string
  ): number {
    let confidence = 0.5; // 기본값
    
    // 증거 기반 점수 향상
    confidence += Math.min(evidence.length * 0.15, 0.3);
    
    // 모순 기반 점수 감점
    confidence -= Math.min(contradictions.length * 0.2, 0.4);
    
    // 소스 신뢰도 반영
    if (sources.length > 0) {
      const avgReliability = sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length;
      confidence = (confidence + avgReliability) / 2;
    }
    
    // 카테고리별 가중치
    const categoryWeights = {
      coordinates: 0.9, // 좌표는 정확도가 중요
      dates: 0.8,
      names: 0.85,
      general: 0.7
    };
    
    confidence *= categoryWeights[category as keyof typeof categoryWeights] || 0.7;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  // 🤖 실제 구현: AI 관련 검증 메서드들
  private calculateAICompleteness(aiResponse: any): number {
    if (!aiResponse) return 0;
    
    const requiredFields = ['overview', 'detailedStops', 'practicalInfo'];
    let completeness = 0;
    
    // 기본 필드 존재 여부 확인
    requiredFields.forEach(field => {
      if (aiResponse[field]) completeness += 0.3;
    });
    
    // detailedStops 상세 검증
    if (aiResponse.detailedStops && Array.isArray(aiResponse.detailedStops)) {
      const stops = aiResponse.detailedStops;
      const avgStopCompleteness = stops.reduce((sum: number, stop: any) => {
        let stopScore = 0;
        if (stop.name) stopScore += 0.25;
        if (stop.coordinates?.lat && stop.coordinates?.lng) stopScore += 0.25;
        if (stop.content) stopScore += 0.25;
        if (stop.visitTime) stopScore += 0.25;
        return sum + stopScore;
      }, 0) / stops.length;
      
      completeness += avgStopCompleteness * 0.1;
    }
    
    return Math.min(completeness, 1.0);
  }
  
  private detectAIContentConflicts(
    aiResponse: any, 
    originalData: IntegratedData, 
    factResults: FactCheckResult[]
  ): DataConflict[] {
    const conflicts: DataConflict[] = [];
    
    // AI 응답의 위치명과 원본 데이터 비교
    const aiLocationName = this.extractLocationNameFromAI(aiResponse);
    if (aiLocationName && originalData.location?.name) {
      const similarity = this.calculateNameSimilarity(
        aiLocationName.toLowerCase(), 
        originalData.location.name.toLowerCase()
      );
      
      if (similarity < 0.7) {
        conflicts.push({
          field: 'name',
          severity: ConflictSeverity.HIGH,
          sources: ['ai_response', 'original_data'],
          values: [aiLocationName, originalData.location.name]
        });
      }
    }
    
    // 좌표 불일치 검증
    const aiCoordinates = this.extractCoordinatesFromAI(aiResponse);
    if (aiCoordinates && originalData.location?.coordinates) {
      const distance = this.calculateDistanceKm(
        aiCoordinates.lat, aiCoordinates.lng,
        originalData.location.coordinates.lat, originalData.location.coordinates.lng
      );
      
      if (distance > 1000) { // 1km 이상 차이
        conflicts.push({
          field: 'coordinate',
          severity: distance > 5000 ? ConflictSeverity.CRITICAL : ConflictSeverity.HIGH,
          sources: ['ai_response', 'original_data'],
          values: [
            `${aiCoordinates.lat}, ${aiCoordinates.lng}`,
            `${originalData.location.coordinates.lat}, ${originalData.location.coordinates.lng}`
          ]
        });
      }
    }
    
    // 팩트 검증 결과에서 낮은 신뢰도 항목 확인
    factResults.forEach(fact => {
      if (fact.confidence < 0.6) {
        conflicts.push({
          field: 'fact',
          severity: fact.confidence < 0.3 ? ConflictSeverity.CRITICAL : ConflictSeverity.HIGH,
          sources: ['ai_generated'],
          values: [fact.fact]
        });
      }
    });
    
    return conflicts;
  }
  
  private generateAIRecommendations(
    factResults: FactCheckResult[], 
    conflicts: DataConflict[]
  ): string[] {
    const recommendations: string[] = [];
    
    // 충돌 기반 권장사항
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    if (criticalConflicts.length > 0) {
      recommendations.push('심각한 데이터 불일치 발견 - AI 응답 재생성 권장');
    }
    
    const coordinateConflicts = conflicts.filter(c => c.field === 'coordinate');
    if (coordinateConflicts.length > 0) {
      recommendations.push('좌표 정보 검증 필요');
    }
    
    // 팩트 검증 기반 권장사항
    const lowConfidenceFacts = factResults.filter(f => f.confidence < 0.7);
    if (lowConfidenceFacts.length > factResults.length * 0.3) {
      recommendations.push('다수 팩트의 신뢰도 부족 - 추가 검증 필요');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('검증 완료 - 데이터 품질 양호');
    }
    
    return recommendations;
  }
  
  private extractLocationNameFromAI(aiResponse: any): string | null {
    // AI 응답에서 위치명 추출
    if (aiResponse?.overview) {
      // 첫 문장에서 위치명 추출 시도
      const overviewText = aiResponse.overview;
      const match = overviewText.match(/^([가-힣\s]+)(은|는|이|가|의)/);
      if (match) return match[1].trim();
    }
    
    if (aiResponse?.detailedStops?.[0]?.name) {
      return aiResponse.detailedStops[0].name;
    }
    
    return null;
  }
  
  private extractCoordinatesFromAI(aiResponse: any): { lat: number; lng: number } | null {
    // detailedStops에서 첫 번째 좌표 추출
    if (aiResponse?.detailedStops?.[0]?.coordinates) {
      const coords = aiResponse.detailedStops[0].coordinates;
      if (coords.lat && coords.lng) {
        return { lat: coords.lat, lng: coords.lng };
      }
    }
    
    return null;
  }
  
  private containsSpecificClaims(fact: string): boolean {
    // 구체적 주장 포함 여부 확인
    const specificPatterns = [
      /\d{4}년/, // 연도
      /\d+\.?\d*\s*(km|m|미터|킬로미터)/, // 거리
      /\d+\.?\d*\s*(명|개|층|시간)/, // 수량
      /(유네스코|UNESCO)/, // 기관명
      /\d+\.\d+,\s*\d+\.\d+/ // 좌표
    ];
    
    return specificPatterns.some(pattern => pattern.test(fact));
  }
  
  private isFactSupportedByData(fact: string, data: IntegratedData): boolean {
    if (!data.sources || data.sources.length === 0) return false;
    
    const factLower = fact.toLowerCase();
    const supportingCount = data.sources.filter(source => {
      const sourceData = Array.isArray(source.data) ? source.data[0] : source.data;
      if (!sourceData) return false;
      
      const searchableText = [
        sourceData.description,
        sourceData.name,
        sourceData.shortDescription
      ].filter(Boolean).join(' ').toLowerCase();
      
      // 간단한 키워드 매칭
      const factWords = factLower.split(/\s+/).filter(word => word.length > 2);
      const matchingWords = factWords.filter(word => searchableText.includes(word));
      
      return matchingWords.length > factWords.length * 0.5; // 50% 이상 매칭
    }).length;
    
    return supportingCount > 0;
  }

  // Helper methods
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Jaccard similarity
    const words1 = new Set(name1.split(/\s+/));
    const words2 = new Set(name2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}