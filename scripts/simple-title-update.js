const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 제목 최적화 함수
function optimizeTitle(originalTitle, locationName) {
  console.log(`🔧 제목 최적화: "${originalTitle}"`);
  
  // 1. 콜론 뒤 설명문 제거
  let optimizedTitle = originalTitle;
  if (originalTitle.includes(':')) {
    const colonIndex = originalTitle.indexOf(':');
    optimizedTitle = originalTitle.substring(0, colonIndex).trim();
    console.log(`   → 콜론 제거: "${optimizedTitle}"`);
  }
  
  // 2. 시설명이 없으면 기본 시설명 추가
  if (optimizedTitle === locationName) {
    optimizedTitle = `${locationName} 매표소`;
    console.log(`   → 기본 시설명 추가: "${optimizedTitle}"`);
  }
  
  console.log(`✅ 최적화 결과: "${originalTitle}" → "${optimizedTitle}"`);
  return optimizedTitle;
}

async function updateSingleIntroTitle(locationName, language = 'ko') {
  try {
    console.log(`🔄 ${locationName} (${language}) 인트로 제목 최적화 시작`);
    
    // 1. 기존 가이드 검색
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName)
      .eq('language', language)
      .single();

    if (error || !guides) {
      throw new Error(`가이드를 찾을 수 없습니다: ${error?.message}`);
    }

    console.log(`✅ 기존 가이드 발견: ${guides.id}`);
    const originalIntro = guides.content.content.realTimeGuide.chapters[0];
    console.log(`📖 현재 인트로 제목: "${originalIntro.title}"`);

    // 2. 제목 최적화
    const optimizedTitle = optimizeTitle(originalIntro.title, locationName);
    
    if (optimizedTitle === originalIntro.title) {
      console.log('ℹ️ 이미 최적화된 제목입니다. 업데이트할 필요 없음.');
      return { success: true, changed: false, title: optimizedTitle };
    }

    // 3. 기존 가이드 내용 복사 후 인트로 제목만 교체
    const updatedContent = { ...guides.content };
    updatedContent.content.realTimeGuide.chapters[0] = {
      ...originalIntro,
      title: optimizedTitle
    };

    // 4. DB 업데이트
    const { error: updateError } = await supabase
      .from('guides')
      .update({ content: updatedContent })
      .eq('id', guides.id);

    if (updateError) {
      throw new Error(`DB 업데이트 실패: ${updateError.message}`);
    }

    console.log(`✅ ${locationName} (${language}) 인트로 제목 최적화 완료`);
    console.log(`📊 변경사항:`);
    console.log(`   이전 제목: "${originalIntro.title}"`);
    console.log(`   새 제목: "${optimizedTitle}"`);

    return {
      success: true,
      changed: true,
      guideId: guides.id,
      oldTitle: originalIntro.title,
      newTitle: optimizedTitle
    };

  } catch (error) {
    console.error(`❌ 업데이트 실패:`, error.message);
    return { success: false, error: error.message };
  }
}

// 스크립트가 직접 실행될 때
if (require.main === module) {
  const locationName = process.argv[2] || '자갈치시장';
  const language = process.argv[3] || 'ko';
  
  updateSingleIntroTitle(locationName, language)
    .then(result => {
      if (result.success) {
        if (result.changed) {
          console.log(`\n🎉 제목 최적화 완료!`);
        } else {
          console.log(`\n✨ 이미 최적화된 상태입니다.`);
        }
        process.exit(0);
      } else {
        console.log(`\n❌ 최적화 실패: ${result.error}`);
        process.exit(1);
      }
    });
}

module.exports = { updateSingleIntroTitle, optimizeTitle };