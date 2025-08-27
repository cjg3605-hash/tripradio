#!/usr/bin/env node

/**
 * 🧪 인트로 챕터 제목 테스트 실행 스크립트
 * 
 * 사용법:
 * node scripts/test-intro-chapters.js
 * node scripts/test-intro-chapters.js --location "용궁사"
 * node scripts/test-intro-chapters.js --quick (빠른 테스트, 5개 장소만)
 */

const fs = require('fs');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com',
  DELAY_BETWEEN_TESTS: 3000, // 3초 딜레이
  OUTPUT_DIR: 'test-results',
  QUICK_TEST_LOCATIONS: ['용궁사', '경복궁', '부산 감천문화마을', 'Eiffel Tower', 'Tokyo Tower']
};

// 전체 테스트 장소
const FULL_TEST_LOCATIONS = [
  '용궁사',
  '경복궁', 
  '부산 감천문화마을',
  '제주 성산일출봉',
  '경주 불국사',
  'Eiffel Tower',
  'Tokyo Tower',
  'Statue of Liberty',
  'Big Ben',
  'Sydney Opera House'
];

/**
 * 📝 명령행 인자 파싱
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    singleLocation: null,
    quickTest: false,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--location':
      case '-l':
        options.singleLocation = args[i + 1];
        i++;
        break;
      case '--quick':
      case '-q':
        options.quickTest = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }
  
  return options;
}

/**
 * 🔍 제목 형식 검증
 */
function validateTitleFormat(title, locationName) {
  const hasColon = title.includes(':');
  const hasDescription = hasColon && title.split(':')[1]?.trim().length > 0;
  
  const isSimpleFormat = !hasColon;
  const containsLocationName = title.toLowerCase().includes(
    locationName.toLowerCase().replace('tower', '').replace('big ben', 'big ben').trim()
  );
  
  let reason = '';
  if (hasDescription) {
    reason = `콜론 설명형 제목 발견: "${title}"`;
  } else if (!containsLocationName) {
    reason = `장소명 누락: "${title}" (예상: ${locationName})`;
  } else if (isSimpleFormat) {
    reason = '✅ 올바른 간단 형태';
  } else {
    reason = '형식 검토 필요';
  }
  
  return {
    isCorrect: isSimpleFormat && containsLocationName && !hasDescription,
    hasColon,
    reason
  };
}

/**
 * 🌐 실제 API 호출
 */
async function callGuideGenerationAPI(locationName) {
  const url = `${TEST_CONFIG.API_BASE_URL}/api/ai/generate-multilang-guide`;
  
  console.log(`📡 실제 프로덕션 API 호출: ${url}`);
  console.log(`📍 장소: ${locationName}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName,
        language: 'ko'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 실제 API 응답 구조 확인
    console.log(`📊 응답 구조:`, {
      success: data.success,
      hasData: !!data.data,
      hasContent: !!data.data?.content,
      contentKeys: data.data?.content ? Object.keys(data.data.content) : []
    });
    
    if (data.success && data.data && data.data.content) {
      return data.data.content;
    } else {
      return data;
    }
    
  } catch (error) {
    console.error(`❌ API 호출 실패 (${locationName}):`, error.message);
    throw error;
  }
}

/**
 * 🧪 단일 장소 테스트
 */
async function testSingleLocation(locationName) {
  console.log(`\n🔍 테스트 시작: ${locationName}`);
  
  try {
    const guideData = await callGuideGenerationAPI(locationName);
    
    // 인트로 챕터 찾기
    const introChapter = guideData.realTimeGuide?.chapters?.find(
      chapter => chapter.id === 0
    );
    
    if (!introChapter) {
      throw new Error('인트로 챕터를 찾을 수 없음');
    }
    
    const title = introChapter.title;
    const coordinates = introChapter.coordinates;
    
    // 제목 검증
    const titleValidation = validateTitleFormat(title, locationName);
    
    // 좌표 정확도 간단 체크
    let coordinateAccuracy = 'unknown';
    if (coordinates && coordinates.lat !== 0 && coordinates.lng !== 0) {
      const hasReasonableCoordinates = 
        Math.abs(coordinates.lat) > 0.001 && 
        Math.abs(coordinates.lng) > 0.001;
      coordinateAccuracy = hasReasonableCoordinates ? 'valid' : 'invalid';
    }
    
    const result = {
      locationName,
      title,
      isCorrectFormat: titleValidation.isCorrect,
      hasColon: titleValidation.hasColon,
      reason: titleValidation.reason,
      coordinates,
      coordinateAccuracy,
      success: true
    };
    
    console.log(`📊 결과: ${titleValidation.isCorrect ? '✅' : '❌'} "${title}"`);
    console.log(`📍 좌표: ${coordinates ? `(${coordinates.lat}, ${coordinates.lng})` : '없음'} [${coordinateAccuracy}]`);
    console.log(`💭 이유: ${titleValidation.reason}`);
    
    return result;
    
  } catch (error) {
    const result = {
      locationName,
      title: '',
      isCorrectFormat: false,
      hasColon: false,
      reason: `오류: ${error.message}`,
      success: false,
      error: error.message
    };
    
    console.log(`❌ 테스트 실패: ${error.message}`);
    return result;
  }
}

/**
 * 🎯 전체 테스트 실행
 */
async function runFullTest(locations) {
  console.log(`🚀 인트로 챕터 제목 테스트 시작 (${locations.length}개 장소)`);
  console.log(`⏰ 예상 소요 시간: ${Math.ceil(locations.length * TEST_CONFIG.DELAY_BETWEEN_TESTS / 1000 / 60)}분`);
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    console.log(`\n[${i + 1}/${locations.length}] 진행 중...`);
    
    const result = await testSingleLocation(location);
    results.push(result);
    
    // 마지막 테스트가 아니면 딜레이
    if (i < locations.length - 1) {
      console.log(`⏳ ${TEST_CONFIG.DELAY_BETWEEN_TESTS/1000}초 대기 중...`);
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.DELAY_BETWEEN_TESTS));
    }
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  // 결과 요약
  const summary = {
    totalTests: results.length,
    correctTitleFormat: results.filter(r => r.isCorrectFormat).length,
    incorrectTitleFormat: results.filter(r => !r.isCorrectFormat && r.success).length,
    errors: results.filter(r => !r.success).length,
    successRate: 0,
    duration: duration
  };
  
  summary.successRate = (summary.correctTitleFormat / summary.totalTests) * 100;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 테스트 결과');
  console.log('='.repeat(60));
  console.log(`총 테스트: ${summary.totalTests}개`);
  console.log(`✅ 올바른 제목: ${summary.correctTitleFormat}개`);
  console.log(`❌ 잘못된 제목: ${summary.incorrectTitleFormat}개`);
  console.log(`🚨 에러: ${summary.errors}개`);
  console.log(`📈 성공률: ${summary.successRate.toFixed(1)}%`);
  console.log(`⏰ 소요 시간: ${duration}초`);
  
  // 문제 케이스 출력
  const problematicCases = results.filter(r => !r.isCorrectFormat);
  if (problematicCases.length > 0) {
    console.log('\n🚨 문제 케이스:');
    problematicCases.forEach(result => {
      console.log(`  - ${result.locationName}: "${result.title}" (${result.reason})`);
    });
  }
  
  // 결과 파일 저장
  await saveResults(results, summary);
  
  return { results, summary };
}

/**
 * 💾 결과 저장
 */
async function saveResults(results, summary) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(process.cwd(), TEST_CONFIG.OUTPUT_DIR);
  
  // 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // JSON 파일 저장
  const jsonPath = path.join(outputDir, `intro-chapter-test-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ results, summary }, null, 2));
  
  // 텍스트 리포트 저장
  const reportPath = path.join(outputDir, `intro-chapter-report-${timestamp}.md`);
  const report = generateMarkdownReport(results, summary);
  fs.writeFileSync(reportPath, report);
  
  console.log(`\n📁 결과 저장됨:`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  Report: ${reportPath}`);
}

/**
 * 📝 마크다운 리포트 생성
 */
function generateMarkdownReport(results, summary) {
  const timestamp = new Date().toLocaleString('ko-KR');
  
  return `# 인트로 챕터 제목 생성 테스트 리포트

**생성 시간**: ${timestamp}  
**테스트 환경**: ${TEST_CONFIG.API_BASE_URL}  
**소요 시간**: ${summary.duration}초

## 📊 결과 요약

| 항목 | 값 |
|------|-----|
| 총 테스트 | ${summary.totalTests}개 |
| ✅ 성공 | ${summary.correctTitleFormat}개 |
| ❌ 실패 | ${summary.incorrectTitleFormat}개 |
| 🚨 에러 | ${summary.errors}개 |
| 📈 성공률 | ${summary.successRate.toFixed(1)}% |

## 📋 상세 결과

${results.map(r => `
### ${r.locationName}

- **제목**: "${r.title}"
- **형식**: ${r.isCorrectFormat ? '✅ 올바름' : '❌ 잘못됨'}
- **콜론 사용**: ${r.hasColon ? '❌ 있음' : '✅ 없음'}
- **좌표**: ${r.coordinates ? `(${r.coordinates.lat}, ${r.coordinates.lng})` : '❌ 없음'}
- **좌표 상태**: ${r.coordinateAccuracy || '측정 안됨'}
- **이유**: ${r.reason}
${r.error ? `- **오류**: ${r.error}` : ''}
`).join('')}

## 🎯 결론

${summary.successRate >= 80 ? 
  '✅ **성공적**: 대부분의 인트로 챕터 제목이 올바른 형식으로 생성되고 있습니다.' :
  summary.successRate >= 50 ?
  '⚠️ **개선 필요**: 일부 인트로 챕터 제목에 문제가 있습니다.' :
  '❌ **심각한 문제**: 인트로 챕터 제목 생성에 심각한 문제가 있습니다.'
}

${summary.correctTitleFormat === 0 ? 
  '🚨 **모든 테스트가 실패했습니다**. 프롬프트 템플릿을 즉시 확인하고 수정해야 합니다.' : ''
}

---
*Generated by GuideAI Test System*
`;
}

/**
 * 📖 도움말 출력
 */
function showHelp() {
  console.log(`
🧪 인트로 챕터 제목 테스트 스크립트

사용법:
  node scripts/test-intro-chapters.js [옵션]

옵션:
  -l, --location <장소명>   특정 장소만 테스트
  -q, --quick              빠른 테스트 (5개 장소만)
  -h, --help               이 도움말 표시

예시:
  node scripts/test-intro-chapters.js                    # 전체 테스트 (10개 장소)
  node scripts/test-intro-chapters.js --quick            # 빠른 테스트 (5개 장소)
  node scripts/test-intro-chapters.js --location "용궁사"  # 특정 장소만

결과:
  - test-results/ 디렉토리에 JSON과 마크다운 리포트 생성
  - 콘솔에 실시간 결과 표시
`);
}

/**
 * 🚀 메인 실행 함수
 */
async function main() {
  const options = parseArguments();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  console.log('🧪 GuideAI 인트로 챕터 제목 테스트');
  console.log(`🌐 API 서버: ${TEST_CONFIG.API_BASE_URL}`);
  
  try {
    if (options.singleLocation) {
      console.log(`🎯 단일 장소 테스트: ${options.singleLocation}`);
      await testSingleLocation(options.singleLocation);
    } else {
      const locations = options.quickTest ? TEST_CONFIG.QUICK_TEST_LOCATIONS : FULL_TEST_LOCATIONS;
      await runFullTest(locations);
    }
  } catch (error) {
    console.error('💥 테스트 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// Node.js 환경에서만 실행
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}