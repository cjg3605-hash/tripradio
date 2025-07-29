#!/usr/bin/env node

// 복원력 메커니즘 테스트 스크립트
const http = require('http');
const https = require('https');

console.log('🧪 간헐적 장애 복원력 테스트 시작\n');

class ResilienceTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async makeRequest(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const timeout = options.timeout || 10000;
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, {
        timeout,
        headers: {
          'User-Agent': 'Resilience-Test/1.0',
          ...options.headers
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            data: data,
            duration,
            headers: res.headers
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      setTimeout(() => {
        if (!req.destroyed) {
          req.destroy();
          reject(new Error(`Request timeout after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  async runTest(testName, testFn) {
    console.log(`\n🔄 테스트: ${testName}`);
    this.results.total++;
    
    try {
      const result = await testFn();
      if (result.success) {
        console.log(`✅ 통과: ${result.message}`);
        this.results.passed++;
        this.results.tests.push({ name: testName, status: 'PASS', message: result.message });
      } else {
        console.log(`❌ 실패: ${result.message}`);
        this.results.failed++;
        this.results.tests.push({ name: testName, status: 'FAIL', message: result.message });
      }
    } catch (error) {
      console.log(`❌ 오류: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'ERROR', message: error.message });
    }
  }

  async testHealthEndpoint() {
    return this.runTest('헬스 체크 엔드포인트', async () => {
      const response = await this.makeRequest('/api/health', { timeout: 5000 });
      
      if (response.statusCode === 200 || response.statusCode === 308) {
        return { success: true, message: `상태 코드: ${response.statusCode}, 응답 시간: ${response.duration}ms` };
      } else {
        return { success: false, message: `예상치 못한 상태 코드: ${response.statusCode}` };
      }
    });
  }

  async testTimeoutHandling() {
    return this.runTest('타임아웃 처리', async () => {
      try {
        // 매우 짧은 타임아웃으로 요청
        await this.makeRequest('/api/ai/generate-guide-with-gemini', { 
          timeout: 100,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        return { success: false, message: '타임아웃이 발생하지 않음' };
      } catch (error) {
        if (error.message.includes('timeout')) {
          return { success: true, message: '타임아웃이 올바르게 처리됨' };
        } else {
          return { success: false, message: `예상치 못한 오류: ${error.message}` };
        }
      }
    });
  }

  async testMonitoringMetrics() {
    return this.runTest('모니터링 메트릭 조회', async () => {
      const response = await this.makeRequest('/api/monitoring/metrics', { timeout: 5000 });
      
      if (response.statusCode === 200) {
        try {
          const data = JSON.parse(response.data);
          if (data.health && data.metrics !== undefined) {
            return { success: true, message: `메트릭 조회 성공, 상태: ${data.health.status}` };
          } else {
            return { success: false, message: '메트릭 데이터 구조가 올바르지 않음' };
          }
        } catch (parseError) {
          return { success: false, message: 'JSON 파싱 실패' };
        }
      } else {
        return { success: false, message: `상태 코드: ${response.statusCode}` };
      }
    });
  }

  async testConcurrentRequests() {
    return this.runTest('동시 요청 처리', async () => {
      const concurrentRequests = 5;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          this.makeRequest('/api/health', { timeout: 8000 })
            .catch(error => ({ error: error.message }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.statusCode && (r.statusCode === 200 || r.statusCode === 308)).length;
      const failed = results.filter(r => r.error).length;
      
      if (successful >= concurrentRequests * 0.8) { // 80% 성공률
        return { success: true, message: `${successful}/${concurrentRequests} 요청 성공` };
      } else {
        return { success: false, message: `${successful}/${concurrentRequests} 요청 성공 (실패: ${failed})` };
      }
    });
  }

  async testErrorRecovery() {
    return this.runTest('오류 복구 메커니즘', async () => {
      // 잘못된 엔드포인트로 요청 후 정상 엔드포인트로 요청
      try {
        await this.makeRequest('/api/nonexistent', { timeout: 3000 });
      } catch (error) {
        // 예상된 오류
      }
      
      // 정상 요청이 여전히 작동하는지 확인
      const response = await this.makeRequest('/api/health', { timeout: 5000 });
      
      if (response.statusCode === 200 || response.statusCode === 308) {
        return { success: true, message: '오류 후 정상 요청 복구 확인' };
      } else {
        return { success: false, message: '정상 요청 복구 실패' };
      }
    });
  }

  async testLoadHandling() {
    return this.runTest('부하 처리 능력', async () => {
      const startTime = Date.now();
      const requests = 10;
      const promises = [];
      
      for (let i = 0; i < requests; i++) {
        promises.push(
          this.makeRequest('/api/health', { timeout: 10000 })
            .then(response => ({
              success: response.statusCode === 200 || response.statusCode === 308,
              duration: response.duration
            }))
            .catch(error => ({ success: false, error: error.message }))
        );
      }
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const avgDuration = results
        .filter(r => r.duration)
        .reduce((sum, r) => sum + r.duration, 0) / successful;
      
      if (successful >= requests * 0.9) { // 90% 성공률
        return { 
          success: true, 
          message: `${successful}/${requests} 성공, 평균 응답시간: ${Math.round(avgDuration)}ms, 총 시간: ${totalTime}ms` 
        };
      } else {
        return { 
          success: false, 
          message: `${successful}/${requests} 성공, 성공률이 낮음` 
        };
      }
    });
  }

  async runAllTests() {
    console.log('📊 복원력 테스트 슈트 실행 중...\n');
    
    // 서버 시작 대기
    console.log('⏳ 서버 시작을 기다리는 중...');
    await this.waitForServer();
    
    await this.testHealthEndpoint();
    await this.testMonitoringMetrics();
    await this.testTimeoutHandling();
    await this.testErrorRecovery();
    await this.testConcurrentRequests();
    await this.testLoadHandling();
    
    this.printResults();
  }

  async waitForServer(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await this.makeRequest('/api/health', { timeout: 2000 });
        console.log('✅ 서버 준비 완료\n');
        return;
      } catch (error) {
        if (i === maxAttempts - 1) {
          throw new Error('서버가 시작되지 않았습니다. npm run dev를 먼저 실행해주세요.');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 테스트 결과 요약');
    console.log('='.repeat(60));
    console.log(`총 테스트: ${this.results.total}`);
    console.log(`✅ 통과: ${this.results.passed}`);
    console.log(`❌ 실패: ${this.results.failed}`);
    console.log(`성공률: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
    
    console.log('\n📋 상세 결과:');
    this.results.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.message}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.passed === this.results.total) {
      console.log('🎉 모든 테스트가 통과했습니다!');
      process.exit(0);
    } else {
      console.log('⚠️  일부 테스트가 실패했습니다.');
      process.exit(1);
    }
  }
}

// 테스트 실행
const testSuite = new ResilienceTestSuite();
testSuite.runAllTests().catch(error => {
  console.error('❌ 테스트 실행 중 오류:', error.message);
  process.exit(1);
});