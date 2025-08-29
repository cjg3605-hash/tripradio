/**
 * 팟캐스트 프롬프트 시스템 통합 테스트
 * 새로운 구조화된 시스템이 제대로 작동하는지 검증
 */

const path = require('path');

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
console.log('=' .repeat(60));

/**
 * 1. 프롬프트 시스템 import 테스트
 */
async function testPromptSystemImport() {
  console.log('\n📦 1. 프롬프트 시스템 Import 테스트');
  console.log('-'.repeat(40));
  
  try {
    // 프롬프트 시스템 동적 import
    const promptModule = await import('./src/lib/ai/prompts/podcast/index.js');
    
    // 필수 함수들 확인
    const requiredFunctions = [
      'createPodcastChapterPrompt',
      'createFullGuidePodcastPrompt',
      'getSpeakerLabels',
      'getPodcastPersonas',
      'parseDialogueScript'
    ];
    
    let allFunctionsExist = true;
    for (const funcName of requiredFunctions) {
      const exists = typeof promptModule[funcName] === 'function';
      console.log(`  ✓ ${funcName}: ${exists ? '✅' : '❌'}`);
      if (!exists) allFunctionsExist = false;
    }
    
    if (allFunctionsExist) {
      console.log('\n  ✅ 모든 필수 함수가 정상적으로 export됨');
      return promptModule;
    } else {
      throw new Error('일부 함수가 누락됨');
    }
  } catch (error) {
    console.error('  ❌ Import 실패:', error.message);
    return null;
  }
}

/**
 * 2. 언어별 프롬프트 생성 테스트
 */
async function testLanguagePrompts(promptModule) {
  console.log('\n🌍 2. 언어별 프롬프트 생성 테스트');
  console.log('-'.repeat(40));
  
  if (!promptModule) {
    console.log('  ⏭️ Import 실패로 인해 건너뜀');
    return;
  }
  
  const results = {};
  
  for (const language of TEST_CONFIG.languages) {
    try {
      const config = {
        locationName: TEST_CONFIG.locationName,
        chapter: TEST_CONFIG.chapterInfo,
        locationContext: {},
        personaDetails: [
          {
            name: '진행자',
            description: '호기심 많은 여행자',
            expertise: ['여행', '문화'],
            speechStyle: '친근하고 자연스러운',
            emotionalTone: '호기심과 경이로움'
          },
          {
            name: '큐레이터',
            description: '전문 해설자',
            expertise: ['역사', '문화', '예술'],
            speechStyle: '전문적이지만 이해하기 쉬운',
            emotionalTone: '열정적이고 친근함'
          }
        ],
        locationAnalysis: {
          significance: '전통 문화 체험 공간',
          historicalImportance: 8,
          culturalValue: 9,
          uniqueFeatures: ['전통 가옥 재현', '민속 공예 체험', '전통 혼례식'],
          recommendations: ['양반가옥', '농가', '전통시장']
        },
        language
      };
      
      const prompt = await promptModule.createPodcastChapterPrompt(config);
      
      results[language] = {
        success: true,
        length: prompt.length,
        hasContent: prompt.length > 1000
      };
      
      console.log(`  ✓ ${language}: ✅ (${prompt.length}자 생성)`);
    } catch (error) {
      results[language] = {
        success: false,
        error: error.message
      };
      console.log(`  ✓ ${language}: ❌ (${error.message})`);
    }
  }
  
  // 결과 요약
  const successCount = Object.values(results).filter(r => r.success).length;
  console.log(`\n  📊 결과: ${successCount}/${TEST_CONFIG.languages.length} 언어 성공`);
  
  return results;
}

/**
 * 3. 페르소나 시스템 테스트
 */
async function testPersonaSystem(promptModule) {
  console.log('\n🎭 3. 페르소나 시스템 테스트');
  console.log('-'.repeat(40));
  
  if (!promptModule) {
    console.log('  ⏭️ Import 실패로 인해 건너뜀');
    return;
  }
  
  try {
    // 한국어 페르소나
    const koPersonas = promptModule.getPodcastPersonas('ko');
    console.log('  ✓ 한국어 페르소나:');
    console.log(`    - 진행자: ${koPersonas.host.name} ✅`);
    console.log(`    - 큐레이터: ${koPersonas.curator.name} ✅`);
    
    // 영어 페르소나
    const enPersonas = promptModule.getPodcastPersonas('en');
    console.log('  ✓ 영어 페르소나:');
    console.log(`    - Host: ${enPersonas.host.name} ✅`);
    console.log(`    - Curator: ${enPersonas.curator.name} ✅`);
    
    console.log('\n  ✅ 페르소나 시스템 정상 작동');
    return true;
  } catch (error) {
    console.error('  ❌ 페르소나 시스템 오류:', error.message);
    return false;
  }
}

/**
 * 4. 화자 레이블 테스트
 */
async function testSpeakerLabels(promptModule) {
  console.log('\n🏷️ 4. 화자 레이블 시스템 테스트');
  console.log('-'.repeat(40));
  
  if (!promptModule) {
    console.log('  ⏭️ Import 실패로 인해 건너뜀');
    return;
  }
  
  const expectedLabels = {
    ko: { male: 'male', female: 'female' },
    en: { male: 'Host', female: 'Curator' },
    ja: { male: 'ホスト', female: 'キュレーター' },
    zh: { male: '主持人', female: '策展人' },
    es: { male: 'Presentador', female: 'Curador' }
  };
  
  let allCorrect = true;
  
  for (const [lang, expected] of Object.entries(expectedLabels)) {
    const labels = promptModule.getSpeakerLabels(lang);
    const isCorrect = labels.male === expected.male || labels.host === expected.male;
    
    console.log(`  ✓ ${lang}: ${isCorrect ? '✅' : '❌'} (${labels.male || labels.host} / ${labels.female || labels.curator})`);
    if (!isCorrect) allCorrect = false;
  }
  
  if (allCorrect) {
    console.log('\n  ✅ 모든 언어 레이블 정상');
  } else {
    console.log('\n  ⚠️ 일부 언어 레이블 확인 필요');
  }
  
  return allCorrect;
}

/**
 * 5. 스크립트 파싱 테스트
 */
async function testScriptParsing(promptModule) {
  console.log('\n📝 5. 스크립트 파싱 테스트');
  console.log('-'.repeat(40));
  
  if (!promptModule) {
    console.log('  ⏭️ Import 실패로 인해 건너뜀');
    return;
  }
  
  // 테스트 스크립트
  const testScripts = {
    ko: `**male:** 안녕하세요, 여러분!
**female:** 네, 오늘은 한국민속촌에 대해 이야기해볼게요.`,
    en: `**Host:** Hello everyone!
**Curator:** Today we'll explore Korean Folk Village.`
  };
  
  try {
    for (const [lang, script] of Object.entries(testScripts)) {
      const segments = promptModule.parseDialogueScript(script, lang);
      console.log(`  ✓ ${lang}: ${segments.length}개 세그먼트 파싱 성공 ✅`);
      
      segments.forEach((seg, idx) => {
        console.log(`    - 세그먼트 ${idx + 1}: ${seg.speaker} (${seg.content.substring(0, 20)}...)`);
      });
    }
    
    console.log('\n  ✅ 스크립트 파싱 정상 작동');
    return true;
  } catch (error) {
    console.error('  ❌ 파싱 오류:', error.message);
    return false;
  }
}

/**
 * 6. API 호환성 테스트
 */
async function testAPICompatibility() {
  console.log('\n🔌 6. API 호환성 테스트');
  console.log('-'.repeat(40));
  
  try {
    // generate-by-chapter API 파일 존재 확인
    const fs = require('fs');
    const apiPath1 = path.join(__dirname, 'app/api/tts/notebooklm/generate-by-chapter/route.ts');
    const apiPath2 = path.join(__dirname, 'app/api/tts/notebooklm/generate/route.ts');
    
    const api1Exists = fs.existsSync(apiPath1);
    const api2Exists = fs.existsSync(apiPath2);
    
    console.log(`  ✓ generate-by-chapter API: ${api1Exists ? '✅' : '❌'}`);
    console.log(`  ✓ generate API: ${api2Exists ? '✅' : '❌'}`);
    
    if (api1Exists) {
      const content = fs.readFileSync(apiPath1, 'utf8');
      const usesNewSystem = content.includes('createPodcastChapterPrompt');
      console.log(`    - 새 프롬프트 시스템 사용: ${usesNewSystem ? '✅' : '❌'}`);
    }
    
    return api1Exists && api2Exists;
  } catch (error) {
    console.error('  ❌ API 호환성 확인 실패:', error.message);
    return false;
  }
}

/**
 * 메인 테스트 실행
 */
async function runAllTests() {
  console.log('\n🚀 통합 테스트 실행');
  console.log('=' .repeat(60));
  
  const results = {
    import: false,
    languages: false,
    personas: false,
    labels: false,
    parsing: false,
    api: false
  };
  
  // 1. Import 테스트
  const promptModule = await testPromptSystemImport();
  results.import = promptModule !== null;
  
  // 2. 언어별 프롬프트 테스트
  const langResults = await testLanguagePrompts(promptModule);
  results.languages = langResults && Object.values(langResults).some(r => r.success);
  
  // 3. 페르소나 시스템 테스트
  results.personas = await testPersonaSystem(promptModule);
  
  // 4. 화자 레이블 테스트
  results.labels = await testSpeakerLabels(promptModule);
  
  // 5. 스크립트 파싱 테스트
  results.parsing = await testScriptParsing(promptModule);
  
  // 6. API 호환성 테스트
  results.api = await testAPICompatibility();
  
  // 최종 결과 출력
  console.log('\n' + '=' .repeat(60));
  console.log('📊 최종 테스트 결과');
  console.log('=' .repeat(60));
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n테스트 항목별 결과:');
  console.log(`  1. 시스템 Import: ${results.import ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  2. 다국어 지원: ${results.languages ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  3. 페르소나 시스템: ${results.personas ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  4. 화자 레이블: ${results.labels ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  5. 스크립트 파싱: ${results.parsing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  6. API 호환성: ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n' + '=' .repeat(60));
  if (passedTests === totalTests) {
    console.log('🎉 모든 테스트 통과! 시스템이 정상적으로 작동합니다.');
  } else {
    console.log(`⚠️ ${totalTests}개 중 ${passedTests}개 테스트 통과`);
    console.log('일부 문제를 해결해야 합니다.');
  }
  console.log('=' .repeat(60));
  
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