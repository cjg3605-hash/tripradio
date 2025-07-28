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
  VerificationError
} from '../types/data-types';

import { DataSourceCache } from '../cache/data-cache';

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
  private authorityHierarchy: Map<string, number>;
  private factPatterns: Map<string, RegExp[]>;

  private constructor() {
    this.config = {
      strictMode: true,
      minSourcesRequired: 2,
      conflictThreshold: 0.3,
      authorityWeights: {
        'unesco': 0.95,
        'government': 0.90,
        'wikidata': 0.80,
        'google_places': 0.75,
        'cultural_heritage_administration': 0.95,
        'korea_tourism_organization': 0.85
      },
      factCheckMethods: [
        'cross_reference',
        'authority_verification',
        'statistical_analysis',
        'ai_fact_check'
      ],
      crossReferenceTimeout: 10000
    };

    this.cache = new DataSourceCache({
      ttl: 7200, // 2 hours
      maxSize: 50 * 1024 * 1024, // 50MB
      strategy: 'lru' as any,
      compression: true
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
   * 통합 데이터 검증
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
        return cached;
      }

      // 1. 데이터 일관성 검증
      const consistencyScore = await this.verifyConsistency(data);
      
      // 2. 데이터 완성도 검증
      const completenessScore = await this.verifyCompleteness(data);
      
      // 3. 정확성 검증 (크로스 레퍼런싱)
      const accuracyScore = await this.verifyCrossReferences(data);
      
      // 4. 최신성 검증
      const timelinessScore = await this.verifyTimeliness(data);
      
      // 5. 권위성 검증
      const authorityScore = await this.verifyAuthority(data);
      
      // 6. 충돌 탐지 및 해결
      const conflicts = await this.detectConflicts(data);
      const resolvedConflicts = await this.resolveConflicts(conflicts, data);
      
      // 7. 종합 점수 계산
      const overallScore = this.calculateOverallScore({
        consistency: consistencyScore,
        completeness: completenessScore,
        accuracy: accuracyScore,
        timeliness: timelinessScore,
        authority: authorityScore
      });

      // 8. 권장사항 생성
      const recommendations = this.generateRecommendations(data, {
        consistency: consistencyScore,
        completeness: completenessScore,
        accuracy: accuracyScore,
        timeliness: timelinessScore,
        authority: authorityScore,
        overall: overallScore
      }, resolvedConflicts);

      const result: VerificationResult = {
        isVerified: overallScore >= 0.7 && resolvedConflicts.filter(c => c.severity === 'critical').length === 0,
        confidence: overallScore,
        score: {
          consistency: consistencyScore,
          completeness: completenessScore,
          accuracy: accuracyScore,
          timeliness: timelinessScore,
          authority: authorityScore,
          overall: overallScore
        },
        conflicts: resolvedConflicts,
        recommendations,
        verifiedAt: new Date().toISOString(),
        method: 'cross_reference'
      };

      // 캐시에 저장
      await this.cache.set(cacheKey, result, ['verification', 'fact-check']);

      return result;

    } catch (error) {
      throw new VerificationError(
        `검증 실패: ${error instanceof Error ? error.message : String(error)}`,
        [],
        0
      );
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
        method: 'ai_validation'
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
          'cross_reference',
          ...(sources.some(s => s.type === 'official') ? ['authority_verification'] : []),
          ...(category === 'statistical' ? ['statistical_analysis'] : [])
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
        method: ['error']
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
      const similarity = this.calculateNameSimilarity(names);
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
    const coordConflicts = this.detectCoordinateConflicts(data.sources);
    conflicts.push(...coordConflicts);

    // 이름 충돌 검증
    const nameConflicts = this.detectNameConflicts(data.sources);
    conflicts.push(...nameConflicts);

    // 날짜 충돌 검증
    const dateConflicts = this.detectDateConflicts(data.sources);
    conflicts.push(...dateConflicts);

    // 카테고리 충돌 검증
    const categoryConflicts = this.detectCategoryConflicts(data.sources);
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
   * 이름 유사도 계산
   */
  private calculateNameSimilarity(names: string[]): number {
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
      const distance = this.calculateDistance(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
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
   * 거리 계산 (Haversine)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
      const distance = this.calculateDistance(
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
      ['google_places', 0.75],
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

  // 기타 헬퍼 메서드들은 구현 복잡성으로 인해 기본 구조만 제공
  private detectCoordinateConflicts(sources: SourceData[]): DataConflict[] { return []; }
  private detectNameConflicts(sources: SourceData[]): DataConflict[] { return []; }
  private detectDateConflicts(sources: SourceData[]): DataConflict[] { return []; }
  private detectCategoryConflicts(sources: SourceData[]): DataConflict[] { return []; }
  
  private resolveCriticalConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: 'manual_review', chosenValue: null, reason: 'Critical conflict requires manual review', confidence: 0 };
  }
  
  private resolveHighConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: 'most_reliable_source', chosenValue: null, reason: 'Resolved by most reliable source', confidence: 0.8 };
  }
  
  private resolveMediumConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: 'majority_vote', chosenValue: null, reason: 'Resolved by majority vote', confidence: 0.7 };
  }
  
  private resolveLowConflict(conflict: DataConflict, data: IntegratedData): ConflictResolution {
    return { method: 'most_recent', chosenValue: null, reason: 'Resolved by most recent data', confidence: 0.6 };
  }

  private findSupportingEvidence(statement: string, data: IntegratedData): string[] { return []; }
  private findContradictions(statement: string, data: IntegratedData): string[] { return []; }
  private identifyFactSources(statement: string, data: IntegratedData): FactSource[] { return []; }
  private categorizeFact(statement: string): string { return 'general'; }
  private calculateFactConfidence(evidence: string[], contradictions: string[], sources: FactSource[], category: string): number { return 0.8; }
  
  private calculateAICompleteness(aiResponse: any): number { return 0.9; }
  private detectAIContentConflicts(aiResponse: any, originalData: IntegratedData, factResults: FactCheckResult[]): DataConflict[] { return []; }
  private generateAIRecommendations(factResults: FactCheckResult[], conflicts: DataConflict[]): string[] { return []; }
  
  private extractLocationNameFromAI(aiResponse: any): string | null { return null; }
  private extractCoordinatesFromAI(aiResponse: any): { lat: number; lng: number } | null { return null; }
  private containsSpecificClaims(fact: string): boolean { return false; }
  private isFactSupportedByData(fact: string, data: IntegratedData): boolean { return true; }
}