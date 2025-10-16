const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// fetch를 global로 설정
global.fetch = fetch;

// Google Places API 함수
async function searchGooglePlaces(query, language = 'ko') {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,formatted_address,geometry,name&key=${apiKey}&language=${language}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.candidates.length > 0) {
      const place = data.candidates[0];
      return {
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
        address: place.formatted_address,
        name: place.name
      };
    }
    return null;
  } catch (error) {
    console.error('Google Places API 오류:', error);
    return null;
  }
}

// 제목 최적화 함수 (기존 제목에서 최적화된 제목 추출)
function optimizeTitle(originalTitle, locationName) {
  console.log(`🔧 제목 최적화 시작: "${originalTitle}"`);
  
  // 1. 콜론 뒤 설명문 제거
  let optimizedTitle = originalTitle;
  if (originalTitle.includes(':')) {
    const colonIndex = originalTitle.indexOf(':');
    optimizedTitle = originalTitle.substring(0, colonIndex).trim();
    console.log(`   1️⃣ 콜론 제거: "${optimizedTitle}"`);
  }
  
  // 2. 시설명이 없으면 기본 시설명 추가
  if (optimizedTitle === locationName) {
    optimizedTitle = `${locationName} 입구`;
    console.log(`   2️⃣ 기본 시설명 추가: "${optimizedTitle}"`);
  }
  
  console.log(`✅ 최종 최적화 결과: "${originalTitle}" → "${optimizedTitle}"`);
  return optimizedTitle;
}

// 간단한 인트로 챕터 최적화 함수
async function generateOptimizedIntro(locationName, originalIntro) {
  try {
    // 1. 기존 제목 최적화
    const optimizedTitle = optimizeTitle(originalIntro.title, locationName);
    console.log(`🎯 최적화된 제목: "${optimizedTitle}"`);

    // 2. 좌표 검색 (한국어 우선, 실패시 영어)
    console.log(`🔍 검색 시도: "${optimizedTitle}"`);
    let placeResult = await searchGooglePlaces(optimizedTitle, 'ko');
    if (!placeResult) {
      console.log('🔄 영어 검색 시도...');
      placeResult = await searchGooglePlaces(locationName, 'en');
    }
    
    if (!placeResult) {
      // 좌표 검색에 실패하면 기존 좌표 유지하고 제목만 최적화
      console.log('⚠️ 좌표 검색 실패, 기존 좌표 유지');
      return {
        title: optimizedTitle,
        coordinates: originalIntro.coordinates,
        description: originalIntro.description,
        address: originalIntro.address || '주소 정보 없음'
      };
    }

    console.log(`📍 발견된 좌표: [${placeResult.coordinates[0]}, ${placeResult.coordinates[1]}]`);

    return {
      title: optimizedTitle,
      coordinates: placeResult.coordinates,
      description: `${locationName} 방문의 시작점입니다. ${placeResult.name}에서 관광을 시작하세요.`,
      address: placeResult.address
    };

  } catch (error) {
    console.error('인트로 최적화 오류:', error);
    return null;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSingleIntro(locationName, language = 'ko') {
  try {
    console.log(`🔄 ${locationName} (${language}) 인트로 챕터 업데이트 시작`);
    
    // 1. 기존 가이드 검색
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .eq('location', locationName)
      .eq('language', language)
      .single();

    if (error || !guides) {
      throw new Error(`가이드를 찾을 수 없습니다: ${error?.message}`);
    }

    console.log(`✅ 기존 가이드 발견: ${guides.id}`);
    console.log(`📖 현재 인트로 제목: "${guides.content.realTimeGuide.chapters[0].title}"`);

    // 2. 새로운 최적화된 인트로 챕터 생성
    const locationData = {
      name: locationName,
      coordinates: { lat: guides.coordinates[0], lng: guides.coordinates[1] }
    };

    console.log(`🎯 기존 인트로 챕터 최적화 중...`);
    const originalIntro = guides.content.realTimeGuide.chapters[0];
    const newIntroData = await generateOptimizedIntro(locationName, originalIntro);

    if (!newIntroData) {
      throw new Error('인트로 챕터 최적화 실패');
    }

    // 기존 챕터 구조 유지하면서 업데이트
    const newIntro = {
      ...originalIntro,  // 기존 구조 유지
      title: newIntroData.title,
      coordinates: newIntroData.coordinates,
      description: newIntroData.description
    };

    console.log(`✨ 새 인트로 제목: "${newIntro.title}"`);
    console.log(`📍 새 좌표: lat=${newIntro.coordinates[0]}, lng=${newIntro.coordinates[1]}`);

    // 3. 기존 가이드 내용 복사 후 인트로만 교체
    const updatedContent = { ...guides.content };
    updatedContent.realTimeGuide.chapters[0] = newIntro;

    // 4. 가이드의 메인 좌표도 업데이트
    const updateData = {
      content: updatedContent,
      coordinates: newIntro.coordinates
    };

    // 5. DB 업데이트
    const { error: updateError } = await supabase
      .from('guides')
      .update(updateData)
      .eq('id', guides.id);

    if (updateError) {
      throw new Error(`DB 업데이트 실패: ${updateError.message}`);
    }

    console.log(`✅ ${locationName} (${language}) 인트로 챕터 업데이트 완료`);
    console.log(`📊 변경사항:`);
    console.log(`   이전 제목: "${guides.content.realTimeGuide.chapters[0].title}"`);
    console.log(`   새 제목: "${newIntro.title}"`);
    console.log(`   이전 좌표: [${guides.coordinates[0]}, ${guides.coordinates[1]}]`);
    console.log(`   새 좌표: [${newIntro.coordinates[0]}, ${newIntro.coordinates[1]}]`);

    return {
      success: true,
      guideId: guides.id,
      oldTitle: guides.content.realTimeGuide.chapters[0].title,
      newTitle: newIntro.title,
      oldCoordinates: guides.coordinates,
      newCoordinates: newIntro.coordinates
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
  
  updateSingleIntro(locationName, language)
    .then(result => {
      if (result.success) {
        console.log(`\n🎉 성공적으로 업데이트 완료!`);
        process.exit(0);
      } else {
        console.log(`\n❌ 업데이트 실패: ${result.error}`);
        process.exit(1);
      }
    });
}

module.exports = { updateSingleIntro };