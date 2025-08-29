/**
 * 팟캐스트 생성 워크플로우 통합 테스트
 * 전체 파이프라인의 실제 동작 검증
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/tts/notebooklm/generate/route';

describe('Podcast Generation Workflow Integration', () => {
  let supabase: any;
  let testEpisodeIds: string[] = [];

  beforeAll(async () => {
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
  });

  beforeEach(() => {
    testEpisodeIds = [];
  });

  describe('Complete Workflow Tests', () => {
    it('should generate podcast from start to finish', async () => {
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '테스트 박물관 Integration',
          language: 'ko',
          locationContext: {
            type: 'museum',
            significance: '테스트용 박물관'
          }
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('episodeId');
      expect(result.data).toHaveProperty('segmentCount');
      
      testEpisodeIds.push(result.data.episodeId);

      // 생성된 에피소드 검증
      const { data: episode } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('id', result.data.episodeId)
        .single();

      expect(episode).toBeDefined();
      expect(episode.status).toBe('completed');
      expect(episode.total_duration).toBeGreaterThan(0);

      // 세그먼트 검증
      const { data: segments } = await supabase
        .from('podcast_segments')
        .select('*')
        .eq('episode_id', result.data.episodeId);

      expect(segments).toBeDefined();
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.length).toBe(result.data.segmentCount);
    }, 120000); // 2분 타임아웃

    it('should handle duplicate requests correctly', async () => {
      const requestData = {
        locationName: '중복 테스트 박물관',
        language: 'ko',
        locationContext: { type: 'museum' }
      };

      // 첫 번째 요청
      const request1 = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response1 = await POST(request1);
      const result1 = await response1.json();
      
      expect(result1.success).toBe(true);
      testEpisodeIds.push(result1.data.episodeId);

      // 중복 요청
      const request2 = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const response2 = await POST(request2);
      const result2 = await response2.json();

      // 중복 요청은 기존 데이터를 반환하거나 409 에러를 반환해야 함
      if (result2.success) {
        expect(result2.data.existingEpisode).toBe(true);
        expect(result2.data.episodeId).toBe(result1.data.episodeId);
      } else {
        expect(response2.status).toBe(409);
      }
    }, 60000);

    it('should recover from partial failures', async () => {
      // TTS 실패 시뮬레이션을 위한 잘못된 텍스트
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '실패 시뮬레이션 박물관',
          language: 'invalid-lang', // 잘못된 언어 코드
          locationContext: { type: 'museum' }
        })
      });

      const response = await POST(request);
      const result = await response.json();

      // 실패한 경우
      if (!result.success) {
        expect(result.error).toBeDefined();
        
        // DB에 실패한 에피소드가 기록되었는지 확인
        const { data: episodes } = await supabase
          .from('podcast_episodes')
          .select('*')
          .eq('location_input', '실패 시뮬레이션 박물관')
          .eq('status', 'failed');

        if (episodes && episodes.length > 0) {
          testEpisodeIds.push(episodes[0].id);
          expect(episodes[0].error_message).toBeDefined();
        }
      }
    });
  });

  describe('Performance Validation', () => {
    it('should complete within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '성능 테스트 박물관',
          language: 'ko',
          locationContext: { type: 'small_museum' }
        })
      });

      const response = await POST(request);
      const result = await response.json();
      
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      testEpisodeIds.push(result.data.episodeId);
      
      // 목표: 79초 → 30초로 개선
      expect(duration).toBeLessThan(30000); // 30초 이내
      
      console.log(`성능 테스트 결과: ${duration}ms (목표: <30초)`);
    }, 45000);

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 3;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => 
        POST(new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
          method: 'POST',
          body: JSON.stringify({
            locationName: `동시성 테스트 박물관 ${i}`,
            language: 'ko',
            locationContext: { type: 'museum' }
          })
        }))
      );

      const responses = await Promise.allSettled(requests);
      
      let successCount = 0;
      for (const response of responses) {
        if (response.status === 'fulfilled') {
          const result = await response.value.json();
          if (result.success) {
            successCount++;
            testEpisodeIds.push(result.data.episodeId);
          }
        }
      }

      // 최소 2개 이상은 성공해야 함
      expect(successCount).toBeGreaterThanOrEqual(2);
    }, 90000);
  });

  describe('Data Consistency Tests', () => {
    it('should maintain database consistency', async () => {
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: 'DB 일관성 테스트 박물관',
          language: 'ko'
        })
      });

      const response = await POST(request);
      const result = await response.json();
      
      if (result.success) {
        testEpisodeIds.push(result.data.episodeId);
        
        // 에피소드와 세그먼트 수 일치 검증
        const { data: episode } = await supabase
          .from('podcast_episodes')
          .select('*')
          .eq('id', result.data.episodeId)
          .single();

        const { data: segments } = await supabase
          .from('podcast_segments')
          .select('*')
          .eq('episode_id', result.data.episodeId);

        expect(episode.file_count).toBe(segments.length);
        
        // 세그먼트 순서 검증
        const sortedSegments = segments.sort((a, b) => a.sequence_number - b.sequence_number);
        for (let i = 0; i < sortedSegments.length; i++) {
          expect(sortedSegments[i].sequence_number).toBe(i + 1);
        }

        // 총 재생시간 검증
        const calculatedDuration = segments.reduce((sum, seg) => sum + (seg.duration_seconds || 0), 0);
        expect(Math.abs(episode.total_duration - calculatedDuration)).toBeLessThan(60); // 1분 오차 허용
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid parameters gracefully', async () => {
      const invalidRequests = [
        { body: {} }, // 빈 요청
        { body: { locationName: '' } }, // 빈 이름
        { body: { locationName: 'a'.repeat(1000) } }, // 너무 긴 이름
        { body: { locationName: '테스트', language: 'invalid' } } // 잘못된 언어
      ];

      for (const reqData of invalidRequests) {
        const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
          method: 'POST',
          body: JSON.stringify(reqData.body)
        });

        const response = await POST(request);
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
      }
    });

    it('should cleanup failed episodes properly', async () => {
      // 실패가 예상되는 요청 (매우 긴 텍스트로 타임아웃 유발)
      const request = new NextRequest('http://localhost:3000/api/tts/notebooklm/generate', {
        method: 'POST',
        body: JSON.stringify({
          locationName: '정리 테스트 박물관',
          language: 'ko',
          locationContext: { 
            type: 'museum',
            // 과도하게 긴 컨텍스트로 실패 유발
            longDescription: 'a'.repeat(10000)
          }
        })
      });

      const response = await POST(request);
      const result = await response.json();
      
      if (!result.success) {
        // 실패한 에피소드가 적절히 마크되었는지 확인
        const { data: episodes } = await supabase
          .from('podcast_episodes')
          .select('*')
          .eq('location_input', '정리 테스트 박물관')
          .eq('status', 'failed');

        if (episodes && episodes.length > 0) {
          testEpisodeIds.push(episodes[0].id);
          expect(episodes[0].error_message).toBeDefined();
        }
      }
    });
  });
});