'use client';

import { useState, useEffect } from 'react';
// Progress 컴포넌트는 직접 구현하므로 제거
import { Sparkles, ArrowLeft } from 'lucide-react';

interface GuideGeneratingProps {
  locationName: string;
  onCancel?: () => void;
  onComplete?: () => void;
  userPreferences?: {
    interests: string[];
    ageGroup?: string;
    language?: string;
  };
}

const generationStages = [
  { text: '위치 정보를 분석하고 있어요...', progress: 20 },
  { text: '역사적 정보를 수집하고 있어요...', progress: 40 },
  { text: '맞춤형 콘텐츠를 만들고 있어요...', progress: 60 },
  { text: '오디오 챕터를 생성하고 있어요...', progress: 80 },
  { text: '가이드를 완성하고 있어요...', progress: 100 }
];

export default function GuideGenerating({
  locationName,
  onCancel,
  onComplete,
  userPreferences
}: GuideGeneratingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < generationStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stageInterval);
          // 생성 완료 후 약간의 딜레이
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return prev;
        }
      });
    }, 1500); // 각 단계마다 1.5초

    return () => clearInterval(stageInterval);
  }, [onComplete]);

  useEffect(() => {
    if (currentStage < generationStages.length) {
      setProgress(generationStages[currentStage].progress);
    }
  }, [currentStage]);

  const currentStageData = generationStages[currentStage] || generationStages[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-medium text-lg">AI 가이드 생성 중</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-sm mx-auto text-center space-y-8">
          {/* 애니메이션 아이콘 */}
          <div className="relative mx-auto w-32 h-32">
            <div className="w-32 h-32 border-4 border-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-16 h-16 text-gray-800 animate-pulse z-10" />
              {/* 회전하는 테두리 */}
              <div className="absolute inset-0 border-4 border-transparent border-t-gray-800 rounded-full animate-spin"></div>
              {/* 반대 방향 회전 */}
              <div className="absolute inset-2 border-2 border-transparent border-b-gray-400 rounded-full animate-reverse-spin"></div>
            </div>
          </div>
          
          {/* 메시지 */}
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-gray-900">
              &quot;{locationName}&quot;의 개인 가이드를 만들고 있어요
            </h2>
            <p className="text-gray-600 text-lg">
              {currentStageData.text}
            </p>
          </div>

          {/* 진행바 */}
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {progress}% 완료
            </p>
          </div>

          {/* 사용자 맞춤 정보 */}
          {userPreferences && userPreferences.interests?.length > 0 && (
            <div className="space-y-3 text-left border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-800">
                당신의 취향에 맞춰 맞춤화 중:
              </p>
              <div className="flex flex-wrap gap-2">
                {userPreferences.interests.slice(0, 3).map((interest) => (
                  <span 
                    key={interest} 
                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-full text-gray-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 단계 표시 */}
          <div className="flex justify-center space-x-2">
            {generationStages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStage ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}