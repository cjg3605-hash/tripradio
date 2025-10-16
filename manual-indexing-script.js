#!/usr/bin/env node
// 수동 색인 스크립트 - 새 URL 구조 반영
const https = require('https');

const baseUrl = 'https://navidocent.com';

// 주요 페이지들 - 새 URL 구조 적용
const urlsToIndex = [
  // 홈페이지
  `${baseUrl}`,
  
  // 주요 가이드 페이지 (새 URL 구조)
  `${baseUrl}/guide/ko/경복궁`,
  `${baseUrl}/guide/en/gyeongbokgung-palace`,
  `${baseUrl}/guide/ko/남산타워`,
  `${baseUrl}/guide/en/namsan-tower`,
  `${baseUrl}/guide/ko/제주도`,
  `${baseUrl}/guide/en/jeju-island`,
  `${baseUrl}/guide/ko/부산`,
  `${baseUrl}/guide/en/busan`,
  
  // 일본어/중국어 페이지
  `${baseUrl}/guide/ja/seoul`,
  `${baseUrl}/guide/zh/seoul`,
  `${baseUrl}/guide/es/seoul`,
  
  // 팟캐스트 페이지 (새 구조)
  `${baseUrl}/podcast/ko/경복궁`,
  `${baseUrl}/podcast/en/gyeongbokgung-palace`,
  
  // 랜딩 페이지들
  `${baseUrl}/destinations`,
  `${baseUrl}/docent`,
  `${baseUrl}/tour-radio`,
  `${baseUrl}/travel-radio`,
  `${baseUrl}/travel`,
  `${baseUrl}/audio-guide`,
  `${baseUrl}/free-travel`,
  
  // 지역별 페이지
  `${baseUrl}/regions/korea`,
  `${baseUrl}/regions/europe`,
  `${baseUrl}/regions/asia`,
  `${baseUrl}/regions/americas`,
  
  // 도구 페이지
  `${baseUrl}/trip-planner`,
  `${baseUrl}/nomad-calculator`,
  `${baseUrl}/visa-checker`,
  `${baseUrl}/film-locations`,
  
  // 영어 랜딩 페이지
  `${baseUrl}/en/ai-travel-guide`,
  `${baseUrl}/en/travel-planning-app`,
  `${baseUrl}/en/digital-nomad-travel`,
  `${baseUrl}/en/film-location-travel`
];

async function requestIndexing(url) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      url: url,
      type: "URL_UPDATED"
    });
    
    const options = {
      hostname: 'indexing.googleapis.com',
      port: 443,
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_INDEXING_TOKEN || ''}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${url} - 색인 요청 성공`);
          resolve({ success: true, url });
        } else {
          console.log(`❌ ${url} - 색인 요청 실패 (${res.statusCode})`);
          resolve({ success: false, url, statusCode: res.statusCode });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ ${url} - 네트워크 오류: ${e.message}`);
      resolve({ success: false, url, error: e.message });
    });
    
    req.write(postData);
    req.end();
  });
}

async function batchIndex() {
  console.log('🚀 새 URL 구조 색인 요청 시작');
  console.log(`📍 총 ${urlsToIndex.length}개 URL 처리 예정\n`);
  
  let successful = 0;
  let failed = 0;
  
  // 배치로 처리 (5개씩)
  for (let i = 0; i < urlsToIndex.length; i += 5) {
    const batch = urlsToIndex.slice(i, i + 5);
    const promises = batch.map(url => requestIndexing(url));
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    });
    
    // 배치 간 지연
    if (i + 5 < urlsToIndex.length) {
      console.log('⏳ 3초 대기 중...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 색인 요청 완료!');
  console.log(`✅ 성공: ${successful}개`);
  console.log(`❌ 실패: ${failed}개`);
  console.log(`📊 성공률: ${(successful / urlsToIndex.length * 100).toFixed(1)}%`);
}

// 실행
if (require.main === module) {
  batchIndex().catch(console.error);
}

module.exports = { batchIndex, urlsToIndex };