'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Mail,
  Timer,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw
} from 'lucide-react';

function SignInContent() {
  const { t, currentLanguage } = useLanguage();
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
  const [codeInputs, setCodeInputs] = useState(['', '', '', '', '', '']);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  // 인증코드 입력 핸들러
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);
    
    // 자동 포커스 이동
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
    
    // 전체 코드 업데이트
    const fullCode = newInputs.join('');
    setFormData(prev => ({ ...prev, verificationCode: fullCode }));
    
    // 6자리 완성 시 자동 검증
    if (fullCode.length === 6) {
      setTimeout(() => handleVerifyCode(), 500);
    }
  };

  // 키보드 백스페이스 핸들러
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

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
        setCountdown(600);
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
        // 실패 시 입력 필드 초기화
        setCodeInputs(['', '', '', '', '', '']);
        setFormData(prev => ({ ...prev, verificationCode: '' }));
        document.getElementById('code-0')?.focus();
      } else {
        setEmailVerified(true);
        setErrors({ success: '이메일 인증이 완료되었습니다!' });
        
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
        setSignupStep('form');
      } else {
        setSignupStep('completed');
        setErrors({ success: '🎉 회원가입이 완료되었습니다!' });
        
        setTimeout(() => {
          setAuthMode('signin');
          setSignupStep('form');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '', verificationCode: '' }));
        }, 4000);
      }
    } catch (error) {
      setErrors({ general: '네트워크 오류가 발생했습니다.' });
      setSignupStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 코드 재전송
  const handleResendCode = async (): Promise<void> => {
    setCodeInputs(['', '', '', '', '', '']);
    setFormData(prev => ({ ...prev, verificationCode: '' }));
    await handleSendVerificationCode();
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
      }
    } catch (error) {
      setErrors({ general: '로그인 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 일반 로그인
  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: result.error });
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      setErrors({ general: '로그인 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 폼 제출
  const handleSignupForm = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrors({});

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

    handleSendVerificationCode();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-all duration-300 mb-8 group hover:translate-x-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {t('buttons.goBack')}
        </Link>

        {/* Progress Indicator */}
        {authMode === 'signup' && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
                ['form', 'email_verification', 'completed'].includes(signupStep) 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {signupStep !== 'form' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`w-12 h-0.5 transition-all duration-500 ${
                ['email_verification', 'completed'].includes(signupStep) 
                  ? 'bg-black' 
                  : 'bg-gray-200'
              }`}></div>
              
              {/* Step 2 */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
                ['email_verification', 'completed'].includes(signupStep) 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {signupStep === 'completed' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`w-12 h-0.5 transition-all duration-500 ${
                signupStep === 'completed' 
                  ? 'bg-black' 
                  : 'bg-gray-200'
              }`}></div>
              
              {/* Step 3 */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
                signupStep === 'completed' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {signupStep === 'completed' ? <Check className="w-4 h-4" /> : '3'}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            {signupStep === 'email_verification' ? (
              <Mail className="w-8 h-8 text-white" />
            ) : signupStep === 'completed' ? (
              <Sparkles className="w-8 h-8 text-white" />
            ) : (
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {authMode === 'signup' 
              ? signupStep === 'completed' 
                ? (currentLanguage === 'ko' ? '환영합니다!' :
                   currentLanguage === 'en' ? 'Welcome!' :
                   currentLanguage === 'ja' ? 'ようこそ！' :
                   currentLanguage === 'zh' ? '欢迎！' :
                   '¡Bienvenido!')
                : signupStep === 'email_verification'
                  ? t('auth.emailVerification')
                  : t('auth.signup')
              : (currentLanguage === 'ko' ? 'AI 가이드에 오신 것을 환영합니다' :
                 currentLanguage === 'en' ? 'Welcome to AI Guide' :
                 currentLanguage === 'ja' ? 'AIガイドへようこそ' :
                 currentLanguage === 'zh' ? '欢迎使用AI指南' :
                 'Bienvenido a la Guía AI')
            }
          </h1>
          
          <p className="text-gray-500 text-sm leading-relaxed">
            {authMode === 'signup' && signupStep === 'email_verification'
              ? `${formData.email}으로 전송된\n인증 코드를 입력하세요`
              : signupStep === 'completed'
                ? '회원가입이 성공적으로 완료되었습니다\n이제 AI와 함께 여행을 시작해보세요'
                : 'AI와 함께하는 특별한 여행을 시작하세요'
            }
          </p>
        </div>

        {/* Alert Messages */}
        {(errors.general || errors.success) && (
          <div className={`
            rounded-2xl p-4 mb-6 border backdrop-blur-sm transform transition-all duration-500 scale-100
            ${errors.success 
              ? 'bg-green-50/80 border-green-200 text-green-800 shadow-green-100 shadow-lg' 
              : 'bg-red-50/80 border-red-200 text-red-800 shadow-red-100 shadow-lg'
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
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          {/* 회원가입 완료 상태 */}
          {authMode === 'signup' && signupStep === 'completed' && (
            <div className="p-12 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                  <CheckCircle className="w-12 h-12 text-green-600 relative z-10 animate-bounce" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">회원가입 완료!</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                <strong>{formData.name}</strong>님, 환영합니다!<br />
                이제 AI 가이드와 함께 특별한 여행을 시작하세요.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Timer className="w-4 h-4" />
                  <span>잠시 후 로그인 페이지로 이동합니다...</span>
                </div>
                
                <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-black rounded-full animate-pulse" style={{
                    animation: 'loading 4s ease-in-out forwards'
                  }}></div>
                </div>
              </div>
              
              <style jsx>{`
                @keyframes loading {
                  from { width: 0%; }
                  to { width: 100%; }
                }
              `}</style>
            </div>
          )}

          {/* 이메일 인증 단계 */}
          {authMode === 'signup' && signupStep === 'email_verification' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className={`absolute inset-0 bg-blue-100 rounded-full ${emailSent ? 'animate-ping' : ''} opacity-20`}></div>
                  <Mail className="w-10 h-10 text-blue-600 relative z-10" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">이메일 인증</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <strong>{formData.email}</strong>로<br />
                  인증 코드를 전송했습니다.
                </p>
              </div>

              {/* 6자리 인증 코드 입력 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  인증 코드 6자리를 입력하세요
                </label>
                
                <div className="flex justify-center space-x-3 mb-4">
                  {codeInputs.map((value, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`
                        w-12 h-14 text-center text-xl font-bold border-2 rounded-xl 
                        transition-all duration-300 focus:outline-none focus:scale-105
                        ${value 
                          ? 'border-black bg-gray-50 text-black' 
                          : 'border-gray-200 bg-white text-gray-400 focus:border-blue-400'
                        }
                        ${errors.verificationCode ? 'border-red-300 bg-red-50' : ''}
                      `}
                      placeholder="•"
                    />
                  ))}
                </div>
                
                {errors.verificationCode && (
                  <p className="text-red-600 text-sm text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.verificationCode}
                  </p>
                )}
              </div>

              {/* 타이머 및 재전송 */}
              <div className="text-center space-y-4">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Timer className="w-4 h-4" />
                    <span>남은 시간: {formatCountdown(countdown)}</span>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">인증 코드가 만료되었습니다.</p>
                )}
                
                <button
                  onClick={handleResendCode}
                  disabled={isLoading || countdown > 540}
                  className={`
                    inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl 
                    transition-all duration-300 transform hover:scale-105
                    ${countdown > 540 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }
                  `}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>인증 코드 재전송</span>
                </button>
              </div>

              {/* 이전 단계로 돌아가기 */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setSignupStep('form')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>회원가입 폼으로 돌아가기</span>
                </button>
              </div>
            </div>
          )}

          {/* 로그인 폼 */}
          {authMode === 'signin' && (
            <div className="p-8">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                        errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                      }`}
                      placeholder={currentLanguage === 'ko' ? "비밀번호를 입력하세요" :
                                  currentLanguage === 'en' ? "Enter your password" :
                                  currentLanguage === 'ja' ? "パスワードを入力してください" :
                                  currentLanguage === 'zh' ? "请输入密码" :
                                  "Ingrese su contraseña"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{t('auth.signin')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{t('auth.loginWithGoogle')}</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  {t('auth.noAccount')}{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="text-black font-medium hover:underline transition-all duration-300"
                  >
                    {t('auth.signup')}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* 회원가입 폼 */}
          {authMode === 'signup' && signupStep === 'form' && (
            <div className="p-8">
              <form onSubmit={handleSignupForm} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                    }`}
                    placeholder="이름을 입력하세요"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                        errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                      }`}
                      placeholder="최소 6자리 이상"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                        errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                      }`}
                      placeholder="비밀번호를 다시 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>이메일 인증하기</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google로 회원가입</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  이미 계정이 있으신가요?{' '}
                  <button
                    onClick={() => setAuthMode('signin')}
                    className="text-black font-medium hover:underline transition-all duration-300"
                  >
                    로그인하기
                  </button>
                </p>
              </div>

              {/* 개인정보 처리방침 동의 */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  회원가입 시{' '}
                  <button className="text-gray-700 hover:underline">개인정보 처리방침</button>
                  {' '}및{' '}
                  <button className="text-gray-700 hover:underline">이용약관</button>
                  에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>256-bit SSL 보안 연결로 보호됩니다</span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}