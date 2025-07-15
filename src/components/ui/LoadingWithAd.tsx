'use client';

import AdSenseAd from '@/components/ads/AdSenseAd';
import AutoAdSense from '@/components/ads/AutoAdSense';
import LoadingAdSense from '@/components/ads/LoadingAdSense';

interface LoadingWithAdProps {
  title: string;
  subtitle: string;
  showAd?: boolean;
  adSlot?: string;
  className?: string;
}

export default function LoadingWithAd({
  title,
  subtitle,
  showAd = true,
  adSlot = "1234567890", // 기본 슬롯 ID (실제 사용시 환경변수로 변경)
  className = ""
}: LoadingWithAdProps) {
  return (
    <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full">
        {/* 로딩 섹션 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">{title}</h2>
          <p className="text-slate-600 text-lg">{subtitle}</p>
          
          {/* 진행 상황 표시 */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
              <span>AI가 맞춤형 가이드를 생성하고 있습니다</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <span>관광지 정보를 분석하고 있습니다</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span>최적의 경로를 계산하고 있습니다</span>
            </div>
          </div>
        </div>

        {/* 광고 섹션 */}
        {showAd && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Advertisement</div>
              <div className="text-sm text-gray-600">잠시만 기다려주세요. 곧 완성됩니다!</div>
            </div>
            
            {/* 실제 광고 슬롯 ID 사용 (사용자 제공) */}
            <LoadingAdSense className="max-w-full" />
            
            {/* 다른 광고 옵션들 */}
            {/* 자동 광고: <AutoAdSense className="max-w-full" /> */}
            {/* 
            기본 수동 광고:
            <AdSenseAd
              adSlot={adSlot}
              adFormat="auto"
              adLayout="display"
              className="max-w-full"
            />
            */}
            
            <div className="text-center mt-4">
              <div className="text-xs text-gray-400">
                광고를 통해 무료 서비스를 제공할 수 있습니다 ❤️
              </div>
            </div>
          </div>
        )}

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-blue-800 text-sm">
              <strong>💡 알고 계셨나요?</strong>
              <br />
              AI 가이드는 실시간 정보와 개인 취향을 반영하여 
              <br />
              세상에 하나뿐인 맞춤형 여행 가이드를 만들어드립니다!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 