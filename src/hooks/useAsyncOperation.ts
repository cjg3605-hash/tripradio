// Common hook for managing async operations with loading, error, and data states
// Eliminates repetitive useState patterns across components

import { useState, useCallback, useRef, useEffect } from 'react';
import { createComponentLogger } from '@/lib/logger';

const logger = createComponentLogger('useAsyncOperation');

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface AsyncOperationOptions {
  // Auto-retry failed operations
  retries?: number;
  retryDelay?: number;
  
  // Cache management
  cacheDuration?: number; // in milliseconds
  cacheKey?: string;
  
  // Loading states
  initialLoading?: boolean;
  minLoadingTime?: number; // minimum time to show loading
  
  // Error handling
  logErrors?: boolean;
  fallbackData?: any;
}

export interface AsyncOperationActions<T> {
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  retry: () => Promise<T | null>;
}

type AsyncOperationResult<T> = AsyncOperationState<T> & AsyncOperationActions<T>;

/**
 * Hook for managing async operations with consistent error handling,
 * loading states, caching, and retry logic
 */
export function useAsyncOperation<T = any>(
  options: AsyncOperationOptions = {}
): AsyncOperationResult<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    initialLoading = false,
    minLoadingTime = 0,
    logErrors = true,
    fallbackData = null
  } = options;

  // State management
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: initialLoading,
    error: null,
    lastUpdated: null
  });

  // Keep track of current operation and retries
  const currentOperationRef = useRef<(() => Promise<T>) | null>(null);
  const retryCountRef = useRef(0);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Cache management
  const getCachedData = useCallback((key: string): T | null => {
    if (!options.cacheKey) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > cacheDuration) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cacheDuration, options.cacheKey]);

  const setCachedData = useCallback((key: string, data: T) => {
    if (!options.cacheKey) return;
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [options.cacheKey]);

  // Main execution function
  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    // Check cache first
    if (options.cacheKey) {
      const cachedData = getCachedData(options.cacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }));
        return cachedData;
      }
    }

    // Store current operation for retry
    currentOperationRef.current = operation;
    retryCountRef.current = 0;

    const loadingStartTime = Date.now();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    const attemptOperation = async (attemptNumber: number): Promise<T | null> => {
      try {
        const result = await operation();
        
        // Ensure minimum loading time for better UX
        const loadingDuration = Date.now() - loadingStartTime;
        if (minLoadingTime > 0 && loadingDuration < minLoadingTime) {
          await new Promise(resolve => {
            loadingTimerRef.current = setTimeout(resolve, minLoadingTime - loadingDuration);
          });
        }

        // Cache successful result
        if (options.cacheKey) {
          setCachedData(options.cacheKey, result);
        }

        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }));

        return result;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        if (logErrors) {
          logger.error(`Operation failed (attempt ${attemptNumber}/${retries + 1})`, 
            error instanceof Error ? error : new Error(errorMessage)
          );
        }

        // Retry logic
        if (attemptNumber < retries) {
          retryCountRef.current = attemptNumber + 1;
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attemptNumber - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return attemptOperation(attemptNumber + 1);
        }

        // All retries failed
        setState(prev => ({
          ...prev,
          data: fallbackData,
          loading: false,
          error: errorMessage,
          lastUpdated: new Date()
        }));

        return fallbackData;
      }
    };

    return attemptOperation(1);
  }, [
    retries, 
    retryDelay, 
    minLoadingTime, 
    logErrors, 
    fallbackData, 
    options.cacheKey, 
    getCachedData, 
    setCachedData
  ]);

  // Retry current operation
  const retry = useCallback(async (): Promise<T | null> => {
    if (!currentOperationRef.current) {
      logger.warn('No operation to retry');
      return null;
    }

    return execute(currentOperationRef.current);
  }, [execute]);

  // Reset state
  const reset = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });

    currentOperationRef.current = null;
    retryCountRef.current = 0;
  }, []);

  // Manual state setters
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date()
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      lastUpdated: new Date()
    }));
  }, []);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    execute,
    reset,
    setData,
    setError,
    retry
  };
}

/**
 * Specialized hook for API operations with common configurations
 */
export function useApiOperation<T = any>(
  options: Omit<AsyncOperationOptions, 'logErrors' | 'retries'> = {}
) {
  return useAsyncOperation<T>({
    logErrors: true,
    retries: 3,
    retryDelay: 1000,
    minLoadingTime: 300, // Show loading for at least 300ms
    ...options
  });
}

/**
 * Specialized hook for UI operations that don't need retries
 */
export function useUIOperation<T = any>(
  options: Omit<AsyncOperationOptions, 'retries' | 'retryDelay'> = {}
) {
  return useAsyncOperation<T>({
    retries: 0,
    logErrors: false,
    minLoadingTime: 200,
    ...options
  });
}