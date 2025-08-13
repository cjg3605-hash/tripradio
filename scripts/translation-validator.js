#!/usr/bin/env node
/**
 * 번역키 품질 검증 도구
 * - 누락된 번역키 감지
 * - 사용되지 않는 번역키 감지
 * - 번역 일관성 검사
 * - 자동 수정 제안
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class TranslationValidator {
  constructor() {
    this.translationsPath = 'C:\\GUIDEAI\\public\\locales\\translations.json';
    this.srcPath = 'C:\\GUIDEAI\\src';
    this.issues = {
      missingKeys: [],
      unusedKeys: [],
      missingTranslations: [],
      inconsistencies: []
    };
  }

  // translations.json 로드
  loadTranslations() {
    if (!fs.existsSync(this.translationsPath)) {
      throw new Error('translations.json 파일이 없습니다.');
    }
    
    return JSON.parse(fs.readFileSync(this.translationsPath, 'utf-8'));
  }

  // 모든 소스 파일에서 사용된 번역키 추출
  extractUsedKeys() {
    const usedKeys = new Set();
    const files = glob.sync('**/*.{tsx,ts,js,jsx}', { cwd: this.srcPath, absolute: true });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // t('key') 패턴 추출
      const matches = content.match(/t\(['"`]([^'"`]+)['"`]\)/g) || [];
      matches.forEach(match => {
        const key = match.match(/t\(['"`]([^'"`]+)['"`]\)/)[1];
        usedKeys.add(key);
      });
      
      // {t('key')} 패턴도 추출
      const jsxMatches = content.match(/\{t\(['"`]([^'"`]+)['"`]\)\}/g) || [];
      jsxMatches.forEach(match => {
        const key = match.match(/\{t\(['"`]([^'"`]+)['"`]\)\}/)[1];
        usedKeys.add(key);
      });
    });
    
    return usedKeys;
  }

  // 번역 파일의 모든 키 추출 (재귀적으로)
  extractTranslationKeys(obj, prefix = '') {
    const keys = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractTranslationKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    });
    
    return keys;
  }

  // 하드코딩된 한글 텍스트 감지
  findHardcodedKoreanText() {
    const hardcodedTexts = [];
    const files = glob.sync('**/*.{tsx,ts}', { cwd: this.srcPath, absolute: true });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.srcPath, file);
      
      // 한글 텍스트 패턴 매칭
      const patterns = [
        />[^<]*[가-힣][^<]*</g,  // JSX 내 한글
        /["'][^"']*[가-힣][^"']*["']/g,  // 문자열 내 한글
        /`[^`]*[가-힣][^`]*`/g  // 템플릿 리터럴 내 한글
      ];
      
      patterns.forEach((pattern, index) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          const text = match[0]
            .replace(/^[>"'`\s]+/, '')
            .replace(/[<"'`\s]+$/, '')
            .trim();
          
          if (text && text.length > 1) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            hardcodedTexts.push({
              file: relativePath,
              line: lineNumber,
              text: text,
              pattern: ['jsx', 'string', 'template'][index]
            });
          }
        });
      });
    });
    
    return hardcodedTexts;
  }

  // 번역 일관성 검사
  checkTranslationConsistency(translations) {
    const inconsistencies = [];
    const languages = Object.keys(translations);
    
    if (languages.length < 2) return inconsistencies;
    
    // 첫 번째 언어를 기준으로 다른 언어들과 비교
    const baseLanguage = languages[0];
    const baseKeys = this.extractTranslationKeys(translations[baseLanguage]);
    
    languages.slice(1).forEach(lang => {
      const langKeys = this.extractTranslationKeys(translations[lang]);
      
      // 누락된 키 찾기
      baseKeys.forEach(key => {
        if (!langKeys.includes(key)) {
          inconsistencies.push({
            type: 'missing_translation',
            language: lang,
            key: key,
            baseValue: this.getNestedValue(translations[baseLanguage], key)
          });
        }
      });
      
      // 추가된 키 찾기
      langKeys.forEach(key => {
        if (!baseKeys.includes(key)) {
          inconsistencies.push({
            type: 'extra_translation',
            language: lang,
            key: key,
            value: this.getNestedValue(translations[lang], key)
          });
        }
      });
    });
    
    return inconsistencies;
  }

  // 중첩된 객체에서 값 추출
  getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => o && o[k], obj);
  }

  // 전체 검증 실행
  validate() {
    console.log('🔍 번역키 품질 검증 시작...\n');
    
    try {
      // 1. 번역 파일 로드
      const translations = this.loadTranslations();
      console.log('✅ translations.json 로드 완료');
      
      // 2. 사용된 키와 정의된 키 비교
      const usedKeys = this.extractUsedKeys();
      const definedKeys = {};
      
      Object.keys(translations).forEach(lang => {
        definedKeys[lang] = this.extractTranslationKeys(translations[lang]);
      });
      
      console.log(`📊 사용된 키: ${usedKeys.size}개`);
      console.log(`📊 정의된 키: ${definedKeys.ko?.length || 0}개 (한국어 기준)`);
      
      // 3. 누락된 키 찾기
      if (definedKeys.ko) {
        usedKeys.forEach(key => {
          if (!definedKeys.ko.includes(key)) {
            this.issues.missingKeys.push(key);
          }
        });
      }
      
      // 4. 사용되지 않는 키 찾기
      if (definedKeys.ko) {
        definedKeys.ko.forEach(key => {
          if (!usedKeys.has(key)) {
            this.issues.unusedKeys.push(key);
          }
        });
      }
      
      // 5. 하드코딩된 텍스트 찾기
      const hardcodedTexts = this.findHardcodedKoreanText();
      console.log(`📊 하드코딩된 텍스트: ${hardcodedTexts.length}개`);
      
      // 6. 번역 일관성 검사
      const inconsistencies = this.checkTranslationConsistency(translations);
      this.issues.inconsistencies = inconsistencies;
      
      // 7. 결과 출력
      this.printResults(hardcodedTexts);
      
      // 8. 수정 제안 생성
      this.generateFixSuggestions(hardcodedTexts);
      
    } catch (error) {
      console.error('❌ 검증 중 오류:', error.message);
    }
  }

  // 검증 결과 출력
  printResults(hardcodedTexts) {
    console.log('\n📋 검증 결과:');
    console.log('================');
    
    if (this.issues.missingKeys.length > 0) {
      console.log(`\n❌ 누락된 번역키 (${this.issues.missingKeys.length}개):`);
      this.issues.missingKeys.slice(0, 10).forEach(key => {
        console.log(`  - ${key}`);
      });
      if (this.issues.missingKeys.length > 10) {
        console.log(`  ... 그 외 ${this.issues.missingKeys.length - 10}개`);
      }
    }
    
    if (this.issues.unusedKeys.length > 0) {
      console.log(`\n⚠️  사용되지 않는 번역키 (${this.issues.unusedKeys.length}개):`);
      this.issues.unusedKeys.slice(0, 10).forEach(key => {
        console.log(`  - ${key}`);
      });
      if (this.issues.unusedKeys.length > 10) {
        console.log(`  ... 그 외 ${this.issues.unusedKeys.length - 10}개`);
      }
    }
    
    if (hardcodedTexts.length > 0) {
      console.log(`\n🚨 하드코딩된 한글 텍스트 (${hardcodedTexts.length}개):`);
      hardcodedTexts.slice(0, 20).forEach(item => {
        console.log(`  - ${item.file}:${item.line} "${item.text}"`);
      });
      if (hardcodedTexts.length > 20) {
        console.log(`  ... 그 외 ${hardcodedTexts.length - 20}개`);
      }
    }
    
    if (this.issues.inconsistencies.length > 0) {
      console.log(`\n🔄 번역 불일치 (${this.issues.inconsistencies.length}개):`);
      this.issues.inconsistencies.slice(0, 10).forEach(issue => {
        console.log(`  - [${issue.language}] ${issue.key}: ${issue.type}`);
      });
    }
  }

  // 수정 제안 생성
  generateFixSuggestions(hardcodedTexts) {
    const suggestions = {
      priority1: [], // 도구 페이지들
      priority2: [], // 메인 페이지
      priority3: []  // 기타
    };
    
    const priority1Files = ['trip-planner', 'nomad-calculator', 'film-locations', 'visa-checker', 'travel'];
    const priority2Files = ['page.tsx', 'destinations'];
    
    hardcodedTexts.forEach(item => {
      const fileName = path.basename(item.file, '.tsx');
      
      let priority = 'priority3';
      if (priority1Files.some(p => item.file.includes(p))) priority = 'priority1';
      else if (priority2Files.some(p => item.file.includes(p))) priority = 'priority2';
      
      suggestions[priority].push({
        file: item.file,
        line: item.line,
        text: item.text,
        suggestedKey: this.suggestTranslationKey(item.file, item.text)
      });
    });
    
    // 제안 사항을 파일로 저장
    fs.writeFileSync(
      'C:\\GUIDEAI\\scripts\\fix-suggestions.json',
      JSON.stringify({
        summary: {
          missingKeys: this.issues.missingKeys.length,
          unusedKeys: this.issues.unusedKeys.length,
          hardcodedTexts: hardcodedTexts.length,
          inconsistencies: this.issues.inconsistencies.length
        },
        suggestions,
        issues: this.issues
      }, null, 2),
      'utf-8'
    );
    
    console.log('\n📄 수정 제안 저장: C:\\GUIDEAI\\scripts\\fix-suggestions.json');
  }

  // 번역키 제안
  suggestTranslationKey(filePath, text) {
    const fileName = path.basename(filePath, '.tsx');
    const namespaceMap = {
      'trip-planner': 'tools.tripPlanner',
      'nomad-calculator': 'tools.nomadCalculator',
      'film-locations': 'tools.filmLocations',
      'visa-checker': 'tools.visaChecker',
      'travel': 'pages.travel'
    };
    
    const namespace = namespaceMap[fileName] || `pages.${fileName}`;
    const key = text.substring(0, 15).replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();
    
    return `${namespace}.${key}`;
  }
}

// 실행
if (require.main === module) {
  const validator = new TranslationValidator();
  validator.validate();
}

module.exports = TranslationValidator;