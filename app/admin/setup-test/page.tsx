'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Settings } from 'lucide-react';

export default function AdminSetupTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAdminSetup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || '관리자 계정 설정 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'GET'
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('상태 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-black mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-2">관리자 계정 설정 테스트</h1>
            <p className="text-gray-600">관리자 계정을 생성하고 상태를 확인할 수 있습니다.</p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col space-y-4 mb-8">
            <button
              onClick={testAdminSetup}
              disabled={loading}
              className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Settings className="h-5 w-5 mr-2" />
              )}
              관리자 계정 생성/업데이트
            </button>

            <button
              onClick={checkAdminStatus}
              disabled={loading}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              상태 확인
            </button>
          </div>

          {/* 결과 표시 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 font-medium">오류</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className={`mb-6 p-4 border rounded-lg ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-2">
                <CheckCircle className={`h-5 w-5 mr-2 ${
                  result.success ? 'text-green-500' : 'text-yellow-500'
                }`} />
                <span className={`font-medium ${
                  result.success ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {result.success ? '성공' : '정보'}
                </span>
              </div>
              <p className={`mb-3 ${
                result.success ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {result.message}
              </p>
              
              {result.admin && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">관리자 정보:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">ID:</span> {result.admin.id}</p>
                    <p><span className="font-medium">이메일:</span> {result.admin.email}</p>
                    <p><span className="font-medium">이름:</span> {result.admin.name}</p>
                    <p><span className="font-medium">관리자 권한:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        result.admin.isAdmin 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.admin.isAdmin ? '활성화' : '비활성화'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {result.exists !== undefined && (
                <div className="bg-white p-3 rounded border mt-3">
                  <h4 className="font-medium text-gray-900 mb-2">상태 정보:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">계정 존재:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        result.exists 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.exists ? '예' : '아니오'}
                      </span>
                    </p>
                    <p><span className="font-medium">관리자 권한:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        result.isAdmin 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.isAdmin ? '활성화' : '비활성화'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 로그인 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📝 관리자 로그인 정보</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">이메일:</span> naviadmin@tripradio.shop</p>
              <p><span className="font-medium">비밀번호:</span> naviadmin1134</p>
              <p><span className="font-medium">대시보드:</span> 
                <a href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 ml-1">
                  /admin/dashboard
                </a>
              </p>
            </div>
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-gray-600 hover:text-black transition-colors"
            >
              ← 홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}