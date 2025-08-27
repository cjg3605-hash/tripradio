const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 설정 (개발서버에서 환경변수 확인)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jilhvhvzfknfvygqxbfz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbGh2aHZ6ZmtuZnZ5Z3F4YmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMzU5OTYsImV4cCI6MjAzNjYxMTk5Nn0.2qZPxgA5_lMIxKOVW4SJ19Qd4E15iZ20qz4lNtBvxzI';

console.log('🔗 Supabase URL:', supabaseUrl ? 'Set' : 'Not Set');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSlugColumns() {
  console.log('🔍 슬러그 컬럼 존재 확인 중...');
  
  try {
    // 1. 기존 에피소드에서 슬러그 컬럼 조회 테스트
    const { data: episodes, error: queryError } = await supabase
      .from('podcast_episodes')
      .select('id, title, language, location_input, location_slug, slug_source')
      .limit(1);
    
    if (queryError) {
      console.error('❌ 슬러그 컬럼 조회 실패:', queryError);
      console.log('💡 아마도 location_input, location_slug, slug_source 컬럼이 없는 것 같습니다.');
      return false;
    }
    
    console.log('✅ 슬러그 컬럼이 존재합니다!');
    console.log('📊 기존 에피소드 슬러그 정보:', episodes);
    
    return true;
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    return false;
  }
}

testSlugColumns();