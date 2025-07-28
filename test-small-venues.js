/**
 * 소규모 명소 데이터 커버리지 테스트
 * 각 데이터 소스가 소규모 장소를 얼마나 잘 커버하는지 확인
 */

async function testSmallVenueCoverage() {
  console.log('🔍 소규모 명소 데이터 커버리지 분석');
  console.log('='.repeat(60));
  
  // 다양한 규모의 테스트 케이스
  const testCases = [
    // 대형 명소 (정상 커버리지 예상)
    { name: '경복궁', type: 'major', expected: 'high' },
    { name: 'Eiffel Tower', type: 'major', expected: 'high' },
    
    // 중형 명소 (부분 커버리지 예상)
    { name: '덕수궁', type: 'medium', expected: 'medium' },
    { name: '북촌한옥마을', type: 'medium', expected: 'medium' },
    
    // 소형 명소 (낮은 커버리지 예상)
    { name: '홍대놀이터', type: 'small', expected: 'low' },
    { name: '망리단길', type: 'small', expected: 'low' },
    { name: '성수동 카페거리', type: 'small', expected: 'low' },
    
    // 매우 소형/지역적 명소 (커버리지 없음 예상)
    { name: '청담동 갤러리아 백화점', type: 'micro', expected: 'none' },
    { name: '이태원 우사단로', type: 'micro', expected: 'none' },
    { name: '연남동 경의선숲길', type: 'micro', expected: 'none' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 ${testCase.name} (${testCase.type})`);
    console.log('-'.repeat(40));
    
    const coverageResults = {
      unesco: false,
      wikidata: false,
      government: false,
      google_places: false,
      total_sources: 0
    };
    
    try {
      // 1. API를 통한 데이터 통합 테스트
      const response = await fetch('http://localhost:3000/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: testCase.name,
          userProfile: {
            interests: ['문화', '역사'],
            ageGroup: '30대',
            knowledgeLevel: '중급',
            companions: 'solo',
            tourDuration: 90,
            preferredStyle: '친근함',
            language: 'ko'
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.dataIntegration) {
          const integration = result.dataIntegration;
          
          // 데이터 소스 분석
          console.log(`📊 데이터 소스 수: ${integration.sources.length}개`);
          console.log(`🎯 신뢰도: ${(integration.confidence * 100).toFixed(1)}%`);
          console.log(`📈 데이터 품질: ${(integration.dataQuality * 100).toFixed(1)}%`);
          console.log(`✅ 사실 검증: ${result.factVerification.isFactVerified ? '완전' : '부분'}`);
          
          // 커버리지 평가
          let coverageLevel = 'none';
          if (integration.sources.length >= 3) coverageLevel = 'high';
          else if (integration.sources.length >= 2) coverageLevel = 'medium';
          else if (integration.sources.length >= 1) coverageLevel = 'low';
          
          console.log(`📋 실제 커버리지: ${coverageLevel} (예상: ${testCase.expected})`);
          
          // 예상과 실제 비교
          const match = coverageLevel === testCase.expected;
          console.log(`🎯 예상 일치: ${match ? '✅' : '❌'}`);
          
          if (!match) {
            console.log(`⚠️ 커버리지 불일치: 예상 ${testCase.expected} vs 실제 ${coverageLevel}`);
          }
          
          // 에러가 있는 경우
          if (integration.errors && integration.errors.length > 0) {
            console.log('❌ 데이터 수집 에러:');
            integration.errors.forEach(error => {
              console.log(`  - ${error}`);
            });
          }
          
        } else {
          console.log('❌ API 응답 실패 또는 데이터 통합 실패');
        }
      } else {
        console.log(`❌ HTTP 에러: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ 테스트 실행 오류: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 소규모 명소 커버리지 분석 완료');
  
  // 개선 권장사항
  console.log('\n🔧 개선 권장사항:');
  console.log('1. 소규모 명소를 위한 추가 데이터 소스 필요');
  console.log('2. 지역 정보 데이터베이스 통합 고려');
  console.log('3. 사용자 기여 데이터 시스템 도입 검토');
  console.log('4. 소셜 미디어 데이터 활용 가능성 탐색');
  console.log('='.repeat(60));
}

// 실행
testSmallVenueCoverage().catch(console.error);