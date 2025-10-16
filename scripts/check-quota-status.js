#!/usr/bin/env node
// scripts/check-quota-status.js
// Google Indexing API 할당량 상태 확인 도구

const { google } = require('googleapis');

async function checkQuotaStatus() {
  try {
    console.log('🔍 Google Indexing API 할당량 상태 확인 중...\n');

    // 서비스 계정 인증
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.');
      return;
    }

    const keyData = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
    const auth = new google.auth.GoogleAuth({
      credentials: keyData,
      scopes: ['https://www.googleapis.com/auth/indexing']
    });

    // 프로젝트 정보
    console.log('📊 프로젝트 정보:');
    console.log(`   프로젝트 ID: ${keyData.project_id}`);
    console.log(`   서비스 계정: ${keyData.client_email}`);
    console.log('');

    // 테스트 메타데이터 요청 (할당량을 거의 사용하지 않음)
    const indexing = google.indexing({ version: 'v3', auth });
    
    console.log('🧪 API 연결 테스트 중...');
    
    try {
      // 메타데이터 요청 (할당량 소모가 적음)
      const testUrl = 'https://tripradio.shop/guide/경복궁?lang=ko';
      const metadataResponse = await indexing.urlNotifications.getMetadata({
        url: testUrl
      });
      
      console.log('✅ API 연결 성공!');
      console.log('📋 메타데이터 응답:', metadataResponse.data);
      
    } catch (metadataError) {
      console.log('⚠️ 메타데이터 조회 결과:', metadataError.message);
      
      if (metadataError.message.includes('Quota exceeded')) {
        console.log('🚨 할당량 초과 확인됨');
        console.log('');
        
        // 할당량 정보 표시
        console.log('📊 기본 할당량 정보:');
        console.log('   일일 Publish 요청: 200개');
        console.log('   분당 메타데이터 요청: 180개');
        console.log('   분당 전체 요청: 380개');
        console.log('');
        
        console.log('🔄 할당량 재설정 시간:');
        const now = new Date();
        const utcMidnight = new Date(now);
        utcMidnight.setUTCHours(24, 0, 0, 0);
        
        console.log(`   현재 시간 (UTC): ${now.toISOString()}`);
        console.log(`   다음 재설정: ${utcMidnight.toISOString()}`);
        console.log(`   남은 시간: ${Math.ceil((utcMidnight - now) / (1000 * 60 * 60))}시간`);
        
      } else {
        console.log('🤔 다른 오류:', metadataError.message);
      }
    }

    // 할당량 증가 요청 안내
    console.log('');
    console.log('💡 할당량 증가 방법:');
    console.log('1. Google Cloud Console 접속:');
    console.log('   https://console.cloud.google.com/apis/api/indexing.googleapis.com/quotas?project=' + keyData.project_id);
    console.log('');
    console.log('2. "Publish requests per day" 항목 찾기');
    console.log('3. "EDIT QUOTAS" 클릭');
    console.log('4. 새 한도 요청: 1000 (권장)');
    console.log('5. 요청 이유: "Website indexing for multilingual content"');
    console.log('');
    console.log('📞 승인 시간: 보통 24-48시간');

  } catch (error) {
    console.error('❌ 할당량 확인 실패:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkQuotaStatus().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = { checkQuotaStatus };