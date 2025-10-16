/**
 * 🔍 단계별 개별 테스트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 1️⃣ 자동완성만 테스트 (6개 결과)
async function testAutocompleteOnly() {
  console.log(`\n🔍 1단계: 자동완성만 테스트`);
  console.log('='.repeat(30));
  
  const query = '경복궁';
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, locationname, location_region, country_code, language')
      .ilike('locationname', `%${query}%`)
      .limit(6);
    
    if (error) {
      console.error('❌ 오류:', error);
      return null;
    }
    
    console.log(`✅ 자동완성 결과: ${data.length}개`);
    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.locationname} (${item.language})`);
      console.log(`   지역: ${item.location_region}`);  
      console.log(`   국가: ${item.country_code}`);
    });
    
    console.log('\n🎯 첫 번째 결과 선택:', data[0]?.locationname);
    return data[0]; // 첫 번째 결과 반환
    
  } catch (error) {
    console.error('❌ 자동완성 테스트 실패:', error);
    return null;
  }
}

// 실행
if (require.main === module) {
  testAutocompleteOnly().then(result => {
    if (result) {
      console.log('\n📋 선택된 데이터:');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n➡️ 다음 단계: 이 데이터로 지역 정보 추출');
      console.log('   location 필드 파싱 또는 API 호출');
    }
  });
}