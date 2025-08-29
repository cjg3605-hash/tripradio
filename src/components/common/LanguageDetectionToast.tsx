'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDetectionSourceMessage, type LanguageDetectionResult } from '@/types/language-detection';

/**
 * 언어 자동 감지 알림 토스트 컴포넌트
 * IP 기반 언어 감지 시 사용자에게 친화적인 알림 제공
 */
export function LanguageDetectionToast() {
  const { detectionInfo, showDetectionNotice, hideDetectionNotice, currentConfig, t } = useLanguage();

  // 5초 후 자동 숨김
  useEffect(() => {
    if (showDetectionNotice) {
      const timer = setTimeout(() => {
        hideDetectionNotice();
      }, 5000);

      return () => clearTimeout(timer);
    }
    // 의존성 배열에서 cleanup이 필요하지 않은 경우를 위한 빈 반환
    return undefined;
  }, [showDetectionNotice, hideDetectionNotice]);

  if (!showDetectionNotice || !detectionInfo) {
    return null;
  }

  const sourceMessage = getDetectionSourceMessage(detectionInfo);
  const isIPDetection = detectionInfo.source === 'ip';

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          {/* 아이콘 */}
          <div className="flex-shrink-0">
            {isIPDetection ? (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">🌍</span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">🌐</span>
              </div>
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{currentConfig.flag}</span>
              <p className="text-sm font-medium text-gray-900">
                {currentConfig.nativeName}로 설정됨
              </p>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {sourceMessage}
            </p>
            
            {/* 신뢰도 표시 (개발용) */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400">
                신뢰도: {Math.round(detectionInfo.confidence * 100)}% 
                {detectionInfo.country && ` (${detectionInfo.country})`}
              </p>
            )}
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={hideDetectionNotice}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="알림 닫기"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={hideDetectionNotice}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            확인
          </button>
          
          <button
            onClick={() => {
              // 언어 설정 페이지로 이동 또는 언어 선택 모달 열기
              if (typeof window !== 'undefined') {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.delete('lang'); // 자동 감지 파라미터 제거
                window.history.replaceState(null, '', currentUrl.toString());
              }
              hideDetectionNotice();
            }}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            언어 변경
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 간단한 언어 감지 배지 컴포넌트 (헤더용)
 */
export function LanguageDetectionBadge() {
  const { detectionInfo, currentConfig } = useLanguage();

  if (!detectionInfo || detectionInfo.source === 'default' || detectionInfo.source === 'cookie') {
    return null;
  }

  const isIPDetection = detectionInfo.source === 'ip';

  return (
    <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
      <span>{isIPDetection ? '🌍' : '🌐'}</span>
      <span className="font-medium">
        {isIPDetection ? '지역 감지' : '브라우저 감지'}
      </span>
      {detectionInfo.country && (
        <span className="text-blue-500">({detectionInfo.country})</span>
      )}
    </div>
  );
}