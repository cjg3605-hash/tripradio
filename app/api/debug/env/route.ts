import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // 🔑 환경 변수 존재 여부 확인 (값은 노출하지 않음)
    const envStatus = {
      // AI 서비스
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      GEMINI_KEY_LENGTH: process.env.GEMINI_API_KEY?.length || 0,
      
      // Google Cloud 서비스
      GOOGLE_CLOUD_PROJECT: !!process.env.GOOGLE_CLOUD_PROJECT,
      GOOGLE_APPLICATION_CREDENTIALS: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      GOOGLE_APPLICATION_CREDENTIALS_JSON: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      
      // Google API 서비스
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
      
      // 한국관광공사 API
      KOREA_TOURISM_API_KEY: !!process.env.KOREA_TOURISM_API_KEY,
      
      // 통계청 KOSIS API
      KOSIS_API_KEY: !!process.env.KOSIS_API_KEY,
      
      // 국가유산청 API
      HERITAGE_GIS_API_KEY: !!process.env.HERITAGE_GIS_API_KEY,
      
      // 인증
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      
      // 기타
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      
      // 환경 정보
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    };

    // 🚨 필수 환경 변수 체크
    const criticalMissing: string[] = [];
    
    if (!process.env.GEMINI_API_KEY) {
      criticalMissing.push('GEMINI_API_KEY - AI 가이드 생성에 필수');
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
      criticalMissing.push('SUPABASE_URL - 데이터베이스 연결에 필수');
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY) {
      criticalMissing.push('SUPABASE_ANON_KEY - 데이터베이스 인증에 필수');
    }

    // 🔍 API 키 미리보기 (보안을 위해 일부만 표시)
    const keyPreviews = {
      gemini: process.env.GEMINI_API_KEY ? 
        `${process.env.GEMINI_API_KEY.substring(0, 8)}...${process.env.GEMINI_API_KEY.slice(-4)}` : 'NOT_FOUND',
      supabase_url: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) ? 
        'https://[project-id].supabase.co' : 'NOT_FOUND',
      supabase_key: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) ? 
        'eyJ....[key-preview]' : 'NOT_FOUND'
    };

    // 🧪 서비스 연결 테스트
    let serviceTests = {
      gemini: 'NOT_TESTED',
      supabase: 'NOT_TESTED'
    };

    // Gemini API 테스트
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // 매우 간단한 테스트 요청
        const testPromise = model.generateContent("Test");
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const result = await Promise.race([testPromise, timeoutPromise]);
        serviceTests.gemini = 'CONNECTED ✅';
      } catch (error) {
        serviceTests.gemini = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else {
      serviceTests.gemini = 'API_KEY_NOT_SET ❌';
    }

    // Supabase 연결 테스트
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // 간단한 연결 테스트
        const { data, error } = await supabase
          .from('guides')
          .select('locationname')
          .limit(1);
        
        if (!error) {
          serviceTests.supabase = `CONNECTED ✅ (${data?.length || 0} guides found)`;
        } else {
          serviceTests.supabase = `DATABASE_ERROR: ${error.message}`;
        }
      } catch (error) {
        serviceTests.supabase = `CONNECTION_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else {
      serviceTests.supabase = 'CREDENTIALS_NOT_SET ❌';
    }

    // 📋 진단 결과 및 권장사항
    const diagnostics = {
      overall_status: criticalMissing.length === 0 ? 'HEALTHY ✅' : 'NEEDS_ATTENTION ⚠️',
      missing_count: criticalMissing.length,
      total_env_vars: Object.keys(envStatus).filter(key => envStatus[key as keyof typeof envStatus]).length
    };

    const recommendations = criticalMissing.length > 0 ? [
      '1. .env.local 파일에서 누락된 환경 변수를 설정하세요',
      '2. API 키가 유효한지 확인하세요',  
      '3. Supabase 프로젝트 설정을 다시 확인하세요',
      '4. 서버를 재시작하세요 (npm run dev)'
    ] : [
      '✅ 모든 필수 환경 변수가 설정되어 있습니다',
      '✅ API 서비스 연결이 정상입니다'
    ];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
      envStatus,
      criticalMissing,
      keyPreviews,
      serviceTests,
      recommendations,
      debug_info: {
        env_method: process.env.NODE_ENV === 'development' ? '.env.local' : 'production',
        all_api_keys: Object.keys(process.env).filter(key => 
          key.includes('GEMINI') || key.includes('GOOGLE') || key.includes('API') || key.includes('SUPABASE')
        ).sort()
      }
    });

  } catch (error) {
    console.error('Environment debug error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: `환경변수 진단 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}