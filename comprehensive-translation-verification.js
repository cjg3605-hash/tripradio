const fs = require('fs');
const path = require('path');

// 번역 파일 읽기
const translationsPath = path.join(__dirname, 'public/locales/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 검증할 페이지 목록
const pagesToVerify = [
  {
    name: 'audio-guide',
    filePath: 'src/app/audio-guide/page.tsx',
    translationNamespace: 'audioGuide'
  },
  {
    name: 'ai-travel', 
    filePath: 'src/app/ai-travel/page.tsx',
    translationNamespace: 'aiTravel'
  },
  {
    name: 'nomad-calculator',
    filePath: 'src/app/nomad-calculator/page.tsx', 
    translationNamespace: 'nomadCalculator'
  },
  {
    name: 'film-locations',
    filePath: 'src/app/film-locations/page.tsx',
    translationNamespace: 'filmLocations'
  },
  {
    name: 'visa-checker',
    filePath: 'src/app/visa-checker/page.tsx',
    translationNamespace: 'visaChecker'
  },
  {
    name: 'tour-radio',
    filePath: 'src/app/tour-radio/page.tsx',
    translationNamespace: 'tourRadio'
  },
  {
    name: 'travel-radio',
    filePath: 'src/app/travel-radio/page.tsx', 
    translationNamespace: 'travelRadio'
  },
  {
    name: 'docent',
    filePath: 'src/app/docent/page.tsx',
    translationNamespace: 'docent'
  }
];

const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es'];

/**
 * 파일에서 번역키 추출 및 namespace 감지
 */
function extractTranslationKeys(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  파일을 찾을 수 없습니다: ${fullPath}`);
    return { keys: [], detectedNamespace: null };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // useTranslations 패턴으로 네임스페이스 감지
  const namespacePattern = /useTranslations\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/;
  const namespaceMatch = content.match(namespacePattern);
  const detectedNamespace = namespaceMatch ? namespaceMatch[1] : null;
  
  // t('key') 패턴 매칭
  const tFunctionPattern = /t\(['"`]([^'"`]+)['"`]\)/g;
  // t.raw('key') 패턴 매칭  
  const tRawPattern = /t\.raw\(['"`]([^'"`]+)['"`]\)/g;
  
  const keys = new Set();
  let match;
  
  // t() 함수 호출 추출
  while ((match = tFunctionPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  // t.raw() 함수 호출 추출
  while ((match = tRawPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return { 
    keys: Array.from(keys).sort(), 
    detectedNamespace 
  };
}

/**
 * 번역키가 주어진 네임스페이스에서 존재하는지 확인
 */
function checkTranslationExists(translationKey, namespace, language) {
  const langTranslations = translations[language];
  if (!langTranslations) return false;
  
  const namespaceTranslations = langTranslations[namespace];
  if (!namespaceTranslations) return false;
  
  // 중첩 키 처리 (예: 'meta.title')
  const keyParts = translationKey.split('.');
  let current = namespaceTranslations;
  
  for (const part of keyParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  
  return current !== undefined && current !== null;
}

/**
 * 메인 검증 함수
 */
function verifyTranslations() {
  console.log('🔍 주요 서비스 페이지 번역키 검증 시작\n');
  
  const verificationResults = {
    totalPages: pagesToVerify.length,
    totalLanguages: supportedLanguages.length,
    pageResults: [],
    summary: {
      totalKeysFound: 0,
      totalMissingKeys: 0,
      missingByLanguage: {},
      missingByPage: {}
    }
  };

  // 언어별 누락 키 초기화
  supportedLanguages.forEach(lang => {
    verificationResults.summary.missingByLanguage[lang] = 0;
  });

  for (const page of pagesToVerify) {
    console.log(`📄 ${page.name} 페이지 검증 중...`);
    
    // 파일에서 번역키 추출
    const extractionResult = extractTranslationKeys(page.filePath);
    const extractedKeys = extractionResult.keys;
    const detectedNamespace = extractionResult.detectedNamespace;
    
    // 실제 감지된 네임스페이스와 설정된 네임스페이스 비교
    const actualNamespace = detectedNamespace || page.translationNamespace;
    if (detectedNamespace && detectedNamespace !== page.translationNamespace) {
      console.log(`   ⚠️  네임스페이스 불일치: 설정=${page.translationNamespace}, 감지=${detectedNamespace}`);
    }
    
    console.log(`   발견된 번역키: ${extractedKeys.length}개`);
    console.log(`   사용 네임스페이스: ${actualNamespace}`);
    
    const pageResult = {
      pageName: page.name,
      namespace: actualNamespace,
      extractedKeys: extractedKeys,
      totalKeys: extractedKeys.length,
      missingKeys: {},
      languageStatus: {}
    };

    // 각 언어별로 번역키 존재 여부 확인
    supportedLanguages.forEach(lang => {
      const missingKeysForLang = [];
      const existingKeysForLang = [];
      
      extractedKeys.forEach(key => {
        const exists = checkTranslationExists(key, actualNamespace, lang);
        if (exists) {
          existingKeysForLang.push(key);
        } else {
          missingKeysForLang.push(key);
        }
      });
      
      pageResult.missingKeys[lang] = missingKeysForLang;
      pageResult.languageStatus[lang] = {
        total: extractedKeys.length,
        existing: existingKeysForLang.length,
        missing: missingKeysForLang.length,
        completeness: extractedKeys.length > 0 ? 
          Math.round((existingKeysForLang.length / extractedKeys.length) * 100) : 100
      };
      
      // 전체 통계 업데이트
      verificationResults.summary.missingByLanguage[lang] += missingKeysForLang.length;
    });
    
    verificationResults.pageResults.push(pageResult);
    verificationResults.summary.totalKeysFound += extractedKeys.length;
    verificationResults.summary.missingByPage[page.name] = 
      Object.values(pageResult.missingKeys).reduce((sum, keys) => sum + keys.length, 0);
  }

  // 전체 누락 키 수 계산
  verificationResults.summary.totalMissingKeys = 
    Object.values(verificationResults.summary.missingByLanguage).reduce((sum, count) => sum + count, 0);

  return verificationResults;
}

/**
 * 결과 리포트 생성
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 번역키 검증 결과 리포트');
  console.log('='.repeat(80));
  
  console.log(`\n📈 전체 요약:`);
  console.log(`   • 검증 페이지: ${results.totalPages}개`);
  console.log(`   • 지원 언어: ${results.totalLanguages}개`);
  console.log(`   • 총 발견 번역키: ${results.summary.totalKeysFound}개`);
  console.log(`   • 총 누락 번역키: ${results.summary.totalMissingKeys}개`);
  
  if (results.summary.totalMissingKeys > 0) {
    console.log('\n❌ 언어별 누락 통계:');
    supportedLanguages.forEach(lang => {
      const missing = results.summary.missingByLanguage[lang];
      const langName = { ko: '한국어', en: '영어', ja: '일본어', zh: '중국어', es: '스페인어' }[lang];
      console.log(`   • ${langName} (${lang}): ${missing}개 누락`);
    });
    
    console.log('\n📄 페이지별 누락 통계:');
    Object.entries(results.summary.missingByPage).forEach(([page, count]) => {
      if (count > 0) {
        console.log(`   • ${page}: ${count}개 누락`);
      }
    });
  } else {
    console.log('\n✅ 모든 번역키가 완벽하게 설정되어 있습니다!');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 페이지별 세부 결과');
  console.log('='.repeat(80));
  
  results.pageResults.forEach(page => {
    console.log(`\n📄 ${page.pageName} (${page.namespace})`);
    console.log(`   총 번역키: ${page.totalKeys}개`);
    
    supportedLanguages.forEach(lang => {
      const status = page.languageStatus[lang];
      const langName = { ko: '한국어', en: '영어', ja: '일본어', zh: '중국어', es: '스페인어' }[lang];
      const statusIcon = status.completeness === 100 ? '✅' : status.completeness >= 50 ? '⚠️' : '❌';
      
      console.log(`   ${statusIcon} ${langName}: ${status.existing}/${status.total} (${status.completeness}%)`);
      
      if (status.missing > 0) {
        console.log(`      누락 키: ${page.missingKeys[lang].slice(0, 3).join(', ')}${page.missingKeys[lang].length > 3 ? '...' : ''}`);
      }
    });
  });
  
  // 상세 누락 키 목록 (필요시)
  const hasDetailedMissing = results.pageResults.some(page => 
    Object.values(page.missingKeys).some(keys => keys.length > 0)
  );
  
  if (hasDetailedMissing) {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 상세 누락 번역키 목록');
    console.log('='.repeat(80));
    
    results.pageResults.forEach(page => {
      const hasMissing = Object.values(page.missingKeys).some(keys => keys.length > 0);
      if (hasMissing) {
        console.log(`\n📄 ${page.pageName}:`);
        supportedLanguages.forEach(lang => {
          if (page.missingKeys[lang].length > 0) {
            const langName = { ko: '한국어', en: '영어', ja: '일본어', zh: '중국어', es: '스페인어' }[lang];
            console.log(`   ${langName} (${lang}) - ${page.missingKeys[lang].length}개 누락:`);
            page.missingKeys[lang].forEach(key => {
              console.log(`     • ${page.namespace}.${key}`);
            });
          }
        });
      }
    });
  }
}

/**
 * JSON 리포트 저장
 */
function saveDetailedReport(results) {
  const reportPath = path.join(__dirname, `translation-verification-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 상세 리포트 저장됨: ${reportPath}`);
}

// 실행
console.log('🚀 TripRadio.AI 주요 서비스 페이지 번역키 검증 도구');
console.log('='.repeat(60));

try {
  const results = verifyTranslations();
  generateReport(results);
  saveDetailedReport(results);
  
  // 성공/실패 상태 출력
  if (results.summary.totalMissingKeys === 0) {
    console.log('\n🎉 모든 번역키 검증 완료! 문제 없음');
    process.exit(0);
  } else {
    console.log(`\n⚠️  총 ${results.summary.totalMissingKeys}개의 번역키가 누락되었습니다.`);
    console.log('📝 위의 상세 목록을 참고하여 번역을 추가해주세요.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ 검증 중 오류 발생:', error);
  process.exit(1);
}