/**
 * 🌍 전세계 좌표 최적화 테스트
 */

const axios = require('axios');

async function testGlobalCoordinates() {
  console.log('🌍 전세계 좌표 최적화 시스템 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const testCases = [
    // Plus Code 사용 예상
    { name: 'Eiffel Tower', language: 'en', country: 'France' },
    { name: 'Colosseum', language: 'en', country: 'Italy' }, 
    { name: 'Big Ben', language: 'en', country: 'UK' },
    
    // Google Places API + 영문 패턴 사용 예상
    { name: 'Central Park', language: 'en', country: 'USA' },
    { name: 'Golden Gate Bridge', language: 'en', country: 'USA' },
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 테스트: ${testCase.name} (${testCase.country})`);
    console.log('─'.repeat(60));

    try {
      const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
        locationName: testCase.name,
        language: testCase.language,
        forceRegenerate: true,
        generationMode: 'autonomous',
        userProfile: {
          demographics: {
            age: 35,
            country: 'usa',
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
        timeout: 60000 // 1분 타임아웃 (빠른 테스트)
      });

      const result = response.data;
      
      if (result.success) {
        console.log(`✅ 가이드 생성 성공: ${testCase.name}`);
        console.log(`🎯 만족도 예상: ${result.mega_optimization?.satisfaction_expected || 'N/A'}`);
        
        // 좌표 최적화 확인
        const introChapter = result.data?.content?.realTimeGuide?.chapters?.[0];
        if (introChapter?.title) {
          console.log(`📖 인트로 제목: ${introChapter.title}`);
          
          // 영문 패턴 확인
          const englishPatterns = ['ticket office', 'visitor center', 'entrance', 'parking', 'information'];
          const hasEnglishPattern = englishPatterns.some(pattern => 
            introChapter.title.toLowerCase().includes(pattern)
          );
          
          if (hasEnglishPattern) {
            console.log(`✅ 영문 좌표 최적화 패턴 적용됨!`);
          }
        }
        
      } else {
        console.log(`❌ 가이드 생성 실패: ${result.error}`);
      }

    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`⏰ 타임아웃: ${testCase.name} (1분 초과)`);
      } else {
        console.log(`❌ 테스트 실패: ${testCase.name}`);
        console.log(`   오류: ${error.message}`);
      }
    }

    // 각 테스트 간 3초 대기 (빠른 테스트)
    console.log('⏳ 3초 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n🎉 전세계 좌표 최적화 테스트 완료');
  console.log('\n📊 시스템 특징:');
  console.log('   • Plus Code: 80+ 전세계 주요 관광지 지원');
  console.log('   • Google Places API: 7개 언어 패턴 지원');  
  console.log('   • 검색 패턴: 총 50+ 다국어 시설명 패턴');
  console.log('   • 폴백: Plus Code → Places API → AI 추정');
}

testGlobalCoordinates();