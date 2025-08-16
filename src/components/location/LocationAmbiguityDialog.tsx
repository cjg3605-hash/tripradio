'use client';

/**
 * 🎯 동명 장소 선택 다이얼로그
 * 
 * 용궁사, 불국사 등 여러 지역에 같은 이름의 장소가 있을 때
 * 사용자가 원하는 장소를 명확히 선택할 수 있도록 돕는 UI입니다.
 */

import React, { useState } from 'react';
import { LocationCandidate } from '@/lib/location/location-ambiguity-resolver';

interface LocationAmbiguityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (candidate: LocationCandidate) => void;
  locationName: string;
  candidates: LocationCandidate[];
  searchQuery?: string;
}

export default function LocationAmbiguityDialog({
  isOpen,
  onClose,
  onSelect,
  locationName,
  candidates,
  searchQuery = ''
}: LocationAmbiguityDialogProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);

  if (!isOpen) return null;

  const handleSelect = async (candidate: LocationCandidate) => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    try {
      await onSelect(candidate);
      onClose();
    } catch (error) {
      console.error('선택 처리 중 오류:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const getPopularityStars = (score: number) => {
    const stars = Math.round(score / 2); // 10점 만점을 5점 만점으로 변환
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const getPopularityLabel = (score: number) => {
    if (score >= 9) return '매우 인기';
    if (score >= 7) return '인기';
    if (score >= 5) return '보통';
    if (score >= 3) return '낮음';
    return '매우 낮음';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden mx-4">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                &quot;{locationName}&quot;이 여러 곳에 있어요
              </h2>
              <p className="text-blue-100">
                어느 곳을 찾고 계신가요? 가장 적합한 장소를 선택해주세요.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={isSelecting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 검색 컨텍스트 표시 */}
        {searchQuery && (
          <div className="bg-gray-50 px-6 py-3 border-b">
            <p className="text-sm text-gray-600">
              <span className="font-medium">검색어:</span> &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* 후보 목록 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`
                  relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${selectedId === candidate.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                  ${index === 0 ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
                `}
                onClick={() => {
                  setSelectedId(candidate.id);
                  handleSelect(candidate);
                }}
              >
                {/* 추천 배지 */}
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    🏆 추천
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 장소명과 지역 */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {candidate.displayName}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                        {candidate.region}, {candidate.country}
                      </span>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {candidate.description}
                    </p>

                    {/* 인기도와 키워드 */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">인기도:</span>
                        <span className="text-lg">{getPopularityStars(candidate.popularityScore)}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {getPopularityLabel(candidate.popularityScore)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {candidate.keywords.slice(0, 3).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 좌표 정보 (있는 경우) */}
                    {candidate.coordinates && (
                      <div className="mt-2 text-xs text-gray-500">
                        📍 {candidate.coordinates.lat.toFixed(4)}, {candidate.coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </div>

                  {/* 선택 버튼 */}
                  <div className="ml-4 flex flex-col items-center">
                    <button
                      className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all
                        ${selectedId === candidate.id
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400 hover:border-blue-400'
                        }
                        ${isSelecting ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={isSelecting}
                    >
                      {isSelecting && selectedId === candidate.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-xs text-gray-500 mt-1">선택</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">💡 팁:</span> 
              가장 유명하고 접근하기 쉬운 장소가 위쪽에 표시됩니다.
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              disabled={isSelecting}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🎨 간단한 선택 카드 컴포넌트 (작은 화면용)
 */
interface LocationChoiceCardProps {
  candidate: LocationCandidate;
  isSelected: boolean;
  onClick: () => void;
  isRecommended?: boolean;
}

export function LocationChoiceCard({
  candidate,
  isSelected,
  onClick,
  isRecommended = false
}: LocationChoiceCardProps) {
  return (
    <div
      className={`
        relative border rounded-lg p-3 cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300'
        }
        ${isRecommended ? 'ring-1 ring-yellow-400' : ''}
      `}
      onClick={onClick}
    >
      {isRecommended && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded text-center">
          추천
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">
            {candidate.displayName}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {candidate.region}, {candidate.country}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-yellow-600">
            {'⭐'.repeat(Math.round(candidate.popularityScore / 2))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {candidate.popularityScore.toFixed(1)}/10
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🔧 모바일 친화적 선택 시트 (향후 구현용)
 */
export function LocationChoiceSheet({
  isOpen,
  onClose,
  onSelect,
  locationName,
  candidates
}: LocationAmbiguityDialogProps) {
  // 모바일용 바텀 시트 구현
  // 향후 필요 시 구현
  return null;
}