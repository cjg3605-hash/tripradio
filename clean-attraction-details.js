const fs = require('fs');

console.log('🧹 attractionDetails 정리 시작...');

// 번역 파일 읽기
const translationPath = 'public/locales/translations.json';
const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));

// 모든 언어의 attractionDetails를 빈 객체로 설정
const languages = ['ko', 'en', 'ja', 'zh', 'es'];
let totalCleaned = 0;

languages.forEach(lang => {
  if (translations[lang] && translations[lang].home && translations[lang].home.attractionDetails) {
    const originalCount = Object.keys(translations[lang].home.attractionDetails).length;
    
    // attractionDetails를 빈 객체로 만들기
    translations[lang].home.attractionDetails = {};
    
    console.log(`✅ ${lang}: ${originalCount}개 키 정리 완료`);
    totalCleaned += originalCount;
  } else {
    console.log(`⚠️  ${lang}: attractionDetails 섹션을 찾을 수 없음`);
  }
});

// 수정된 파일 저장
fs.writeFileSync(translationPath, JSON.stringify(translations, null, 2), 'utf8');

console.log('📊 정리 결과:');
console.log(`   총 정리된 키 수: ${totalCleaned}개`);
console.log(`   처리된 언어: ${languages.length}개`);
console.log('✅ attractionDetails 정리 완료!');

console.log('\n🔍 정리 후 확인...');
languages.forEach(lang => {
  const currentCount = Object.keys(translations[lang].home.attractionDetails).length;
  console.log(`   ${lang}: ${currentCount}개 키 남음`);
});

console.log('\n✨ 모든 작업 완료!');