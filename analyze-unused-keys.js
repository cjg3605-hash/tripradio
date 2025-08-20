const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 사용되지 않는 번역 키 분석 시작...');

// 1. 모든 한국어 번역 키 추출
const translationsPath = 'C:/GUIDEAI/public/locales/translations.json';
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

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

const koreanKeys = extractKeys(translations.ko);
console.log('📊 총 한국어 번역 키 수:', koreanKeys.length);

// 2. 키 사용 검색 함수
function searchKeyUsage(key) {
  const searchPatterns = [
    `t('${key}')`,
    `t("${key}")`,
    `t(\`${key}\`)`,
    `audioT('${key}')`,
    `docentT('${key}')`,
    `tourRadioT('${key}')`,
    `travelRadioT('${key}')`,
    // 부분 키 매칭을 위한 패턴들
    `'${key}'`,
    `"${key}"`,
    `\`${key}\``,
  ];
  
  for (const pattern of searchPatterns) {
    try {
      const result = execSync(`rg --quiet "${pattern}" C:/GUIDEAI/src/`, { encoding: 'utf8' });
      return true; // 사용됨
    } catch (error) {
      // 찾지 못함, 다음 패턴 시도
    }
  }
  
  return false; // 사용되지 않음
}

// 3. 샘플 키들로 테스트
console.log('🧪 샘플 키 사용 검사...');
const sampleKeys = koreanKeys.slice(0, 10);

for (const key of sampleKeys) {
  const isUsed = searchKeyUsage(key);
  console.log(`${isUsed ? '✅' : '❌'} ${key}`);
}

console.log('✅ 샘플 테스트 완료');