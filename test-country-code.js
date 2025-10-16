/**
 * 🗺️ 국가코드 변환 테스트
 */

// 직접 REST Countries API 호출 테스트
async function testCountryCodeAPI() {
  console.log('🗺️ 국가코드 API 직접 테스트');
  console.log('='.repeat(30));
  
  try {
    // REST Countries API 직접 호출
    const response = await fetch('https://restcountries.com/v3.1/name/South Korea?fields=cca3', {
      headers: { 'User-Agent': 'TripRadio-AI/1.0' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🌍 REST Countries API 응답:', data);
    
    if (data && data.length > 0 && data[0].cca3) {
      console.log(`✅ "South Korea" → "${data[0].cca3}"`);
      return data[0].cca3;
    } else {
      console.log('❌ 응답에서 cca3 필드를 찾을 수 없음');
      return null;
    }
    
  } catch (error) {
    console.error('❌ REST Countries API 오류:', error);
    return null;
  }
}

// 매핑 체인 테스트
function testMappingChain() {
  console.log('\n🔗 매핑 체인 테스트');
  console.log('='.repeat(30));
  
  // 1단계: 한국어 → 영어
  const koreanCountryMap = {
    '대한민국': 'South Korea',
    '한국': 'South Korea'
  };
  
  const input = '대한민국';
  const englishName = koreanCountryMap[input];
  console.log(`1️⃣ "${input}" → "${englishName}"`);
  
  // 2단계: 영어 → 국가코드 (예상)
  console.log(`2️⃣ "${englishName}" → "KOR" (예상)`);
  
  return englishName;
}

// 실행
async function main() {
  const englishName = testMappingChain();
  
  if (englishName) {
    console.log('\n🚀 REST Countries API 호출 중...');
    const countryCode = await testCountryCodeAPI();
    
    if (countryCode) {
      console.log(`\n🎯 최종 결과: "대한민국" → "${countryCode}"`);
      
      if (countryCode === 'KOR') {
        console.log('✅ 3자리 국가코드 정상!');
      } else {
        console.log(`⚠️ 예상과 다름: "${countryCode}" (예상: "KOR")`);
      }
    }
  }
}

if (require.main === module) {
  main();
}