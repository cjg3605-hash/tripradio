// 용궁사 가이드 데이터베이스 저장 확인 스크립트
const axios = require('axios');

const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

async function verifyYonggungsaInDB() {
  console.log('🔍 용궁사 가이드 DB 저장 확인...\n');

  try {
    // 용궁사 가이드 조회
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        'select': 'locationname,language,content,created_at,updated_at',
        'locationname': 'eq.용궁사',
        'language': 'eq.ko'
      }
    });

    const guides = response.data;
    
    if (guides.length === 0) {
      console.log('❌ 용궁사 가이드가 데이터베이스에 없습니다.');
      return;
    }

    const guide = guides[0];
    console.log('✅ 용궁사 가이드 발견!');
    console.log('📍 위치명:', guide.locationname);
    console.log('🌐 언어:', guide.language);
    console.log('📅 생성일:', guide.created_at);
    console.log('🔄 수정일:', guide.updated_at);
    
    // 콘텐츠 구조 분석
    const content = guide.content;
    console.log('\n📊 콘텐츠 구조 분석:');
    console.log('  - realTimeGuide 존재:', !!(content && content.realTimeGuide));
    
    if (content && content.realTimeGuide && content.realTimeGuide.chapters) {
      const chapters = content.realTimeGuide.chapters;
      console.log('  - chapters 개수:', chapters.length);
      
      chapters.forEach((chapter, index) => {
        console.log(`\n  📖 챕터 ${index + 1}: ${chapter.title}`);
        console.log(`     📍 좌표: ${JSON.stringify(chapter.coordinates)}`);
        console.log(`     📝 내용 길이: ${chapter.narrative ? chapter.narrative.length : 0}자`);
      });
      
      // 좌표 유무 확인
      const chaptersWithCoordinates = chapters.filter(chapter => 
        chapter.coordinates && chapter.coordinates.lat && chapter.coordinates.lng
      );
      
      console.log(`\n📊 좌표 통계:`);
      console.log(`  - 전체 챕터: ${chapters.length}개`);
      console.log(`  - 좌표 있는 챕터: ${chaptersWithCoordinates.length}개`);
      console.log(`  - 좌표 보유율: ${(chaptersWithCoordinates.length / chapters.length * 100).toFixed(1)}%`);
      
      if (chaptersWithCoordinates.length === chapters.length) {
        console.log('✅ 모든 챕터에 좌표 JSON 포함 - 좌표 시스템 정상 작동!');
      } else {
        console.log('⚠️ 일부 챕터에 좌표 누락');
      }
    } else {
      console.log('❌ realTimeGuide.chapters 구조가 없습니다.');
    }

  } catch (error) {
    console.error('❌ DB 조회 실패:', error.response ? error.response.data : error.message);
  }
}

verifyYonggungsaInDB();