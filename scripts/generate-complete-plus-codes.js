// 완전한 Plus Code 생성 (Global Code 포함)
import { config } from 'dotenv';
config({ path: '.env.local' });

const KEY_LOCATIONS = [
  // 한국
  { name: '석굴암', query: '석굴암 경주 Seokguram', area: '경주시' },
  { name: '불국사', query: '불국사 경주 Bulguksa', area: '경주시' },
  { name: '자갈치시장', query: '자갈치시장 부산 Jagalchi Market', area: '부산광역시' },
  { name: '해운대해수욕장', query: '해운대해수욕장 부산 Haeundae Beach', area: '부산광역시' },
  { name: '감천문화마을', query: '감천문화마을 부산 Gamcheon Culture Village', area: '부산광역시' },
  { name: '경복궁', query: '경복궁 서울 Gyeongbokgung Palace', area: '서울특별시' },
  { name: '명동', query: '명동 서울 Myeongdong', area: '서울특별시' },
  { name: '남산타워', query: '남산타워 서울 N Seoul Tower', area: '서울특별시' },
  { name: '성산일출봉', query: '성산일출봉 제주 Seongsan Ilchulbong', area: '서귀포시' },
  { name: '한라산', query: '한라산 제주 Hallasan Mountain', area: '제주시' },
  { name: '중문관광단지', query: '중문관광단지 제주 Jungmun Tourist Complex', area: '서귀포시' },
  { name: '첨성대', query: '첨성대 경주 Cheomseongdae Observatory', area: '경주시' },
  
  // 해외 주요 관광지
  { name: 'Eiffel Tower', query: 'Eiffel Tower Paris France', area: 'Paris, France' },
  { name: 'Louvre Museum', query: 'Louvre Museum Paris France', area: 'Paris, France' },
  { name: 'Big Ben', query: 'Big Ben London UK', area: 'London, UK' },
  { name: 'Colosseum', query: 'Colosseum Rome Italy', area: 'Rome, Italy' },
  { name: 'Sagrada Familia', query: 'Sagrada Familia Barcelona Spain', area: 'Barcelona, Spain' },
  { name: 'Times Square', query: 'Times Square New York USA', area: 'New York, USA' },
  { name: 'Statue of Liberty', query: 'Statue of Liberty New York USA', area: 'New York, USA' },
  { name: 'Taj Mahal', query: 'Taj Mahal Agra India', area: 'Agra, India' },
];

const results = [];

async function generateCompletePlusCode(location) {
  try {
    console.log(`\n🔍 ${location.name} 처리 중...`);
    
    // 1. Google Places로 정확한 좌표 검색
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(location.query)}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ko`
    );
    
    const placesData = await placesResponse.json();
    if (placesData.status !== 'OK' || !placesData.results.length) {
      throw new Error('Google Places 검색 실패');
    }
    
    const place = placesData.results[0];
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    
    console.log(`   📍 좌표: ${lat}, ${lng}`);
    console.log(`   📝 정확한 이름: ${place.name}`);
    
    // 2. Plus Code 생성 (두 가지 방법 시도)
    let plusCode = null;
    let globalCode = null;
    
    // 방법 1: Plus Codes API 시도
    try {
      const plusResponse = await fetch(`https://plus.codes/api?address=${lat},${lng}&emode=json`);
      if (plusResponse.ok) {
        const plusData = await plusResponse.json();
        if (plusData.plus_code && plusData.plus_code.global_code) {
          globalCode = plusData.plus_code.global_code;
          plusCode = globalCode;
          console.log(`   🔢 Plus Code (API): ${globalCode}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Plus Codes API 실패: ${error.message}`);
    }
    
    // 방법 2: Google Geocoding API로 Plus Code 추출
    if (!plusCode) {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=en`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.status === 'OK') {
          // Plus Code 패턴 찾기
          for (const result of geocodeData.results) {
            const plusCodeMatch = result.formatted_address.match(/([23456789CFGHJMPQRVWX]{4,}\+[23456789CFGHJMPQRVWX]{2,})/);
            if (plusCodeMatch) {
              plusCode = plusCodeMatch[1];
              
              // Global Code 생성 (지역 정보 포함)
              const locationParts = result.formatted_address.split(', ');
              const areaInfo = locationParts.find(part => 
                !part.includes('+') && 
                (part.includes('시') || part.includes('구') || part.includes('도') || 
                 part.includes('City') || part.includes('Province') || part.includes('State'))
              );
              
              if (areaInfo) {
                globalCode = `${plusCode} ${areaInfo}`;
              } else {
                globalCode = `${plusCode} ${location.area}`;
              }
              
              console.log(`   🔢 Plus Code (Geocoding): ${plusCode}`);
              console.log(`   🌍 Global Code: ${globalCode}`);
              break;
            }
          }
        }
      }
    }
    
    if (!plusCode) {
      throw new Error('Plus Code 생성 실패');
    }
    
    // 3. Plus Code 검증
    const verifyResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );
    
    let validationResult = { valid: false, distance: null };
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      if (verifyData.status === 'OK' && verifyData.results.length > 0) {
        const reverseLat = verifyData.results[0].geometry.location.lat;
        const reverseLng = verifyData.results[0].geometry.location.lng;
        
        // 거리 계산 (정확한 Haversine 공식)
        const R = 6371000; // 지구 반지름
        const φ1 = lat * Math.PI/180;
        const φ2 = reverseLat * Math.PI/180;
        const Δφ = (reverseLat - lat) * Math.PI/180;
        const Δλ = (reverseLng - lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        validationResult = {
          valid: distance < 50, // 50m 이내면 유효
          distance: Math.round(distance)
        };
        
        console.log(`   ✅ 검증: ${validationResult.distance}m 차이 ${validationResult.valid ? '(정확)' : '(부정확)'}`);
      }
    }
    
    // 4. 결과 저장
    const result = {
      name: location.name,
      coordinates: { lat, lng },
      place_name: place.name,
      plus_code: plusCode,
      global_code: globalCode || `${plusCode} ${location.area}`,
      validation: validationResult,
      google_maps_link: `https://maps.google.com/?q=${lat},${lng}`,
      plus_code_link: `https://plus.codes/${plusCode}`
    };
    
    results.push(result);
    return result;
    
  } catch (error) {
    console.error(`   ❌ 실패: ${error.message}`);
    return null;
  }
}

async function generateAllPlusCodes() {
  console.log('🎯 완전한 Plus Code DB 생성');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (let i = 0; i < KEY_LOCATIONS.length; i++) {
    await generateCompletePlusCode(KEY_LOCATIONS[i]);
    
    // 진행률 표시
    const progress = ((i + 1) / KEY_LOCATIONS.length * 100).toFixed(1);
    console.log(`\n📊 진행률: ${progress}% (${i + 1}/${KEY_LOCATIONS.length})`);
    
    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 결과 출력
  console.log('\n🎉 Plus Code 생성 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 JavaScript 코드:');
  console.log('```javascript');
  console.log('const ACCURATE_PLUS_CODE_DB = {');
  
  results.filter(r => r && r.validation.valid).forEach(result => {
    console.log(`  '${result.name}': '${result.global_code}',`);
  });
  
  console.log('};');
  console.log('```');
  
  // 검증 실패한 것들
  const failed = results.filter(r => r && !r.validation.valid);
  if (failed.length > 0) {
    console.log('\n⚠️ 검증 실패한 Plus Code들:');
    failed.forEach(result => {
      console.log(`  ${result.name}: ${result.plus_code} (${result.validation.distance}m 차이)`);
    });
  }
  
  console.log(`\n📊 최종 통계:`);
  console.log(`  처리: ${results.length}개`);
  console.log(`  성공: ${results.filter(r => r && r.validation.valid).length}개`);
  console.log(`  실패: ${results.filter(r => !r || !r.validation.valid).length}개`);
}

generateAllPlusCodes();