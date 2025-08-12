const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContentStructure() {
  try {
    // 1개 가이드의 전체 구조 확인
    const { data: guide } = await supabase
      .from('guides')
      .select('*')
      .not('coordinates', 'is', null)
      .limit(1)
      .single();
    
    if (guide) {
      console.log(`📍 가이드: ${guide.locationname}`);
      console.log(`🗂️ Content 타입: ${typeof guide.content}`);
      console.log(`🗺️ Coordinates 타입: ${typeof guide.coordinates}`);
      
      console.log('\n📖 Content 구조:');
      console.log(JSON.stringify(guide.content, null, 2));
      
      console.log('\n🗺️ Coordinates 구조:');
      console.log(JSON.stringify(guide.coordinates, null, 2));
      
      // content에서 실제 텍스트 검색해서 챕터 찾기
      const contentStr = JSON.stringify(guide.content);
      const chapterMatches = contentStr.match(/"title":/g);
      console.log(`\n🔍 "title" 필드 발견 개수: ${chapterMatches ? chapterMatches.length : 0}`);
      
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error.message);
  }
}

checkContentStructure();