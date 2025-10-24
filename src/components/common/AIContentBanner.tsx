'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface AIContentBannerProps {
  variant?: 'info' | 'warning';
  dismissible?: boolean;
  className?: string;
}

export default function AIContentBanner({
  variant = 'info',
  dismissible = true,
  className = ''
}: AIContentBannerProps) {
  const { currentLanguage } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const isKorean = currentLanguage === 'ko';
  const bgColor = variant === 'info'
    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800';

  const textColor = variant === 'info'
    ? 'text-blue-800 dark:text-blue-200'
    : 'text-amber-800 dark:text-amber-200';

  const iconColor = variant === 'info'
    ? 'text-blue-500 dark:text-blue-400'
    : 'text-amber-500 dark:text-amber-400';

  return (
    <div className={`${bgColor} ${textColor} rounded-lg p-4 mb-6 transition-colors duration-300 ${className}`}>
      <div className="flex gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            {isKorean ? '🤖 AI 생성 콘텐츠' : '🤖 AI-Generated Content'}
          </h3>
          <p className="text-sm leading-relaxed">
            {isKorean
              ? '이 페이지의 여행 정보는 Google Gemini AI를 사용하여 생성되었습니다. 정보의 정확성을 위해 실제 여행 전에 공식 관광 정보 및 최신 현지 정보를 확인하시기 바랍니다.'
              : 'The travel information on this page has been generated using Google Gemini AI. Please verify information with official tourism resources and current local information before traveling.'}
          </p>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className={`flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${textColor}`}
            aria-label={isKorean ? '닫기' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 추가 정보 링크 */}
      <div className="mt-3 text-xs space-y-1">
        <p>
          {isKorean ? '자세한 정보: ' : 'Learn more: '}
          <a
            href="/privacy"
            className={`underline hover:no-underline ${
              variant === 'info'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {isKorean ? '개인정보 처리방침' : 'Privacy Policy'}
          </a>
        </p>
      </div>
    </div>
  );
}
