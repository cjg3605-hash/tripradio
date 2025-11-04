const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, 'public', 'locales', 'translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

console.log('🔄 번역 키 동기화 시작...\n');

// 모든 키 추출 함수
function extractKeys(obj, prefix = '') {
  let keys = {};

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(keys, extractKeys(obj[key], fullKey));
    } else {
      keys[fullKey] = obj[key];
    }
  }

  return keys;
}

// 객체에 키 설정 함수
function setNestedKey(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

// 한국어 키 추출 (기준)
const koKeys = extractKeys(translations.ko);
console.log(`📊 한국어 키: ${Object.keys(koKeys).length}개\n`);

// 각 언어별로 누락된 키 찾아서 추가
const languagesToSync = ['ja', 'zh', 'es'];
const placeholders = {
  ja: '[日本語訳が必要]',
  zh: '[需要中文翻译]',
  es: '[Se necesita traducción al español]'
};

let totalAdded = 0;

languagesToSync.forEach(lang => {
  console.log(`🌐 ${lang.toUpperCase()} 동기화 중...`);

  const langKeys = extractKeys(translations[lang] || {});
  const koKeySet = new Set(Object.keys(koKeys));
  const langKeySet = new Set(Object.keys(langKeys));

  const missingKeys = [...koKeySet].filter(k => !langKeySet.has(k));

  console.log(`   현재 키: ${langKeySet.size}개`);
  console.log(`   누락 키: ${missingKeys.length}개`);

  if (missingKeys.length > 0) {
    // 누락된 키 추가
    missingKeys.forEach(key => {
      const koValue = koKeys[key];
      const placeholder = placeholders[lang];

      // 한국어 값이 문자열인 경우, 플레이스홀더 추가
      let value;
      if (typeof koValue === 'string') {
        value = `${koValue} ${placeholder}`;
      } else {
        value = koValue;
      }

      setNestedKey(translations[lang], key, value);
    });

    console.log(`   ✅ ${missingKeys.length}개 키 추가 완료`);
    totalAdded += missingKeys.length;

    // 샘플 출력
    console.log(`   📝 추가된 키 샘플 (처음 3개):`);
    missingKeys.slice(0, 3).forEach(key => {
      console.log(`      - ${key}`);
    });
  } else {
    console.log(`   ✅ 모든 키가 존재합니다`);
  }

  console.log('');
});

// 결과 저장
if (totalAdded > 0) {
  fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf8');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 번역 키 동기화 완료!\n');
  console.log(`✅ 총 ${totalAdded}개 키 추가됨`);
  console.log(`📄 파일 저장됨: ${translationsPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 최종 통계
  console.log('📊 최종 키 개수:\n');
  ['ko', 'en', 'ja', 'zh', 'es'].forEach(lang => {
    const keys = extractKeys(translations[lang]);
    console.log(`   ${lang}: ${Object.keys(keys).length}개`);
  });
} else {
  console.log('✅ 모든 언어가 이미 동기화되어 있습니다.\n');
}
