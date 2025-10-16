/**
 * 🔍 검색 플로우 단계별 테스트 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 1️⃣ 자동완성 검색 테스트 (6개 결과 검증)
async function testAutocomplete(query) {
  console.log(`\n🔍 1단계: 자동완성 검색 테스트 - "${query}"`);
  console.log('='.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, locationname, location_region, country_code, language, coordinates')
      .ilike('locationname', `%${query}%`)
      .limit(6);
    
    if (error) {
      console.error('❌ Supabase 검색 오류:', error);
      return null;
    }
    
    console.log(`✅ 검색 결과: ${data.length}개`);
    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.locationname}`);
      console.log(`   지역: ${item.location_region || '미분류'}`);
      console.log(`   국가코드: ${item.country_code || '미분류'}`);
      console.log(`   언어: ${item.language}`);
      console.log(`   좌표: ${item.coordinates ? 'O' : 'X'}`);
      console.log('');
    });
    
    return data;
  } catch (error) {
    console.error('❌ 자동완성 검색 실패:', error);
    return null;
  }
}

// 2️⃣ 지역 정보 추출 테스트
async function testRegionExtraction(locationName) {
  console.log(`\n📍 2단계: 지역 정보 추출 테스트 - "${locationName}"`);
  console.log('='.repeat(50));
  
  try {
    // API 호출 시뮬레이션
    const response = await fetch('http://localhost:3000/api/locations/extract-regional-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeName: locationName,
        language: 'ko',
        detailed: false
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ 지역 정보 추출 성공:');
    console.log(`   장소명: ${result.data?.placeName || locationName}`);
    console.log(`   지역: ${result.data?.region || '미분류'}`);
    console.log(`   국가: ${result.data?.country || '미분류'}`);
    console.log(`   국가코드: ${result.data?.countryCode || '미분류'}`);
    console.log(`   신뢰도: ${result.data?.confidence || 0}`);
    
    return result.data;
  } catch (error) {
    console.error('❌ 지역 정보 추출 실패:', error);
    return null;
  }
}

// 3️⃣ 세션 스토리지 데이터 시뮬레이션
function simulateSessionStorage(locationName, regionData) {
  console.log(`\n💾 3단계: 세션 스토리지 데이터 저장 시뮬레이션`);
  console.log('='.repeat(50));
  
  const sessionData = {
    name: locationName,
    location: regionData ? `${regionData.region}, ${regionData.country}` : '',
    region: regionData?.region || 'loading',
    country: regionData?.country || 'loading', 
    countryCode: regionData?.countryCode || 'loading',
    type: 'attraction',
    confidence: regionData?.confidence || 0.5,
    timestamp: Date.now()
  };
  
  console.log('✅ 세션 데이터 구조:');
  console.log(JSON.stringify(sessionData, null, 2));
  
  return sessionData;
}

// 4️⃣ 가이드 생성/조회 테스트
async function testGuideGeneration(locationName, language = 'ko') {
  console.log(`\n🎯 4단계: 가이드 생성/조회 테스트 - "${locationName}" (${language})`);
  console.log('='.repeat(50));
  
  try {
    // 기존 가이드 조회
    const { data: existingGuide, error: searchError } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName)
      .eq('language', language)
      .single();
    
    if (existingGuide) {
      console.log('✅ 기존 가이드 발견:');
      console.log(`   ID: ${existingGuide.id}`);
      console.log(`   생성일: ${existingGuide.created_at}`);
      console.log(`   품질 점수: ${existingGuide.quality_score || '미측정'}`);
      console.log(`   좌표: ${existingGuide.coordinates ? 'O' : 'X'}`);
      return existingGuide;
    } else {
      console.log('📝 기존 가이드 없음 - 새로 생성 필요');
      console.log('   (실제 생성은 AI API 호출이 필요하므로 생략)');
      return null;
    }
    
  } catch (error) {
    console.error('❌ 가이드 조회 실패:', error);
    return null;
  }
}

// 5️⃣ 전체 플로우 통합 테스트
async function runFullFlowTest(query) {
  console.log(`\n🚀 전체 플로우 통합 테스트: "${query}"`);
  console.log('='.repeat(70));
  
  // 1단계: 자동완성 검색
  const searchResults = await testAutocomplete(query);
  if (!searchResults || searchResults.length === 0) {
    console.log('❌ 검색 결과 없음 - 플로우 중단');
    return;
  }
  
  // 첫 번째 결과 선택
  const selectedLocation = searchResults[0];
  console.log(`\n🎯 선택된 위치: ${selectedLocation.locationname}`);
  
  // 2단계: 지역 정보 추출  
  const regionData = await testRegionExtraction(selectedLocation.locationname);
  
  // 3단계: 세션 데이터 시뮬레이션
  const sessionData = simulateSessionStorage(selectedLocation.locationname, regionData);
  
  // 4단계: 가이드 생성/조회
  const guideData = await testGuideGeneration(selectedLocation.locationname);
  
  // 결과 요약
  console.log(`\n📊 플로우 테스트 결과 요약`);
  console.log('='.repeat(50));
  console.log(`✅ 자동완성: ${searchResults.length}개 결과`);
  console.log(`${regionData ? '✅' : '❌'} 지역 추출: ${regionData ? '성공' : '실패'}`);
  console.log(`✅ 세션 저장: 시뮬레이션 완료`);
  console.log(`${guideData ? '✅' : '📝'} 가이드: ${guideData ? '기존 발견' : '생성 필요'}`);
}

// 🧪 테스트 실행
async function main() {
  console.log('🔬 TripRadio.AI 검색 플로우 테스트 시작');
  console.log('='.repeat(70));
  
  // 여러 검색어로 테스트
  const testQueries = ['경복궁', '에펠탑', '콜로세움', '타지마할'];
  
  for (const query of testQueries) {
    await runFullFlowTest(query);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
  }
  
  console.log('\n🎉 모든 테스트 완료!');
}

if (require.main === module) {
  main().catch(console.error);
}