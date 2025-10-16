#!/usr/bin/env node

/**
 * 동적 환경변수 설정 스크립트
 * 개발 서버 시작 전에 자동으로 환경변수를 설정합니다.
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

// 사용 가능한 포트 찾기
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('사용 가능한 포트를 찾을 수 없습니다.');
}

// 포트 사용 가능 여부 확인
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, '127.0.0.1', () => {
      server.close();
      resolve(true);
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// 환경변수 파일 업데이트
function updateEnvFile(port) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('⚠️  .env.local 파일이 없습니다. 새로 생성합니다.');
  }
  
  const nextAuthUrl = `http://localhost:${port}`;
  
  // NEXTAUTH_URL 업데이트 또는 추가
  const nextAuthUrlPattern = /^NEXTAUTH_URL=.*/m;
  const nextAuthUrlQuotedPattern = /^NEXTAUTH_URL=".*"/m;
  
  if (nextAuthUrlPattern.test(envContent)) {
    envContent = envContent.replace(nextAuthUrlPattern, `NEXTAUTH_URL=${nextAuthUrl}`);
  } else if (nextAuthUrlQuotedPattern.test(envContent)) {
    envContent = envContent.replace(nextAuthUrlQuotedPattern, `NEXTAUTH_URL="${nextAuthUrl}"`);
  } else {
    envContent += `\n# 동적으로 설정된 NextAuth URL\nNEXTAUTH_URL=${nextAuthUrl}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ 동적 환경변수 설정 완료: NEXTAUTH_URL=${nextAuthUrl}`);
}

// 메인 실행 함수
async function main() {
  try {
    const requestedPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    
    // 요청된 포트가 사용 가능한지 확인
    let targetPort = requestedPort;
    if (!(await isPortAvailable(requestedPort))) {
      console.log(`⚠️  포트 ${requestedPort}이 사용 중입니다. 다른 포트를 찾는 중...`);
      targetPort = await findAvailablePort(requestedPort);
      console.log(`✅ 사용 가능한 포트 발견: ${targetPort}`);
    }
    
    // 환경변수 업데이트
    updateEnvFile(targetPort);
    
    // PORT 환경변수 설정 (이 세션용)
    process.env.PORT = targetPort.toString();
    
    console.log(`🚀 포트 ${targetPort}에서 개발 서버를 시작할 수 있습니다.`);
    
  } catch (error) {
    console.error('❌ 동적 환경변수 설정 실패:', error.message);
    process.exit(1);
  }
}

// 직접 실행된 경우에만 main 함수 실행
if (require.main === module) {
  main();
}

module.exports = { findAvailablePort, updateEnvFile };