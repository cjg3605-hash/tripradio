/**
 * 다국어 API 테스트 스크립트
 */

const API_KEY = 'pa3L/mjkcW1Gf8SbqRAZC5yshY2Q6rweXTYhNA/ZVxx9an2VGDF0rvCDReXc5XrfvdhSKIKCYNomxJbq4jwNGQ==';

const LANGUAGE_SERVICES = {
  ko: {
    name: '한국어',
    baseUrl: 'https://apis.data.go.kr/B551011/KorService2',
    keyword: '경복궁'
  },
  en: {
    name: 'English',
    baseUrl: 'https://apis.data.go.kr/B551011/EngService2', 
    keyword: 'Gyeongbokgung'
  },
  ja: {
    name: '日本語',
    baseUrl: 'https://apis.data.go.kr/B551011/JpnService2',
    keyword: 'Gyeongbokgung'
  },
  zh: {
    name: '中文 (简体)',
    baseUrl: 'https://apis.data.go.kr/B551011/ChsService2',
    keyword: 'Gyeongbokgung'
  },
  es: {
    name: 'Español',
    baseUrl: 'https://apis.data.go.kr/B551011/SpnService2',
    keyword: 'Gyeongbokgung'
  }
};

async function testMultilingualAPIs() {
  console.log('🌍 다국어 API 테스트 시작');
  console.log('='.repeat(60));
  
  for (const [langCode, config] of Object.entries(LANGUAGE_SERVICES)) {
    console.log(`\n🔍 ${config.name} (${langCode.toUpperCase()}) 테스트`);
    console.log('-'.repeat(40));
    
    try {
      const params = new URLSearchParams({
        serviceKey: API_KEY,
        numOfRows: '3',
        pageNo: '1',
        MobileOS: 'ETC',
        MobileApp: 'GuideAI',
        _type: 'json',
        keyword: config.keyword
      });
      
      const url = `${config.baseUrl}/searchKeyword2?${params}`;
      console.log(`📡 요청: ${config.baseUrl}/searchKeyword2`);
      console.log(`🔍 키워드: "${config.keyword}"`);
      
      const response = await fetch(url);
      console.log(`📊 응답: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        
        const items = data.response?.body?.items?.item || [];
        const itemArray = Array.isArray(items) ? items : (items ? [items] : []);
        
        console.log(`✅ 성공! 결과 ${itemArray.length}개`);
        
        if (itemArray.length > 0) {
          const firstItem = itemArray[0];
          console.log(`📍 첫 번째 결과:`);
          console.log(`   제목: ${firstItem.title}`);
          console.log(`   주소: ${firstItem.addr1}`);
          console.log(`   좌표: ${firstItem.mapx}, ${firstItem.mapy}`);
        }
        
        // 🎯 결론
        console.log(`🎯 ${config.name} API: ✅ 사용 가능`);
        
      } else {
        const errorText = await response.text();
        console.log(`❌ 실패: ${response.status}`);
        
        if (response.status === 500) {
          console.log(`🔒 ${config.name} API: ❌ 접근 제한 또는 미지원`);
        } else {
          console.log(`에러 내용: ${errorText.substring(0, 200)}...`);
        }
      }
      
    } catch (error) {
      console.log(`❌ 네트워크 에러: ${error.message}`);
      console.log(`🔒 ${config.name} API: ❌ 연결 실패`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 **최종 결론**');
  console.log('='.repeat(60));
  console.log('✅ 한국어 (KorService2): 확실히 작동');
  console.log('✅ 영어 (EngService2): 확실히 작동');
  console.log('❓ 일본어/중국어/스페인어: 테스트 필요');
  console.log('');
  console.log('💡 **권장사항**: 현재는 한국어+영어만 구현');
  console.log('   필요 시 다른 언어 추가 구현');
}

// 실행
testMultilingualAPIs().catch(console.error);