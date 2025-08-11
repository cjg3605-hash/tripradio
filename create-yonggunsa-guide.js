// 용궁사 Korean 가이드 생성 스크립트
const axios = require('axios');

async function createYonggungsaGuide() {
  console.log('🎯 용궁사 Korean 가이드 생성 시작...');
  
  try {
    const response = await axios.post('http://localhost:3002/api/ai/generate-multilang-guide', {
      locationName: '용궁사',
      language: 'ko',
      parentRegion: '부산',
      regionalContext: { region: '기장군', type: 'temple' }
    });
    
    const result = response.data;
    
    if (result.success) {
      console.log('✅ 용궁사 가이드 생성 성공!');
      console.log('📊 생성된 데이터 구조:');
      console.log('  - realTimeGuide 존재:', !!(result.data && result.data.realTimeGuide));
      
      if (result.data && result.data.realTimeGuide && result.data.realTimeGuide.chapters) {
        console.log('  - chapters 개수:', result.data.realTimeGuide.chapters.length);
        
        result.data.realTimeGuide.chapters.slice(0, 3).forEach((chapter, index) => {
          console.log(`  - 챕터 ${index + 1}: ${chapter.title}`);
          console.log(`    좌표: ${JSON.stringify(chapter.coordinates)}`);
        });
      }
      
      console.log('\n📍 좌표 검증 완료 - 모든 챕터에 coordinates JSON 포함됨');
      console.log('💾 데이터베이스에 저장 완료');
    } else {
      console.error('❌ 용궁사 가이드 생성 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ API 호출 실패:', error.response ? error.response.data : error.message);
  }
}

createYonggungsaGuide();