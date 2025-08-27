// src/app/api/seo/validate-config/route.ts
// 색인 시스템 설정 검증 API

import { NextRequest, NextResponse } from 'next/server';
import { validateIndexingConfiguration } from '@/lib/seo/indexingService';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 색인 시스템 설정 검증 시작');

    // 기본 설정 검증
    const configValidation = validateIndexingConfiguration();
    
    // 환경 변수 상세 확인
    const envCheck = {
      GOOGLE_SERVICE_ACCOUNT_KEY: {
        exists: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        isBase64: false,
        isValidJson: false,
        hasRequiredFields: false
      },
      NEXT_PUBLIC_BASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_BASE_URL,
        isValidUrl: false,
        value: process.env.NEXT_PUBLIC_BASE_URL || null
      }
    };

    // Base64 및 JSON 검증
    if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.exists) {
      try {
        const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
        
        // Base64 형식 확인
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.isBase64 = base64Regex.test(key);
        
        if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.isBase64) {
          // JSON 파싱 시도
          const decoded = Buffer.from(key, 'base64').toString('utf-8');
          const jsonData = JSON.parse(decoded);
          
          envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.isValidJson = true;
          
          // 필수 필드 확인
          const requiredFields = [
            'type', 'project_id', 'private_key_id', 'private_key',
            'client_email', 'client_id', 'auth_uri', 'token_uri'
          ];
          
          envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.hasRequiredFields = 
            requiredFields.every(field => jsonData[field]);
            
        }
      } catch (error) {
        console.log('❌ Google Service Account Key 검증 실패:', error);
      }
    }

    // URL 검증
    if (envCheck.NEXT_PUBLIC_BASE_URL.exists) {
      try {
        new URL(envCheck.NEXT_PUBLIC_BASE_URL.value!);
        envCheck.NEXT_PUBLIC_BASE_URL.isValidUrl = true;
      } catch {
        envCheck.NEXT_PUBLIC_BASE_URL.isValidUrl = false;
      }
    }

    // Google API 연결 테스트 시도
    let googleApiTest = {
      canInitialize: false,
      error: null as string | null
    };

    if (configValidation.isValid) {
      try {
        // 실제 API 호출은 하지 않고 인증 객체 생성만 테스트
        const { google } = require('googleapis');
        const keyData = JSON.parse(
          Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!, 'base64').toString('utf-8')
        );

        const auth = new google.auth.GoogleAuth({
          credentials: keyData,
          scopes: ['https://www.googleapis.com/auth/indexing']
        });

        googleApiTest.canInitialize = true;
      } catch (error: any) {
        googleApiTest.error = error?.message || 'Unknown error';
      }
    }

    // 샘플 URL 생성 테스트
    const sampleUrls = envCheck.NEXT_PUBLIC_BASE_URL.isValidUrl ? [
      `${envCheck.NEXT_PUBLIC_BASE_URL.value}/guide/ko/경복궁`,
      `${envCheck.NEXT_PUBLIC_BASE_URL.value}/guide/en/경복궁`,
      `${envCheck.NEXT_PUBLIC_BASE_URL.value}/guide/ko/제주도`
    ] : [];

    // 종합 점수 계산
    let score = 0;
    let maxScore = 0;

    // Google 설정 (60점)
    maxScore += 60;
    if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.exists) score += 10;
    if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.isBase64) score += 10;
    if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.isValidJson) score += 15;
    if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.hasRequiredFields) score += 15;
    if (googleApiTest.canInitialize) score += 10;

    // URL 설정 (40점)
    maxScore += 40;
    if (envCheck.NEXT_PUBLIC_BASE_URL.exists) score += 20;
    if (envCheck.NEXT_PUBLIC_BASE_URL.isValidUrl) score += 20;

    const overallScore = Math.round((score / maxScore) * 100);

    // 상태 결정
    let status: 'ready' | 'partial' | 'needs_setup';
    if (overallScore >= 90) {
      status = 'ready';
    } else if (overallScore >= 50) {
      status = 'partial';
    } else {
      status = 'needs_setup';
    }

    const result = {
      success: true,
      status,
      overallScore,
      isReady: configValidation.isValid && googleApiTest.canInitialize,
      
      // 상세 검증 결과
      validation: configValidation,
      environmentVariables: envCheck,
      googleApiTest,
      
      // 설정 가이드
      setupInstructions: configValidation.recommendations,
      sampleUrls,
      
      // 다음 단계
      nextSteps: generateNextSteps(status, configValidation, envCheck, googleApiTest),
      
      // 테스트 명령어
      testCommands: {
        manualIndexing: `curl -X POST ${envCheck.NEXT_PUBLIC_BASE_URL.value || 'https://navidocent.com'}/api/seo/request-indexing -H "Content-Type: application/json" -d '{"url":"${envCheck.NEXT_PUBLIC_BASE_URL.value || 'https://navidocent.com'}/guide/ko/테스트장소"}'`,
        newGuideGeneration: `curl -X POST ${envCheck.NEXT_PUBLIC_BASE_URL.value || 'https://navidocent.com'}/api/node/ai/generate-guide -H "Content-Type: application/json" -d '{"locationName":"테스트장소","language":"ko"}'`
      }
    };

    console.log(`✅ 색인 시스템 검증 완료 - 상태: ${status} (${overallScore}점)`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 색인 설정 검증 실패:', error);
    
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      overallScore: 0,
      isReady: false
    }, { status: 500, headers });
  }
}

export async function GET() {
  // GET 요청도 같은 검증 수행
  return POST({} as NextRequest);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}

// 다음 단계 가이드 생성
function generateNextSteps(
  status: string, 
  configValidation: any, 
  envCheck: any, 
  googleApiTest: any
): string[] {
  const steps: string[] = [];

  if (status === 'needs_setup') {
    steps.push('📋 INDEXING_SETUP_GUIDE.md 파일을 참고하여 초기 설정을 완료하세요.');
    
    if (!envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.exists) {
      steps.push('🔑 Google Cloud Console에서 서비스 계정을 생성하고 JSON 키를 다운로드하세요.');
    }
    
    if (!envCheck.NEXT_PUBLIC_BASE_URL.exists) {
      steps.push('🌐 .env.local 파일에 NEXT_PUBLIC_BASE_URL을 설정하세요.');
    }
  }

  if (status === 'partial') {
    if (envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.exists && !envCheck.GOOGLE_SERVICE_ACCOUNT_KEY.isValidJson) {
      steps.push('🔧 Google Service Account Key의 Base64 인코딩을 다시 확인하세요.');
    }
    
    if (!googleApiTest.canInitialize) {
      steps.push('🔐 Google Search Console에서 서비스 계정에 소유자 권한을 부여하세요.');
    }
  }

  if (status === 'ready') {
    steps.push('🎉 모든 설정이 완료되었습니다! 새 가이드를 생성하여 자동 색인을 테스트해보세요.');
    steps.push('📊 색인 상태는 데이터베이스의 indexing_requests 테이블에서 확인할 수 있습니다.');
    steps.push('🔄 주기적으로 /api/seo/retry-failed API를 호출하여 실패한 색인을 재시도하세요.');
  }

  return steps;
}