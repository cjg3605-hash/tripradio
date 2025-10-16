#!/usr/bin/env node
// 빠른 품질검사 - 새로 생성된 가이드들 중심

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 품질 점수 계산 함수
function calculateQualityScore(guide, content) {
  let score = 0;
  let issues = [];
  
  // 기본 정보 확인 (20점)
  if (guide.locationname && guide.locationname.trim().length > 0) {
    score += 20;
  } else {
    issues.push('locationname 없음');
  }
  
  // 콘텐츠 구조 확인 (80점)
  if (content && content.content && content.content.realTimeGuide) {
    const rtGuide = content.content.realTimeGuide;
    
    // realTimeGuide가 객체 구조인지 확인 (20점)
    if (typeof rtGuide === 'object' && !Array.isArray(rtGuide)) {
      score += 20;
      
      // chapters 배열 확인 (20점)
      if (rtGuide.chapters && Array.isArray(rtGuide.chapters)) {
        score += 20;
        
        // 챕터 수 확인 (10점)
        if (rtGuide.chapters.length >= 3) {
          score += 10;
        } else {
          issues.push(`챕터 수 부족 (${rtGuide.chapters.length}개)`);
        }
        
        // 챕터 내용 확인 (10점)
        let validChapters = 0;
        rtGuide.chapters.forEach(chapter => {
          if (chapter.title && chapter.content && chapter.content.length > 50) {
            validChapters++;
          }
        });
        
        if (validChapters >= 3) {
          score += 10;
        } else {
          issues.push(`유효 챕터 부족 (${validChapters}개)`);
        }
      } else {
        issues.push('chapters 배열 없음');
      }
      
      // introduction 확인 (10점)
      if (rtGuide.introduction && rtGuide.introduction.length > 100) {
        score += 10;
      } else {
        issues.push('introduction 부족');
      }
      
      // coordinates 확인 (10점)  
      if (rtGuide.coordinates && rtGuide.coordinates.lat && rtGuide.coordinates.lng) {
        score += 10;
      } else {
        issues.push('coordinates 없음');
      }
      
    } else if (Array.isArray(rtGuide)) {
      issues.push('realTimeGuide가 배열 구조 (잘못된 구조)');
    } else {
      issues.push('realTimeGuide 잘못된 타입');
    }
    
  } else {
    issues.push('realTimeGuide 없음');
  }
  
  return { score, issues };
}

async function main() {
  try {
    console.log('🔍 빠른 품질검사 시작...');
    
    // 전체 가이드 조회
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content')
      .order('locationname');
    
    if (error) throw error;
    
    console.log(`📊 총 ${guides.length}개 가이드 검사 중...\n`);
    
    let excellentCount = 0;
    let goodCount = 0;
    let acceptableCount = 0;
    let poorCount = 0;
    
    const poorGuides = [];
    const excellentGuides = [];
    
    for (let i = 0; i < guides.length; i++) {
      const guide = guides[i];
      const { score, issues } = calculateQualityScore(guide, guide.content);
      
      let rating = '';
      if (score >= 90) {
        rating = 'excellent';
        excellentCount++;
        excellentGuides.push(`${guide.locationname} (${guide.language}) - ${score}점`);
      } else if (score >= 75) {
        rating = 'good';
        goodCount++;
      } else if (score >= 60) {
        rating = 'acceptable';
        acceptableCount++;
      } else {
        rating = 'poor';
        poorCount++;
        poorGuides.push({
          guide: `${guide.locationname} (${guide.language})`,
          score: score,
          issues: issues.join(', ')
        });
      }
      
      if (i < 10 || rating === 'poor' || rating === 'excellent') {
        console.log(`🔍 [${i + 1}/${guides.length}] ${guide.locationname} (${guide.language})`);
        console.log(`   점수: ${score}점 (${rating})`);
        if (issues.length > 0) {
          console.log(`   이슈: ${issues.join(', ')}`);
        }
        console.log('');
      }
    }
    
    console.log('=' .repeat(60));
    console.log('📊 품질검사 결과 요약');
    console.log('=' .repeat(60));
    console.log(`✅ 우수 (90+점): ${excellentCount}개`);
    console.log(`👍 양호 (75-89점): ${goodCount}개`);  
    console.log(`⚠️ 보통 (60-74점): ${acceptableCount}개`);
    console.log(`❌ 부족 (60점 미만): ${poorCount}개`);
    console.log('');
    
    // 우수한 가이드들
    if (excellentGuides.length > 0) {
      console.log('🌟 우수한 가이드들 (90점 이상):');
      excellentGuides.forEach((guide, index) => {
        console.log(`${index + 1}. ${guide}`);
      });
      console.log('');
    }
    
    // 문제 가이드들
    if (poorGuides.length > 0) {
      console.log('⚠️ 품질 개선 필요 가이드들 (60점 미만):');
      poorGuides.forEach((item, index) => {
        console.log(`${index + 1}. ${item.guide} - ${item.score}점`);
        console.log(`   이슈: ${item.issues}`);
        console.log('');
      });
    }
    
    // Google Search Console 적합성 판단
    const suitableForGSC = excellentCount + goodCount;
    const totalGuides = guides.length;
    const suitabilityRate = ((suitableForGSC / totalGuides) * 100).toFixed(1);
    
    console.log('🔍 Google Search Console URL 검사 적합성:');
    console.log(`적합한 가이드: ${suitableForGSC}개 / ${totalGuides}개 (${suitabilityRate}%)`);
    
    if (suitabilityRate >= 80) {
      console.log('✅ 대부분 가이드가 URL 검사에 적합합니다.');
    } else if (suitabilityRate >= 60) {
      console.log('⚠️ 일부 가이드의 품질 개선이 필요합니다.');
    } else {
      console.log('❌ 전반적인 품질 개선이 필요합니다.');
    }
    
  } catch (error) {
    console.error('❌ 품질검사 실패:', error);
  }
}

main();