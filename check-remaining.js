const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRemaining() {
  try {
    // 좌표가 없는 가이드 수
    const { count: withoutCoordinates } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .or('coordinates.is.null,coordinates.eq.{}');
    
    // 지역 정보가 없는 가이드 수
    const { count: withoutRegion } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .or('location_region.is.null,country_code.is.null');
    
    console.log('📊 남은 마이그레이션 대상:');
    console.log(`좌표가 없는 가이드: ${withoutCoordinates}개`);
    console.log(`지역정보가 없는 가이드: ${withoutRegion}개`);
    
    // 좌표는 있지만 지역정보가 없는 가이드들 확인
    const { data: needsRegionOnly } = await supabase
      .from('guides')
      .select('locationname, coordinates, location_region, country_code')
      .not('coordinates', 'is', null)
      .or('location_region.is.null,country_code.is.null')
      .limit(10);
    
    if (needsRegionOnly && needsRegionOnly.length > 0) {
      console.log('\n🔍 좌표는 있지만 지역정보가 없는 가이드들 (예시):');
      needsRegionOnly.forEach((guide, i) => {
        console.log(`${i+1}. ${guide.locationname} - 좌표: ${guide.coordinates ? '있음' : '없음'}, 지역: ${guide.location_region || '없음'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error.message);
  }
}

checkRemaining();