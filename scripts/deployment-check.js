#!/usr/bin/env node
// 배포 환경 안정성 검증 스크립트

const fs = require('fs');
const path = require('path');

console.log('🚀 배포 환경 안정성 검증 시작\n');

// 필수 환경 변수 목록
const REQUIRED_ENV_VARS = [
  'GEMINI_API_KEY',
  'GOOGLE_CLOUD_PROJECT', 
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

// 선택적 환경 변수 목록 
const OPTIONAL_ENV_VARS = [
  'GOOGLE_API_KEY',
  'KOREA_TOURISM_API_KEY',
  'SENTRY_DSN',
  'VERCEL_ANALYTICS_ID'
];

let hasErrors = false;

// 1. 환경 변수 검증
console.log('📋 1. 환경 변수 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 필수 환경 변수 확인
for (const envVar of REQUIRED_ENV_VARS) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ 필수: ${envVar} - 누락`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('_here')) {
    console.log(`⚠️  필수: ${envVar} - 기본값 사용 중`);
    hasErrors = true;
  } else {
    console.log(`✅ 필수: ${envVar} - 설정됨`);
  }
}

// 선택적 환경 변수 확인
for (const envVar of OPTIONAL_ENV_VARS) {
  const value = process.env[envVar];
  if (!value) {
    console.log(`ℹ️  선택: ${envVar} - 미설정`);
  } else if (value.includes('your_') || value.includes('_here')) {
    console.log(`⚠️  선택: ${envVar} - 기본값 사용 중`);
  } else {
    console.log(`✅ 선택: ${envVar} - 설정됨`);
  }
}

// 2. 파일 시스템 검증
console.log('\n📁 2. 파일 시스템 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const criticalFiles = [
  'package.json',
  'next.config.js',
  ['tailwind.config.ts', 'tailwind.config.js'],
  'tsconfig.json',
  '.env.example'
];

for (const file of criticalFiles) {
  if (Array.isArray(file)) {
    // 대안 파일들 중 하나라도 존재하면 OK
    const found = file.some(f => fs.existsSync(path.join(process.cwd(), f)));
    if (found) {
      const foundFile = file.find(f => fs.existsSync(path.join(process.cwd(), f)));
      console.log(`✅ ${foundFile} - 존재`);
    } else {
      console.log(`❌ ${file.join(' 또는 ')} - 누락`);
      hasErrors = true;
    }
  } else {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - 존재`);
    } else {
      console.log(`❌ ${file} - 누락`);
      hasErrors = true;
    }
  }
}

// 3. 빌드 디렉토리 확인
console.log('\n🏗️  3. 빌드 상태 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ .next 디렉토리 - 존재');
  
  // 빌드 매니페스트 확인
  const buildManifest = path.join(nextDir, 'BUILD_ID');
  if (fs.existsSync(buildManifest)) {
    const buildId = fs.readFileSync(buildManifest, 'utf8').trim();
    console.log(`✅ BUILD_ID - ${buildId}`);
  } else {
    console.log('⚠️  BUILD_ID - 누락 (빌드 재실행 권장)');
  }
} else {
  console.log('❌ .next 디렉토리 - 누락 (빌드 필요)');
  hasErrors = true;
}

// 4. 의존성 검증
console.log('\n📦 4. 의존성 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const nodeModules = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModules)) {
  console.log('✅ node_modules - 설치됨');
} else {
  console.log('❌ node_modules - 누락 (npm install 필요)');
  hasErrors = true;
}

const packageLock = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(packageLock)) {
  console.log('✅ package-lock.json - 존재');
} else {
  console.log('⚠️  package-lock.json - 누락 (의존성 버전 고정 권장)');
}

// 5. 보안 검증
console.log('\n🔒 5. 보안 설정 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// .env.local 파일이 .gitignore에 있는지 확인
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env.local')) {
    console.log('✅ .env.local이 .gitignore에 포함됨');
  } else {
    console.log('⚠️  .env.local이 .gitignore에 누락 (보안 위험)');
  }
} else {
  console.log('❌ .gitignore 파일 누락');
  hasErrors = true;
}

// NEXTAUTH_SECRET 강도 확인
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (nextAuthSecret) {
  if (nextAuthSecret.length >= 32) {
    console.log('✅ NEXTAUTH_SECRET - 충분한 길이');
  } else {
    console.log('⚠️  NEXTAUTH_SECRET - 너무 짧음 (32자 이상 권장)');
  }
}

// 6. 배포 환경별 설정 확인
console.log('\n🌐 6. 배포 환경 설정');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`📍 NODE_ENV: ${nodeEnv}`);

const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nodeEnv === 'production' && !nextAuthUrl.startsWith('https://')) {
    console.log('⚠️  프로덕션 환경에서 NEXTAUTH_URL이 HTTPS가 아님');
  } else {
    console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl}`);
  }
}

// 7. 최종 결과
console.log('\n🎯 7. 배포 준비 상태');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (hasErrors) {
  console.log('❌ 배포 준비 상태: 불완전');
  console.log('위 항목들을 수정한 후 다시 검증하세요.');
  process.exit(1);
} else {
  console.log('✅ 배포 준비 상태: 양호');
  console.log('배포를 진행할 수 있습니다.');
}

// 8. 권장 사항
console.log('\n💡 권장 사항');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• npm run build로 최종 빌드 테스트 수행');
console.log('• npm run type-check로 타입 검사 수행');
console.log('• npm run lint로 코드 품질 검사 수행');
console.log('• 프로덕션 환경에서 HTTPS 사용 필수');
console.log('• 정기적인 의존성 업데이트 (npm audit)');
console.log('• 백업 및 모니터링 설정 권장');