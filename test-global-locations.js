/**
 * 🌍 Enhanced Location Service 글로벌 테스트
 * 전세계 주요 도시/관광지 정확도 검증
 */

// 테스트할 전세계 위치들
const globalTestCases = [
  // 🇰🇷 한국
  { query: "부산역", expected: "부산광역시", country: "대한민국" },
  { query: "제주도 성산일출봉", expected: "제주특별자치도", country: "대한민국" },
  
  // 🇯🇵 일본  
  { query: "東京駅", expected: "Tokyo Station", country: "Japan" },
  { query: "富士山", expected: "Mount Fuji", country: "Japan" },
  
  // 🇨🇳 중국
  { query: "天安门广场", expected: "Tiananmen Square", country: "China" },
  { query: "长城", expected: "Great Wall of China", country: "China" },
  
  // 🇺🇸 미국
  { query: "Times Square", expected: "New York", country: "USA" },
  { query: "Golden Gate Bridge", expected: "San Francisco", country: "USA" },
  
  // 🇬🇧 영국
  { query: "Big Ben", expected: "London", country: "UK" },
  { query: "Stonehenge", expected: "Wiltshire", country: "UK" },
  
  // 🇫🇷 프랑스
  { query: "Tour Eiffel", expected: "Paris", country: "France" },
  { query: "Mont-Saint-Michel", expected: "Normandy", country: "France" },
  
  // 🇩🇪 독일
  { query: "Brandenburger Tor", expected: "Berlin", country: "Germany" },
  { query: "Neuschwanstein", expected: "Bavaria", country: "Germany" },
  
  // 🇮🇹 이탈리아
  { query: "Colosseo", expected: "Rome", country: "Italy" },
  { query: "Torre di Pisa", expected: "Pisa", country: "Italy" },
  
  // 🇪🇸 스페인
  { query: "Sagrada Familia", expected: "Barcelona", country: "Spain" },
  { query: "Alhambra", expected: "Granada", country: "Spain" },
  
  // 🇧🇷 브라질
  { query: "Cristo Redentor", expected: "Rio de Janeiro", country: "Brazil" },
  { query: "Cataratas do Iguaçu", expected: "Foz do Iguaçu", country: "Brazil" },
  
  // 🇦🇺 호주
  { query: "Sydney Opera House", expected: "Sydney", country: "Australia" },
  { query: "Uluru", expected: "Northern Territory", country: "Australia" },
  
  // 🇪🇬 이집트
  { query: "أهرامات الجيزة", expected: "Giza Pyramids", country: "Egypt" },
  { query: "Abu Simbel", expected: "Aswan", country: "Egypt" },
  
  // 🇮🇳 인도
  { query: "ताज महल", expected: "Taj Mahal, Agra", country: "India" },
  { query: "Gateway of India", expected: "Mumbai", country: "India" },
  
  // 🇷🇺 러시아
  { query: "Красная площадь", expected: "Red Square, Moscow", country: "Russia" },
  { query: "Эрмитаж", expected: "St. Petersburg", country: "Russia" },
  
  // 🇿🇦 남아프리카공화국
  { query: "Table Mountain", expected: "Cape Town", country: "South Africa" },
  { query: "Victoria Falls", expected: "Zambia/Zimbabwe border", country: "Africa" }
];

console.log(`🌍 글로벌 테스트 케이스: ${globalTestCases.length}개 위치`);
console.log('📋 테스트 범위:');
console.log('- 대륙: 6개 대륙 전체');
console.log('- 국가: 15개국');  
console.log('- 언어: 한국어, 일본어, 중국어, 영어, 프랑스어, 독일어, 이탈리아어, 스페인어, 포르투갈어, 러시아어, 아랍어, 힌디어');
console.log('- 위치 유형: 역사/문화유적, 자연경관, 도시 랜드마크, 교통허브');

// Enhanced Location Service로 실제 테스트하려면:
// const { enhancedLocationService } = require('./src/lib/coordinates/enhanced-location-service');
// 
// async function runGlobalTest() {
//   for (const testCase of globalTestCases) {
//     try {
//       const result = await enhancedLocationService.findLocation({
//         query: testCase.query,
//         language: 'auto', // 자동 언어 감지
//         context: testCase.country
//       });
//       
//       console.log(`✅ ${testCase.query}: ${result.accuracy} (${result.confidence})`);
//     } catch (error) {
//       console.log(`❌ ${testCase.query}: ${error.message}`);
//     }
//   }
// }