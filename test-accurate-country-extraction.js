/**
 * 🧪 Google API 기반 정확한 국가코드 추출 테스트
 * 대왕궁, 에펠탑, 만리장성 등 전세계 유명 장소들의 정확한 국가코드 추출 테스트
 */

import { extractAccurateLocationInfo } from './src/lib/coordinates/accurate-country-extractor.js';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

// 🧪 테스트 케이스: 전세계 대표 관광지
const testCases = [
  // 문제가 되었던 케이스
  { name: '대왕궁', expectedCountry: 'THA', expectedRegion: '방콕' },
  
  // 아시아 주요 관광지
  { name: '만리장성', expectedCountry: 'CHN', expectedRegion: '베이징' },
  { name: '자금성', expectedCountry: 'CHN', expectedRegion: '베이징' },
  { name: '후지산', expectedCountry: 'JPN', expectedRegion: '혼슈' },
  { name: '경복궁', expectedCountry: 'KOR', expectedRegion: '서울' },
  { name: '앙코르와트', expectedCountry: 'KHM', expectedRegion: '시엠리앱' },
  
  // 유럽 주요 관광지
  { name: '에펠탑', expectedCountry: 'FRA', expectedRegion: '파리' },
  { name: '루브르 박물관', expectedCountry: 'FRA', expectedRegion: '파리' },
  { name: '콜로세움', expectedCountry: 'ITA', expectedRegion: '로마' },
  { name: '사그라다 파밀리아', expectedCountry: 'ESP', expectedRegion: '바르셀로나' },
  { name: '빅벤', expectedCountry: 'GBR', expectedRegion: '런던' },
  
  // 아메리카 주요 관광지
  { name: '자유의 여신상', expectedCountry: 'USA', expectedRegion: '뉴욕' },
  { name: '타임스 스퀘어', expectedCountry: 'USA', expectedRegion: '뉴욕' },
  { name: '그랜드 캐니언', expectedCountry: 'USA', expectedRegion: '애리조나' },
  
  // 오세아니아 주요 관광지
  { name: '시드니 오페라 하우스', expectedCountry: 'AUS', expectedRegion: '시드니' }
];

/**
 * 🎯 단일 테스트 실행
 */
async function runSingleTest(testCase) {
  console.log(`\n🧪 테스트: "${testCase.name}"`);
  console.log(`   예상: ${testCase.expectedCountry} (${testCase.expectedRegion})`);
  
  try {
    const result = await extractAccurateLocationInfo(testCase.name, 'ko');
    
    if (result) {
      console.log(`   결과: ${result.countryCode} (${result.region})`);
      console.log(`   주소: ${result.formattedAddress}`);
      console.log(`   좌표: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      console.log(`   신뢰도: ${(result.confidence * 100).toFixed(1)}%`);
      
      // 검증
      const countryMatch = result.countryCode === testCase.expectedCountry;
      const status = countryMatch ? '✅ 성공' : '❌ 실패';
      
      console.log(`   판정: ${status}`);
      
      if (!countryMatch) {
        console.log(`   ⚠️  예상 국가: ${testCase.expectedCountry}, 실제: ${result.countryCode}`);
      }
      
      return {
        name: testCase.name,
        expected: testCase.expectedCountry,
        actual: result.countryCode,
        success: countryMatch,
        confidence: result.confidence,
        address: result.formattedAddress
      };
    } else {
      console.log(`   ❌ 추출 실패: 결과 없음`);
      return {
        name: testCase.name,
        expected: testCase.expectedCountry,
        actual: null,
        success: false,
        confidence: 0
      };
    }
  } catch (error) {
    console.log(`   ❌ 추출 오류:`, error.message);
    return {
      name: testCase.name,
      expected: testCase.expectedCountry,
      actual: null,
      success: false,
      confidence: 0,
      error: error.message
    };
  }
}

/**
 * 🚀 전체 테스트 실행
 */
async function runAllTests() {
  console.log('🚀 Google API 기반 정확한 국가코드 추출 테스트 시작');
  console.log(`📊 테스트 케이스: ${testCases.length}개`);
  
  const results = [];
  let successCount = 0;
  
  // Google API 호출 제한을 고려한 순차 실행
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = await runSingleTest(testCase);
    results.push(result);
    
    if (result.success) {
      successCount++;
    }
    
    // API 호출 제한 방지를 위한 대기 (1.5초)
    if (i < testCases.length - 1) {
      console.log('   ⏱️  API 호출 제한 방지 대기...');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // 📊 결과 요약
  console.log(`\n📊 테스트 결과 요약`);
  console.log(`=====================================`);
  console.log(`총 테스트: ${testCases.length}개`);
  console.log(`성공: ${successCount}개 (${((successCount / testCases.length) * 100).toFixed(1)}%)`);
  console.log(`실패: ${testCases.length - successCount}개`);
  
  // 실패한 케이스 상세 정보
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log(`\n❌ 실패한 케이스:`);
    failures.forEach(failure => {
      console.log(`   - ${failure.name}: 예상 ${failure.expected} → 실제 ${failure.actual || '추출실패'}`);
      if (failure.error) {
        console.log(`     오류: ${failure.error}`);
      }
    });
  }
  
  // 🎯 대왕궁 특별 검증
  const grandPalaceResult = results.find(r => r.name === '대왕궁');
  if (grandPalaceResult) {
    console.log(`\n🎯 대왕궁 특별 검증:`);
    if (grandPalaceResult.success && grandPalaceResult.actual === 'THA') {
      console.log(`   ✅ 대왕궁이 올바르게 태국(THA)으로 인식됨!`);
      console.log(`   🎉 기존 KOR 문제가 해결되었습니다!`);
    } else {
      console.log(`   ❌ 대왕궁이 여전히 ${grandPalaceResult.actual}로 잘못 인식됨`);
      console.log(`   ⚠️  추가 디버깅이 필요합니다.`);
    }
  }
  
  // 성공률 평가
  const successRate = (successCount / testCases.length) * 100;
  if (successRate >= 90) {
    console.log(`\n🎉 우수한 정확도! (${successRate.toFixed(1)}%)`);
  } else if (successRate >= 70) {
    console.log(`\n✅ 양호한 정확도 (${successRate.toFixed(1)}%)`);
  } else {
    console.log(`\n⚠️  정확도 개선 필요 (${successRate.toFixed(1)}%)`);
  }
  
  return results;
}

/**
 * 🎯 특정 장소 단독 테스트 (빠른 검증용)
 */
async function testSinglePlace(placeName) {
  console.log(`\n🔍 "${placeName}" 단독 테스트`);
  
  try {
    const result = await extractAccurateLocationInfo(placeName, 'ko');
    
    if (result) {
      console.log(`✅ 성공:`, {
        name: result.placeName,
        country: `${result.country} (${result.countryCode})`,
        region: result.region,
        address: result.formattedAddress,
        coordinates: `${result.coordinates.lat}, ${result.coordinates.lng}`,
        confidence: `${(result.confidence * 100).toFixed(1)}%`
      });
    } else {
      console.log(`❌ 실패: 정보를 추출할 수 없음`);
    }
  } catch (error) {
    console.log(`❌ 오류:`, error.message);
  }
}

// 🚀 테스트 실행
if (process.argv.length > 2) {
  // 명령행 인수로 특정 장소 테스트
  const placeName = process.argv.slice(2).join(' ');
  testSinglePlace(placeName);
} else {
  // 전체 테스트 실행
  runAllTests().catch(error => {
    console.error('❌ 테스트 실행 오류:', error);
    process.exit(1);
  });
}