/**
 * Data Types for Multi-Source Integration
 * 다중 데이터소스 통합을 위한 타입 정의
 */

// Base Data Source Interface
export interface DataSource {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: RateLimit;
  reliability: number; // 0-1 신뢰도 점수
  lastUpdated: string;
  isActive: boolean;
}

// Rate Limiting Configuration
export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

// Unified Data Structure
export interface IntegratedData {
  id: string;
  location: LocationInfo;
  basicInfo: BasicInfo;
  sources: SourceData[];
  verificationStatus: VerificationResult;
  confidence: number; // 0-1 종합 신뢰도
  lastVerified: string;
  metadata: DataMetadata;
}

// Location Information
export interface LocationInfo {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy: number; // meters
  };
  address: Address;
  country: string;
  region: string;
  category: LocationCategory[];
}

// Address Structure
export interface Address {
  formatted: string;
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

// Location Categories
export enum LocationCategory {
  UNESCO_SITE = 'unesco_site',
  CULTURAL_HERITAGE = 'cultural_heritage',
  NATURAL_HERITAGE = 'natural_heritage',
  MUSEUM = 'museum',
  HISTORICAL_SITE = 'historical_site',
  RELIGIOUS_SITE = 'religious_site',
  GOVERNMENT_BUILDING = 'government_building',
  TOURIST_ATTRACTION = 'tourist_attraction',
  EDUCATIONAL = 'educational',
  COMMERCIAL = 'commercial'
}

// Basic Information
export interface BasicInfo {
  description: string;
  shortDescription: string;
  significance: string;
  established?: string;
  architect?: string;
  style?: string;
  period?: string;
  facts: VerifiedFact[];
}

// Verified Facts
export interface VerifiedFact {
  statement: string;
  source: string;
  confidence: number;
  verifiedAt: string;
  category: FactCategory;
}

export enum FactCategory {
  HISTORICAL = 'historical',
  ARCHITECTURAL = 'architectural',
  CULTURAL = 'cultural',
  STATISTICAL = 'statistical',
  GEOGRAPHICAL = 'geographical',
  OPERATIONAL = 'operational'
}

// Source-specific Data
export interface SourceData {
  sourceId: string;
  sourceName: string;
  data: any;
  retrievedAt: string;
  reliability: number;
  latency: number; // response time in ms
  httpStatus: number;
  errors?: string[];
  metadata?: any; // Optional metadata for additional source information
}

// UNESCO-specific Types
export interface UNESCOData {
  id: string;
  name: string;
  inscriptionYear: number;
  criteria: string[];
  category: 'Cultural' | 'Natural' | 'Mixed';
  description: string;
  justification: string;
  threats?: string[];
  protectionMeasures?: string[];
  stateParty: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Wikidata-specific Types
export interface WikidataEntity {
  id: string;
  label: string;
  description: string;
  claims: WikidataClaim[];
  sitelinks: WikidataSitelink[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  images?: string[];
}

export interface WikidataClaim {
  property: string;
  value: any;
  qualifiers?: any[];
  references?: WikidataReference[];
}

export interface WikidataReference {
  property: string;
  value: string;
  url?: string;
}

export interface WikidataSitelink {
  site: string;
  title: string;
  url: string;
}

// Government Data Types
export interface GovernmentData {
  dataset: string;
  agency: string;
  data: any;
  lastUpdated: string;
  format: 'json' | 'xml' | 'csv';
  license: string;
  reliability: number;
}

// Google Places Types (extending existing)
export interface GooglePlacesData {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  vicinity: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: PlacePhoto[];
  reviews?: PlaceReview[];
  openingHours?: {
    openNow: boolean;
    periods: OpeningPeriod[];
  };
}

export interface PlacePhoto {
  photoReference: string;
  height: number;
  width: number;
  htmlAttributions: string[];
}

export interface PlaceReview {
  authorName: string;
  rating: number;
  text: string;
  time: number;
}

export interface OpeningPeriod {
  open: {
    day: number;
    time: string;
  };
  close?: {
    day: number;
    time: string;
  };
}

// Verification System Types
export interface VerificationResult {
  isVerified: boolean;
  confidence: number; // 0-1
  score: VerificationScore;
  conflicts: DataConflict[];
  recommendations: string[];
  verifiedAt: string;
  method: VerificationMethod;
}

export interface VerificationScore {
  consistency: number; // 데이터 일관성
  completeness: number; // 데이터 완성도
  accuracy: number; // 정확도
  timeliness: number; // 최신성
  authority: number; // 권위성
  overall: number; // 종합 점수
}

export interface DataConflict {
  field: string;
  sources: string[];
  values: any[];
  severity: ConflictSeverity;
  resolution?: ConflictResolution;
}

export enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ConflictResolution {
  method: ResolutionMethod;
  chosenValue: any;
  reason: string;
  confidence: number;
}

export enum ResolutionMethod {
  MAJORITY_VOTE = 'majority_vote',
  MOST_RELIABLE_SOURCE = 'most_reliable_source',
  MOST_RECENT = 'most_recent',
  MANUAL_REVIEW = 'manual_review',
  AI_ARBITRATION = 'ai_arbitration'
}

export enum VerificationMethod {
  CROSS_REFERENCE = 'cross_reference',
  AUTHORITY_CHECK = 'authority_check',
  CONSENSUS = 'consensus',
  AI_VALIDATION = 'ai_validation',
  MANUAL = 'manual',
  FALLBACK = 'fallback'
}

// Cache Types
export interface CacheEntry {
  key: string;
  data: any;
  source: string;
  createdAt: string;
  expiresAt: string;
  hitCount: number;
  size: number; // bytes
  tags: string[];
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Max cache size in bytes
  strategy: CacheStrategy;
  compression: boolean;
}

export enum CacheStrategy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In, First Out
  TTL = 'ttl' // Time To Live
}

// Error Types
export class DataSourceError extends Error {
  constructor(
    message: string,
    public source: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DataSourceError';
  }
}

export class VerificationError extends Error {
  constructor(
    message: string,
    public conflicts: DataConflict[],
    public confidence: number
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}

// Fact Checking Types
export interface FactCheckResult {
  fact: string;
  isValid: boolean;
  confidence: number;
  sources: FactSource[];
  contradictions: string[];
  supportingEvidence: string[];
  checkedAt: string;
  method: FactCheckMethod[];
}

export interface FactSource {
  name: string;
  url?: string;
  reliability: number;
  lastVerified: string;
  type: SourceType;
}

export enum SourceType {
  OFFICIAL = 'official',
  ACADEMIC = 'academic',
  NEWS = 'news',
  ENCYCLOPEDIA = 'encyclopedia',
  GOVERNMENT = 'government',
  CULTURAL_INSTITUTION = 'cultural_institution',
  USER_GENERATED = 'user_generated'
}

export enum FactCheckMethod {
  CROSS_REFERENCE = 'cross_reference',
  AUTHORITY_VERIFICATION = 'authority_verification',
  STATISTICAL_ANALYSIS = 'statistical_analysis',
  AI_FACT_CHECK = 'ai_fact_check',
  EXPERT_REVIEW = 'expert_review'
}

// Performance Monitoring
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  dataQuality: number;
  uptime: number;
}

// Metadata
export interface DataMetadata {
  version: string;
  schema: string;
  format: string;
  encoding: string;
  language: string;
  rights: string;
  provenance: string;
  qualityScore: number;
  tags: string[];
}