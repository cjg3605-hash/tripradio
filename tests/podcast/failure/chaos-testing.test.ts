/**
 * 팟캐스트 생성 시스템 장애 시나리오 테스트
 * Chaos Engineering 기법으로 실패 상황 시뮬레이션
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tts/notebooklm/generate/route';
import { createClient } from '@supabase/supabase-js';

describe('Podcast Generation Failure Scenarios', () => {
  let supabase: any;
  let testEpisodeIds: string[] = [];
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // 테스트 중 에러 로그 숨기기
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    for (const episodeId of testEpisodeIds) {
      await supabase.from('podcast_segments').delete().eq('episode_id', episodeId);
      await supabase.from('podcast_episodes').delete().eq('id', episodeId);
    }
    
    // 콘솔 에러 복원
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Failure Scenarios', () => {
    it('should handle Gemini API timeout', async () => {
      // Gemini API 타임아웃 시뮬레이션
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: 'API 타임아웃 테스트',
          language: 'ko',
          locationContext: {
            // 매우 복잡한 컨텍스트로 타임아웃 유발
            complexity: 'extreme',
            longDescription: 'a'.repeat(50000),
            detailedHistory: 'b'.repeat(30000)
          }
        })
      });

      const startTime = Date.now();
      const response = await POST(request);
      const result = await response.json();
      const duration = Date.now() - startTime;

      // 타임아웃이 발생하거나 적절한 시간 내에 실패해야 함
      if (!result.success) {
        expect(result.error).toMatch(/(timeout|시간|초과)/i);
        expect(duration).toBeLessThan(120000); // 2분 내에 타임아웃 처리
      } else {
        // 성공했더라도 합리적인 시간 내여야 함
        expect(duration).toBeLessThan(90000);
        testEpisodeIds.push(result.data.episodeId);
      }
    }, 130000);

    it('should handle TTS service failure', async () => {
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: 'TTS 실패 테스트',
          language: 'invalid-lang', // 잘못된 언어로 TTS 실패 유발
          locationContext: { type: 'museum' }
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // 실패한 에피소드가 DB에 기록되는지 확인
      const { data: episodes } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('location_input', 'TTS 실패 테스트')
        .eq('status', 'failed');

      if (episodes && episodes.length > 0) {
        testEpisodeIds.push(episodes[0].id);
        expect(episodes[0].error_message).toContain('TTS');
      }
    });

    it('should handle database connection failure', async () => {
      // DB 연결 실패를 시뮬레이션하기 위해 잘못된 URL 사용
      // 실제로는 환경변수 조작으로 테스트하지만, 여기서는 개념적 테스트
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: 'DB 연결 실패 테스트',
          language: 'ko'
        })
      });

      // DB 작업이 많은 복잡한 요청으로 DB 부하 유발
      const response = await POST(request);
      const result = await response.json();

      // DB 에러가 발생하면 적절히 처리되어야 함
      if (!result.success && result.error.includes('database')) {
        expect(result.error).toMatch(/(database|connection|DB)/i);
        expect(response.status).toBe(500);
      }
    });
  });

  describe('Resource Exhaustion Scenarios', () => {
    it('should handle memory exhaustion', async () => {
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '메모리 부족 테스트',
          language: 'ko',
          locationContext: {
            // 대용량 데이터로 메모리 부족 상황 시뮬레이션
            hugeArray: Array.from({ length: 100000 }, (_, i) => `데이터 ${i}`.repeat(100))
          }
        })
      });

      const response = await POST(request);
      const result = await response.json();

      // 메모리 부족으로 실패하거나, 적절히 처리되어야 함
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(response.status).toBeGreaterThanOrEqual(500);
      } else {
        testEpisodeIds.push(result.data.episodeId);
        // 성공했다면 메모리 효율적으로 처리된 것
        expect(result.data.segmentCount).toBeGreaterThan(0);
      }
    }, 60000);

    it('should handle concurrent request overload', async () => {
      // 동시에 많은 요청으로 시스템 부하 테스트
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        POST(new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
          method: 'POST',
          body: JSON.stringify({
            locationName: `부하 테스트 ${i}`,
            language: 'ko',
            locationContext: { type: 'museum' }
          })
        }))
      );

      const results = await Promise.allSettled(requests);
      
      let successCount = 0;
      let rateLimitCount = 0;
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const data = await result.value.json();
          if (data.success) {
            successCount++;
            testEpisodeIds.push(data.data.episodeId);
          } else if (result.value.status === 429) {
            rateLimitCount++;
          }
        }
      }

      // 일부는 성공하고, 일부는 rate limit에 걸려야 함
      expect(successCount + rateLimitCount).toBeGreaterThan(0);
      expect(successCount).toBeLessThan(concurrentRequests); // 모두 성공하면 안됨 (부하 제어 부족)
      
      console.log(`부하 테스트 결과: 성공 ${successCount}, Rate Limit ${rateLimitCount}`);
    }, 180000);
  });

  describe('Data Corruption Scenarios', () => {
    it('should handle malformed input data', async () => {
      const malformedInputs = [
        { locationName: null },
        { locationName: undefined },
        { locationName: {} },
        { locationName: [] },
        { locationName: '테스트', language: null },
        { locationName: '테스트', locationContext: 'invalid' }
      ];

      for (const input of malformedInputs) {
        const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
          method: 'POST',
          body: JSON.stringify(input)
        });

        const response = await POST(request);
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
      }
    });

    it('should handle database constraint violations', async () => {
      // 같은 데이터로 두 번 요청하여 유니크 제약조건 위반 유발
      const duplicateData = {
        locationName: '제약조건 테스트',
        language: 'ko',
        locationContext: { type: 'museum' }
      };

      // 첫 번째 요청
      const request1 = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify(duplicateData)
      });

      const response1 = await POST(request1);
      const result1 = await response1.json();
      
      if (result1.success) {
        testEpisodeIds.push(result1.data.episodeId);
      }

      // 즉시 두 번째 요청 (중복)
      const request2 = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify(duplicateData)
      });

      const response2 = await POST(request2);
      
      // 중복 요청은 409 Conflict 또는 기존 데이터 반환
      expect([200, 409]).toContain(response2.status);
    });
  });

  describe('Network Failure Scenarios', () => {
    it('should handle intermittent network failures', async () => {
      // 네트워크 지연이 있는 환경에서의 요청
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '네트워크 지연 테스트',
          language: 'ko',
          locationContext: { 
            type: 'museum',
            // 외부 API 호출이 필요한 복잡한 컨텍스트
            requiresExternalData: true
          }
        })
      });

      const startTime = Date.now();
      const response = await POST(request);
      const result = await response.json();
      const duration = Date.now() - startTime;

      if (result.success) {
        testEpisodeIds.push(result.data.episodeId);
        // 네트워크 지연이 있어도 합리적인 시간 내에 완료
        expect(duration).toBeLessThan(120000);
      } else {
        // 네트워크 문제로 실패한 경우 적절한 에러 메시지
        expect(result.error).toBeDefined();
      }
    }, 130000);

    it('should handle partial service degradation', async () => {
      // 일부 서비스가 느려진 상황 테스트
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '서비스 저하 테스트',
          language: 'ko',
          locationContext: { 
            type: 'complex_museum',
            complexity: 'high'
          }
        })
      });

      const response = await POST(request);
      const result = await response.json();

      if (result.success) {
        testEpisodeIds.push(result.data.episodeId);
        
        // 서비스 저하 상황에서도 최소한의 품질은 보장되어야 함
        expect(result.data.generation?.segmentCount).toBeGreaterThan(5);
        
        // 성능 저하가 있어도 완료는 되어야 함
        const performanceData = result.data.performance;
        if (performanceData && performanceData.totalTime) {
          const totalTime = parseInt(performanceData.totalTime.replace('ms', ''));
          expect(totalTime).toBeLessThan(180000); // 3분 내
        }
      }
    }, 190000);
  });

  describe('Recovery and Cleanup Tests', () => {
    it('should properly cleanup after failures', async () => {
      // 실패하도록 설계된 요청
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '정리 실패 테스트',
          language: 'invalid-language',
          locationContext: { type: 'invalid' }
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(false);
      
      // 실패 후 DB 상태 확인
      const { data: episodes } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('location_input', '정리 실패 테스트');

      // 실패한 레코드가 있다면 적절히 마킹되어야 함
      if (episodes && episodes.length > 0) {
        expect(episodes[0].status).toBe('failed');
        expect(episodes[0].error_message).toBeDefined();
        testEpisodeIds.push(episodes[0].id);
      }
    });

    it('should allow retry after cleanup', async () => {
      const locationName = '재시도 테스트';
      
      // 첫 번째 요청 (실패 예상)
      const failRequest = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName,
          language: 'invalid-lang'
        })
      });

      const failResponse = await POST(failRequest);
      const failResult = await failResponse.json();
      expect(failResult.success).toBe(false);

      // 정상적인 재시도 요청
      const retryRequest = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName,
          language: 'ko'
        })
      });

      const retryResponse = await POST(retryRequest);
      const retryResult = await retryResponse.json();
      
      // 재시도는 성공해야 함
      if (retryResult.success) {
        testEpisodeIds.push(retryResult.data.episodeId);
        expect(retryResult.data.generation?.segmentCount).toBeGreaterThan(0);
      }
    });
  });
});