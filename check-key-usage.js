const fs = require('fs');
const { execSync } = require('child_process');

// 의심되는 사용되지 않는 키들 (이전 분석에서 ❌로 표시된 것들)
const suspiciousKeys = [
  'header.title',
  'header.login', 
  'header.logout',
  'header.settings',
  'navigation.guides',
  'navigation.favorites', 
  'navigation.about',
  'navigation.contact',
  'home.title',
  'home.description',
  'home.attractionDetails.경복궁',
  'home.attractionDetails.남산타워',
  'home.attractionDetails.명동',
  'home.attractionDetails.해운대해수욕장',
  'home.attractionDetails.감천문화마을',
  'home.attractionDetails.자갈치시장',
  'home.attractionDetails.한라산',
  'home.attractionDetails.성산일출봉',
  'home.attractionDetails.중문관광단지',
  'home.attractionDetails.불국사',
  'home.attractionDetails.석굴암',
  'home.attractionDetails.첨성대',
  'home.attractionDetails.에펠탑',
  'home.attractionDetails.콜로세움'
];

console.log('🔍 의심되는 미사용 키 확인 중...');
console.log(`📊 검사할 키 수: ${suspiciousKeys.length}개\n`);

const definitivelyUnused = [];

for (const key of suspiciousKeys) {
  console.log(`🔎 검사 중: ${key}`);
  
  try {
    // Windows findstr을 사용해서 검색
    const searchCommands = [
      `findstr /R /S /C:"${key}" src`,
      `findstr /R /S /C:"'${key}'" src`,  
      `findstr /R /S /C:"\\"${key}\\"" src`,
      `findstr /R /S /C:"t('${key}')" src`,
      `findstr /R /S /C:"t(\\"${key}\\")" src`
    ];
    
    let found = false;
    
    for (const cmd of searchCommands) {
      try {
        const result = execSync(cmd, { 
          encoding: 'utf8', 
          stdio: 'pipe',
          timeout: 5000 
        });
        
        if (result && result.trim()) {
          console.log(`   ✅ 발견됨: ${result.split('\n')[0].substring(0, 80)}...`);
          found = true;
          break;
        }
      } catch (error) {
        // 명령 실패는 정상 (찾지 못한 것)
      }
    }
    
    if (!found) {
      console.log(`   ❌ 사용되지 않음`);
      definitivelyUnused.push(key);
    }
    
  } catch (error) {
    console.log(`   ⚠️  검사 오류 (안전하게 보존): ${error.message.substring(0, 50)}`);
  }
  
  console.log(''); // 공백줄
}

console.log('📊 최종 분석 결과:');
console.log(`   검사한 키: ${suspiciousKeys.length}개`);
console.log(`   확실히 미사용: ${definitivelyUnused.length}개`);
console.log(`   안전하게 보존할 키: ${suspiciousKeys.length - definitivelyUnused.length}개`);

if (definitivelyUnused.length > 0) {
  console.log('\n❌ 확실히 사용되지 않는 키들:');
  definitivelyUnused.forEach(key => {
    console.log(`   "${key}"`);
  });
  
  console.log('\n⚠️  주의사항:');
  console.log('   - 이 키들을 삭제하기 전에 다시 한 번 확인하세요');
  console.log('   - 동적으로 생성되는 키일 수도 있습니다');
  console.log('   - 미래에 사용될 예정인 키일 수도 있습니다');
} else {
  console.log('\n✅ 모든 의심 키들이 실제로는 사용되고 있습니다!');
}

console.log('\n✅ 분석 완료');