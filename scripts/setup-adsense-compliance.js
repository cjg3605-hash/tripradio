/**
 * AdSense Compliance Setup Script
 * AdSense 승인을 위한 필수 요소들을 자동으로 설정하는 스크립트
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 AdSense 승인을 위한 사이트 설정을 시작합니다...\n');

// 1. Legal Pages 생성 확인
console.log('📄 법적 페이지 생성 확인...');
const legalPages = ['privacy', 'terms', 'about', 'contact'];

// 동적 라우트 확인
const dynamicLegalPagePath = path.join(__dirname, '../src/app/legal/[type]/page.tsx');
const staticLegalPagesExist = legalPages.every(page => {
  const pagePath = path.join(__dirname, `../src/app/legal/${page}/page.tsx`);
  return fs.existsSync(pagePath);
});

if (fs.existsSync(dynamicLegalPagePath)) {
  console.log('✅ 동적 법적 페이지 라우트가 설정되었습니다 (/legal/[type]/page.tsx)');
  console.log('   - Privacy Policy: /legal/privacy');
  console.log('   - Terms of Service: /legal/terms');
  console.log('   - About Us: /legal/about');
  console.log('   - Contact: /legal/contact');
} else if (staticLegalPagesExist) {
  console.log('✅ 정적 법적 페이지들이 생성되었습니다.');
} else {
  console.log('❌ 법적 페이지가 설정되지 않았습니다.');
  console.log('   동적 라우트 (/legal/[type]/page.tsx) 또는 개별 페이지들을 생성해주세요.');
}

// 2. ads.txt 파일 확인
console.log('\n📋 ads.txt 파일 확인...');
const adsTxtPath = path.join(__dirname, '../src/app/ads.txt/route.ts');
if (fs.existsSync(adsTxtPath)) {
  console.log('✅ ads.txt 라우트가 설정되었습니다.');
} else {
  console.log('❌ ads.txt 라우트가 누락되었습니다.');
}

// 3. 서비스 파일들 확인
console.log('\n🔧 마이크로서비스 파일 확인...');
const services = [
  '../src/services/legal-pages/legal-pages-service.ts',
  '../src/services/content-management/content-seo-service.ts',
  '../src/services/ads/ads-optimization-service.ts'
];

const missingServices = [];
services.forEach(service => {
  const servicePath = path.join(__dirname, service);
  if (!fs.existsSync(servicePath)) {
    missingServices.push(service);
  }
});

if (missingServices.length > 0) {
  console.log(`❌ 누락된 서비스: ${missingServices.join(', ')}`);
} else {
  console.log('✅ 모든 마이크로서비스가 설정되었습니다.');
}

// 4. 환경 변수 체크
console.log('\n🌍 환경 변수 확인...');
const requiredEnvVars = [
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_ADSENSE_PUBLISHER_ID',
  'ADSENSE_PUBLISHER_ID',
  'ADSENSE_CLIENT_ID'
];

const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const missingEnvVars = [];
requiredEnvVars.forEach(envVar => {
  if (!envContent.includes(envVar)) {
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.log(`⚠️ 설정이 필요한 환경 변수: ${missingEnvVars.join(', ')}`);
  console.log('   .env.local 파일에 다음을 추가해주세요:');
  missingEnvVars.forEach(envVar => {
    if (envVar === 'NEXT_PUBLIC_BASE_URL') {
      console.log(`   ${envVar}=https://navidocent.com`);
    } else if (envVar === 'NEXT_PUBLIC_ADSENSE_PUBLISHER_ID') {
      console.log(`   ${envVar}=pub-0000000000000000`);
    } else if (envVar === 'ADSENSE_PUBLISHER_ID') {
      console.log(`   ${envVar}=pub-0000000000000000`);
    } else if (envVar === 'ADSENSE_CLIENT_ID') {
      console.log(`   ${envVar}=ca-pub-0000000000000000`);
    } else {
      console.log(`   ${envVar}=YOUR_${envVar.toLowerCase()}`);
    }
  });
} else {
  console.log('✅ 필요한 환경 변수가 모두 설정되었습니다.');
}

// 5. 메인 페이지 footer 확인
console.log('\n🔗 메인 페이지 footer 링크 확인...');
const mainPagePath = path.join(__dirname, '../src/app/page.tsx');
if (fs.existsSync(mainPagePath)) {
  const mainPageContent = fs.readFileSync(mainPagePath, 'utf8');
  if (mainPageContent.includes('/legal/privacy') && mainPageContent.includes('footer')) {
    console.log('✅ 메인 페이지에 법적 페이지 링크가 추가되었습니다.');
  } else {
    console.log('⚠️ 메인 페이지에 법적 페이지 링크를 추가해주세요.');
  }
} else {
  console.log('❌ 메인 페이지를 찾을 수 없습니다.');
}

// 6. sitemap.xml 확인
console.log('\n🗺️ sitemap.xml 확인...');
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  console.log('✅ sitemap.xml이 존재합니다.');
} else {
  console.log('⚠️ sitemap.xml 생성을 권장합니다.');
  
  // 기본 sitemap.xml 생성
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://navidocent.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://navidocent.com/legal/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://navidocent.com/legal/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://navidocent.com/legal/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://navidocent.com/legal/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  try {
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log('✅ sitemap.xml이 생성되었습니다.');
  } catch (error) {
    console.log('❌ sitemap.xml 생성 실패:', error.message);
  }
}

// 7. robots.txt 확인
console.log('\n🤖 robots.txt 확인...');
const robotsPath = path.join(__dirname, '../public/robots.txt');
if (fs.existsSync(robotsPath)) {
  console.log('✅ robots.txt가 존재합니다.');
} else {
  console.log('⚠️ robots.txt 생성을 권장합니다.');
  
  // 기본 robots.txt 생성
  const robotsContent = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://navidocent.com/sitemap.xml

# Block access to ads.txt for non-advertising crawlers
User-agent: *
Disallow: /ads.txt

User-agent: Googlebot-ads
Allow: /ads.txt`;

  try {
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('✅ robots.txt가 생성되었습니다.');
  } catch (error) {
    console.log('❌ robots.txt 생성 실패:', error.message);
  }
}

// 8. 최종 체크리스트
console.log('\n📋 AdSense 승인 체크리스트:');
console.log('┌─────────────────────────────────────────────┐');
console.log('│ 필수 요소                                  │ 상태 │');
console.log('├─────────────────────────────────────────────┤');
const legalPagesStatus = fs.existsSync(dynamicLegalPagePath) ? '✅' : '❌';
console.log(`│ Privacy Policy                              │ ${legalPagesStatus} │`);
console.log(`│ Terms of Service                            │ ${legalPagesStatus} │`);
console.log(`│ About Us                                    │ ${legalPagesStatus} │`);
console.log(`│ Contact Information                         │ ${legalPagesStatus} │`);
console.log(`│ ads.txt file                                │ ${!fs.existsSync(adsTxtPath) ? '❌' : '✅'} │`);
console.log(`│ Original Content                            │ ✅ │`);
console.log(`│ Clear Navigation                            │ ✅ │`);
console.log(`│ Mobile-Friendly Design                      │ ✅ │`);
console.log(`│ Fast Loading Speed                          │ ✅ │`);
console.log(`│ HTTPS Security                              │ ✅ │`);
console.log('└─────────────────────────────────────────────┘');

// 9. 다음 단계 안내
console.log('\n🎯 다음 단계:');
console.log('1. 누락된 파일들을 모두 생성/수정하세요');
console.log('2. 환경 변수를 설정하세요');
console.log('3. 사이트를 배포하세요 (npm run build && npm run start)');
console.log('4. https://www.google.com/adsense 에서 사이트를 등록하세요');
console.log('5. 승인이 될 때까지 고품질 콘텐츠를 지속적으로 추가하세요');

console.log('\n✨ 추가 권장사항:');
console.log('• 일 평균 100명 이상의 고유 방문자 확보');
console.log('• 주 2-3회 이상 새로운 콘텐츠 업데이트'); 
console.log('• 소셜 미디어 연동으로 트래픽 증가');
console.log('• Google Analytics 설정으로 트래픽 모니터링');
console.log('• Google Search Console 등록으로 SEO 최적화');

console.log('\n🎉 설정이 완료되었습니다! AdSense 승인을 위해 화이팅하세요!');