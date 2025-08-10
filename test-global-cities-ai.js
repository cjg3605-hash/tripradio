/**
 * 전세계 임의 도시 10곳 AI 프롬프트 분류 정확도 검증
 * 정적 데이터에 없는 도시들로 AI 프롬프트만의 성능 테스트
 */

// 정적 데이터에 없는 전세계 다양한 도시들 (의도적으로 선정)
const globalTestCities = [
  // 남미
  { city: "리오데자네이루", country: "브라질", expected: "RegionExploreHub", note: "브라질의 관광 도시" },
  { city: "부에노스아이레스", country: "아르헨티나", expected: "RegionExploreHub", note: "아르헨티나 수도" },
  
  // 아프리카  
  { city: "카이로", country: "이집트", expected: "RegionExploreHub", note: "이집트 수도" },
  { city: "카사블랑카", country: "모로코", expected: "RegionExploreHub", note: "모로코 최대 도시" },
  
  // 동남아시아
  { city: "방콕", country: "태국", expected: "RegionExploreHub", note: "태국 수도" },
  { city: "싱가포르", country: "싱가포르", expected: "RegionExploreHub", note: "도시국가" },
  
  // 오세아니아
  { city: "시드니", country: "호주", expected: "RegionExploreHub", note: "호주 최대 도시" },
  { city: "오클랜드", country: "뉴질랜드", expected: "RegionExploreHub", note: "뉴질랜드 최대 도시" },
  
  // 동유럽/북유럽
  { city: "프라하", country: "체코", expected: "RegionExploreHub", note: "체코 수도" },
  { city: "스톡홀름", country: "스웨덴", expected: "RegionExploreHub", note: "스웨덴 수도" }
];

// 비교용 구체적 명소들 (DetailedGuidePage 예상)
const landmarkTestCases = [
  { query: "마추픽추", expected: "DetailedGuidePage", note: "페루의 구체적 유적지" },
  { query: "앙코르와트", expected: "DetailedGuidePage", note: "캄보디아의 구체적 사원" },
  { query: "타지마할", expected: "DetailedGuidePage", note: "인도의 구체적 건축물" },
  { query: "오페라하우스", expected: "DetailedGuidePage", note: "시드니의 구체적 건물" },
  { query: "크라이스트 더 리디머", expected: "DetailedGuidePage", note: "리오의 구체적 동상" }
];

console.log('🌍 전세계 도시 AI 프롬프트 분류 정확도 검증');
console.log('=' .repeat(80));

console.log('\n📋 테스트 대상: 정적 데이터에 없는 전세계 도시 10곳');
console.log('🎯 목표: AI 프롬프트만으로 RegionExploreHub 정확 분류');

console.log('\n🏙️ 도시 분류 테스트 (예상: RegionExploreHub):');
console.log('-'.repeat(50));
globalTestCities.forEach((test, index) => {
  console.log(`${index + 1}. ${test.city} (${test.country})`);
  console.log(`   예상: ${test.expected}`);
  console.log(`   설명: ${test.note}`);
  console.log('');
});

console.log('\n🏛️ 명소 분류 테스트 (예상: DetailedGuidePage):');
console.log('-'.repeat(50));
landmarkTestCases.forEach((test, index) => {
  console.log(`${index + 1}. ${test.query}`);
  console.log(`   예상: ${test.expected}`);
  console.log(`   설명: ${test.note}`);
  console.log('');
});

console.log('\n🧠 AI 프롬프트 의존도 분석:');
console.log('- 정적 데이터 매칭: 0% (모든 도시가 데이터에 없음)');
console.log('- AI 프롬프트 분석: 100% (순수 AI 판단력 검증)');
console.log('- 지리학 지식: 전세계 6개 대륙 도시 커버');
console.log('- 문화적 맥락: 다양한 언어권 도시 포함');

console.log('\n⚡ 실제 테스트 방법:');
console.log('1. Next.js 앱 실행: npm run dev');
console.log('2. 각 도시명으로 검색하여 라우팅 결과 확인');
console.log('3. 로그에서 AI 프롬프트 분석 결과 확인');
console.log('4. RegionExploreHub vs DetailedGuidePage 정확도 측정');

console.log('\n🔍 검증 포인트:');
console.log('- 도시들이 모두 RegionExploreHub로 분류되는가?');
console.log('- 명소들이 모두 DetailedGuidePage로 분류되는가?');
console.log('- AI가 지리학적 지식을 정확히 활용하는가?');
console.log('- 다양한 언어/문화권 도시를 올바르게 인식하는가?');

console.log('\n💡 성공 기준:');
console.log('- 도시 분류 정확도: 90% 이상 (10곳 중 9곳 이상 정확)');
console.log('- 명소 분류 정확도: 100% (모든 명소 정확 분류)');
console.log('- AI 신뢰도: 0.8 이상');
console.log('- 응답 시간: 3초 이내');