'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: false
      });
      
      if (result?.error) {
        setErrors({ general: '구글 로그인에 실패했습니다. 다시 시도해주세요.' });
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setErrors({ general: '구글 로그인 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        // 입력 검증
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: '비밀번호가 일치하지 않습니다.' });
          return;
        }
        if (formData.password.length < 6) {
          setErrors({ password: '비밀번호는 최소 6자리 이상이어야 합니다.' });
          return;
        }
        if (!formData.name.trim()) {
          setErrors({ name: '이름을 입력해주세요.' });
          return;
        }

        // 회원가입 API 호출
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({ general: data.error || '회원가입에 실패했습니다.' });
        } else {
          setErrors({ success: '회원가입이 완료되었습니다! 로그인해주세요.' });
          setAuthMode('signin');
          setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
        }
      } else {
        // NextAuth.js 로그인
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        if (result?.error) {
          setErrors({ general: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' });
        } else if (result?.ok) {
          router.push(callbackUrl);
        }
      }
    } catch (error) {
      setErrors({ general: '인증 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-0 mb-6">
              <img 
                src="/navi.png" 
                alt="Guide AI" 
                width="56" 
                height="56" 
                className="object-contain -mr-1"
                style={{ filter: 'hue-rotate(-20deg) saturate(1.1) brightness(0.9)' }}
              />
              <h1 className="text-3xl font-bold">
                <span className="text-indigo-600">N</span>
                <span 
                  className="text-indigo-600 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-extrabold"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3))'
                  }}
                >
                  A
                </span>
                <span className="text-indigo-600">V</span>
                <span 
                  className="text-indigo-600 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-extrabold"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3))'
                  }}
                >
                  I
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-indigo-600">GUIDE</span>
              </h1>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {authMode === 'signup' ? '회원가입' : '로그인'}
          </h2>
          <p className="text-gray-600">
            AI와 함께하는 특별한 여행을 시작하세요
          </p>
        </div>

        {/* 오류/성공 메시지 */}
        {(errors.general || errors.success) && (
          <div className={`rounded-lg p-4 ${errors.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${errors.success ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  {errors.success ? (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <div className="ml-3">
                <div className={`text-sm ${errors.success ? 'text-green-700' : 'text-red-700'}`}>
                  <p>{errors.success || errors.general}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 인증 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* 인증 방식 선택 탭 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signin' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signup' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-gray-700 font-medium">Google로 {authMode === 'signup' ? '회원가입' : '로그인'}</span>
          </button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는 이메일로</span>
            </div>
          </div>

          {/* 이메일 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="이름을 입력하세요"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={authMode === 'signup' ? '최소 6자리 이상' : '비밀번호'}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  처리 중...
                </div>
              ) : (
                authMode === 'signup' ? '회원가입하기' : '로그인하기'
              )}
            </button>
          </form>

          {/* 추가 링크 */}
          <div className="mt-6 text-center space-y-2">
            {authMode === 'signin' && (
              <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                비밀번호를 잊으셨나요?
              </Link>
            )}
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}