// 수파베이스 연결 테스트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔍 환경변수 확인:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 미설정');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 미설정');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 수파베이스 환경변수가 없습니다!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    console.log('\n🔗 수파베이스 연결 테스트 시작...');
    
    // 1. 기본 연결 테스트
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 인증 상태:', authError ? '❌ 오류' : '✅ 정상');
    
    // 2. guides 테이블 구조 확인
    console.log('\n📋 guides 테이블 조회 테스트...');
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('*')
      .limit(5);
    
    if (guidesError) {
      console.error('❌ guides 테이블 오류:', guidesError.message);
    } else {
      console.log('✅ guides 테이블 접근 성공');
      console.log('📊 조회된 가이드 수:', guides?.length || 0);
      if (guides && guides.length > 0) {
        console.log('🗂️ 첫 번째 가이드 구조:', Object.keys(guides[0]));
      }
    }
    
    // 3. 특정 위치로 테스트
    const testLocation = '서울';
    console.log(`\n🏙️ "${testLocation}" 가이드 검색 테스트...`);
    
    const { data: seoulGuides, error: seoulError } = await supabase
      .from('guides')
      .select('locationname, language, content')
      .eq('locationname', testLocation)
      .limit(3);
    
    if (seoulError) {
      console.error('❌ 서울 가이드 검색 오류:', seoulError.message);
    } else {
      console.log('✅ 서울 가이드 검색 성공');
      console.log('📊 검색된 가이드:', seoulGuides?.length || 0);
      seoulGuides?.forEach((guide, index) => {
        console.log(`${index + 1}. 언어: ${guide.language}, 위치: ${guide.locationname}`);
        console.log(`   내용 있음: ${guide.content ? '✅' : '❌'}`);
        if (guide.content) {
          console.log(`   내용 타입: ${typeof guide.content}`);
          if (typeof guide.content === 'object') {
            console.log(`   내용 키들: ${Object.keys(guide.content).join(', ')}`);
          }
        }
      });
    }
    
    // 4. 모든 위치명 확인
    console.log('\n🌍 데이터베이스의 모든 위치명 확인...');
    const { data: locations, error: locError } = await supabase
      .from('guides')
      .select('locationname, language')
      .order('locationname');
    
    if (locError) {
      console.error('❌ 위치명 조회 오류:', locError.message);
    } else {
      console.log('📍 총 가이드 수:', locations?.length || 0);
      
      // 위치별로 그룹핑
      const locationGroups = {};
      locations?.forEach(loc => {
        if (!locationGroups[loc.locationname]) {
          locationGroups[loc.locationname] = [];
        }
        locationGroups[loc.locationname].push(loc.language);
      });
      
      console.log('\n📋 위치별 언어 현황:');
      Object.entries(locationGroups).forEach(([location, languages]) => {
        console.log(`  ${location}: [${languages.join(', ')}]`);
      });
    }
    
  } catch (error) {
    console.error('💥 연결 테스트 중 오류:', error);
  }
}

testSupabaseConnection();