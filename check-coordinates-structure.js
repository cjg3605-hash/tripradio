const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoordinatesStructure() {
  try {
    // 좌표가 있는 가이드 몇 개 샘플 확인
    const { data: guides } = await supabase
      .from('guides')
      .select('locationname, content, coordinates')
      .not('coordinates', 'is', null)
      .limit(3);
    
    if (guides) {
      guides.forEach((guide, i) => {
        console.log(`\n📍 가이드 ${i+1}: ${guide.locationname}`);
        
        // content에서 챕터 수 확인
        const content = guide.content;
        if (content && content.chapters) {
          const chapters = content.chapters;
          console.log(`📖 챕터 수: ${chapters.length}`);
          
          chapters.forEach((chapter, idx) => {
            console.log(`  - 챕터 ${idx}: ${chapter.title || 'No title'}`);
          });
        } else {
          console.log(`❌ content에 chapters 없음`);
        }
        
        // coordinates 구조 확인
        const coordinates = guide.coordinates;
        if (coordinates && typeof coordinates === 'object') {
          console.log(`🗺️ 좌표 객체 수: ${Object.keys(coordinates).length}`);
          
          Object.entries(coordinates).forEach(([key, coord]) => {
            console.log(`  - ${key}: lat=${coord.lat}, lng=${coord.lng}`);
          });
        } else {
          console.log(`❌ coordinates 구조 문제`);
        }
        
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error.message);
  }
}

checkCoordinatesStructure();