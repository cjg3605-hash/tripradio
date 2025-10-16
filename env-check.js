#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 * 개발 서버 시작 전 필수 환경 변수들을 체크합니다.
 */

// .env.local 파일 로드
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GEMINI_API_KEY'
];

const optionalEnvVars = [
  'GOOGLE_PLACES_API_KEY',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

console.log('🔍 환경 변수 검증 중...');

let missingRequired = [];
let missingOptional = [];

// 필수 환경 변수 체크
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingRequired.push(envVar);
  } else {
    console.log(`✅ ${envVar}: 설정됨`);
  }
}

// 선택적 환경 변수 체크
for (const envVar of optionalEnvVars) {
  if (!process.env[envVar]) {
    missingOptional.push(envVar);
  } else {
    console.log(`✅ ${envVar}: 설정됨`);
  }
}

// 결과 출력
if (missingRequired.length > 0) {
  console.error('\n❌ 필수 환경 변수가 누락되었습니다:');
  missingRequired.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n.env.local 파일을 확인해주세요.');
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.warn('\n⚠️ 선택적 환경 변수가 누락되었습니다:');
  missingOptional.forEach(envVar => {
    console.warn(`   - ${envVar}`);
  });
  console.warn('일부 기능이 제한될 수 있습니다.\n');
}

console.log('✅ 환경 변수 검증 완료!');