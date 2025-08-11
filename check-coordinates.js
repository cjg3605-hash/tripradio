// 데이터베이스 좌표 데이터 확인 스크립트
const axios = require('axios');

const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

async function checkCoordinatesInDB() {
  try {
    console.log('🔍 데이터베이스 좌표 데이터 확인 중...');

    // guides 테이블에서 몇 개 샘플 데이터 조회
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        'select': 'locationname,language,content',
        'limit': '10'
      }
    });

    const guides = response.data;
    console.log(`📊 총 ${guides.length}개 가이드 샘플 분석:`);

    let hasCoordinatesCount = 0;
    let noCoordinatesCount = 0;

    guides.forEach((guide, index) => {
      console.log(`\n🏛️ 가이드 ${index + 1}: ${guide.locationname} (${guide.language})`);
      
      const content = guide.content;
      
      // 좌표 데이터 확인
      let hasCoordinates = false;
      
      // realTimeGuide.chapters에서 좌표 확인
      if (content?.realTimeGuide?.chapters) {
        const chapters = content.realTimeGuide.chapters;
        console.log(`  📚 총 ${chapters.length}개 챕터:`);
        
        chapters.forEach((chapter, chIndex) => {
          if (chapter.coordinates || chapter.lat || chapter.lng) {
            console.log(`    ✅ 챕터 ${chIndex + 1}: 좌표 있음 - ${JSON.stringify(chapter.coordinates || { lat: chapter.lat, lng: chapter.lng })}`);
            hasCoordinates = true;
          } else {
            console.log(`    ❌ 챕터 ${chIndex + 1}: 좌표 없음`);
          }
        });
      } else {
        console.log('  ❌ realTimeGuide.chapters 구조 없음');
      }
      
      if (hasCoordinates) {
        hasCoordinatesCount++;
        console.log(`  🎯 결과: 좌표 있음`);
      } else {
        noCoordinatesCount++;
        console.log(`  🚫 결과: 좌표 없음`);
      }
    });

    console.log(`\n📊 좌표 데이터 분석 결과:`);
    console.log(`✅ 좌표 있는 가이드: ${hasCoordinatesCount}개`);
    console.log(`❌ 좌표 없는 가이드: ${noCoordinatesCount}개`);
    console.log(`📈 좌표 보유율: ${Math.round((hasCoordinatesCount / guides.length) * 100)}%`);

    if (noCoordinatesCount > 0) {
      console.log(`\n⚠️  ${noCoordinatesCount}개 가이드에서 좌표가 누락되어 있습니다.`);
      console.log(`🔧 해결 방법: API 라우트에서 좌표 생성 로직을 확인해야 합니다.`);
    }

  } catch (error) {
    console.error('❌ 데이터베이스 확인 실패:', error.response?.data || error.message);
  }
}

checkCoordinatesInDB();