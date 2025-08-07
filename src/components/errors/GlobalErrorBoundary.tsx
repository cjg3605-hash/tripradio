'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

// 에러 복구 버튼 컴포넌트
const ErrorRecoveryButton = ({ error, onReset }: { error: Error; onReset: () => void }) => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="다시 시도"
      >
        <RefreshCw className="w-4 h-4" />
        다시 시도
      </button>
      
      <button
        onClick={handleReload}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        aria-label="페이지 새로고침"
      >
        <RefreshCw className="w-4 h-4" />
        새로고침
      </button>
      
      <button
        onClick={handleHomeClick}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        aria-label="홈으로 이동"
      >
        <Home className="w-4 h-4" />
        홈으로
      </button>
    </div>
  );
};

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.error('🚨 GlobalErrorBoundary caught error:', {
      errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅
    console.error('🚨 Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary'
    });

    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);

    // 에러 리포팅 (프로덕션에서는 외부 서비스로 전송)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket 등 에러 리포팅 서비스 연동
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 에러 리포팅 로직
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId
    };

    // 프로덕션에서는 실제 리포팅 서비스로 전송
    console.log('📤 Error report:', errorReport);
  };

  private reset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                오류가 발생했습니다
              </h1>
              
              <p className="text-gray-600 mb-6">
                죄송합니다. 예상치 못한 오류가 발생했습니다.<br />
                다시 시도하거나 홈으로 돌아가 주세요.
              </p>
              
              {/* 개발 환경에서만 에러 세부사항 표시 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-gray-900 mb-2">개발자 정보:</h3>
                  <p className="text-sm text-gray-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ID: {this.state.errorId}
                  </p>
                </div>
              )}
            </div>
            
            <ErrorRecoveryButton 
              error={this.state.error} 
              onReset={this.reset} 
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;