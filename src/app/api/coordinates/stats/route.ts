// 좌표 관리 통계 조회 API
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { CoordinateStats } from '@/types/guide';

interface StatsQuery {
  guideId?: string;
  locationName?: string;
  includeDetails?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // URL에서 searchParams 추출 (정적 렌더링 방지를 위해)
    const url = new URL(request.url);
    const guideId = url.searchParams.get('guideId');
    const locationName = url.searchParams.get('locationName');
    const includeDetails = url.searchParams.get('includeDetails') === 'true';

    // 1. 기본 쿼리 구성
    let query = supabase
      .from('guide_chapters')
      .select('id, guide_id, chapter_index, title, latitude, longitude, coordinate_accuracy, regeneration_attempts, validation_status, last_validated_at');

    if (guideId) {
      query = query.eq('guide_id', guideId);
    }

    const { data: chapters, error } = await query;

    if (error) {
      return NextResponse.json({
        success: false,
        error: `챕터 조회 실패: ${error.message}`
      }, { status: 500 });
    }

    if (!chapters) {
      return NextResponse.json({
        success: true,
        stats: {
          totalChapters: 0,
          withCoordinates: 0,
          highAccuracy: 0,
          mediumAccuracy: 0,
          lowAccuracy: 0,
          needsRegeneration: 0,
          averageAccuracy: 0
        }
      });
    }

    // 2. 통계 계산
    const totalChapters = chapters.length;
    const withCoordinates = chapters.filter(ch => ch.latitude && ch.longitude).length;
    
    const accuracyValues = chapters
      .filter(ch => ch.coordinate_accuracy !== null && ch.coordinate_accuracy !== undefined)
      .map(ch => ch.coordinate_accuracy);
    
    const highAccuracy = chapters.filter(ch => (ch.coordinate_accuracy || 0) >= 0.8).length;
    const mediumAccuracy = chapters.filter(ch => {
      const acc = ch.coordinate_accuracy || 0;
      return acc >= 0.5 && acc < 0.8;
    }).length;
    const lowAccuracy = chapters.filter(ch => (ch.coordinate_accuracy || 0) < 0.5).length;
    
    const needsRegeneration = chapters.filter(ch => {
      const acc = ch.coordinate_accuracy || 0;
      const attempts = ch.regeneration_attempts || 0;
      return acc < 0.8 && attempts < 3;
    }).length;
    
    const averageAccuracy = accuracyValues.length > 0
      ? accuracyValues.reduce((sum, acc) => sum + acc, 0) / accuracyValues.length
      : 0;

    const stats: CoordinateStats = {
      totalChapters,
      withCoordinates,
      highAccuracy,
      mediumAccuracy,
      lowAccuracy,
      needsRegeneration,
      averageAccuracy: Math.round(averageAccuracy * 1000) / 1000 // 소수점 3자리
    };

    // 3. 상세 정보 포함 (요청 시)
    let detailsByStatus: Record<string, any[]> | undefined = undefined;
    let detailsByGuide: Record<string, any> | undefined = undefined;

    if (includeDetails) {
      // 상태별 분류
      detailsByStatus = {
        pending: chapters.filter(ch => ch.validation_status === 'pending'),
        verified: chapters.filter(ch => ch.validation_status === 'verified'),
        failed: chapters.filter(ch => ch.validation_status === 'failed'),
        manual: chapters.filter(ch => ch.validation_status === 'manual')
      };

      // 가이드별 통계 (guideId가 지정되지 않은 경우)
      if (!guideId) {
        const guideGroups = chapters.reduce((groups, chapter) => {
          const gId = chapter.guide_id;
          if (!groups[gId]) {
            groups[gId] = [];
          }
          groups[gId].push(chapter);
          return groups;
        }, {} as Record<string, typeof chapters>);

        detailsByGuide = Object.entries(guideGroups).map(([gId, guideChapters]) => {
          const guideWithCoords = guideChapters.filter(ch => ch.latitude && ch.longitude).length;
          const guideHighAcc = guideChapters.filter(ch => (ch.coordinate_accuracy || 0) >= 0.8).length;
          const guideAvgAcc = guideChapters
            .filter(ch => ch.coordinate_accuracy !== null)
            .reduce((sum, ch, _, arr) => sum + (ch.coordinate_accuracy || 0) / arr.length, 0);

          return {
            guideId: gId,
            totalChapters: guideChapters.length,
            withCoordinates: guideWithCoords,
            highAccuracy: guideHighAcc,
            averageAccuracy: Math.round(guideAvgAcc * 1000) / 1000,
            needsRegeneration: guideChapters.filter(ch => {
              const acc = ch.coordinate_accuracy || 0;
              const attempts = ch.regeneration_attempts || 0;
              return acc < 0.8 && attempts < 3;
            }).length
          };
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      ...(includeDetails && {
        details: {
          byStatus: detailsByStatus,
          byGuide: detailsByGuide,
          recentlyValidated: chapters
            .filter(ch => ch.last_validated_at)
            .sort((a, b) => new Date(b.last_validated_at!).getTime() - new Date(a.last_validated_at!).getTime())
            .slice(0, 10),
          highestAccuracy: chapters
            .filter(ch => ch.coordinate_accuracy)
            .sort((a, b) => (b.coordinate_accuracy || 0) - (a.coordinate_accuracy || 0))
            .slice(0, 5),
          lowestAccuracy: chapters
            .filter(ch => ch.coordinate_accuracy)
            .sort((a, b) => (a.coordinate_accuracy || 0) - (b.coordinate_accuracy || 0))
            .slice(0, 5)
        }
      }),
      query: {
        guideId,
        locationName,
        includeDetails,
        totalFound: totalChapters
      }
    });

  } catch (error) {
    console.error('좌표 통계 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: `통계 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }, { status: 500 });
  }
}