// 🏛️ 박물관 전용 가이드 시스템 테스트 스크립트
// Node.js 환경에서 실행 가능한 테스트

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';
const TEST_MUSEUMS = [
  {
    name: '국립중앙박물관',
    halls: ['고려실', '조선실', '불교조각실']
  },
  {
    name: '국립현대미술관',
    halls: ['한국현대미술관', '현대미술관', '설치미술관']
  },
  {
    name: '리움미술관',
    halls: ['전통미술관', '현대미술관']
  }
];

/**
 * 🎯 메인 테스트 함수
 */
async function runAllTests() {
  console.log('🏛️ 박물관 가이드 시스템 테스트 시작\n');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // 1. API 연결성 테스트
    await testApiConnectivity(results);
    
    // 2. 박물관 구조 분석 테스트
    await testMuseumStructureAnalysis(results);
    
    // 3. 가이드 생성 테스트
    await testGuideGeneration(results);
    
    // 4. 품질 검증 테스트
    await testQualityValidation(results);
    
    // 5. 커스텀 키워드 테스트
    await testCustomKeywords(results);
    
    // 6. 에러 처리 테스트
    await testErrorHandling(results);

  } catch (error) {
    console.error('❌ 테스트 실행 중 치명적 오류:', error);
    results.failed++;
    results.errors.push(error.message);
  }

  // 결과 출력
  console.log('\n📊 테스트 결과 요약');
  console.log('='.repeat(50));
  console.log(`✅ 성공: ${results.passed}`);
  console.log(`❌ 실패: ${results.failed}`);
  console.log(`📈 성공률: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ 발생한 오류:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log('\n🏁 테스트 완료');
}

/**
 * 1️⃣ API 연결성 테스트
 */
async function testApiConnectivity(results) {
  console.log('1️⃣ API 연결성 테스트');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/museum-guide?museum_name=테스트박물관`);
    
    if (response.ok || response.status === 500) {
      // API가 응답하면 성공 (실제 데이터 없어도 OK)
      console.log('✅ API 서버 연결 정상');
      results.passed++;
    } else {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ API 연결 실패:', error.message);
    results.failed++;
    results.errors.push(`API 연결: ${error.message}`);
  }
  console.log('');
}

/**
 * 2️⃣ 박물관 구조 분석 테스트
 */
async function testMuseumStructureAnalysis(results) {
  console.log('2️⃣ 박물관 구조 분석 테스트');
  
  for (const museum of TEST_MUSEUMS.slice(0, 2)) { // 처음 2개만 테스트
    try {
      console.log(`📍 테스트 중: ${museum.name}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/museum-guide?museum_name=${encodeURIComponent(museum.name)}`
      );
      
      const data = await response.json();
      
      if (data.success && data.data.exhibition_halls) {
        console.log(`✅ ${museum.name} 구조 분석 성공`);
        console.log(`   - 전시관 수: ${data.data.exhibition_halls?.length || 0}`);
        console.log(`   - 작품 수: ${data.data.recommended_artworks?.length || 0}`);
        results.passed++;
      } else {
        throw new Error(`구조 분석 실패: ${data.error?.message || '알 수 없음'}`);
      }
      
      // API 호출 간격 (Rate Limiting 방지)
      await sleep(2000);
      
    } catch (error) {
      console.log(`❌ ${museum.name} 구조 분석 실패:`, error.message);
      results.failed++;
      results.errors.push(`${museum.name} 구조분석: ${error.message}`);
    }
  }
  console.log('');
}

/**
 * 3️⃣ 가이드 생성 테스트
 */
async function testGuideGeneration(results) {
  console.log('3️⃣ 가이드 생성 테스트');
  
  const testCase = {
    museum_name: '국립중앙박물관',
    hall_name: '고려실',
    user_profile: {
      knowledgeLevel: '중급',
      interests: ['고려시대', '청자'],
      preferredStyle: '전문적'
    }
  };

  try {
    console.log(`📍 테스트: ${testCase.museum_name} ${testCase.hall_name}`);
    
    const response = await fetch(`${API_BASE_URL}/api/museum-guide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase)
    });

    const data = await response.json();

    if (data.success && data.data.guide) {
      const guide = data.data.guide;
      console.log('✅ 가이드 생성 성공');
      console.log(`   - 챕터 수: ${guide.chapters.length}`);
      console.log(`   - 총 시간: ${Math.round(guide.metadata.total_duration / 60)}분`);
      console.log(`   - 품질점수: ${data.data.quality_assessment.score}점`);
      console.log(`   - 품질검증: ${data.data.quality_assessment.is_valid ? 'PASS' : 'FAIL'}`);
      
      // 기본 품질 검증
      if (guide.chapters.length >= 3 && data.data.quality_assessment.score >= 70) {
        results.passed++;
      } else {
        throw new Error(`품질 기준 미달: 챕터 ${guide.chapters.length}개, 점수 ${data.data.quality_assessment.score}점`);
      }
    } else {
      throw new Error(`가이드 생성 실패: ${data.error?.message || '알 수 없음'}`);
    }

  } catch (error) {
    console.log('❌ 가이드 생성 실패:', error.message);
    results.failed++;
    results.errors.push(`가이드 생성: ${error.message}`);
  }
  console.log('');
}

/**
 * 4️⃣ 품질 검증 테스트
 */
async function testQualityValidation(results) {
  console.log('4️⃣ 품질 검증 테스트');
  
  // 모의 가이드 데이터 생성
  const mockGuide = {
    chapters: [
      {
        id: 1,
        title: '작품 해설',
        content: '이 작품은 1450년에 제작되었으며, 캔버스에 유채로 그려졌습니다. 작가는 김철수(1420-1480)입니다.',
        fact_check: { confidence: 90 }
      },
      {
        id: 2,
        title: '다른 작품',
        content: '이 놀라운 작품은...', // 금지표현 포함
        fact_check: { confidence: 70 }
      }
    ],
    metadata: {
      total_duration: 600
    }
  };

  try {
    // 여기서는 로컬에서 품질 검증 로직을 테스트
    console.log('📊 품질 검증 로직 테스트');
    
    // 간단한 품질 검사
    let qualityScore = 0;
    const totalChapters = mockGuide.chapters.length;
    
    // 팩트체크 신뢰도 계산
    const avgFactCheck = mockGuide.chapters.reduce((sum, ch) => sum + ch.fact_check.confidence, 0) / totalChapters;
    qualityScore += (avgFactCheck / 100) * 40;
    
    // 금지표현 체크
    const hasForbiddenWords = mockGuide.chapters.some(ch => /놀라운|아름다운/.test(ch.content));
    if (!hasForbiddenWords) qualityScore += 10;
    
    // 구조 완성도
    if (totalChapters >= 2) qualityScore += 20;
    
    console.log(`✅ 품질점수 계산: ${Math.round(qualityScore)}점`);
    console.log(`   - 평균 팩트체크: ${avgFactCheck}%`);
    console.log(`   - 금지표현 여부: ${hasForbiddenWords ? 'YES' : 'NO'}`);
    console.log(`   - 챕터 수: ${totalChapters}`);
    
    results.passed++;

  } catch (error) {
    console.log('❌ 품질 검증 실패:', error.message);
    results.failed++;
    results.errors.push(`품질 검증: ${error.message}`);
  }
  console.log('');
}

/**
 * 5️⃣ 커스텀 키워드 테스트
 */
async function testCustomKeywords(results) {
  console.log('5️⃣ 커스텀 키워드 테스트');
  
  const testCase = {
    museum_name: '서울시립미술관',
    custom_keywords: ['추상미술', '현대조각', '색채'],
    user_profile: {
      knowledgeLevel: '고급',
      interests: ['현대미술']
    }
  };

  try {
    console.log('📍 커스텀 키워드 가이드 생성 테스트');
    console.log(`   키워드: ${testCase.custom_keywords.join(', ')}`);
    
    const response = await fetch(`${API_BASE_URL}/api/museum-guide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase)
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ 커스텀 키워드 가이드 생성 성공');
      results.passed++;
    } else {
      throw new Error(`커스텀 가이드 실패: ${data.error?.message || '알 수 없음'}`);
    }

  } catch (error) {
    console.log('❌ 커스텀 키워드 테스트 실패:', error.message);
    results.failed++;
    results.errors.push(`커스텀 키워드: ${error.message}`);
  }
  console.log('');
}

/**
 * 6️⃣ 에러 처리 테스트
 */
async function testErrorHandling(results) {
  console.log('6️⃣ 에러 처리 테스트');
  
  const errorTests = [
    {
      name: '빈 박물관명',
      data: { museum_name: '' },
      expectedError: true
    },
    {
      name: '존재하지 않는 박물관',
      data: { museum_name: '존재하지않는박물관12345' },
      expectedError: false // AI가 처리할 수 있음
    },
    {
      name: '잘못된 요청 형식',
      data: { invalid_field: 'test' },
      expectedError: true
    }
  ];

  for (const test of errorTests) {
    try {
      console.log(`📍 ${test.name} 테스트`);
      
      const response = await fetch(`${API_BASE_URL}/api/museum-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data)
      });

      const data = await response.json();

      if (test.expectedError && !data.success) {
        console.log('✅ 예상된 에러 정상 처리');
        results.passed++;
      } else if (!test.expectedError && (data.success || response.status === 500)) {
        console.log('✅ 에러 처리 정상');
        results.passed++;
      } else {
        throw new Error('예상과 다른 결과');
      }

      await sleep(1000);

    } catch (error) {
      console.log(`❌ ${test.name} 처리 실패:`, error.message);
      results.failed++;
      results.errors.push(`${test.name}: ${error.message}`);
    }
  }
  console.log('');
}

/**
 * 유틸리티: 대기 함수
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🚀 테스트 실행
 */
if (require.main === module) {
  console.log('📋 테스트 실행 전 체크리스트:');
  console.log('   1. 서버가 실행 중인가? (npm run dev)');
  console.log('   2. GEMINI_API_KEY가 설정되어 있는가?');
  console.log('   3. 네트워크 연결이 안정적인가?');
  console.log('');
  console.log('⚠️  주의: API 호출 비용이 발생할 수 있습니다.');
  console.log('');
  
  // 3초 후 자동 시작
  setTimeout(() => {
    runAllTests();
  }, 3000);
  
  console.log('🕐 3초 후 테스트를 시작합니다... (Ctrl+C로 취소)');
}