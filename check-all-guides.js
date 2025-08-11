// 전체 가이드 목록 확인 스크립트
const axios = require('axios');

const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

async function checkAllGuides() {
  console.log('🔍 전체 가이드 목록 확인...\n');

  try {
    // 최신 가이드들 조회
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        'select': 'locationname,language,created_at,updated_at',
        'order': 'updated_at.desc',
        'limit': '10'
      }
    });

    const guides = response.data;
    console.log(`📊 최근 가이드 ${guides.length}개:`);
    
    guides.forEach((guide, index) => {
      console.log(`${index + 1}. ${guide.locationname} (${guide.language}) - ${guide.updated_at}`);
    });
    
    // 용궁사 관련 모든 가이드 찾기
    console.log('\n🔍 용궁사 관련 가이드 검색...');
    
    const yonggungsaResponse = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        'select': 'locationname,language,updated_at',
        'locationname': 'like.*용궁사*'
      }
    });
    
    const yonggungsaGuides = yonggungsaResponse.data;
    
    if (yonggungsaGuides.length > 0) {
      console.log(`✅ 용궁사 관련 가이드 ${yonggungsaGuides.length}개 발견:`);
      yonggungsaGuides.forEach((guide, index) => {
        console.log(`  ${index + 1}. "${guide.locationname}" (${guide.language}) - ${guide.updated_at}`);
      });
    } else {
      console.log('❌ 용궁사 관련 가이드 없음');
    }

  } catch (error) {
    console.error('❌ DB 조회 실패:', error.response ? error.response.data : error.message);
  }
}

checkAllGuides();