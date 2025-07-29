/**
 * 🎯 수정된 AI-데이터 통합 워크플로우 테스트
 * 이제 AI가 실제 외부 데이터를 받아서 처리하는지 확인
 */

async function testIntegratedWorkflow() {
  console.log('🎯 수정된 AI-데이터 통합 워크플로우 테스트');
  console.log('='.repeat(70));
  
  // 테스트할 위치들
  const testLocations = [
    '경복궁',        // 주요 문화재
    '제주 성산일출봉', // UNESCO 사이트
    '부산 감천문화마을', // 소규모 명소
    '존재하지않는위치12345' // 가짜 데이터 테스트
  ];
  
  for (const location of testLocations) {
    console.log(`\n🔍 "${location}" 테스트`);
    console.log('-'.repeat(50));
    
    try {
      // API 호출 시뮬레이션
      const requestBody = {
        location: location,
        userProfile: {
          interests: ['역사', '문화'],
          ageGroup: '30대',
          knowledgeLevel: '중급',
          companions: 'solo',
          tourDuration: 90,
          preferredStyle: '친근함',
          language: 'ko'
        }
      };
      
      console.log('📡 API 요청:', {
        location: location,
        endpoint: '/api/ai/generate-guide-with-gemini'
      });
      
      // 실제 API 호출
      const response = await fetch('http://localhost:3000/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GuideAI-Test/1.0'
        },
        body: JSON.stringify(requestBody),
        timeout: 60000
      });
      
      console.log('📊 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ API 호출 성공');
        console.log('📄 응답 구조 분석:');
        
        // 데이터 통합 정보 확인
        if (data.dataIntegration) {
          console.log('   🔍 데이터 통합 결과:');
          console.log('   - 통합 데이터 존재:', data.dataIntegration.hasIntegratedData);
          console.log('   - 데이터 소스:', data.dataIntegration.sources);
          console.log('   - 신뢰도:', Math.round(data.dataIntegration.confidence * 100) + '%');
          console.log('   - 검증 상태:', data.dataIntegration.verificationStatus?.isValid ? '✅ 검증됨' : '❌ 미검증');
          console.log('   - 품질 점수:', data.dataIntegration.dataQuality);
          
          if (data.dataIntegration.errors) {
            console.log('   ⚠️ 데이터 에러:', data.dataIntegration.errors.length + '개');
          }
        }
        
        // 사실 검증 정보 확인
        if (data.factVerification) {
          console.log('   🎯 사실 검증 결과:');
          console.log('   - 사실 검증됨:', data.factVerification.isFactVerified);
          console.log('   - 신뢰도 점수:', Math.round(data.factVerification.confidenceScore * 100) + '%');
          console.log('   - 데이터 소스 개수:', data.factVerification.dataSourceCount + '개');
          console.log('   - 검증 방법:', data.factVerification.verificationMethod);
        }
        
        // AI 응답 내용 확인
        if (data.data) {
          console.log('   🤖 AI 가이드 생성:');
          console.log('   - 가이드 존재:', !!data.data.guide);
          console.log('   - 응답 길이:', (data.data.guide || '').length + ' 문자');
          
          // 가짜 데이터 패턴 체크
          const guideContent = data.data.guide || '';
          const hasFakeData = guideContent.includes('존재하지않는위치12345') || 
                             guideContent.includes('가상의') || 
                             guideContent.includes('임의의');
          
          if (location === '존재하지않는위치12345') {
            if (hasFakeData) {
              console.log('   ❌ 여전히 가짜 데이터에 대해 가짜 정보를 생성함');
            } else {
              console.log('   ✅ 가짜 데이터 거부 또는 적절한 응답');
            }
          } else {
            if (hasFakeData) {
              console.log('   ⚠️ 실제 위치에 대해 추측성 내용 포함');
            } else {
              console.log('   ✅ 적절한 가이드 생성');
            }
          }
        }
        
      } else {
        const errorText = await response.text();
        console.log('❌ API 호출 실패');
        console.log('에러 내용:', errorText.substring(0, 200));
      }
      
    } catch (error) {
      console.log('❌ 테스트 에러:', error.message);
    }
    
    // 요청 간 간격 (서버 부하 방지)
    console.log('⏳ 다음 테스트까지 3초 대기...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 통합 워크플로우 테스트 완료');
  console.log('='.repeat(70));
  
  console.log('\n💡 **주요 확인 사항**:');
  console.log('1. ✅ 데이터 통합 단계에서 외부 소스 데이터 수집 여부');
  console.log('2. ✅ AI 프롬프트에 실제 외부 데이터 포함 여부');
  console.log('3. ✅ 가짜 위치에 대한 적절한 거부 반응');
  console.log('4. ✅ 실제 위치에 대한 검증된 정보 활용');
  console.log('5. ✅ 소규모 명소까지 포함한 포괄적 커버리지');
}

// 실행
testIntegratedWorkflow().catch(console.error);