'use client';

import { useState, useEffect } from 'react';
import { AlertTriangleIcon, ExternalLinkIcon } from 'lucide-react';

export function ApiKeySetup() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setMounted(true);
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    if (!mounted) return;
    
    setIsChecking(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      setApiStatus(data);
    } catch (error) {
      console.error('API 상태 확인 실패:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // 클라이언트 마운트 전에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

  // API가 정상이면 아무것도 표시하지 않음
  if (apiStatus?.status === 'ok') {
    return null;
  }

  // 아직 체크 중이면 아무것도 표시하지 않음
  if (isChecking) {
    return null;
  }

  // API 키 설정이 필요한 경우에만 표시
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
      <div className="flex items-start space-x-3">
        <AlertTriangleIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            API 키 설정 필요
          </h3>
          <p className="text-orange-800 mb-4">
            AI Guide Tour를 사용하려면 Gemini API 키가 필요합니다.
          </p>
          
          <div className="space-y-3 text-sm text-orange-700">
            <div className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <div>
                <a 
                  href="https://aistudio.google.com/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-800 underline flex items-center"
                >
                  Google AI Studio에서 API 키 발급
                  <ExternalLinkIcon className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>프로젝트 루트에 <code className="bg-orange-100 px-1 rounded">.env.local</code> 파일 생성</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>파일에 <code className="bg-orange-100 px-1 rounded">GEMINI_API_KEY=발급받은키</code> 추가</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              <span>개발 서버 재시작</span>
            </div>
          </div>

          <button
            onClick={checkApiStatus}
            disabled={isChecking}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isChecking ? '확인 중...' : '다시 확인'}
          </button>

          {apiStatus && apiStatus.debug && (
            <details className="mt-4">
              <summary className="text-xs text-orange-600 cursor-pointer hover:text-orange-800">
                디버그 정보 보기
              </summary>
              <pre className="mt-2 p-2 bg-orange-100 rounded text-xs overflow-auto">
                {JSON.stringify(apiStatus.debug, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
} 