// 간단한 페르소나 분류 테스트 - JavaScript 버전

console.log('🧪 Universal Persona System 테스트');
console.log('==========================================');

// 규칙 기반 분류 함수 (새로운 시스템 로직)
function classifyLocationByRules(locationName) {
  const normalizedName = locationName.toLowerCase();
  
  // 건축 & 공학 키워드 (우선순위)
  const architectureKeywords = [
    'tower', 'building', 'skyscraper', 'bridge', 'dam', 'tunnel',
    'stadium', 'airport', 'station', 'terminal', 'observatory',
    '타워', '빌딩', '전망대', '관측소', '공항', '역', '터미널'
  ];
  
  // 왕실 유산 키워드
  const royalKeywords = [
    'palace', 'castle', 'royal', 'imperial', 'throne', 'court',
    '궁', '궁궐', '왕궁', '황궁', '성', '왕실', '궁전'
  ];
  
  // 성지 & 영성 키워드
  const sacredKeywords = [
    'church', 'cathedral', 'basilica', 'mosque', 'temple', 'shrine',
    'monastery', 'abbey', 'synagogue', 'pagoda', 'stupa',
    '교회', '성당', '대성당', '절', '사찰', '암자', '신사', '모스크'
  ];
  
  // 자연 & 생태 키워드
  const natureKeywords = [
    'park', 'forest', 'mountain', 'lake', 'river', 'beach', 'island',
    'canyon', 'valley', 'waterfall', 'cave', 'volcano', 'glacier',
    '공원', '산', '강', '호수', '해변', '섬', '계곡', '폭포', '동굴', '화산'
  ];
  
  // 예술 & 문화 키워드
  const cultureKeywords = [
    'museum', 'gallery', 'exhibition', 'art', 'cultural center',
    'theater', 'opera house', 'concert hall', 'philharmonic',
    '박물관', '미술관', '갤러리', '전시관', '문화센터', '극장', '오페라하우스'
  ];
  
  // 우선순위 매칭 (건축 키워드가 가장 우선)
  if (architectureKeywords.some(keyword => normalizedName.includes(keyword))) {
    return {
      type: 'architecture_engineer',
      name: '🏗️ 건축 & 공학 전문가',
      confidence: 0.9,
      reasoning: ['현대 건축물 또는 공학 구조물 감지']
    };
  }
  
  if (royalKeywords.some(keyword => normalizedName.includes(keyword))) {
    return {
      type: 'royal_heritage',
      name: '🏰 왕실 유산 전문가',
      confidence: 0.9,
      reasoning: ['왕실 또는 귀족 관련 시설 감지']
    };
  }
  
  if (sacredKeywords.some(keyword => normalizedName.includes(keyword))) {
    return {
      type: 'sacred_spiritual',
      name: '⛪ 성지 & 영성 전문가',
      confidence: 0.9,
      reasoning: ['종교적 또는 영성적 장소 감지']
    };
  }
  
  if (cultureKeywords.some(keyword => normalizedName.includes(keyword))) {
    return {
      type: 'arts_culture',
      name: '🎨 예술 & 문화 전문가',
      confidence: 0.85,
      reasoning: ['예술 또는 문화 시설 감지']
    };
  }
  
  if (natureKeywords.some(keyword => normalizedName.includes(keyword))) {
    return {
      type: 'nature_ecology',
      name: '🌿 자연 & 생태 전문가',
      confidence: 0.8,
      reasoning: ['자연 환경 또는 생태 관련 장소 감지']
    };
  }
  
  // 기본값
  return {
    type: 'arts_culture',
    name: '🎨 예술 & 문화 전문가',
    confidence: 0.6,
    reasoning: ['명확한 카테고리 없음', '범용 문화 전문가 적용']
  };
}

// 기존 시스템 시뮬레이션 (한국어 토큰 방식)
function classifyByOldSystem(locationName) {
  const normalizedName = locationName.toLowerCase();
  
  // 기존 시스템의 문제점: '산' 키워드가 자연으로 분류
  if (normalizedName.includes('산')) {
    return {
      type: 'nature_ecology',
      name: '🌿 자연/생태 전문가',
      confidence: 0.6,
      reasoning: ['산 키워드 감지로 자연 전문가 분류 (잘못된 분류)']
    };
  }
  
  // 기존 시스템은 '타워' 키워드 처리가 부족했음
  if (normalizedName.includes('타워') || normalizedName.includes('tower')) {
    return {
      type: 'architecture_engineer',
      name: '🏗️ 근현대 건축 전문가',
      confidence: 0.85,
      reasoning: ['타워 키워드 감지']
    };
  }
  
  return {
    type: 'arts_culture',
    name: '🎨 예술/문화 전문가',
    confidence: 0.6,
    reasoning: ['기본값']
  };
}

// 테스트 케이스
const testCases = [
  { name: '남산타워', expected: 'architecture_engineer', description: '핵심 테스트 - 타워는 건축 전문가여야 함' },
  { name: 'N서울타워', expected: 'architecture_engineer', description: '서울 타워 변형' },
  { name: '서울타워', expected: 'architecture_engineer', description: '타워 키워드' },
  { name: '롯데월드타워', expected: 'architecture_engineer', description: '현대 건축물' },
  { name: '63빌딩', expected: 'architecture_engineer', description: '빌딩 키워드' },
  { name: '경복궁', expected: 'royal_heritage', description: '궁궐 키워드' },
  { name: '불국사', expected: 'sacred_spiritual', description: '절 키워드' },
  { name: '한라산', expected: 'nature_ecology', description: '산 키워드 (자연이 맞음)' },
  { name: '국립중앙박물관', expected: 'arts_culture', description: '박물관 키워드' }
];

console.log('\n🔍 새로운 Universal Persona System 테스트\n');

let newSystemPassed = 0;
let oldSystemPassed = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
  console.log(`📍 테스트: "${testCase.name}" (${testCase.description})`);
  
  // 새로운 시스템 테스트
  const newResult = classifyLocationByRules(testCase.name);
  const newCorrect = newResult.type === testCase.expected;
  
  // 기존 시스템 시뮬레이션
  const oldResult = classifyByOldSystem(testCase.name);
  const oldCorrect = oldResult.type === testCase.expected;
  
  console.log(`   🆕 새 시스템: ${newResult.name} ${newCorrect ? '✅' : '❌'}`);
  console.log(`   🔄 기존시스템: ${oldResult.name} ${oldCorrect ? '✅' : '❌'}`);
  
  if (newCorrect) newSystemPassed++;
  if (oldCorrect) oldSystemPassed++;
  
  console.log('');
}

console.log('==========================================');
console.log('🏆 테스트 결과 비교:');
console.log(`   🆕 새 시스템: ${newSystemPassed}/${totalTests} 통과 (${Math.round(newSystemPassed/totalTests*100)}%)`);
console.log(`   🔄 기존시스템: ${oldSystemPassed}/${totalTests} 통과 (${Math.round(oldSystemPassed/totalTests*100)}%)`);

// 남산타워 특별 검증
console.log('\n🎯 남산타워 분류 검증:');
const namsanNew = classifyLocationByRules('남산타워');
const namsanOld = classifyByOldSystem('남산타워');

console.log(`   🔄 기존 시스템: ${namsanOld.name}`);
console.log(`      - 문제: "산" 키워드 때문에 자연 전문가로 잘못 분류`);
console.log(`   🆕 새 시스템: ${namsanNew.name}`);
console.log(`      - 해결: "타워" 키워드 우선 처리로 건축 전문가 올바른 분류`);

if (namsanNew.type === 'architecture_engineer') {
  console.log('\n🎉 ✅ 남산타워 분류 문제 해결 완료!');
  console.log('   - 기존: 🌿 자연/생태 전문가 (잘못됨)');
  console.log('   - 신규: 🏗️건축 & 공학 전문가 (정확함)');
} else {
  console.log('\n❌ 남산타워 분류 문제 미해결');
}

if (newSystemPassed > oldSystemPassed) {
  console.log(`\n🚀 개선 성과: ${newSystemPassed - oldSystemPassed}개 테스트 케이스 추가 통과!`);
  console.log('✅ Universal Persona System이 기존 시스템보다 우수합니다.');
} else if (newSystemPassed === oldSystemPassed) {
  console.log('\n📊 동일한 성능이지만 새 시스템은 글로벌 확장성을 제공합니다.');
} else {
  console.log('\n⚠️ 추가 개선이 필요합니다.');
}