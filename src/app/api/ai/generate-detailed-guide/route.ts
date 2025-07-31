import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { enhanceGuideWithQuality } from '@/lib/quality/quality-integration';

// Initialize Gemini AI with direct environment variable access
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error('Failed to initialize AI service');
  }
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient();
    const body = await request.json();
    const { location, userPreferences } = body;

    if (!location) {
      return NextResponse.json(
        { error: 'location이 필요합니다.' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
              model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 16384 // 대폭 증가: 2048 → 16384
      }
    });

    const prompt = `다음 관광지에 대한 상세한 가이드를 작성해주세요:
    
위치: ${location}
사용자 선호사항: ${JSON.stringify(userPreferences)}

다음 형식으로 응답해주세요:
{
  "location": "${location}",
  "overview": "관광지 개요",
  "history": "역사적 배경",
  "highlights": ["주요 볼거리1", "주요 볼거리2", "주요 볼거리3"],
  "tips": ["팁1", "팁2", "팁3"],
  "estimatedTime": "예상 소요시간",
  "bestTime": "방문하기 좋은 시간"
}

JSON 형식으로만 응답해주세요.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    try {
      const guideData = JSON.parse(text);
      
      // 🎯 품질 검증 및 자동 개선 적용
      console.log('🔍 생성된 가이드 품질 검증 중...');
      const qualityEnhancedResult = await enhanceGuideWithQuality(location, guideData);
      
      return NextResponse.json({
        success: qualityEnhancedResult.success,
        data: qualityEnhancedResult.data,
        quality: qualityEnhancedResult.quality,
        caching: qualityEnhancedResult.caching
      });
    } catch (parseError) {
      // 파싱 실패 시에도 품질 검증 시도
      const fallbackData = {
        location,
        content: text,
        raw: true
      };
      
      console.log('🔍 파싱 실패한 가이드 품질 검증 중...');
      const qualityEnhancedResult = await enhanceGuideWithQuality(location, fallbackData);
      
      return NextResponse.json({
        success: qualityEnhancedResult.success,
        data: qualityEnhancedResult.data,
        quality: qualityEnhancedResult.quality,
        caching: qualityEnhancedResult.caching,
        parseWarning: '원본 JSON 파싱 실패로 품질 개선 적용됨'
      });
    }

  } catch (error) {
    console.error('AI 가이드 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: '가이드 생성 중 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
} 