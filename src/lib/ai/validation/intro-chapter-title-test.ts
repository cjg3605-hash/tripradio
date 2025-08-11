/**
 * 🧪 인트로 챕터 제목 실제 생성 테스트 시스템
 * 
 * 목적:
 * 1. 새로 생성되는 가이드의 인트로 챕터 제목이 "장소명"만 나오는지 확인
 * 2. "장소명: 설명" 형태가 아닌 간단한 형태로 나오는지 검증
 * 3. 좌표 정확도 함께 검증
 */

interface IntroChapterTestResult {
  locationName: string;
  title: string;
  isCorrectFormat: boolean;
  hasColon: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  coordinateAccuracy?: 'high' | 'medium' | 'low';
  error?: string;
}

interface TestSummary {
  totalTests: number;
  correctTitleFormat: number;
  incorrectTitleFormat: number;
  coordinateAccuracy: {
    high: number;
    medium: number;
    low: number;
  };
  successRate: number;
  problematicCases: string[];
}

/**
 * 🏛️ 테스트 케이스: 다양한 유형의 관광지
 */
const TEST_LOCATIONS = [
  // 한국 관광지
  '용궁사',
  '경복궁', 
  '부산 감천문화마을',
  '제주 성산일출봉',
  '경주 불국사',
  
  // 해외 관광지
  'Eiffel Tower',
  'Tokyo Tower',
  'Statue of Liberty',
  'Big Ben',
  'Sydney Opera House'
];

/**
 * 🔍 제목 형식 검증 함수
 */
function validateTitleFormat(title: string, locationName: string): {
  isCorrect: boolean;
  hasColon: boolean;
  reason: string;
} {
  const hasColon = title.includes(':');
  const hasDescription = hasColon && title.split(':')[1]?.trim().length > 0;
  
  // 올바른 형태: 장소명만, 또는 "장소명 구체적시설명" (콜론 없음)
  const isSimpleFormat = !hasColon;
  const containsLocationName = title.includes(locationName.replace('Tower', '').replace('Big Ben', 'Big Ben').trim());
  
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
 * 🌐 실제 API 호출을 통한 가이드 생성 테스트
 */
export async function testIntroChapterGeneration(
  testLocationNames?: string[]
): Promise<{
  results: IntroChapterTestResult[];
  summary: TestSummary;
}> {
  console.log('🧪 인트로 챕터 제목 생성 테스트 시작...');
  
  const locations = testLocationNames || TEST_LOCATIONS;
  const results: IntroChapterTestResult[] = [];
  
  for (const locationName of locations) {
    console.log(`\n🔍 테스트 중: ${locationName}`);
    
    try {
      // 실제 가이드 생성 API 호출
      const response = await fetch('http://localhost:3000/api/node/ai/generate-guide', {
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
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const guideData = await response.json();
      
      // 인트로 챕터 (id: 0) 찾기
      const introChapter = guideData.realTimeGuide?.chapters?.find(
        (chapter: any) => chapter.id === 0
      );
      
      if (!introChapter) {
        throw new Error('인트로 챕터를 찾을 수 없음');
      }
      
      const title = introChapter.title;
      const coordinates = introChapter.coordinates;
      
      // 제목 형식 검증
      const titleValidation = validateTitleFormat(title, locationName);
      
      // 좌표 정확도 추정 (거리 기반)
      let coordinateAccuracy: 'high' | 'medium' | 'low' | undefined;
      if (coordinates && coordinates.lat !== 0 && coordinates.lng !== 0) {
        // 실제 좌표 정확도 검증 로직은 별도로 구현 필요
        // 현재는 간단한 범위 체크
        const hasReasonableCoordinates = 
          Math.abs(coordinates.lat) > 0.001 && 
          Math.abs(coordinates.lng) > 0.001;
        coordinateAccuracy = hasReasonableCoordinates ? 'medium' : 'low';
      }
      
      const result: IntroChapterTestResult = {
        locationName,
        title,
        isCorrectFormat: titleValidation.isCorrect,
        hasColon: titleValidation.hasColon,
        coordinates,
        coordinateAccuracy,
      };
      
      results.push(result);
      
      console.log(`📊 ${locationName}: ${titleValidation.isCorrect ? '✅' : '❌'} "${title}" (${titleValidation.reason})`);
      
      // API 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ ${locationName} 테스트 실패:`, error);
      results.push({
        locationName,
        title: '',
        isCorrectFormat: false,
        hasColon: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }
  
  // 결과 요약
  const summary: TestSummary = {
    totalTests: results.length,
    correctTitleFormat: results.filter(r => r.isCorrectFormat).length,
    incorrectTitleFormat: results.filter(r => !r.isCorrectFormat && !r.error).length,
    coordinateAccuracy: {
      high: results.filter(r => r.coordinateAccuracy === 'high').length,
      medium: results.filter(r => r.coordinateAccuracy === 'medium').length,
      low: results.filter(r => r.coordinateAccuracy === 'low').length,
    },
    successRate: 0,
    problematicCases: []
  };
  
  summary.successRate = (summary.correctTitleFormat / summary.totalTests) * 100;
  summary.problematicCases = results
    .filter(r => !r.isCorrectFormat)
    .map(r => `${r.locationName}: "${r.title}"`);
  
  console.log('\n📊 테스트 결과 요약:');
  console.log(`총 테스트: ${summary.totalTests}`);
  console.log(`올바른 제목 형식: ${summary.correctTitleFormat}`);
  console.log(`잘못된 제목 형식: ${summary.incorrectTitleFormat}`);
  console.log(`성공률: ${summary.successRate.toFixed(1)}%`);
  
  if (summary.problematicCases.length > 0) {
    console.log('\n🚨 문제 케이스:');
    summary.problematicCases.forEach(problemCase => console.log(`  - ${problemCase}`));
  }
  
  return { results, summary };
}

/**
 * 🎯 특정 장소에 대한 단일 테스트
 */
export async function testSingleLocation(locationName: string): Promise<IntroChapterTestResult> {
  const { results } = await testIntroChapterGeneration([locationName]);
  return results[0];
}

/**
 * 📝 테스트 결과 리포트 생성
 */
export function generateTestReport(
  results: IntroChapterTestResult[], 
  summary: TestSummary
): string {
  const timestamp = new Date().toISOString();
  
  return `# 인트로 챕터 제목 생성 테스트 리포트

**생성 시간**: ${timestamp}
**테스트 대상**: 실제 가이드 생성 API

## 📊 결과 요약

- **총 테스트**: ${summary.totalTests}개
- **성공**: ${summary.correctTitleFormat}개 (${summary.successRate.toFixed(1)}%)
- **실패**: ${summary.incorrectTitleFormat}개
- **에러**: ${results.filter(r => r.error).length}개

### 좌표 정확도 분포
- **High**: ${summary.coordinateAccuracy.high}개
- **Medium**: ${summary.coordinateAccuracy.medium}개
- **Low**: ${summary.coordinateAccuracy.low}개

## 📋 상세 결과

${results.map(r => `
### ${r.locationName}
- **제목**: "${r.title}"
- **형식 올바름**: ${r.isCorrectFormat ? '✅' : '❌'}
- **콜론 사용**: ${r.hasColon ? '❌' : '✅'}
- **좌표**: ${r.coordinates ? `(${r.coordinates.lat}, ${r.coordinates.lng})` : '없음'}
- **좌표 정확도**: ${r.coordinateAccuracy || '측정 안됨'}
${r.error ? `- **오류**: ${r.error}` : ''}
`).join('')}

## 🎯 결론

${summary.successRate >= 80 ? 
  '✅ **성공적**: 대부분의 인트로 챕터 제목이 올바른 형식으로 생성되고 있습니다.' :
  '❌ **개선 필요**: 인트로 챕터 제목 생성에 문제가 있습니다. 프롬프트 템플릿을 재검토해야 합니다.'
}

${summary.problematicCases.length > 0 ? `
## 🚨 문제 케이스
${summary.problematicCases.map(problemCase => `- ${problemCase}`).join('\n')}
` : ''}

---
*Generated by GuideAI Intro Chapter Title Test System*
`;
}

// Export for external usage
export { TEST_LOCATIONS, validateTitleFormat };