import { supabase } from './supabaseClient';

// Supabase에 히스토리 저장
export async function saveGuideHistoryToSupabase(user, locationName, guideData, userProfile) {
  // 디버깅: user_id, session.user.id, supabase.auth.getUser() UID 모두 출력
  console.log('INSERT user_id (session.user.id):', user?.id);
  try {
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    console.log('supabase.auth.getUser() UID:', supaUser?.id);
  } catch (e) {
    console.warn('supabase.auth.getUser() error:', e);
  }
  const { error } = await supabase
    .from('guide_history')
    .insert([{
      user_id: user.id,
      location_name: locationName,
      guide_data: guideData,
      user_profile: userProfile,
      created_at: new Date().toISOString()
    }]);
  if (error) {
    console.error('Supabase 히스토리 저장 실패:', error);
  }
}

// 🚨 누락된 함수 추가: Supabase에서 히스토리 조회
export async function fetchGuideHistoryFromSupabase(user) {
  if (!user?.id) {
    console.warn('❌ fetchGuideHistoryFromSupabase: user.id가 없습니다');
    return [];
  }

  try {
    console.log('🔍 Supabase에서 히스토리 조회 중...', { userId: user.id });
    
    const { data, error } = await supabase
      .from('guide_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase 히스토리 조회 실패:', error);
      return [];
    }

    // HistoryEntry/GuideHistoryEntry 형태로 변환 (두 타입 모두 호환)
    const historyEntries = (data || []).map(entry => ({
      // HistoryEntry 필드들
      fileName: entry.id || `guide_${Date.now()}`,
      locationName: entry.location_name || '알 수 없는 위치',
      generatedAt: entry.created_at || new Date().toISOString(),
      preview: entry.guide_data?.realTimeGuide?.chapters?.[0]?.title || '가이드 미리보기',
      
      // GuideHistoryEntry 필드들 추가
      id: entry.id || `guide_${Date.now()}`,
      createdAt: entry.created_at || new Date().toISOString(),
      guideData: entry.guide_data,
      userProfile: entry.user_profile,
      viewedPages: [], // 기본값
      completed: false, // 기본값
      
      // 기존 필드들 (하위 호환성)
      timestamp: entry.created_at || new Date().toISOString()
    }));

    console.log('✅ 히스토리 조회 완료:', { count: historyEntries.length });
    return historyEntries;

  } catch (error) {
    console.error('❌ fetchGuideHistoryFromSupabase 오류:', error);
    return [];
  }
}

// ===============================
// 🚀 새로운 챕터별 상세 내용 관리 함수들
// ===============================

/**
 * 가이드와 챕터들을 동시에 저장하는 트랜잭션 함수
 */
export async function saveGuideWithChapters(
  locationName: string,
  language: string,
  guideData: any,
  detailedChapters?: any[]
) {
  try {
    console.log('💾 가이드+챕터 통합 저장 시작:', { locationName, language, hasDetailedChapters: !!detailedChapters });

    // 1. 기본 가이드 저장 (기존 방식)
    const { data: guideResult, error: guideError } = await supabase
      .from('guides')
      .upsert([{
        locationname: locationName.toLowerCase().trim(),
        language: language.toLowerCase().trim(),
        content: guideData,
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (guideError) {
      console.error('❌ 가이드 저장 실패:', guideError);
      return { success: false, error: guideError };
    }

    const guideId = guideResult.id;
    console.log('✅ 가이드 저장 완료:', { guideId });

    // 2. 상세 챕터들이 있는 경우 별도 테이블에 저장
    if (detailedChapters && detailedChapters.length > 0) {
      const chapterRecords = detailedChapters.map((chapter, index) => ({
        guide_id: guideId,
        chapter_index: index,
        title: chapter.title || `챕터 ${index + 1}`,
        narrative: chapter.narrative,
        next_direction: chapter.nextDirection,
        scene_description: chapter.sceneDescription,
        core_narrative: chapter.coreNarrative,
        human_stories: chapter.humanStories,
        latitude: chapter.latitude || chapter.lat,
        longitude: chapter.longitude || chapter.lng,
        duration_seconds: chapter.duration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: chaptersError } = await supabase
        .from('guide_chapters')
        .upsert(chapterRecords, {
          onConflict: 'guide_id,chapter_index'
        });

      if (chaptersError) {
        console.error('❌ 챕터 저장 실패:', chaptersError);
        return { success: false, error: chaptersError };
      }

      console.log('✅ 챕터 저장 완료:', { count: chapterRecords.length });
    }

    return { success: true, guideId };

  } catch (error) {
    console.error('❌ 가이드+챕터 저장 중 오류:', error);
    return { success: false, error };
  }
}

/**
 * 특정 챕터의 상세 내용만 업데이트
 */
export async function updateChapterDetails(
  guideId: string,
  chapterIndex: number,
  chapterData: {
    narrative?: string;
    nextDirection?: string;
    sceneDescription?: string;
    coreNarrative?: string;
    humanStories?: string;
    latitude?: number;
    longitude?: number;
    duration?: number;
  }
) {
  try {
    console.log('📖 챕터 상세 내용 업데이트:', { guideId, chapterIndex });

    const { error } = await supabase
      .from('guide_chapters')
      .upsert([{
        guide_id: guideId,
        chapter_index: chapterIndex,
        narrative: chapterData.narrative,
        next_direction: chapterData.nextDirection,
        scene_description: chapterData.sceneDescription,
        core_narrative: chapterData.coreNarrative,
        human_stories: chapterData.humanStories,
        latitude: chapterData.latitude,
        longitude: chapterData.longitude,
        duration_seconds: chapterData.duration,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'guide_id,chapter_index'
      });

    if (error) {
      console.error('❌ 챕터 업데이트 실패:', error);
      return { success: false, error };
    }

    console.log('✅ 챕터 업데이트 완료');
    return { success: true };

  } catch (error) {
    console.error('❌ 챕터 업데이트 중 오류:', error);
    return { success: false, error };
  }
}

/**
 * 가이드의 모든 챕터 상세 내용 조회
 */
export async function getGuideWithDetailedChapters(locationName: string, language: string) {
  try {
    console.log('🔍 상세 챕터 포함 가이드 조회:', { locationName, language });

    // 1. 기본 가이드 조회
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName.toLowerCase().trim())
      .eq('language', language.toLowerCase().trim())
      .single();

    if (guideError || !guide) {
      console.log('📭 가이드 없음:', guideError);
      return { success: false, error: guideError };
    }

    // 2. 해당 가이드의 상세 챕터들 조회
    const { data: chapters, error: chaptersError } = await supabase
      .from('guide_chapters')
      .select('*')
      .eq('guide_id', guide.id)
      .order('chapter_index');

    if (chaptersError) {
      console.error('❌ 챕터 조회 실패:', chaptersError);
      // 챕터 조회 실패해도 기본 가이드는 반환
      return { success: true, guide: guide.content, chapters: [] };
    }

    console.log('✅ 상세 가이드 조회 완료:', { 
      hasGuide: !!guide, 
      chaptersCount: chapters?.length || 0 
    });

    // 3. 기본 가이드 내용과 상세 챕터 내용 통합
    const enhancedGuide = { ...guide.content };
    if (chapters && chapters.length > 0 && enhancedGuide.realTimeGuide?.chapters) {
      enhancedGuide.realTimeGuide.chapters = enhancedGuide.realTimeGuide.chapters.map((chapter: any, index: number) => {
        const detailedChapter = chapters.find(c => c.chapter_index === index);
        if (detailedChapter) {
          return {
            ...chapter,
            narrative: detailedChapter.narrative,
            nextDirection: detailedChapter.next_direction,
            sceneDescription: detailedChapter.scene_description,
            coreNarrative: detailedChapter.core_narrative,
            humanStories: detailedChapter.human_stories,
            latitude: detailedChapter.latitude,
            longitude: detailedChapter.longitude,
            duration: detailedChapter.duration_seconds
          };
        }
        return chapter;
      });
    }

    return { 
      success: true, 
      guide: enhancedGuide, 
      chapters,
      guideId: guide.id 
    };

  } catch (error) {
    console.error('❌ 상세 가이드 조회 중 오류:', error);
    return { success: false, error };
  }
}

/**
 * 챕터에 상세 내용이 있는지 확인
 */
export async function hasChapterDetails(guideId: string, chapterIndex: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('guide_chapters')
      .select('narrative, scene_description, core_narrative, human_stories')
      .eq('guide_id', guideId)
      .eq('chapter_index', chapterIndex)
      .single();

    if (error || !data) return false;

    // 중요한 필드 중 하나라도 있으면 true
    return !!(data.narrative || 
             (data.scene_description && data.core_narrative && data.human_stories));

  } catch (error) {
    console.error('❌ 챕터 내용 확인 중 오류:', error);
    return false;
  }
}

// ===============================
// 🌟 즐겨찾기 관리 함수들
// ===============================

/**
 * 즐겨찾기 가이드 저장
 */
export async function saveFavoriteGuide(user: any, guideData: any, locationName: string) {
  if (!user?.id) {
    console.warn('❌ saveFavoriteGuide: user.id가 없습니다');
    return { success: false, error: 'User not authenticated' };
  }

  try {
    console.log('💖 즐겨찾기 저장 시작:', { userId: user.id, locationName });

    const { error } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: user.id,
        location_name: locationName,
        guide_data: guideData,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('❌ 즐겨찾기 저장 실패:', error);
      return { success: false, error };
    }

    console.log('✅ 즐겨찾기 저장 완료');
    return { success: true };

  } catch (error) {
    console.error('❌ saveFavoriteGuide 오류:', error);
    return { success: false, error };
  }
}

/**
 * 즐겨찾기 가이드인지 확인
 */
export async function isFavoriteGuide(user: any, locationName: string): Promise<boolean> {
  if (!user?.id) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('location_name', locationName)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116은 "not found" 에러
      console.error('❌ 즐겨찾기 확인 실패:', error);
      return false;
    }

    return !!data;

  } catch (error) {
    console.error('❌ isFavoriteGuide 오류:', error);
    return false;
  }
}

/**
 * 즐겨찾기 가이드 제거
 */
export async function removeFavoriteGuide(user: any, locationName: string) {
  if (!user?.id) {
    console.warn('❌ removeFavoriteGuide: user.id가 없습니다');
    return { success: false, error: 'User not authenticated' };
  }

  try {
    console.log('💔 즐겨찾기 제거 시작:', { userId: user.id, locationName });

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('location_name', locationName);

    if (error) {
      console.error('❌ 즐겨찾기 제거 실패:', error);
      return { success: false, error };
    }

    console.log('✅ 즐겨찾기 제거 완료');
    return { success: true };

  } catch (error) {
    console.error('❌ removeFavoriteGuide 오류:', error);
    return { success: false, error };
  }
}

/**
 * 사용자의 모든 즐겨찾기 가이드 조회
 */
export async function getFavoriteGuides(user: any) {
  if (!user?.id) {
    console.warn('❌ getFavoriteGuides: user.id가 없습니다');
    return [];
  }

  try {
    console.log('🔍 즐겨찾기 목록 조회 중...', { userId: user.id });

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ 즐겨찾기 조회 실패:', error);
      return [];
    }

    const favoriteGuides = (data || []).map(entry => ({
      id: entry.id,
      locationName: entry.location_name,
      guideData: entry.guide_data,
      createdAt: entry.created_at,
      preview: entry.guide_data?.realTimeGuide?.chapters?.[0]?.title || '즐겨찾기 가이드',
    }));

    console.log('✅ 즐겨찾기 조회 완료:', { count: favoriteGuides.length });
    return favoriteGuides;

  } catch (error) {
    console.error('❌ getFavoriteGuides 오류:', error);
    return [];
  }
} 