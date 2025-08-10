/**
 * 🔍 기존 DB 가이드 구조 분석 스크립트
 * 실제 Supabase DB에서 가이드를 조회하여 JSON 구조를 완전히 파악
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 클라이언트 설정
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env.local');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 기존 가이드 분석 및 구조 문서화
 */
async function analyzeExistingGuides() {
  try {
    console.log('🔍 기존 가이드 구조 분석 시작...');
    
    const supabase = getSupabaseClient();
    
    // 1. 전체 가이드 통계 조회
    const { data: guideStats, error: statsError } = await supabase
      .from('guides')
      .select('locationname, language', { count: 'exact' });
      
    if (statsError) {
      throw new Error(`통계 조회 실패: ${statsError.message}`);
    }
    
    console.log(`📊 총 가이드 개수: ${guideStats.length}개`);
    
    // 언어별 통계
    const languageStats = guideStats.reduce((acc, guide) => {
      acc[guide.language] = (acc[guide.language] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📋 언어별 통계:', languageStats);
    
    // 2. 샘플 가이드 상세 조회 (최대 3개)
    const { data: sampleGuides, error: sampleError } = await supabase
      .from('guides')
      .select('id, locationname, language, content, created_at, updated_at')
      .limit(3);
      
    if (sampleError) {
      throw new Error(`샘플 가이드 조회 실패: ${sampleError.message}`);
    }
    
    console.log(`🔬 샘플 가이드 분석 중... (${sampleGuides.length}개)`);
    
    const analysis = {
      totalGuides: guideStats.length,
      languageDistribution: languageStats,
      sampleAnalysis: [],
      commonStructures: {
        hasOverview: 0,
        hasRealTimeGuide: 0,
        hasChapters: 0,
        hasIntroChapter: 0,
        introChapterStructures: []
      }
    };
    
    // 각 샘플 가이드 분석
    for (const guide of sampleGuides) {
      console.log(`\n📖 분석 중: ${guide.locationname} (${guide.language})`);
      
      const guideAnalysis = {
        id: guide.id,
        locationname: guide.locationname,
        language: guide.language,
        createdAt: guide.created_at,
        updatedAt: guide.updated_at,
        structure: analyzeGuideStructure(guide.content),
        introChapter: null
      };
      
      // 인트로 챕터 상세 분석 (중첩 구조 고려)
      let introChapter = null;
      
      // content.content.realTimeGuide.chapters 구조 확인
      if (guide.content?.content?.realTimeGuide?.chapters?.[0]) {
        introChapter = guide.content.content.realTimeGuide.chapters[0];
      }
      // 기존 content.realTimeGuide.chapters 구조 확인
      else if (guide.content?.realTimeGuide?.chapters?.[0]) {
        introChapter = guide.content.realTimeGuide.chapters[0];
      }
      
      if (introChapter) {
        guideAnalysis.introChapter = {
          id: introChapter.id || null,
          title: introChapter.title || null,
          fields: Object.keys(introChapter),
          hasCoordinates: !!(introChapter.coordinates || introChapter.location || (introChapter.lat && introChapter.lng)),
          coordinateStructure: getCoordinateStructure(introChapter),
          sampleData: {
            title: introChapter.title,
            coordinates: introChapter.coordinates
          }
        };
        
        analysis.commonStructures.introChapterStructures.push(guideAnalysis.introChapter);
      }
      
      // 공통 구조 통계 업데이트 (중첩 구조 고려)
      if (guide.content?.overview || guide.content?.content?.realTimeGuide?.overview) analysis.commonStructures.hasOverview++;
      if (guide.content?.realTimeGuide || guide.content?.content?.realTimeGuide) analysis.commonStructures.hasRealTimeGuide++;
      if ((guide.content?.realTimeGuide?.chapters?.length > 0) || (guide.content?.content?.realTimeGuide?.chapters?.length > 0)) analysis.commonStructures.hasChapters++;
      if (guide.content?.realTimeGuide?.chapters?.[0] || guide.content?.content?.realTimeGuide?.chapters?.[0]) analysis.commonStructures.hasIntroChapter++;
      
      analysis.sampleAnalysis.push(guideAnalysis);
    }
    
    // 3. guide_chapters 테이블 구조도 분석
    console.log('\n🗄️ guide_chapters 테이블 분석 중...');
    
    const { data: chapterSamples, error: chapterError } = await supabase
      .from('guide_chapters')
      .select('*')
      .eq('chapter_index', 0) // 인트로 챕터만
      .limit(3);
      
    if (!chapterError && chapterSamples?.length > 0) {
      analysis.chapterTableStructure = {
        sampleCount: chapterSamples.length,
        fields: Object.keys(chapterSamples[0]),
        samples: chapterSamples.map(ch => ({
          guide_id: ch.guide_id,
          title: ch.title,
          latitude: ch.latitude,
          longitude: ch.longitude,
          hasCoordinates: !!(ch.latitude && ch.longitude)
        }))
      };
    }
    
    // 4. 분석 결과 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `guide-structure-analysis-${timestamp}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    
    console.log(`\n✅ 분석 완료! 결과 저장: ${filename}`);
    console.log('\n📋 분석 요약:');
    console.log(`- 총 가이드: ${analysis.totalGuides}개`);
    console.log(`- Overview 보유: ${analysis.commonStructures.hasOverview}/${sampleGuides.length}`);
    console.log(`- RealTimeGuide 보유: ${analysis.commonStructures.hasRealTimeGuide}/${sampleGuides.length}`);
    console.log(`- 챕터 보유: ${analysis.commonStructures.hasChapters}/${sampleGuides.length}`);
    console.log(`- 인트로 챕터 보유: ${analysis.commonStructures.hasIntroChapter}/${sampleGuides.length}`);
    
    if (analysis.commonStructures.introChapterStructures.length > 0) {
      console.log('\n🎯 인트로 챕터 구조 패턴:');
      analysis.commonStructures.introChapterStructures.forEach((intro, i) => {
        console.log(`  ${i + 1}. ${intro.title}`);
        console.log(`     필드: [${intro.fields.join(', ')}]`);
        console.log(`     좌표 구조: ${JSON.stringify(intro.coordinateStructure)}`);
      });
    }
    
    return analysis;
    
  } catch (error) {
    console.error('❌ 분석 실패:', error);
    throw error;
  }
}

/**
 * 가이드 구조 분석 (중첩 구조 탐지)
 */
function analyzeGuideStructure(content) {
  if (!content) return { valid: false, reason: 'No content' };
  
  const structure = {
    valid: true,
    topLevelFields: Object.keys(content),
    hasOverview: false,
    hasRealTimeGuide: false,
    hasMetadata: false,
    chapterCount: 0,
    chapterStructures: [],
    actualStructure: null
  };
  
  // 실제 중첩 구조 탐지: content.content.realTimeGuide
  if (content.content?.realTimeGuide) {
    structure.actualStructure = "content.content.realTimeGuide";
    structure.hasRealTimeGuide = true;
    
    const realTimeGuide = content.content.realTimeGuide;
    structure.hasOverview = !!realTimeGuide.overview;
    
    // 챕터 분석
    if (realTimeGuide.chapters && Array.isArray(realTimeGuide.chapters)) {
      const chapters = realTimeGuide.chapters;
      structure.chapterCount = chapters.length;
      structure.chapterStructures = chapters.map((chapter, index) => ({
        index,
        id: chapter?.id || null,
        fields: Object.keys(chapter || {}),
        hasTitle: !!chapter?.title,
        hasDescription: !!chapter?.description,
        hasCoordinates: !!chapter?.coordinates,
        coordinatesValid: !!(chapter?.coordinates?.lat && chapter?.coordinates?.lng && 
                           chapter.coordinates.lat !== 0 && chapter.coordinates.lng !== 0),
        titleSample: chapter?.title || null,
        coordinatesSample: chapter?.coordinates ? 
          `${chapter.coordinates.lat}, ${chapter.coordinates.lng}` : null
      }));
    }
  }
  // 기존 구조 확인: content.realTimeGuide
  else if (content.realTimeGuide) {
    structure.actualStructure = "content.realTimeGuide";
    structure.hasRealTimeGuide = true;
    structure.hasOverview = !!content.realTimeGuide.overview;
    
    if (content.realTimeGuide.chapters && Array.isArray(content.realTimeGuide.chapters)) {
      const chapters = content.realTimeGuide.chapters;
      structure.chapterCount = chapters.length;
      structure.chapterStructures = chapters.map((chapter, index) => ({
        index,
        id: chapter?.id || null,
        fields: Object.keys(chapter || {}),
        hasTitle: !!chapter?.title,
        hasDescription: !!chapter?.description,
        hasCoordinates: !!chapter?.coordinates,
        coordinatesValid: !!(chapter?.coordinates?.lat && chapter?.coordinates?.lng && 
                           chapter.coordinates.lat !== 0 && chapter.coordinates.lng !== 0),
        titleSample: chapter?.title || null,
        coordinatesSample: chapter?.coordinates ? 
          `${chapter.coordinates.lat}, ${chapter.coordinates.lng}` : null
      }));
    }
  }
  // 다른 구조 탐지
  else if (content) {
    structure.actualStructure = "unknown";
    console.log(`🔍 알 수 없는 구조 감지: ${JSON.stringify(Object.keys(content), null, 2)}`);
  }
  
  return structure;
}

/**
 * 좌표 구조 분석
 */
function getCoordinateStructure(chapter) {
  const coords = {
    hasCoordinates: false,
    coordinatesField: null,
    locationField: null,
    latLngFields: null,
    values: null
  };
  
  if (chapter.coordinates) {
    coords.hasCoordinates = true;
    coords.coordinatesField = chapter.coordinates;
    coords.values = chapter.coordinates;
  } else if (chapter.location) {
    coords.hasCoordinates = true;
    coords.locationField = chapter.location;
    coords.values = chapter.location;
  } else if (chapter.lat && chapter.lng) {
    coords.hasCoordinates = true;
    coords.latLngFields = { lat: chapter.lat, lng: chapter.lng };
    coords.values = { lat: chapter.lat, lng: chapter.lng };
  } else if (chapter.latitude && chapter.longitude) {
    coords.hasCoordinates = true;
    coords.latLngFields = { latitude: chapter.latitude, longitude: chapter.longitude };
    coords.values = { latitude: chapter.latitude, longitude: chapter.longitude };
  }
  
  return coords;
}

/**
 * 특정 가이드 상세 분석 (디버깅용)
 */
async function analyzeSpecificGuide(locationName, language) {
  try {
    console.log(`🔍 특정 가이드 분석: ${locationName} (${language})`);
    
    const supabase = getSupabaseClient();
    
    const { data: guide, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName.toLowerCase().trim())
      .eq('language', language.toLowerCase().trim())
      .single();
      
    if (error || !guide) {
      console.log('❌ 가이드를 찾을 수 없습니다:', error?.message);
      return null;
    }
    
    console.log('📖 가이드 발견:', guide.locationname, guide.language);
    console.log('📅 생성일:', guide.created_at);
    console.log('📅 수정일:', guide.updated_at);
    
    // 전체 구조를 JSON 파일로 저장
    const filename = `specific-guide-${locationName.replace(/\s+/g, '-')}-${language}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify({
      metadata: {
        id: guide.id,
        locationname: guide.locationname,
        language: guide.language,
        created_at: guide.created_at,
        updated_at: guide.updated_at
      },
      content: guide.content
    }, null, 2));
    
    console.log(`✅ 상세 구조 저장: ${filename}`);
    
    // 인트로 챕터 출력
    if (guide.content?.realTimeGuide?.chapters?.[0]) {
      console.log('\n🎯 인트로 챕터 구조:');
      console.log(JSON.stringify(guide.content.realTimeGuide.chapters[0], null, 2));
    }
    
    return guide;
    
  } catch (error) {
    console.error('❌ 특정 가이드 분석 실패:', error);
    throw error;
  }
}

// 실행 부분
async function main() {
  try {
    // 환경변수 로드
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    
    const args = process.argv.slice(2);
    
    if (args[0] === 'specific' && args[1] && args[2]) {
      // 특정 가이드 분석
      await analyzeSpecificGuide(args[1], args[2]);
    } else {
      // 전체 분석
      await analyzeExistingGuides();
    }
    
  } catch (error) {
    console.error('💥 실행 실패:', error);
    process.exit(1);
  }
}

// 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = {
  analyzeExistingGuides,
  analyzeSpecificGuide
};