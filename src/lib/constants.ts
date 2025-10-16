// Application-wide constants and enums
// Provides consistent naming and values across the codebase

export const APP_CONFIG = {
  name: 'TripRadio.AI',
  description: 'AI-powered personalized travel radio guide service',
  version: '1.0.0',
  supportEmail: 'contact@tripradio.shop'
} as const;

export const SUPPORTED_LANGUAGES = {
  KOREAN: 'ko',
  ENGLISH: 'en',
  JAPANESE: 'ja',
  CHINESE: 'zh',
  SPANISH: 'es'
} as const;

export const LANGUAGE_NAMES = {
  [SUPPORTED_LANGUAGES.KOREAN]: '한국어',
  [SUPPORTED_LANGUAGES.ENGLISH]: 'English',
  [SUPPORTED_LANGUAGES.JAPANESE]: '日本語',
  [SUPPORTED_LANGUAGES.CHINESE]: '中文',
  [SUPPORTED_LANGUAGES.SPANISH]: 'Español'
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

export const CACHE_KEYS = {
  GUIDE: 'guide',
  USER_PROFILE: 'user_profile',
  LOCATION_SEARCH: 'location_search',
  AUDIO_CACHE: 'audio_cache',
  PERSONALITY_DIAGNOSIS: 'personality_diagnosis'
} as const;

export const CACHE_TTL = {
  GUIDE: 24 * 60 * 60 * 1000, // 24 hours
  USER_PROFILE: 7 * 24 * 60 * 60 * 1000, // 7 days
  LOCATION_SEARCH: 60 * 60 * 1000, // 1 hour
  AUDIO_CACHE: 30 * 24 * 60 * 60 * 1000, // 30 days
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 60 * 60 * 1000, // 1 hour
  LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

export const API_ROUTES = {
  // AI-related endpoints
  AI: {
    GENERATE_GUIDE: '/api/ai/generate-guide-with-gemini',
    GENERATE_MULTILANG: '/api/ai/generate-multilang-guide',
    GENERATE_TTS: '/api/ai/generate-tts',
    UPLOAD_AUDIO: '/api/ai/upload-audio'
  },
  
  // Authentication
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNUP: '/api/auth/register',
    EMAIL_VERIFICATION: '/api/auth/email-verification',
    FORCE_LOGOUT: '/api/auth/force-logout',
    DEBUG: '/api/auth/debug'
  },
  
  // Location services
  LOCATION: {
    SEARCH: '/api/locations/search',
    SEARCH_COORDINATES: '/api/locations/search/coordinates',
    RECOMMENDATIONS: '/api/location/recommendations'
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    DEBUG: '/api/admin/debug',
    GRANT_ADMIN: '/api/admin/grant-admin',
    REFRESH_SESSION: '/api/admin/refresh-session',
    SETUP: '/api/admin/setup',
    STATS: {
      GUIDES: '/api/admin/stats/guides',
      LOCATIONS: '/api/admin/stats/locations',
      SYSTEM: '/api/admin/stats/system',
      USERS: '/api/admin/stats/users'
    }
  },
  
  // SEO and indexing
  SEO: {
    BATCH_INDEXING: '/api/seo/batch-indexing',
    RETRY_FAILED: '/api/seo/retry-failed',
    VALIDATE_CONFIG: '/api/seo/validate-config'
  }
} as const;

export const QUALITY_THRESHOLDS = {
  MINIMUM: 0.6,
  GOOD: 0.75,
  EXCELLENT: 0.9
} as const;

export const PERFORMANCE_LIMITS = {
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_GUIDE_LENGTH: 50000, // characters
  MAX_AUDIO_DURATION: 3600, // seconds (1 hour)
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT: 100 // requests per minute
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 768,
    LAPTOP: 1024,
    DESKTOP: 1280
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    POPOVER: 1100,
    TOOLTIP: 1150,
    TOAST: 1200
  }
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  LOCATION_NAME_MAX_LENGTH: 100,
  LOCATION_NAME_MIN_LENGTH: 2,
  GUIDE_TITLE_MAX_LENGTH: 200,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다.',
  RATE_LIMITED: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  GUIDE_GENERATION_FAILED: '가이드 생성에 실패했습니다.',
  AUDIO_GENERATION_FAILED: '오디오 생성에 실패했습니다.',
  INVALID_LOCATION: '올바르지 않은 위치입니다.',
  CACHE_ERROR: '캐시 처리 중 오류가 발생했습니다.',
  VALIDATION_FAILED: '데이터 검증에 실패했습니다.'
} as const;

export const SUCCESS_MESSAGES = {
  GUIDE_GENERATED: '가이드가 성공적으로 생성되었습니다.',
  AUDIO_GENERATED: '오디오가 성공적으로 생성되었습니다.',
  PROFILE_SAVED: '프로필이 저장되었습니다.',
  CACHE_CLEARED: '캐시가 정리되었습니다.',
  EMAIL_VERIFIED: '이메일 인증이 완료되었습니다.',
  LOGOUT_SUCCESS: '성공적으로 로그아웃되었습니다.'
} as const;

// Environment-specific constants
export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  IS_CLIENT: typeof window !== 'undefined',
  IS_SERVER: typeof window === 'undefined'
} as const;