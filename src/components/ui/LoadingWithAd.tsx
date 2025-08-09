'use client';

import { useEffect, useState } from 'react';
// LoadingAdSense import 제거 - 애드센스 정책 준수

interface LoadingWithAdProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  detailMessage?: string;
}

const LoadingWithAd: React.FC<LoadingWithAdProps> = ({ 
  message = "AI가 맞춤형 가이드를 생성하고 있습니다...", 
  showProgress = false,
  progress = 0,
  detailMessage
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      {/* 로딩 애니메이션 */}
      <div className="text-center mb-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" role="status" aria-label="로딩 중"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-400 rounded-full animate-spin-slow mx-auto" aria-hidden="true"></div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">
          {message}{dots}
        </h2>
        
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mb-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {detailMessage && (
          <p className="text-gray-600 text-sm mb-2">{detailMessage}</p>
        )}
        
        <p className="text-gray-600 max-w-md mx-auto">
          잠시만 기다려주세요. 곧 완성된 가이드를 만나보실 수 있습니다.
        </p>
      </div>

      {/* 애드센스 정책 준수: 콘텐츠가 없는 로딩 화면에서 광고 제거 */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">💡 가이드 생성 팁</div>
            <p className="text-xs text-gray-500 leading-relaxed">
              AI가 최적의 여행 루트와 현지 정보를 분석하여<br />
              개인 맞춤형 가이드를 생성하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingWithAd; 