// Unified guide generation and management factory
// Eliminates code duplication across guide-related modules

import { GuideData, UserProfile } from '@/types/guide';
import { createOperationLogger } from '@/lib/logger';
import { StandardSuccessResponse, StandardErrorResponse } from '@/lib/utils';

const logger = createOperationLogger('guide-factory');

export interface GuideGenerationOptions {
  locationName: string;
  language: string;
  userProfile?: UserProfile;
  forceRegenerate?: boolean;
  enableCoordinates?: boolean;
  qualityThreshold?: number;
}

export interface GuideResult {
  success: boolean;
  data?: GuideData;
  error?: string;
  source?: 'cache' | 'generated' | 'fallback';
  metadata?: {
    generationTime?: number;
    qualityScore?: number;
    cacheKey?: string;
  };
}

export interface GuideStorage {
  get(key: string): Promise<GuideData | null>;
  set(key: string, data: GuideData, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface GuideGenerator {
  generate(options: GuideGenerationOptions): Promise<GuideResult>;
  validateContent(data: GuideData): Promise<{ isValid: boolean; issues: string[] }>;
  estimateQuality(data: GuideData): Promise<number>;
}

/**
 * Central factory for all guide operations
 * Provides consistent interface for guide generation, caching, and management
 */
export class GuideFactory {
  private static instance: GuideFactory;
  private storage: GuideStorage | null = null;
  private generators: Map<string, GuideGenerator> = new Map();

  static getInstance(): GuideFactory {
    if (!GuideFactory.instance) {
      GuideFactory.instance = new GuideFactory();
    }
    return GuideFactory.instance;
  }

  registerStorage(storage: GuideStorage): void {
    this.storage = storage;
    logger.info('Guide storage provider registered');
  }

  registerGenerator(type: string, generator: GuideGenerator): void {
    this.generators.set(type, generator);
    logger.info('Guide generator registered', { type });
  }

  private generateCacheKey(options: GuideGenerationOptions): string {
    const { locationName, language, userProfile } = options;
    const profileHash = userProfile 
      ? JSON.stringify(userProfile).slice(0, 10)
      : 'default';
    
    return `guide:${locationName.toLowerCase()}:${language}:${profileHash}`;
  }

  async generateGuide(options: GuideGenerationOptions): Promise<GuideResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(options);
    
    logger.info('Guide generation requested', {
      location: options.locationName,
      language: options.language,
      forceRegenerate: options.forceRegenerate
    });

    try {
      // 1. Check cache if not forcing regeneration
      if (!options.forceRegenerate && this.storage) {
        const cachedGuide = await this.storage.get(cacheKey);
        if (cachedGuide) {
          logger.info('Guide served from cache', { cacheKey });
          return {
            success: true,
            data: cachedGuide,
            source: 'cache',
            metadata: {
              generationTime: Date.now() - startTime,
              cacheKey
            }
          };
        }
      }

      // 2. Find appropriate generator
      const generator = this.findBestGenerator(options);
      if (!generator) {
        throw new Error('No suitable guide generator available');
      }

      // 3. Generate new guide
      const result = await generator.generate(options);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Guide generation failed');
      }

      // 4. Validate generated content
      const validation = await generator.validateContent(result.data);
      if (!validation.isValid) {
        logger.warn('Generated guide failed validation', {
          issues: validation.issues,
          location: options.locationName
        });
        
        // Don't cache invalid guides
        return {
          success: true,
          data: result.data,
          source: 'generated',
          metadata: {
            generationTime: Date.now() - startTime,
            qualityScore: 0,
            cacheKey: `${options.locationName}_${options.language || 'ko'}`
          }
        };
      }

      // 5. Calculate quality score
      const qualityScore = await generator.estimateQuality(result.data);
      
      // 6. Cache if quality meets threshold
      const qualityThreshold = options.qualityThreshold ?? 0.7;
      if (qualityScore >= qualityThreshold && this.storage) {
        await this.storage.set(cacheKey, result.data);
        logger.info('Guide cached successfully', { 
          cacheKey, 
          qualityScore 
        });
      }

      return {
        success: true,
        data: result.data,
        source: 'generated',
        metadata: {
          generationTime: Date.now() - startTime,
          qualityScore,
          cacheKey
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Guide generation failed', error instanceof Error ? error : new Error(errorMessage), {
        location: options.locationName,
        language: options.language
      });

      return {
        success: false,
        error: errorMessage,
        metadata: {
          generationTime: Date.now() - startTime
        }
      };
    }
  }

  private findBestGenerator(options: GuideGenerationOptions): GuideGenerator | null {
    // For now, return the first available generator
    // In the future, this could implement intelligent generator selection
    // based on location type, language, user preferences, etc.
    
    const generators = Array.from(this.generators.values());
    return generators.length > 0 ? generators[0] : null;
  }

  async invalidateCache(locationName: string, language?: string): Promise<void> {
    if (!this.storage) {
      logger.warn('No storage provider available for cache invalidation');
      return;
    }

    try {
      if (language) {
        // Invalidate specific language
        const cacheKey = this.generateCacheKey({ locationName, language });
        await this.storage.delete(cacheKey);
        logger.info('Cache invalidated for specific language', { locationName, language });
      } else {
        // Invalidate all languages for location
        // This is a simplified approach - in production, you might want a more sophisticated cache key pattern
        const languages = ['ko', 'en', 'ja', 'zh', 'es'];
        for (const lang of languages) {
          const cacheKey = this.generateCacheKey({ locationName, language: lang });
          await this.storage.delete(cacheKey);
        }
        logger.info('Cache invalidated for all languages', { locationName });
      }
    } catch (error) {
      logger.error('Cache invalidation failed', error instanceof Error ? error : new Error('Unknown error'), {
        locationName,
        language
      });
    }
  }

  async getAvailableLanguages(locationName: string): Promise<string[]> {
    if (!this.storage) {
      return [];
    }

    const languages = ['ko', 'en', 'ja', 'zh', 'es'];
    const availableLanguages: string[] = [];

    for (const language of languages) {
      const cacheKey = this.generateCacheKey({ locationName, language });
      if (await this.storage.exists(cacheKey)) {
        availableLanguages.push(language);
      }
    }

    return availableLanguages;
  }

  getMetrics(): {
    registeredGenerators: number;
    hasStorage: boolean;
  } {
    return {
      registeredGenerators: this.generators.size,
      hasStorage: this.storage !== null
    };
  }
}

// Export singleton instance
export const guideFactory = GuideFactory.getInstance();