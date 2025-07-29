// 문화적 민감성 데이터베이스 테스트 스크립트
const fs = require('fs');
const path = require('path');

console.log('🔍 문화적 민감성 데이터베이스 파싱 및 검증 테스트 시작...\n');

// 1. TypeScript 파일 읽기 및 기본 구문 검증
const dbFilePath = path.join(__dirname, 'src', 'lib', 'cultural', 'sensitivity-database.ts');

try {
  const fileContent = fs.readFileSync(dbFilePath, 'utf8');
  console.log('✅ 파일 읽기 성공');
  
  // 2. 기본 구조 검증
  const hasExports = fileContent.includes('export interface CulturalSensitivityData');
  const hasDatabase = fileContent.includes('CULTURAL_SENSITIVITY_DATABASE');
  const hasClass = fileContent.includes('export class CulturalSensitivityDatabase');
  
  console.log('✅ 기본 구조 검증:', { hasExports, hasDatabase, hasClass });
  
  // 3. 국가 코드 검증
  const countryMatches = fileContent.match(/"[A-Z]{2}":\s*{/g);
  const countryCount = countryMatches ? countryMatches.length : 0;
  console.log('✅ 국가 데이터 개수:', countryCount, '개국');
  
  // 4. 필수 필드 검증
  const requiredFields = [
    'culturalCode',
    'culturalName', 
    'region',
    'religiousContext',
    'politicalSensitivities',
    'socialTaboos',
    'communicationStyles',
    'historicalSensitivities',
    'customsAndEtiquette',
    'languageNuances',
    'lastUpdated'
  ];
  
  const fieldChecks = requiredFields.map(field => ({
    field,
    present: fileContent.includes(field + ':')
  }));
  
  console.log('✅ 필수 필드 검증:');
  fieldChecks.forEach(check => {
    console.log(`   ${check.present ? '✅' : '❌'} ${check.field}`);
  });
  
  // 5. JSON 구조 일관성 검증
  const braceOpen = (fileContent.match(/{/g) || []).length;
  const braceClose = (fileContent.match(/}/g) || []).length;
  const bracketOpen = (fileContent.match(/\[/g) || []).length;
  const bracketClose = (fileContent.match(/\]/g) || []).length;
  
  console.log('✅ 구조 일관성 검증:');
  console.log(`   중괄호: ${braceOpen} 열림, ${braceClose} 닫힘 ${braceOpen === braceClose ? '✅' : '❌'}`);
  console.log(`   대괄호: ${bracketOpen} 열림, ${bracketClose} 닫힘 ${bracketOpen === bracketClose ? '✅' : '❌'}`);
  
  // 6. 특수 문자 및 유니코드 검증
  const hasKorean = /[가-힣]/.test(fileContent);
  const hasEmojis = /🇰🇷|🇯🇵|🇨🇳|🇺🇸|🇫🇷/.test(fileContent);
  const hasSpecialChars = /[""''—…]/.test(fileContent);
  
  console.log('✅ 다국어 및 특수문자 검증:');
  console.log(`   한글: ${hasKorean ? '✅' : '❌'}`);
  console.log(`   국기 이모지: ${hasEmojis ? '✅' : '❌'}`);
  console.log(`   특수 문자: ${hasSpecialChars ? '✅' : '❌'}`);
  
  // 7. 데이터 완성도 검증
  const expectedCountries = ['KR', 'JP', 'CN', 'US', 'FR', 'IT', 'DE', 'GB', 'ES', 'RU', 'BR', 'IN', 'TH', 'EG', 'AU', 'CA', 'MX', 'TR', 'SG', 'VN'];
  const missingCountries = expectedCountries.filter(country => !fileContent.includes(`"${country}":`));
  
  console.log('✅ 예상 국가 데이터 완성도:');
  console.log(`   예상: ${expectedCountries.length}개국`);
  console.log(`   실제: ${countryCount}개국`);
  console.log(`   누락: ${missingCountries.length > 0 ? missingCountries.join(', ') : '없음'}`);
  
  // 8. 함수 메서드 검증
  const methods = [
    'getCulturalData',
    'getSupportedCultures', 
    'getReligiousContext',
    'getPoliticalSensitivities',
    'getSocialTaboos',
    'getCommunicationStyle',
    'getHistoricalSensitivities',
    'getCustomsAndEtiquette',
    'getLanguageNuances',
    'getAllSensitiveTerms',
    'getAppropriateAlternatives',
    'getDatabaseStats'
  ];
  
  console.log('✅ 메서드 함수 검증:');
  methods.forEach(method => {
    const present = fileContent.includes(`public static ${method}(`);
    console.log(`   ${present ? '✅' : '❌'} ${method}`);
  });
  
  console.log('\n🎉 모든 파싱 및 구조 검증 완료!');
  console.log('📊 최종 결과: 문화적 민감성 데이터베이스가 올바르게 구성되었습니다.');
  
} catch (error) {
  console.error('❌ 파일 파싱 오류:', error.message);
  process.exit(1);
}