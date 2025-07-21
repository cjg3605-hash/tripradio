import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getOrCreateGoldenCoordinates } from '@/lib/ai/officialData';

// Types
interface Suggestion {
  name: string;
  location: string;
}

interface CacheItem {
  suggestions: Suggestion[];
  timestamp: number;
}

// Valid languages
const VALID_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es'] as const;
type Language = typeof VALID_LANGUAGES[number];

// Simple in-memory cache implementation
const cache = new Map<string, any>();
const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return cache.get(key) || null;
  },
  set: async (key: string, value: any): Promise<'OK'> => {
    cache.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: any): Promise<'OK'> => {
    cache.set(key, value);
    setTimeout(() => cache.delete(key), seconds * 1000);
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

// Create search prompt with language support
function createSearchPrompt(query: string, language: Language): string {
  const prompts = {
    ko: `사용자 입력 '${query}'와 관련된 여행지 추천을 5개 생성해줘. 각 추천은 반드시 "name"(장소의 전체 이름)과 "location"(도시와 국가 등 간단한 위치) 키를 포함하는 JSON 객체여야 해. 다른 말은 하지 말고, 오직 이 객체들의 배열만 반환해줘.

[
  {"name": "파리 노트르담 대성당", "location": "프랑스, 파리"},
  {"name": "스트라스부르 대성당", "location": "프랑스, 스트라스부르"}
]`,
    en: `Generate 5 travel recommendations related to the user input '${query}'. Each recommendation must be a JSON object with "name" (full name of the place) and "location" (simple location like city and country) keys. Do not say anything else, only return an array of these objects.

[
  {"name": "Notre-Dame Cathedral", "location": "Paris, France"},
  {"name": "Strasbourg Cathedral", "location": "Strasbourg, France"}
]`,
    ja: `ユーザー入力「${query}」に関連する旅行の推薦を5件生成してください。各推薦は必ず「name」（場所のフルネーム）と「location」（都市や国などの簡単な位置）キーを含むJSONオブジェクトでなければなりません。他の言葉は一切言わず、これらのオブジェクトの配列のみを返してください。

[
  {"name": "ノートルダム大聖堂", "location": "フランス、パリ"},
  {"name": "ストラスブール大聖堂", "location": "フランス、スト라スブール"}
]`,
    zh: `根据用户输入"${query}"生成5个旅游推荐。每个推荐必须是包含"name"（地点的全名）和"location"（如城市和国家的简单位置）键的JSON对象。不要说任何其他话，只返回这些对象的数组。

[
  {"name": "巴黎圣母院", "location": "法国, 巴黎"},
  {"name": "斯特拉斯堡主教座堂", "location": "法国, 斯特拉斯堡"}
]`,
    es: `Genera 5 recomendaciones de viaje relacionadas con la entrada del usuario '${query}'. Cada recomendación debe ser un objeto JSON con las claves "name" (nombre completo del lugar) y "location" (ubicación simple como ciudad y país). No digas nada más, solo devuelve un array de estos objetos.

[
  {"name": "Catedral de Notre Dame", "location": "París, Francia"},
  {"name": "Catedral de Estrasburgo", "location": "Estrasburgo, Francia"}
]`
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
      console.log('🔍 검색 쿼리:', query, '언어:', lang);
      console.log('🔑 API 키 상태:', process.env.GEMINI_API_KEY ? '설정됨' : '없음');
      
      const gemini = getGeminiClient();
      console.log('✅ Gemini 클라이언트 생성 성공');
      
      // 모델 우선순위: 최신 → 안정 → 폴백
      const modelNames = [
        'gemini-2.5-flash-lite-preview-06-17', // 최신 미리보기 (재도전!)
        'gemini-2.5-flash',                    // 2.5 시리즈 안정 버전
        'gemini-1.5-flash',                    // 안정된 폴백
        'gemini-1.5-pro'                       // 최종 폴백
      ];
      
      let model;
      let usedModel = '';
      
      for (const modelName of modelNames) {
        try {
          console.log(`🔄 모델 시도: ${modelName}`);
          model = gemini.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 16384, // 대폭 증가: 2048 → 16384
            }
          });
          usedModel = modelName;
          console.log(`✅ 모델 생성 성공: ${modelName}`);
          break;
        } catch (modelError) {
          console.warn(`⚠️ 모델 ${modelName} 생성 실패:`, modelError instanceof Error ? modelError.message : String(modelError));
          continue;
        }
      }
      
      if (!model) {
        throw new Error('사용 가능한 Gemini 모델이 없습니다.');
      }
      
      const prompt = createSearchPrompt(sanitizeInput(query), lang);
      console.log('📝 생성된 프롬프트:', prompt.substring(0, 200) + '...');
      
      // Set timeout for API call (30 seconds)
      const TIMEOUT_MS = 30000; // 30 seconds
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
        const generatePromise = (async () => {
          try {
            console.log(`🚀 Gemini API 호출 시작 (모델: ${usedModel})...`);
            const genResult = await model.generateContent(prompt);
            console.log(`✅ Gemini API 호출 성공 (모델: ${usedModel})`);
            // Check if we've already timed out
            if (Date.now() - startTime >= TIMEOUT_MS) {
              throw new Error('AI 응답 처리 시간이 초과되었습니다.');
            }
            return genResult;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorInfo = error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              ...(error as any).status && { status: (error as any).status },
              ...(error as any).statusText && { statusText: (error as any).statusText },
              ...(error as any).code && { code: (error as any).code },
              ...(error as any).details && { details: (error as any).details }
            } : { message: errorMessage };
            
            console.error('❌ Gemini API 호출 중 상세 오류:', errorInfo);
            
            // 구체적인 오류 분석
            if (errorMessage?.includes('404') || errorMessage?.includes('not found')) {
              throw new Error('모델을 찾을 수 없습니다 (404). 미리보기 모델 접근 권한이나 지역 설정을 확인하세요.');
            } else if (errorMessage?.includes('403') || errorMessage?.includes('permission')) {
              throw new Error('모델 접근 권한이 없습니다 (403). API 키나 프로젝트 권한을 확인하세요.');
            } else if (errorMessage?.includes('400') || errorMessage?.includes('invalid')) {
              throw new Error('잘못된 요청입니다 (400). 모델 파라미터나 프롬프트를 확인하세요.');
            } else if (errorMessage?.includes('region') || errorMessage?.includes('location')) {
              throw new Error('지역 제한 오류입니다. us-central1 지역으로 설정을 변경해보세요.');
            }
            
            throw error;
          }
        })();
        
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
      
      console.log('📨 AI 응답 수신 (길이):', text.length);
      console.log('📄 AI 응답 시작 200자:', text.substring(0, 200));
      
      // Parse response (assuming it's a JSON string)
      let suggestions: Suggestion[] = [];
      
      try {
        // AI가 마크다운 코드 블록을 포함할 수 있으므로, JSON만 추출
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/s);
        const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
        
        console.log('🔍 추출된 JSON 문자열 (길이):', jsonString.length);
        
        const parsed = JSON.parse(jsonString);
        console.log('✅ JSON 파싱 성공');
        
        // 프롬프트가 배열을 반환하도록 지시했으므로, 배열인지 확인
        if (Array.isArray(parsed)) {
          suggestions = parsed.filter(item => item.name && item.location);

          // 입력값이 name에 포함된 항목이 없으면, 직접 추가
          const normalizedQuery = sanitizeInput(query).replace(/\s+/g, '').toLowerCase();
          const hasDirectMatch = suggestions.some(item =>
            item.name.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery)
          );

          if (!hasDirectMatch) {
            suggestions.unshift({
              name: query,
              location: ''
            });
          }
        } else {
          console.warn('⚠️ AI 응답이 배열이 아닙니다. 응답:', parsed);
          suggestions = [];
        }
        
        console.log('✅ 필터링된 제안 수:', suggestions.length);
        
        // Update cache
        const cacheItem: CacheItem = {
          suggestions,
          timestamp: Date.now()
        };
        await kv.setex(cacheKey, CACHE_DURATION, cacheItem);
        
        console.log('✅ 캐시 업데이트 완료');

        return NextResponse.json(
          { 
            success: true, 
            data: suggestions, 
            cached: false 
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
