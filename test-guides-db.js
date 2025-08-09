// DB 가이드 데이터 조회 테스트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 DB 연결 테스트 시작...');
console.log('Supabase URL:', supabaseUrl ? '설정됨' : '❌ 없음');
console.log('Supabase Key:', supabaseAnonKey ? '설정됨' : '❌ 없음');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGuides() {
  try {
    console.log('\n📊 가이드 데이터 조회 중...');
    
    // 전체 가이드 수 확인
    const { count, error: countError } = await supabase
      .from('guides')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 가이드 카운트 조회 실패:', countError);
      return;
    }
    
    console.log(`📈 전체 가이드 수: ${count}개`);
    
    // 한국어 가이드 샘플 조회
    const { data, error } = await supabase
      .from('guides')
      .select('locationname, language')
      .eq('language', 'ko')
      .limit(10);
    
    if (error) {
      console.error('❌ 가이드 조회 실패:', error);
      return;
    }
    
    console.log(`✅ 한국어 가이드 샘플 ${data?.length || 0}개 조회 성공:`);
    data?.forEach((guide, index) => {
      console.log(`  ${index + 1}. ${guide.locationname}`);
    });
    
    // 사이트맵에 사용되는 로직과 동일한 조회
    console.log('\n🗺️ 사이트맵 로직 테스트...');
    const { data: sitemapData, error: sitemapError } = await supabase
      .from('guides')
      .select('locationname')
      .eq('language', 'ko')
      .order('locationname');
    
    if (sitemapError) {
      console.error('❌ 사이트맵 로직 실패:', sitemapError);
      return;
    }
    
    console.log(`✅ 사이트맵용 가이드 ${sitemapData?.length || 0}개 조회 성공`);
    if (sitemapData && sitemapData.length > 0) {
      console.log('처음 5개 가이드:');
      sitemapData.slice(0, 5).forEach((guide, index) => {
        const encodedName = encodeURIComponent(guide.locationname);
        console.log(`  ${index + 1}. ${guide.locationname} → /guide/${encodedName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

testGuides();