const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 전체 미사용 번역 키 분석 시작...');

// 1. 번역 파일에서 모든 키 추출
const translations = JSON.parse(fs.readFileSync('public/locales/translations.json', 'utf8'));

function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const allKeys = extractKeys(translations.ko);
console.log('📊 총 키 개수:', allKeys.keys);

// 2. 간단한 휴리스틱으로 의심스러운 키 찾기
function isLikelySuspicious(key) {
  const suspiciousPatterns = [
    /^home\.attractionDetails\./,   // 개별 명소 상세정보
    /^navigation\.(guides|favorites|about|contact)$/,  // 사용하지 않는 네비게이션
    /^header\.(title|login|logout|settings)$/,  // 사용하지 않는 헤더
    /^home\.(title|description)$/,  // 사용하지 않는 홈 필드
    /^guide\..*\.unused/,           // unused 표시가 있는 키들
    /^test\./,                      // 테스트용 키들
    /^temp\./,                      // 임시 키들
    /^deprecated\./,                // 사용 중단된 키들
    /^old\./,                       // 오래된 키들
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(key));
}

const suspiciousKeys = allKeys.filter(isLikelySuspicious);
console.log('🤔 의심스러운 키 수:', suspiciousKeys.length);

// 3. 빠른 검색으로 확실히 미사용인 키만 찾기
function quickSearchKey(key) {
  // 키의 마지막 부분만 검색 (더 포괄적)
  const keyParts = key.split('.');
  const lastPart = keyParts[keyParts.length - 1];
  const secondToLast = keyParts.length > 1 ? keyParts[keyParts.length - 2] : '';
  
  const searchTerms = [
    key,                    // 전체 키
    lastPart,              // 마지막 부분
    `${secondToLast}.${lastPart}`,  // 마지막 두 부분
    `'${key}'`,            // 따옴표로 감싼 전체 키
    `"${key}"`             // 쌍따옴표로 감싼 전체 키
  ].filter(Boolean);
  
  for (const term of searchTerms) {
    try {
      const result = execSync(`findstr /R /S /C:"${term}" src`, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 3000 
      });
      if (result && result.trim()) {
        return true;  // 사용됨
      }
    } catch (error) {
      // 찾지 못함
    }
  }
  
  return false;  // 사용되지 않음
}

console.log('\n🔍 의심스러운 키들 검증 중...');
const confirmedUnused = [];

let processed = 0;
for (const key of suspiciousKeys) {
  const isUsed = quickSearchKey(key);
  
  if (!isUsed) {
    confirmedUnused.push(key);
  }
  
  processed++;
  if (processed % 5 === 0) {
    console.log(`   진행률: ${processed}/${suspiciousKeys.length}`);
  }
}

// 4. 추가로 일부 랜덤 키들도 체크 (품질 검증)
console.log('\n🎲 랜덤 샘플링으로 추가 미사용 키 찾기...');
const randomKeys = [];
for (let i = 0; i < 50; i++) {
  const randomIndex = Math.floor(Math.random() * allKeys.length);
  const key = allKeys[randomIndex];
  if (!suspiciousKeys.includes(key)) {
    randomKeys.push(key);
  }
}

for (const key of randomKeys.slice(0, 20)) {  // 20개만 체크
  const isUsed = quickSearchKey(key);
  if (!isUsed) {
    confirmedUnused.push(key);
  }
}

// 5. 최종 결과 리포트
console.log('\n📊 최종 분석 결과:');
console.log(`   전체 키 수: ${allKeys.length}개`);
console.log(`   의심스러운 키: ${suspiciousKeys.length}개`);
console.log(`   확인된 미사용 키: ${confirmedUnused.length}개`);
console.log(`   미사용 비율: ${(confirmedUnused.length / allKeys.length * 100).toFixed(2)}%`);

if (confirmedUnused.length > 0) {
  console.log('\n❌ 확실히 사용되지 않는 키들:');
  
  // 카테고리별로 정리
  const categories = {};
  confirmedUnused.forEach(key => {
    const category = key.split('.')[0];
    if (!categories[category]) categories[category] = [];
    categories[category].push(key);
  });
  
  Object.entries(categories).forEach(([category, keys]) => {
    console.log(`\n   📁 ${category} (${keys.length}개):`);
    keys.slice(0, 10).forEach(key => console.log(`      - ${key}`));
    if (keys.length > 10) {
      console.log(`      ... 그 외 ${keys.length - 10}개`);
    }
  });
  
  console.log('\n⚠️  경고:');
  console.log('   - 동적으로 생성되는 키는 감지하지 못할 수 있습니다');
  console.log('   - 삭제하기 전에 반드시 다시 확인하세요');
  console.log('   - 백업을 만든 후 진행하세요');
}

console.log('\n✅ 분석 완료!');