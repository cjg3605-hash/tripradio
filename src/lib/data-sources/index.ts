/**
 * Multi-Data Source Integration System
 * 다중 데이터소스 통합 시스템
 */

export { UNESCOService } from './unesco/unesco-service';
export { WikidataService } from './wikidata/wikidata-service';
export { GovernmentDataService } from './government/government-service';
export { GooglePlacesService } from './google/places-service';
export { DataIntegrationOrchestrator } from './orchestrator/data-orchestrator';
export { FactVerificationPipeline } from './verification/fact-verification';
export { DataSourceCache } from './cache/data-cache';

// Types
export type {
  DataSource,
  VerificationResult,
  IntegratedData,
  CacheEntry,
  FactCheckResult
} from './types/data-types';