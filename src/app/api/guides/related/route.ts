// src/app/api/guides/related/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface RelatedGuide {
  location_name: string;
  language: string;
  quality_score: number;
  similarity_score: number;
  relation_type: 'regional' | 'category' | 'popular';
  slug: string;
}

// 지역 기반 관련성 계산
function calculateRegionalSimilarity(currentLocation: string, candidateLocation: string): number {
  const currentTokens = currentLocation.toLowerCase().split(/[\s,/\-()]/);
  const candidateTokens = candidateLocation.toLowerCase().split(/[\s,/\-()]/);
  
  let commonTokens = 0;
  currentTokens.forEach(token => {
    if (candidateTokens.some(candidate => candidate.includes(token) || token.includes(candidate))) {
      commonTokens++;
    }
  });
  
  return commonTokens / Math.max(currentTokens.length, candidateTokens.length);
}

// 카테고리 기반 관련성 판단
function getCategoryMatch(location1: string, location2: string): number {
  const culturalKeywords = ['궁', '절', '박물관', '미술관', '유적지', '사찰', '성당', '교회'];
  const naturalKeywords = ['산', '바다', '해변', '공원', '폭포', '계곡', '섬', '강'];
  const urbanKeywords = ['타워', '빌딩', '거리', '시장', '쇼핑', '역', '공항', '항구'];
  
  const getCategory = (location: string) => {
    const loc = location.toLowerCase();
    if (culturalKeywords.some(keyword => loc.includes(keyword))) return 'cultural';
    if (naturalKeywords.some(keyword => loc.includes(keyword))) return 'natural';
    if (urbanKeywords.some(keyword => loc.includes(keyword))) return 'urban';
    return 'general';
  };
  
  return getCategory(location1) === getCategory(location2) ? 0.5 : 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentLocation = searchParams.get('location');
    const language = searchParams.get('language') || 'ko';
    const limit = parseInt(searchParams.get('limit') || '6');
    
    if (!currentLocation) {
      return NextResponse.json({ error: '위치 정보가 필요합니다' }, { status: 400 });
    }

    // 현재 가이드 정보 조회
    const { data: currentGuide, error: currentError } = await supabase
      .from('guide_versions')
      .select('id, location_name, quality_score')
      .eq('location_name', currentLocation)
      .eq('language', language)
      .eq('status', 'production')
      .single();

    if (currentError) {
      console.error('현재 가이드 조회 실패:', currentError);
      return NextResponse.json({ error: '가이드를 찾을 수 없습니다' }, { status: 404 });
    }

    // 관련 가이드 후보 조회 (현재 가이드 제외)
    const { data: candidates, error: candidatesError } = await supabase
      .from('guide_versions')
      .select('location_name, language, quality_score, updated_at')
      .eq('language', language)
      .eq('status', 'production')
      .neq('location_name', currentLocation)
      .gte('quality_score', 70) // 품질 점수 70점 이상만
      .order('quality_score', { ascending: false })
      .limit(50); // 후보 풀 제한

    if (candidatesError || !candidates) {
      console.error('관련 가이드 후보 조회 실패:', candidatesError);
      return NextResponse.json({ relatedGuides: [] });
    }

    // 관련성 점수 계산 및 정렬
    const relatedGuides: RelatedGuide[] = candidates.map(candidate => {
      const regionalScore = calculateRegionalSimilarity(currentLocation, candidate.location_name);
      const categoryScore = getCategoryMatch(currentLocation, candidate.location_name);
      const qualityBonus = candidate.quality_score > 85 ? 0.1 : 0;
      
      const totalSimilarity = regionalScore * 0.6 + categoryScore * 0.3 + qualityBonus;
      
      let relationType: 'regional' | 'category' | 'popular' = 'popular';
      if (regionalScore > 0.3) relationType = 'regional';
      else if (categoryScore > 0.3) relationType = 'category';
      
      return {
        location_name: candidate.location_name,
        language: candidate.language,
        quality_score: candidate.quality_score,
        similarity_score: totalSimilarity,
        relation_type: relationType,
        slug: encodeURIComponent(candidate.location_name)
      };
    })
    .filter(guide => guide.similarity_score > 0.1) // 최소 관련성 필터
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);

    // 네이버 SEO를 위한 추가 메타데이터
    const response = {
      relatedGuides,
      metadata: {
        currentLocation,
        totalCandidates: candidates.length,
        selectedCount: relatedGuides.length,
        averageQuality: relatedGuides.reduce((sum, guide) => sum + guide.quality_score, 0) / relatedGuides.length,
        relationTypes: {
          regional: relatedGuides.filter(g => g.relation_type === 'regional').length,
          category: relatedGuides.filter(g => g.relation_type === 'category').length,
          popular: relatedGuides.filter(g => g.relation_type === 'popular').length,
        }
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // 1시간 캐시
      }
    });

  } catch (error) {
    console.error('관련 가이드 API 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      relatedGuides: [] 
    }, { status: 500 });
  }
}