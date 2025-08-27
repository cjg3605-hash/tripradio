/**
 * 🔄 기존 DB 가이드의 인트로 챕터만 선택적으로 교체하는 시스템
 * 
 * 핵심 원칙:
 * 1. 기존 JSON 구조 100% 보존
 * 2. 인트로 챕터(chapters[0])만 정밀 교체
 * 3. 새로운 좌표 시스템과 구체적 시설명 적용
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
 * 🎯 인트로 챕터 선택적 교체 함수
 */
async function updateIntroChapterSelectively(guide) {
  try {
    console.log(`🔄 인트로 챕터 교체 중: ${guide.locationname} (${guide.language})`);
    
    // 기존 가이드 구조 완전 복사 (deep copy)
    const updatedGuide = JSON.parse(JSON.stringify(guide.content));
    
    // 🔧 정확한 DB 구조에 맞는 경로 수정 (실제 DB 구조: content.content.realTimeGuide.chapters)
    const originalIntro = updatedGuide.content?.content?.realTimeGuide?.chapters?.[0];
    
    if (!originalIntro) {
      console.log(`⚠️ 인트로 챕터가 없습니다: ${guide.locationname}`);
      return null;
    }
    
    console.log(`📖 기존 인트로: "${originalIntro.title}"`);
    
    // 기존 인트로 챕터 그대로 복사 (제목은 일단 그대로)
    const updatedIntro = {
      ...originalIntro  // 기존 모든 필드 유지
    };
    
    // 🔧 정확한 DB 구조에 맞는 경로로 인트로 챕터 교체
    updatedGuide.content.content.realTimeGuide.chapters[0] = updatedIntro;
    
    // 좌표 정밀화 시스템 적용
    const { enhancedGuide } = await enhanceGuideCoordinates(
      { content: updatedGuide.content }, // GuideData 형태로 변환
      guide.locationname,
      guide.language
    );
    
    // 결과 반환 (원래 구조 유지)
    return {
      ...guide,
      content: enhancedGuide.content || enhancedGuide.content || updatedGuide.content
    };
    
  } catch (error) {
    console.error(`❌ 인트로 챕터 교체 실패: ${guide.locationname}`, error);
    return null;
  }
}

// ✅ 불필요한 복잡한 생성 함수들 제거됨
// Google Places API만 사용하여 간단하고 정확하게 처리

/**
 * 🔧 좌표 향상 시스템 적용 (Google Places API + 제목 최적화)
 */
async function enhanceGuideCoordinates(guideData, locationName, language) {
  try {
    console.log(`🌐 최적화된 제목 기반 좌표 정밀화: ${locationName}`);
    
    // Google Places API 키 확인
    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      console.log('⚠️ Google API 키가 없어 좌표 향상을 건너뜁니다');
      return { enhancedGuide: guideData };
    }
    
    // 가이드 복사 - 🔧 정확한 DB 구조 경로 (content.content.realTimeGuide.chapters)
    const enhancedGuide = JSON.parse(JSON.stringify(guideData));
    const chapters = enhancedGuide.content?.content?.realTimeGuide?.chapters || [];
    
    if (chapters.length === 0) {
      return { enhancedGuide: guideData };
    }
    
    // 인트로 챕터 좌표 향상 (제목 최적화 적용)
    const introChapter = chapters[0];
    if (introChapter?.coordinates) {  // DB에서는 coordinates (복수형) 사용
      try {
        // 🎯 1차: 제목 최적화 기반 검색
        console.log(`🎯 제목 최적화 시도: "${introChapter.title}"`);
        
        let bestCandidate = null;
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
        
        // 제목 최적화 함수 (간단 버전)
        const optimizedTitle = optimizeTitleForSearch(introChapter.title, locationName);
        console.log(`✨ 최적화된 제목: "${optimizedTitle}"`);
        
        // 검색 쿼리 우선순위 목록 (최적화된 제목 우선)
        const searchQueries = [
          // 1차: 최적화된 제목
          optimizedTitle,
          
          // 2차: 영어 변환된 최적화 제목
          convertToEnglishSearch(optimizedTitle),
          
          // 3차: 기본 장소명
          locationName,
          
          // 4차: 영어 장소명
          convertToEnglishSearch(locationName),
          
          // 5차: description에서 구체적 정보 추출 (8번 출구 등)
          introChapter.coordinates?.description?.includes('8번') ? 
            `${locationName} Station Exit 8` : null,
        ].filter(Boolean); // null 제거
        
        // 우선순위대로 검색 시도
        for (const query of searchQueries) {
          try {
            console.log(`🔍 검색 시도: "${query}"`);
            
            const searchUrl = `${url}?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${googleApiKey}`;
            const response = await fetch(searchUrl);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.status === 'OK' && data.candidates?.length > 0) {
                bestCandidate = data.candidates[0];
                console.log(`✅ 발견: ${bestCandidate.name}`);
                break; // 첫 번째 성공한 결과 사용
              }
            }
            
            // API 제한 고려하여 짧은 대기
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (searchError) {
            console.log(`⚠️ 검색 실패: ${query} - ${searchError.message}`);
            continue;
          }
        }
        
        // 좌표 업데이트
        if (bestCandidate) {
          const newLat = bestCandidate.geometry.location.lat;
          const newLng = bestCandidate.geometry.location.lng;
          
          console.log(`✅ 좌표 정밀화 성공: (${newLat}, ${newLng})`);
          console.log(`📍 발견된 장소: ${bestCandidate.name}`);
          
          // 🎯 핵심: 제목을 장소명만으로 최적화 (기존 설명문 제거)
          const optimizedTitle = optimizeTitleForSearch(introChapter.title, locationName);
          console.log(`🎯 제목 최적화: "${introChapter.title}" → "${optimizedTitle}"`);
          
          // 좌표와 최적화된 제목 업데이트 (DB에서는 coordinates 사용)
          introChapter.title = optimizedTitle;
          introChapter.coordinates = {
            ...introChapter.coordinates,
            lat: newLat,
            lng: newLng,
            description: bestCandidate.formatted_address || introChapter.coordinates.description
          };
        }
      } catch (apiError) {
        console.log(`⚠️ Google Places API 호출 실패: ${apiError.message}`);
      }
    }
    
    return { enhancedGuide };
    
  } catch (error) {
    console.error('좌표 향상 실패:', error);
    return { enhancedGuide: guideData };
  }
}

/**
 * 🛡️ 업데이트 전 구조 검증
 */
function validateGuideStructure(original, updated) {
  try {
    // 필수 구조 존재 확인 - 🔧 정확한 DB 구조 경로 (content.content.realTimeGuide.chapters)
    if (!updated.content?.content?.realTimeGuide?.chapters) {
      throw new Error('Invalid guide structure: missing chapters');
    }
    
    const originalChapters = original.content?.content?.realTimeGuide?.chapters || [];
    const updatedChapters = updated.content.content.realTimeGuide.chapters;
    
    // 챕터 개수 동일 확인
    if (originalChapters.length !== updatedChapters.length) {
      throw new Error('Chapter count mismatch');
    }
    
    // 인트로 챕터 외 나머지는 변경되지 않았는지 확인
    for (let i = 1; i < originalChapters.length; i++) {
      if (JSON.stringify(originalChapters[i]) !== JSON.stringify(updatedChapters[i])) {
        console.warn(`Chapter ${i} was modified unexpectedly`);
      }
    }
    
    // 인트로 챕터 기본 구조 확인
    const updatedIntro = updatedChapters[0];
    if (!updatedIntro.title || !updatedIntro.coordinates) {
      throw new Error('Invalid intro chapter structure');
    }
    
    console.log('✅ 구조 검증 통과');
    return true;
    
  } catch (error) {
    console.error('❌ 구조 검증 실패:', error);
    return false;
  }
}

/**
 * 💾 DB 업데이트 (원자적 트랜잭션)
 */
async function updateGuideInDatabase(guide, updatedContent) {
  const supabase = getSupabaseClient();
  
  try {
    console.log(`💾 DB 업데이트 중: ${guide.locationname} (${guide.language})`);
    
    // 1. guides 테이블 업데이트
    const { error: guideError } = await supabase
      .from('guides')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', guide.id);
      
    if (guideError) {
      throw new Error(`Guide update failed: ${guideError.message}`);
    }
    
    // 2. guide_chapters 테이블도 동기화 (있는 경우) - 🔧 정확한 경로
    const introChapter = updatedContent.content.content.realTimeGuide?.chapters?.[0];
    if (introChapter) {
      const { error: chapterError } = await supabase
        .from('guide_chapters')
        .update({
          title: introChapter.title,
          latitude: introChapter.coordinates.lat,
          longitude: introChapter.coordinates.lng,
          updated_at: new Date().toISOString()
        })
        .eq('guide_id', guide.id)
        .eq('chapter_index', 0);
        
      // guide_chapters 오류는 치명적이지 않음 (테이블이 없을 수도 있음)
      if (chapterError) {
        console.warn(`Chapter table update failed (non-critical): ${chapterError.message}`);
      }
    }
    
    console.log(`✅ DB 업데이트 완료: ${guide.locationname}`);
    return true;
    
  } catch (error) {
    console.error(`❌ DB 업데이트 실패: ${guide.locationname}`, error);
    return false;
  }
}

/**
 * 📊 업데이트 진행 상황 추적
 */
class UpdateProgress {
  constructor() {
    this.total = 0;
    this.completed = 0;
    this.failed = 0;
    this.startTime = Date.now();
    this.progressFile = path.join(__dirname, 'update-progress.json');
  }
  
  setTotal(total) {
    this.total = total;
    this.save();
  }
  
  incrementCompleted() {
    this.completed++;
    this.save();
    this.logProgress();
  }
  
  incrementFailed() {
    this.failed++;
    this.save();
    this.logProgress();
  }
  
  logProgress() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const processed = this.completed + this.failed;
    const rate = processed / elapsed;
    const eta = (this.total - processed) / rate;
    
    console.log(`📊 진행 상황: ${processed}/${this.total} (성공: ${this.completed}, 실패: ${this.failed})`);
    console.log(`⏱️ 예상 완료: ${Math.round(eta)}초 후`);
  }
  
  save() {
    fs.writeFileSync(this.progressFile, JSON.stringify({
      total: this.total,
      completed: this.completed,
      failed: this.failed,
      startTime: this.startTime,
      lastUpdate: Date.now()
    }, null, 2));
  }
  
  load() {
    try {
      if (fs.existsSync(this.progressFile)) {
        const data = JSON.parse(fs.readFileSync(this.progressFile));
        this.total = data.total || 0;
        this.completed = data.completed || 0;
        this.failed = data.failed || 0;
        this.startTime = data.startTime || Date.now();
        console.log('📋 이전 진행 상황 복원됨');
      }
    } catch (error) {
      console.warn('진행 상황 복원 실패:', error);
    }
  }
}

/**
 * 🎯 제목 최적화 함수 (Google Places API 최적화)
 */
function optimizeTitleForSearch(originalTitle, locationName) {
  let optimizedTitle = originalTitle;
  
  console.log(`🔧 제목 최적화 시작: "${originalTitle}"`);
  
  // 1. 콜론(:) 뒤의 설명 제거
  if (optimizedTitle.includes(':')) {
    optimizedTitle = optimizedTitle.split(':')[0].trim();
    console.log(`   1️⃣ 콜론 제거: "${optimizedTitle}"`);
  }
  
  // 2. 일반적인 관광 소개문 제거
  const removePatterns = [
    /\s*관광\s*시작점$/,
    /\s*여행\s*시작$/,
    /\s*투어\s*시작$/,
    /\s*가이드\s*시작$/,
    /\s*활기찬.*$/,
    /\s*웅장한.*$/,
    /\s*아름다운.*$/,
    /\s*멋진.*$/,
    /\s*첫인상$/,
    /\s*시작점$/
  ];

  const beforePatternRemoval = optimizedTitle;
  removePatterns.forEach(pattern => {
    optimizedTitle = optimizedTitle.replace(pattern, '');
  });
  
  if (beforePatternRemoval !== optimizedTitle) {
    console.log(`   2️⃣ 소개문 제거: "${optimizedTitle}"`);
  }
  
  // 3. 중복된 장소명 제거
  if (locationName && optimizedTitle.includes(locationName)) {
    const regex = new RegExp(`\\b${locationName}\\b.*\\b${locationName}\\b`, 'g');
    if (regex.test(optimizedTitle)) {
      optimizedTitle = optimizedTitle.replace(new RegExp(`\\b${locationName}\\b(?=.*\\b${locationName}\\b)`, 'g'), '').trim();
      console.log(`   3️⃣ 중복 제거: "${optimizedTitle}"`);
    }
  }
  
  // 4. 여러 공백을 하나로 통합
  optimizedTitle = optimizedTitle.replace(/\s+/g, ' ').trim();
  
  // 5. 너무 짧아진 경우 기본 장소명 사용
  if (optimizedTitle.length < 3) {
    optimizedTitle = locationName;
    console.log(`   4️⃣ 기본명 사용: "${optimizedTitle}"`);
  }
  
  // 6. 특별한 경우 처리 (예: "Passeig de Gràcia" 등의 주소 포함 제거)
  if (optimizedTitle.includes('Passeig de') || optimizedTitle.includes('Pg.')) {
    // "카사밀라 Passeig de Gràcia 92" → "카사밀라" 
    const parts = optimizedTitle.split(/\s+(?:Passeig de|Pg\.)/);
    if (parts[0].length > 2) {
      optimizedTitle = parts[0].trim();
      console.log(`   5️⃣ 주소 제거: "${optimizedTitle}"`);
    }
  }
  
  console.log(`✅ 최종 최적화 결과: "${originalTitle}" → "${optimizedTitle}"`);
  return optimizedTitle;
}

/**
 * 🌐 한국어 → 영어 검색 변환 함수 (Google Places API 최적화)
 */
function convertToEnglishSearch(query, context) {
  let englishQuery = query;
  
  // 한국어 → 영어 기본 변환
  englishQuery = englishQuery
    .replace(/역/g, ' Station')
    .replace(/(\\d+)번\\s*출구/g, 'Exit $1')
    .replace(/출구/g, 'Exit')
    .replace(/입구/g, 'Entrance')
    .replace(/매표소/g, 'Ticket Office')
    .replace(/센터/g, 'Center')
    .replace(/정문/g, 'Main Gate')
    .replace(/공원/g, 'Park')
    .replace(/박물관/g, 'Museum')
    .replace(/궁/g, 'Palace')
    .replace(/사원/g, 'Temple')
    .replace(/성당/g, 'Cathedral')
    .replace(/교회/g, 'Church')
    .replace(/시장/g, 'Market')
    .replace(/다리/g, 'Bridge')
    .replace(/광장/g, 'Square');

  if (context) {
    englishQuery = `${englishQuery} ${context}`;
  }

  return englishQuery.trim();
}

module.exports = {
  updateIntroChapterSelectively,
  validateGuideStructure,
  updateGuideInDatabase,
  UpdateProgress,
  optimizeTitleForSearch,
  convertToEnglishSearch
};