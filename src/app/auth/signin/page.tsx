'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        setErrors({ general: 'Google 로그인에 실패했습니다. 다시 시도해주세요.' });
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setErrors({ general: 'Google 로그인 처리 중 오류가 발생했습니다.' });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, black 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, black 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          홈으로 돌아가기
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 shadow-lg">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {authMode === 'signup' ? '계정 만들기' : '로그인'}
          </h1>
          <p className="text-gray-500 text-sm">
            AI와 함께하는 특별한 여행을 시작하세요
          </p>
        </div>

        {/* Alert Messages */}
        {(errors.general || errors.success) && (
          <div className={`
            rounded-xl p-4 mb-6 border
            ${errors.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {errors.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <p className="text-sm font-medium">{errors.success || errors.general}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Mode Toggle */}
          <div className="p-8 pb-0">
            <div className="flex bg-gray-50 rounded-2xl p-1.5 mb-8">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`
                  flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                  ${authMode === 'signin' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`
                  flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                  ${authMode === 'signup' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                회원가입
              </button>
            </div>
          </div>

          {/* Forms Container */}
          <div className="px-8 pb-8">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 border border-gray-200 rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-gray-700 font-medium">
                Google로 {authMode === 'signup' ? '시작하기' : '로그인'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">또는</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {authMode === 'signup' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`
                      w-full px-4 py-4 border border-gray-200 rounded-2xl 
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent 
                      transition-all duration-200 bg-gray-50 hover:bg-white
                      ${errors.name ? 'border-red-300 bg-red-50' : ''}
                    `}
                    placeholder="이름을 입력하세요"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-4 border border-gray-200 rounded-2xl 
                    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent 
                    transition-all duration-200 bg-gray-50 hover:bg-white
                    ${errors.email ? 'border-red-300 bg-red-50' : ''}
                  `}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`
                      w-full px-4 py-4 pr-12 border border-gray-200 rounded-2xl 
                      focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent 
                      transition-all duration-200 bg-gray-50 hover:bg-white
                      ${errors.password ? 'border-red-300 bg-red-50' : ''}
                    `}
                    placeholder={authMode === 'signup' ? '최소 6자리 이상' : '비밀번호'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {authMode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`
                        w-full px-4 py-4 pr-12 border border-gray-200 rounded-2xl 
                        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent 
                        transition-all duration-200 bg-gray-50 hover:bg-white
                        ${errors.confirmPassword ? 'border-red-300 bg-red-50' : ''}
                      `}
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    처리 중...
                  </div>
                ) : (
                  <span className="group-hover:tracking-wide transition-all duration-200">
                    {authMode === 'signup' ? '계정 만들기' : '로그인하기'}
                  </span>
                )}
              </button>
            </form>

            {/* Additional Links */}
            {authMode === 'signin' && (
              <div className="mt-6 text-center">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            계속 진행하면 {' '}
            <Link href="/terms" className="underline hover:text-gray-600 transition-colors">
              이용약관
            </Link>
            {' '} 및 {' '}
            <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}