// 기존 데이터베이스 가이드와 새 가이드 구조 비교 스크립트
const axios = require('axios');

const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

async function compareGuideStructures() {
  try {
    console.log('🔍 기존 데이터베이스 가이드와 새 가이드 구조 비교 시작...\n');

    // 기존 가이드 데이터 샘플 조회 (여러 종류)
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        'select': 'locationname,language,content',
        'limit': '5'
      }
    });

    const existingGuides = response.data;
    console.log(`📊 기존 가이드 ${existingGuides.length}개 구조 분석:`);

    // 각 기존 가이드의 구조 분석
    existingGuides.forEach((guide, index) => {
      console.log(`\n📖 기존 가이드 ${index + 1}: ${guide.locationname} (${guide.language})`);
      
      const content = guide.content;
      
      // realTimeGuide.chapters 구조 확인
      if (content?.realTimeGuide?.chapters) {
        const chapters = content.realTimeGuide.chapters;
        console.log(`   📚 챕터 개수: ${chapters.length}개`);
        
        // 각 챕터의 필드 분석
        console.log(`   📝 챕터 필드 구조:`);
        chapters.forEach((chapter, chIndex) => {
          const fields = Object.keys(chapter);
          const hasCoordinates = !!(chapter.coordinates || (chapter.lat && chapter.lng));
          
          console.log(`      챕터 ${chIndex + 1}: ${fields.join(', ')}`);
          console.log(`         좌표: ${hasCoordinates ? '✅ 있음' : '❌ 없음'}`);
          
          if (hasCoordinates) {
            if (chapter.coordinates) {
              console.log(`         coordinates JSON: ${JSON.stringify(chapter.coordinates)}`);
            } else {
              console.log(`         lat/lng: ${chapter.lat}, ${chapter.lng}`);
            }
          }
        });
      } else {
        console.log(`   ❌ realTimeGuide.chapters 구조 없음`);
      }
      
      // overview, route 구조 확인
      console.log(`   🏛️ overview: ${content?.overview ? '✅ 있음' : '❌ 없음'}`);
      console.log(`   🛣️ route: ${content?.route ? '✅ 있음' : '❌ 없음'}`);
      
      if (content?.route?.steps) {
        console.log(`      route.steps 개수: ${content.route.steps.length}개`);
      }
    });

    console.log(`\n\n📊 구조 분석 결과 요약:`);
    
    // 챕터 개수 분포 분석
    const chapterCounts = existingGuides.map(guide => {
      return guide.content?.realTimeGuide?.chapters?.length || 0;
    });
    
    console.log(`📈 챕터 개수 분포: ${chapterCounts.join(', ')}`);
    console.log(`📊 평균 챕터 개수: ${(chapterCounts.reduce((a, b) => a + b, 0) / chapterCounts.length).toFixed(1)}개`);
    
    // 좌표 보유율 분석
    let totalChapters = 0;
    let chaptersWithCoordinates = 0;
    
    existingGuides.forEach(guide => {
      const chapters = guide.content?.realTimeGuide?.chapters || [];
      totalChapters += chapters.length;
      
      chapters.forEach(chapter => {
        if (chapter.coordinates || (chapter.lat && chapter.lng)) {
          chaptersWithCoordinates++;
        }
      });
    });
    
    const coordinateRate = totalChapters > 0 ? (chaptersWithCoordinates / totalChapters * 100).toFixed(1) : 0;
    console.log(`📍 기존 가이드 좌표 보유율: ${coordinateRate}% (${chaptersWithCoordinates}/${totalChapters})`);

    // 새로 생성된 가이드와 비교
    console.log(`\n🆚 새 가이드 vs 기존 가이드 차이점:`);
    console.log(`✅ 새 가이드: 100% 좌표 보유 (라우터에서 강제 주입)`);
    console.log(`❌ 기존 가이드: ${coordinateRate}% 좌표 보유`);
    console.log(`\n📝 주요 차이점:`);
    console.log(`1. 좌표 시스템: 새 가이드는 반드시 coordinates JSON 포함`);
    console.log(`2. 챕터 개수: 새 가이드는 1개, 기존 평균은 ${(chapterCounts.reduce((a, b) => a + b, 0) / chapterCounts.length).toFixed(1)}개`);
    console.log(`3. 데이터 구조: 새 가이드는 최신 프롬프트 기반, 기존은 이전 버전`);

  } catch (error) {
    console.error('❌ 구조 비교 실패:', error.response?.data || error.message);
  }
}

compareGuideStructures();