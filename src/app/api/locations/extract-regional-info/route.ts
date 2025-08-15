import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 20;

// Initialize Gemini AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * 🤖 Gemini 기반 정확한 지역 정보 추출 (전용 API)
 */
async function extractRegionalInfoAccurate(
  placeName: string, 
  language: string = 'ko'
): Promise<{ region: string; country: string; countryCode: string }> {
  const MAX_RETRIES = 3;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 Gemini 지역 정보 추출 (${attempt}/${MAX_RETRIES}): "${placeName}"`);
      
      const gemini = getGeminiClient();
      const model = gemini.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          temperature: attempt === 1 ? 0.05 : 0.1,
          maxOutputTokens: 400,
          topK: 20,
          topP: 0.8,
        }
      });

      const prompt = `
입력: "${placeName}"

중요: 정확한 지리적 위치를 찾기 위해 다음을 고려하세요:
- 동명의 장소들이 여러 지역에 있을 수 있습니다
- 가장 유명하고 관광지로 알려진 위치를 선택하세요
- 정확한 위치 정보가 중요합니다

정확한 지역 정보 추출을 위한 체크리스트:
✓ 1. 장소명 확인: "${placeName}"의 정확한 위치는?
✓ 2. 도시 검증: 어느 도시에 위치하는가?
✓ 3. 지역 확인: 해당 도시가 속한 지역/주는?
✓ 4. 국가 확인: 어느 나라에 위치하는가?

📋 국가코드 참조:
- 한국: KOR, 중국: CHN, 일본: JPN, 태국: THA, 베트남: VNM
- 프랑스: FRA, 영국: GBR, 독일: DEU, 이탈리아: ITA, 스페인: ESP  
- 미국: USA, 캐나다: CAN, 호주: AUS, 브라질: BRA, 아르헨티나: ARG

위 체크리스트를 모두 확인한 후 정확한 JSON으로만 응답:
{
  "name": "${placeName}",
  "city": "정확한 도시명 (영어)",
  "region": "지역/주명 (영어)",
  "country": "국가명 (한국어)",
  "countryCode": "ISO 3166-1 alpha-3 코드",
  "confidence": "신뢰도 (0-1)"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`📄 Gemini 응답:`, text.substring(0, 200));
      
      // JSON 파싱
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // 필수 필드 검증
          if (parsed.countryCode && parsed.region && parsed.country) {
            console.log(`✅ Gemini 지역 정보 추출 성공 (시도 ${attempt}):`, {
              region: parsed.region,
              country: parsed.country,
              countryCode: parsed.countryCode,
              confidence: parsed.confidence || 'N/A'
            });
            
            return {
              region: parsed.region,
              country: parsed.country,
              countryCode: parsed.countryCode
            };
          } else {
            throw new Error(`필수 필드 누락: ${JSON.stringify(parsed)}`);
          }
        } else {
          throw new Error(`JSON 형식을 찾을 수 없음`);
        }
      } catch (parseError) {
        console.log(`❌ JSON 파싱 실패 (시도 ${attempt}):`, parseError);
        throw parseError;
      }
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Gemini API 시도 ${attempt} 실패:`, error);
      
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ ${1000 * attempt}ms 대기 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }
  
  // Emergency fallback
  console.error(`🚨 Gemini API ${MAX_RETRIES}회 모두 실패, Emergency fallback 사용`);
  return emergencyLocationFallback(placeName);
}

/**
 * 🆘 Emergency 장소명 기반 추론
 */
function emergencyLocationFallback(placeName: string): { region: string; country: string; countryCode: string } {
  const name = placeName.toLowerCase();
  
  const explicitPatterns = {
    'THA': {
      keywords: ['대왕궁', 'grand palace', '왓아룬', '왓포', '방콕', 'bangkok'],
      country: '태국',
      defaultRegion: 'Bangkok'
    },
    'JPN': {
      keywords: ['도쿄', 'tokyo', '오사카', 'osaka', '교토', 'kyoto', '후지산'],
      country: '일본',
      defaultRegion: 'Tokyo'
    },
    'CHN': {
      keywords: ['베이징', 'beijing', '상하이', 'shanghai', '만리장성', 'great wall'],
      country: '중국',
      defaultRegion: 'Beijing'
    },
    'FRA': {
      keywords: ['에펠탑', 'eiffel tower', '루브르', 'louvre', '파리', 'paris'],
      country: '프랑스',
      defaultRegion: 'Paris'
    },
    'USA': {
      keywords: ['자유의여신상', 'statue of liberty', '뉴욕', 'new york'],
      country: '미국',
      defaultRegion: 'New York'
    },
    'GBR': {
      keywords: ['빅벤', 'big ben', '런던', 'london', '버킹엄궁전'],
      country: '영국',
      defaultRegion: 'London'
    },
    'ITA': {
      keywords: ['콜로세움', 'colosseum', '로마', 'rome', '베네치아'],
      country: '이탈리아',
      defaultRegion: 'Rome'
    },
    'ESP': {
      keywords: ['사그라다파밀리아', 'sagrada familia', '바르셀로나', 'barcelona'],
      country: '스페인',
      defaultRegion: 'Madrid'
    }
  };
  
  for (const [countryCode, data] of Object.entries(explicitPatterns)) {
    if (data.keywords.some(keyword => name.includes(keyword))) {
      console.log(`🎯 Emergency fallback 매칭: ${placeName} → ${countryCode}`);
      return {
        region: data.defaultRegion,
        country: data.country,
        countryCode: countryCode
      };
    }
  }
  
  // 매칭 실패 시 UNK 처리
  console.error(`🚨 Emergency fallback 실패: "${placeName}"`);
  return {
    region: 'Unknown',
    country: '알 수 없음',
    countryCode: 'UNK'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeName, language = 'ko' } = body;

    if (!placeName || typeof placeName !== 'string') {
      return NextResponse.json({
        success: false,
        error: '장소명이 필요합니다.'
      }, { status: 400 });
    }

    console.log('🌍 지역 정보 추출 요청:', { placeName, language });

    // 지역 정보 추출
    const regionalInfo = await extractRegionalInfoAccurate(placeName, language);

    console.log('✅ 지역 정보 추출 완료:', regionalInfo);

    return NextResponse.json({
      success: true,
      data: {
        placeName,
        region: regionalInfo.region,
        country: regionalInfo.country,
        countryCode: regionalInfo.countryCode
      },
      source: 'gemini_extraction'
    });

  } catch (error) {
    console.error('❌ 지역 정보 추출 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      source: 'extraction_api_error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}