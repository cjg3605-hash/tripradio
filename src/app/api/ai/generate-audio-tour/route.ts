import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';

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
    const { locationName, userProfile, existingGuideData } = await request.json();

    if (!locationName) {
      return NextResponse.json(
        { success: false, error: '위치 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
              model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    });

    // 🔄 비동기 프롬프트 호출로 변경
    const prompt = await createAutonomousGuidePrompt(locationName, 'ko', userProfile);

    console.log('🎧 오디오 투어 생성 요청:', { locationName, userProfile });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text();

    // JSON 추출
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('올바른 JSON 형식의 응답을 받지 못했습니다.');
    }

    const audioTourData = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());

    // 데이터 검증
    if (!audioTourData.audioIntro || !audioTourData.audioChapters || !audioTourData.audioOutro) {
      throw new Error('필수 오디오 투어 데이터가 누락되었습니다.');
    }

    // 캐시 헤더 설정 (30분)
    const response_headers = {
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
      'Content-Type': 'application/json',
    };

    console.log('✅ 오디오 투어 생성 완료:', {
      location: locationName,
      chapters: audioTourData.audioChapters?.length || 0,
      totalDuration: audioTourData.audioTourInfo?.totalDuration || 'N/A'
    });

    return NextResponse.json(
      {
        success: true,
        data: audioTourData,
        metadata: {
          generatedAt: new Date().toISOString(),
          location: locationName,
          userProfile,
          chaptersCount: audioTourData.audioChapters?.length || 0
        }
      },
      { headers: response_headers }
    );

  } catch (error) {
    console.error('❌ 오디오 투어 생성 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}