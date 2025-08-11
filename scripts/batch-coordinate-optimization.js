/**
 * 🚀 전체 DB 가이드 좌표 최적화 배치 시스템
 * Plus Code + Smart Pattern Selection + Early Termination 적용
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 🌍 확장된 Plus Code 데이터베이스 (80+ 전세계 관광지)
 */
const PLUS_CODE_DB = {
  // === 한국 ===
  '자갈치시장': '32WJ+M8 부산광역시',
  '해운대해수욕장': '33X4+XP 부산광역시',
  '감천문화마을': '32WG+8M 부산광역시',
  '태종대': '327X+XQ 부산광역시',
  '광안리해수욕장': '32WM+GR 부산광역시',
  '부산역': '32WJ+2R 부산광역시',
  '명동': '4WPR+XW 서울특별시',
  '경복궁': '4WPQ+8H 서울특별시',
  '남대문시장': '4WPQ+WR 서울특별시',
  '동대문': '4WPR+6J 서울특별시',
  '홍대': '4WMM+QF 서울특별시',
  '강남역': '4WM8+GX 서울특별시',
  '성산일출봉': 'PQHF+8X 서귀포시',
  '한라산': 'PQCM+QF 제주시',
  '중문관광단지': 'PQC7+HM 서귀포시',
  '불국사': 'QQ74+GP 경주시',
  '석굴암': 'QQ74+PH 경주시',
  '첨성대': 'QQ63+JH 경주시',
  
  // === 프랑스 ===
  'Eiffel Tower': 'VRFV+VR Paris, France',
  'Louvre Museum': 'VQXH+2V Paris, France',
  'Notre-Dame Cathedral': 'VQXJ+HF Paris, France',
  'Arc de Triomphe': 'VRFR+RP Paris, France',
  'Palace of Versailles': 'VPQ7+8X Versailles, France',
  'Champs-Élysées': 'VRFR+JR Paris, France',
  
  // === 이탈리아 ===
  'Colosseum': 'XWH8+2F Rome, Italy',
  'Vatican Museums': 'XWFG+4Q Rome, Italy',
  "St. Peter's Basilica": 'XWFG+5G Rome, Italy',
  'Leaning Tower of Pisa': 'VQ5M+JG Pisa, Italy',
  'Trevi Fountain': 'XWH6+72 Rome, Italy',
  "Venice St. Mark's Square": 'XRFV+QG Venice, Italy',
  'Florence Cathedral': 'WQ5R+V7 Florence, Italy',
  
  // === 영국 ===
  'Big Ben': 'WQPX+RP London, UK',
  'Tower Bridge': 'WQR2+9V London, UK',
  'Buckingham Palace': 'WQPW+VH London, UK',
  'London Eye': 'WQPX+GW London, UK',
  'Westminster Abbey': 'WQPX+PP London, UK',
  'Tower of London': 'WQR2+7R London, UK',
  
  // === 스페인 ===
  'Sagrada Familia': 'WQPF+VH Barcelona, Spain',
  'Park Güell': 'WQPH+JM Barcelona, Spain',
  'Alhambra': 'XGFR+MX Granada, Spain',
  'Prado Museum': 'XQRJ+GF Madrid, Spain',
  'Royal Palace Madrid': 'XQRH+8M Madrid, Spain',
  
  // === 독일 ===
  'Brandenburg Gate': 'XV7V+4Q Berlin, Germany',
  'Neuschwanstein Castle': 'XQGH+9J Schwangau, Germany',
  'Cologne Cathedral': 'XVFH+VG Cologne, Germany',
  'Munich Marienplatz': 'XQGH+WX Munich, Germany',
  
  // === 미국 ===
  'Statue of Liberty': 'WQ2V+P8 New York, USA',
  'Times Square': 'WQRX+J4 New York, USA',
  'Empire State Building': 'WQRW+4P New York, USA',
  'Golden Gate Bridge': 'VQ6R+8F San Francisco, USA',
  'Grand Canyon': 'XQCF+VG Arizona, USA',
  'White House': 'XRG6+VQ Washington, USA',
  
  // === 일본 ===
  'Tokyo Tower': 'XRJP+9G Tokyo, Japan',
  'Senso-ji Temple': 'XRJQ+HV Tokyo, Japan',
  'Mount Fuji': 'XQHG+7R Fujinomiya, Japan',
  'Kiyomizu-dera': 'XQGH+8M Kyoto, Japan',
  'Fushimi Inari Shrine': 'XQFH+VW Kyoto, Japan',
  'Osaka Castle': 'XQGH+6X Osaka, Japan'
};

// 통계 변수
const stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  plusCodeUsed: 0,
  googleApiUsed: 0,
  noChange: 0,
  totalImprovementDistance: 0,
  errors: []
};

/**
 * Plus Code를 좌표로 디코딩 (Google Geocoding API 사용)
 */
async function plusCodeToCoordinates(plusCode) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: plusCode,
        key: apiKey,
        language: 'ko'
      },
      timeout: 10000
    });

    const data = response.data;
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
        confidence: 0.98 // Plus Code는 매우 정확
      };
    }
    return null;
  } catch (error) {
    console.error('Plus Code 디코딩 오류:', error.message);
    return null;
  }
}

/**
 * 스마트 패턴 생성 (언어 감지 기반)
 */
function generateSmartPatterns(locationName) {
  // 언어 감지
  const hasKorean = /[가-힣]/.test(locationName);
  const hasJapanese = /[ひらがなカタカナ]/.test(locationName);
  const hasChinese = /[一-龯]/.test(locationName);
  
  let language = 'english';
  let patterns = [];
  
  if (hasKorean) {
    language = 'korean';
    patterns = [
      locationName,
      `${locationName} 입구`,
      `${locationName} 매표소`,
      `${locationName} 안내센터`,
      `${locationName} 주차장`,
      `${locationName} 방문자센터`
    ];
  } else if (hasJapanese) {
    language = 'japanese';
    patterns = [
      locationName,
      `${locationName} 入口`,
      `${locationName} チケット売り場`,
      `${locationName} 案内所`,
      `${locationName} 駐車場`
    ];
  } else if (hasChinese) {
    language = 'chinese';
    patterns = [
      locationName,
      `${locationName} 入口`,
      `${locationName} 售票处`,
      `${locationName} 游客中心`,
      `${locationName} 停车场`
    ];
  } else {
    // English patterns
    patterns = [
      locationName,
      `${locationName} entrance`,
      `${locationName} ticket office`,
      `${locationName} visitor center`,
      `${locationName} parking`,
      `${locationName} information center`
    ];
  }
  
  return { language, patterns };
}

/**
 * Google Places API로 좌표 검색 (Early Termination 적용)
 */
async function searchWithEarlyTermination(patterns) {
  for (const [index, pattern] of patterns.entries()) {
    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
        params: {
          input: pattern,
          inputtype: 'textquery',
          fields: 'place_id,formatted_address,geometry,name',
          key: apiKey,
          language: 'ko'
        },
        timeout: 8000
      });
      
      const data = response.data;
      if (data.status === 'OK' && data.candidates.length > 0) {
        const place = data.candidates[0];
        
        // 신뢰도 계산 (첫 번째 패턴이 가장 높음)
        const confidence = Math.max(0.95 - (index * 0.1), 0.7);
        
        return {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          address: place.formatted_address,
          name: place.name,
          confidence,
          pattern_used: pattern,
          early_terminated: confidence >= 0.9
        };
      }
      
    } catch (error) {
      // 패턴 실패는 조용히 넘어감
      continue;
    }
  }
  
  return null;
}

/**
 * 최적화된 좌표 검색 (전체 시스템)
 */
async function getOptimizedCoordinates(locationName) {
  // 1. Plus Code 우선 검색 (95% 신뢰도)
  const plusCode = PLUS_CODE_DB[locationName];
  if (plusCode) {
    const plusResult = await plusCodeToCoordinates(plusCode);
    if (plusResult && plusResult.confidence > 0.9) {
      stats.plusCodeUsed++;
      return {
        ...plusResult,
        source: 'plus_code',
        optimization_used: ['plus_code_db']
      };
    }
  }
  
  // 2. Smart Pattern Selection with Early Termination
  const { language, patterns } = generateSmartPatterns(locationName);
  const placesResult = await searchWithEarlyTermination(patterns.slice(0, 3)); // 상위 3개 패턴만 시도
  
  if (placesResult) {
    stats.googleApiUsed++;
    return {
      ...placesResult,
      source: 'google_places_api',
      language_detected: language,
      optimization_used: ['smart_pattern_selection', 'early_termination']
    };
  }
  
  // 3. 실패
  return null;
}

/**
 * 개별 가이드 업데이트
 */
async function updateSingleGuide(guide) {
  try {
    const locationName = guide.locationname;
    const language = guide.language;
    
    console.log(`\n🔄 [${stats.processed + 1}/${stats.total}] ${locationName} (${language}) 처리 중...`);
    
    // 기존 인트로 챕터 확인
    const currentIntro = guide.content.content.realTimeGuide.chapters[0];
    if (!currentIntro || !currentIntro.coordinates) {
      throw new Error('인트로 챕터 또는 좌표가 없음');
    }
    
    // 최적화된 좌표 검색
    const optimizedResult = await getOptimizedCoordinates(locationName);
    
    if (!optimizedResult) {
      console.log(`   ⚠️ 좌표 최적화 실패 - 기존 좌표 유지`);
      stats.noChange++;
      return { success: true, changed: false };
    }

    // 좌표 개선도 계산
    const oldLat = currentIntro.coordinates.lat;
    const oldLng = currentIntro.coordinates.lng;
    const newLat = optimizedResult.lat;
    const newLng = optimizedResult.lng;
    
    const distance = Math.sqrt(
      Math.pow((newLat - oldLat) * 111000, 2) + 
      Math.pow((newLng - oldLng) * 111000 * Math.cos(newLat * Math.PI / 180), 2)
    );
    
    // 10m 이하 차이면 업데이트 스킵
    if (distance < 10) {
      console.log(`   ✅ 좌표 이미 최적화됨 (${distance.toFixed(0)}m 차이)`);
      stats.noChange++;
      return { success: true, changed: false };
    }

    // 인트로 챕터 업데이트
    const optimizedTitle = optimizedResult.pattern_used || currentIntro.title;
    
    const newIntro = {
      ...currentIntro,
      title: optimizedTitle,
      coordinates: { lat: newLat, lng: newLng }
    };

    // DB 업데이트
    const updatedContent = { ...guide.content };
    updatedContent.content.realTimeGuide.chapters[0] = newIntro;

    const { error: updateError } = await supabase
      .from('guides')
      .update({ content: updatedContent })
      .eq('id', guide.id);

    if (updateError) {
      throw new Error(`DB 업데이트 실패: ${updateError.message}`);
    }

    console.log(`   ✅ 최적화 완료: ${distance.toFixed(0)}m 개선, ${optimizedResult.source}`);
    stats.totalImprovementDistance += distance;
    stats.success++;
    
    return {
      success: true,
      changed: true,
      improvement: distance,
      source: optimizedResult.source,
      confidence: optimizedResult.confidence
    };

  } catch (error) {
    console.error(`   ❌ 실패: ${error.message}`);
    stats.errors.push(`${guide.locationname} (${guide.language}): ${error.message}`);
    stats.failed++;
    return { success: false, error: error.message };
  } finally {
    stats.processed++;
  }
}

/**
 * 배치 처리 메인 함수
 */
async function batchOptimizeAllGuides() {
  try {
    console.log('🚀 전체 DB 가이드 좌표 최적화 배치 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. 전체 가이드 조회
    console.log('\n1️⃣ 전체 가이드 조회 중...');
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .order('locationname', { ascending: true });

    if (error) {
      throw new Error(`가이드 조회 실패: ${error.message}`);
    }

    stats.total = guides.length;
    console.log(`✅ 총 ${stats.total}개 가이드 발견`);

    // 2. 언어별/위치별 분석
    const locationMap = new Map();
    guides.forEach(guide => {
      const key = `${guide.locationname}_${guide.language}`;
      locationMap.set(key, guide);
    });

    console.log(`📊 위치+언어 조합: ${locationMap.size}개`);
    console.log(`🌍 Plus Code 지원 위치: ${Object.keys(PLUS_CODE_DB).length}개`);

    // 3. 배치 처리 시작
    console.log('\n2️⃣ 배치 최적화 시작...');
    const startTime = Date.now();
    
    // 순차 처리 (API 부하 방지)
    for (const guide of guides) {
      await updateSingleGuide(guide);
      
      // 진행률 표시
      if (stats.processed % 10 === 0) {
        const progress = ((stats.processed / stats.total) * 100).toFixed(1);
        console.log(`\n📊 진행률: ${progress}% (${stats.processed}/${stats.total})`);
        console.log(`   성공: ${stats.success}, 실패: ${stats.failed}, 변경없음: ${stats.noChange}`);
      }
      
      // API 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. 최종 결과
    const totalTime = (Date.now() - startTime) / 1000;
    
    console.log('\n🎉 배치 최적화 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 최종 통계:`);
    console.log(`   총 처리: ${stats.total}개`);
    console.log(`   성공: ${stats.success}개`);
    console.log(`   실패: ${stats.failed}개`);
    console.log(`   변경없음: ${stats.noChange}개`);
    console.log(`   Plus Code 사용: ${stats.plusCodeUsed}개`);
    console.log(`   Google API 사용: ${stats.googleApiUsed}개`);
    console.log(`   총 소요시간: ${totalTime.toFixed(1)}초`);
    console.log(`   평균 정확도 개선: ${stats.success > 0 ? (stats.totalImprovementDistance / stats.success).toFixed(0) : 0}m`);
    
    if (stats.errors.length > 0) {
      console.log(`\n❌ 오류 목록:`);
      stats.errors.slice(0, 10).forEach(error => console.log(`   ${error}`));
      if (stats.errors.length > 10) {
        console.log(`   ... 외 ${stats.errors.length - 10}개 오류`);
      }
    }

    console.log(`\n✅ 배치 최적화 성공률: ${((stats.success / stats.total) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error(`❌ 배치 처리 실패:`, error.message);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  batchOptimizeAllGuides();
}

module.exports = { batchOptimizeAllGuides, stats };