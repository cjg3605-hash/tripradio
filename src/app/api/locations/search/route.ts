import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOrCreateGoldenCoordinates } from '@/lib/ai/officialData';
import { 
  deduplicateAndSelectRepresentative, 
  getDeduplicationDebugInfo,
  type Suggestion as DeduplicationSuggestion,
  type DeduplicationConfig
} from '@/lib/location/autocomplete-deduplication';

// Types
interface Suggestion {
  name: string;
  location: string;
  metadata?: {
    isOfficial?: boolean;
    category?: string;
    popularity?: number;
  };
}

interface CacheItem {
  suggestions: Suggestion[];
  timestamp: number;
}

// Valid languages
const VALID_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es'] as const;
type Language = typeof VALID_LANGUAGES[number];

// 크기 제한이 있는 LRU 캐시 구현
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize = 100; // 최대 100개 항목

  get(key: string): T | null {
    const value = this.cache.get(key);
    if (value) {
      // LRU: 접근한 항목을 맨 뒤로 이동
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  setex(key: string, seconds: number, value: T): void {
    this.set(key, value);
    setTimeout(() => this.cache.delete(key), seconds * 1000);
  }
}

const cache = new LRUCache<any>();
const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return cache.get(key) as T | null;
  },
  set: async (key: string, value: any): Promise<'OK'> => {
    cache.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: any): Promise<'OK'> => {
    cache.setex(key, seconds, value);
    return 'OK';
  }
} as const;

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, {count: number, resetAt: number}>;
  private readonly windowMs: number;
  private readonly max: number;

  constructor(max: number, windowMs: number) {
    this.requests = new Map();
    this.max = max;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    if (process.env.NODE_ENV === 'development') {
      return { 
        success: true,
        limit: this.max,
        remaining: this.max,
        reset: 10
      };
    }

    const now = Date.now();
    const record = this.requests.get(identifier) || { count: 0, resetAt: now + this.windowMs };

    // Reset if window has passed
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + this.windowMs;
    }

    // Increment request count
    record.count++;
    this.requests.set(identifier, record);

    // Calculate remaining time and requests
    const remaining = Math.max(0, this.max - record.count);
    const reset = Math.ceil((record.resetAt - now) / 1000);

    return {
      success: record.count <= this.max,
      limit: this.max,
      remaining,
      reset
    };
  }
}

// Rate limiter instance (10 requests per 10 seconds)
const rateLimiter = new RateLimiter(10, 10 * 1000);

// CORS headers
function setCorsHeaders(headers: Headers) {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return headers;
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';
// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';

// Cache configuration (30 minutes in seconds)
const CACHE_DURATION = 30 * 60;


// Initialize Gemini AI with environment variable
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Generate cache key
function generateCacheKey(query: string, language: string): string {
  return `location:${language}:${query.toLowerCase().trim()}`;
}

// Sanitize input to prevent prompt injection and XSS
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"\']/g, '') // Remove HTML tags
    .replace(/[^\w\s가-힣-.,!?]/gi, '') // Allow basic punctuation
    .trim()
    .substring(0, 200); // Limit input length
}

// Create optimized autocomplete prompt (minimal tokens)
function createSearchPrompt(query: string, language: Language): string {
  const prompts = {
    ko: `'${query}' 자동완성: 입력 텍스트가 포함된 정확한 장소명 8개. 다양한 표현 포함. JSON 배열만 반환:
[{"name": "장소명", "location": "도시, 국가", "metadata": {"isOfficial": true/false, "category": "관광지/박물관/자연", "popularity": 1-10}}]`,
    
    en: `Autocomplete '${query}': 8 places containing input text. Include variations. JSON array only:
[{"name": "place name", "location": "city, country", "metadata": {"isOfficial": true/false, "category": "tourist/museum/nature", "popularity": 1-10}}]`,
    
    ja: `'${query}' 自動完成: 入力文字を含む場所8件. 様々な表現含む. JSON配列のみ:
[{"name": "場所名", "location": "都市, 国", "metadata": {"isOfficial": true/false, "category": "観光地/博物館/自然", "popularity": 1-10}}]`,
    
    zh: `'${query}' 自动完成: 包含输入文本的地点8个. 包含多种表达. 仅JSON数组:
[{"name": "地点名", "location": "城市, 国家", "metadata": {"isOfficial": true/false, "category": "旅游/博物馆/自然", "popularity": 1-10}}]`,
    
    es: `Autocompletar '${query}': 8 lugares con texto. Incluir variaciones. Solo JSON:
[{"name": "lugar", "location": "ciudad, país", "metadata": {"isOfficial": true/false, "category": "turístico/museo/natural", "popularity": 1-10}}]`
  };
  return prompts[language] || prompts.ko;
}

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  const headers = new Headers();
  setCorsHeaders(headers);
  headers.set('Allow', 'GET, OPTIONS');
  
  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function GET(request: NextRequest) {
  // Set CORS headers
  const headers = new Headers();
  setCorsHeaders(headers);
  
  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  
  try {
    // Apply rate limiting
    if (process.env.NODE_ENV !== 'development') {
      const ip = request.headers.get('x-forwarded-for') || 'anonymous';
      const limitResult = await rateLimiter.limit(ip);
      
      if (!limitResult.success) {
        headers.set('Content-Type', 'application/json');
        headers.set('Retry-After', limitResult.reset?.toString() || '10');
        headers.set('X-RateLimit-Limit', limitResult.limit?.toString() || '10');
        headers.set('X-RateLimit-Remaining', limitResult.remaining?.toString() || '0');
        headers.set('X-RateLimit-Reset', limitResult.reset?.toString() || '10');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Too many requests. Please try again later.',
            ...(process.env.NODE_ENV !== 'production' && {
              limit: limitResult.limit,
              remaining: limitResult.remaining,
              reset: limitResult.reset
            })
          }),
          { 
            status: 429, 
            headers,
          }
        );
      }
    }

    // Get query parameters with validation
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = (searchParams.get('lang') || 'ko') as Language;

    // Validate input
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '유효한 검색어를 입력해주세요' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate query length
    if (query.length < 2 || query.length > 200) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '검색어는 2자 이상 200자 이하로 입력해주세요' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize and validate language
    const lang = VALID_LANGUAGES.includes(language) ? language : 'ko';
    
    // Check cache
    const cacheKey = generateCacheKey(query, lang);
    const cached = await kv.get<CacheItem>(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION * 1000)) {
      return NextResponse.json(
        { success: true, data: cached.suggestions, cached: true },
        { headers }
      );
    }

    // Generate response using Gemini AI
    try {
      const gemini = getGeminiClient();
      const model = gemini.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.1,    // 더 일관된 결과
          maxOutputTokens: 512, // 토큰 수 대폭 감소
          topP: 0.8,           // 더 집중된 응답
          topK: 10             // 선택 범위 제한
        }
      });
      
      const prompt = createSearchPrompt(sanitizeInput(query), lang);
      
      // Set timeout for API call (optimized for autocomplete)
      const TIMEOUT_MS = 8000; // 8 seconds for fast autocomplete
      const startTime = Date.now();
      
      // Create a promise that will reject after the timeout
      const createTimeoutPromise = (ms: number) => {
        return new Promise<never>((_, reject) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            reject(new Error('AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'));
          }, ms);
        });
      };
      
      let result, response, text;
      
      try {
        // Make the API call
        const generatePromise = model.generateContent(prompt);
        
        // Race between the API call and the timeout
        result = await Promise.race([
          generatePromise,
          createTimeoutPromise(TIMEOUT_MS)
        ]) as any;
        
        response = await result.response;
        text = await response.text();
      } catch (apiError) {
        console.error('API 처리 중 오류 발생:', apiError);
        throw apiError;
      }
      
      
      // Parse response (assuming it's a JSON string)
      let suggestions: Suggestion[] = [];
      
      try {
        // AI가 마크다운 코드 블록을 포함할 수 있으므로, JSON만 추출
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
        const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
        
        const parsed = JSON.parse(jsonString);
        
        // 프롬프트가 배열을 반환하도록 지시했으므로, 배열인지 확인
        if (Array.isArray(parsed)) {
          const filteredSuggestions = parsed.filter(item => item.name && item.location);
          
          // 중복 제거 및 대표 장소 선택 적용
          const deduplicationConfig: DeduplicationConfig = {
            maxResults: 5,
            similarityThreshold: 0.75,
            preferOfficialNames: true
          };
          
          suggestions = deduplicateAndSelectRepresentative(
            filteredSuggestions as DeduplicationSuggestion[], 
            deduplicationConfig
          );
          
          // 디버그 정보 (개발 환경에서만)
          if (process.env.NODE_ENV === 'development') {
            const debugInfo = getDeduplicationDebugInfo(
              filteredSuggestions as DeduplicationSuggestion[],
              suggestions as DeduplicationSuggestion[],
              deduplicationConfig
            );
            console.log('🔍 중복 제거 디버그 정보:', debugInfo);
          }
        }
        
        // Update cache
        const cacheItem: CacheItem = {
          suggestions,
          timestamp: Date.now()
        };
        await kv.setex(cacheKey, CACHE_DURATION, cacheItem);

        return NextResponse.json(
          { 
            success: true, 
            data: suggestions, 
            cached: false,
            ...(process.env.NODE_ENV === 'development' && {
              debug: {
                originalCount: parsed?.length || 0,
                deduplicatedCount: suggestions.length
              }
            })
          },
          { headers }
        );
        
      } catch (parseError) {
        console.error('❌ AI 응답 처리 실패:', parseError);
        console.error('❌ 오류 발생한 응답 내용:', text);
        return NextResponse.json(
          { 
            success: false, 
            error: 'AI 응답 처리에 실패했습니다',
            details: parseError instanceof Error ? parseError.message : '알 수 없는 오류',
            ...(process.env.NODE_ENV === 'development' && {
              responsePreview: text ? (text.length > 200 ? text.substring(0, 200) + '...' : text) : 'No response content'
            })
          },
          { status: 500, headers }
        );
      }
      
    } catch (error) {
      console.error('❌ 요청 처리 중 오류 발생:', error);
      
      // Handle different error types
      let errorMessage = '서버 내부 오류가 발생했습니다';
      let statusCode = 500;
      
      if (error instanceof Error) {
        const errMsg = error.message;
        if (errMsg.includes('timeout') || errMsg.includes('time out')) {
          errorMessage = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
          statusCode = 504; // Gateway Timeout
        } else if (errMsg.includes('API key') || errMsg.includes('인증')) {
          errorMessage = '인증 오류가 발생했습니다. 관리자에게 문의해주세요.';
          statusCode = 401; // Unauthorized
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          ...(process.env.NODE_ENV === 'development' && {
            message: error instanceof Error ? error.message : String(error),
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
          })
        },
        { 
          status: statusCode, 
          headers: { 
            ...Object.fromEntries(headers.entries()),
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          } 
        }
      );
    }
  } catch (error) {
    console.error('❌ 처리되지 않은 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '처리 중 예기치 않은 오류가 발생했습니다',
        ...(process.env.NODE_ENV === 'development' && {
          message: error instanceof Error ? error.message : String(error)
        })
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// === 골든레코드 기반 좌표 자동화 엔드포인트 ===
export async function POST(req) {
  try {
    const { locationName, language } = await req.json();
    if (!locationName || !language) {
      return new Response(JSON.stringify({ success: false, error: '필수 파라미터 누락' }), { status: 400 });
    }
    const coordinates = await getOrCreateGoldenCoordinates(locationName, language);
    return new Response(JSON.stringify({ success: true, coordinates }), { status: 200 });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
