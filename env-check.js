/**
 * 🔒 환경변수 검증 스크립트 - 서버 시작 전 실행
 * npm run dev 명령어에서 자동으로 실행됩니다.
 */

const { validateOnServerStart } = require('./src/lib/env-validator.ts');

// TypeScript 파일을 바로 실행하기 위해 ts-node 대신 간단한 구현
const fs = require('fs');
const path = require('path');

// .env.local 파일 로드
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value.trim();
    }
  });
}

// 필수 환경변수 검증
const requiredVars = {
  GEMINI_API_KEY: {
    required: true,
    description: 'Google Gemini AI API 키 - AI 가이드 생성에 필수',
    fallback: ['NEXT_PUBLIC_GEMINI_API_KEY'],
    validation: (value) => value.startsWith('AIza') && value.length > 30
  },
  GOOGLE_PLACES_API_KEY: {
    required: false,
    description: 'Google Places API 키 - 정확한 지역 정보 추출용 (폴백 시스템 있음)',
    validation: (value) => value.startsWith('AIza') && value.length > 30
  },
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase 프로젝트 URL - 데이터베이스 연결에 필수',
    fallback: ['SUPABASE_URL'],
    validation: (value) => value.includes('supabase.co')
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase 익명 키 - 데이터베이스 인증에 필수',
    fallback: ['SUPABASE_ANON_KEY'],
    validation: (value) => value.startsWith('eyJ') && value.length > 100
  }
};

function getEnvValue(key, fallbacks = []) {
  let value = process.env[key];
  if (value) return value;

  for (const fallbackKey of fallbacks) {
    value = process.env[fallbackKey];
    if (value) {
      console.log(`🔄 ${key} 폴백 사용: ${fallbackKey}`);
      return value;
    }
  }

  return undefined;
}

function validateEnvironmentVariables() {
  const errors = [];
  const warnings = [];
  const setupGuide = [];

  console.log('\n🔒 환경변수 검증 시작...');

  for (const [envKey, config] of Object.entries(requiredVars)) {
    const value = getEnvValue(envKey, config.fallback);
    
    if (!value) {
      if (config.required) {
        errors.push(`❌ ${envKey}: ${config.description}`);
        setupGuide.push(`${envKey}=${getExampleValue(envKey)}`);
      } else {
        warnings.push(`⚠️ ${envKey}: ${config.description} (선택사항)`);
      }
    } else {
      if (config.validation && !config.validation(value)) {
        errors.push(`❌ ${envKey}: 값이 올바르지 않습니다. ${config.description}`);
        setupGuide.push(`${envKey}=${getExampleValue(envKey)}`);
      } else {
        console.log(`✅ ${envKey}: 설정됨 (${value.substring(0, 8)}...)`);
      }
    }
  }

  return { errors, warnings, setupGuide };
}

function getExampleValue(envKey) {
  const examples = {
    GEMINI_API_KEY: 'AIzaSyABC...DEF123 # Google AI Studio에서 생성',
    GOOGLE_PLACES_API_KEY: 'AIzaSyAXYZ...ABC456 # Google Cloud Console에서 생성',
    NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  };

  return examples[envKey] || 'YOUR_VALUE_HERE';
}

// 검증 실행
const result = validateEnvironmentVariables();

if (result.errors.length > 0) {
  console.error('\n🚨 서버 시작 실패: 필수 환경변수 누락');
  console.error('\n📝 .env.local 파일에 다음 내용을 추가하세요:');
  console.error('='.repeat(50));
  result.setupGuide.forEach(line => console.error(line));
  console.error('='.repeat(50));
  console.error('\n🔗 설정 가이드:');
  console.error('1. Google AI Studio: https://aistudio.google.com/app/apikey');
  console.error('2. Google Cloud Console: https://console.cloud.google.com/apis/credentials');
  console.error('3. Supabase: https://supabase.com/dashboard/project/[your-project]/settings/api');
  console.error('\n💡 설정 후 서버를 다시 시작하세요: npm run dev\n');
  
  process.exit(1);
}

if (result.warnings.length > 0) {
  console.warn('\n⚠️ 일부 선택적 환경변수가 설정되지 않았습니다.');
  console.warn('폴백 시스템이 작동하지만, 최적의 성능을 위해 설정을 권장합니다.\n');
}

console.log('\n✅ 환경변수 검증 완료. 서버를 시작합니다...\n');