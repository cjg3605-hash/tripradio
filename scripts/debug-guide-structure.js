const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function debugGuideStructure(locationName, language = 'ko') {
  try {
    console.log(`🔍 ${locationName} (${language}) 가이드 구조 분석 시작`);
    
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName)
      .eq('language', language)
      .single();

    if (error || !guides) {
      throw new Error(`가이드를 찾을 수 없습니다: ${error?.message}`);
    }

    console.log(`✅ 가이드 발견: ${guides.id}`);
    console.log(`📋 가이드 키들:`, Object.keys(guides));
    console.log(`📖 content 구조:`, guides.content ? Object.keys(guides.content) : 'content가 null/undefined');
    
    if (guides.content) {
      console.log(`📄 content 전체:`, JSON.stringify(guides.content, null, 2));
    }

    return guides;
  } catch (error) {
    console.error('❌ 오류:', error.message);
    return null;
  }
}

// 스크립트가 직접 실행될 때
if (require.main === module) {
  const locationName = process.argv[2] || '자갈치시장';
  const language = process.argv[3] || 'ko';
  
  debugGuideStructure(locationName, language);
}

module.exports = { debugGuideStructure };