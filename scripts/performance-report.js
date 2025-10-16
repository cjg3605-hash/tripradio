#!/usr/bin/env node
// 자동화된 성능 리포트 생성 스크립트

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 성능 리포트 생성 시작\n');

// 1. 시스템 정보 수집
function getSystemInfo() {
  try {
    const info = {
      platform: process.platform,
      nodeVersion: process.version,
      totalMemory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + 'GB',
      cpuCount: require('os').cpus().length,
      timestamp: new Date().toISOString()
    };
    return info;
  } catch (error) {
    return { error: 'Failed to collect system info' };
  }
}

// 2. 빌드 성능 측정
function measureBuildPerformance() {
  console.log('🏗️ 빌드 성능 측정 중...');
  
  try {
    const startTime = Date.now();
    
    // 빌드 실행
    execSync('npm run build', { 
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        // 테스트용 더미 환경변수
        GEMINI_API_KEY: 'test_build_key',
        GOOGLE_CLOUD_PROJECT: 'test-project',
        DATABASE_URL: 'sqlite://memory',
        NEXTAUTH_SECRET: 'test-secret-for-build',
        NEXTAUTH_URL: 'http://localhost:3000'
      }
    });
    
    const buildTime = Date.now() - startTime;
    
    // 빌드 결과 분석
    const nextDir = path.join(process.cwd(), '.next');
    const buildSize = getDirSize(nextDir);
    const staticFiles = countFilesInDir(path.join(nextDir, 'static'));
    
    return {
      buildTime: Math.round(buildTime / 1000) + 's',
      buildSize: formatBytes(buildSize),
      staticFiles,
      success: true
    };
  } catch (error) {
    return {
      error: error.message,
      success: false
    };
  }
}

// 3. 번들 크기 분석
function analyzeBundleSize() {
  console.log('📦 번들 크기 분석 중...');
  
  try {
    const nextDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(nextDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      return { error: 'Static directory not found. Run build first.' };
    }
    
    const jsFiles = [];
    const cssFiles = [];
    
    function scanDir(dir, files) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDir(itemPath, files);
        } else if (item.endsWith('.js')) {
          jsFiles.push({
            name: path.relative(staticDir, itemPath),
            size: stat.size
          });
        } else if (item.endsWith('.css')) {
          cssFiles.push({
            name: path.relative(staticDir, itemPath),
            size: stat.size
          });
        }
      }
    }
    
    scanDir(staticDir);
    
    // 상위 10개 파일
    jsFiles.sort((a, b) => b.size - a.size);
    cssFiles.sort((a, b) => b.size - a.size);
    
    return {
      totalJSSize: formatBytes(jsFiles.reduce((sum, f) => sum + f.size, 0)),
      totalCSSSize: formatBytes(cssFiles.reduce((sum, f) => sum + f.size, 0)),
      largestJSFiles: jsFiles.slice(0, 10).map(f => ({
        name: f.name,
        size: formatBytes(f.size)
      })),
      largestCSSFiles: cssFiles.slice(0, 5).map(f => ({
        name: f.name,
        size: formatBytes(f.size)
      })),
      totalFiles: {
        js: jsFiles.length,
        css: cssFiles.length
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

// 4. 패키지 크기 분석
function analyzePackageSize() {
  console.log('📋 패키지 의존성 분석 중...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {}).length;
    const devDeps = Object.keys(packageJson.devDependencies || {}).length;
    
    // node_modules 크기
    const nodeModulesSize = getDirSize(path.join(process.cwd(), 'node_modules'));
    
    return {
      totalDependencies: deps,
      devDependencies: devDeps,
      nodeModulesSize: formatBytes(nodeModulesSize),
      majorDependencies: [
        'next',
        'react',
        'react-dom',
        '@next/font',
        'tailwindcss'
      ].filter(dep => packageJson.dependencies?.[dep]).map(dep => ({
        name: dep,
        version: packageJson.dependencies[dep]
      }))
    };
  } catch (error) {
    return { error: error.message };
  }
}

// 5. 리포트 생성
function generateReport() {
  const systemInfo = getSystemInfo();
  const buildPerf = measureBuildPerformance();
  const bundleAnalysis = analyzeBundleSize();
  const packageAnalysis = analyzePackageSize();
  
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      project: 'GuideAI'
    },
    systemInfo,
    buildPerformance: buildPerf,
    bundleAnalysis,
    packageAnalysis,
    recommendations: generateRecommendations(buildPerf, bundleAnalysis, packageAnalysis)
  };
  
  // JSON 리포트 저장
  const reportPath = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 마크다운 리포트 생성
  const markdownReport = generateMarkdownReport(report);
  const markdownPath = `performance-report-${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(markdownPath, markdownReport);
  
  console.log(`\n✅ 성능 리포트 생성 완료:`);
  console.log(`📄 JSON: ${reportPath}`);
  console.log(`📝 Markdown: ${markdownPath}`);
  
  return report;
}

// 6. 권장사항 생성
function generateRecommendations(buildPerf, bundleAnalysis, packageAnalysis) {
  const recommendations = [];
  
  // 빌드 시간 체크
  if (buildPerf.success) {
    const buildTimeSeconds = parseInt(buildPerf.buildTime);
    if (buildTimeSeconds > 60) {
      recommendations.push({
        type: 'build',
        priority: 'high',
        message: `빌드 시간이 ${buildPerf.buildTime}입니다. 캐싱과 병렬 처리를 활용하여 최적화를 고려하세요.`
      });
    }
  }
  
  // 번들 크기 체크
  if (bundleAnalysis.totalJSSize && !bundleAnalysis.error) {
    const jsSize = parseSize(bundleAnalysis.totalJSSize);
    if (jsSize > 1000) { // 1MB 이상
      recommendations.push({
        type: 'bundle',
        priority: 'medium',
        message: `총 JS 크기가 ${bundleAnalysis.totalJSSize}입니다. 코드 분할과 tree shaking을 검토하세요.`
      });
    }
  }
  
  // 의존성 체크
  if (packageAnalysis.totalDependencies > 100) {
    recommendations.push({
      type: 'dependencies',
      priority: 'low',
      message: `총 ${packageAnalysis.totalDependencies}개의 의존성이 있습니다. 사용하지 않는 패키지 제거를 검토하세요.`
    });
  }
  
  return recommendations;
}

// 7. 마크다운 리포트 생성
function generateMarkdownReport(report) {
  return `# 📊 GuideAI 성능 리포트

**생성일**: ${new Date(report.metadata.generatedAt).toLocaleString('ko-KR')}

## 🖥️ 시스템 정보
- **플랫폼**: ${report.systemInfo.platform}
- **Node.js**: ${report.systemInfo.nodeVersion}
- **메모리**: ${report.systemInfo.totalMemory}
- **CPU 코어**: ${report.systemInfo.cpuCount}

## 🏗️ 빌드 성능
${report.buildPerformance.success ? `
- **빌드 시간**: ${report.buildPerformance.buildTime}
- **빌드 크기**: ${report.buildPerformance.buildSize}
- **정적 파일**: ${report.buildPerformance.staticFiles}개
` : `
⚠️ **빌드 실패**: ${report.buildPerformance.error}
`}

## 📦 번들 분석
${!report.bundleAnalysis.error ? `
- **총 JS 크기**: ${report.bundleAnalysis.totalJSSize}
- **총 CSS 크기**: ${report.bundleAnalysis.totalCSSSize}
- **JS 파일**: ${report.bundleAnalysis.totalFiles.js}개
- **CSS 파일**: ${report.bundleAnalysis.totalFiles.css}개

### 대용량 JS 파일 (상위 5개)
${report.bundleAnalysis.largestJSFiles.slice(0, 5).map(f => `- ${f.name}: ${f.size}`).join('\n')}
` : `
⚠️ **번들 분석 실패**: ${report.bundleAnalysis.error}
`}

## 📋 패키지 의존성
${!report.packageAnalysis.error ? `
- **운영 의존성**: ${report.packageAnalysis.totalDependencies}개
- **개발 의존성**: ${report.packageAnalysis.devDependencies}개
- **node_modules 크기**: ${report.packageAnalysis.nodeModulesSize}

### 주요 의존성
${report.packageAnalysis.majorDependencies.map(dep => `- ${dep.name}: ${dep.version}`).join('\n')}
` : `
⚠️ **패키지 분석 실패**: ${report.packageAnalysis.error}
`}

## 💡 권장사항
${report.recommendations.length > 0 ? 
  report.recommendations.map(rec => 
    `### ${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.type.toUpperCase()}
${rec.message}`
  ).join('\n\n') : 
  '✅ 현재 성능 상태는 양호합니다!'
}

---
*이 리포트는 자동으로 생성되었습니다.*`;
}

// 유틸리티 함수들
function getDirSize(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  let size = 0;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      size += getDirSize(itemPath);
    } else {
      size += stat.size;
    }
  }
  
  return size;
}

function countFilesInDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      count += countFilesInDir(itemPath);
    } else {
      count++;
    }
  }
  
  return count;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function parseSize(sizeStr) {
  const match = sizeStr.match(/^([\d.]+)\s*(KB|MB|GB)$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'KB': return value;
    case 'MB': return value * 1024;
    case 'GB': return value * 1024 * 1024;
    default: return value;
  }
}

// 메인 실행
if (require.main === module) {
  try {
    const report = generateReport();
    
    // 요약 출력
    console.log('\n📈 성능 요약:');
    if (report.buildPerformance.success) {
      console.log(`   빌드: ${report.buildPerformance.buildTime} (${report.buildPerformance.buildSize})`);
    }
    if (!report.bundleAnalysis.error) {
      console.log(`   번들: JS ${report.bundleAnalysis.totalJSSize}, CSS ${report.bundleAnalysis.totalCSSSize}`);
    }
    if (!report.packageAnalysis.error) {
      console.log(`   의존성: ${report.packageAnalysis.totalDependencies}개`);
    }
    
    console.log(`\n💡 권장사항: ${report.recommendations.length}개`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 성능 리포트 생성 실패:', error.message);
    process.exit(1);
  }
}