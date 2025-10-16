#!/usr/bin/env node
// performance-analyzer.js
// Core Web Vitals 및 성능 분석 도구

const fs = require('fs');
const path = require('path');

/**
 * Core Web Vitals 분석 도구
 */
class PerformanceAnalyzer {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop';
    this.outputDir = path.join(__dirname, 'performance-reports');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 분석할 페이지 목록
    this.pages = [
      { url: '/', name: 'homepage', description: '홈페이지' },
      { url: '/guide/경복궁?lang=ko', name: 'guide-gyeongbok', description: '경복궁 가이드' },
      { url: '/guide/에펠탑?lang=ko', name: 'guide-eiffel', description: '에펠탑 가이드' },
      { url: '/guide/타지마할?lang=ko', name: 'guide-tajmahal', description: '타지마할 가이드' },
      { url: '/mypage', name: 'mypage', description: '마이페이지' }
    ];
    
    this.metrics = {};
  }

  /**
   * 디렉토리 생성
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 로컬 분석 (서버 실행 여부 확인)
   */
  async runLocalAnalysis() {
    console.log('🚀 NaviDocent 로컬 성능 분석 시작');
    console.log(`📅 분석 시간: ${new Date().toLocaleString()}`);
    console.log(`🌐 기준 URL: ${this.baseUrl}`);
    console.log('');

    this.ensureOutputDir();

    // 서버 연결 테스트
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error('Server not responding');
      }
      console.log('✅ 로컬 서버 연결 확인');
    } catch (error) {
      console.error('❌ 로컬 서버 연결 실패:', error.message);
      console.log('💡 먼저 서버를 시작하세요: npm run dev');
      return;
    }

    // 기본 성능 메트릭 수집
    await this.collectBasicMetrics();
    
    // 결과 저장
    await this.saveResults();
    
    // 리포트 생성
    this.generateReport();
    
    console.log('✅ 로컬 성능 분석 완료!');
    console.log(`📁 결과 파일: ${this.outputDir}/performance-report-${this.timestamp}.json`);
  }

  /**
   * 기본 메트릭 수집
   */
  async collectBasicMetrics() {
    for (const page of this.pages) {
      console.log(`📄 분석 중: ${page.description} (${page.url})`);
      
      try {
        const startTime = Date.now();
        const targetUrl = `${this.baseUrl}${page.url}`;
        
        const response = await fetch(targetUrl);
        const loadTime = Date.now() - startTime;
        const contentSize = parseInt(response.headers.get('content-length') || '0');
        
        this.metrics[page.name] = {
          ...page,
          metrics: {
            loadTime,
            contentSize,
            status: response.status,
            contentType: response.headers.get('content-type'),
            cacheControl: response.headers.get('cache-control'),
            serverTiming: response.headers.get('server-timing')
          }
        };
        
        console.log(`  ✅ 로딩 시간: ${loadTime}ms, 크기: ${(contentSize / 1024).toFixed(1)}KB`);
        
      } catch (error) {
        console.log(`  ❌ 분석 실패: ${error.message}`);
        this.metrics[page.name] = {
          ...page,
          error: error.message
        };
      }
      
      // 서버 부하 방지
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 결과 저장
   */
  async saveResults() {
    const reportData = {
      timestamp: this.timestamp,
      analyzedAt: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: this.generateSummary(),
      pages: this.metrics,
      recommendations: this.generateRecommendations()
    };

    const filePath = path.join(this.outputDir, `performance-report-${this.timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
  }

  /**
   * 요약 생성
   */
  generateSummary() {
    const validPages = Object.values(this.metrics).filter(page => page.metrics);
    
    if (validPages.length === 0) {
      return { error: 'No valid metrics collected' };
    }

    const loadTimes = validPages.map(page => page.metrics.loadTime);
    const contentSizes = validPages.map(page => page.metrics.contentSize);

    return {
      totalPages: Object.keys(this.metrics).length,
      validPages: validPages.length,
      averageLoadTime: Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length),
      averageContentSize: Math.round(contentSizes.reduce((a, b) => a + b, 0) / contentSizes.length),
      fastestPage: validPages.reduce((fastest, page) => 
        page.metrics.loadTime < fastest.metrics.loadTime ? page : fastest
      ),
      slowestPage: validPages.reduce((slowest, page) => 
        page.metrics.loadTime > slowest.metrics.loadTime ? page : slowest
      ),
      performanceGrade: this.calculateGrade(loadTimes)
    };
  }

  /**
   * 성능 등급 계산
   */
  calculateGrade(loadTimes) {
    const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    
    if (avgLoadTime < 1000) return 'A';
    if (avgLoadTime < 2000) return 'B';
    if (avgLoadTime < 3000) return 'C';
    if (avgLoadTime < 5000) return 'D';
    return 'F';
  }

  /**
   * 권장사항 생성
   */
  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();
    
    if (summary.error) {
      recommendations.push({
        type: 'critical',
        title: '서버 연결 문제',
        description: '로컬 서버가 실행되지 않았거나 응답하지 않습니다.',
        action: 'npm run dev 명령어로 서버를 시작하세요.'
      });
      return recommendations;
    }

    if (summary.averageLoadTime > 3000) {
      recommendations.push({
        type: 'critical',
        title: '페이지 로딩 속도 개선 필요',
        description: `평균 로딩 시간이 ${summary.averageLoadTime}ms로 매우 느립니다.`,
        action: '이미지 최적화, 코드 스플리팅, 캐싱 전략을 검토하세요.'
      });
    }

    if (summary.averageContentSize > 1024 * 1024) { // 1MB
      recommendations.push({
        type: 'important',
        title: '콘텐츠 크기 최적화',
        description: `평균 콘텐츠 크기가 ${(summary.averageContentSize / 1024 / 1024).toFixed(1)}MB입니다.`,
        action: '이미지 압축, CSS/JS 최적화를 적용하세요.'
      });
    }

    if (summary.averageLoadTime > 1000) {
      recommendations.push({
        type: 'suggested',
        title: 'Core Web Vitals 최적화',
        description: '더 나은 사용자 경험을 위한 성능 최적화가 필요합니다.',
        action: 'Next.js Image 컴포넌트, 폰트 최적화, 코드 스플리팅을 적용하세요.'
      });
    }

    return recommendations;
  }

  /**
   * 콘솔 리포트 생성
   */
  generateReport() {
    const summary = this.generateSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 NaviDocent 성능 분석 결과');
    console.log('='.repeat(60));
    
    console.log(`📅 분석 일시: ${new Date().toLocaleString()}`);
    console.log(`🌐 기준 URL: ${this.baseUrl}`);
    console.log(`📄 분석된 페이지: ${summary.totalPages}개`);
    console.log(`🏆 성능 등급: ${summary.performanceGrade || 'N/A'}`);
    console.log('');
    
    if (!summary.error) {
      console.log('📊 성능 지표:');
      console.log(`  평균 로딩 시간: ${summary.averageLoadTime}ms`);
      console.log(`  평균 콘텐츠 크기: ${(summary.averageContentSize / 1024).toFixed(1)}KB`);
      console.log(`  가장 빠른 페이지: ${summary.fastestPage.description} (${summary.fastestPage.metrics.loadTime}ms)`);
      console.log(`  가장 느린 페이지: ${summary.slowestPage.description} (${summary.slowestPage.metrics.loadTime}ms)`);
      console.log('');
    }
    
    // 권장사항
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('💡 개선 권장사항:');
      recommendations.forEach((rec, i) => {
        const icon = rec.type === 'critical' ? '🚨' : rec.type === 'important' ? '⚠️' : '💡';
        console.log(`  ${icon} ${rec.title}`);
        console.log(`     ${rec.description}`);
        console.log(`     👉 ${rec.action}`);
        console.log('');
      });
    }
    
    console.log('📁 상세 결과는 JSON 파일을 확인하세요.');
    console.log('='.repeat(60));
  }
}

// 스크립트 실행
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.runLocalAnalysis().catch(error => {
    console.error('❌ 분석 실패:', error);
    process.exit(1);
  });
}

module.exports = PerformanceAnalyzer;
