/**
 * 🎯 정확한 Plus Code 생성 시스템
 * Google Places API → Plus Codes API 파이프라인
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

// 전세계 주요 관광지 목록
const LOCATIONS = [
  // 한국
  { name: '석굴암', searchQuery: '석굴암 경주 Seokguram Grotto', country: 'KR' },
  { name: '불국사', searchQuery: '불국사 경주 Bulguksa Temple', country: 'KR' },
  { name: '자갈치시장', searchQuery: '자갈치시장 부산 Jagalchi Market', country: 'KR' },
  { name: '해운대해수욕장', searchQuery: '해운대해수욕장 부산 Haeundae Beach', country: 'KR' },
  { name: '경복궁', searchQuery: '경복궁 서울 Gyeongbokgung Palace', country: 'KR' },
  { name: '명동', searchQuery: '명동 서울 Myeongdong', country: 'KR' },
  { name: '남산타워', searchQuery: '남산타워 서울 N Seoul Tower', country: 'KR' },
  { name: '성산일출봉', searchQuery: '성산일출봉 제주 Seongsan Ilchulbong', country: 'KR' },
  { name: '한라산', searchQuery: '한라산 제주 Hallasan Mountain', country: 'KR' },
  { name: '중문관광단지', searchQuery: '중문관광단지 제주 Jungmun Tourist Complex', country: 'KR' },
  { name: '첨성대', searchQuery: '첨성대 경주 Cheomseongdae Observatory', country: 'KR' },
  
  // 일본
  { name: 'Tokyo Tower', searchQuery: 'Tokyo Tower Japan', country: 'JP' },
  { name: 'Senso-ji', searchQuery: 'Senso-ji Temple Tokyo Japan', country: 'JP' },
  { name: 'Mount Fuji', searchQuery: 'Mount Fuji Japan', country: 'JP' },
  { name: 'Kiyomizu-dera', searchQuery: 'Kiyomizu-dera Temple Kyoto Japan', country: 'JP' },
  
  // 유럽
  { name: 'Eiffel Tower', searchQuery: 'Eiffel Tower Paris France', country: 'FR' },
  { name: 'Louvre Museum', searchQuery: 'Louvre Museum Paris France', country: 'FR' },
  { name: 'Colosseum', searchQuery: 'Colosseum Rome Italy', country: 'IT' },
  { name: 'Big Ben', searchQuery: 'Big Ben London UK', country: 'GB' },
  { name: 'Sagrada Familia', searchQuery: 'Sagrada Familia Barcelona Spain', country: 'ES' },
  { name: 'Neuschwanstein Castle', searchQuery: 'Neuschwanstein Castle Germany', country: 'DE' },
  
  // 미국
  { name: 'Statue of Liberty', searchQuery: 'Statue of Liberty New York USA', country: 'US' },
  { name: 'Times Square', searchQuery: 'Times Square New York USA', country: 'US' },
  { name: 'Grand Canyon', searchQuery: 'Grand Canyon Arizona USA', country: 'US' },
  
  // 기타
  { name: 'Taj Mahal', searchQuery: 'Taj Mahal Agra India', country: 'IN' },
  { name: 'Machu Picchu', searchQuery: 'Machu Picchu Peru', country: 'PE' },
  { name: 'Christ the Redeemer', searchQuery: 'Christ the Redeemer Rio de Janeiro Brazil', country: 'BR' }
];

// 통계
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  results: []
};

/**
 * Google Places API로 정확한 좌표 검색
 */
async function getAccurateCoordinates(location) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(location.searchQuery)}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=en`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];
      return {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        name: place.name,
        address: place.formatted_address,
        place_id: place.place_id,
        types: place.types
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Google Places API 오류 (${location.name}):`, error.message);
    return null;
  }
}

/**
 * Plus Codes API로 Plus Code 생성
 */
async function generatePlusCode(lat, lng) {
  try {
    // 방법 1: Plus Codes API 사용
    const response = await fetch(
      `https://plus.codes/api?address=${lat},${lng}&emode=json`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.plus_code && data.plus_code.global_code) {
        return {
          global_code: data.plus_code.global_code,
          local_code: data.plus_code.local_code || null,
          compound_code: data.plus_code.compound_code || null,
          source: 'plus_codes_api'
        };
      }
    }
    
    // 방법 2: Google Geocoding API 역검색 (Plus Code 포함)
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_PLACES_API_KEY}&result_type=plus_code`
    );
    
    if (geocodeResponse.ok) {
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
        const result = geocodeData.results[0];
        // Plus Code는 formatted_address에 포함됨
        const plusCodeMatch = result.formatted_address.match(/([23456789CFGHJMPQRVWX]{4,}\+[23456789CFGHJMPQRVWX]{2,})/);
        if (plusCodeMatch) {
          return {
            global_code: plusCodeMatch[1],
            local_code: null,
            compound_code: result.formatted_address,
            source: 'google_geocoding'
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Plus Code 생성 오류 (${lat}, ${lng}):`, error.message);
    return null;
  }
}

/**
 * Plus Code 검증 (역변환 후 거리 비교)
 */
async function validatePlusCode(plusCode, originalLat, originalLng) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const reverseLat = result.geometry.location.lat;
        const reverseLng = result.geometry.location.lng;
        
        // 거리 계산
        const R = 6371000; // 지구 반지름
        const φ1 = originalLat * Math.PI/180;
        const φ2 = reverseLat * Math.PI/180;
        const Δφ = (reverseLat - originalLat) * Math.PI/180;
        const Δλ = (reverseLng - originalLng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return {
          valid: distance < 50, // 50m 이내면 유효
          distance: Math.round(distance),
          reverse_lat: reverseLat,
          reverse_lng: reverseLng,
          reverse_address: result.formatted_address
        };
      }
    }
    
    return { valid: false, distance: null, error: 'Plus Code 역변환 실패' };
  } catch (error) {
    return { valid: false, distance: null, error: error.message };
  }
}

/**
 * 단일 장소 처리
 */
async function processLocation(location) {
  try {
    console.log(`\n🔍 [${stats.total + 1}/${LOCATIONS.length}] ${location.name} 처리 중...`);
    
    // 1. Google Places로 정확한 좌표 검색
    const coordinates = await getAccurateCoordinates(location);
    if (!coordinates) {
      throw new Error('좌표를 찾을 수 없음');
    }
    
    console.log(`   📍 좌표: ${coordinates.lat}, ${coordinates.lng}`);
    console.log(`   📝 이름: ${coordinates.name}`);
    console.log(`   🏠 주소: ${coordinates.address}`);
    
    // 2. Plus Code 생성
    const plusCodeResult = await generatePlusCode(coordinates.lat, coordinates.lng);
    if (!plusCodeResult) {
      throw new Error('Plus Code 생성 실패');
    }
    
    console.log(`   🔢 Plus Code: ${plusCodeResult.global_code} (${plusCodeResult.source})`);
    
    // 3. Plus Code 검증
    const validation = await validatePlusCode(
      plusCodeResult.global_code, 
      coordinates.lat, 
      coordinates.lng
    );
    
    if (validation.valid) {
      console.log(`   ✅ 검증 통과: ${validation.distance}m 차이`);
    } else {
      console.log(`   ⚠️ 검증 실패: ${validation.distance || 'N/A'}m 차이 - ${validation.error || ''}`);
    }
    
    // 4. 결과 저장
    const result = {
      name: location.name,
      country: location.country,
      search_query: location.searchQuery,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng
      },
      place_info: {
        name: coordinates.name,
        address: coordinates.address,
        place_id: coordinates.place_id,
        types: coordinates.types
      },
      plus_code: {
        global_code: plusCodeResult.global_code,
        local_code: plusCodeResult.local_code,
        compound_code: plusCodeResult.compound_code,
        source: plusCodeResult.source
      },
      validation: validation,
      timestamp: new Date().toISOString()
    };
    
    stats.results.push(result);
    stats.success++;
    
    return result;
    
  } catch (error) {
    console.error(`   ❌ 실패: ${error.message}`);
    stats.failed++;
    return null;
  } finally {
    stats.total++;
  }
}

/**
 * Plus Code DB 생성 메인 함수
 */
async function generateAccuratePlusCodeDB() {
  try {
    console.log('🎯 정확한 Plus Code DB 생성 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 총 ${LOCATIONS.length}개 장소 처리 예정\n`);
    
    const startTime = Date.now();
    
    // 순차 처리 (API 부하 방지)
    for (const location of LOCATIONS) {
      await processLocation(location);
      
      // 진행률 표시
      if (stats.total % 5 === 0) {
        const progress = ((stats.total / LOCATIONS.length) * 100).toFixed(1);
        console.log(`\n📊 진행률: ${progress}% (${stats.total}/${LOCATIONS.length})`);
        console.log(`   성공: ${stats.success}, 실패: ${stats.failed}`);
      }
      
      // API 부하 방지 (1초 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 결과 저장
    const outputPath = './accurate-plus-code-db.json';
    const fs = await import('fs');
    fs.writeFileSync(outputPath, JSON.stringify({
      metadata: {
        generated_at: new Date().toISOString(),
        total_locations: stats.total,
        successful: stats.success,
        failed: stats.failed,
        success_rate: `${((stats.success / stats.total) * 100).toFixed(1)}%`,
        generation_time: `${((Date.now() - startTime) / 1000).toFixed(1)}초`
      },
      locations: stats.results
    }, null, 2));
    
    // JavaScript 코드 생성
    const jsCode = generateJavaScriptCode(stats.results);
    fs.writeFileSync('./accurate-plus-code-db.js', jsCode);
    
    // 최종 결과
    console.log('\n🎉 Plus Code DB 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 최종 통계:`);
    console.log(`   처리된 장소: ${stats.total}개`);
    console.log(`   성공: ${stats.success}개`);
    console.log(`   실패: ${stats.failed}개`);
    console.log(`   성공률: ${((stats.success / stats.total) * 100).toFixed(1)}%`);
    console.log(`   소요시간: ${((Date.now() - startTime) / 1000).toFixed(1)}초`);
    console.log(`\n📁 생성된 파일:`);
    console.log(`   ${outputPath} (JSON 데이터)`);
    console.log(`   ./accurate-plus-code-db.js (JavaScript 코드)`);
    
  } catch (error) {
    console.error('❌ Plus Code DB 생성 실패:', error.message);
    process.exit(1);
  }
}

/**
 * JavaScript 코드 생성
 */
function generateJavaScriptCode(results) {
  const validResults = results.filter(r => r && r.validation.valid);
  
  let jsCode = `/**
 * 🎯 정확한 Plus Code 데이터베이스
 * 생성일: ${new Date().toISOString()}
 * 검증된 장소: ${validResults.length}개
 */

const ACCURATE_PLUS_CODE_DB = {\n`;

  for (const result of validResults) {
    const cityInfo = result.plus_code.compound_code ? 
      `, ${result.plus_code.compound_code.split(' ').slice(1).join(' ')}` : '';
    
    jsCode += `  '${result.name}': '${result.plus_code.global_code}${cityInfo}',\n`;
  }

  jsCode += `};

// 검증 정보
const PLUS_CODE_VALIDATION = {\n`;

  for (const result of validResults) {
    jsCode += `  '${result.name}': {\n`;
    jsCode += `    coordinates: { lat: ${result.coordinates.lat}, lng: ${result.coordinates.lng} },\n`;
    jsCode += `    validation_distance: ${result.validation.distance},\n`;
    jsCode += `    place_id: '${result.place_info.place_id}',\n`;
    jsCode += `    address: '${result.place_info.address.replace(/'/g, "\\'")}',\n`;
    jsCode += `    generated_at: '${result.timestamp}'\n`;
    jsCode += `  },\n`;
  }

  jsCode += `};

module.exports = { ACCURATE_PLUS_CODE_DB, PLUS_CODE_VALIDATION };`;

  return jsCode;
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAccuratePlusCodeDB();
}

export { generateAccuratePlusCodeDB, LOCATIONS };