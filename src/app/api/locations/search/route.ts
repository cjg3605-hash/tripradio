import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
type Suggestion = {
  name: string;
  location: string;
};

type CacheItem = {
  suggestions: Suggestion[];
  timestamp: number;
};

// Constants
const CACHE_DURATION = 30 * 60 * 1000; // 30분

import getConfig from 'next/config';

// Initialize Gemini AI with safe config access
function getGeminiClient() {
  // Get server-side config
  const { serverRuntimeConfig } = getConfig();
  
  if (!serverRuntimeConfig) {
    console.error('Server runtime config not available');
    throw new Error('Server configuration error');
  }
  
  const apiKey = serverRuntimeConfig.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured in server runtime config');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error('Failed to initialize AI service');
  }
}

// Server-side memory cache (Note: In serverless, this is per-instance)
const searchCache = new Map<string, CacheItem>();

// 언어별 검색 프롬프트 생성
function createSearchPrompt(query: string, language: string): string {
  const prompts = {
    ko: `"${query}"와 관련된 유명한 관광명소 5개를 JSON 배열로만 답하세요.

중요 지시사항:
1. 검색어 자체가 명소명이라면 반드시 첫 번째로 포함하세요
2. 같은 도시/지역의 다른 주요 명소들을 포함하세요
3. 유사한 유형의 명소들을 포함하세요

형식: [{"name":"명소명","location":"국가, 도시"}]
예: [{"name":"세비야 대성당","location":"스페인, 세비야"}]
모든 답변을 한국어로 작성하세요.`,

    en: `Suggest 5 famous tourist attractions related to "${query}" in JSON array format only.

Important instructions:
1. If the search term is already an attraction name, include it as the first result
2. Include other major attractions in the same city/region
3. Include similar types of attractions

Format: [{"name":"attraction name","location":"country, city"}]
Example: [{"name":"Seville Cathedral","location":"Spain, Seville"}]
Write all responses in English.`,

    ja: `"${query}"に関連する有名な観光地5つをJSON配列形式のみで答えてください。

重要な指示:
1. 検索語が既に観光地名の場合、最初の結果として含めてください
2. 同じ都市/地域の他の主要な観光地を含めてください
3. 似たタイプの観光地を含めてください

形式: [{"name":"観光地名","location":"国、都市"}]
例: [{"name":"セビリア大聖堂","location":"スペイン、セビリア"}]
すべての回答を日本語で書いてください。`,

    zh: `请提供5个与"${query}"相关的著名旅游景点，仅用JSON数组格式回答。

重要指示:
1. 如果搜索词本身就是景点名称，请将其作为第一个结果
2. 包含同一城市/地区的其他主要景点
3. 包含类似类型的景点

格式: [{"name":"景点名称","location":"国家, 城市"}]
例如: [{"name":"塞维利亚大教堂","location":"西班牙, 塞维利亚"}]
请用中文回答所有内容。`,

    es: `Sugiere 5 atracciones turísticas famosas relacionadas con "${query}" solo en formato de array JSON.

Instrucciones importantes:
1. Si el término de búsqueda ya es un nombre de atracción, inclúyelo como primer resultado
2. Incluye otras atracciones principales en la misma ciudad/región
3. Incluye atracciones de tipo similar

Formato: [{"name":"nombre de la atracción","location":"país, ciudad"}]
Ejemplo: [{"name":"Catedral de Sevilla","location":"España, Sevilla"}]
Escribe todas las respuestas en español.`
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang') || 'ko';

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: true, suggestions: [] },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=300',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Check cache first
    const cacheKey = `${query}:${language}`;
    const cached = searchCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log('Returning cached results for:', query);
      return NextResponse.json(
        { success: true, suggestions: cached.suggestions },
        { 
          status: 200,
          headers: {
            'Cache-Control': `public, max-age=${Math.floor((CACHE_DURATION - (now - cached.timestamp)) / 1000)}`,
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Age': `${Math.floor((now - cached.timestamp) / 1000)}s`
          }
        }
      );
    }

    // Initialize Gemini client
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const prompt = createSearchPrompt(query, language);
    console.log('Searching for:', query, 'in', language);

    // Generate content with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the response
    let suggestions: Suggestion[] = [];
    try {
      // Try to parse as JSON array
      const jsonMatch = text.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to simple parsing
        const lines = text.split('\n').filter(line => line.trim());
        suggestions = lines
          .map(line => {
            const match = line.match(/"([^"]+)"\s*,\s*"([^"]+)"/);
            return match ? { name: match[1], location: match[2] } : null;
          })
          .filter((s): s is Suggestion => s !== null);
      }

      // Validate suggestions
      if (!Array.isArray(suggestions) || !suggestions.every(s => 
        typeof s?.name === 'string' && typeof s?.location === 'string'
      )) {
        throw new Error('Invalid suggestion format');
      }

      // Cache the results
      searchCache.set(cacheKey, {
        suggestions,
        timestamp: now
      });

      return NextResponse.json(
        { success: true, suggestions },
        { 
          status: 200,
          headers: {
            'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}, stale-while-revalidate=3600`,
            'Content-Type': 'application/json',
            'X-Cache': 'MISS',
            'X-Cache-TTL': `${CACHE_DURATION / 1000}`
          }
        }
      );

    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse search results',
          ...(process.env.NODE_ENV === 'development' && { 
            details: parseError instanceof Error ? parseError.message : 'Unknown error',
            rawResponse: text
          })
        },
        { status: 422 }
      );
    }

  } catch (error) {
    console.error('Search API Error:', error);
    const isTimeout = error instanceof Error && error.message.includes('timeout');
    const statusCode = isTimeout ? 504 : 500;
    const errorMessage = isTimeout 
      ? 'Request timeout' 
      : 'Failed to process search request';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
          'X-Error-Type': isTimeout ? 'timeout' : 'server_error'
        }
      }
    );
  }
}