/**
 * 🎯 단일 좌표 최적화 테스트
 */

const axios = require('axios');

async function testSingleCoordinate() {
  console.log('🎯 자갈치시장 좌표 최적화 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    console.log('🔄 API 호출 중...');
    
    const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
      locationName: '자갈치시장',
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
      timeout: 180000 // 3분 타임아웃
    });

    const result = response.data;
    
    console.log('📊 API 응답 상태:', result.success);
    console.log('🎯 만족도 예상:', result.mega_optimization?.satisfaction_expected || 'N/A');
    
    if (result.success && result.data?.content) {
      console.log('\n✅ 가이드 생성 성공!');
      
      // 인트로 챕터 확인
      const introChapter = result.data.content.realTimeGuide?.chapters?.[0];
      if (introChapter) {
        console.log('\n📖 인트로 챕터 정보:');
        console.log(`   제목: ${introChapter.title}`);
        console.log(`   내용 길이: ${introChapter.narrative?.length || 0}자`);
        
        // 좌표 최적화 확인
        if (introChapter.title.includes('매표소') || 
            introChapter.title.includes('안내소') ||
            introChapter.title.includes('입구')) {
          console.log('✅ 좌표 최적화 적용 확인됨!');
        } else {
          console.log('⚠️ 좌표 최적화 적용 여부 불명확');
        }
      }
      
      // 전체 구조 확인
      console.log('\n📊 가이드 구조:');
      console.log(`   Overview: ${!!result.data.content.overview}`);
      console.log(`   Route steps: ${result.data.content.route?.steps?.length || 0}개`);
      console.log(`   Chapters: ${result.data.content.realTimeGuide?.chapters?.length || 0}개`);
      
    } else {
      console.log('\n❌ 가이드 생성 실패');
      console.log('오류:', result.error);
    }

  } catch (error) {
    console.log('\n❌ 테스트 실패');
    console.log('오류 메시지:', error.message);
    
    if (error.response?.data) {
      console.log('서버 응답:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSingleCoordinate();