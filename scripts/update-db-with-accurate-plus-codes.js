/**
 * 🎯 정확한 Plus Code로 DB 좌표 업데이트 시스템
 * 검증된 Plus Code → Google Places API → DB 업데이트
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🎯 검증된 정확한 Plus Code 데이터베이스
const ACCURATE_PLUS_CODE_DB = {
  // 한국
  '석굴암': '8Q7FQ8VX+XP',
  '불국사': '8Q7FQ8QJ+XQ', 
  '자갈치시장': '8Q7F32WJ+M8',
  '해운대해수욕장': '8Q7F5556+F5',
  '감천문화마을': '8Q7F32W6+X6',
  '경복궁': '8Q98HXHG+RR',
  '명동': '8Q98HX5P+X8',
  '남산타워': '8Q98HX2Q+F7',
  '성산일출봉': '8Q58FW5R+6X',
  '한라산': '8Q589G6H+MM',
  '중문관광단지': '8Q586CX6+FX',
  '첨성대': '8Q7FR6M9+VJ',
  
  // 해외
  'Eiffel Tower': '8FW4V75V+8Q',
  'Louvre Museum': '8FW4V86Q+63',
  'Big Ben': '9C3XGV2G+74',
  'Colosseum': '8FHJVFRR+3V',
  'Sagrada Familia': '8FH4C53F+FP',
  'Times Square': '87G8Q257+5Q',
  'Statue of Liberty': '87G7MXQ4+M5',
  'Taj Mahal': '7JVW52GR+3V',
};

// 다국어 매핑 (한국어 위치명 → 다른 언어들)
const LOCATION_MAPPINGS = {
  '석굴암': ['seokguram', 'stone grotto', '石窟庵', 'seokguram grotto'],
  '불국사': ['bulguksa', 'bulguk temple', '仏国寺', 'bulguksa temple'],
  '자갈치시장': ['jagalchi market', 'jagalchi fish market', 'mercado de jagalchi', 'チャガルチ市場'],
  '해운대해수욕장': ['haeundae beach', 'playa de haeundae', '海雲台海水浴場', 'haeundae'],
  '감천문화마을': ['gamcheon culture village', 'aldea cultural de gamcheon', 'ガムチョン文化村', 'pueblo cultural de gamcheon'],
  '경복궁': ['gyeongbokgung palace', 'palacio de gyeongbokgung', '景福宮', 'gyeongbok palace'],
  '명동': ['myeongdong', '明洞', 'distrito de myeongdong'],
  '남산타워': ['namsan tower', 'n seoul tower', 'torre namsan', 'N서울타워', '南山塔'],
  '성산일출봉': ['seongsan ilchulbong', 'pico seongsan ilchulbong', '城山日出峰'],
  '한라산': ['hallasan mountain', 'montaña hallasan', '漢拏山'],
  '중문관광단지': ['jungmun tourist complex', 'complejo turístico jungmun', '中文旅游综合体'],
  '첨성대': ['cheomseongdae observatory', 'universidad de cheomseong', '瞻城大学']
};

// 통계
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  noChange: 0,
  totalImprovement: 0,
  results: []
};

/**
 * Plus Code를 정확한 좌표로 변환
 */
async function plusCodeToCoordinates(plusCode) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Plus Code 변환 오류 (${plusCode}):`, error.message);
    return null;
  }
}

/**
 * DB에서 매칭되는 가이드들 찾기
 */
async function findMatchingGuides(locationName) {
  try {
    // 1. 정확한 이름으로 검색
    let { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName);
    
    if (error) {
      throw new Error(`DB 조회 오류: ${error.message}`);
    }
    
    // 2. 다국어 매핑으로 추가 검색
    const mappings = LOCATION_MAPPINGS[locationName] || [];
    for (const mapping of mappings) {
      const { data: additionalGuides, error: mappingError } = await supabase
        .from('guides')
        .select('*')
        .ilike('locationname', `%${mapping}%`);
        
      if (!mappingError && additionalGuides && additionalGuides.length > 0) {
        // 중복 제거하여 추가
        const existingIds = new Set(guides.map(g => g.id));
        const newGuides = additionalGuides.filter(g => !existingIds.has(g.id));
        guides = [...guides, ...newGuides];
      }
    }
    
    return guides || [];
  } catch (error) {
    console.error(`가이드 검색 오류 (${locationName}):`, error.message);
    return [];
  }
}

/**
 * 개별 가이드 업데이트
 */
async function updateSingleGuide(guide, newCoordinates, locationName, plusCode) {
  try {
    // 현재 좌표 확인
    const currentIntro = guide.content?.content?.realTimeGuide?.chapters?.[0];
    if (!currentIntro?.coordinates) {
      throw new Error('인트로 챕터 또는 좌표가 없음');
    }
    
    const oldLat = parseFloat(currentIntro.coordinates.lat);
    const oldLng = parseFloat(currentIntro.coordinates.lng);
    const newLat = newCoordinates.lat;
    const newLng = newCoordinates.lng;
    
    // 거리 계산
    const R = 6371000; // 지구 반지름
    const φ1 = oldLat * Math.PI/180;
    const φ2 = newLat * Math.PI/180;
    const Δφ = (newLat - oldLat) * Math.PI/180;
    const Δλ = (newLng - oldLng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // 10m 이하 차이면 업데이트 스킵
    if (distance < 10) {
      console.log(`      ✅ 이미 정확함 (${distance.toFixed(0)}m 차이)`);
      stats.noChange++;
      return { success: true, changed: false, distance };
    }
    
    // 인트로 챕터 업데이트
    const updatedIntro = {
      ...currentIntro,
      title: `${locationName} 입구`, // 제목 표준화
      coordinates: {
        lat: newLat,
        lng: newLng
      }
    };
    
    // content 전체 업데이트
    const updatedContent = { ...guide.content };
    updatedContent.content.realTimeGuide.chapters[0] = updatedIntro;
    
    // DB 업데이트
    const { error: updateError } = await supabase
      .from('guides')
      .update({ 
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', guide.id);

    if (updateError) {
      throw new Error(`DB 업데이트 실패: ${updateError.message}`);
    }
    
    console.log(`      ✅ 업데이트 완료: ${distance.toFixed(0)}m 개선`);
    stats.totalImprovement += distance;
    stats.success++;
    
    return { 
      success: true, 
      changed: true, 
      distance, 
      oldCoords: { lat: oldLat, lng: oldLng },
      newCoords: { lat: newLat, lng: newLng }
    };
    
  } catch (error) {
    console.error(`      ❌ 업데이트 실패: ${error.message}`);
    stats.failed++;
    return { success: false, error: error.message };
  }
}

/**
 * 단일 위치 처리
 */
async function processLocation(locationName, plusCode) {
  try {
    console.log(`\n🔍 ${locationName} (${plusCode}) 처리 중...`);
    
    // 1. Plus Code를 좌표로 변환
    const coordinates = await plusCodeToCoordinates(plusCode);
    if (!coordinates) {
      throw new Error('Plus Code 좌표 변환 실패');
    }
    
    console.log(`   📍 정확한 좌표: ${coordinates.lat}, ${coordinates.lng}`);
    
    // 2. DB에서 매칭되는 가이드들 찾기
    const guides = await findMatchingGuides(locationName);
    if (guides.length === 0) {
      console.log(`   ⚠️ DB에서 매칭되는 가이드를 찾을 수 없음`);
      return { processed: 0, success: 0, failed: 0, noChange: 0 };
    }
    
    console.log(`   📚 매칭된 가이드: ${guides.length}개`);
    
    // 3. 각 가이드 업데이트
    let processed = 0, success = 0, failed = 0, noChange = 0;
    
    for (const guide of guides) {
      console.log(`   🔄 ${guide.locationname} (${guide.language}) 업데이트 중...`);
      
      const result = await updateSingleGuide(guide, coordinates, locationName, plusCode);
      processed++;
      
      if (result.success) {
        if (result.changed) {
          success++;
        } else {
          noChange++;
        }
      } else {
        failed++;
      }
      
      // API 부하 방지
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`   📊 결과: 성공 ${success}, 변경없음 ${noChange}, 실패 ${failed}`);
    
    return { processed, success, failed, noChange };
    
  } catch (error) {
    console.error(`   ❌ ${locationName} 처리 실패: ${error.message}`);
    return { processed: 0, success: 0, failed: 1, noChange: 0 };
  }
}

/**
 * 메인 업데이트 함수
 */
async function updateDBWithAccuratePlusCodes() {
  try {
    console.log('🎯 정확한 Plus Code로 DB 좌표 업데이트 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 업데이트할 위치: ${Object.keys(ACCURATE_PLUS_CODE_DB).length}개\n`);
    
    const startTime = Date.now();
    
    // 순차 처리
    for (const [locationName, plusCode] of Object.entries(ACCURATE_PLUS_CODE_DB)) {
      const result = await processLocation(locationName, plusCode);
      
      stats.total += result.processed;
      
      // 전체 진행률 표시
      const currentIndex = Object.keys(ACCURATE_PLUS_CODE_DB).indexOf(locationName) + 1;
      const totalLocations = Object.keys(ACCURATE_PLUS_CODE_DB).length;
      const progress = ((currentIndex / totalLocations) * 100).toFixed(1);
      
      console.log(`\n📊 위치 진행률: ${progress}% (${currentIndex}/${totalLocations})`);
      console.log(`   전체 처리된 가이드: ${stats.total}개`);
      console.log(`   성공: ${stats.success}, 변경없음: ${stats.noChange}, 실패: ${stats.failed}`);
      
      // API 부하 방지
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 최종 결과
    const totalTime = (Date.now() - startTime) / 1000;
    
    console.log('\n🎉 Plus Code DB 업데이트 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 최종 통계:`);
    console.log(`   처리된 위치: ${Object.keys(ACCURATE_PLUS_CODE_DB).length}개`);
    console.log(`   처리된 가이드: ${stats.total}개`);
    console.log(`   성공적 업데이트: ${stats.success}개`);
    console.log(`   변경 없음: ${stats.noChange}개`);
    console.log(`   실패: ${stats.failed}개`);
    console.log(`   총 정확도 개선: ${stats.success > 0 ? (stats.totalImprovement / stats.success).toFixed(0) : 0}m 평균`);
    console.log(`   소요시간: ${totalTime.toFixed(1)}초`);
    console.log(`   성공률: ${stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%`);
    
    if (stats.success > 0) {
      console.log(`\n✅ ${stats.success}개 가이드의 좌표가 정확하게 업데이트되었습니다!`);
    }
    
  } catch (error) {
    console.error('❌ DB 업데이트 실패:', error.message);
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  updateDBWithAccuratePlusCodes();
}

export { updateDBWithAccuratePlusCodes, ACCURATE_PLUS_CODE_DB };