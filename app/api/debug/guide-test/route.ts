import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName = '테스트위치', language = 'ko' } = body;

    console.log(`🔍 가이드 생성 디버그 테스트 시작: ${locationName}, ${language}`);

    // 1단계: API 키 확인
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY 없음');
      return NextResponse.json({
        success: false,
        error: 'API 키 없음',
        step: 'api_key_check'
      }, { status: 400 });
    }

    console.log(`✅ API 키 확인: ${apiKey.length}자, 시작: ${apiKey.substring(0, 10)}...`);

    // 2단계: Gemini 클라이언트 초기화
    let genAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      console.log(`✅ GoogleGenerativeAI 클라이언트 초기화 성공`);
    } catch (error) {
      console.error('❌ GoogleGenerativeAI 초기화 실패:', error);
      return NextResponse.json({
        success: false,
        error: `클라이언트 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        step: 'client_initialization'
      }, { status: 400 });
    }

    // 3단계: 모델 가져오기
    let model;
    try {
      model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topK: 40,
          topP: 0.9,
        }
      });
      console.log(`✅ Gemini 모델 설정 완료: gemini-2.0-flash-exp`);
    } catch (error) {
      console.error('❌ 모델 설정 실패:', error);
      return NextResponse.json({
        success: false,
        error: `모델 설정 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        step: 'model_setup'
      }, { status: 400 });
    }

    // 4단계: 간단한 프롬프트로 테스트
    const testPrompt = `${locationName}에 대해 50자 이내로 간단히 설명해주세요. 언어: ${language}`;
    
    try {
      console.log(`🤖 AI 호출 시작: "${testPrompt}"`);
      
      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`📥 AI 응답 수신: ${text.length}자`);
      console.log(`📄 응답 내용 미리보기: ${text.substring(0, 100)}...`);

      return NextResponse.json({
        success: true,
        data: {
          prompt: testPrompt,
          response: text,
          response_length: text.length,
          model_used: 'gemini-2.0-flash-exp',
          api_key_length: apiKey.length,
          timestamp: new Date().toISOString()
        },
        message: '가이드 생성 API 테스트 성공'
      });

    } catch (error) {
      console.error('❌ AI 호출 실패:', error);
      
      // 에러 상세 분석
      const errorDetails = {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined,
        // Google AI 특정 에러 정보
        status: (error as any)?.status,
        statusText: (error as any)?.statusText,
        code: (error as any)?.code
      };

      return NextResponse.json({
        success: false,
        error: 'AI 호출 실패',
        step: 'ai_generation',
        error_details: errorDetails,
        debug_info: {
          api_key_available: !!apiKey,
          api_key_length: apiKey?.length,
          prompt_used: testPrompt,
          model_name: 'gemini-2.0-flash-exp'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error(`❌ 가이드 생성 디버그 테스트 실패:`, error);
    
    return NextResponse.json({
      success: false,
      error: `디버그 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      step: 'request_processing'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "가이드 생성 디버그 엔드포인트입니다. POST 요청으로 테스트하세요.",
    usage: "POST /api/debug/guide-test",
    body: {
      locationName: "테스트할 위치명 (선택)",
      language: "언어 코드 (기본: ko)"
    }
  });
}