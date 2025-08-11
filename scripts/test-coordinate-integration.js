/**
 * 🎯 좌표 최적화 통합 테스트
 * 메가 최적화 시스템에 Plus Code + Google Places API 통합 검증
 */

const axios = require('axios');

async function testCoordinateIntegration() {
  console.log('🎯 좌표 최적화 통합 테스트 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testCases = [
    { name: '자갈치시장', expected: 'Plus Code 사용', language: 'ko' },
    { name: '해운대해수욕장', expected: 'Plus Code 사용', language: 'ko' },
    { name: 'Eiffel Tower', expected: 'Google Places API 사용', language: 'en' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 테스트: ${testCase.name} (${testCase.language})`);
    console.log('─'.repeat(50));

    try {
      const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
        locationName: testCase.name,
        language: testCase.language,
        forceRegenerate: true,
        generationMode: 'autonomous',
        userProfile: {
          demographics: {
            age: 35,
            country: testCase.language === 'ko' ? 'south_korea' : 'usa',
            language: testCase.language,
            travelStyle: 'cultural',
            techSavviness: 3
          },
          usage: {
            sessionsPerMonth: 2,
            avgSessionDuration: 15,
            preferredContentLength: 'medium',
            deviceType: 'mobile'
          }
        }
      }, {
        timeout: 120000 // 2분 타임아웃
      });

      const result = response.data;
      
      if (result.success) {
        console.log(`✅ 가이드 생성 성공: ${testCase.name}`);
        console.log(`📊 응답 시간: ${response.headers['x-response-time'] || 'N/A'}`);
        console.log(`🎯 품질: ${result.mega_optimization?.satisfaction_expected || 'N/A'}`);
        
        // 좌표 정보 확인
        if (result.data?.content?.overview?.location) {
          console.log(`📍 위치 정보: ${result.data.content.overview.location}`);
        }
        
        // 인트로 챕터에서 좌표 최적화 흔적 찾기
        const introChapter = result.data?.content?.realTimeGuide?.chapters?.[0];
        if (introChapter?.title) {
          console.log(`🎯 인트로 제목: ${introChapter.title}`);
          
          if (introChapter.title.includes('매표소') || introChapter.title.includes('안내소')) {
            console.log(`✅ 좌표 최적화 적용됨: 구체적 시설명 사용`);
          }
        }
        
      } else {
        console.log(`❌ 가이드 생성 실패: ${result.error}`);
      }

    } catch (error) {
      console.log(`❌ 테스트 실패: ${testCase.name}`);
      console.log(`   오류: ${error.message}`);
      
      if (error.response) {
        console.log(`   상태 코드: ${error.response.status}`);
        console.log(`   응답 데이터: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    // 각 테스트 간 5초 대기
    console.log('⏳ 5초 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n🎉 좌표 최적화 통합 테스트 완료');
}

// 메인 실행
if (require.main === module) {
  testCoordinateIntegration().catch(error => {
    console.error('❌ 테스트 실행 오류:', error);
    process.exit(1);
  });
}

module.exports = { testCoordinateIntegration };