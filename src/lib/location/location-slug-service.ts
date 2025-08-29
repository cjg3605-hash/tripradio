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
  source: 'fixed' | 'cache' | 'ai' | 'fallback';
  originalInput: string;
  language: string;
}

export class LocationSlugService {
  
  // 메모리 캐시: 런타임 중 슬러그 일관성 보장
  private static slugCache = new Map<string, string>();
  
  /**
   * 장소명 정규화: 다국어 장소명을 표준화
   */
  private static normalizeLocationName(locationName: string): string {
    return locationName
      .trim()
      .toLowerCase()
      .replace(/[\s\-_]+/g, '-')  // 공백, 하이픈, 언더스코어를 하나의 하이픈으로
      .replace(/[(){}\[\]]/g, '')  // 괄호 제거
      .replace(/[''"]/g, '')       // 따옴표 제거
      .replace(/[.,;!?]/g, '')      // 구두점 제거
      .replace(/\s+/g, '-');        // 남은 공백을 하이픈으로
  }
  
  /**
   * 캐시 키 생성: 언어별로 고유한 키 생성
   */
  private static getCacheKey(locationInput: string, language: string): string {
    const normalized = this.normalizeLocationName(locationInput);
    return `${language}:${normalized}`;
  }
  
  /**
   * 다국어 장소명 → 영문 슬러그 변환 (캐시 우선)
   */
  static async getOrCreateLocationSlug(
    locationInput: string, 
    language: string = 'ko'
  ): Promise<LocationSlugResult> {
    
    console.log(`🔍 슬러그 변환 요청: "${locationInput}" (${language})`);
    
    try {
      // 0. 메모리 캐시 확인 (가장 빠름)
      const cacheKey = this.getCacheKey(locationInput, language);
      const cachedInMemory = this.slugCache.get(cacheKey);
      if (cachedInMemory) {
        console.log(`⚡ 메모리 캐시 히트: "${locationInput}" → "${cachedInMemory}"`);
        return {
          slug: cachedInMemory,
          source: 'cache',
          originalInput: locationInput,
          language
        };
      }
      
      // 1. DB에서 영구 슬러그 조회 (모든 언어 버전 확인)
      const permanentSlug = await this.findPermanentSlug(locationInput, language);
      if (permanentSlug) {
        console.log(`✅ DB 슬러그 발견: "${locationInput}" → "${permanentSlug}"`);
        this.slugCache.set(cacheKey, permanentSlug);
        return {
          slug: permanentSlug,
          source: 'cache',
          originalInput: locationInput,
          language
        };
      }
      
      // 2. 새로운 슬러그 생성 필요
      console.log(`🤖 새 슬러그 생성 필요: "${locationInput}"`);
      
      // 기존에 사용중인 슬러그와 충돌 방지
      const baseSlug = await this.generateNewSlug(locationInput, language);
      const uniqueSlug = await this.ensureUniqueSlug(baseSlug);
      
      // 메모리 캐시에 저장
      this.slugCache.set(cacheKey, uniqueSlug);
      
      console.log(`✅ 새 슬러그 생성: "${locationInput}" → "${uniqueSlug}"`);
      return {
        slug: uniqueSlug,
        source: 'ai',
        originalInput: locationInput,
        language
      };
      
    } catch (error) {
      console.error(`❌ 슬러그 변환 오류 (${locationInput}):`, error);
      
      // 3. 폴백: 기본 변환 로직
      console.log(`🔄 폴백 변환: "${locationInput}"`);
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
   * DB에서 영구 슬러그 조회: podcast_episodes 테이블을 활용하여 일관성 보장
   */
  private static async findPermanentSlug(
    locationInput: string, 
    language: string
  ): Promise<string | null> {
    
    try {
      // 1. 정확히 일치하는 location_input 찾기 (모든 언어에서 검색)
      let { data, error } = await supabase
        .from('podcast_episodes')
        .select('location_slug, location_input, language')
        .eq('location_input', locationInput)
        .not('location_slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.warn('⚠️ 슬러그 조회 오류:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        console.log(`📋 정확한 매치 발견: "${locationInput}" → "${data[0].location_slug}" (${data[0].language})`);
        return data[0].location_slug;
      }
      
      // 2. 유사한 이름들 찾기 (트림, 대소문자 무시, 모든 언어)
      const trimmedInput = locationInput.trim();
      const { data: similarData, error: similarError } = await supabase
        .from('podcast_episodes')
        .select('location_slug, location_input, language')
        .not('location_slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20); // 더 많은 결과에서 검색
      
      if (similarError) {
        console.warn('⚠️ 유사 매치 조회 오류:', similarError);
        return null;
      }
      
      // 유사 매치 찾기 (공백 제거, 대소문자 무시)
      const similarMatch = similarData?.find(item => 
        item.location_input?.trim().toLowerCase() === trimmedInput.toLowerCase()
      );
      
      if (similarMatch) {
        console.log(`📋 유사 매치 발견: "${trimmedInput}" → "${similarMatch.location_slug}" (원본: "${similarMatch.location_input}", ${similarMatch.language})`);
        return similarMatch.location_slug;
      }
      
      // 3. 부분 매치 찾기 (핵심 키워드 포함)
      const coreKeyword = trimmedInput.replace(/[(){}[\]]/g, '').trim();
      if (coreKeyword.length >= 2) {
        const partialMatch = similarData?.find(item => {
          const itemCore = item.location_input?.replace(/[(){}[\]]/g, '').trim() || '';
          return itemCore.includes(coreKeyword) || coreKeyword.includes(itemCore);
        });
        
        if (partialMatch) {
          console.log(`📋 부분 매치 발견: "${coreKeyword}" → "${partialMatch.location_slug}" (원본: "${partialMatch.location_input}", ${partialMatch.language})`);
          return partialMatch.location_slug;
        }
      }
      
      return null;
      
    } catch (error) {
      console.warn('⚠️ 슬러그 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 새로운 슬러그 생성: AI 또는 폴백 로직 사용
   */
  private static async generateNewSlug(
    locationInput: string, 
    language: string
  ): Promise<string> {
    
    console.log(`🤖 새 슬러그 생성 시작: "${locationInput}" (${language})`);
    
    // 1. AI 변환 시도
    const aiSlug = await this.translateWithAI(locationInput);
    if (aiSlug) {
      console.log(`✅ AI 슬러그 생성 성공: "${aiSlug}"`);
      return aiSlug;
    }
    
    // 2. 폴백 로직
    console.log(`🔄 폴백 슬러그 생성 중...`);
    return this.createFallbackSlug(locationInput);
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
   * 슬러그 확인 및 재사용: 중복 시 기존 슬러그 재사용
   */
  private static async ensureUniqueSlug(baseSlug: string): Promise<string> {
    
    try {
      // DB에서 기존 슬러그 확인
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('location_slug')
        .eq('location_slug', baseSlug)
        .limit(1);
      
      if (error) {
        console.warn('⚠️ 슬러그 체크 오류:', error);
        return baseSlug; // 오류 시 기본 슬러그 사용
      }
      
      // 기존 슬러그가 있든 없든 동일한 슬러그 사용 (중복 허용)
      if (data && data.length > 0) {
        console.log(`♻️ 기존 슬러그 재사용: "${baseSlug}"`);
      } else {
        console.log(`✨ 새 슬러그 사용: "${baseSlug}"`);
      }
      
      return baseSlug;
      
    } catch (error) {
      console.warn('⚠️ 슬러그 확인 실패:', error);
      return baseSlug; // 오류 시 기본 슬러그 사용
    }
  }
  
  /**
   * 영구 슬러그 저장: 메모리 캐시만 사용 (DB 저장 제거)
   * @deprecated DB 제약조건 오류 방지를 위해 메모리 캐시만 사용
   */
  private static async savePermanentSlug(
    locationInput: string,
    locationSlug: string,
    language: string
  ): Promise<void> {
    // DB 저장 비활성화 - 메모리 캐시만 사용
    console.log(`💾 슬러그 메모리 캐시 저장: "${locationInput}" → "${locationSlug}" (${language})`);
  }
  
  /**
   * 폴백 변환: 기본 슬러그 생성 로직
   */
  private static createFallbackSlug(locationInput: string): string {
    
    // 한국어 주요 장소명 매핑
    const koreanToEnglish: Record<string, string> = {
      '경복궁': 'gyeongbokgung',
      '창덕궁': 'changdeokgung', 
      '덕수궁': 'deoksugung',
      '창경궁': 'changgyeonggung',
      '종묘': 'jongmyo',
      '대영박물관': 'british-museum',
      '루브르': 'louvre',
      '에펠탑': 'eiffel-tower',
      '타지마할': 'taj-mahal',
      '만리장성': 'great-wall',
      '자유의여신상': 'statue-of-liberty',
      '콜로세움': 'colosseum'
    };
    
    // 1. 매핑된 장소명이 있으면 사용
    if (koreanToEnglish[locationInput]) {
      return koreanToEnglish[locationInput];
    }
    
    // 2. 기본 정리 로직 (한글을 고유 식별자로 변환)
    const hash = locationInput.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
    }, 0);
    
    let slug = locationInput
      .toLowerCase()
      .replace(/[^a-zA-Z0-9가-힣\s]/g, '') // 허용된 문자만
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/[가-힣]/g, '') // 한글 제거
      .replace(/-+/g, '-') // 연속 하이픈 제거
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
    
    // 3. 빈 경우 고유 식별자 사용
    if (!slug || slug.length < 2) {
      slug = `location-${Math.abs(hash).toString(36)}`;
    } else {
      slug = `${slug}-${Math.abs(hash).toString(36).slice(0, 6)}`;
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
   * 기존 podcast_episodes 레코드에 안전하게 슬러그 정보를 저장
   */
  static async cacheLocationSlug(
    episodeId: string,
    locationInput: string,
    locationSlug: string,
    language: string,
    source: 'cache' | 'ai' | 'fallback'
  ): Promise<void> {
    
    try {
      // 먼저 기존 에피소드 상태 확인
      const { data: existingEpisode, error: selectError } = await supabase
        .from('podcast_episodes')
        .select('status, location_slug, location_input')
        .eq('id', episodeId)
        .single();
      
      if (selectError) {
        console.warn('⚠️ 에피소드 조회 실패:', selectError);
        return;
      }
      
      // 이미 슬러그가 설정되어 있으면 업데이트하지 않음 (일관성 유지)
      if (existingEpisode.location_slug && existingEpisode.location_input) {
        console.log(`📋 슬러그 이미 설정됨: "${existingEpisode.location_input}" → "${existingEpisode.location_slug}"`);
        return;
      }
      
      // 안전한 업데이트: location_slug와 location_input만 설정
      const updateData: any = {
        location_input: locationInput,
        location_slug: locationSlug,
        slug_source: source
      };
      
      // status가 pending이 아닌 경우에만 상태 변경하지 않음
      const { error } = await supabase
        .from('podcast_episodes')
        .update(updateData)
        .eq('id', episodeId);
      
      if (error) {
        console.warn('⚠️ 슬러그 캐시 저장 실패:', error.message);
        // 메모리 캐시에라도 저장
        const cacheKey = this.getCacheKey(locationInput, language);
        this.slugCache.set(cacheKey, locationSlug);
        console.log(`💾 메모리 캐시로 대체 저장: "${locationInput}" → "${locationSlug}"`);
      } else {
        console.log(`💾 슬러그 캐시 저장 완료: "${locationInput}" → "${locationSlug}" (${source})`);
        // 메모리 캐시에도 저장하여 빠른 액세스 보장
        const cacheKey = this.getCacheKey(locationInput, language);
        this.slugCache.set(cacheKey, locationSlug);
      }
      
    } catch (error) {
      console.warn('⚠️ 슬러그 캐시 저장 오류:', error);
      // 실패 시 메모리 캐시라도 유지
      const cacheKey = this.getCacheKey(locationInput, language);
      this.slugCache.set(cacheKey, locationSlug);
      console.log(`💾 메모리 캐시로 폴백 저장: "${locationInput}" → "${locationSlug}"`);
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