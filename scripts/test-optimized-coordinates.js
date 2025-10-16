/**
 * 🚀 최적화된 좌표 시스템 테스트
 * Smart Pattern Selection + Early Termination
 */

const axios = require('axios');

async function testOptimizedSystem() {
  console.log('🚀 최적화된 좌표 시스템 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testCases = [
    // 언어 감지 테스트
    { name: '자갈치시장', expected: '한국어 패턴' },
    { name: 'Eiffel Tower', expected: '영어 패턴' },
    { name: 'Colosseum', expected: '이탈리아어 패턴' },
    { name: '清水寺', expected: '일본어 패턴' }  // 키요미즈데라
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 테스트: ${testCase.name}`);
    console.log(`예상: ${testCase.expected}`);
    console.log('─'.repeat(50));

    const startTime = Date.now();

    try {
      const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
        locationName: testCase.name,
        language: 'ko',
        forceRegenerate: true,
        generationMode: 'autonomous',
        userProfile: {
          demographics: {
            age: 35,
            country: 'south_korea',
            language: 'ko',
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
        timeout: 30000 // 30초 (최적화로 더 빨라질 예정)
      });

      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`⏱️ 소요 시간: ${elapsed.toFixed(1)}초`);

      if (response.data.success) {
        console.log(`✅ 성공: ${testCase.name}`);
        console.log(`🎯 만족도: ${response.data.mega_optimization?.satisfaction_expected}`);
      } else {
        console.log(`❌ 실패: ${response.data.error}`);
      }

    } catch (error) {
      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`⏱️ 소요 시간: ${elapsed.toFixed(1)}초 (실패)`);
      
      if (error.code === 'ECONNABORTED') {
        console.log(`⏰ 타임아웃: ${testCase.name}`);
      } else {
        console.log(`❌ 오류: ${error.message}`);
      }
    }

    // 각 테스트 간 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📊 최적화 효과 예상:');
  console.log('• API 호출: 41개 → 6-8개 (70% 감소)');
  console.log('• 검색 시간: 10-40초 → 2-5초 (60-80% 개선)');
  console.log('• 90% 신뢰도 달성시 조기 종료');
  console.log('• 언어별 특화 패턴 적용');
  
  console.log('\n🎉 최적화된 좌표 시스템 테스트 완료!');
}

testOptimizedSystem();