import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // 모든 가능한 환경변수 소스 확인
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('🔍 상세 환경변수 디버깅:', {
      // 기본 체크
      hasEnvVar: !!apiKey,
      keyLength: apiKey?.length || 0,
      startsWithAI: apiKey?.startsWith('AI') || false,
      nodeEnv: process.env.NODE_ENV,
      
      // 추가 디버깅 정보
      processEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI')),
      allEnvKeys: Object.keys(process.env).length,
      cwd: process.cwd(),
      
      // Next.js 특정 체크
      nextConfigEnv: process.env.GEMINI_API_KEY ? 'found in process.env' : 'not found',
      
      // 다양한 접근 방법 시도
      directAccess: process.env['GEMINI_API_KEY'],
      bracketAccess: process.env?.GEMINI_API_KEY,
    });

    // 대체 환경변수명들도 확인
    const alternativeKeys = [
      'GEMINI_API_KEY',
      'GOOGLE_GEMINI_API_KEY', 
      'GOOGLE_AI_API_KEY',
      'AI_API_KEY'
    ];

    console.log('🔍 대체 키 확인:', 
      alternativeKeys.reduce((acc, key) => {
        acc[key] = process.env[key] ? `${process.env[key]?.substring(0, 10)}...` : 'not found';
        return acc;
      }, {} as Record<string, string>)
    );

    if (!apiKey) {
      console.log('❌ API 키가 설정되지 않음');
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'GEMINI_API_KEY not configured',
          setup_required: true,
          debug: {
            checkedKeys: alternativeKeys,
            foundKeys: Object.keys(process.env).filter(key => key.toLowerCase().includes('api')),
            envFileExists: require('fs').existsSync('.env.local')
          }
        },
        { status: 503 }
      );
    }

    // 실제 Gemini API 테스트 호출 - 최신 모델명 사용
    try {
      console.log('🤖 Gemini API 연결 테스트 중...');
      
      const genAI = new GoogleGenerativeAI(apiKey);
      // 최신 모델명으로 변경
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = "안녕하세요라고 간단히 인사해주세요.";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini API 연결 성공:', text.substring(0, 50));

      return NextResponse.json({
        status: 'ok',
        message: 'API is ready and tested',
        services: {
          gemini: 'connected and tested',
          model: 'gemini-1.5-flash',
          testResponse: text.substring(0, 100)
        }
      });

    } catch (apiError: any) {
      console.error('❌ Gemini API 연결 실패:', apiError.message);
      
      // 모델명이 문제일 수 있으므로 다른 모델명도 시도
      if (apiError.message.includes('not found') || apiError.message.includes('404')) {
        try {
          console.log('🔄 대체 모델 gemini-1.5-pro 시도 중...');
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
          
          const prompt = "안녕하세요라고 간단히 인사해주세요.";
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          console.log('✅ Gemini API 연결 성공 (gemini-1.5-pro):', text.substring(0, 50));

          return NextResponse.json({
            status: 'ok',
            message: 'API is ready and tested',
            services: {
              gemini: 'connected and tested',
              model: 'gemini-1.5-pro',
              testResponse: text.substring(0, 100)
            }
          });
        } catch (secondError: any) {
          console.error('❌ 대체 모델도 실패:', secondError.message);
        }
      }
      
      return NextResponse.json({
        status: 'error',
        message: 'Gemini API connection failed',
        error: apiError.message,
        suggestion: 'Model name might need updating. Try gemini-1.5-flash or gemini-1.5-pro',
        debug: {
          apiKeyProvided: !!apiKey,
          keyLength: apiKey?.length || 0,
          errorType: apiError.constructor.name
        }
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 