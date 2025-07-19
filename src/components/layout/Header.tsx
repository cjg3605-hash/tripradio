'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { Volume2, Globe, User, ChevronDown, LogIn, LogOut, Menu, X, Clock } from 'lucide-react';

interface HeaderProps {
  onHistoryOpen?: () => void;
}

export default function Header({ onHistoryOpen }: HeaderProps) {
  // 헤더 관련 상태
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 컨텍스트 & 훅
  const { data: session, status } = useSession();
  const { currentLanguage, currentConfig, setLanguage, t } = useLanguage();
  const router = useRouter();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 언어 변경 처리
  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode as any);
    setIsLanguageMenuOpen(false);
  };

  // 로그아웃 처리
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Enhanced Logo */}
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <Volume2 className="w-6 h-6 text-black transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-20"></div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-xl font-bold text-black hover:text-gray-700 transition-all duration-300 tracking-tight"
          >
            NAVI<span className="text-gray-400">:</span>GUIDE
          </button>
        </div>

        {/* Enhanced Header Right Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Enhanced Language Button */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm text-gray-700 border border-transparent hover:border-gray-200 hover:shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{currentConfig?.name || '한국어'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-40 z-50 backdrop-blur-sm">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm transition-all duration-200 ${
                      currentLanguage === lang.code ? 'bg-gray-50 text-black font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <div className="ml-auto w-2 h-2 bg-black rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced History Button */}
          <button 
            onClick={() => {
              if (onHistoryOpen) {
                onHistoryOpen();
              } else {
                router.push('/mypage');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm text-gray-700 border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            <Clock className="w-4 h-4" />
            <span className="font-medium">{t?.header?.history || '기록'}</span>
          </button>

          {/* Enhanced User Authentication */}
          {status === 'loading' ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-sm"
              >
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-7 h-7 rounded-full ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 backdrop-blur-sm">
                  <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <div className="font-medium text-gray-900 mb-1">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-xs truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/mypage');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>{t?.profile?.mypage || '마이페이지'}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t?.header?.logout || '로그아웃'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>{t?.header?.login || '로그인'}</span>
            </button>
          )}
        </div>

        {/* Enhanced Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200"
        >
          <div className="relative w-5 h-5">
            <span className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2' : 'top-1'}`}></span>
            <span className={`absolute h-0.5 w-5 bg-current top-2 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2' : 'top-3'}`}></span>
          </div>
        </button>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="px-6 py-4 space-y-3">
            {/* 모바일 언어 선택 */}
            <div className="text-sm font-medium text-gray-500 mb-2">
              {t?.header?.language || '언어 선택'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((config) => (
                <button
                  key={config.code}
                  onClick={() => {
                    handleLanguageChange(config.code);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 ${
                    currentLanguage === config.code ? 'bg-gray-50 text-gray-900 ring-1 ring-gray-200' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{config.flag}</span>
                  <span className="font-medium">{config.name}</span>
                </button>
              ))}
            </div>

            {/* 모바일 사용자 메뉴 */}
            <div className="pt-4 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-500 mb-2">계정</div>
              {session?.user ? (
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/mypage');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>{t?.profile?.mypage || '마이페이지'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t?.header?.logout || '로그아웃'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    router.push('/auth/signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-3 bg-black text-white rounded-lg flex items-center justify-center gap-3 transition-all duration-200 hover:bg-gray-800"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="font-medium">{t?.header?.login || '로그인'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}