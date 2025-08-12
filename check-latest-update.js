const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestUpdate() {
  try {
    // 가장 최근에 업데이트된 가이드 확인
    const { data: guide } = await supabase
      .from('guides')
      .select('locationname, content, coordinates, updated_at')
      .not('coordinates', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (guide) {
      console.log(`📍 최근 업데이트된 가이드: ${guide.locationname}`);
      console.log(`🕒 업데이트 시간: ${guide.updated_at}`);
      
      // content에서 챕터 수 확인
      const content = guide.content;
      if (content && content.content && content.content.realTimeGuide && content.content.realTimeGuide.chapters) {
        const chapters = content.content.realTimeGuide.chapters;
        console.log(`📖 챕터 수: ${chapters.length}`);
        
        chapters.forEach((chapter, idx) => {
          console.log(`  - 챕터 ${idx}: ${chapter.title}`);
        });
      } else {
        console.log(`❌ content.content.realTimeGuide.chapters 없음`);
      }
      
      // coordinates 구조 확인
      const coordinates = guide.coordinates;
      if (coordinates && typeof coordinates === 'object') {
        if (Array.isArray(coordinates)) {
          console.log(`🗺️ 좌표 배열 길이: ${coordinates.length}`);
          coordinates.forEach((coord, idx) => {
            console.log(`  - ${idx}: id=${coord.id}, title=${coord.title}, lat=${coord.lat}, lng=${coord.lng}`);
          });
        } else {
          console.log(`🗺️ 좌표 객체 수: ${Object.keys(coordinates).length}`);
          Object.entries(coordinates).forEach(([key, coord]) => {
            console.log(`  - ${key}: lat=${coord.lat}, lng=${coord.lng}`);
          });
        }
      } else {
        console.log(`❌ coordinates 구조 문제`);
      }
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error.message);
  }
}

checkLatestUpdate();