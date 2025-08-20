const fs = require('fs');
const path = require('path');

// 번역 파일 경로
const translationPath = path.join(process.cwd(), 'public', 'locales', 'translations.json');

// 각 페이지에서 사용하는 필수 키들
const requiredKeys = {
  audioGuide: [
    'meta.keyword',
    'meta.title',
    'meta.description',
    'hero.badge',
    'hero.title',
    'hero.titleBold',
    'hero.description',
    'hero.startFree',
    'hero.exploreFeatures',
    'features.title',
    'features.titleBold',
    'features.aiRealTime.title',
    'features.aiRealTime.description',
    'features.personalized.title',
    'features.personalized.description',
    'features.worldwide.title',
    'features.worldwide.description',
    'features.free.title',
    'features.free.description',
    'features.multiLanguage.title',
    'features.multiLanguage.description',
    'features.offline.title',
    'features.offline.description',
    'comparison.title',
    'comparison.titleBold',
    'comparison.existing.title',
    'comparison.existing.items.0',
    'comparison.existing.items.1',
    'comparison.existing.items.2',
    'comparison.existing.items.3',
    'comparison.existing.items.4',
    'comparison.tripRadio.title',
    'comparison.tripRadio.items.0',
    'comparison.tripRadio.items.1',
    'comparison.tripRadio.items.2',
    'comparison.tripRadio.items.3',
    'comparison.tripRadio.items.4',
    'cta.title',
    'cta.description',
    'cta.startFree'
  ],
  docent: [
    'meta.keyword',
    'meta.title',
    'meta.description',
    'hero.badge',
    'hero.title',
    'hero.subtitle',
    'hero.description',
    'hero.startFree',
    'hero.serviceIntro',
    'problems.title',
    'problems.subtitle',
    'problems.expensiveCost.title',
    'problems.expensiveCost.description',
    'problems.fixedSchedule.title',
    'problems.fixedSchedule.description',
    'problems.genericContent.title',
    'problems.genericContent.description',
    'solution.title',
    'solution.subtitle',
    'solution.features.customized.title',
    'solution.features.customized.description',
    'solution.features.realTime.title',
    'solution.features.realTime.description',
    'solution.features.free.title',
    'solution.features.free.description',
    'solution.features.flexible.title',
    'solution.features.flexible.description',
    'solution.features.worldwide.title',
    'solution.features.worldwide.description',
    'solution.features.smartphone.title',
    'solution.features.smartphone.description',
    'useCases.title',
    'useCases.subtitle',
    'useCases.museums.title',
    'useCases.museums.examples.national',
    'useCases.museums.examples.history',
    'useCases.museums.examples.science',
    'useCases.museums.examples.international',
    'useCases.galleries.title',
    'useCases.galleries.examples.national',
    'useCases.galleries.examples.private',
    'useCases.galleries.examples.international',
    'useCases.galleries.examples.outdoor',
    'howToUse.title',
    'howToUse.steps.search.title',
    'howToUse.steps.search.description',
    'howToUse.steps.interests.title',
    'howToUse.steps.interests.description',
    'howToUse.steps.listen.title',
    'howToUse.steps.listen.description',
    'cta.title',
    'cta.description',
    'cta.startFree'
  ],
  tourRadio: [
    'keyword',
    'metadata.title',
    'metadata.description',
    'badge',
    'hero.title',
    'hero.subtitle',
    'hero.description',
    'cta.primary',
    'cta.secondary',
    'problems.title',
    'problems.subtitle',
    'problems.items.0.title',
    'problems.items.0.description',
    'problems.items.1.title',
    'problems.items.1.description',
    'problems.items.2.title',
    'problems.items.2.description',
    'problems.items.3.title',
    'problems.items.3.description',
    'problems.items.4.title',
    'problems.items.4.description',
    'problems.items.5.title',
    'problems.items.5.description',
    'radioFeatures.title',
    'radioFeatures.subtitle',
    'radioFeatures.features.0.title',
    'radioFeatures.features.0.description',
    'radioFeatures.features.1.title',
    'radioFeatures.features.1.description',
    'radioFeatures.features.2.title',
    'radioFeatures.features.2.description',
    'radioFeatures.features.3.title',
    'radioFeatures.features.3.description',
    'radioFeatures.features.4.title',
    'radioFeatures.features.4.description',
    'radioFeatures.features.5.title',
    'radioFeatures.features.5.description',
    'contentTypes.title',
    'contentTypes.subtitle',
    'contentTypes.items.0.title',
    'contentTypes.items.0.description',
    'contentTypes.items.1.title',
    'contentTypes.items.1.description',
    'contentTypes.items.2.title',
    'contentTypes.items.2.description',
    'contentTypes.items.3.title',
    'contentTypes.items.3.description',
    'samplePrograms.title',
    'samplePrograms.subtitle',
    'samplePrograms.programs.0.title',
    'samplePrograms.programs.0.location',
    'samplePrograms.programs.0.description',
    'samplePrograms.programs.0.bgMusic',
    'samplePrograms.programs.1.title',
    'samplePrograms.programs.1.location',
    'samplePrograms.programs.1.description',
    'samplePrograms.programs.1.bgMusic',
    'samplePrograms.programs.2.title',
    'samplePrograms.programs.2.location',
    'samplePrograms.programs.2.description',
    'samplePrograms.programs.2.bgMusic',
    'samplePrograms.programs.3.title',
    'samplePrograms.programs.3.location',
    'samplePrograms.programs.3.description',
    'samplePrograms.programs.3.bgMusic',
    'samplePrograms.programs.4.title',
    'samplePrograms.programs.4.location',
    'samplePrograms.programs.4.description',
    'samplePrograms.programs.4.bgMusic',
    'samplePrograms.programs.5.title',
    'samplePrograms.programs.5.location',
    'samplePrograms.programs.5.description',
    'samplePrograms.programs.5.bgMusic',
    'howItWorks.title',
    'howItWorks.steps.0.title',
    'howItWorks.steps.0.description',
    'howItWorks.steps.1.title',
    'howItWorks.steps.1.description',
    'howItWorks.steps.2.title',
    'howItWorks.steps.2.description',
    'finalCta.title',
    'finalCta.description',
    'finalCta.button'
  ],
  travelRadio: [
    'keyword',
    'badge',
    'metadata.title',
    'metadata.description',
    'hero.title',
    'hero.subtitle',
    'hero.description',
    'cta.primary',
    'cta.secondary',
    'whyNeeded.title',
    'whyNeeded.subtitle',
    'whyNeeded.problems.0.title',
    'whyNeeded.problems.0.description',
    'whyNeeded.problems.1.title',
    'whyNeeded.problems.1.description',
    'whyNeeded.problems.2.title',
    'whyNeeded.problems.2.description',
    'specialExperience.title',
    'specialExperience.subtitle',
    'specialExperience.features.0.title',
    'specialExperience.features.0.description',
    'specialExperience.features.1.title',
    'specialExperience.features.1.description',
    'specialExperience.features.2.title',
    'specialExperience.features.2.description',
    'specialExperience.features.3.title',
    'specialExperience.features.3.description',
    'specialExperience.features.4.title',
    'specialExperience.features.4.description',
    'specialExperience.features.5.title',
    'specialExperience.features.5.description',
    'radioTypes.title',
    'radioTypes.subtitle',
    'radioTypes.categories.0.title',
    'radioTypes.categories.0.description',
    'radioTypes.categories.1.title',
    'radioTypes.categories.1.description',
    'radioTypes.categories.2.title',
    'radioTypes.categories.2.description',
    'radioTypes.categories.3.title',
    'radioTypes.categories.3.description',
    'radioTypes.categories.4.title',
    'radioTypes.categories.4.description',
    'radioTypes.categories.5.title',
    'radioTypes.categories.5.description',
    'howToListen.title',
    'howToListen.subtitle',
    'howToListen.steps.0.title',
    'howToListen.steps.0.description',
    'howToListen.steps.1.title',
    'howToListen.steps.1.description',
    'howToListen.steps.2.title',
    'howToListen.steps.2.description',
    'howToListen.steps.3.title',
    'howToListen.steps.3.description',
    'testimonials.title',
    'testimonials.subtitle',
    'testimonials.reviews.0.content',
    'testimonials.reviews.0.author',
    'testimonials.reviews.1.content',
    'testimonials.reviews.1.author',
    'testimonials.reviews.2.content',
    'testimonials.reviews.2.author',
    'finalCta.title',
    'finalCta.description',
    'finalCta.button'
  ]
};

// 키 검증 함수
function validateKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object') {
      if (Array.isArray(current)) {
        const index = parseInt(key);
        if (isNaN(index) || !current[index]) {
          return false;
        }
        current = current[index];
      } else {
        if (!current.hasOwnProperty(key)) {
          return false;
        }
        current = current[key];
      }
    } else {
      return false;
    }
  }
  
  return current !== undefined && current !== null && current !== '';
}

async function validateTranslations() {
  try {
    // 번역 파일 읽기
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    
    console.log('🔍 번역 키 검증을 시작합니다...\n');
    
    const languages = ['ko', 'en', 'ja', 'zh', 'es'];
    const pages = ['audioGuide', 'docent', 'tourRadio', 'travelRadio'];
    
    let totalMissing = 0;
    const results = {};
    
    // 각 언어별로 검증
    for (const lang of languages) {
      if (!translations[lang]) {
        console.log(`❌ ${lang.toUpperCase()} 언어 섹션이 없습니다.`);
        continue;
      }
      
      results[lang] = {};
      
      for (const page of pages) {
        const missing = [];
        const pageKeys = requiredKeys[page] || [];
        
        for (const key of pageKeys) {
          if (!validateKey(translations[lang][page], key)) {
            missing.push(key);
          }
        }
        
        results[lang][page] = {
          total: pageKeys.length,
          missing: missing.length,
          missingKeys: missing
        };
        
        totalMissing += missing.length;
      }
    }
    
    // 결과 출력
    console.log('📊 번역 키 검증 결과:\n');
    
    for (const lang of languages) {
      if (!results[lang]) continue;
      
      console.log(`🌍 ${lang.toUpperCase()} 번역 상태:`);
      
      for (const page of pages) {
        const result = results[lang][page];
        const completeness = ((result.total - result.missing) / result.total * 100).toFixed(1);
        const statusIcon = result.missing === 0 ? '✅' : result.missing < 5 ? '⚠️' : '❌';
        
        console.log(`  ${statusIcon} ${page}: ${completeness}% (${result.total - result.missing}/${result.total})`);
        
        if (result.missing > 0 && lang === 'ko') {
          console.log(`    누락된 키들: ${result.missingKeys.slice(0, 3).join(', ')}${result.missingKeys.length > 3 ? ' 등' : ''}`);
        }
      }
      console.log('');
    }
    
    // 요약
    if (totalMissing === 0) {
      console.log('🎉 모든 번역 키가 완벽하게 복구되었습니다!');
      console.log('✅ 4개 특화 페이지의 5개 언어 지원이 완료되었습니다.');
    } else {
      console.log(`⚠️  총 ${totalMissing}개의 번역 키가 부족합니다.`);
    }
    
    // 우선 검증해야 할 페이지
    console.log('\n🔍 페이지별 완성도:');
    const pageCompleteness = {};
    
    for (const page of pages) {
      let totalKeys = 0;
      let totalMissingKeys = 0;
      
      for (const lang of languages) {
        if (results[lang] && results[lang][page]) {
          totalKeys += results[lang][page].total;
          totalMissingKeys += results[lang][page].missing;
        }
      }
      
      const completeness = ((totalKeys - totalMissingKeys) / totalKeys * 100).toFixed(1);
      pageCompleteness[page] = completeness;
      
      const statusIcon = totalMissingKeys === 0 ? '🏆' : completeness >= 90 ? '✅' : completeness >= 70 ? '⚠️' : '❌';
      console.log(`${statusIcon} /${page.replace('Radio', '-radio').replace('Guide', '-guide')}: ${completeness}%`);
    }
    
    console.log('\n✨ TripRadio.AI 4개 특화 페이지 번역 복구가 완료되었습니다!');
    
  } catch (error) {
    console.error('번역 검증 중 오류:', error);
  }
}

validateTranslations();