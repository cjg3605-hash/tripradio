#!/usr/bin/env node
/**
 * 대규모 번역키 마이그레이션 분석 도구
 * - 하드코딩된 한글 텍스트 자동 추출
 * - 번역키 구조 자동 생성
 * - 중복 제거 및 최적화
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class TranslationAnalyzer {
  constructor() {
    this.extractedTexts = new Map();
    this.keyCounter = 0;
    this.duplicates = new Map();
    this.patterns = {
      // React 컴포넌트 내 한글 텍스트
      jsxText: />[^<]*[가-힣][^<]*</g,
      // 문자열 리터럴 내 한글
      stringLiteral: /["'][^"']*[가-힣][^"']*["']/g,
      // 템플릿 리터럴 내 한글
      templateLiteral: /`[^`]*[가-힣][^`]*`/g,
      // 객체 속성값 내 한글
      objectValue: /:\s*["'][^"']*[가-힣][^"']*["']/g
    };
  }

  // 파일 분석 및 한글 텍스트 추출
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    console.log(`🔍 분석 중: ${relativePath}`);
    
    const results = {
      file: relativePath,
      texts: [],
      contexts: []
    };

    // 각 패턴별로 한글 텍스트 추출
    Object.entries(this.patterns).forEach(([patternName, regex]) => {
      const matches = [...content.matchAll(regex)];
      
      matches.forEach(match => {
        const text = this.cleanText(match[0]);
        if (text && text.length > 1) {
          const context = this.getContext(content, match.index);
          const key = this.generateKey(filePath, text, context);
          
          results.texts.push({
            original: text,
            key: key,
            context: context,
            pattern: patternName,
            line: this.getLineNumber(content, match.index)
          });

          // 중복 체크
          if (this.duplicates.has(text)) {
            this.duplicates.get(text).push(relativePath);
          } else {
            this.duplicates.set(text, [relativePath]);
          }
        }
      });
    });

    return results;
  }

  // 텍스트 정리
  cleanText(text) {
    return text
      .replace(/^[>"'`\s]+/, '')
      .replace(/[<"'`\s]+$/, '')
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 컨텍스트 추출 (번역키 구조화를 위해)
  getContext(content, index) {
    // 컴포넌트명 추출
    const componentMatch = content.match(/function\s+(\w+)|const\s+(\w+)\s*=/);
    const componentName = componentMatch ? (componentMatch[1] || componentMatch[2]) : 'Unknown';
    
    // 주변 코드 분석하여 섹션 파악
    const beforeText = content.substring(Math.max(0, index - 200), index);
    const afterText = content.substring(index, index + 100);
    
    let section = 'general';
    
    if (beforeText.includes('hero') || beforeText.includes('Hero')) section = 'hero';
    else if (beforeText.includes('title') || beforeText.includes('Title')) section = 'title';
    else if (beforeText.includes('description')) section = 'description';
    else if (beforeText.includes('button') || beforeText.includes('Button')) section = 'button';
    else if (beforeText.includes('footer') || beforeText.includes('Footer')) section = 'footer';
    else if (beforeText.includes('nav') || beforeText.includes('Nav')) section = 'navigation';
    else if (beforeText.includes('form') || beforeText.includes('Form')) section = 'form';
    else if (beforeText.includes('filter') || beforeText.includes('Filter')) section = 'filter';
    else if (beforeText.includes('card') || beforeText.includes('Card')) section = 'card';
    else if (beforeText.includes('modal') || beforeText.includes('Modal')) section = 'modal';
    
    return { component: componentName, section };
  }

  // 번역키 자동 생성
  generateKey(filePath, text, context) {
    const fileName = path.basename(filePath, '.tsx').replace(/[^a-zA-Z0-9]/g, '');
    const contextPath = `${context.section}`;
    const textKey = text
      .substring(0, 30)
      .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    
    return `tools.${fileName}.${contextPath}.${textKey}${this.keyCounter++}`;
  }

  // 라인 번호 계산
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // 전체 프로젝트 분석
  analyzeProject(srcPath = 'C:\\GUIDEAI\\src\\app') {
    console.log('🚀 프로젝트 전체 번역키 분석 시작...\n');
    
    const files = glob.sync('**/*.tsx', { cwd: srcPath, absolute: true });
    const results = [];
    const summary = {
      totalFiles: files.length,
      totalTexts: 0,
      duplicateTexts: 0,
      suggestedKeys: []
    };

    files.forEach(file => {
      const result = this.analyzeFile(file);
      results.push(result);
      summary.totalTexts += result.texts.length;
    });

    // 중복 텍스트 분석
    this.duplicates.forEach((files, text) => {
      if (files.length > 1) {
        summary.duplicateTexts++;
        console.log(`🔄 중복: "${text}" → ${files.join(', ')}`);
      }
    });

    // 번역키 구조 제안
    summary.suggestedKeys = this.generateTranslationStructure(results);

    return { results, summary };
  }

  // 번역키 구조 자동 생성
  generateTranslationStructure(results) {
    const structure = {};

    results.forEach(result => {
      const fileName = path.basename(result.file, '.tsx');
      if (!structure[fileName]) structure[fileName] = {};

      result.texts.forEach(textInfo => {
        const section = textInfo.context.section;
        if (!structure[fileName][section]) structure[fileName][section] = {};
        
        const keyName = textInfo.key.split('.').pop();
        structure[fileName][section][keyName] = textInfo.original;
      });
    });

    return structure;
  }

  // 결과를 JSON 파일로 저장
  saveResults(results, outputPath = 'C:\\GUIDEAI\\scripts\\translation-analysis.json') {
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n📄 분석 결과 저장: ${outputPath}`);
  }
}

// 실행
if (require.main === module) {
  const analyzer = new TranslationAnalyzer();
  const { results, summary } = analyzer.analyzeProject();
  
  console.log('\n📊 분석 완료 요약:');
  console.log(`- 총 파일: ${summary.totalFiles}개`);
  console.log(`- 추출된 텍스트: ${summary.totalTexts}개`);
  console.log(`- 중복 텍스트: ${summary.duplicateTexts}개`);
  
  analyzer.saveResults({ results, summary });
  
  // 제안된 번역키 구조를 별도 파일로 저장
  fs.writeFileSync(
    'C:\\GUIDEAI\\scripts\\suggested-translation-keys.json', 
    JSON.stringify(summary.suggestedKeys, null, 2), 
    'utf-8'
  );
  console.log('📋 제안된 번역키 구조: C:\\GUIDEAI\\scripts\\suggested-translation-keys.json');
}

module.exports = TranslationAnalyzer;