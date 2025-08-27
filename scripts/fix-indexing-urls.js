#!/usr/bin/env node
// scripts/fix-indexing-urls.js
// 색인 서비스 URL 생성 로직 수정 및 검증 도구

const fs = require('fs');
const path = require('path');

/**
 * 색인 서비스 URL 생성 로직 수정
 */
function fixIndexingUrls() {
  console.log('🔧 색인 서비스 URL 생성 로직 수정\n');
  
  const indexingServicePath = path.join(__dirname, '../src/lib/seo/indexingService.ts');
  
  try {
    let content = fs.readFileSync(indexingServicePath, 'utf8');
    
    // 기존 generateGuideUrls 함수 찾기
    const originalFunction = `  generateGuideUrls(locationName: string): string[] {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
    const languages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
    
    // 번역 모듈 동적 import (optional)
    try {
      const { generateLocalizedGuideUrls } = require('./locationTranslation');
      const localizedUrls = generateLocalizedGuideUrls(locationName);
      return localizedUrls.map(item => item.url);
    } catch (error) {
      console.log('📝 번역 모듈 없음, 기본 방식 사용:', error);
      // 기본 방식 (한국어 장소명 사용)
      return languages.map(lang => 
        \`\${baseUrl}/guide/\${encodeURIComponent(locationName)}?lang=\${lang}\`
      );
    }
  }`;

    // 수정된 함수
    const newFunction = `  generateGuideUrls(locationName: string): string[] {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
    const languages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
    
    // 번역 모듈 동적 import (optional)
    try {
      const { generateLocalizedGuideUrls } = require('./locationTranslation');
      const localizedUrls = generateLocalizedGuideUrls(locationName);
      return localizedUrls.map(item => item.url);
    } catch (error) {
      console.log('📝 번역 모듈 없음, 기본 방식 사용:', error);
      
      // 올바른 URL 패턴 생성
      const urls: string[] = [];
      
      // 기본 한국어 URL (lang 파라미터 없음)
      urls.push(\`\${baseUrl}/guide/\${encodeURIComponent(locationName)}\`);
      
      // 각 언어별 URL (lang 파라미터 포함)
      languages.forEach(lang => {
        if (lang !== 'ko') { // 한국어는 이미 추가했으므로 제외
          urls.push(\`\${baseUrl}/guide/\${encodeURIComponent(locationName)}?lang=\${lang}\`);
        }
      });
      
      return urls;
    }
  }`;

    // 함수 교체
    if (content.includes('generateGuideUrls(locationName: string): string[] {')) {
      // 함수 시작부터 끝까지 정확히 찾아서 교체
      const functionStart = content.indexOf('  generateGuideUrls(locationName: string): string[] {');
      const functionEnd = content.indexOf('  }', functionStart) + 3; // '  }' 포함
      
      const beforeFunction = content.substring(0, functionStart);
      const afterFunction = content.substring(functionEnd);
      
      content = beforeFunction + newFunction + afterFunction;
      
      // 파일 백업
      const backupPath = indexingServicePath + '.backup.' + Date.now();
      fs.writeFileSync(backupPath, fs.readFileSync(indexingServicePath));
      console.log(`📋 백업 생성: ${backupPath}`);
      
      // 수정된 내용 저장
      fs.writeFileSync(indexingServicePath, content);
      console.log('✅ IndexingService URL 생성 로직 수정 완료');
      
      return true;
    } else {
      console.log('⚠️ generateGuideUrls 함수를 찾을 수 없습니다.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 파일 수정 실패:', error.message);
    return false;
  }
}

/**
 * 랜딩 페이지 URL 생성 함수 추가
 */
function addLandingPageUrlGeneration() {
  console.log('🏢 랜딩 페이지 URL 생성 함수 추가\n');
  
  const indexingServicePath = path.join(__dirname, '../src/lib/seo/indexingService.ts');
  
  try {
    let content = fs.readFileSync(indexingServicePath, 'utf8');
    
    // 랜딩 페이지 URL 생성 함수 추가
    const landingPageFunction = `
  // 랜딩 페이지 URL 생성
  generateLandingPageUrls(): string[] {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
    const languages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
    
    const landingPages = [
      '', // 홈페이지
      'ai-travel',
      'destinations', 
      'docent',
      'travel-radio',
      'tour-radio',
      'audio-guide',
      'free-travel',
      'visa-checker',
      'trip-planner',
      'film-locations',
      'nomad-calculator'
    ];
    
    const urls: string[] = [];
    
    // 각 랜딩 페이지별 다국어 URL 생성
    landingPages.forEach(page => {
      languages.forEach(lang => {
        if (page === '') {
          // 홈페이지
          if (lang === 'ko') {
            urls.push(baseUrl);
          } else {
            urls.push(\`\${baseUrl}?lang=\${lang}\`);
          }
        } else {
          // 다른 페이지들
          if (lang === 'ko') {
            urls.push(\`\${baseUrl}/\${page}\`);
          } else {
            urls.push(\`\${baseUrl}/\${page}?lang=\${lang}\`);
          }
        }
      });
    });
    
    return urls;
  }`;

    // 함수가 이미 있는지 확인
    if (!content.includes('generateLandingPageUrls()')) {
      // generateGuideUrls 함수 다음에 추가
      const insertPoint = content.indexOf('  }', content.indexOf('generateGuideUrls')) + 3;
      const beforeInsert = content.substring(0, insertPoint);
      const afterInsert = content.substring(insertPoint);
      
      content = beforeInsert + landingPageFunction + afterInsert;
      
      fs.writeFileSync(indexingServicePath, content);
      console.log('✅ 랜딩 페이지 URL 생성 함수 추가 완료');
      
      return true;
    } else {
      console.log('ℹ️ 랜딩 페이지 URL 생성 함수가 이미 존재합니다.');
      return true;
    }
    
  } catch (error) {
    console.error('❌ 랜딩 페이지 함수 추가 실패:', error.message);
    return false;
  }
}

/**
 * URL 생성 테스트
 */
async function testUrlGeneration() {
  console.log('🧪 URL 생성 테스트\n');
  
  try {
    // 수정된 모듈 다시 로드 (캐시 클리어)
    const indexingServicePath = path.resolve(__dirname, '../src/lib/seo/indexingService.ts');
    if (require.cache[indexingServicePath]) {
      delete require.cache[indexingServicePath];
    }
    
    // 간단한 URL 생성 테스트
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
    const locationName = '경복궁';
    const languages = ['ko', 'en', 'ja', 'zh', 'es'];
    
    console.log('📋 생성될 URL 패턴:');
    console.log(`   기본 URL: ${baseUrl}/guide/${encodeURIComponent(locationName)}`);
    
    languages.forEach(lang => {
      if (lang !== 'ko') {
        console.log(`   ${lang.toUpperCase()} URL: ${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=${lang}`);
      }
    });
    
    console.log('\n🏢 랜딩 페이지 URL 예시:');
    console.log(`   홈페이지: ${baseUrl}`);
    console.log(`   홈페이지 영어: ${baseUrl}?lang=en`);
    console.log(`   AI 여행: ${baseUrl}/ai-travel`);
    console.log(`   AI 여행 영어: ${baseUrl}/ai-travel?lang=en`);
    
    // 실제 URL 접근성 테스트
    console.log('\n🔍 실제 URL 접근성 테스트:');
    const testUrls = [
      `${baseUrl}`,
      `${baseUrl}/guide/${encodeURIComponent(locationName)}`,
      `${baseUrl}/guide/${encodeURIComponent(locationName)}?lang=en`,
      `${baseUrl}/ai-travel`,
      `${baseUrl}/ai-travel?lang=en`
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
        const status = response.status;
        console.log(`   ${status >= 200 && status < 400 ? '✅' : '❌'} ${url} (${status})`);
      } catch (error) {
        console.log(`   ❌ ${url} (오류: ${error.message})`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ URL 생성 테스트 실패:', error.message);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix-all';
  
  console.log('🔧 색인 URL 수정 도구\n');
  
  switch (command) {
    case 'fix-urls':
      fixIndexingUrls();
      break;
      
    case 'add-landing':
      addLandingPageUrlGeneration();
      break;
      
    case 'test':
      await testUrlGeneration();
      break;
      
    case 'fix-all':
      console.log('🚀 전체 수정 프로세스 시작\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const urlsFixed = fixIndexingUrls();
      if (!urlsFixed) {
        console.log('❌ URL 수정 실패, 프로세스 중단');
        return;
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const landingAdded = addLandingPageUrlGeneration();
      if (!landingAdded) {
        console.log('❌ 랜딩 페이지 함수 추가 실패');
        return;
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await testUrlGeneration();
      
      console.log('\n🎉 모든 수정 완료!');
      console.log('💡 다음 단계: 개발 서버를 재시작하고 색인 테스트를 실행하세요.');
      break;
      
    case 'help':
    default:
      console.log('📖 사용법:');
      console.log('   node scripts/fix-indexing-urls.js <command>');
      console.log('');
      console.log('📋 명령어:');
      console.log('   fix-urls     - URL 생성 로직 수정');
      console.log('   add-landing  - 랜딩 페이지 URL 생성 함수 추가');
      console.log('   test         - URL 생성 테스트');
      console.log('   fix-all      - 전체 수정 프로세스');
      console.log('   help         - 도움말');
      break;
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = {
  fixIndexingUrls,
  addLandingPageUrlGeneration,
  testUrlGeneration
};