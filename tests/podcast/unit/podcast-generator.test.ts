/**
 * 팟캐스트 생성기 단위 테스트
 * 98-99% 실패 문제 예방을 위한 핵심 컴포넌트 검증
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { FullGuidePodcastGenerator } from '@/lib/ai/podcast/full-guide-podcast-generator';
import SequentialTTSGenerator from '@/lib/ai/tts/sequential-tts-generator';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/lib/ai/gemini-client');
jest.mock('@supabase/supabase-js');
jest.mock('@/lib/location/location-slug-service');

describe('PodcastGenerator Core Components', () => {
  let mockSupabase: any;
  let testGuideData: any;
  
  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({ data: [], error: null })),
        insert: jest.fn(() => ({ data: null, error: null })),
        update: jest.fn(() => ({ data: null, error: null })),
        eq: jest.fn(() => ({ data: [], error: null }))
      }))
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    testGuideData = {
      overview: {
        title: '테스트 박물관',
        keyFeatures: '테스트 특징',
        summary: '테스트 요약'
      },
      realTimeGuide: {
        chapters: [
          {
            title: '1장: 소개',
            narrative: '테스트 내용',
            coreNarrative: '핵심 내용'
          }
        ]
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ChapterGenerator', () => {
    it('should generate valid podcast structure', async () => {
      const result = await ChapterGenerator.generatePodcastStructure(
        '테스트 박물관',
        {},
        testGuideData,
        'ko'
      );

      expect(result).toHaveProperty('totalChapters');
      expect(result).toHaveProperty('chapters');
      expect(result).toHaveProperty('selectedPersonas');
      expect(result.chapters.length).toBeGreaterThan(0);
    });

    it('should handle empty guide data gracefully', async () => {
      const result = await ChapterGenerator.generatePodcastStructure(
        '빈 가이드',
        {},
        null,
        'ko'
      );

      expect(result).toBeDefined();
      expect(result.totalChapters).toBeGreaterThanOrEqual(0);
    });

    it('should validate chapter structure completeness', async () => {
      const result = await ChapterGenerator.generatePodcastStructure(
        '테스트 박물관',
        {},
        testGuideData,
        'ko'
      );

      // 모든 챕터가 필수 속성을 가져야 함
      result.chapters.forEach(chapter => {
        expect(chapter).toHaveProperty('chapterIndex');
        expect(chapter).toHaveProperty('title');
        expect(chapter).toHaveProperty('estimatedDuration');
        expect(chapter).toHaveProperty('estimatedSegments');
      });
    });
  });

  describe('FullGuidePodcastGenerator', () => {
    let generator: FullGuidePodcastGenerator;

    beforeEach(() => {
      generator = new FullGuidePodcastGenerator();
    });

    it('should generate complete podcast script', async () => {
      const result = await generator.generateFullGuidePodcast(
        testGuideData,
        'ko-KR'
      );

      expect(result).toHaveProperty('userScript');
      expect(result).toHaveProperty('ttsScript');
      expect(result).toHaveProperty('qualityMetrics');
      expect(result.userScript.script).toBeDefined();
      expect(result.ttsScript.combinedScript).toBeDefined();
    });

    it('should validate quality metrics', async () => {
      const result = await generator.generateFullGuidePodcast(
        testGuideData,
        'ko-KR'
      );

      expect(result.qualityMetrics.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.overallScore).toBeLessThanOrEqual(100);
      expect(result.qualityMetrics).toHaveProperty('notebookLMSimilarity');
      expect(result.qualityMetrics).toHaveProperty('conversationNaturalness');
    });

    it('should handle different languages', async () => {
      const languages = ['ko-KR', 'en-US', 'ja-JP'];
      
      for (const lang of languages) {
        const result = await generator.generateFullGuidePodcast(
          testGuideData,
          lang
        );
        
        expect(result.ttsScript.metadata.language).toBe(lang);
        expect(result.userScript.title).toBeDefined();
      }
    });
  });

  describe('SequentialTTSGenerator', () => {
    it('should validate segment structure', async () => {
      const mockSegments = [
        {
          sequenceNumber: 1,
          speakerType: 'male' as const,
          textContent: '테스트 내용',
          estimatedDuration: 30,
          chapterIndex: 0
        },
        {
          sequenceNumber: 2,
          speakerType: 'female' as const,
          textContent: '테스트 내용 2',
          estimatedDuration: 25,
          chapterIndex: 0
        }
      ];

      // TTS 생성 전 검증 로직
      const isValid = SequentialTTSGenerator.validateSegmentStructure(mockSegments);
      expect(isValid).toBe(true);
    });

    it('should detect invalid segments', async () => {
      const invalidSegments = [
        {
          sequenceNumber: 1,
          speakerType: 'invalid' as any,
          textContent: '',
          estimatedDuration: -1,
          chapterIndex: 0
        }
      ];

      const isValid = SequentialTTSGenerator.validateSegmentStructure(invalidSegments);
      expect(isValid).toBe(false);
    });

    it('should calculate correct duration estimates', () => {
      const text = '이것은 테스트 문장입니다. 대략 10초 정도 걸릴 것으로 예상됩니다.';
      const estimatedDuration = SequentialTTSGenerator.estimateDuration(text);
      
      expect(estimatedDuration).toBeGreaterThan(5);
      expect(estimatedDuration).toBeLessThan(30);
    });
  });

  describe('Database Integration', () => {
    it('should handle constraint violations gracefully', async () => {
      // 중복 에피소드 생성 시도
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          error: { 
            code: '23505', 
            message: 'duplicate key value violates unique constraint'
          }
        }))
      });

      // 에러가 적절히 처리되어야 함
      const result = await SequentialTTSGenerator.generateSequentialTTS(
        [],
        '테스트 박물관',
        'episode-test',
        'ko-KR'
      );

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate status transitions', () => {
      const validTransitions = [
        ['generating', 'completed'],
        ['generating', 'failed'],
        ['failed', 'generating'],
        ['completed', 'archived']
      ];

      validTransitions.forEach(([from, to]) => {
        expect(SequentialTTSGenerator.isValidStatusTransition(from, to)).toBe(true);
      });

      // 잘못된 전환
      expect(SequentialTTSGenerator.isValidStatusTransition('completed', 'generating')).toBe(false);
    });
  });
});

// 새로운 검증 메서드들을 클래스에 추가하기 위한 확장
declare module '@/lib/ai/tts/sequential-tts-generator' {
  namespace SequentialTTSGenerator {
    function validateSegmentStructure(segments: any[]): boolean;
    function estimateDuration(text: string): number;
    function isValidStatusTransition(from: string, to: string): boolean;
  }
}