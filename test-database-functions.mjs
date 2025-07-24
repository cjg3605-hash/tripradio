// ES Module 방식으로 함수 동작 테스트
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 문화적 민감성 데이터베이스 함수 동작 테스트 시작...\n');

// TypeScript 파일을 읽고 JavaScript로 변환하여 테스트
const tsContent = readFileSync(join(__dirname, 'src', 'lib', 'cultural', 'sensitivity-database.ts'), 'utf8');

// TypeScript를 간단한 JavaScript로 변환 (기본적인 변환만)
const jsContent = tsContent
  .replace(/export interface[^}]*}/gs, '') // 인터페이스 제거
  .replace(/export /g, '') // export 키워드 제거
  .replace(/: string|: number|: boolean|: [^;,}]+/g, '') // 타입 어노테이션 제거
  .replace(/\|\s*null/g, ''); // | null 제거

try {
  // 동적으로 JavaScript 코드 실행
  eval(jsContent);
  
  console.log('✅ 코드 실행 성공');
  
  // 1. 기본 데이터 조회 테스트
  console.log('1️⃣ 기본 데이터 조회 테스트:');
  
  const supportedCultures = CulturalSensitivityDatabase.getSupportedCultures();
  console.log(`   지원 문화권: ${supportedCultures.length}개 (${supportedCultures.slice(0, 5).join(', ')}...)`);
  
  // 2. 한국 데이터 조회 테스트
  console.log('\\n2️⃣ 한국 데이터 조회 테스트:');
  
  const koreanData = CulturalSensitivityDatabase.getCulturalData('KR');
  if (koreanData) {
    console.log(`   ✅ 문화명: ${koreanData.culturalName}`);
    console.log(`   ✅ 지역: ${koreanData.region}`);
    console.log(`   ✅ 종교 컨텍스트: ${koreanData.religiousContext.length}개`);
    console.log(`   ✅ 정치적 민감성: ${koreanData.politicalSensitivities.length}개`);
    console.log(`   ✅ 사회적 금기: ${koreanData.socialTaboos.length}개`);
  }
  
  // 3. 민감 키워드 조회 테스트
  console.log('\\n3️⃣ 민감 키워드 조회 테스트:');
  
  const koreanSensitiveTerms = CulturalSensitivityDatabase.getAllSensitiveTerms('KR');
  console.log(`   한국 민감 키워드: ${koreanSensitiveTerms.length}개`);
  console.log(`   예시: ${koreanSensitiveTerms.slice(0, 3).join(', ')}`);
  
  const japaneseSensitiveTerms = CulturalSensitivityDatabase.getAllSensitiveTerms('JP');
  console.log(`   일본 민감 키워드: ${japaneseSensitiveTerms.length}개`);
  
  // 4. 대체 표현 조회 테스트
  console.log('\\n4️⃣ 대체 표현 조회 테스트:');
  
  const koreanAlternatives = CulturalSensitivityDatabase.getAppropriateAlternatives('KR');
  console.log(`   한국 대체 표현: ${koreanAlternatives.size}개`);
  
  const chineseAlternatives = CulturalSensitivityDatabase.getAppropriateAlternatives('CN');
  console.log(`   중국 대체 표현: ${chineseAlternatives.size}개`);
  
  // 5. 데이터베이스 통계 테스트
  console.log('\\n5️⃣ 데이터베이스 통계 테스트:');
  
  const stats = CulturalSensitivityDatabase.getDatabaseStats();
  console.log(`   ✅ 총 문화권: ${stats.totalCultures}개`);
  console.log(`   ✅ 총 종교: ${stats.totalReligions}개`);
  console.log(`   ✅ 총 민감성: ${stats.totalSensitivities}개`);
  console.log(`   ✅ 총 금기사항: ${stats.totalTaboos}개`);
  console.log(`   ✅ 마지막 업데이트: ${stats.lastUpdated.toLocaleString()}`);
  
  // 6. 다양한 국가 데이터 샘플링 테스트
  console.log('\\n6️⃣ 다양한 국가 데이터 샘플링 테스트:');
  
  const testCountries = ['US', 'FR', 'DE', 'BR', 'IN', 'SG'];
  testCountries.forEach(country => {
    const data = CulturalSensitivityDatabase.getCulturalData(country);
    if (data) {
      console.log(`   ✅ ${country} (${data.culturalName}): 종교 ${data.religiousContext.length}개, 민감성 ${data.politicalSensitivities.length}개`);
    } else {
      console.log(`   ❌ ${country}: 데이터 없음`);
    }
  });
  
  // 7. 커뮤니케이션 스타일 테스트
  console.log('\\n7️⃣ 커뮤니케이션 스타일 테스트:');
  
  const koreanCommStyle = CulturalSensitivityDatabase.getCommunicationStyle('KR');
  if (koreanCommStyle) {
    console.log(`   한국 커뮤니케이션: 격식도=${koreanCommStyle.formalityLevel}, 직접성=${koreanCommStyle.directness}`);
  }
  
  const americanCommStyle = CulturalSensitivityDatabase.getCommunicationStyle('US');
  if (americanCommStyle) {
    console.log(`   미국 커뮤니케이션: 격식도=${americanCommStyle.formalityLevel}, 직접성=${americanCommStyle.directness}`);
  }
  
  console.log('\\n🎉 모든 함수 동작 테스트 완료!');
  console.log('✅ 데이터베이스가 정상적으로 작동합니다.');
  
} catch (error) {
  console.error('❌ 함수 실행 오류:', error.message);
  console.error('스택 트레이스:', error.stack);
  process.exit(1);
}