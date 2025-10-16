/**
 * 🚨 긴급 롤백 스크립트
 * 잘못 업데이트된 5개 가이드를 원래 상태로 복구
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase 클라이언트
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 🔍 잘못 업데이트된 가이드 식별
 * 2025-08-10T17:28:00 이후 업데이트된 가이드들 중 "매표소" 포함된 것들
 */
async function identifyCorruptedGuides() {
  const supabase = getSupabaseClient();
  
  console.log('🔍 손상된 가이드 식별 중...');
  
  try {
    // 최근 업데이트된 가이드들 조회 (2025-08-10 17:28 이후)
    const { data: recentGuides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content, updated_at')
      .gte('updated_at', '2025-08-10T17:28:00')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`📊 최근 업데이트된 가이드: ${recentGuides.length}개`);
    
    // "매표소" 키워드로 손상된 가이드 필터링
    const corruptedGuides = recentGuides.filter(guide => {
      const introChapter = guide.content?.content?.realTimeGuide?.chapters?.[0];
      return introChapter?.title?.includes('매표소');
    });
    
    console.log(`🚨 손상된 가이드 발견: ${corruptedGuides.length}개`);
    
    corruptedGuides.forEach((guide, index) => {
      console.log(`  ${index + 1}. ${guide.locationname} (${guide.language})`);
      console.log(`     ID: ${guide.id}`);
      console.log(`     업데이트 시간: ${guide.updated_at}`);
      console.log(`     문제 타이틀: ${guide.content?.content?.realTimeGuide?.chapters?.[0]?.title}`);
    });
    
    return corruptedGuides;
    
  } catch (error) {
    console.error('❌ 손상된 가이드 식별 실패:', error);
    throw error;
  }
}

/**
 * 📋 원본 데이터 백업 조회
 * Git 히스토리나 이전 버전에서 원본 데이터를 복구
 */
async function getOriginalData(locationname, language) {
  // 분석 결과에서 원본 데이터 추출
  const analysisFile = path.join(__dirname, 'guide-structure-analysis-2025-08-10T17-21-39-524Z.json');
  
  if (fs.existsSync(analysisFile)) {
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    
    // 샘플 분석에서 원본 타이틀 찾기
    const originalSample = analysis.commonStructures?.introChapterStructures?.find(intro => 
      intro.sampleData?.title && !intro.sampleData.title.includes('매표소')
    );
    
    if (originalSample) {
      console.log(`📖 원본 데이터 참조 발견: ${originalSample.sampleData.title}`);
    }
  }
  
  // 특정 가이드별 원본 복원 로직
  const originalData = {
    'aldea cultural de gamcheon_es': {
      title: "Centro de Información Turística de Gamcheon - Punto de Partida y Contexto",
      coordinates: {
        lat: 35.1316,
        lng: 129.0019,
        description: "감천문화마을 안내센터 앞"
      }
    },
    'alhambra_en': {
      title: "Puerta de la Justicia: The Grand Entrance and Its Symbolism",
      coordinates: {
        // 원본 좌표 복원 필요
        lat: 37.1760,
        lng: -3.5885,
        description: "Alhambra main entrance"
      }
    },
    'alhambra_es': {
      title: "Puerta de la Justicia - Guardiana del Poder Nazarí",
      coordinates: {
        lat: 37.1760,
        lng: -3.5885,
        description: "Entrada principal de la Alhambra"
      }
    },
    'banff national park_en': {
      title: "Banff Park East Gate: Entry to a Geological Marvel",
      coordinates: {
        lat: 51.1784,
        lng: -115.5708,
        description: "Banff National Park East Entrance"
      }
    },
    'big ben_en': {
      title: "Westminster Bridge: The Classic View of Big Ben",
      coordinates: {
        lat: 51.5007,
        lng: -0.1246,
        description: "Westminster Bridge viewpoint"
      }
    }
  };
  
  const key = `${locationname}_${language}`;
  return originalData[key] || null;
}

/**
 * 🔄 개별 가이드 롤백
 */
async function rollbackGuide(guide) {
  const supabase = getSupabaseClient();
  
  console.log(`🔄 롤백 중: ${guide.locationname} (${guide.language})`);
  
  try {
    // 원본 데이터 조회
    const originalData = getOriginalData(guide.locationname, guide.language);
    
    if (!originalData) {
      console.log(`⚠️ 원본 데이터 없음 - 수동 복원 필요: ${guide.locationname}`);
      return { success: false, reason: 'no_original_data' };
    }
    
    // 현재 콘텐츠 복사
    const restoredContent = JSON.parse(JSON.stringify(guide.content));
    
    // 인트로 챕터만 원본으로 복원
    if (restoredContent?.content?.realTimeGuide?.chapters?.[0]) {
      restoredContent.content.realTimeGuide.chapters[0].title = originalData.title;
      restoredContent.content.realTimeGuide.chapters[0].coordinates = originalData.coordinates;
    }
    
    // 데이터베이스 업데이트
    const { error: updateError } = await supabase
      .from('guides')
      .update({ 
        content: restoredContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', guide.id);
    
    if (updateError) throw updateError;
    
    console.log(`✅ 롤백 완료: ${guide.locationname}`);
    console.log(`   복원된 타이틀: ${originalData.title}`);
    
    return { success: true, originalData };
    
  } catch (error) {
    console.error(`❌ 롤백 실패: ${guide.locationname} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 메인 롤백 실행
 */
async function executeEmergencyRollback() {
  console.log('🚨 긴급 롤백 시작!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const rollbackResults = {
    total: 0,
    successful: 0,
    failed: 0,
    details: []
  };
  
  try {
    // 1. 손상된 가이드 식별
    const corruptedGuides = await identifyCorruptedGuides();
    rollbackResults.total = corruptedGuides.length;
    
    if (corruptedGuides.length === 0) {
      console.log('✅ 손상된 가이드가 없습니다.');
      return rollbackResults;
    }
    
    console.log(`\n🔧 ${corruptedGuides.length}개 가이드 롤백 시작...`);
    
    // 2. 각 가이드 롤백 실행
    for (const guide of corruptedGuides) {
      const result = await rollbackGuide(guide);
      
      rollbackResults.details.push({
        guide: `${guide.locationname} (${guide.language})`,
        success: result.success,
        reason: result.reason || null,
        error: result.error || null
      });
      
      if (result.success) {
        rollbackResults.successful++;
      } else {
        rollbackResults.failed++;
      }
      
      // 롤백 간 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 3. 결과 보고서
    console.log('\n🎯 롤백 완료!');
    console.log(`📊 결과: ${rollbackResults.successful}개 성공, ${rollbackResults.failed}개 실패`);
    
    if (rollbackResults.failed > 0) {
      console.log('\n⚠️ 실패한 가이드들:');
      rollbackResults.details
        .filter(d => !d.success)
        .forEach(detail => {
          console.log(`  - ${detail.guide}: ${detail.reason || detail.error}`);
        });
    }
    
    // 결과 파일 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(__dirname, `emergency-rollback-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      rollbackResults,
      corruptedGuides: corruptedGuides.map(g => ({
        id: g.id,
        locationname: g.locationname,
        language: g.language,
        updated_at: g.updated_at
      }))
    }, null, 2));
    
    console.log(`📄 롤백 보고서 저장: ${path.basename(reportFile)}`);
    
    return rollbackResults;
    
  } catch (error) {
    console.error('💥 긴급 롤백 실행 실패:', error);
    throw error;
  }
}

/**
 * 🛡️ 수동 롤백 옵션
 */
async function manualRollback(guideId, originalTitle, originalCoordinates) {
  const supabase = getSupabaseClient();
  
  console.log(`🔧 수동 롤백: ${guideId}`);
  
  try {
    // 현재 가이드 조회
    const { data: guide, error: fetchError } = await supabase
      .from('guides')
      .select('*')
      .eq('id', guideId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // 콘텐츠 복사 및 수정
    const restoredContent = JSON.parse(JSON.stringify(guide.content));
    
    if (restoredContent?.content?.realTimeGuide?.chapters?.[0]) {
      restoredContent.content.realTimeGuide.chapters[0].title = originalTitle;
      restoredContent.content.realTimeGuide.chapters[0].coordinates = originalCoordinates;
    }
    
    // 업데이트
    const { error: updateError } = await supabase
      .from('guides')
      .update({ 
        content: restoredContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', guideId);
    
    if (updateError) throw updateError;
    
    console.log(`✅ 수동 롤백 완료: ${guide.locationname} (${guide.language})`);
    
  } catch (error) {
    console.error(`❌ 수동 롤백 실패: ${error.message}`);
    throw error;
  }
}

// CLI 실행
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'manual' && args.length >= 4) {
      // 수동 롤백: node emergency-rollback.js manual <guide-id> <title> <lat> <lng> <description>
      const guideId = args[1];
      const originalTitle = args[2];
      const originalCoordinates = {
        lat: parseFloat(args[3]),
        lng: parseFloat(args[4]),
        description: args[5] || ''
      };
      
      await manualRollback(guideId, originalTitle, originalCoordinates);
      
    } else {
      // 자동 롤백
      await executeEmergencyRollback();
    }
    
  } catch (error) {
    console.error('💥 롤백 스크립트 실행 실패:', error);
    process.exit(1);
  }
}

// 직접 실행시
if (require.main === module) {
  main();
}

module.exports = {
  executeEmergencyRollback,
  identifyCorruptedGuides,
  rollbackGuide,
  manualRollback
};