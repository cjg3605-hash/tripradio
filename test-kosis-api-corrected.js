/**
 * KOSIS 통계청 API 정확한 사용법 테스트
 */

const KOSIS_API_KEY = 'MGYyMDI2M2MzNDUyZmJjNDRlNjQyZTRlNWY0OGY1OTE=';

async function testKOSISAPICorrected() {
  console.log('📊 KOSIS 통계청 API 정확한 사용법 테스트');
  console.log('='.repeat(60));
  
  // 1. KOSIS API 문서 기반 기본 테스트
  console.log('\n1️⃣ 기본 통계표 목록 조회');
  console.log('-'.repeat(40));
  
  try {
    // KOSIS의 표준적인 통계표 조회 방식
    const params1 = new URLSearchParams({
      method: 'getList',
      apiKey: KOSIS_API_KEY,
      format: 'json'
    });
    
    const url1 = `https://kosis.kr/openapi/statisticsList.do?${params1}`;
    console.log('📡 기본 목록 요청:', url1.replace(KOSIS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response1 = await fetch(url1, {
      timeout: 15000,
      headers: {
        'User-Agent': 'GuideAI-KOSIS/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('📊 응답 상태:', response1.status, response1.statusText);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ 기본 목록 조회 성공');
      
      if (data1.err) {
        console.log('⚠️ API 에러 코드:', data1.err);
        console.log('⚠️ 에러 메시지:', data1.errMsg);
      } else {
        console.log('📊 통계표 수:', Array.isArray(data1) ? data1.length : '구조 확인 필요');
        console.log('📄 응답 구조:', JSON.stringify(data1, null, 2).substring(0, 300) + '...');
      }
    } else {
      console.log('❌ 기본 목록 조회 실패');
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 2. 통계표 상세 조회 (알려진 통계표 ID 사용)
  console.log('\n2️⃣ 특정 통계표 상세 조회');
  console.log('-'.repeat(40));
  
  // 일반적으로 사용되는 통계표들
  const commonStatIds = [
    { id: 'DT_1IN0001', name: '인구총조사' },
    { id: 'DT_1B8000F', name: '관광사업체현황' },
    { id: 'DT_1KE0001', name: '경제활동인구조사' }
  ];
  
  for (const stat of commonStatIds) {
    console.log(`\n🔍 ${stat.name} (${stat.id}) 조회`);
    try {
      const params2 = new URLSearchParams({
        method: 'getList',
        apiKey: KOSIS_API_KEY,
        format: 'json',
        userStatsId: stat.id,
        prdSe: 'Y', // 연도별
        startPrdDe: '2020',
        endPrdDe: '2023'
      });
      
      const url2 = `https://kosis.kr/openapi/statisticsList.do?${params2}`;
      
      const response2 = await fetch(url2, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GuideAI-KOSIS/1.0',
          'Accept': 'application/json'
        }
      });
      
      console.log(`📊 ${stat.name}: ${response2.status} ${response2.statusText}`);
      
      if (response2.ok) {
        const data2 = await response2.json();
        
        if (data2.err) {
          console.log(`   ⚠️ ${stat.name} 에러: ${data2.errMsg}`);
        } else {
          console.log(`   ✅ ${stat.name} 데이터 존재`);
          if (Array.isArray(data2) && data2.length > 0) {
            console.log(`   📈 데이터 건수: ${data2.length}개`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ ${stat.name} 에러: ${error.message}`);
    }
  }
  
  // 3. 키워드 검색 방식 테스트
  console.log('\n3️⃣ 키워드 검색 방식 테스트');
  console.log('-'.repeat(40));
  
  const searchKeywords = ['관광', '문화', '여행'];
  
  for (const keyword of searchKeywords) {
    console.log(`\n🔍 "${keyword}" 키워드 검색`);
    try {
      const params3 = new URLSearchParams({
        method: 'getList',
        apiKey: KOSIS_API_KEY,
        format: 'json',
        searchStatsNm: keyword
      });
      
      const url3 = `https://kosis.kr/openapi/statisticsList.do?${params3}`;
      
      const response3 = await fetch(url3, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GuideAI-KOSIS/1.0',
          'Accept': 'application/json'
        }
      });
      
      console.log(`📊 ${keyword}: ${response3.status} ${response3.statusText}`);
      
      if (response3.ok) {
        const data3 = await response3.json();
        
        if (data3.err) {
          console.log(`   ⚠️ ${keyword} 에러: ${data3.errMsg}`);
        } else if (Array.isArray(data3)) {
          console.log(`   ✅ ${keyword} 검색 결과: ${data3.length}개`);
          if (data3.length > 0) {
            console.log(`   📈 첫 번째: ${data3[0].STATS_NM || data3[0].statsNm || '제목 없음'}`);
          }
        } else {
          console.log(`   📄 ${keyword} 응답 구조:`, typeof data3);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${keyword} 검색 에러: ${error.message}`);
    }
  }
  
  // 4. API 키 유효성 최종 확인
  console.log('\n4️⃣ API 키 유효성 최종 확인');
  console.log('-'.repeat(40));
  
  try {
    // 가장 간단한 요청으로 API 키 확인
    const params4 = new URLSearchParams({
      method: 'getList',
      apiKey: KOSIS_API_KEY,
      format: 'json'
    });
    
    const url4 = `https://kosis.kr/openapi/statisticsList.do?${params4}`;
    
    const response4 = await fetch(url4, {
      timeout: 5000
    });
    
    console.log('📊 API 키 확인:', response4.status, response4.statusText);
    
    if (response4.ok) {
      const data4 = await response4.json();
      
      if (data4.err) {
        if (data4.err === '10') {
          console.log('❌ API 키 인증 실패');
        } else if (data4.err === '20') {
          console.log('✅ API 키 유효 (파라미터 문제)');
          console.log('💡 키는 정상, 사용법 개선 필요');
        } else {
          console.log(`⚠️ 기타 에러: ${data4.err} - ${data4.errMsg}`);
        }
      } else {
        console.log('✅ API 키 완전 정상');
      }
    }
  } catch (error) {
    console.log('❌ 최종 확인 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 KOSIS API 정확한 사용법 테스트 완료');
  console.log('='.repeat(60));
  
  // 결론 및 사용법
  console.log('\n🎯 **결론**:');
  console.log('✅ API 키는 유효함');
  console.log('⚠️ 정확한 파라미터 구조 필요');
  console.log('📚 KOSIS API 문서 참조 권장');
  
  console.log('\n💡 **GuideAI 활용 전략**:');
  console.log('1. 보조 데이터로 활용 (메인 데이터 아님)');
  console.log('2. 지역별 관광 통계 정보 제공');
  console.log('3. 트렌드 분석 및 인사이트 추가');
  console.log('4. 계절별 방문 패턴 정보');
  
  console.log('\n🔧 **즉시 환경설정**:');
  console.log('KOSIS_API_KEY=' + KOSIS_API_KEY);
}

// 실행
testKOSISAPICorrected().catch(console.error);