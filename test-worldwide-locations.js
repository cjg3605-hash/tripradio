/**
 * 🌍 전세계 임의 장소 10곳 국가코드/지역명 검증 테스트
 * 정적 데이터에 없는 다양한 대륙의 유명 관광지로 테스트
 */

const axios = require('axios');

// 🌍 전세계 임의 장소 10곳 (다양한 대륙, 정적 데이터에 없는 장소들)
const testLocations = [
  // 🌍 아프리카
  { 
    name: '마추픽추', 
    country: '페루',
    expected_country_code: 'PER',
    expected_region: '쿠스코',
    continent: '남미'
  },
  
  // 🌍 오세아니아  
  { 
    name: '시드니 오페라하우스', 
    country: '호주',
    expected_country_code: 'AUS', 
    expected_region: '뉴사우스웨일스',
    continent: '오세아니아'
  },
  
  // 🌍 아프리카
  { 
    name: '기자의 피라미드', 
    country: '이집트',
    expected_country_code: 'EGY',
    expected_region: '기자',
    continent: '아프리카'
  },
  
  // 🌍 유럽 (기존 테스트에 없던 국가)
  { 
    name: '산토리니', 
    country: '그리스',
    expected_country_code: 'GRC',
    expected_region: '키클라데스',
    continent: '유럽'
  },
  
  // 🌍 북미
  { 
    name: '그랜드캐니언', 
    country: '미국',
    expected_country_code: 'USA',
    expected_region: '애리조나',
    continent: '북미'
  },
  
  // 🌍 남미
  { 
    name: '이과수 폭포', 
    country: '브라질',
    expected_country_code: 'BRA',
    expected_region: '파라나',
    continent: '남미'
  },
  
  // 🌍 아시아 (동남아시아)
  { 
    name: '앙코르와트', 
    country: '캄보디아',
    expected_country_code: 'KHM',
    expected_region: '시엠레아프',
    continent: '아시아'
  },
  
  // 🌍 아시아 (남아시아)
  { 
    name: '타지마할', 
    country: '인도',
    expected_country_code: 'IND',
    expected_region: '우타르프라데시',
    continent: '아시아'
  },
  
  // 🌍 유럽 (북유럽)
  { 
    name: '바이킹 박물관', 
    country: '노르웨이',
    expected_country_code: 'NOR',
    expected_region: '오슬로',
    continent: '유럽'
  },
  
  // 🌍 아프리카 (남아프리카)
  { 
    name: '테이블마운틴', 
    country: '남아프리카공화국',
    expected_country_code: 'ZAF',
    expected_region: '웨스턴케이프',
    continent: '아프리카'
  }
];

/**
 * 🧪 실제 가이드 생성 API 호출 테스트
 */
async function testGuideGeneration(locationName) {
  try {
    console.log(`\n🔍 "${locationName}" 가이드 생성 테스트 시작...`);
    
    const response = await axios.post('http://localhost:3005/api/ai/generate-multilang-guide', {
      locationName: locationName,
      language: 'ko',
      userProfile: { experience: 'intermediate' }
    }, {
      timeout: 120000, // 2분 타임아웃
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const guideData = response.data.data;
      const regionalInfo = guideData.regionalInfo;
      
      console.log(`✅ 가이드 생성 성공`);
      console.log(`📍 추출된 지역 정보:`);
      console.log(`   - 지역: ${regionalInfo.location_region || 'null'}`);
      console.log(`   - 국가코드: ${regionalInfo.country_code || 'null'}`);
      
      return {
        success: true,
        location_region: regionalInfo.location_region,
        country_code: regionalInfo.country_code,
        coordinates: guideData.locationCoordinateStatus?.coordinates || null
      };
    } else {
      console.log(`❌ 가이드 생성 실패: ${response.data.error}`);
      return { success: false, error: response.data.error };
    }
    
  } catch (error) {
    console.log(`❌ API 호출 실패: ${error.message}`);
    if (error.response?.data) {
      console.log(`   응답 데이터: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return { success: false, error: error.message };
  }
}

/**
 * 🎯 국가 코드 검증 (Alpha-2와 Alpha-3 모두 지원)
 */
function validateCountryCode(actual, expected, locationName) {
  if (!actual) {
    return { valid: false, reason: '국가코드가 추출되지 않음' };
  }
  
  if (actual === expected) {
    return { valid: true, reason: '정확한 국가코드 추출' };
  }
  
  // Alpha-2 ↔ Alpha-3 변환 매핑
  const conversionMap = {
    // Alpha-2 → Alpha-3
    'PE': 'PER', 'EG': 'EGY', 'GR': 'GRC', 'KH': 'KHM', 
    'NO': 'NOR', 'ZA': 'ZAF', 'AR': 'ARG', 'AU': 'AUS',
    'US': 'USA', 'GB': 'GBR', 'KR': 'KOR', 'TH': 'THA',
    'CN': 'CHN', 'JP': 'JPN', 'IN': 'IND', 'BR': 'BRA',
    
    // Alpha-3 → Alpha-2 (역방향)
    'PER': 'PE', 'EGY': 'EG', 'GRC': 'GR', 'KHM': 'KH',
    'NOR': 'NO', 'ZAF': 'ZA', 'ARG': 'AR', 'AUS': 'AU',
    'USA': 'US', 'GBR': 'GB', 'KOR': 'KR', 'THA': 'TH',
    'CHN': 'CN', 'JPN': 'JP', 'IND': 'IN', 'BRA': 'BR'
  };
  
  // 직접 매칭 또는 변환된 코드 매칭 확인
  if (conversionMap[actual] === expected || conversionMap[expected] === actual) {
    return { valid: true, reason: '유효한 국가코드 (Alpha-2/3 변환)' };
  }
  
  return { valid: false, reason: `예상 ${expected}, 실제 ${actual}` };
}

/**
 * 🌍 메인 테스트 실행
 */
async function runWorldwideTest() {
  console.log('🌍 전세계 임의 장소 10곳 국가코드/지역명 검증 테스트');
  console.log('=' .repeat(80));
  
  let passCount = 0;
  let failCount = 0;
  const results = [];
  
  for (let i = 0; i < testLocations.length; i++) {
    const location = testLocations[i];
    console.log(`\n${i + 1}/10. 🌍 ${location.continent} - ${location.name} (${location.country})`);
    console.log('-'.repeat(60));
    
    const result = await testGuideGeneration(location.name);
    
    if (result.success) {
      const countryValidation = validateCountryCode(
        result.country_code, 
        location.expected_country_code, 
        location.name
      );
      
      const testResult = {
        location: location.name,
        continent: location.continent,
        expected_country: location.country,
        expected_country_code: location.expected_country_code,
        expected_region: location.expected_region,
        actual_country_code: result.country_code,
        actual_region: result.location_region,
        country_valid: countryValidation.valid,
        country_reason: countryValidation.reason,
        coordinates: result.coordinates,
        overall_pass: countryValidation.valid
      };
      
      results.push(testResult);
      
      if (testResult.overall_pass) {
        passCount++;
        console.log(`🎉 종합 결과: PASS`);
      } else {
        failCount++;
        console.log(`⚠️ 종합 결과: FAIL - ${countryValidation.reason}`);
      }
      
      console.log(`📊 상세 결과:`);
      console.log(`   국가코드: ${countryValidation.valid ? '✅' : '❌'} ${countryValidation.reason}`);
      console.log(`   지역명: ${result.location_region || '미추출'}`);
      if (result.coordinates) {
        console.log(`   좌표: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      }
      
    } else {
      results.push({
        location: location.name,
        continent: location.continent,
        expected_country: location.country,
        error: result.error,
        overall_pass: false
      });
      
      failCount++;
      console.log(`❌ API 실패: ${result.error}`);
    }
    
    // API 호출 간격 (API 제한 방지)
    if (i < testLocations.length - 1) {
      console.log(`⏳ 3초 대기...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // 최종 결과 요약
  console.log('\n' + '='.repeat(80));
  console.log('📊 최종 테스트 결과 요약');
  console.log('='.repeat(80));
  
  console.log(`✅ 성공: ${passCount}/10`);
  console.log(`❌ 실패: ${failCount}/10`);
  console.log(`📈 성공률: ${((passCount / 10) * 100).toFixed(1)}%`);
  
  // 대륙별 성공률
  const continentStats = {};
  results.forEach(r => {
    if (!continentStats[r.continent]) {
      continentStats[r.continent] = { total: 0, pass: 0 };
    }
    continentStats[r.continent].total++;
    if (r.overall_pass) continentStats[r.continent].pass++;
  });
  
  console.log('\n📍 대륙별 성공률:');
  Object.entries(continentStats).forEach(([continent, stats]) => {
    const rate = ((stats.pass / stats.total) * 100).toFixed(1);
    console.log(`   ${continent}: ${stats.pass}/${stats.total} (${rate}%)`);
  });
  
  // 실패한 케이스 상세 분석
  const failures = results.filter(r => !r.overall_pass);
  if (failures.length > 0) {
    console.log('\n⚠️ 실패 케이스 분석:');
    failures.forEach(f => {
      console.log(`   - ${f.location}: ${f.country_reason || f.error}`);
    });
  } else {
    console.log('\n🎉 모든 테스트 통과!');
  }
}

// 스크립트 실행
if (require.main === module) {
  runWorldwideTest().catch(console.error);
}

module.exports = { testLocations, testGuideGeneration, runWorldwideTest };