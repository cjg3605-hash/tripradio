'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'next-i18next';

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
  const { t } = useTranslation('common');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) {
        setErrors({ general: '구글 로그인에 실패했습니다. 다시 시도해주세요.' });
      } else {
        // 구글 OAuth는 리다이렉트로 처리됨
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
        // Supabase 회원가입
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });
        if (error) {
          setErrors({ general: error.message || '회원가입에 실패했습니다.' });
        } else {
          setErrors({ success: '회원가입이 완료되었습니다! 이메일을 확인해 주세요.' });
          setAuthMode('signin');
        }
      } else {
        // Supabase 로그인
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) {
          setErrors({ general: error.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' });
        } else {
          // 로그인 성공 시 홈으로 이동
          router.push(callbackUrl);
        }
      }
    } catch (error) {
      setErrors({ general: '인증 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
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
            {authMode === 'signup' ? t('signup') : t('login')}
          </h2>
          <p className="text-gray-600">
            {t('login_subtitle')}
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
              {t('login')}
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
              {t('signup')}
            </button>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-gray-700 font-medium">
              {t('google_login', { mode: t(authMode) })}
            </span>
          </button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('or')}</span>
            </div>
          </div>

          {/* 이메일 인증 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('name_placeholder')}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('email_placeholder')}
                required
                autoComplete="username"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('password_placeholder')}
                required
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirm_password')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('confirm_password_placeholder')}
                  required
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('processing')}
                </div>
              ) : (
                <>
                  {authMode === 'signup' ? t('signup') : t('login')}
                </>
              )}
            </button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t('login_features')}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('feature_personal_guide')}
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('feature_history')}
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('feature_recommend')}
              </li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t('terms_agree', { terms: <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">{t('terms_of_service')}</Link>, privacy: <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">{t('privacy_policy')}</Link> })}
            </p>
          </div>
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            ← {t('home')}
          </Link>
        </div>
      </div>
    </div>
  );
} 