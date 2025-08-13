#!/usr/bin/env node
/**
 * 자동 번역키 마이그레이션 도구
 * - 하드코딩 텍스트 → 번역키로 자동 변환
 * - translations.json 자동 업데이트
 * - 파일 백업 및 복구 시스템
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class TranslationMigrator {
  constructor() {
    this.translationsPath = 'C:\\GUIDEAI\\public\\locales\\translations.json';
    this.backupDir = 'C:\\GUIDEAI\\scripts\\backup';
    this.dryRun = false; // true로 설정하면 실제 적용 안 함
    this.replacements = new Map();
    this.errors = [];
  }

  // 백업 생성
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // translations.json 백업
    if (fs.existsSync(this.translationsPath)) {
      fs.copyFileSync(
        this.translationsPath,
        path.join(backupPath, 'translations.json')
      );
    }

    // 소스 파일들 백업
    const srcFiles = glob.sync('**/*.tsx', { cwd: 'C:\\GUIDEAI\\src\\app', absolute: true });
    srcFiles.forEach(file => {
      const relativePath = path.relative('C:\\GUIDEAI\\src\\app', file);
      const backupFilePath = path.join(backupPath, 'src', 'app', relativePath);
      const backupFileDir = path.dirname(backupFilePath);
      
      if (!fs.existsSync(backupFileDir)) {
        fs.mkdirSync(backupFileDir, { recursive: true });
      }
      
      fs.copyFileSync(file, backupFilePath);
    });

    console.log(`💾 백업 생성: ${backupPath}`);
    return backupPath;
  }

  // 우선순위 기반 파일 분류
  categorizeFiles() {
    const files = glob.sync('**/*.tsx', { cwd: 'C:\\GUIDEAI\\src\\app', absolute: true });
    
    const categories = {
      // 1순위: 새로 만든 도구 페이지들 (가장 중요)
      priority1: [
        'trip-planner/page.tsx',
        'nomad-calculator/page.tsx',
        'film-locations/page.tsx',
        'visa-checker/page.tsx',
        'travel/page.tsx'
      ],
      // 2순위: 기존 중요 페이지들
      priority2: [
        'page.tsx', // 메인 페이지
        'destinations/page.tsx',
        'audio-guide/page.tsx',
        'docent/page.tsx'
      ],
      // 3순위: 기타 페이지들
      priority3: []
    };

    files.forEach(file => {
      const relativePath = path.relative('C:\\GUIDEAI\\src\\app', file);
      
      if (categories.priority1.includes(relativePath)) return;
      if (categories.priority2.includes(relativePath)) return;
      
      categories.priority3.push(relativePath);
    });

    return categories;
  }

  // 스마트 번역키 생성 (컨텍스트 기반)
  generateSmartKey(filePath, text, context) {
    const fileName = path.basename(filePath, '.tsx');
    
    // 파일별 네임스페이스 매핑
    const namespaceMap = {
      'trip-planner': 'tools.tripPlanner',
      'nomad-calculator': 'tools.nomadCalculator',
      'film-locations': 'tools.filmLocations',
      'visa-checker': 'tools.visaChecker',
      'travel': 'pages.travel',
      'page': 'home',
      'destinations': 'pages.destinations'
    };

    const namespace = namespaceMap[fileName] || `pages.${fileName}`;
    
    // 컨텍스트별 섹션 분류
    const sectionMap = {
      title: 'hero.title',
      subtitle: 'hero.subtitle', 
      description: 'hero.description',
      button: 'cta',
      form: 'form',
      filter: 'filters',
      card: 'card',
      modal: 'modal',
      nav: 'navigation',
      footer: 'footer'
    };

    const section = sectionMap[context.section] || context.section;
    
    // 텍스트 기반 키 생성 (의미있는 이름)
    const textKey = this.generateMeaningfulKey(text);
    
    return `${namespace}.${section}.${textKey}`;
  }

  // 의미있는 키 이름 생성
  generateMeaningfulKey(text) {
    // 공통 패턴 매핑
    const patternMap = {
      '시작하기': 'start',
      '무료로 시작': 'freeStart', 
      '계획하기': 'plan',
      '생성하기': 'generate',
      '검색하기': 'search',
      '비교하기': 'compare',
      '저장하기': 'save',
      '공유하기': 'share',
      '다운로드': 'download',
      '내보내기': 'export',
      '가이드 보기': 'viewGuide',
      '더 보기': 'viewMore',
      '자세히 보기': 'viewDetails'
    };

    // 패턴 매칭 시도
    for (const [pattern, key] of Object.entries(patternMap)) {
      if (text.includes(pattern)) return key;
    }

    // 자동 생성: 첫 3-5글자를 영어로 변환
    const key = text
      .substring(0, 20)
      .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    // 한글 → 영어 간단 매핑
    const korEngMap = {
      '제목': 'title',
      '설명': 'description', 
      '버튼': 'button',
      '입력': 'input',
      '선택': 'select',
      '결과': 'result',
      '목록': 'list',
      '항목': 'item',
      '내용': 'content'
    };

    for (const [kor, eng] of Object.entries(korEngMap)) {
      if (key.includes(kor)) {
        return key.replace(kor, eng);
      }
    }

    return key || `text${Date.now()}`;
  }

  // 파일 내 텍스트 치환
  migrateFile(filePath, analysis) {
    console.log(`🔄 마이그레이션: ${path.relative(process.cwd(), filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let translations = {};
    let replacements = 0;

    // useTranslations import 추가 확인
    if (!content.includes('useTranslations')) {
      // import 섹션 찾아서 추가
      const importMatch = content.match(/import.*from\s+['"][^'"]*['"];?\n/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const importIndex = content.lastIndexOf(lastImport) + lastImport.length;
        
        content = content.slice(0, importIndex) + 
                 "import { useTranslations } from '@/components/useTranslations';\n" + 
                 content.slice(importIndex);
      }

      // 컴포넌트 내부에 const t = useTranslations() 추가
      const functionMatch = content.match(/(export default function \w+\([^)]*\)\s*{)/);
      if (functionMatch) {
        const funcIndex = content.indexOf(functionMatch[1]) + functionMatch[1].length;
        content = content.slice(0, funcIndex) + 
                 "\n  const t = useTranslations();\n" + 
                 content.slice(funcIndex);
      }
    }

    // 각 텍스트를 번역키로 치환
    analysis.texts.forEach(textInfo => {
      const { original, key } = textInfo;
      const translationCall = `{t('${key}')}`;

      // 다양한 패턴으로 치환 시도
      const patterns = [
        new RegExp(`>[\\s]*${this.escapeRegex(original)}[\\s]*<`, 'g'),
        new RegExp(`"${this.escapeRegex(original)}"`, 'g'),
        new RegExp(`'${this.escapeRegex(original)}'`, 'g'),
        new RegExp(`\`${this.escapeRegex(original)}\``, 'g')
      ];

      patterns.forEach(pattern => {
        if (content.match(pattern)) {
          content = content.replace(pattern, (match) => {
            if (match.startsWith('>') && match.endsWith('<')) {
              return `>${translationCall}<`;
            } else if (match.startsWith('"') && match.endsWith('"')) {
              return `{t('${key}')}`;
            } else {
              return translationCall;
            }
          });
          
          translations[key] = original;
          replacements++;
        }
      });
    });

    if (!this.dryRun && replacements > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    console.log(`  ✅ ${replacements}개 치환 완료`);
    return translations;
  }

  // 정규식 이스케이프
  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // translations.json 업데이트
  updateTranslationsFile(allTranslations) {
    let translations = {};
    
    if (fs.existsSync(this.translationsPath)) {
      translations = JSON.parse(fs.readFileSync(this.translationsPath, 'utf-8'));
    }

    // 구조화된 번역키 추가
    Object.entries(allTranslations).forEach(([key, value]) => {
      const keys = key.split('.');
      let current = translations;
      
      // 언어별 추가 (ko, en)
      ['ko', 'en'].forEach(lang => {
        if (!current[lang]) current[lang] = {};
        let langCurrent = current[lang];
        
        keys.forEach((k, index) => {
          if (index === keys.length - 1) {
            langCurrent[k] = lang === 'ko' ? value : value; // TODO: 영어 번역
          } else {
            if (!langCurrent[k]) langCurrent[k] = {};
            langCurrent = langCurrent[k];
          }
        });
      });
    });

    if (!this.dryRun) {
      fs.writeFileSync(this.translationsPath, JSON.stringify(translations, null, 2), 'utf-8');
      console.log(`📝 translations.json 업데이트 완료`);
    }
  }

  // 전체 마이그레이션 실행
  async migrate(dryRun = false) {
    this.dryRun = dryRun;
    
    console.log(`🚀 번역키 마이그레이션 시작 ${dryRun ? '(DRY RUN)' : '(LIVE)'}\n`);
    
    // 1. 백업 생성
    if (!dryRun) {
      this.createBackup();
    }

    // 2. 분석 도구로 텍스트 추출
    const TranslationAnalyzer = require('./translation-analyzer.js');
    const analyzer = new TranslationAnalyzer();
    const { results } = analyzer.analyzeProject();

    // 3. 우선순위별 파일 처리
    const categories = this.categorizeFiles();
    const allTranslations = {};

    for (const [priority, files] of Object.entries(categories)) {
      console.log(`\n📁 ${priority.toUpperCase()} 처리 중...`);
      
      files.forEach(relativePath => {
        const fullPath = path.join('C:\\GUIDEAI\\src\\app', relativePath);
        const analysis = results.find(r => r.file === relativePath);
        
        if (analysis && fs.existsSync(fullPath)) {
          const translations = this.migrateFile(fullPath, analysis);
          Object.assign(allTranslations, translations);
        }
      });
    }

    // 4. translations.json 업데이트
    this.updateTranslationsFile(allTranslations);

    console.log(`\n✅ 마이그레이션 완료!`);
    console.log(`- 총 번역키: ${Object.keys(allTranslations).length}개`);
    console.log(`- 오류: ${this.errors.length}개`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 오류 목록:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
}

// 실행
if (require.main === module) {
  const migrator = new TranslationMigrator();
  
  // 명령행 인수 처리
  const isDryRun = process.argv.includes('--dry-run');
  
  migrator.migrate(isDryRun).catch(console.error);
}

module.exports = TranslationMigrator;