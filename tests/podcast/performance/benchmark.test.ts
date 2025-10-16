/**
 * 팟캐스트 생성 성능 벤치마킹 테스트
 * 79초 → 30초 목표 달성 검증
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { performance } from 'perf_hooks';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tts/notebooklm/generate/route';
import { createClient } from '@supabase/supabase-js';

interface BenchmarkResult {
  testName: string;
  duration: number;
  segmentCount: number;
  throughput: number; // segments per second
  success: boolean;
  memoryUsage?: NodeJS.MemoryUsage;
  errorDetails?: string;
}

describe('Podcast Performance Benchmarks', () => {
  let supabase: any;
  let benchmarkResults: BenchmarkResult[] = [];
  let testEpisodeIds: string[] = [];

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    for (const episodeId of testEpisodeIds) {
      await supabase.from('podcast_segments').delete().eq('episode_id', episodeId);
      await supabase.from('podcast_episodes').delete().eq('id', episodeId);
    }
    
    // 벤치마크 결과 출력
    console.log('\n📊 성능 벤치마킹 결과 요약:');
    console.log('=====================================');
    benchmarkResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}:`);
      console.log(`   소요시간: ${result.duration}ms`);
      console.log(`   세그먼트: ${result.segmentCount}개`);
      console.log(`   처리량: ${result.throughput.toFixed(2)} 세그먼트/초`);
      if (result.memoryUsage) {
        console.log(`   메모리: ${Math.round(result.memoryUsage.heapUsed / 1024 / 1024)}MB`);
      }
      console.log('');
    });
  });

  async function runBenchmark(
    testName: string, 
    locationName: string, 
    language: string = 'ko',
    options: any = {}
  ): Promise<BenchmarkResult> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    let result: BenchmarkResult;
    
    try {
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName,
          language,
          ...options
        })
      });

      const response = await POST(request);
      const data = await response.json();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const duration = endTime - startTime;
      
      if (data.success) {
        testEpisodeIds.push(data.data.episodeId);
        
        result = {
          testName,
          duration,
          segmentCount: data.data.generation?.segmentCount || 0,
          throughput: data.data.generation?.segmentCount ? 
            (data.data.generation.segmentCount / duration) * 1000 : 0,
          success: true,
          memoryUsage: {
            rss: endMemory.rss - startMemory.rss,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            external: endMemory.external - startMemory.external,
            arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
          }
        };
      } else {
        result = {
          testName,
          duration,
          segmentCount: 0,
          throughput: 0,
          success: false,
          errorDetails: data.error
        };
      }
      
    } catch (error) {
      const endTime = performance.now();
      result = {
        testName,
        duration: endTime - startTime,
        segmentCount: 0,
        throughput: 0,
        success: false,
        errorDetails: error instanceof Error ? error.message : String(error)
      };
    }
    
    benchmarkResults.push(result);
    return result;
  }

  describe('Primary Performance Targets', () => {
    it('should complete small museum in under 15 seconds', async () => {
      const result = await runBenchmark(
        '소형 박물관 (목표: <15초)',
        '벤치마크 소형 박물관',
        'ko',
        { locationContext: { type: 'small_museum', complexity: 'simple' }}
      );
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(15000);
      expect(result.segmentCount).toBeGreaterThan(10);
    }, 20000);

    it('should complete medium museum in under 30 seconds', async () => {
      const result = await runBenchmark(
        '중형 박물관 (목표: <30초)',
        '벤치마크 중형 박물관',
        'ko',
        { locationContext: { type: 'museum', complexity: 'medium' }}
      );
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(30000);
      expect(result.segmentCount).toBeGreaterThan(20);
      expect(result.throughput).toBeGreaterThan(0.5); // 0.5 세그먼트/초 이상
    }, 35000);

    it('should complete large complex site in under 60 seconds', async () => {
      const result = await runBenchmark(
        '대형 복합 사이트 (목표: <60초)',
        '벤치마크 대형 박물관',
        'ko',
        { locationContext: { type: 'complex_museum', complexity: 'high' }}
      );
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(60000);
      expect(result.segmentCount).toBeGreaterThan(30);
    }, 70000);
  });

  describe('Language Performance Comparison', () => {
    const testMuseum = '언어별 성능 테스트 박물관';
    
    it('should benchmark Korean performance', async () => {
      const result = await runBenchmark(
        '한국어 성능',
        testMuseum,
        'ko'
      );
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(40000);
    }, 50000);

    it('should benchmark English performance', async () => {
      const result = await runBenchmark(
        '영어 성능',
        testMuseum,
        'en'
      );
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(40000);
    }, 50000);

    it('should benchmark Japanese performance', async () => {
      const result = await runBenchmark(
        '일본어 성능',
        testMuseum,
        'ja'
      );
      
      expect(result.success).toBe(true);
      expect(result.duration).toBeLessThan(40000);
    }, 50000);
  });

  describe('Throughput Performance', () => {
    it('should achieve minimum throughput targets', async () => {
      const result = await runBenchmark(
        '처리량 테스트',
        '처리량 벤치마크 박물관',
        'ko'
      );
      
      expect(result.success).toBe(true);
      expect(result.throughput).toBeGreaterThan(0.3); // 최소 0.3 세그먼트/초
    }, 60000);

    it('should maintain performance under load', async () => {
      const promises = Array.from({ length: 2 }, (_, i) => 
        runBenchmark(
          `동시 부하 테스트 ${i + 1}`,
          `부하 테스트 박물관 ${i + 1}`,
          'ko'
        )
      );
      
      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter((r): r is PromiseFulfilledResult<BenchmarkResult> => 
          r.status === 'fulfilled' && r.value.success)
        .map(r => r.value);
      
      expect(successfulResults.length).toBeGreaterThanOrEqual(1);
      
      // 평균 성능이 단일 요청과 크게 다르지 않아야 함
      const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
      expect(avgDuration).toBeLessThan(50000); // 부하 시에도 50초 이내
    }, 100000);
  });

  describe('Memory Usage Tests', () => {
    it('should not exceed memory limits', async () => {
      const result = await runBenchmark(
        '메모리 사용량 테스트',
        '메모리 테스트 박물관',
        'ko'
      );
      
      expect(result.success).toBe(true);
      if (result.memoryUsage) {
        // 500MB 이내 메모리 사용
        expect(result.memoryUsage.heapUsed).toBeLessThan(500 * 1024 * 1024);
      }
    }, 60000);
  });

  describe('Regression Detection', () => {
    it('should detect performance regressions', async () => {
      // 기준 성능 측정
      const baseline = await runBenchmark(
        '기준선 측정',
        '회귀 테스트 박물관 기준',
        'ko'
      );
      
      // 같은 조건으로 재측정
      const regression = await runBenchmark(
        '회귀 검증',
        '회귀 테스트 박물관 검증',
        'ko'
      );
      
      expect(baseline.success).toBe(true);
      expect(regression.success).toBe(true);
      
      // 성능이 50% 이상 저하되면 안됨
      const performanceChange = (regression.duration - baseline.duration) / baseline.duration;
      expect(performanceChange).toBeLessThan(0.5);
      
      console.log(`성능 변화: ${(performanceChange * 100).toFixed(1)}%`);
    }, 120000);
  });
});

// 성능 측정 유틸리티
export class PerformanceProfiler {
  private marks: Map<string, number> = new Map();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) throw new Error(`Mark ${startMark} not found`);
    
    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (endMark && !end) throw new Error(`Mark ${endMark} not found`);
    
    return (end as number) - start;
  }
  
  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }
}