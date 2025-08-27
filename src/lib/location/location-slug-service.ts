/**
 * 통합 Location Slug 서비스
 * 
 * podcast_episodes 테이블을 캐시로 활용하여 
 * 다국어 장소명 → 영문 슬러그 변환 및 캐싱 시스템
 */

import { createClient } from '@supabase/supabase-js';
import { getDefaultGeminiModel } from '@/lib/ai/gemini-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface LocationSlugResult {
  slug: string;
  source: 'cache' | 'ai' | 'fallback';
  originalInput: string;
  language: string;
}

export class LocationSlugService {
  
  /**
   * 다국어 장소명 → 영문 슬러그 변환 (캐시 우선)
   */
  static async getOrCreateLocationSlug(
    locationInput: string, 
    language: string = 'ko'
  ): Promise<LocationSlugResult> {
    
    console.log(`🔍 슬러그 변환 요청: "${locationInput}" (${language})`);
    
    try {
      // 1. 캐시 조회: 기존 podcast_episodes에서 슬러그 찾기
      const cachedSlug = await this.findCachedSlug(locationInput, language);
      if (cachedSlug) {
        console.log(`✅ 캐시 히트: "${locationInput}" → "${cachedSlug}"`);
        return {
          slug: cachedSlug,
          source: 'cache',
          originalInput: locationInput,
          language
        };
      }
      
      // 2. AI 변환: Gemini 2.5 Flash-Lite로 영문명 생성
      console.log(`🤖 AI 변환 시작: "${locationInput}"`);
      const aiSlug = await this.translateWithAI(locationInput);
      
      if (aiSlug) {
        console.log(`✅ AI 변환 성공: "${locationInput}" → "${aiSlug}"`);
        return {
          slug: aiSlug,
          source: 'ai',
          originalInput: locationInput,
          language
        };
      }
      
      // 3. 폴백: 기본 변환 로직
      console.log(`🔄 폴백 변환: "${locationInput}"`);
      const fallbackSlug = this.createFallbackSlug(locationInput);
      
      return {
        slug: fallbackSlug,
        source: 'fallback',
        originalInput: locationInput,
        language
      };
      
    } catch (error) {
      console.error(`❌ 슬러그 변환 오류 (${locationInput}):`, error);
      
      // 오류시 폴백
      const fallbackSlug = this.createFallbackSlug(locationInput);
      return {
        slug: fallbackSlug,
        source: 'fallback',
        originalInput: locationInput,
        language
      };
    }
  }
  
  /**
   * 캐시 조회: podcast_episodes 테이블에서 기존 슬러그 찾기
   */
  private static async findCachedSlug(
    locationInput: string, 
    language: string
  ): Promise<string | null> {
    
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('location_slug')
        .eq('location_input', locationInput)
        .eq('language', language)
        .not('location_slug', 'is', null)
        .limit(1);
      
      if (error) {
        console.warn('⚠️ 캐시 조회 오류:', error);
        return null;
      }
      
      return data?.[0]?.location_slug || null;
      
    } catch (error) {
      console.warn('⚠️ 캐시 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * AI 변환: Gemini 2.5 Flash-Lite로 영문명 생성
   */
  private static async translateWithAI(locationInput: string): Promise<string | null> {
    
    try {
      const model = getDefaultGeminiModel();
      
      const prompt = `
다음 장소명을 영어 폴더명으로 변환하세요:

입력: "${locationInput}"

변환 규칙:
1. 정확한 영어 장소명으로 번역
2. 소문자만 사용
3. 공백을 하이픈(-)으로 변경
4. 특수문자 제거 (알파벳, 숫자, 하이픈만 허용)
5. 50자 이내로 제한

예시:
- 대영박물관 → british-museum
- 에펠탑 → eiffel-tower
- 국립중앙박물관 → national-museum-korea

변환된 영어 폴더명만 출력하세요:`;

      const result = await model.generateContent(prompt);
      let englishSlug = result.response.text().trim().toLowerCase();
      
      // 안전성 검증 및 정리
      englishSlug = this.sanitizeSlug(englishSlug);
      
      // 유효성 검사
      if (!englishSlug || englishSlug.length < 2) {
        console.warn(`⚠️ AI 변환 결과 무효: "${englishSlug}"`);
        return null;
      }
      
      return englishSlug;
      
    } catch (error) {
      console.error('❌ AI 변환 실패:', error);
      return null;
    }
  }
  
  /**
   * 폴백 변환: 기본 슬러그 생성 로직
   */
  private static createFallbackSlug(locationInput: string): string {
    
    // 기본 정리 로직
    let slug = locationInput
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣\s]/g, '') // 허용된 문자만
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/[가-힣]/g, 'location') // 한글은 location으로
      .replace(/-+/g, '-') // 연속 하이픈 제거
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
    
    // 너무 짧거나 빈 경우 기본값
    if (!slug || slug.length < 2) {
      slug = 'location-' + Date.now().toString(36);
    }
    
    // 길이 제한
    slug = slug.substring(0, 50);
    
    return slug;
  }
  
  /**
   * 슬러그 정리 유틸리티
   */
  private static sanitizeSlug(rawSlug: string): string {
    return rawSlug
      .replace(/[^a-zA-Z0-9\-]/g, '') // 허용된 문자만
      .replace(/-+/g, '-') // 연속 하이픈 제거  
      .replace(/^-+|-+$/g, '') // 앞뒤 하이픈 제거
      .substring(0, 50); // 길이 제한
  }
  
  /**
   * 슬러그 캐시 저장 (에피소드 생성시 자동 호출)
   */
  static async cacheLocationSlug(
    episodeId: string,
    locationInput: string,
    locationSlug: string,
    language: string,
    source: 'cache' | 'ai' | 'fallback'
  ): Promise<void> {
    
    try {
      const { error } = await supabase
        .from('podcast_episodes')
        .update({
          location_input: locationInput,
          location_slug: locationSlug,
          slug_source: source
        })
        .eq('id', episodeId);
      
      if (error) {
        console.warn('⚠️ 슬러그 캐시 저장 실패:', error);
      } else {
        console.log(`💾 슬러그 캐시 저장: "${locationInput}" → "${locationSlug}" (${source})`);
      }
      
    } catch (error) {
      console.warn('⚠️ 슬러그 캐시 저장 오류:', error);
    }
  }
  
  /**
   * 슬러그 검증 유틸리티
   */
  static validateSlug(slug: string): boolean {
    return /^[a-z0-9\-]{2,50}$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
  }
}

export default LocationSlugService;