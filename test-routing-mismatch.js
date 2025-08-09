// 라우팅 불일치 문제 테스트 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// utils.ts의 정규화 함수 재구현
function normalizeLocationName(locationName) {
  return locationName.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function testRoutingMismatch() {
  console.log('🔍 라우팅 불일치 문제 분석 시작...\n');
  
  try {
    // 1. DB에서 실제 가이드 데이터 조회
    console.log('1️⃣ DB에서 한국어 가이드 조회...');
    const { data: guides, error } = await supabase
      .from('guides')
      .select('locationname, language')
      .eq('language', 'ko')
      .limit(10);
    
    if (error) {
      console.error('❌ DB 조회 실패:', error);
      return;
    }
    
    console.log(`✅ ${guides.length}개 가이드 발견\n`);
    
    // 2. 각 가이드에 대해 라우팅 테스트
    for (const guide of guides) {
      const originalName = guide.locationname;
      
      console.log(`🎯 테스트 대상: "${originalName}"`);
      
      // 2-1. 사이트맵에서 생성될 URL
      const encodedUrl = encodeURIComponent(originalName);
      console.log(`   📝 사이트맵 URL: /guide/${encodedUrl}`);
      
      // 2-2. 페이지에서 처리되는 방식
      const decodedName = decodeURIComponent(encodedUrl);
      const normalizedName = normalizeLocationName(decodedName);
      console.log(`   🔄 디코딩: "${decodedName}"`);
      console.log(`   📐 정규화: "${normalizedName}"`);
      
      // 2-3. 정규화 전후 비교
      const isNormalizationChanged = originalName !== normalizedName;
      if (isNormalizationChanged) {
        console.log(`   ⚠️  정규화로 인한 변경 발생!`);
        console.log(`       원본: "${originalName}"`);
        console.log(`       정규화: "${normalizedName}"`);
      } else {
        console.log(`   ✅ 정규화 후에도 동일함`);
      }
      
      // 2-4. 실제 DB 조회 테스트 (정규화된 이름으로)
      const { data: foundGuide, error: searchError } = await supabase
        .from('guides')
        .select('locationname')
        .eq('locationname', normalizedName)
        .eq('language', 'ko')
        .single();
      
      if (searchError) {
        if (searchError.code === 'PGRST116') {
          console.log(`   ❌ DB 조회 실패: 정규화된 이름으로 가이드를 찾을 수 없음`);
          
          // 원본 이름으로 다시 시도
          const { data: originalGuide, error: originalError } = await supabase
            .from('guides')
            .select('locationname')
            .eq('locationname', originalName)
            .eq('language', 'ko')
            .single();
          
          if (!originalError && originalGuide) {
            console.log(`   🔍 원본 이름으로는 찾음: "${originalName}"`);
            console.log(`   🚨 라우팅 불일치 확인!`);
          }
        } else {
          console.log(`   ❌ DB 조회 오류:`, searchError.message);
        }
      } else {
        console.log(`   ✅ DB 조회 성공: "${foundGuide.locationname}"`);
      }
      
      console.log(`   ---`);
    }
    
    console.log('\n📊 테스트 완료');
    
    // 3. 사이트맵 URL 생성 시뮬레이션
    console.log('\n3️⃣ 사이트맵 URL 생성 시뮬레이션...');
    guides.forEach(guide => {
      const sitemap_url = `/guide/${encodeURIComponent(guide.locationname)}`;
      console.log(`${guide.locationname} → ${sitemap_url}`);
    });
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  }
}

testRoutingMismatch();