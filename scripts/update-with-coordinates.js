const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// fetch를 global로 설정
global.fetch = fetch;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Google Places API 함수
async function searchGooglePlaces(query, language = 'ko') {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log(`🔍 Google Places API 검색: "${query}" (${language})`);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,formatted_address,geometry,name&key=${apiKey}&language=${language}`
    );
    const data = await response.json();
    
    console.log(`📡 API 응답 상태: ${data.status}`);
    
    if (data.status === 'OK' && data.candidates.length > 0) {
      const place = data.candidates[0];
      console.log(`✅ 발견: ${place.name}`);
      console.log(`📍 좌표: ${place.geometry.location.lat}, ${place.geometry.location.lng}`);
      console.log(`📍 주소: ${place.formatted_address}`);
      
      return {
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
        address: place.formatted_address,
        name: place.name
      };
    } else {
      console.log(`❌ 검색 결과 없음: ${data.status}`);
      if (data.error_message) {
        console.log(`   오류 메시지: ${data.error_message}`);
      }
      return null;
    }
  } catch (error) {
    console.error('Google Places API 오류:', error);
    return null;
  }
}

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

async function updateWithCoordinates(locationName, language = 'ko') {
  try {
    console.log(`🚀 ${locationName} (${language}) 좌표 정확도 최적화 시작`);
    
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
    console.log(`📍 현재 좌표: [${originalIntro.coordinates.lat}, ${originalIntro.coordinates.lng}]`);

    // 2. 제목 최적화
    const optimizedTitle = optimizeTitle(originalIntro.title, locationName);
    
    // 3. Google Places API로 정확한 좌표 검색
    console.log(`\n🎯 Google Places API로 정확한 좌표 검색 중...`);
    
    // 한국어 우선 검색
    let placeResult = await searchGooglePlaces(optimizedTitle, 'ko');
    if (!placeResult) {
      console.log('🔄 영어로 재검색...');
      placeResult = await searchGooglePlaces(locationName, 'en');
    }
    
    if (!placeResult) {
      console.log('⚠️ Google Places API 검색 실패, 제목만 최적화');
      return updateTitleOnly(guides, originalIntro, optimizedTitle);
    }

    // 4. 좌표 비교
    const oldLat = originalIntro.coordinates.lat;
    const oldLng = originalIntro.coordinates.lng;
    const newLat = placeResult.coordinates[0];
    const newLng = placeResult.coordinates[1];
    
    const distance = calculateDistance(oldLat, oldLng, newLat, newLng);
    console.log(`\n📏 좌표 변경 거리: ${distance.toFixed(0)}m`);
    console.log(`   기존: [${oldLat}, ${oldLng}]`);
    console.log(`   새로: [${newLat}, ${newLng}]`);

    // 5. 업데이트된 인트로 챕터 생성
    const updatedIntro = {
      ...originalIntro,
      title: optimizedTitle,
      coordinates: {
        lat: newLat,
        lng: newLng,
        description: `${locationName} 메인 접근점`
      }
    };

    // 6. 가이드 업데이트
    const updatedContent = { ...guides.content };
    updatedContent.content.realTimeGuide.chapters[0] = updatedIntro;

    // 가이드의 메인 좌표도 업데이트
    const updateData = {
      content: updatedContent,
      coordinates: [newLat, newLng]  // 가이드의 메인 좌표도 업데이트
    };

    // 7. DB 업데이트
    const { error: updateError } = await supabase
      .from('guides')
      .update(updateData)
      .eq('id', guides.id);

    if (updateError) {
      throw new Error(`DB 업데이트 실패: ${updateError.message}`);
    }

    console.log(`\n✅ ${locationName} (${language}) 좌표 최적화 완료!`);
    console.log(`📊 업데이트 요약:`);
    console.log(`   제목: "${originalIntro.title}" → "${optimizedTitle}"`);
    console.log(`   좌표: [${oldLat}, ${oldLng}] → [${newLat}, ${newLng}]`);
    console.log(`   거리 개선: ${distance.toFixed(0)}m 정확도 향상`);
    console.log(`   주소: ${placeResult.address}`);

    return {
      success: true,
      changed: true,
      guideId: guides.id,
      oldTitle: originalIntro.title,
      newTitle: optimizedTitle,
      oldCoordinates: [oldLat, oldLng],
      newCoordinates: [newLat, newLng],
      distance: distance,
      address: placeResult.address
    };

  } catch (error) {
    console.error(`❌ 업데이트 실패:`, error.message);
    return { success: false, error: error.message };
  }
}

// 좌표 계산 없이 제목만 업데이트하는 백업 함수
async function updateTitleOnly(guides, originalIntro, optimizedTitle) {
  const updatedContent = { ...guides.content };
  updatedContent.content.realTimeGuide.chapters[0] = {
    ...originalIntro,
    title: optimizedTitle
  };

  const { error: updateError } = await supabase
    .from('guides')
    .update({ content: updatedContent })
    .eq('id', guides.id);

  if (updateError) {
    throw new Error(`DB 업데이트 실패: ${updateError.message}`);
  }

  return {
    success: true,
    changed: true,
    titleOnly: true,
    oldTitle: originalIntro.title,
    newTitle: optimizedTitle
  };
}

// 두 좌표 간 거리 계산 (미터 단위)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 스크립트가 직접 실행될 때
if (require.main === module) {
  const locationName = process.argv[2] || '자갈치시장';
  const language = process.argv[3] || 'ko';
  
  updateWithCoordinates(locationName, language)
    .then(result => {
      if (result.success) {
        if (result.changed) {
          console.log(`\n🎉 좌표 최적화 성공!`);
          if (result.distance) {
            console.log(`📈 ${result.distance.toFixed(0)}m 정확도 향상 달성`);
          }
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

module.exports = { updateWithCoordinates };