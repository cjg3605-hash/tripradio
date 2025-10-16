'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, UserCheck } from 'lucide-react';

export default function GrantAdminTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const grantAdminRights = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/grant-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '관리자 권한 부여 실패');
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
      const response = await fetch('/api/admin/grant-admin', {
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
            <UserCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-2">관리자 권한 부여</h1>
            <p className="text-gray-600">기존 계정에 관리자 권한을 부여합니다.</p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col space-y-4 mb-8">
            <button
              onClick={grantAdminRights}
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <UserCheck className="h-5 w-5 mr-2" />
              )}
              관리자 권한 부여
            </button>

            <button
              onClick={checkAdminStatus}
              disabled={loading}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              현재 상태 확인
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
              
              {result.before && result.after && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">변경 내용:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">이전:</span> 관리자 권한 {result.before.isAdmin ? '활성화' : '비활성화'}</p>
                    <p><span className="font-medium">이후:</span> 관리자 권한 {result.after.isAdmin ? '활성화' : '비활성화'}</p>
                  </div>
                </div>
              )}

              {result.admin_status && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-900 mb-2">관리자 계정 상태:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">이메일:</span> {result.admin_status.email}</p>
                    <p><span className="font-medium">이름:</span> {result.admin_status.name}</p>
                    <p><span className="font-medium">상태:</span> {result.admin_status.status}</p>
                    <p><span className="font-medium">생성일:</span> {new Date(result.admin_status.created).toLocaleString('ko-KR')}</p>
                    {result.admin_status.updated && (
                      <p><span className="font-medium">수정일:</span> {new Date(result.admin_status.updated).toLocaleString('ko-KR')}</p>
                    )}
                  </div>
                </div>
              )}

              {result.login_info && (
                <div className="bg-blue-50 p-3 rounded border mt-3">
                  <h4 className="font-medium text-blue-900 mb-2">🎉 로그인 정보:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><span className="font-medium">이메일:</span> {result.login_info.email}</p>
                    <p><span className="font-medium">비밀번호:</span> {result.login_info.password}</p>
                    <p className="mt-2 font-medium">이제 로그인하여 관리자 대시보드에 접근할 수 있습니다!</p>
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
              <p><span className="font-medium">로그인 페이지:</span> 
                <a href="/auth/signin" className="text-blue-600 hover:text-blue-800 ml-1">
                  /auth/signin
                </a>
              </p>
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