'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, BookOpen, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GuideLoadingProps {
  message?: string;
  subMessage?: string;
  type?: 'loading' | 'generating' | 'fetching';
  showProgress?: boolean;
  className?: string;
}

const loadingMessages = {
  loading: [
    '가이드를 불러오고 있어요...',
    '데이터를 준비하고 있어요...',
    '거의 완료되었어요...'
  ],
  generating: [
    '새로운 가이드를 만들고 있어요...',
    '맞춤형 콘텐츠를 생성하고 있어요...',
    '최종 확인 중이에요...'
  ],
  fetching: [
    '저장된 가이드를 찾고 있어요...',
    '데이터를 가져오고 있어요...',
    '준비가 거의 끝났어요...'
  ]
};

const LoadingIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'generating':
      return <Sparkles className="w-8 h-8 text-gray-800" />;
    case 'fetching':
      return <BookOpen className="w-8 h-8 text-gray-800" />;
    default:
      return <MapPin className="w-8 h-8 text-gray-800" />;
  }
};

export default function GuideLoading({
  message,
  subMessage,
  type = 'loading',
  showProgress = false,
  className = ''
}: GuideLoadingProps) {
  const { t } = useLanguage();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = loadingMessages[type];
  const currentMessage = message || messages[messageIndex];

  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    // 메시지 순환
    messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    // 진행률 시뮬레이션
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);
    }

    return () => {
      clearInterval(messageInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [messages.length, showProgress]);

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-6 max-w-sm">
        {/* 애니메이션 아이콘 */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
            <LoadingIcon type={type} />
            {/* 회전하는 테두리 */}
            <div className="absolute inset-0 border-4 border-transparent border-t-gray-800 rounded-full animate-spin"></div>
            {/* 반대 방향 회전 */}
            <div className="absolute inset-1 border-2 border-transparent border-b-gray-400 rounded-full animate-reverse-spin"></div>
          </div>
        </div>
        
        {/* 메시지 */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {currentMessage}
          </h3>
          {subMessage && (
            <p className="text-gray-600 text-sm">
              {subMessage}
            </p>
          )}
        </div>

        {/* 진행바 (옵션) */}
        {showProgress && (
          <div className="w-full space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-gray-800 to-gray-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 90)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('common.pleaseWait') || 'Please wait...'}
            </p>
          </div>
        )}

        {/* 로딩 점들 */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}