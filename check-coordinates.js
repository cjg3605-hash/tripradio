const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoordinatesStructure() {
  try {
    // 에펠탑 가이드 데이터 조회
    const { data, error } = await supabase
      .from('guides')
      .select('id, locationname, language, coordinates')
      .eq('locationname', '에펠탑')
      .eq('language', 'ko')
      .limit(1);

    if (error) {
      console.log('❌ DB 조회 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 에펠탑 가이드 데이터를 찾을 수 없습니다');
      return;
    }

    const guide = data[0];
    console.log('✅ 가이드 기본 정보:');
    console.log('- ID:', guide.id);
    console.log('- 위치명:', guide.locationname);
    console.log('- 언어:', guide.language);
    console.log('');
    
    console.log('📍 Coordinates 데이터 구조:');
    console.log('- Type:', typeof guide.coordinates);
    console.log('- Is Array:', Array.isArray(guide.coordinates));
    console.log('- Length:', guide.coordinates?.length || 'N/A');
    console.log('');
    
    if (guide.coordinates && Array.isArray(guide.coordinates)) {
      console.log('📍 첫 번째 좌표 객체 구조:');
      console.log(JSON.stringify(guide.coordinates[0], null, 2));
      console.log('');
      
      console.log('📍 모든 좌표 요약:');
      guide.coordinates.forEach((coord, index) => {
        const title = coord.title || coord.name || 'Unknown';
        const lat = coord.lat || coord.latitude;
        const lng = coord.lng || coord.longitude;
        console.log(`[${index}] ${title}: (${lat}, ${lng})`);
      });
    } else {
      console.log('📍 Coordinates 전체 데이터:');
      console.log(JSON.stringify(guide.coordinates, null, 2));
    }
    
  } catch (err) {
    console.log('❌ 오류:', err.message);
  }
}

checkCoordinatesStructure();
