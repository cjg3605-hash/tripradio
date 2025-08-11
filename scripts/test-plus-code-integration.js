/**
 * Plus Code 통합 테스트
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// 한국 주요 관광지 Plus Code 데이터
const KOREA_TOURISM_PLUS_CODES = {
  '자갈치시장': '32WJ+M8 부산광역시',
  '해운대해수욕장': '33X4+XP 부산광역시',
  '감천문화마을': '32WG+8M 부산광역시',
  '명동': '4WPR+XW 서울특별시',
  '경복궁': '4WPQ+8H 서울특별시'
};

async function testPlusCodeIntegration() {
  console.log('🎯 Plus Code 통합 테스트 시작\n');
  
  const testLocation = '자갈치시장';
  const expectedPlusCode = KOREA_TOURISM_PLUS_CODES[testLocation];
  
  console.log(`📍 테스트 장소: ${testLocation}`);
  console.log(`📋 예상 Plus Code: ${expectedPlusCode}\n`);

  try {
    // 1. Plus Code로 좌표 검색
    console.log('1️⃣ Plus Code → 좌표 변환 테스트');
    const coordsFromPlusCode = await geocodePlusCode(expectedPlusCode);
    
    if (coordsFromPlusCode) {
      console.log(`✅ Plus Code 좌표: ${coordsFromPlusCode.lat}, ${coordsFromPlusCode.lng}`);
      
      // 2. 같은 장소를 일반 검색으로 찾기
      console.log('\n2️⃣ 일반 장소명 검색과 비교');
      const coordsFromName = await searchByName(testLocation);
      
      if (coordsFromName) {
        console.log(`📍 일반 검색 좌표: ${coordsFromName.lat}, ${coordsFromName.lng}`);
        
        // 거리 차이 계산
        const distance = calculateDistance(
          coordsFromPlusCode.lat, coordsFromPlusCode.lng,
          coordsFromName.lat, coordsFromName.lng
        );
        
        console.log(`📏 좌표 차이: ${distance.toFixed(0)}m`);
        
        if (distance < 100) {
          console.log('✅ Plus Code와 일반 검색 결과 일치! (100m 이내)');
        } else {
          console.log('⚠️ Plus Code가 더 정확할 수 있습니다.');
        }
      }
    }

    // 3. 통합 검색 전략 테스트
    console.log('\n3️⃣ 통합 검색 전략 테스트');
    const bestResult = await comprehensiveLocationSearch(testLocation);
    console.log('🎯 최종 추천 좌표:', bestResult);

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  }
}

// Plus Code를 좌표로 변환
async function geocodePlusCode(plusCode) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address: plusCode,
      key: apiKey,
      language: 'ko'
    }
  });

  if (response.data.status === 'OK' && response.data.results.length > 0) {
    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }
  
  return null;
}

// 일반 장소명으로 검색
async function searchByName(locationName) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
    params: {
      input: locationName,
      inputtype: 'textquery',
      fields: 'geometry,name,formatted_address',
      key: apiKey,
      language: 'ko'
    }
  });

  if (response.data.status === 'OK' && response.data.candidates.length > 0) {
    const location = response.data.candidates[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  }
  
  return null;
}

// 통합 검색 전략
async function comprehensiveLocationSearch(locationName) {
  console.log(`🔍 ${locationName} 통합 검색 시작`);
  
  const results = [];

  // 1. Plus Code 검색
  const knownPlusCode = KOREA_TOURISM_PLUS_CODES[locationName];
  if (knownPlusCode) {
    console.log(`📋 알려진 Plus Code 사용: ${knownPlusCode}`);
    const plusCodeResult = await geocodePlusCode(knownPlusCode);
    if (plusCodeResult) {
      results.push({
        method: 'plus_code',
        coordinates: plusCodeResult,
        confidence: 0.95,
        source: knownPlusCode
      });
    }
  }

  // 2. 최적화된 검색어들
  const searchQueries = [
    locationName,
    `${locationName} 매표소`,
    `${locationName} 입구`,
    `${locationName} 안내소`
  ];

  for (const query of searchQueries) {
    console.log(`🔍 검색: "${query}"`);
    const result = await searchByName(query);
    if (result) {
      const confidence = calculateConfidence(query, locationName);
      results.push({
        method: 'places_api',
        coordinates: result,
        confidence,
        source: query
      });
    }
    
    // API 호출 제한
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 최고 신뢰도 결과 선택
  if (results.length > 0) {
    const best = results.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );
    
    console.log(`🏆 최고 결과: ${best.method} (신뢰도: ${(best.confidence * 100).toFixed(1)}%)`);
    console.log(`📍 좌표: ${best.coordinates.lat}, ${best.coordinates.lng}`);
    console.log(`📋 출처: ${best.source}`);
    
    return best;
  }

  return null;
}

// 신뢰도 계산
function calculateConfidence(query, originalName) {
  let confidence = 0.5;
  
  if (query === originalName) confidence = 0.8;
  else if (query.includes('매표소')) confidence = 0.9; // 테스트에서 가장 정확했음
  else if (query.includes('입구')) confidence = 0.7;
  else if (query.includes('안내소')) confidence = 0.75;
  
  return confidence;
}

// 거리 계산 (미터)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
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

testPlusCodeIntegration();