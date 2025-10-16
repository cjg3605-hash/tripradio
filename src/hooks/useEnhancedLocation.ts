/**
 * Enhanced Location Hook
 * 위치 검색과 정확도 검증을 위한 React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { enhancedLocationService, type EnhancedLocationResult } from '@/lib/location/enhanced-location-utils';

export interface UseEnhancedLocationOptions {
  enableAutoSearch?: boolean;
  preferStaticData?: boolean;
  language?: string;
  country?: string;
  cacheResults?: boolean;
}

export interface UseEnhancedLocationReturn {
  location: EnhancedLocationResult | null;
  isLoading: boolean;
  error: string | null;
  search: (locationName: string) => Promise<void>;
  retry: () => Promise<void>;
  clear: () => void;
  accuracy: number;
  confidence: number;
  sources: string[];
  dataSource: 'static' | 'dynamic' | 'hybrid' | null;
}

/**
 * Enhanced location search hook
 */
export function useEnhancedLocation(
  initialLocationName?: string,
  options: UseEnhancedLocationOptions = {}
): UseEnhancedLocationReturn {
  const {
    enableAutoSearch = true,
    preferStaticData = false,
    language = 'ko',
    country,
    cacheResults = true
  } = options;

  const [location, setLocation] = useState<EnhancedLocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTerm, setLastSearchTerm] = useState<string | undefined>(initialLocationName);

  // Search function
  const search = useCallback(async (locationName: string) => {
    if (!locationName.trim()) {
      setError('위치명을 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastSearchTerm(locationName);

    try {
      const result = await enhancedLocationService.findLocation(locationName, {
        preferStatic: preferStaticData,
        language,
        ...(country && { country })
      });

      setLocation(result);
      console.log('🎯 Enhanced location search successful:', {
        locationName,
        accuracy: result.center.accuracy,
        confidence: result.center.confidence,
        sources: result.center.sources,
        dataSource: result.dataSource
      });
    } catch (searchError) {
      const errorMessage = searchError instanceof Error ? searchError.message : '위치 검색에 실패했습니다';
      setError(errorMessage);
      setLocation(null);
      console.error('Enhanced location search failed:', {
        locationName,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [preferStaticData, language, country]);

  // Retry function
  const retry = useCallback(async () => {
    if (lastSearchTerm) {
      await search(lastSearchTerm);
    }
  }, [search, lastSearchTerm]);

  // Clear function
  const clear = useCallback(() => {
    setLocation(null);
    setError(null);
    setIsLoading(false);
    setLastSearchTerm(undefined);
  }, []);

  // Auto search on mount or when initialLocationName changes
  useEffect(() => {
    if (initialLocationName && enableAutoSearch) {
      search(initialLocationName);
    }
  }, [initialLocationName, enableAutoSearch, search]);

  // Computed values
  const accuracy = location?.center.accuracy ?? 0;
  const confidence = location?.center.confidence ?? 0;
  const sources = location?.center.sources ?? [];
  const dataSource = location?.dataSource ?? null;

  return {
    location,
    isLoading,
    error,
    search,
    retry,
    clear,
    accuracy,
    confidence,
    sources,
    dataSource
  };
}

/**
 * Multiple locations search hook
 */
export function useEnhancedMultipleLocations(
  locationNames: string[] = [],
  options: UseEnhancedLocationOptions = {}
) {
  const [locations, setLocations] = useState<EnhancedLocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const {
    language = 'ko',
    country,
    preferStaticData = false
  } = options;

  const searchMultiple = useCallback(async (names: string[]) => {
    if (names.length === 0) {
      setLocations([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress({ current: 0, total: names.length });

    try {
      const results: EnhancedLocationResult[] = [];
      
      for (let i = 0; i < names.length; i++) {
        setProgress({ current: i + 1, total: names.length });
        
        try {
          const result = await enhancedLocationService.findLocation(names[i], {
            preferStatic: preferStaticData,
            language,
            ...(country && { country })
          });
          results.push(result);
        } catch (searchError) {
          console.warn(`Failed to find location: ${names[i]}`, searchError);
          // Continue with other locations even if one fails
        }
      }

      setLocations(results);
      
      if (results.length === 0) {
        setError('모든 위치 검색에 실패했습니다');
      } else if (results.length < names.length) {
        setError(`${names.length - results.length}개 위치를 찾지 못했습니다`);
      }
    } catch (searchError) {
      const errorMessage = searchError instanceof Error ? searchError.message : '위치 검색에 실패했습니다';
      setError(errorMessage);
      setLocations([]);
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [preferStaticData, language, country]);

  useEffect(() => {
    if (locationNames.length > 0) {
      searchMultiple(locationNames);
    }
  }, [locationNames, searchMultiple]);

  return {
    locations,
    isLoading,
    error,
    progress,
    searchMultiple,
    clear: () => {
      setLocations([]);
      setError(null);
      setProgress({ current: 0, total: 0 });
    }
  };
}

/**
 * Location validation hook
 */
export function useLocationValidation() {
  const [validationResults, setValidationResults] = useState<Map<string, {
    isValid: boolean;
    accuracy: number;
    confidence: number;
    issues: string[];
  }>>(new Map());

  const validateLocation = useCallback(async (location: EnhancedLocationResult) => {
    const issues: string[] = [];
    
    // Accuracy validation
    if (location.center.accuracy < 0.5) {
      issues.push('낮은 정확도');
    }
    
    // Confidence validation
    if (location.center.confidence < 0.6) {
      issues.push('낮은 신뢰도');
    }
    
    // Sources validation
    if (location.center.sources.length < 2) {
      issues.push('검증 소스 부족');
    }
    
    // Data source validation
    if (location.dataSource === 'dynamic' && location.center.confidence < 0.8) {
      issues.push('동적 데이터 신뢰도 부족');
    }

    const validationResult = {
      isValid: issues.length === 0,
      accuracy: location.center.accuracy,
      confidence: location.center.confidence,
      issues
    };

    setValidationResults(prev => new Map(prev).set(location.id, validationResult));
    
    return validationResult;
  }, []);

  return {
    validationResults,
    validateLocation,
    clearValidations: () => setValidationResults(new Map())
  };
}