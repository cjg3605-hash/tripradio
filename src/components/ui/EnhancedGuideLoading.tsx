'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, MapPin, BookOpen, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EnhancedGuideLoadingProps {
  message?: string;
  type?: 'loading' | 'generating' | 'fetching' | 'processing';
  className?: string;
  showDetailedProgress?: boolean;
  estimatedTime?: number; // 예상 소요 시간(초)
}

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  duration: number; // 예상 소요 시간(초)
  status: 'pending' | 'active' | 'completed';
}

// 로딩 단계는 함수 내부에서 번역과 함께 생성하도록 변경

export default function EnhancedGuideLoading({
  message,
  type = 'generating',
  className = '',
  showDetailedProgress = true,
  estimatedTime = 30
}: EnhancedGuideLoadingProps) {
  const { t } = useLanguage();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<LoadingStep[]>([]);
  const [encouragingMessageIndex, setEncouragingMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // 번역 값 타입 안전 변환 헬퍼
  const getTranslatedString = (key: string): string => {
    const value = t(key);
    return Array.isArray(value) ? value[0] || '' : String(value);
  };

  // 번역된 로딩 단계 생성 (useMemo로 최적화)
  const loadingSteps: LoadingStep[] = useMemo(() => [
    {
      id: 'analyzing',
      title: getTranslatedString('loading.messages.analyzing'),
      description: getTranslatedString('loading.descriptions.analyzing'),
      duration: 3,
      status: 'pending'
    },
    {
      id: 'researching', 
      title: getTranslatedString('loading.messages.researching'),
      description: getTranslatedString('loading.descriptions.researching'),
      duration: 8,
      status: 'pending'
    },
    {
      id: 'generating',
      title: getTranslatedString('loading.messages.generating'),
      description: getTranslatedString('loading.descriptions.generating'),
      duration: 15,
      status: 'pending'
    },
    {
      id: 'optimizing',
      title: getTranslatedString('loading.messages.optimizing'),
      description: getTranslatedString('loading.descriptions.optimizing'),
      duration: 5,
      status: 'pending'
    },
    {
      id: 'finalizing',
      title: getTranslatedString('loading.messages.finalizing'),
      description: getTranslatedString('loading.descriptions.finalizing'),
      duration: 2,
      status: 'pending'
    }
  ], [t]);

  // 번역된 격려 메시지
  const encouragingMessages = t('loading.encouragement') as string[];

  // 초기 단계 설정
  useEffect(() => {
    if (steps.length === 0) {
      setSteps(loadingSteps);
    }
  }, [t, loadingSteps, steps.length]);

  // 시간 경과 및 단계 진행 관리
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // 진행률 계산 (최대 95%까지)
      setProgress(prev => {
        const newProgress = Math.min((prev + (100 / estimatedTime)), 95);
        return newProgress;
      });
      
      // 단계별 진행 상태 업데이트
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        let cumulativeTime = 0;
        
        for (let i = 0; i < newSteps.length; i++) {
          cumulativeTime += newSteps[i].duration;
          
          if (elapsedTime < cumulativeTime - newSteps[i].duration) {
            newSteps[i].status = 'pending';
          } else if (elapsedTime >= cumulativeTime) {
            newSteps[i].status = 'completed';
          } else {
            newSteps[i].status = 'active';
            setCurrentStepIndex(i);
          }
        }
        
        return newSteps;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [elapsedTime, estimatedTime]);

  // 격려 메시지 순환
  useEffect(() => {
    if (elapsedTime > 10) { // 10초 후부터 격려 메시지 시작
      const messageTimer = setInterval(() => {
        setEncouragingMessageIndex(prev => (prev + 1) % encouragingMessages.length);
      }, 5000);

      return () => clearInterval(messageTimer);
    }
    // 조건에 맞지 않으면 아무것도 반환하지 않음
    return undefined;
  }, [elapsedTime, encouragingMessages.length]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}초`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 min-h-screen bg-gray-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
        {/* 메인 로딩 아이콘 */}
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 border-4 border-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-10 h-10 text-gray-800" />
              {/* 회전하는 테두리 */}
              <div className="absolute inset-0 border-4 border-transparent border-t-gray-800 rounded-full animate-spin"></div>
            </div>
            {/* 진행률 표시 */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
          
          {/* 현재 작업 메시지 */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {message || steps[currentStepIndex]?.title || t('loading.messages.generating')}
            </h3>
            <p className="text-gray-600 text-sm">
              {steps[currentStepIndex]?.description || t('loading.descriptions.preparing')}
            </p>
          </div>

          {/* 진행 시간 */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{t('loading.statusText.elapsedTime')}: {formatTime(elapsedTime)}</span>
            <span>•</span>
            <span>{t('loading.statusText.estimatedTime')}: {formatTime(estimatedTime)}</span>
          </div>

          {/* 전체 진행바 */}
          <div className="w-full space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-gray-800 to-gray-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 상세 진행 단계 (옵션) */}
          {showDetailedProgress && (
            <div className="space-y-3 text-left">
              <h4 className="text-sm font-medium text-gray-700 text-center">{t('loading.statusText.progressTitle')}</h4>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      step.status === 'active' ? 'bg-gray-100 border border-gray-300' :
                      step.status === 'completed' ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
                  >
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        step.status === 'active' ? 'text-gray-900' :
                        step.status === 'completed' ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 격려 메시지 (10초 후부터) */}
          {elapsedTime > 10 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm font-medium">
                {encouragingMessages[encouragingMessageIndex]}
              </p>
            </div>
          )}

          {/* 시간이 오래 걸릴 때 추가 안내 */}
          {elapsedTime > 20 && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <p className="text-gray-800 text-sm">
                <strong>{t('loading.notifications.noticeTitle')}:</strong> {t('loading.notifications.firstVisitNotice')}
              </p>
            </div>
          )}
          
          {/* 로딩 애니메이션 점들 */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${index * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}