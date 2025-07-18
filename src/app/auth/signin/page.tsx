'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Mail,
  Timer,
  Shield
} from 'lucide-react';

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signupStep, setSignupStep] = useState<'form' | 'email_verification' | 'completed'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    verificationCode: ''
  });
  
  // 상태 관리
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined; // 또는 빈 함수 반환
  }, [countdown]);

  // 이메일 인증 코드 전송
  const handleSendVerificationCode = async (): Promise<void> => {
    if (!formData.email) {
      setErrors({ email: '이메일을 입력해주세요.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }
 
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          action: 'send_code'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.error || '이메일 전송에 실패했습니다.' });
      } else {
        setEmailSent(true);
        setCountdown(600); // 10분 카운트다운
        setSignupStep('email_verification');
        setErrors({ success: '인증 코드가 이메일로 전송되었습니다.' });
      }
    } catch (error) {
      setErrors({ email: '네트워크 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = async (): Promise<void> => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setErrors({ verificationCode: '6자리 인증 코드를 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          verificationCode: formData.verificationCode,
          action: 'verify_code'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ verificationCode: data.error || '인증에 실패했습니다.' });
      } else {
        setEmailVerified(true);
        setErrors({ success: '이메일 인증이 완료되었습니다!' });
        
        // 2초 후 회원가입 진행
        setTimeout(() => {
          handleCompleteSignup();
        }, 2000);
      }
    } catch (error) {
      setErrors({ verificationCode: '네트워크 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 완료
  const handleCompleteSignup = async (): Promise<void> => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          verificationCode: formData.verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || '회원가입에 실패했습니다.' });
        setSignupStep('form'); // 폼으로 돌아가기
      } else {
        setSignupStep('completed');
        setErrors({ success: '🎉 회원가입이 완료되었습니다!' });
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          setAuthMode('signin');
          setSignupStep('form');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '', verificationCode: '' }));
        }, 3000);
      }
    } catch (error) {
      setErrors({ general: '네트워크 오류가 발생했습니다.' });
      setSignupStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  // Google 로그인
  const handleGoogleSignIn = async (): Promise<void> => {
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

  // 이메일 로그인
  const handleEmailLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
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
    } catch (error) {
      setErrors({ general: '로그인 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 폼 제출
  const handleSignupForm = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrors({});

    // 유효성 검사
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

    // 이메일 인증 단계로 이동
    handleSendVerificationCode();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 카운트다운 표시 함수
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {authMode === 'signup' 
              ? signupStep === 'completed' 
                ? '가입 완료!' 
                : signupStep === 'email_verification'
                  ? '이메일 인증'
                  : '계정 만들기' 
              : '로그인'
            }
          </h1>
          <p className="text-gray-500 text-sm">
            {authMode === 'signup' && signupStep === 'email_verification'
              ? '이메일로 전송된 인증 코드를 입력하세요'
              : 'AI와 함께하는 특별한 여행을 시작하세요'
            }
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
          {/* 회원가입 완료 상태 */}
          {authMode === 'signup' && signupStep === 'completed' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">회원가입 완료!</h3>
              <p className="text-gray-600 mb-4">곧 로그인 페이지로 이동합니다...</p>
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {/* 이메일 인증 단계 */}
          {authMode === 'signup' && signupStep === 'email_verification' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">이메일 인증</h3>
                <p className="text-gray-600 text-sm mb-4">
                  <strong>{formData.email}</strong>로<br />
                  인증 코드를 전송했습니다.
                </p>
                {countdown > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-2">
                    <Timer className="w-4 h-4" />
                    <span>{formatCountdown(countdown)} 후 만료</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    인증 코드 (6자리)
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    maxLength={6}
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    className={`
                      w-full px-4 py-4 border border-gray-200 rounded-2xl text-center text-2xl font-mono
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 bg-gray-50 hover:bg-white tracking-widest
                      ${errors.verificationCode ? 'border-red-300 bg-red-50' : ''}
                    `}
                    placeholder="000000"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                  {errors.verificationCode && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.verificationCode}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading || formData.verificationCode.length !== 6}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      인증 중...
                    </div>
                  ) : (
                    '인증 확인'
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setSignupStep('form');
                      setEmailSent(false);
                      setCountdown(0);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    이메일 주소 변경하기
                  </button>
                </div>

                {countdown === 0 && (
                  <div className="text-center">
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      인증 코드 재전송
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 일반 로그인/회원가입 폼 */}
          {(authMode === 'signin' || (authMode === 'signup' && signupStep === 'form')) && signupStep !== 'completed' && (
            <>
              {/* Mode Toggle */}
              <div className="p-8 pb-0">
                <div className="flex bg-gray-50 rounded-2xl p-1.5 mb-8">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setSignupStep('form');
                      setErrors({});
                    }}
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
                    onClick={() => {
                      setAuthMode('signup');
                      setSignupStep('form');
                      setErrors({});
                    }}
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
                <form onSubmit={authMode === 'signin' ? handleEmailLogin : handleSignupForm} className="space-y-5">
                  {/* 이름 (회원가입시만) */}
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
                        disabled={isLoading}
                        autoComplete="name"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 이메일 */}
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
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* 비밀번호 */}
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
                        placeholder="비밀번호를 입력하세요"
                        disabled={isLoading}
                        autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
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

                  {/* 비밀번호 확인 (회원가입시만) */}
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
                          disabled={isLoading}
                          autoComplete="new-password"
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

                  {/* 회원가입 보안 안내 */}
                  {authMode === 'signup' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">보안 안내</h4>
                          <p className="text-xs text-blue-700">
                            회원가입을 위해 이메일 인증이 필요합니다. 
                            입력하신 이메일로 인증 코드가 전송됩니다.
                          </p>
                        </div>
                      </div>
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
                        {authMode === 'signup' ? '이메일 인증하기' : '로그인하기'}
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
            </>
          )}
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