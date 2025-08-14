const fs = require('fs');
const path = require('path');

// translations.json 파일 읽기
const translationsPath = path.join(__dirname, 'public/locales/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 체크할 페이지들
const pagesToCheck = [
  'src/app/docent/page.tsx',
  'src/app/travel/page.tsx', 
  'src/app/free-travel/page.tsx',
  'src/app/tour-radio/page.tsx',
  'src/app/travel-radio/page.tsx'
];

// 번역키 추출 함수
function extractTranslationKeys(content) {
  // t('key'), t("key"), t(`key`) 패턴 찾기
  const regex = /t\(['"`]([^'"`]+)['"`]\)/g;
  const keys = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  
  // useTranslations('namespace') 패턴에서 네임스페이스 추출
  const namespaceRegex = /useTranslations\(['"`]([^'"`]+)['"`]\)/g;
  let namespaceMatch;
  const namespaces = [];
  
  while ((namespaceMatch = namespaceRegex.exec(content)) !== null) {
    namespaces.push(namespaceMatch[1]);
  }
  
  return { keys, namespaces };
}

// 번역키가 존재하는지 확인하는 함수
function checkKeyExists(keyPath, namespace, translations) {
  const fullPath = namespace ? `${namespace}.${keyPath}` : keyPath;
  const keys = fullPath.split('.');
  
  let current = translations.ko; // 한국어 기준으로 체크
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return true;
}

console.log('🔍 번역키 누락 검사 시작...\n');

let totalMissing = 0;

pagesToCheck.forEach(pageFile => {
  try {
    const content = fs.readFileSync(path.join(__dirname, pageFile), 'utf8');
    const { keys, namespaces } = extractTranslationKeys(content);
    
    console.log(`📄 ${pageFile}`);
    console.log(`   네임스페이스: ${namespaces.join(', ') || '없음'}`);
    console.log(`   번역키 개수: ${keys.length}`);
    
    const missingKeys = [];
    
    keys.forEach(key => {
      // 각 네임스페이스에 대해 확인
      if (namespaces.length > 0) {
        let found = false;
        namespaces.forEach(namespace => {
          if (checkKeyExists(key, namespace, translations)) {
            found = true;
          }
        });
        if (!found) {
          missingKeys.push(key);
        }
      } else {
        // 네임스페이스가 없는 경우 직접 확인
        if (!checkKeyExists(key, null, translations)) {
          missingKeys.push(key);
        }
      }
    });
    
    if (missingKeys.length > 0) {
      console.log(`   ❌ 누락된 키 (${missingKeys.length}개):`);
      missingKeys.forEach(key => {
        console.log(`      - ${key}`);
      });
      totalMissing += missingKeys.length;
    } else {
      console.log(`   ✅ 모든 번역키 존재`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`   ❌ 파일 읽기 오류: ${error.message}\n`);
  }
});

console.log(`📊 총 누락된 번역키: ${totalMissing}개`);

if (totalMissing > 0) {
  console.log('\n💡 다음 단계:');
  console.log('1. translations.json에 누락된 키 추가');
  console.log('2. 모든 언어(ko, en, ja, zh, es)에 대응하는 번역 작성');
  console.log('3. 빌드 재실행으로 검증');
} else {
  console.log('\n🎉 모든 번역키가 정상적으로 존재합니다!');
}