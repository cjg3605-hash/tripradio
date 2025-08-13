// coordinates 칼럼 디버깅 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCoordinates() {
  try {
    console.log('🔍 coordinates 칼럼 상태 디버깅 시작...\n');
    
    // 1. 전체 가이드 수와 coordinates 칼럼 상태 확인
    const { data: allGuides, error: allError } = await supabase
      .from('guides')
      .select('id, locationname, language, coordinates')
      .limit(5);
    
    if (allError) {
      console.error('❌ DB 조회 오류:', allError);
      return;
    }
    
    console.log(`📊 전체 가이드 샘플 (처음 5개):`);
    allGuides.forEach((guide, index) => {
      console.log(`${index + 1}. ${guide.locationname} (${guide.language})`);
      console.log(`   coordinates: ${guide.coordinates ? `${guide.coordinates.length}개 항목` : 'null/undefined'}`);
      if (guide.coordinates && guide.coordinates.length > 0) {
        console.log(`   첫 번째 좌표 샘플:`, JSON.stringify(guide.coordinates[0], null, 2));
      }
      console.log('');
    });
    
    // 2. 특정 가이드 상세 확인 (용궁사)
    console.log('\n🎯 용궁사 가이드 상세 확인:');
    const { data: yongGuides, error: yongError } = await supabase
      .from('guides')
      .select('id, locationname, language, coordinates, content')
      .ilike('locationname', '%용궁사%');
    
    if (yongError) {
      console.error('❌ 용궁사 조회 오류:', yongError);
    } else if (yongGuides.length === 0) {
      console.log('❌ 용궁사 가이드를 찾을 수 없음');
    } else {
      yongGuides.forEach(guide => {
        console.log(`\n📍 ${guide.locationname} (${guide.language}):`);
        console.log(`   ID: ${guide.id}`);
        console.log(`   coordinates 칼럼: ${guide.coordinates ? `${guide.coordinates.length}개 좌표` : 'null'}`);
        
        if (guide.coordinates) {
          console.log('   coordinates 내용:');
          guide.coordinates.forEach((coord, i) => {
            console.log(`     ${i + 1}: ${coord.title || '제목없음'} - (${coord.coordinates?.lat || coord.lat}, ${coord.coordinates?.lng || coord.lng})`);
          });
        }
        
        // content에서 realTimeGuide.chapters 확인
        if (guide.content?.realTimeGuide?.chapters) {
          console.log(`   content.realTimeGuide.chapters: ${guide.content.realTimeGuide.chapters.length}개 챕터`);
          guide.content.realTimeGuide.chapters.slice(0, 2).forEach((chapter, i) => {
            console.log(`     챕터 ${i + 1}: ${chapter.title} - (${chapter.coordinates?.lat}, ${chapter.coordinates?.lng})`);
          });
        } else {
          console.log('   content.realTimeGuide.chapters: 없음');
        }
      });
    }
    
    // 3. coordinates 칼럼이 null인 가이드 수 확인
    const { data: nullCoords, error: nullError } = await supabase
      .from('guides')
      .select('id, locationname, language')
      .is('coordinates', null);
    
    if (!nullError) {
      console.log(`\n📊 coordinates 칼럼이 null인 가이드: ${nullCoords.length}개`);
    }
    
  } catch (error) {
    console.error('❌ 디버깅 오류:', error);
  }
}

debugCoordinates();