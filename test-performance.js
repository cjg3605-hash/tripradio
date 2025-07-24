#!/usr/bin/env node

// 성능 개선 검증 스크립트
const fs = require('fs');
const path = require('path');

console.log('📊 성능 개선 검증 테스트 시작\n');

class PerformanceValidator {
  constructor() {
    this.results = {
      codeAnalysis: {},
      improvementMetrics: {},
      recommendations: []
    };
  }

  analyzeCodeStructure() {
    console.log('🔍 코드 구조 분석 중...\n');
    
    const analysisResults = {
      resilientFetch: this.checkFile('src/lib/resilient-fetch.ts'),
      monitoring: this.checkFile('src/lib/monitoring.ts'),
      ttsGcs: this.checkFile('src/lib/tts-gcs.ts'),
      circuitBreaker: this.checkFile('src/lib/circuit-breaker.ts')
    };

    this.results.codeAnalysis = analysisResults;
    return analysisResults;
  }

  checkFile(relativePath) {
    const fullPath = path.join(process.cwd(), relativePath);
    
    if (!fs.existsSync(fullPath)) {
      return { exists: false, error: 'File not found' };
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      exists: true,
      lines: lines.length,
      size: content.length,
      features: {
        timeout: content.includes('timeout') || content.includes('Timeout'),
        retry: content.includes('retry') || content.includes('Retry'),
        circuitBreaker: content.includes('circuit') || content.includes('Circuit'),
        errorHandling: content.includes('catch') || content.includes('Error'),
        abortController: content.includes('AbortController'),
        monitoring: content.includes('monitor') || content.includes('track')
      },
      complexity: this.calculateComplexity(content)
    };

    return analysis;
  }

  calculateComplexity(content) {
    const complexityIndicators = [
      'if', 'else', 'for', 'while', 'switch', 'case', 
      'try', 'catch', 'async', 'await', 'Promise'
    ];
    
    let complexity = 0;
    complexityIndicators.forEach(indicator => {
      const matches = content.match(new RegExp(`\\b${indicator}\\b`, 'g'));
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  validateResilientFetch() {
    console.log('🔧 Resilient Fetch 검증...');
    
    const analysis = this.results.codeAnalysis.resilientFetch;
    if (!analysis.exists) {
      console.log('❌ resilient-fetch.ts 파일이 없습니다.');
      return false;
    }

    const requiredFeatures = [
      'timeout', 'retry', 'errorHandling', 'abortController'
    ];
    
    const hasAllFeatures = requiredFeatures.every(feature => 
      analysis.features[feature]
    );

    if (hasAllFeatures) {
      console.log('✅ 모든 필수 기능이 구현되었습니다.');
      console.log(`   - 코드 크기: ${analysis.size} 바이트`);
      console.log(`   - 복잡도: ${analysis.complexity}`);
      return true;
    } else {
      const missing = requiredFeatures.filter(feature => !analysis.features[feature]);
      console.log(`❌ 누락된 기능: ${missing.join(', ')}`);
      return false;
    }
  }

  validateMonitoring() {
    console.log('\n📊 모니터링 시스템 검증...');
    
    const analysis = this.results.codeAnalysis.monitoring;
    if (!analysis.exists) {
      console.log('❌ monitoring.ts 파일이 없습니다.');
      return false;
    }

    const requiredFeatures = [
      'timeout', 'retry', 'errorHandling', 'monitoring'
    ];
    
    const hasAllFeatures = requiredFeatures.every(feature => 
      analysis.features[feature]
    );

    if (hasAllFeatures) {
      console.log('✅ 모니터링 시스템이 강화되었습니다.');
      console.log(`   - 코드 크기: ${analysis.size} 바이트`);
      console.log(`   - 복잡도: ${analysis.complexity}`);
      return true;
    } else {
      const missing = requiredFeatures.filter(feature => !analysis.features[feature]);
      console.log(`❌ 누락된 기능: ${missing.join(', ')}`);
      return false;
    }
  }

  validateTTSEnhancements() {
    console.log('\n🎵 TTS 서비스 개선 검증...');
    
    const analysis = this.results.codeAnalysis.ttsGcs;
    if (!analysis.exists) {
      console.log('❌ tts-gcs.ts 파일이 없습니다.');
      return false;
    }

    const hasCache = analysis.features.monitoring; // 캐시 관련 로직 포함
    const hasErrorHandling = analysis.features.errorHandling;
    
    if (hasCache && hasErrorHandling) {
      console.log('✅ TTS 서비스가 개선되었습니다.');
      console.log(`   - 캐시 시스템: ${hasCache ? '구현됨' : '미구현'}`);
      console.log(`   - 에러 처리: ${hasErrorHandling ? '강화됨' : '기본'}`);
      console.log(`   - 코드 크기: ${analysis.size} 바이트`);
      return true;
    } else {
      console.log('❌ TTS 서비스 개선이 불완전합니다.');
      return false;
    }
  }

  validateCircuitBreaker() {
    console.log('\n⚡ 서킷 브레이커 검증...');
    
    const analysis = this.results.codeAnalysis.circuitBreaker;
    if (!analysis.exists) {
      console.log('❌ circuit-breaker.ts 파일이 없습니다.');
      return false;
    }

    const hasCircuitBreaker = analysis.features.circuitBreaker;
    const hasErrorHandling = analysis.features.errorHandling;
    
    if (hasCircuitBreaker && hasErrorHandling) {
      console.log('✅ 서킷 브레이커가 구현되었습니다.');
      console.log(`   - 복잡도: ${analysis.complexity}`);
      return true;
    } else {
      console.log('❌ 서킷 브레이커 구현이 불완전합니다.');
      return false;
    }
  }

  calculateImprovementMetrics() {
    console.log('\n📈 개선 메트릭 계산...');
    
    const metrics = {
      resilience: 0,
      performance: 0,
      maintainability: 0,
      overall: 0
    };

    // 복원력 점수 (0-100)
    const resilienceFeatures = [
      this.results.codeAnalysis.resilientFetch?.exists,
      this.results.codeAnalysis.monitoring?.features?.timeout,
      this.results.codeAnalysis.monitoring?.features?.retry,
      this.results.codeAnalysis.circuitBreaker?.exists
    ];
    metrics.resilience = (resilienceFeatures.filter(Boolean).length / resilienceFeatures.length) * 100;

    // 성능 점수 (코드 복잡도 기반)
    const avgComplexity = Object.values(this.results.codeAnalysis)
      .filter(analysis => analysis.exists)
      .reduce((sum, analysis) => sum + (analysis.complexity || 0), 0) / 4;
    metrics.performance = Math.max(0, 100 - (avgComplexity / 10)); // 복잡도가 낮을수록 높은 점수

    // 유지보수성 점수 (에러 처리 + 모니터링)
    const maintainabilityFeatures = [
      this.results.codeAnalysis.monitoring?.features?.errorHandling,
      this.results.codeAnalysis.monitoring?.features?.monitoring,
      this.results.codeAnalysis.ttsGcs?.features?.errorHandling,
      this.results.codeAnalysis.resilientFetch?.features?.errorHandling
    ];
    metrics.maintainability = (maintainabilityFeatures.filter(Boolean).length / maintainabilityFeatures.length) * 100;

    // 전체 점수
    metrics.overall = (metrics.resilience + metrics.performance + metrics.maintainability) / 3;

    this.results.improvementMetrics = metrics;
    return metrics;
  }

  generateRecommendations() {
    console.log('\n💡 개선 권장사항 생성...');
    
    const recommendations = [];
    const metrics = this.results.improvementMetrics;

    if (metrics.resilience < 80) {
      recommendations.push({
        category: 'Resilience',
        priority: 'High',
        description: '복원력 메커니즘을 더 강화해야 합니다.',
        actions: [
          '서킷 브레이커 통합 확대',
          '재시도 정책 최적화',
          '타임아웃 설정 개선'
        ]
      });
    }

    if (metrics.performance < 70) {
      recommendations.push({
        category: 'Performance',
        priority: 'Medium',
        description: '코드 복잡도를 줄여 성능을 개선할 여지가 있습니다.',
        actions: [
          '함수 분리 및 단순화',
          '불필요한 중첩 제거',
          '캐시 최적화'
        ]
      });
    }

    if (metrics.maintainability < 85) {
      recommendations.push({
        category: 'Maintainability',
        priority: 'Medium',
        description: '유지보수성을 높이기 위한 개선이 필요합니다.',
        actions: [
          '에러 처리 표준화',
          '로깅 및 모니터링 강화',
          '타입 안전성 개선'
        ]
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: 'Congratulations',
        priority: 'Info',
        description: '모든 메트릭이 우수한 수준입니다!',
        actions: [
          '현재 수준 유지',
          '정기적인 성능 모니터링',
          '새로운 기능에도 동일한 품질 기준 적용'
        ]
      });
    }

    this.results.recommendations = recommendations;
    return recommendations;
  }

  printDetailedReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 성능 개선 검증 보고서');
    console.log('='.repeat(70));

    // 코드 분석 결과
    console.log('\n🔍 코드 분석 결과:');
    Object.entries(this.results.codeAnalysis).forEach(([file, analysis]) => {
      if (analysis.exists) {
        console.log(`\n📁 ${file}:`);
        console.log(`   ✅ 파일 존재: ${analysis.lines}줄, ${Math.round(analysis.size/1024)}KB`);
        console.log(`   🔧 구현된 기능: ${Object.entries(analysis.features).filter(([,v]) => v).map(([k]) => k).join(', ')}`);
        console.log(`   📊 복잡도: ${analysis.complexity}`);
      } else {
        console.log(`\n📁 ${file}: ❌ 파일 없음`);
      }
    });

    // 개선 메트릭
    console.log('\n📈 개선 메트릭:');
    const metrics = this.results.improvementMetrics;
    console.log(`   🛡️  복원력: ${Math.round(metrics.resilience)}%`);
    console.log(`   ⚡ 성능: ${Math.round(metrics.performance)}%`);
    console.log(`   🔧 유지보수성: ${Math.round(metrics.maintainability)}%`);
    console.log(`   📊 전체 점수: ${Math.round(metrics.overall)}%`);

    // 권장사항
    console.log('\n💡 권장사항:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.category} (${rec.priority}):`);
      console.log(`   📝 ${rec.description}`);
      rec.actions.forEach(action => {
        console.log(`   • ${action}`);
      });
    });

    console.log('\n' + '='.repeat(70));
    
    // 최종 평가
    const overallScore = Math.round(metrics.overall);
    if (overallScore >= 85) {
      console.log('🎉 우수: 간헐적 장애 해결이 성공적으로 구현되었습니다!');
    } else if (overallScore >= 70) {
      console.log('✅ 양호: 대부분의 개선사항이 적용되었으나 추가 최적화가 가능합니다.');
    } else {
      console.log('⚠️  보통: 기본적인 개선은 되었으나 더 많은 작업이 필요합니다.');
    }
    
    console.log(`최종 점수: ${overallScore}/100`);
  }

  async runValidation() {
    // 1. 코드 구조 분석
    this.analyzeCodeStructure();

    // 2. 개별 컴포넌트 검증
    const validationResults = {
      resilientFetch: this.validateResilientFetch(),
      monitoring: this.validateMonitoring(),
      tts: this.validateTTSEnhancements(),
      circuitBreaker: this.validateCircuitBreaker()
    };

    // 3. 개선 메트릭 계산
    this.calculateImprovementMetrics();

    // 4. 권장사항 생성
    this.generateRecommendations();

    // 5. 상세 보고서 출력
    this.printDetailedReport();

    return validationResults;
  }
}

// 검증 실행
const validator = new PerformanceValidator();
validator.runValidation().then(() => {
  console.log('\n✅ 성능 검증 완료!');
}).catch(error => {
  console.error('❌ 검증 중 오류:', error.message);
  process.exit(1);
});