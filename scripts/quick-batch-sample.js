/**
 * 🚀 빠른 배치 샘플 테스트 (20개 가이드만)
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plus Code DB (축약버전)
const PLUS_CODE_DB = {
  '자갈치시장': '32WJ+M8 부산광역시',
  '해운대해수욕장': '33X4+XP 부산광역시',
  '명동': '4WPR+XW 서울특별시',
  '경복궁': '4WPQ+8H 서울특별시',
  'Eiffel Tower': 'VRFV+VR Paris, France',
  'Colosseum': 'XWH8+2F Rome, Italy',
  'Big Ben': 'WQPX+RP London, UK'
};

const stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  plusCodeUsed: 0,
  googleApiUsed: 0,
  noChange: 0,
  totalImprovement: 0
};

async function plusCodeToCoordinates(plusCode) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address: plusCode, key: apiKey },
      timeout: 5000
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        confidence: 0.98
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function searchGooglePlaces(locationName) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const patterns = [locationName, `${locationName} entrance`, `${locationName} 입구`];
    
    for (const pattern of patterns.slice(0, 2)) { // 최대 2개 패턴만
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
        params: {
          input: pattern,
          inputtype: 'textquery',
          fields: 'geometry,name',
          key: apiKey
        },
        timeout: 5000
      });
      
      if (response.data.status === 'OK' && response.data.candidates.length > 0) {
        const place = response.data.candidates[0];
        return {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          confidence: 0.85
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function getOptimizedCoordinates(locationName) {
  // 1. Plus Code 우선
  const plusCode = PLUS_CODE_DB[locationName];
  if (plusCode) {
    const result = await plusCodeToCoordinates(plusCode);
    if (result) {
      stats.plusCodeUsed++;
      return { ...result, source: 'plus_code' };
    }
  }
  
  // 2. Google Places API
  const result = await searchGooglePlaces(locationName);
  if (result) {
    stats.googleApiUsed++;
    return { ...result, source: 'google_api' };
  }
  
  return null;
}

async function quickBatchTest() {
  try {
    console.log('🚀 빠른 배치 샘플 테스트 (20개 가이드)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 20개 가이드만 조회
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .limit(20)
      .order('locationname');

    if (error) throw new Error(`가이드 조회 실패: ${error.message}`);

    stats.total = guides.length;
    console.log(`✅ ${stats.total}개 가이드로 테스트 시작\n`);

    const startTime = Date.now();
    
    for (const guide of guides) {
      try {
        console.log(`🔄 [${stats.processed + 1}/${stats.total}] ${guide.locationname} (${guide.language})`);
        
        const currentIntro = guide.content.content.realTimeGuide.chapters[0];
        if (!currentIntro?.coordinates) {
          throw new Error('인트로 챕터 없음');
        }
        
        const optimized = await getOptimizedCoordinates(guide.locationname);
        
        if (!optimized) {
          console.log('   ⚠️ 최적화 실패');
          stats.noChange++;
          continue;
        }

        // 개선도 계산
        const distance = Math.sqrt(
          Math.pow((optimized.lat - currentIntro.coordinates.lat) * 111000, 2) + 
          Math.pow((optimized.lng - currentIntro.coordinates.lng) * 111000, 2)
        );

        if (distance < 10) {
          console.log(`   ✅ 이미 최적화됨 (${distance.toFixed(0)}m)`);
          stats.noChange++;
          continue;
        }

        // DB 업데이트
        const newIntro = {
          ...currentIntro,
          coordinates: { lat: optimized.lat, lng: optimized.lng }
        };

        const updatedContent = { ...guide.content };
        updatedContent.content.realTimeGuide.chapters[0] = newIntro;

        const { error: updateError } = await supabase
          .from('guides')
          .update({ content: updatedContent })
          .eq('id', guide.id);

        if (updateError) throw new Error(`업데이트 실패: ${updateError.message}`);

        console.log(`   ✅ ${distance.toFixed(0)}m 개선 (${optimized.source})`);
        stats.success++;
        stats.totalImprovement += distance;

      } catch (error) {
        console.log(`   ❌ ${error.message}`);
        stats.failed++;
      } finally {
        stats.processed++;
      }

      // 빠른 처리를 위해 딜레이 단축
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const totalTime = (Date.now() - startTime) / 1000;
    
    console.log('\n🎉 빠른 배치 테스트 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 결과: 성공 ${stats.success}, 실패 ${stats.failed}, 변경없음 ${stats.noChange}`);
    console.log(`⚡ Plus Code: ${stats.plusCodeUsed}, Google API: ${stats.googleApiUsed}`);
    console.log(`🎯 평균 개선도: ${stats.success > 0 ? (stats.totalImprovement / stats.success).toFixed(0) : 0}m`);
    console.log(`⏱️ 총 소요시간: ${totalTime.toFixed(1)}초 (가이드당 ${(totalTime / stats.total).toFixed(1)}초)`);
    console.log(`✅ 성공률: ${((stats.success / stats.total) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

quickBatchTest();