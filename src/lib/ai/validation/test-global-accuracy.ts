// Global Accuracy Testing Suite
// Tests the accuracy verification system with various global locations

import { validateAccuracy, sanitizeResponse, shouldRegenerate } from './accuracy-validator';

/**
 * 🌍 글로벌 테스트 케이스들
 */
const GLOBAL_TEST_CASES = {
  // 한국 위치들
  korea: [
    {
      location: "경복궁",
      mockResponse: {
        overview: "경복궁은 조선 왕조의 대표적인 궁궐입니다.",
        detailedStops: [
          {
            name: "근정전",
            content: "이곳에는 유명한 한복카페와 전통서점이 있습니다.", // 금지된 내용
            coordinates: { lat: 37.5796, lng: 126.9770 }
          }
        ]
      },
      expectedViolations: ["구체적 업체명"]
    },
    
    {
      location: "판교 아브뉴프랑",
      mockResponse: {
        overview: "아브뉴프랑은 현대적인 복합 쇼핑몰입니다.",
        detailedStops: [
          {
            name: "메인 홀",
            content: "다양한 상점들과 카페들이 있어 쇼핑과 휴식을 즐길 수 있습니다.", // 올바른 표현
            coordinates: { lat: 37.4012, lng: 127.1056 }
          }
        ]
      },
      expectedViolations: []
    }
  ],

  // 일본 위치들
  japan: [
    {
      location: "Tokyo Tower",
      mockResponse: {
        overview: "Tokyo Tower is the most famous landmark in Japan.", // 과장된 표현
        detailedStops: [
          {
            name: "Observation Deck",
            content: "There are approximately 50 restaurants and gift shops here.", // 구체적 수치
            coordinates: { lat: 35.6586, lng: 139.7454 }
          }
        ]
      },
      expectedViolations: ["과장된 표현"]
    }
  ],

  // 유럽 위치들
  europe: [
    {
      location: "Eiffel Tower",
      mockResponse: {
        overview: "The Eiffel Tower is probably the best known structure in Paris.", // 추측성 표현
        detailedStops: [
          {
            name: "First Floor",
            content: "Various cafes and restaurants can be found here.", // 올바른 표현
            coordinates: { lat: 48.8584, lng: 2.2945 }
          }
        ]
      },
      expectedViolations: ["추측성 표현"]
    }
  ],

  // 미국 위치들
  america: [
    {
      location: "Statue of Liberty",
      mockResponse: {
        overview: "The Statue of Liberty welcomes visitors from around the world.",
        detailedStops: [
          {
            name: "Crown",
            content: "Visitors can enjoy panoramic views of New York Harbor and surrounding areas.",
            coordinates: { lat: 40.6892, lng: -74.0445 }
          }
        ]
      },
      expectedViolations: []
    }
  ]
};

/**
 * 🧪 테스트 실행 함수
 */
export function runGlobalAccuracyTests(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: Array<{
    location: string;
    region: string;
    passed: boolean;
    actualViolations: string[];
    expectedViolations: string[];
    riskScore: number;
    details: string;
  }>;
  summary: {
    accuracy: number;
    globalCompatibility: boolean;
    recommendations: string[];
  };
} {
  console.log('🌍 글로벌 정확성 테스트 시작...');
  
  const results: Array<{
    location: string;
    region: string;
    passed: boolean;
    actualViolations: string[];
    expectedViolations: string[];
    riskScore: number;
    details: string;
  }> = [];

  let totalTests = 0;
  let passedTests = 0;

  // 모든 지역의 테스트 케이스 실행
  Object.entries(GLOBAL_TEST_CASES).forEach(([region, testCases]) => {
    testCases.forEach(testCase => {
      totalTests++;
      console.log(`\n🔍 테스트 중: ${testCase.location} (${region})`);

      // 정확성 검증 실행
      const validationResult = validateAccuracy(testCase.mockResponse, testCase.location);
      
      // 예상 위반사항과 실제 위반사항 비교
      const actualViolationTypes = validationResult.violations.map(v => {
        if (v.includes('구체적 업체명')) return '구체적 업체명';
        if (v.includes('과장된 표현')) return '과장된 표현';
        if (v.includes('추측성 표현')) return '추측성 표현';
        if (v.includes('확인되지 않은 시설')) return '확인되지 않은 시설';
        return '기타';
      });

      // 테스트 통과 여부 판단
      const expectedFound = testCase.expectedViolations.every(expected => 
        actualViolationTypes.includes(expected)
      );
      const noUnexpectedViolations = actualViolationTypes.every(actual =>
        testCase.expectedViolations.includes(actual) || actual === '기타'
      );

      const passed = expectedFound && noUnexpectedViolations;
      if (passed) passedTests++;

      results.push({
        location: testCase.location,
        region,
        passed,
        actualViolations: validationResult.violations,
        expectedViolations: testCase.expectedViolations,
        riskScore: validationResult.riskScore,
        details: passed ? 'Test passed' : `Expected: ${testCase.expectedViolations.join(', ')}, Got: ${actualViolationTypes.join(', ')}`
      });

      console.log(`${passed ? '✅' : '❌'} ${testCase.location}: ${passed ? 'PASS' : 'FAIL'}`);
      if (!passed) {
        console.log(`   예상: ${testCase.expectedViolations.join(', ')}`);
        console.log(`   실제: ${actualViolationTypes.join(', ')}`);
      }
    });
  });

  const accuracy = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const globalCompatibility = accuracy >= 80; // 80% 이상이면 글로벌 호환 가능

  // 권장사항 생성
  const recommendations: string[] = [];
  if (accuracy < 90) {
    recommendations.push('패턴 인식 정확도 개선 필요');
  }
  if (accuracy < 80) {
    recommendations.push('추가 테스트 케이스 및 패턴 보완 필요');
  }
  if (!globalCompatibility) {
    recommendations.push('글로벌 적용 전 추가 검증 필요');
  } else {
    recommendations.push('글로벌 적용 준비 완료');
  }

  const summary = {
    accuracy,
    globalCompatibility,
    recommendations
  };

  console.log('\n📊 테스트 결과 요약:');
  console.log(`총 테스트: ${totalTests}`);
  console.log(`통과: ${passedTests}`);
  console.log(`실패: ${totalTests - passedTests}`);
  console.log(`정확도: ${accuracy.toFixed(1)}%`);
  console.log(`글로벌 호환성: ${globalCompatibility ? '✅' : '❌'}`);

  return {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    results,
    summary
  };
}

/**
 * 🔄 실시간 테스트 함수 (실제 AI 호출 없이)
 */
export function testAccuracyPattern(content: string, location: string = 'Test Location'): {
  violations: string[];
  riskScore: number;
  isGlobalReady: boolean;
} {
  const mockResponse = {
    overview: content,
    detailedStops: [
      {
        name: "Test Stop",
        content: content,
        coordinates: { lat: 0, lng: 0 }
      }
    ]
  };

  const result = validateAccuracy(mockResponse, location);
  
  return {
    violations: result.violations,
    riskScore: result.riskScore,
    isGlobalReady: result.riskScore < 0.3
  };
}

/**
 * 📝 상세 리포트 생성
 */
export function generateGlobalTestReport(testResults: ReturnType<typeof runGlobalAccuracyTests>): string {
  const report = `
# 🌍 글로벌 정확성 검증 시스템 테스트 리포트

## 📊 전체 결과
- **총 테스트**: ${testResults.totalTests}개
- **통과**: ${testResults.passedTests}개 
- **실패**: ${testResults.failedTests}개
- **정확도**: ${testResults.summary.accuracy.toFixed(1)}%
- **글로벌 호환성**: ${testResults.summary.globalCompatibility ? '✅ 준비완료' : '❌ 추가작업필요'}

## 🗺️ 지역별 결과
${Object.entries(
  testResults.results.reduce((acc, result) => {
    if (!acc[result.region]) acc[result.region] = [];
    acc[result.region].push(result);
    return acc;
  }, {} as Record<string, typeof testResults.results>)
).map(([region, results]) => `
### ${region.toUpperCase()}
${results.map(r => `- **${r.location}**: ${r.passed ? '✅ PASS' : '❌ FAIL'} (위험도: ${(r.riskScore * 100).toFixed(1)}%)`).join('\n')}
`).join('')}

## 🚨 발견된 문제점
${testResults.results.filter(r => !r.passed).map(r => `
### ${r.location}
- **예상 위반사항**: ${r.expectedViolations.join(', ')}
- **실제 발견사항**: ${r.actualViolations.length > 0 ? r.actualViolations.join(', ') : '없음'}
- **위험도**: ${(r.riskScore * 100).toFixed(1)}%
`).join('')}

## 💡 권장사항
${testResults.summary.recommendations.map(r => `- ${r}`).join('\n')}

## 🎯 결론
${testResults.summary.globalCompatibility 
  ? '정확성 검증 시스템이 글로벌 적용 준비가 완료되었습니다. 전세계 어느 위치에서도 일관된 정확성 기준을 적용할 수 있습니다.'
  : '추가적인 패턴 보완과 테스트가 필요합니다. 현재 시스템을 개선한 후 글로벌 적용을 진행하시기 바랍니다.'
}

---
*Generated at: ${new Date().toISOString()}*
`;

  return report;
}

// Export everything for testing
export default {
  runGlobalAccuracyTests,
  testAccuracyPattern,
  generateGlobalTestReport,
  GLOBAL_TEST_CASES
};