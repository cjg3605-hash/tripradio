#!/usr/bin/env node

/**
 * 동적 환경변수 테스트 스크립트
 */

console.log('🧪 동적 환경변수 테스트 시작...\n');

// 1. 현재 설정 출력
console.log('📋 현재 환경변수:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT || '설정 안됨'}`);
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '설정 안됨'}`);
console.log('');

// 2. 동적 설정 테스트
console.log('🔄 동적 설정 테스트:');

// next.config.js의 동적 설정 테스트
process.env.PORT = '3045';
require('./next.config.js');

console.log(`   설정된 PORT: ${process.env.PORT}`);
console.log(`   동적 NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log('');

// 3. 런타임 설정 테스트
console.log('🚀 런타임 설정 테스트:');

try {
  const { getRuntimeConfig } = require('./src/lib/config/runtime-config');
  
  const runtimeConfig = getRuntimeConfig();
  console.log('   Runtime Config:', {
    port: runtimeConfig.port,
    protocol: runtimeConfig.protocol,
    baseUrl: runtimeConfig.baseUrl,
    nextAuthUrl: runtimeConfig.nextAuthUrl
  });
} catch (error) {
  console.log('   ❌ 런타임 설정 로드 실패:', error.message);
}

console.log('');

// 4. 다양한 포트로 테스트
console.log('🔢 다양한 포트 테스트:');
const testPorts = [3000, 3030, 3040, 8080];

for (const port of testPorts) {
  process.env.PORT = port.toString();
  const nextAuthUrl = `http://localhost:${port}`;
  console.log(`   PORT ${port} → NEXTAUTH_URL: ${nextAuthUrl}`);
}

console.log('\n✅ 동적 환경변수 테스트 완료!');

console.log('\n📝 사용법:');
console.log('   npm run dev:auto    # 자동 포트 감지 후 개발 서버 시작');
console.log('   PORT=3045 npm run dev  # 특정 포트로 시작 (자동 NEXTAUTH_URL 설정)');
console.log('   node test-dynamic-env.js  # 이 테스트 스크립트 실행');