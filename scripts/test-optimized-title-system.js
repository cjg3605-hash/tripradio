#!/usr/bin/env node

/**
 * 🎯 최적화된 제목 시스템 테스트
 * 카사밀라 등 문제가 된 케이스들을 테스트
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { optimizeTitleForSearch, convertToEnglishSearch } = require('./update-intro-chapters.js');

async function testOptimizedTitleSystem() {
  console.log('🎯 최적화된 제목 시스템 테스트 시작\n');

  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google API 키가 없습니다!');
    return;
  }

  // 문제가 된 케이스들 테스트
  const testCases = [
    {
      name: '카사밀라 케이스',
      originalTitle: '카사밀라 Passeig de Gràcia 92: 카사밀라 관광 시작점',
      locationName: '카사밀라',
      expectedCoords: { lat: 41.3952155, lng: 2.1619024 },
      tolerance: 100 // 100m 이내
    },
    {
      name: '자갈치시장 케이스',
      originalTitle: '자갈치시장 입구: 활기찬 시장의 첫인상',
      locationName: '자갈치시장',
      expectedCoords: { lat: 35.0966339, lng: 129.0307965 },
      tolerance: 100
    },
    {
      name: '명동역 케이스',
      originalTitle: '명동역 8번 출구: 쇼핑의 시작점',
      locationName: '명동역',
      expectedCoords: { lat: 37.5610921, lng: 126.9857781 },
      tolerance: 100
    },
    {
      name: '경복궁 케이스',
      originalTitle: '경복궁 정문: 조선왕조의 웅장함',
      locationName: '경복궁',
      expectedCoords: { lat: 37.579617, lng: 126.977041 },
      tolerance: 100
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n🔍 테스트: ${testCase.name}`);
    console.log(`원본 제목: "${testCase.originalTitle}"`);

    try {
      // 1️⃣ 제목 최적화
      const optimizedTitle = optimizeTitleForSearch(testCase.originalTitle, testCase.locationName);
      console.log(`최적화 결과: "${optimizedTitle}"`);

      // 2️⃣ Google Places API로 검색
      const searchResults = await searchWithOptimizedTitle(optimizedTitle, testCase.locationName, googleApiKey);
      
      if (searchResults && searchResults.length > 0) {
        const bestResult = searchResults[0];
        console.log(`✅ 검색 성공: ${bestResult.name}`);
        console.log(`📍 발견 좌표: ${bestResult.lat}, ${bestResult.lng}`);
        console.log(`📧 주소: ${bestResult.address}`);
        
        // 3️⃣ 정확도 검증
        const distance = calculateDistance(
          bestResult.lat, bestResult.lng,
          testCase.expectedCoords.lat, testCase.expectedCoords.lng
        );
        
        console.log(`📏 예상 좌표와의 거리: ${Math.round(distance)}m`);
        
        if (distance <= testCase.tolerance) {
          console.log(`🎉 테스트 통과! (${testCase.tolerance}m 이내)`);
          passedTests++;
        } else {
          console.log(`❌ 테스트 실패! (${testCase.tolerance}m 초과)`);
        }

      } else {
        console.log(`❌ 검색 실패: 결과 없음`);
      }

    } catch (error) {
      console.error(`❌ 테스트 오류:`, error.message);
    }

    // API 제한 고려
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 결과 요약
  console.log(`\n📊 테스트 결과 요약:`);
  console.log(`✅ 통과: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ 실패: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log('\n🎉 모든 테스트 통과! 시스템이 정상 작동합니다.');
  } else {
    console.log('\n⚠️ 일부 테스트 실패. 추가 개선이 필요합니다.');
  }
}

/**
 * 최적화된 제목으로 Google Places API 검색
 */
async function searchWithOptimizedTitle(optimizedTitle, locationName, apiKey) {
  const searchQueries = [
    optimizedTitle,
    convertToEnglishSearch(optimizedTitle),
    locationName,
    convertToEnglishSearch(locationName)
  ];

  for (const query of searchQueries) {
    try {
      console.log(`   🔍 검색 시도: "${query}"`);
      
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
      const fullUrl = `${url}?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${apiKey}`;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.candidates?.length > 0) {
        return data.candidates.map(candidate => ({
          name: candidate.name,
          lat: candidate.geometry.location.lat,
          lng: candidate.geometry.location.lng,
          address: candidate.formatted_address,
          query: query
        }));
      }
    } catch (error) {
      console.log(`   ⚠️ 검색 오류: ${query} - ${error.message}`);
      continue;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return [];
}

// convertToEnglishSearch는 이미 update-intro-chapters.js에서 import됨

/**
 * 거리 계산 함수
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 실행
testOptimizedTitleSystem();