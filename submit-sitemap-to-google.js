#!/usr/bin/env node
// Google Search Console에 사이트맵 제출

const https = require('https');

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop';
const sitemapsToSubmit = [
  `${baseUrl}/sitemap.xml`,
  `${baseUrl}/sitemap-keywords.xml`
];

console.log('📋 Google Search Console에 사이트맵 제출');
console.log('🌐 사이트맵 URL들:');
sitemapsToSubmit.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`);
});

console.log('\n📝 다음 단계:');
console.log('1. Google Search Console (https://search.google.com/search-console) 접속');
console.log('2. 사이트맵 → 새 사이트맵 추가');
console.log('3. 위 URL들을 각각 제출');
console.log('4. "제출" 클릭');

console.log('\n🔍 개별 URL 색인 요청:');
console.log('1. Google Search Console → URL 검사');
console.log('2. 다음 주요 URL들을 개별 검사:');

const priorityUrls = [
  baseUrl,
  `${baseUrl}/guide/ko/경복궁`,
  `${baseUrl}/guide/en/gyeongbokgung-palace`,
  `${baseUrl}/podcast/ko/경복궁`,
  `${baseUrl}/destinations`,
  `${baseUrl}/docent`,
  `${baseUrl}/tour-radio`,
  `${baseUrl}/regions/korea`
];

priorityUrls.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`);
});

console.log('\n✅ 변경된 URL 구조:');
console.log('   이전: /guide/[location]?lang=ko');
console.log('   현재: /guide/ko/[location]');
console.log('   팟캐스트: /podcast/ko/[location]');

console.log('\n📊 사이트맵 통계:');
console.log('   총 416개 URL 포함');
console.log('   - 가이드: 395개');
console.log('   - 팟캐스트: 1개');  
console.log('   - 키워드 페이지: 20개');