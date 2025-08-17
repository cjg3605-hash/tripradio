/**
 * 중앙화된 로깅 시스템
 * 환경별 로그 레벨 관리 및 성능 최적화
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'api' | 'ui' | 'performance' | 'search' | 'map' | 'general';

interface LogConfig {
  level: LogLevel;
  enabledCategories: LogCategory[];
  enablePerformanceLogs: boolean;
  enableDebugLogs: boolean;
}

// 환경별 로그 설정
const getLogConfig = (): LogConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      level: 'warn',
      enabledCategories: ['general'],
      enablePerformanceLogs: false,
      enableDebugLogs: false
    };
  }

  return {
    level: 'debug',
    enabledCategories: ['api', 'ui', 'performance', 'search', 'map', 'general'],
    enablePerformanceLogs: true,
    enableDebugLogs: true
  };
};

const config = getLogConfig();

// 로그 레벨 우선순위
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// 카테고리별 이모지
const CATEGORY_ICONS: Record<LogCategory, string> = {
  api: '🌐',
  ui: '🎨',
  performance: '⚡',
  search: '🔍',
  map: '🗺️',
  general: '📋'
};

// 로그 출력 제한을 위한 디바운싱
const logThrottle = new Map<string, number>();
const THROTTLE_INTERVAL = 1000; // 1초

/**
 * 로그가 출력 가능한지 확인 (스로틀링)
 */
const canLog = (key: string): boolean => {
  const now = Date.now();
  const lastLog = logThrottle.get(key);
  
  if (!lastLog || now - lastLog > THROTTLE_INTERVAL) {
    logThrottle.set(key, now);
    return true;
  }
  
  return false;
};

/**
 * 로그 레벨이 활성화되어 있는지 확인
 */
const isLevelEnabled = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
};

/**
 * 카테고리가 활성화되어 있는지 확인
 */
const isCategoryEnabled = (category: LogCategory): boolean => {
  return config.enabledCategories.includes(category);
};

/**
 * 객체를 요약해서 출력 (성능 최적화)
 */
const summarizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return `Array(${obj.length})`;
  }
  
  const keys = Object.keys(obj);
  if (keys.length > 5) {
    return `Object with ${keys.length} keys: [${keys.slice(0, 3).join(', ')}, ...]`;
  }
  
  return obj;
};

/**
 * 통합 로그 함수
 */
const log = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: any,
  throttleKey?: string
) => {
  // 레벨 및 카테고리 확인
  if (!isLevelEnabled(level) || !isCategoryEnabled(category)) {
    return;
  }

  // 스로틀링 확인
  if (throttleKey && !canLog(throttleKey)) {
    return;
  }

  const icon = CATEGORY_ICONS[category];
  const logMessage = `${icon} ${message}`;
  const logData = data ? summarizeObject(data) : undefined;

  switch (level) {
    case 'debug':
      if (config.enableDebugLogs) {
        console.log(logMessage, logData);
      }
      break;
    case 'info':
      console.log(logMessage, logData);
      break;
    case 'warn':
      console.warn(logMessage, logData);
      break;
    case 'error':
      console.error(logMessage, logData);
      break;
  }
};

/**
 * 카테고리별 로거 함수들
 */
export const logger = {
  // API 관련 로그
  api: {
    start: (endpoint: string, params?: any) => 
      log('debug', 'api', `API 호출 시작: ${endpoint}`, params, `api-${endpoint}`),
    success: (endpoint: string, data?: any) => 
      log('info', 'api', `API 성공: ${endpoint}`, data),
    error: (endpoint: string, error: any) => 
      log('error', 'api', `API 오류: ${endpoint}`, error),
    response: (endpoint: string, data?: any) => 
      log('debug', 'api', `API 응답: ${endpoint}`, data, `api-response-${endpoint}`)
  },

  // UI 관련 로그
  ui: {
    interaction: (action: string, data?: any) => 
      log('debug', 'ui', `사용자 상호작용: ${action}`, data, `ui-${action}`),
    state: (component: string, state: any) => 
      log('debug', 'ui', `상태 변경: ${component}`, state, `ui-state-${component}`),
    render: (component: string) => 
      log('debug', 'ui', `컴포넌트 렌더링: ${component}`, undefined, `ui-render-${component}`)
  },

  // 성능 관련 로그
  performance: {
    measure: (name: string, duration: number) => {
      if (config.enablePerformanceLogs) {
        log('info', 'performance', `성능 측정: ${name}`, { duration: `${duration}ms` });
      }
    },
    webVitals: (metric: string, value: number, rating: string) => {
      if (config.enablePerformanceLogs) {
        const level = rating === 'good' ? 'info' : rating === 'needs-improvement' ? 'warn' : 'error';
        log(level, 'performance', `${metric}: ${value} (${rating})`);
      }
    }
  },

  // 검색 관련 로그
  search: {
    query: (query: string) => 
      log('debug', 'search', `검색 쿼리: ${query}`, undefined, 'search-query'),
    results: (count: number) => 
      log('info', 'search', `검색 결과: ${count}개`),
    autocomplete: (query: string, count: number) => 
      log('debug', 'search', `자동완성: ${query}`, { count }, `autocomplete-${query}`),
    error: (error: any) => 
      log('error', 'search', '검색 오류', error)
  },

  // 지도 관련 로그
  map: {
    load: (coordinates?: any) => 
      log('info', 'map', '지도 로드', coordinates),
    error: (error: any) => 
      log('error', 'map', '지도 오류', error),
    interaction: (action: string, data?: any) => 
      log('debug', 'map', `지도 상호작용: ${action}`, data, `map-${action}`)
  },

  // 일반 로그
  general: {
    info: (message: string, data?: any) => log('info', 'general', message, data),
    warn: (message: string, data?: any) => log('warn', 'general', message, data),
    error: (message: string, data?: any) => log('error', 'general', message, data),
    debug: (message: string, data?: any) => log('debug', 'general', message, data)
  }
};

/**
 * 개발자 도구 전용 함수들
 */
export const devLogger = {
  // 오직 개발 환경에서만 출력
  trace: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [TRACE] ${message}`, data);
    }
  },
  
  // 임시 디버깅용 (제거 예정 표시)
  temp: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚧 [TEMP] ${message}`, data);
    }
  }
};

/**
 * 로그 설정 조회 (디버깅용)
 */
export const getLoggerConfig = () => config;

/**
 * 런타임 로그 레벨 변경 (개발환경 전용)
 */
export const setLogLevel = (level: LogLevel) => {
  if (process.env.NODE_ENV === 'development') {
    config.level = level;
    console.log(`🔧 로그 레벨 변경: ${level}`);
  }
};