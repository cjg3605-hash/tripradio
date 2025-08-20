const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 사용되지 않는 번역 키 분석 시작...');

// 1. 모든 한국어 번역 키 추출
const translationsPath = 'public/locales/translations.json';
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

// 2. 키 사용 검색 함수 (Windows 호환)
function searchKeyUsage(key) {
  // 특수 문자 이스케이프 처리
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  try {
    // findstr을 사용해서 검색 (Windows 기본 도구)
    const searchPatterns = [
      `t('${key}')`,
      `t("${key}")`,
      `audioT('${key}')`,
      `docentT('${key}')`,
      `tourRadioT('${key}')`,
      `travelRadioT('${key}')`,
      // 부분 키도 체크
      `'${key}'`,
      `"${key}"`
    ];
    
    for (const pattern of searchPatterns) {
      try {
        const result = execSync(`findstr /R /S "${pattern.replace(/[()]/g, '.')}" src\\*.tsx src\\*.ts src\\*.js`, 
          { encoding: 'utf8', stdio: 'pipe' });
        if (result.trim()) {
          return true; // 사용됨
        }
      } catch (error) {
        // 찾지 못함, 다음 패턴 시도
      }
    }
    
    return false; // 사용되지 않음
    
  } catch (error) {
    console.error(`❌ 키 검색 오류 [${key}]:`, error.message);
    return true; // 오류 시 안전하게 사용됨으로 간주
  }
}

// 3. 카테고리별 분석
const categories = {
  header: koreanKeys.filter(key => key.startsWith('header.')),
  footer: koreanKeys.filter(key => key.startsWith('footer.')),
  guide: koreanKeys.filter(key => key.startsWith('guide.')),
  audioGuide: koreanKeys.filter(key => key.startsWith('audioGuide.')),
  docent: koreanKeys.filter(key => key.startsWith('docent.')),
  tourRadio: koreanKeys.filter(key => key.startsWith('tourRadio.')),
  travelRadio: koreanKeys.filter(key => key.startsWith('travelRadio.')),
  common: koreanKeys.filter(key => key.startsWith('common.')),
  others: koreanKeys.filter(key => !['header.', 'footer.', 'guide.', 'audioGuide.', 'docent.', 'tourRadio.', 'travelRadio.', 'common.'].some(prefix => key.startsWith(prefix)))
};

console.log('📋 카테고리별 키 분포:');
Object.entries(categories).forEach(([category, keys]) => {
  console.log(`   ${category}: ${keys.length}개`);
});

// 4. 샘플 분석 (처음 50개 키로 테스트)
console.log('\n🧪 샘플 키 분석 (처음 50개)...');
const sampleKeys = koreanKeys.slice(0, 50);
const unusedKeys = [];

for (let i = 0; i < sampleKeys.length; i++) {
  const key = sampleKeys[i];
  const isUsed = searchKeyUsage(key);
  
  console.log(`${isUsed ? '✅' : '❌'} ${key}`);
  
  if (!isUsed) {
    unusedKeys.push(key);
  }
  
  // 진행률 표시
  if ((i + 1) % 10 === 0) {
    console.log(`   진행률: ${i + 1}/${sampleKeys.length}`);
  }
}

console.log('\n📊 샘플 분석 결과:');
console.log(`   총 샘플 키: ${sampleKeys.length}개`);
console.log(`   사용되지 않는 키: ${unusedKeys.length}개`);
console.log(`   미사용률: ${(unusedKeys.length / sampleKeys.length * 100).toFixed(1)}%`);

if (unusedKeys.length > 0) {
  console.log('\n❌ 사용되지 않는 것으로 보이는 키들:');
  unusedKeys.forEach(key => console.log(`   - ${key}`));
}

console.log('\n✅ 샘플 분석 완료');