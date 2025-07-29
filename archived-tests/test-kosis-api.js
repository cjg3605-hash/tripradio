/**
 * KOSIS 통계청 API 테스트
 */

const KOSIS_API_KEY = 'MGYyMDI2M2MzNDUyZmJjNDRlNjQyZTRlNWY0OGY1OTE=';
const KOSIS_BASE_URL = 'https://kosis.kr/openapi';

async function testKOSISAPI() {
  console.log('📊 KOSIS 통계청 API 테스트');
  console.log('='.repeat(60));
  
  // 1. 통계 목록 조회 테스트
  console.log('\n1️⃣ 통계 목록 조회 테스트');
  console.log('-'.repeat(40));
  
  try {
    const listParams = new URLSearchParams({
      method: 'getList',
      apiKey: KOSIS_API_KEY,
      format: 'json',
      jsonVD: 'Y',
      userStatsId: '',
      prdSe: 'M', // 월별
      startPrdDe: '202301',
      endPrdDe: '202312'
    });
    
    const listUrl = `${KOSIS_BASE_URL}/Param/statisticsList.do?${listParams}`;
    console.log('📡 요청 URL:', listUrl.replace(KOSIS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response1 = await fetch(listUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'GuideAI-KOSIS/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('📊 응답 상태:', response1.status, response1.statusText);
    console.log('📦 Content-Type:', response1.headers.get('content-type'));
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ 통계 목록 조회 성공!');
      console.log('📄 응답 구조 확인:');
      console.log(JSON.stringify(data1, null, 2).substring(0, 500) + '...');
      
      if (data1.length > 0 || data1.data) {
        console.log('🎯 통계 데이터 확인됨');
      }
    } else {
      const errorText1 = await response1.text();
      console.log('❌ 통계 목록 조회 실패');
      console.log('에러 응답:', errorText1.substring(0, 300));
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 2. 관광 관련 통계 검색
  console.log('\n2️⃣ 관광 관련 통계 검색');
  console.log('-'.repeat(40));
  
  const tourismQueries = [
    { keyword: '관광', description: '관광 관련 통계' },
    { keyword: '여행', description: '여행 관련 통계' },
    { keyword: '문화', description: '문화 관련 통계' },
    { keyword: '방문', description: '방문객 관련 통계' }
  ];
  
  for (const query of tourismQueries) {
    console.log(`\n🔍 "${query.keyword}" 관련 통계 검색`);
    try {
      const searchParams = new URLSearchParams({
        method: 'getList',
        apiKey: KOSIS_API_KEY,
        format: 'json',
        jsonVD: 'Y',
        searchStatsNm: query.keyword,
        prdSe: 'M'
      });
      
      const searchUrl = `${KOSIS_BASE_URL}/statisticsSearch.do?${searchParams}`;
      
      const response2 = await fetch(searchUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GuideAI-KOSIS/1.0',
          'Accept': 'application/json'
        }
      });
      
      console.log(`📊 ${query.keyword}: ${response2.status} ${response2.statusText}`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        
        if (Array.isArray(data2) && data2.length > 0) {
          console.log(`   ✅ ${data2.length}개 통계 발견`);
          console.log(`   📈 첫 번째: ${data2[0].STATS_NM || data2[0].statsNm || '정보 없음'}`);
        } else if (data2.data && data2.data.length > 0) {
          console.log(`   ✅ ${data2.data.length}개 통계 발견`);
          console.log(`   📈 첫 번째: ${data2.data[0].STATS_NM || data2.data[0].statsNm || '정보 없음'}`);
        } else {
          console.log(`   📄 ${query.keyword} 관련 통계 없음`);
        }
      } else {
        console.log(`   ❌ 검색 실패: ${response2.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${query.keyword} 검색 에러: ${error.message}`);
    }
  }
  
  // 3. 특정 통계표 조회 테스트
  console.log('\n3️⃣ 특정 통계표 조회 테스트');
  console.log('-'.repeat(40));
  
  try {
    // 인구 총조사 같은 기본적인 통계로 테스트
    const dataParams = new URLSearchParams({
      method: 'getList',
      apiKey: KOSIS_API_KEY,
      format: 'json',
      jsonVD: 'Y',
      itmId: 'ALL',
      objL1: 'ALL',
      objL2: '',
      objL3: '',
      objL4: '',
      objL5: '',
      objL6: '',
      objL7: '',
      objL8: ''
    });
    
    const dataUrl = `${KOSIS_BASE_URL}/statisticsSearch.do?${dataParams}`;
    
    const response3 = await fetch(dataUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-KOSIS/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('📊 통계표 조회:', response3.status, response3.statusText);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ 통계표 접근 성공');
      console.log('📊 데이터 샘플:', JSON.stringify(data3, null, 2).substring(0, 200) + '...');
    }
  } catch (error) {
    console.log('❌ 통계표 조회 에러:', error.message);
  }
  
  // 4. KOSIS API 기능 분석
  console.log('\n4️⃣ KOSIS API 활용 분석');
  console.log('-'.repeat(40));
  
  console.log('🎯 GuideAI에서 활용 가능한 KOSIS 데이터:');
  console.log('✅ 지역별 관광객 수 통계');
  console.log('✅ 월별/연도별 방문객 추이');
  console.log('✅ 문화시설 이용 현황');
  console.log('✅ 숙박업 현황 통계');
  console.log('✅ 교통 이용 통계');
  console.log('✅ 지역 경제 지표');
  
  console.log('\n📊 활용 방안:');
  console.log('1. 명소별 인기도 지표 생성');
  console.log('2. 계절별 방문 패턴 분석');
  console.log('3. 지역 비교 정보 제공');
  console.log('4. 트렌드 기반 추천 시스템');
  
  console.log('\n⚠️ 제한사항:');
  console.log('- 통계 데이터는 실시간이 아님 (월/분기/연 단위)');
  console.log('- 개별 명소보다는 지역/카테고리 단위');
  console.log('- 가이드 생성보다는 보조 정보로 활용');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 KOSIS API 테스트 완료');
  console.log('='.repeat(60));
  
  console.log('\n💡 **통합 전략**:');
  console.log('1. 즉시 사용: 환경변수에 키 추가');
  console.log('2. 보조 정보: 다른 API와 함께 활용');
  console.log('3. 데이터 분석: 방문 패턴 및 트렌드 정보');
  console.log('4. 가이드 개선: 통계 기반 인사이트 추가');
}

// 실행
testKOSISAPI().catch(console.error);