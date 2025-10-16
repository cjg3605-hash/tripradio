'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { RefreshCw, LogOut, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function SessionRefreshPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSessionStatus = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/refresh-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '세션 확인 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const forceLogout = async () => {
    setLoading(true);
    try {
      // 클라이언트 사이드 완전 정리
      localStorage.clear();
      sessionStorage.clear();
      
      // NextAuth signOut
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      });
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 강제 리다이렉트
      window.location.href = '/auth/signin';
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-2">세션 갱신 도구</h1>
            <p className="text-gray-600">관리자 권한 변경 후 세션을 갱신합니다.</p>
          </div>

          {/* 현재 세션 정보 */}
          {session && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">현재 세션 정보:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><span className="font-medium">이메일:</span> {session.user?.email}</p>
                <p><span className="font-medium">이름:</span> {session.user?.name}</p>
                <p><span className="font-medium">관리자 권한:</span> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    (session.user as any)?.isAdmin 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(session.user as any)?.isAdmin ? '활성화' : '비활성화'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-col space-y-4 mb-8">
            <button
              onClick={checkSessionStatus}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Info className="h-5 w-5 mr-2" />
              )}
              세션 상태 확인
            </button>

            <button
              onClick={forceLogout}
              disabled={loading}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <LogOut className="h-5 w-5 mr-2" />
              )}
              완전 로그아웃 및 재로그인
            </button>
          </div>

          {/* 결과 표시 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
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
                  세션 상태 분석
                </span>
              </div>
              <p className={`mb-3 ${
                result.success ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {result.message}
              </p>
              
              {result.current_session && result.database_user && (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">현재 세션:</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">이메일:</span> {result.current_session.email}</p>
                      <p><span className="font-medium">관리자 권한:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                          result.current_session.isAdmin 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.current_session.isAdmin ? '활성화' : '비활성화'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">데이터베이스:</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">이메일:</span> {result.database_user.email}</p>
                      <p><span className="font-medium">관리자 권한:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                          result.database_user.isAdmin 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.database_user.isAdmin ? '활성화' : '비활성화'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {result.needs_relogin && (
                    <div className="bg-orange-50 p-3 rounded border border-orange-200">
                      <h4 className="font-medium text-orange-900 mb-2">⚠️ 재로그인 필요</h4>
                      <p className="text-sm text-orange-800 mb-2">세션과 데이터베이스의 권한 정보가 다릅니다.</p>
                      {result.instructions && (
                        <ol className="text-sm text-orange-700 space-y-1">
                          {result.instructions.map((instruction: string, index: number) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 안내 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📝 문제 해결 단계</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. &ldquo;세션 상태 확인&rdquo; 버튼으로 현재 상태 확인</li>
              <li>2. 재로그인이 필요하다면 &ldquo;완전 로그아웃 및 재로그인&rdquo; 클릭</li>
              <li>3. 로그인 페이지에서 다시 로그인</li>
              <li>4. 마이페이지에서 관리자 버튼 확인</li>
            </ol>
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