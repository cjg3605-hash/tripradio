'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RelatedGuide {
  location_name: string;
  language: string;
  quality_score: number;
  similarity_score: number;
  relation_type: 'regional' | 'category' | 'popular';
  slug: string;
}

interface RelatedGuidesResponse {
  relatedGuides: RelatedGuide[];
  metadata: {
    currentLocation: string;
    totalCandidates: number;
    selectedCount: number;
    averageQuality: number;
    relationTypes: {
      regional: number;
      category: number;
      popular: number;
    };
  };
}

interface RelatedGuidesProps {
  currentLocation: string;
  className?: string;
}

export default function RelatedGuides({ currentLocation, className = '' }: RelatedGuidesProps) {
  const [relatedGuides, setRelatedGuides] = useState<RelatedGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage, t } = useLanguage();

  useEffect(() => {
    fetchRelatedGuides();
  }, [currentLocation, currentLanguage]);

  const fetchRelatedGuides = async () => {
    if (!currentLocation) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/guides/related?location=${encodeURIComponent(currentLocation)}&language=${currentLanguage}&limit=6`
      );
      
      if (!response.ok) {
        throw new Error('관련 가이드를 불러올 수 없습니다');
      }

      const data: RelatedGuidesResponse = await response.json();
      setRelatedGuides(data.relatedGuides);
      
    } catch (err) {
      console.error('관련 가이드 로드 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const getRelationTypeLabel = (type: string) => {
    switch (type) {
      case 'regional': return '주변 지역';
      case 'category': return '비슷한 유형';
      case 'popular': return '인기 여행지';
      default: return '추천';
    }
  };

  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case 'regional': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-green-100 text-green-800';
      case 'popular': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || relatedGuides.length === 0) {
    return null; // 에러나 데이터가 없으면 컴포넌트 숨김
  }

  // TODO(human): 여기에 관련 가이드 카드들을 렌더링하는 JSX를 작성해주세요
  // - relatedGuides 배열을 map으로 순회
  // - 각 가이드마다 Link 컴포넌트로 내부링크 생성
  // - 가이드명, 품질 점수, 관련성 타입을 표시
  // - 반응형 그리드 레이아웃 적용
  // - 접근성을 위한 적절한 aria-label 추가

  return (
    <section className={`${className}`} aria-label="관련 여행지 추천">
      {/* 섹션 제목 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          관련 여행지 둘러보기
        </h2>
        <div className="text-sm text-gray-500">
          {relatedGuides.length}개 추천
        </div>
      </div>

      {/* 관련 가이드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedGuides.map((guide, index) => (
          <Link
            key={`${guide.location_name}-${index}`}
            href={`/guide/${guide.slug}?lang=${currentLanguage}`}
            className="group block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4"
            aria-label={`${guide.location_name} 가이드로 이동`}
          >
            {/* 카드 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {guide.location_name}
              </h3>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5" />
            </div>

            {/* 메타 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationTypeColor(guide.relation_type)}`}>
                  {getRelationTypeLabel(guide.relation_type)}
                </span>
              </div>
              
              {guide.quality_score > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span>{guide.quality_score.toFixed(0)}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}