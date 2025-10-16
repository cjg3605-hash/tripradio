const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAllCoordinates() {
  try {
    console.log('🔄 전체 좌표 및 지역 정보 초기화 시작...');
    
    // 먼저 전체 가이드 목록 가져오기
    const { data: allGuides, error: fetchError } = await supabase
      .from('guides')
      .select('id')
      .limit(1000);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`📋 총 ${allGuides.length}개 가이드 발견`);
    
    // 배치로 업데이트 (100개씩)
    const batchSize = 100;
    let totalUpdated = 0;
    
    for (let i = 0; i < allGuides.length; i += batchSize) {
      const batch = allGuides.slice(i, i + batchSize);
      const ids = batch.map(guide => guide.id);
      
      const { data, error } = await supabase
        .from('guides')
        .update({
          coordinates: null,
          location_region: null,
          country_code: null
        })
        .in('id', ids)
        .select('id');
      
      if (error) {
        throw error;
      }
      
      totalUpdated += data ? data.length : 0;
      console.log(`🔄 ${totalUpdated}/${allGuides.length} 업데이트 완료`);
    }
    
    console.log(`✅ ${totalUpdated}개 가이드 초기화 완료`);
    
    // 초기화 결과 확인
    const { count: totalGuides } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true });
    
    const { count: withCoordinates } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .not('coordinates', 'is', null);
    
    const { count: withRegion } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .not('location_region', 'is', null);
    
    console.log('📊 초기화 후 상태:');
    console.log(`전체 가이드: ${totalGuides}개`);
    console.log(`좌표가 있는 가이드: ${withCoordinates}개`);
    console.log(`지역정보가 있는 가이드: ${withRegion}개`);
    
  } catch (error) {
    console.error('❌ 초기화 중 오류:', error.message);
  }
}

resetAllCoordinates();