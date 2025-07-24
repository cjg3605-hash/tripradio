/**
 * 간단한 로드테스트 (Artillery 대안)
 * Node.js 내장 모듈만 사용하는 경량 테스트
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class SimpleLoadTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.concurrency = 0;
    this.maxConcurrency = 0;
    this.totalRequests = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.startTime = null;
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve) => {
      this.concurrency++;
      this.maxConcurrency = Math.max(this.maxConcurrency, this.concurrency);
      this.totalRequests++;

      const startTime = Date.now();
      const url = new URL(endpoint, this.baseUrl);
      const requestModule = url.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SimpleLoadTester/1.0',
          ...options.headers
        },
        timeout: 45000 // 45초 타임아웃
      };

      const req = requestModule.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          const result = {
            endpoint,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString(),
            success: res.statusCode >= 200 && res.statusCode < 400,
            responseSize: data.length
          };

          if (result.success) {
            this.successCount++;
          } else {
            this.errorCount++;
            result.error = `HTTP ${res.statusCode}`;
          }

          this.results.push(result);
          this.concurrency--;
          resolve(result);
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        const result = {
          endpoint,
          statusCode: 0,
          duration,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
          responseSize: 0
        };

        this.errorCount++;
        this.results.push(result);
        this.concurrency--;
        resolve(result);
      });

      req.on('timeout', () => {
        req.destroy();
        const duration = Date.now() - startTime;
        const result = {
          endpoint,
          statusCode: 0,
          duration,
          timestamp: new Date().toISOString(),
          success: false,
          error: 'Timeout',
          responseSize: 0
        };

        this.errorCount++;
        this.results.push(result);
        this.concurrency--;
        resolve(result);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async runBasicTest() {
    console.log('🚀 기본 성능 테스트 시작...');
    console.log('================================');

    this.startTime = Date.now();

    // 테스트 시나리오
    const testCases = [
      {
        name: 'Health Check',
        endpoint: '/api/health',
        method: 'GET',
        count: 5
      },
      {
        name: '장소 검색',
        endpoint: '/api/locations/search?q=경복궁&lang=ko',
        method: 'GET',
        count: 10
      },
      {
        name: 'AI 가이드 생성',
        endpoint: '/api/ai/generate-guide-with-gemini',
        method: 'POST',
        body: {
          location: '경복궁',
          userProfile: {
            interests: ['역사', '문화'],
            ageGroup: '30대',
            knowledgeLevel: '중급',
            companions: 'solo',
            tourDuration: 90,
            preferredStyle: '친근함',
            language: 'ko'
          }
        },
        count: 3
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📋 ${testCase.name} 테스트 (${testCase.count}회)...`);
      
      const promises = [];
      for (let i = 0; i < testCase.count; i++) {
        promises.push(this.makeRequest(testCase.endpoint, {
          method: testCase.method,
          body: testCase.body
        }));
        
        // 요청 간 간격 (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

      console.log(`   ✅ 성공: ${successful}/${testCase.count} (${Math.round(successful/testCase.count*100)}%)`);
      console.log(`   ⏱️ 평균 응답시간: ${Math.round(avgTime)}ms`);
      
      if (successful < testCase.count) {
        const failed = results.filter(r => !r.success);
        console.log(`   ❌ 실패 사유: ${failed.map(f => f.error).join(', ')}`);
      }
    }

    this.generateReport();
  }

  async runConcurrencyTest() {
    console.log('\n⚡ 동시성 테스트 시작...');
    console.log('================================');

    const concurrentRequests = 5;
    const endpoint = '/api/locations/search?q=test&lang=ko';

    console.log(`📊 동시 요청 ${concurrentRequests}개 실행...`);

    const promises = [];
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(this.makeRequest(endpoint));
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const maxTime = Math.max(...results.map(r => r.duration));
    const minTime = Math.min(...results.map(r => r.duration));

    console.log(`✅ 성공률: ${successful}/${concurrentRequests} (${Math.round(successful/concurrentRequests*100)}%)`);
    console.log(`⏱️ 응답시간 - 평균: ${Math.round(avgTime)}ms, 최소: ${minTime}ms, 최대: ${maxTime}ms`);
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const successRate = Math.round((this.successCount / this.totalRequests) * 100);
    const avgResponseTime = this.results.length > 0 
      ? Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length)
      : 0;

    const report = {
      summary: {
        totalRequests: this.totalRequests,
        successCount: this.successCount,
        errorCount: this.errorCount,
        successRate: `${successRate}%`,
        avgResponseTime: `${avgResponseTime}ms`,
        maxConcurrency: this.maxConcurrency,
        totalTestTime: `${Math.round(totalTime/1000)}초`
      },
      details: this.results
    };

    // 콘솔 출력
    console.log('\n📊 테스트 결과 요약');
    console.log('================================');
    console.log(`총 요청 수: ${report.summary.totalRequests}`);
    console.log(`성공률: ${report.summary.successRate}`);
    console.log(`평균 응답시간: ${report.summary.avgResponseTime}`);
    console.log(`최대 동시 요청: ${report.summary.maxConcurrency}`);
    console.log(`총 테스트 시간: ${report.summary.totalTestTime}`);

    // JSON 파일로 저장
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(resultsDir, `simple-load-test-${timestamp}.json`);
    
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 상세 결과 저장: ${filename}`);

    // 성능 권장사항
    console.log('\n💡 성능 권장사항');
    console.log('================================');
    
    if (successRate < 95) {
      console.log('⚠️ 성공률이 95% 미만입니다. 오류 원인을 확인하세요.');
    }
    
    if (avgResponseTime > 10000) {
      console.log('⚠️ 평균 응답시간이 10초를 초과합니다. 성능 최적화가 필요합니다.');
    } else if (avgResponseTime > 5000) {
      console.log('💭 평균 응답시간이 5초를 초과합니다. 모니터링을 강화하세요.');
    } else {
      console.log('✅ 응답시간이 양호합니다.');
    }

    console.log('\n🔗 추가 정보:');
    console.log('- 실시간 모니터링: http://localhost:3000/monitoring');
    console.log('- 상세 메트릭: GET /api/monitoring/metrics');

    return report;
  }
}

// 메인 실행
async function main() {
  const tester = new SimpleLoadTester();

  try {
    // 서버 상태 확인
    console.log('🔍 서버 상태 확인 중...');
    const healthCheck = await tester.makeRequest('/api/health');
    
    if (!healthCheck.success) {
      console.log('❌ 서버가 응답하지 않습니다. localhost:3000에서 서버를 시작해주세요.');
      return;
    }
    
    console.log('✅ 서버 정상 확인됨');

    // 테스트 실행
    await tester.runBasicTest();
    await tester.runConcurrencyTest();

    console.log('\n🎉 모든 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  }
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  main();
}

module.exports = SimpleLoadTester;