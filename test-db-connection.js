// 데이터베이스 연결 테스트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 데이터베이스 연결 테스트 시작...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('환경변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl ? '설정됨' : '❌ 미설정');
console.log('SUPABASE_KEY:', supabaseKey ? '설정됨' : '❌ 미설정');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 데이터베이스 연결 테스트...');
    
    // 간단한 쿼리 테스트 - 존재하는 테이블로 변경
    const { data, error } = await supabase
      .from('guides')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ 데이터베이스 연결 실패:', error.message);
      return false;
    }
    
    console.log('✅ 데이터베이스 연결 성공!');
    return true;
  } catch (err) {
    console.error('❌ 연결 테스트 중 오류:', err.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});