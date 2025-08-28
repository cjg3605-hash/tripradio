/**
 * 🔒 환경변수 검증 시스템
 * 서버 시작 시 필수 환경변수 검증 및 설정 가이드 제공
 */

// 필수 환경변수 정의
interface RequiredEnvVars {
  [key: string]: {
    required: boolean;
    description: string;
    fallback?: string[];
    validation?: (value: string) => boolean;
  };
}

const REQUIRED_ENV_VARS: RequiredEnvVars = {
  GEMINI_API_KEY: {
    required: true,
    description: 'Google Gemini AI API 키 - AI 가이드 생성에 필수',
    fallback: ['NEXT_PUBLIC_GEMINI_API_KEY'],
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

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  setupGuide: string[];
}

/**
 * 🔍 환경변수 검증 실행
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const setupGuide: string[] = [];

  console.log('\n🔒 환경변수 검증 시작...');

  for (const [envKey, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = getEnvValue(envKey, config.fallback);
    
    if (!value) {
      if (config.required) {
        errors.push(`❌ ${envKey}: ${config.description}`);
        setupGuide.push(`${envKey}=${getExampleValue(envKey)}`);
      } else {
        warnings.push(`⚠️ ${envKey}: ${config.description} (선택사항)`);
      }
    } else {
      // 값이 존재하면 유효성 검증
      if (config.validation && !config.validation(value)) {
        errors.push(`❌ ${envKey}: 값이 올바르지 않습니다. ${config.description}`);
        setupGuide.push(`${envKey}=${getExampleValue(envKey)}`);
      } else {
        console.log(`✅ ${envKey}: 설정됨 (${value.substring(0, 8)}...)`);
      }
    }
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    console.error('\n❌ 환경변수 검증 실패:');
    errors.forEach(error => console.error(`  ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ 환경변수 경고:');
    warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  if (isValid && warnings.length === 0) {
    console.log('\n✅ 모든 환경변수 검증 완료');
  }

  return {
    isValid,
    errors,
    warnings,
    setupGuide
  };
}

/**
 * 🔍 환경변수 값 가져오기 (폴백 포함)
 */
function getEnvValue(key: string, fallbacks?: string[]): string | undefined {
  // 기본 키 확인
  let value = process.env[key];
  if (value) return value;

  // 폴백 키들 확인
  if (fallbacks) {
    for (const fallbackKey of fallbacks) {
      value = process.env[fallbackKey];
      if (value) {
        console.log(`🔄 ${key} 폴백 사용: ${fallbackKey}`);
        return value;
      }
    }
  }

  return undefined;
}

/**
 * 📋 예시 값 생성
 */
function getExampleValue(envKey: string): string {
  const examples: { [key: string]: string } = {
    GEMINI_API_KEY: 'AIzaSyABC...DEF123 # Google AI Studio에서 생성',
    NEXT_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  };

  return examples[envKey] || 'YOUR_VALUE_HERE';
}

/**
 * 🚨 서버 시작 시 검증 (에러 시 프로세스 종료)
 */
export function validateOnServerStart(): void {
  const result = validateEnvironmentVariables();

  if (!result.isValid) {
    console.error('\n🚨 서버 시작 실패: 필수 환경변수 누락');
    console.error('\n📝 .env.local 파일에 다음 내용을 추가하세요:');
    console.error('=' .repeat(50));
    result.setupGuide.forEach(line => console.error(line));
    console.error('=' .repeat(50));
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
}

/**
 * 🔧 런타임 환경변수 검증 (API 호출 전)
 */
export function validateRuntimeEnv(requiredKeys: string[]): { isValid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];

  for (const key of requiredKeys) {
    const config = REQUIRED_ENV_VARS[key];
    const value = getEnvValue(key, config?.fallback);
    
    if (!value) {
      missingKeys.push(key);
    }
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
}

/**
 * 🎯 특정 서비스별 환경변수 검증
 */
export const ServiceValidators = {
  gemini: () => validateRuntimeEnv(['GEMINI_API_KEY']),
  supabase: () => validateRuntimeEnv(['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'])
};