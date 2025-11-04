'use client';

import React, { useState, useEffect } from 'react';
import { usePodcastVersion } from '@/contexts/PodcastVersionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import ChapterBasedPodcastGenerator from './ChapterBasedPodcastGenerator';

interface PodcastGeneratorWithVersionProps {
  locationName: string;
  className?: string;
  language?: string;
  onGenerationComplete?: (episodeData: any) => void;
}

export default function PodcastGeneratorWithVersion({
  locationName,
  className = '',
  language,
  onGenerationComplete
}: PodcastGeneratorWithVersionProps) {
  const { version, stats } = usePodcastVersion();
  const { currentLanguage } = useLanguage();
  const [generatingV2, setGeneratingV2] = useState(false);
  const [generatingV1, setGeneratingV1] = useState(false);

  return (
    <div className={className}>
      {/* 버전 정보 표시 */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">⚡ 생성 완료</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">버전: </span>
                  <span className="font-medium">{stats.version?.toUpperCase()}</span>
                </div>
                {stats.generationTime !== undefined && stats.generationTime > 0 && (
                  <div>
                    <span className="text-gray-600">소요 시간: </span>
                    <span className="font-medium">{(stats.generationTime / 1000).toFixed(1)}초</span>
                  </div>
                )}
                {stats.apiCalls !== undefined && (
                  <div>
                    <span className="text-gray-600">API 호출: </span>
                    <span className="font-medium">{stats.apiCalls}회</span>
                  </div>
                )}
                {stats.segments !== undefined && (
                  <div>
                    <span className="text-gray-600">세그먼트: </span>
                    <span className="font-medium">{stats.segments}개</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 버전별 생성 컴포넌트 */}
      <ChapterBasedPodcastGenerator
        locationName={locationName}
        language={language || currentLanguage}
        className={className}
        onGenerationComplete={onGenerationComplete}
      />

      {/* 비교 설명 */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">📊 V1 vs V2 비교</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900 mb-2">V1 (순차 호출)</p>
            <ul className="space-y-1 text-gray-700">
              <li>✓ 안정적인 생성</li>
              <li>✗ ~94초 소요</li>
              <li>✗ 7번 API 호출</li>
              <li>✓ 기존 검증됨</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-green-900 mb-2">V2 (통합 호출) 🚀</p>
            <ul className="space-y-1 text-gray-700">
              <li>✓ 빠른 생성</li>
              <li>✓ ~25초 소요</li>
              <li>✓ 1번 API 호출</li>
              <li>✓ 73% 성능 개선</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
