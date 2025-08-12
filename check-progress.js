const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProgress() {
  try {
    // 전체 가이드 수
    const { count: totalGuides } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true });
    
    // 좌표가 있는 가이드 수  
    const { count: withCoordinates } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .not('coordinates', 'is', null);
    
    // 지역 정보가 있는 가이드 수
    const { count: withRegion } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .not('location_region', 'is', null)
      .not('country_code', 'is', null);
    
    console.log('📊 마이그레이션 진행상황:');
    console.log(`전체 가이드: ${totalGuides}`);
    console.log(`좌표 완료: ${withCoordinates} (${((withCoordinates/totalGuides)*100).toFixed(1)}%)`);
    console.log(`지역정보 완료: ${withRegion} (${((withRegion/totalGuides)*100).toFixed(1)}%)`);
    
    // 최근 업데이트된 가이드 몇 개 확인
    const { data: recentlyUpdated } = await supabase
      .from('guides')
      .select('locationname, location_region, country_code, coordinates')
      .not('location_region', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5);
    
    console.log('\n🔄 최근 업데이트된 가이드들:');
    recentlyUpdated?.forEach((guide, i) => {
      console.log(`${i+1}. ${guide.locationname} → ${guide.location_region}, ${guide.country_code}`);
    });
    
  } catch (error) {
    console.error('❌ 상태 확인 중 오류:', error.message);
  }
}

checkProgress();