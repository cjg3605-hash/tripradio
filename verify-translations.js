const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, 'public', 'locales', 'translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

const requiredLanguages = ['ko', 'en', 'ja', 'zh', 'es'];
const results = {
  success: true,
  languages: {},
  missing: [],
  issues: []
};

console.log('🌐 번역 키 검증 시작...\n');

// 1. 언어 존재 확인
console.log('📋 1단계: 5개 언어 존재 확인');
requiredLanguages.forEach(lang => {
  const exists = translations.hasOwnProperty(lang);
  console.log(`   ${exists ? '✅' : '❌'} ${lang}: ${exists ? '존재' : '없음'}`);

  if (!exists) {
    results.success = false;
    results.missing.push(lang);
  } else {
    results.languages[lang] = {
      exists: true,
      keyCount: 0,
      sampleKeys: []
    };
  }
});

console.log('');

// 2. 각 언어별 키 개수 확인
console.log('📊 2단계: 언어별 키 개수 확인');

function countKeys(obj, prefix = '') {
  let count = 0;
  const keys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const result = countKeys(obj[key], fullKey);
      count += result.count;
      keys.push(...result.keys);
    } else {
      count++;
      keys.push(fullKey);
    }
  }

  return { count, keys };
}

const keysByLang = {};
requiredLanguages.forEach(lang => {
  if (translations[lang]) {
    const { count, keys } = countKeys(translations[lang]);
    keysByLang[lang] = { count, keys };
    results.languages[lang].keyCount = count;
    results.languages[lang].sampleKeys = keys.slice(0, 5);

    console.log(`   ${lang}: ${count}개 키`);
  }
});

console.log('');

// 3. 키 일관성 확인 (ko를 기준으로)
if (translations.ko) {
  console.log('🔍 3단계: 키 구조 일관성 검증 (한국어 기준)');

  const koKeys = new Set(keysByLang.ko.keys);
  const baseCount = koKeys.size;

  requiredLanguages.forEach(lang => {
    if (lang === 'ko' || !translations[lang]) return;

    const langKeys = new Set(keysByLang[lang].keys);
    const missingInLang = [...koKeys].filter(k => !langKeys.has(k));
    const extraInLang = [...langKeys].filter(k => !koKeys.has(k));

    if (missingInLang.length > 0 || extraInLang.length > 0) {
      console.log(`   ⚠️  ${lang}: 차이 발견`);
      if (missingInLang.length > 0) {
        console.log(`      - 누락: ${missingInLang.length}개 (예: ${missingInLang.slice(0, 3).join(', ')})`);
      }
      if (extraInLang.length > 0) {
        console.log(`      - 추가: ${extraInLang.length}개 (예: ${extraInLang.slice(0, 3).join(', ')})`);
      }

      results.issues.push({
        language: lang,
        missing: missingInLang.length,
        extra: extraInLang.length
      });
    } else {
      console.log(`   ✅ ${lang}: 완벽 일치 (${langKeys.size}개 키)`);
    }
  });
}

console.log('');

// 4. 샘플 번역 내용 확인
console.log('📝 4단계: 샘플 번역 내용');
const sampleKey = 'header.language';
requiredLanguages.forEach(lang => {
  if (translations[lang]?.header?.language) {
    console.log(`   ${lang}: "${translations[lang].header.language}"`);
  }
});

console.log('');

// 최종 결과
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏆 최종 검증 결과\n');

if (results.missing.length > 0) {
  console.log(`❌ 누락된 언어: ${results.missing.join(', ')}`);
  results.success = false;
}

if (results.issues.length > 0) {
  console.log(`⚠️  불일치 발견: ${results.issues.length}개 언어`);
  results.success = false;
}

if (results.success) {
  console.log('✅ 모든 언어 완벽 검증!');
  console.log(`   - 5개 언어 모두 존재`);
  console.log(`   - 키 구조 일관성 확인`);
} else {
  console.log('❌ 번역 파일에 문제가 있습니다');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// JSON 결과 출력 (자동화 도구용)
console.log('📊 상세 통계:');
console.log(JSON.stringify(results, null, 2));

process.exit(results.success ? 0 : 1);
