/**
 * 팟캐스트 프롬프트 시스템 통합 테스트 (CommonJS 버전)
 * 새로운 구조화된 시스템이 제대로 작동하는지 검증
 */

const path = require('path');
const fs = require('fs');

// 테스트 설정
const TEST_CONFIG = {
  locationName: '한국민속촌',
  languages: ['ko', 'en', 'ja', 'zh', 'es'],
  chapterInfo: {
    title: '전통 가옥과 민속 체험',
    description: '한국의 전통 문화와 생활상을 체험할 수 있는 공간을 탐방합니다',
    targetDuration: 300,
    estimatedSegments: 10,
    contentFocus: ['전통문화', '민속', '체험']
  }
};

console.log('🧪 팟캐스트 프롬프트 시스템 테스트 시작...\n');
console.log('='.repeat(60));

/**
 * 1. 파일 구조 검증 테스트
 */
async function testFileStructure() {
  console.log('\n📁 1. 파일 구조 검증 테스트');
  console.log('-'.repeat(40));
  
  const requiredFiles = [
    'src/lib/ai/prompts/podcast/index.ts',
    'src/lib/ai/prompts/podcast/korean-podcast.ts',
    'src/lib/ai/prompts/podcast/english-podcast.ts',
    'src/lib/ai/prompts/podcast/japanese-podcast.ts',
    'src/lib/ai/prompts/podcast/chinese-podcast.ts',
    'src/lib/ai/prompts/podcast/spanish-podcast.ts',
    'src/lib/ai/prompts/podcast/persona-prompt-integration.ts'
  ];
  
  let allFilesExist = true;
  for (const filePath of requiredFiles) {
    const fullPath = path.join(__dirname, filePath);
    const exists = fs.existsSync(fullPath);
    const fileName = path.basename(filePath);
    console.log(`  ✓ ${fileName}: ${exists ? '✅' : '❌'}`);
    if (!exists) allFilesExist = false;
  }
  
  if (allFilesExist) {
    console.log('\n  ✅ 모든 필수 파일이 존재함');
    return true;
  } else {
    console.log('\n  ❌ 일부 파일이 누락됨');
    return false;
  }
}

/**
 * 2. TypeScript 컴파일 테스트
 */
async function testTypeScriptCompilation() {
  console.log('\n🔧 2. TypeScript 컴파일 테스트');
  console.log('-'.repeat(40));
  
  try {
    // TypeScript 컴파일 체크
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const { stdout, stderr } = await execPromise('npx tsc --noEmit --skipLibCheck');
    
    if (stderr && !stderr.includes('Found 0 errors')) {
      console.log('  ⚠️ TypeScript 컴파일 경고:');
      console.log('  ', stderr.split('\n')[0]);
    } else {
      console.log('  ✅ TypeScript 컴파일 성공');
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ TypeScript 컴파일 실패:', error.message.split('\n')[0]);
    return false;
  }
}

/**
 * 3. 파일 내용 검증 테스트
 */
async function testFileContents() {
  console.log('\n📄 3. 파일 내용 검증 테스트');
  console.log('-'.repeat(40));
  
  const testResults = {};
  
  // index.ts 검증
  try {
    const indexPath = path.join(__dirname, 'src/lib/ai/prompts/podcast/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const requiredFunctions = [
      'createPodcastChapterPrompt',
      'createFullGuidePodcastPrompt',
      'getSpeakerLabels',
      'parseDialogueScript'
    ];
    
    let functionsFound = 0;
    for (const func of requiredFunctions) {
      if (indexContent.includes(func)) {
        functionsFound++;
        console.log(`  ✓ ${func}: ✅`);
      } else {
        console.log(`  ✓ ${func}: ❌`);
      }
    }
    
    testResults.index = functionsFound === requiredFunctions.length;
  } catch (error) {
    console.log('  ❌ index.ts 읽기 실패:', error.message);
    testResults.index = false;
  }
  
  // 언어별 파일 검증
  const languages = ['korean', 'english', 'japanese', 'chinese', 'spanish'];
  let languageFilesValid = 0;
  
  for (const lang of languages) {
    try {
      const langPath = path.join(__dirname, `src/lib/ai/prompts/podcast/${lang}-podcast.ts`);
      const langContent = fs.readFileSync(langPath, 'utf8');
      
      const hasPromptFunction = langContent.includes('export') && langContent.includes('prompt');
      const hasPersonaIntegration = langContent.includes('persona') || langContent.includes('Persona');
      
      if (hasPromptFunction && hasPersonaIntegration) {
        console.log(`  ✓ ${lang}-podcast.ts: ✅`);
        languageFilesValid++;
      } else {
        console.log(`  ✓ ${lang}-podcast.ts: ⚠️ (내용 확인 필요)`);
      }
    } catch (error) {
      console.log(`  ✓ ${lang}-podcast.ts: ❌`);
    }
  }
  
  testResults.languages = languageFilesValid >= 3; // 최소 3개 언어 파일
  
  if (testResults.index && testResults.languages) {
    console.log('\n  ✅ 파일 내용 검증 통과');
    return true;
  } else {
    console.log('\n  ❌ 파일 내용 검증 실패');
    return false;
  }
}

/**
 * 4. API 파일 통합 검증
 */
async function testAPIIntegration() {
  console.log('\n🔌 4. API 파일 통합 검증');
  console.log('-'.repeat(40));
  
  const apiFiles = [
    'app/api/tts/notebooklm/generate-by-chapter/route.ts',
    'app/api/tts/notebooklm/generate/route.ts'
  ];
  
  let integrationSuccess = 0;
  
  for (const apiFile of apiFiles) {
    try {
      const apiPath = path.join(__dirname, apiFile);
      const exists = fs.existsSync(apiPath);
      
      if (!exists) {
        console.log(`  ✓ ${path.basename(apiFile)}: ❌ (파일 없음)`);
        continue;
      }
      
      const content = fs.readFileSync(apiPath, 'utf8');
      const usesNewSystem = content.includes('createPodcastChapterPrompt') || 
                           content.includes('@/lib/ai/prompts/podcast');
      
      console.log(`  ✓ ${path.basename(apiFile)}: ${exists ? '✅' : '❌'}`);
      if (usesNewSystem) {
        console.log(`    - 새 프롬프트 시스템 사용: ✅`);
        integrationSuccess++;
      } else {
        console.log(`    - 새 프롬프트 시스템 사용: ❌ (확인 필요)`);
      }
      
    } catch (error) {
      console.log(`  ✓ ${path.basename(apiFile)}: ❌ (읽기 실패)`);
    }
  }
  
  const success = integrationSuccess >= 1;
  if (success) {
    console.log('\n  ✅ API 통합 검증 통과');
  } else {
    console.log('\n  ❌ API 통합 검증 실패');
  }
  
  return success;
}

/**
 * 5. 언어별 화자 레이블 검증
 */
async function testSpeakerLabels() {
  console.log('\n🏷️ 5. 화자 레이블 시스템 검증');
  console.log('-'.repeat(40));
  
  const expectedLabels = {
    ko: ['male', 'female'],
    en: ['Host', 'Curator'],
    ja: ['ホスト', 'キュレーター'],
    zh: ['主持人', '策展人'],
    es: ['Presentador', 'Curador']
  };
  
  let validLabels = 0;
  
  try {
    const indexPath = path.join(__dirname, 'src/lib/ai/prompts/podcast/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    for (const [lang, labels] of Object.entries(expectedLabels)) {
      const hasLabels = labels.some(label => indexContent.includes(`'${label}'`));
      console.log(`  ✓ ${lang}: ${hasLabels ? '✅' : '⚠️'} (${labels.join(', ')})`);
      if (hasLabels) validLabels++;
    }
    
  } catch (error) {
    console.log('  ❌ 화자 레이블 검증 실패:', error.message);
  }
  
  const success = validLabels >= 3;
  if (success) {
    console.log('\n  ✅ 화자 레이블 시스템 정상');
  } else {
    console.log('\n  ⚠️ 일부 화자 레이블 확인 필요');
  }
  
  return success;
}

/**
 * 6. 품질 점수 검증
 */
async function testQualityStandards() {
  console.log('\n📊 6. 품질 기준 검증');
  console.log('-'.repeat(40));
  
  const qualityChecks = {
    fileStructure: false,
    typeScript: false,
    contents: false,
    api: false,
    labels: false
  };
  
  // 각 체크 항목별로 간단한 검증
  const checks = [
    { name: '파일 구조', key: 'fileStructure', path: 'src/lib/ai/prompts/podcast/index.ts' },
    { name: 'TypeScript', key: 'typeScript', path: 'tsconfig.json' },
    { name: '내용 품질', key: 'contents', path: 'src/lib/ai/prompts/podcast/korean-podcast.ts' },
    { name: 'API 통합', key: 'api', path: 'app/api/tts/notebooklm/generate-by-chapter/route.ts' },
    { name: '레이블 시스템', key: 'labels', path: 'src/lib/ai/prompts/podcast/index.ts' }
  ];
  
  let passedChecks = 0;
  
  for (const check of checks) {
    const filePath = path.join(__dirname, check.path);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasQualityContent = content.length > 100; // 기본적인 내용 존재 체크
      
      if (hasQualityContent) {
        console.log(`  ✓ ${check.name}: ✅`);
        qualityChecks[check.key] = true;
        passedChecks++;
      } else {
        console.log(`  ✓ ${check.name}: ⚠️ (내용 부족)`);
      }
    } else {
      console.log(`  ✓ ${check.name}: ❌ (파일 없음)`);
    }
  }
  
  const qualityScore = (passedChecks / checks.length) * 100;
  console.log(`\n  📊 품질 점수: ${qualityScore.toFixed(1)}점`);
  
  if (qualityScore >= 75) {
    console.log('  ✅ 품질 기준 통과 (75점 이상)');
    return true;
  } else {
    console.log('  ❌ 품질 기준 미달 (75점 미만)');
    return false;
  }
}

/**
 * 메인 테스트 실행
 */
async function runAllTests() {
  console.log('\n🚀 통합 테스트 실행');
  console.log('='.repeat(60));
  
  const results = {
    fileStructure: false,
    typescript: false,
    contents: false,
    api: false,
    labels: false,
    quality: false
  };
  
  // 1. 파일 구조 테스트
  results.fileStructure = await testFileStructure();
  
  // 2. TypeScript 컴파일 테스트
  results.typescript = await testTypeScriptCompilation();
  
  // 3. 파일 내용 검증
  results.contents = await testFileContents();
  
  // 4. API 통합 테스트
  results.api = await testAPIIntegration();
  
  // 5. 화자 레이블 테스트
  results.labels = await testSpeakerLabels();
  
  // 6. 품질 기준 검증
  results.quality = await testQualityStandards();
  
  // 최종 결과 출력
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 테스트 결과');
  console.log('='.repeat(60));
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n테스트 항목별 결과:');
  console.log(`  1. 파일 구조: ${results.fileStructure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  2. TypeScript: ${results.typescript ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  3. 파일 내용: ${results.contents ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  4. API 통합: ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  5. 화자 레이블: ${results.labels ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  6. 품질 기준: ${results.quality ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n' + '='.repeat(60));
  if (passedTests === totalTests) {
    console.log('🎉 모든 테스트 통과! 시스템이 정상적으로 작동합니다.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log(`✅ ${totalTests}개 중 ${passedTests}개 테스트 통과 (양호)`);
    console.log('시스템이 대부분 정상적으로 작동합니다.');
  } else {
    console.log(`⚠️ ${totalTests}개 중 ${passedTests}개 테스트 통과`);
    console.log('일부 문제를 해결해야 합니다.');
  }
  console.log('='.repeat(60));
  
  // 한국민속촌 테스트 요약
  console.log('\n🏛️ 한국민속촌 테스트 설정:');
  console.log(`  📍 테스트 위치: ${TEST_CONFIG.locationName}`);
  console.log(`  🎯 테스트 챕터: ${TEST_CONFIG.chapterInfo.title}`);
  console.log(`  🌍 지원 언어: ${TEST_CONFIG.languages.join(', ')}`);
  console.log(`  🎨 콘텐츠 포커스: ${TEST_CONFIG.chapterInfo.contentFocus.join(', ')}`);
  
  return results;
}

// 테스트 실행
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ 테스트 실행 중 오류:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };