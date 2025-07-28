/**
 * Integration validation script for fact-verified guide generation
 * Tests the complete pipeline without TypeScript dependencies
 */

async function testFactVerifiedGuideGeneration() {
  console.log('🚀 사실 검증된 가이드 생성 통합 테스트');
  console.log('='.repeat(60));
  
  const testCases = [
    {
      name: '경복궁 테스트',
      location: '경복궁',
      userProfile: {
        interests: ['문화', '역사'],
        ageGroup: '30대',
        knowledgeLevel: '중급',
        companions: 'solo',
        tourDuration: 90,
        preferredStyle: '친근함',
        language: 'ko'
      }
    },
    {
      name: '에펠탑 테스트',
      location: 'Eiffel Tower',
      userProfile: {
        interests: ['architecture', 'history'],
        ageGroup: '30대',
        knowledgeLevel: '중급',
        companions: 'couple',
        tourDuration: 120,
        preferredStyle: 'informative',
        language: 'en'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: testCase.location,
          userProfile: testCase.userProfile
        })
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`⚡ 응답 시간: ${responseTime}ms`);
      
      if (!response.ok) {
        console.log(`❌ HTTP 에러: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`에러 내용: ${errorText.substring(0, 200)}...`);
        continue;
      }
      
      const result = await response.json();
      
      // 기본 응답 구조 검증
      console.log('✅ API 응답 성공');
      console.log(`📊 성공 여부: ${result.success ? '✅' : '❌'}`);
      
      if (result.success) {
        // 데이터 통합 결과 검증
        console.log('\n🔍 데이터 통합 결과:');
        console.log(`  통합 데이터 존재: ${result.dataIntegration.hasIntegratedData ? '✅' : '❌'}`);
        console.log(`  사용된 데이터 소스: ${result.dataIntegration.sources.length}개`);
        console.log(`  데이터 소스: [${result.dataIntegration.sources.join(', ')}]`);
        console.log(`  신뢰도 점수: ${(result.dataIntegration.confidence * 100).toFixed(1)}%`);
        console.log(`  데이터 품질: ${(result.dataIntegration.dataQuality * 100).toFixed(1)}%`);
        
        // 사실 검증 결과 검증
        console.log('\n🎯 사실 검증 결과:');
        console.log(`  검증 상태: ${result.factVerification.isFactVerified ? '✅ 검증됨' : '⚠️ 부분 검증'}`);
        console.log(`  신뢰도 점수: ${(result.factVerification.confidenceScore * 100).toFixed(1)}%`);
        console.log(`  데이터 소스 수: ${result.factVerification.dataSourceCount}개`);
        console.log(`  검증 방법: ${result.factVerification.verificationMethod}`);
        
        // 가이드 내용 검증
        if (result.data) {
          console.log('\n📖 생성된 가이드:');
          console.log(`  개요 존재: ${result.data.overview ? '✅' : '❌'}`);
          console.log(`  하이라이트 존재: ${result.data.highlights ? '✅' : '❌'}`);
          console.log(`  방문 경로 존재: ${result.data.visitRoute ? '✅' : '❌'}`);
          
          if (result.data.overview) {
            console.log(`  개요 길이: ${result.data.overview.length}자`);
          }
          
          if (result.data.highlights) {
            console.log(`  하이라이트 개수: ${result.data.highlights.length}개`);
          }
        }
        
        // 에러 정보 (있는 경우)
        if (result.dataIntegration.errors && result.dataIntegration.errors.length > 0) {
          console.log('\n⚠️ 데이터 수집 중 발생한 문제:');
          result.dataIntegration.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
          });
        }
        
        console.log('\n✅ 테스트 성공!');
      } else {
        console.log(`❌ 가이드 생성 실패: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ 테스트 실행 오류: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎊 통합 테스트 완료!');
  console.log('='.repeat(60));
}

// 메인 실행
testFactVerifiedGuideGeneration().catch(console.error);