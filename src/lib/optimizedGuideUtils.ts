// 🚀 최적화된 가이드 유틸리티 함수들
// src/lib/optimizedGuideUtils.ts

import { supabase } from '@/lib/supabaseClient';

export interface GuideMetadata {
  exists: boolean;
  chapterCount: number;
  hasContent: boolean;
  title?: string;
  updatedAt?: string;
}

export interface ChapterContent {
  id: number;
  title: string;
  narrative?: string;
  nextDirection?: string;
  sceneDescription?: string;
  coreNarrative?: string;
  humanStories?: string;
}

// 🚀 성능 최적화된 가이드 조회 클래스
export class OptimizedGuideQuery {
  // 📊 메타데이터만 빠르게 조회 (전체 content 로드 없이)
  static async getMetadata(locationName: string, language: string): Promise<GuideMetadata> {
    try {
      const { data, error } = await supabase.rpc('get_guide_metadata', {
        p_location: locationName.toLowerCase().trim(),
        p_language: language.toLowerCase().trim()
      });

      if (error) {
        console.error('❌ 메타데이터 조회 실패:', error);
        return { exists: false, chapterCount: 0, hasContent: false };
      }

      return data || { exists: false, chapterCount: 0, hasContent: false };
    } catch (error) {
      console.error('❌ 메타데이터 조회 중 오류:', error);
      return { exists: false, chapterCount: 0, hasContent: false };
    }
  }

  // 🎯 특정 챕터만 조회 (메모리 효율적)
  static async getChapter(
    locationName: string, 
    language: string, 
    chapterIndex: number
  ): Promise<ChapterContent | null> {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select(`content->realTimeGuide->chapters->${chapterIndex}`)
        .eq('locationname', locationName.toLowerCase().trim())
        .eq('language', language.toLowerCase().trim())
        .single();

      if (error || !data) {
        return null;
      }

      const chapterData = data[`content->realTimeGuide->chapters->${chapterIndex}`];
      return chapterData || null;
    } catch (error) {
      console.error('❌ 챕터 조회 중 오류:', error);
      return null;
    }
  }

  // 📖 페이지네이션된 챕터 조회 (대용량 가이드용)
  static async getChaptersPaginated(
    locationName: string,
    language: string,
    page: number = 0,
    limit: number = 5
  ) {
    try {
      const { data, error } = await supabase.rpc('get_guide_chapters_paginated', {
        p_location: locationName.toLowerCase().trim(),
        p_language: language.toLowerCase().trim(),
        p_start: page * limit,
        p_limit: limit
      });

      if (error) {
        console.error('❌ 페이지네이션 조회 실패:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ 페이지네이션 조회 중 오류:', error);
      return null;
    }
  }

  // 🔍 챕터 존재 여부만 확인 (가장 빠른 조회)
  static async hasChapterContent(
    locationName: string,
    language: string,
    chapterIndex: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_chapter_exists', {
        p_location: locationName.toLowerCase().trim(),
        p_language: language.toLowerCase().trim(),
        p_chapter_index: chapterIndex
      });

      return data === true;
    } catch (error) {
      console.error('❌ 챕터 존재 확인 중 오류:', error);
      return false;
    }
  }

  // 📊 전체 가이드 통계 조회
  static async getStatistics() {
    try {
      const { data, error } = await supabase.rpc('get_guides_statistics');
      
      if (error) {
        console.error('❌ 통계 조회 실패:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ 통계 조회 중 오류:', error);
      return null;
    }
  }
}

// 🚀 성능 최적화된 가이드 업데이트 클래스
export class OptimizedGuideUpdate {
  // ⚡ 원자적 챕터 업데이트 (PostgreSQL 함수 활용)
  static async updateChapter(
    locationName: string,
    language: string,
    chapterIndex: number,
    chapterData: Partial<ChapterContent>
  ): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('⚡ 원자적 챕터 업데이트:', {
        locationName,
        chapterIndex,
        hasNarrative: !!chapterData.narrative
      });

      const { data, error } = await supabase.rpc('update_guide_chapter', {
        p_location: locationName.toLowerCase().trim(),
        p_language: language.toLowerCase().trim(),
        p_chapter_index: chapterIndex,
        p_chapter_data: chapterData
      });

      if (error) {
        console.error('❌ 원자적 업데이트 실패:', error);
        return { success: false, error };
      }

      console.log('✅ 원자적 챕터 업데이트 완료');
      return { success: true };
    } catch (error) {
      console.error('❌ 챕터 업데이트 중 오류:', error);
      return { success: false, error };
    }
  }

  // 📝 새 챕터 추가
  static async appendChapter(
    locationName: string,
    language: string,
    chapterData: ChapterContent
  ): Promise<{ success: boolean; error?: any; newIndex?: number }> {
    try {
      const { data, error } = await supabase.rpc('append_guide_chapter', {
        p_location: locationName.toLowerCase().trim(),
        p_language: language.toLowerCase().trim(),
        p_chapter_data: chapterData
      });

      if (error) {
        return { success: false, error };
      }

      const newIndex = data?.realTimeGuide?.chapters?.length - 1;
      return { success: true, newIndex };
    } catch (error) {
      return { success: false, error };
    }
  }

  // 🧹 빈 챕터 정리
  static async cleanupEmptyChapters(
    locationName: string,
    language: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      const { data, error } = await supabase.rpc('cleanup_empty_chapters', {
        p_location: locationName.toLowerCase().trim(),
        p_language: language.toLowerCase().trim()
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}

// 🎯 캐싱 및 성능 최적화 유틸리티
export class GuideCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly TTL = 10 * 60 * 1000; // 10분 TTL

  static getCacheKey(locationName: string, language: string, suffix?: string): string {
    const base = `${locationName.toLowerCase().trim()}_${language.toLowerCase().trim()}`;
    return suffix ? `${base}_${suffix}` : base;
  }

  // 🔄 캐시된 메타데이터 조회
  static async getCachedMetadata(locationName: string, language: string): Promise<GuideMetadata> {
    const cacheKey = this.getCacheKey(locationName, language, 'metadata');
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const metadata = await OptimizedGuideQuery.getMetadata(locationName, language);
    this.cache.set(cacheKey, { data: metadata, timestamp: Date.now() });
    return metadata;
  }

  // 🔄 캐시된 챕터 조회
  static async getCachedChapter(
    locationName: string,
    language: string,
    chapterIndex: number
  ): Promise<ChapterContent | null> {
    const cacheKey = this.getCacheKey(locationName, language, `chapter_${chapterIndex}`);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const chapter = await OptimizedGuideQuery.getChapter(locationName, language, chapterIndex);
    if (chapter) {
      this.cache.set(cacheKey, { data: chapter, timestamp: Date.now() });
    }
    return chapter;
  }

  // 🗑️ 캐시 무효화
  static invalidate(locationName: string, language: string, chapterIndex?: number): void {
    if (chapterIndex !== undefined) {
      // 특정 챕터 캐시만 무효화
      const chapterKey = this.getCacheKey(locationName, language, `chapter_${chapterIndex}`);
      this.cache.delete(chapterKey);
    } else {
      // 해당 가이드의 모든 캐시 무효화
      const baseKey = this.getCacheKey(locationName, language);
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(baseKey));
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  // 🧹 전체 캐시 정리
  static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// 🚀 배치 처리 유틸리티
export class GuideBatchProcessor {
  // 📦 여러 챕터 동시 조회
  static async getMultipleChapters(
    locationName: string,
    language: string,
    chapterIndexes: number[]
  ): Promise<(ChapterContent | null)[]> {
    const promises = chapterIndexes.map(index =>
      OptimizedGuideQuery.getChapter(locationName, language, index)
    );
    return Promise.all(promises);
  }

  // 📦 여러 챕터 동시 업데이트
  static async updateMultipleChapters(
    locationName: string,
    language: string,
    updates: { index: number; data: Partial<ChapterContent> }[]
  ): Promise<{ successes: number; failures: number; errors: any[] }> {
    const results = await Promise.allSettled(
      updates.map(update =>
        OptimizedGuideUpdate.updateChapter(locationName, language, update.index, update.data)
      )
    );

    let successes = 0;
    let failures = 0;
    const errors: any[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successes++;
      } else {
        failures++;
        errors.push({
          index: updates[index].index,
          error: result.status === 'rejected' ? result.reason : result.value.error
        });
      }
    });

    return { successes, failures, errors };
  }
}

// 🎯 성능 모니터링 유틸리티
export class GuidePerformanceMonitor {
  private static metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  static startTimer(operation: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }

  private static recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    this.metrics.set(operation, existing);
  }

  static getMetrics(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.metrics.entries());
  }

  static resetMetrics(): void {
    this.metrics.clear();
  }
}

// 🔧 헬퍼 함수들
export const GuideHelpers = {
  // 챕터에 유의미한 내용이 있는지 확인
  hasValidContent(chapter: ChapterContent | null): boolean {
    if (!chapter) return false;
    
    return !!(
      (chapter.narrative && chapter.narrative.trim().length > 100) ||
      (chapter.sceneDescription && chapter.sceneDescription.trim().length > 50) ||
      (chapter.coreNarrative && chapter.coreNarrative.trim().length > 50)
    );
  },

  // 챕터의 텍스트 길이 계산
  getContentLength(chapter: ChapterContent): number {
    let total = 0;
    if (chapter.narrative) total += chapter.narrative.length;
    if (chapter.sceneDescription) total += chapter.sceneDescription.length;
    if (chapter.coreNarrative) total += chapter.coreNarrative.length;
    if (chapter.humanStories) total += chapter.humanStories.length;
    if (chapter.nextDirection) total += chapter.nextDirection.length;
    return total;
  },

  // 챕터 완성도 점수 계산 (0-100)
  getCompletionScore(chapter: ChapterContent): number {
    let score = 0;
    
    if (chapter.narrative && chapter.narrative.length >= 1400) score += 40;
    else if (chapter.narrative && chapter.narrative.length >= 1200) score += 30;
    else if (chapter.narrative && chapter.narrative.length >= 1000) score += 20;
    
    if (chapter.nextDirection && chapter.nextDirection.length >= 150) score += 20;
    
    if (chapter.sceneDescription && chapter.sceneDescription.length >= 600) score += 15;
    if (chapter.coreNarrative && chapter.coreNarrative.length >= 500) score += 15;
    if (chapter.humanStories && chapter.humanStories.length >= 250) score += 10;
    
    return Math.min(score, 100);
  }
};

// 사용 예시 및 테스트 함수
export const GuideTestUtils = {
  // 🧪 성능 테스트
  async performanceTest(locationName: string, language: string) {
    console.log('🧪 가이드 성능 테스트 시작');
    
    const endMetadataTimer = GuidePerformanceMonitor.startTimer('metadata_query');
    const metadata = await OptimizedGuideQuery.getMetadata(locationName, language);
    endMetadataTimer();
    
    console.log('📊 메타데이터:', metadata);
    
    if (metadata.exists && metadata.chapterCount > 0) {
      const endChapterTimer = GuidePerformanceMonitor.startTimer('chapter_query');
      const firstChapter = await OptimizedGuideQuery.getChapter(locationName, language, 0);
      endChapterTimer();
      
      console.log('📖 첫 번째 챕터:', firstChapter);
    }
    
    console.log('⏱️ 성능 메트릭:', GuidePerformanceMonitor.getMetrics());
  },

  // 🔍 데이터 무결성 검사
  async integrityCheck(locationName: string, language: string) {
    const metadata = await OptimizedGuideQuery.getMetadata(locationName, language);
    const issues: string[] = [];
    
    if (!metadata.exists) {
      issues.push('가이드가 존재하지 않습니다.');
      return issues;
    }
    
    for (let i = 0; i < metadata.chapterCount; i++) {
      const chapter = await OptimizedGuideQuery.getChapter(locationName, language, i);
      if (!chapter) {
        issues.push(`챕터 ${i}가 누락되었습니다.`);
      } else if (!GuideHelpers.hasValidContent(chapter)) {
        issues.push(`챕터 ${i}에 유의미한 내용이 없습니다.`);
      }
    }
    
    return issues;
  }
};